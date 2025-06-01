import { Attendance, Student } from "../models/db.js";
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';
import fetch from 'node-fetch';
import FormData from 'form-data';

const execPromise = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// @route POST /api/attendance
// @desc Record attendance from face recognition
export const recordAttendance = async (req, res) => {
  try {
    const { msv, lop } = req.body;

    // Validate student exists
    const student = await Student.findOne({ msv });
    if (!student) {
      return res.status(404).json({ 
        success: false, 
        message: "Không tìm thấy sinh viên với mã sinh viên này" 
      });
    }

    // Save attendance record
    const attendanceData = {
      msv,
      lop,
      time: new Date(),
      status: 'present'
    };
    
    await Attendance.save(attendanceData);
    
    res.json({ 
      success: true, 
      message: "Điểm danh thành công",
      student: {
        msv,
        name: student.name
      }
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ 
      success: false, 
      message: "Lỗi server khi điểm danh" 
    });
  }
};

// @route GET /api/attendance
// @desc Get attendance records by date, msv, or class
export const getAttendance = async (req, res) => {
  try {
    const filter = {};
    
    if (req.query.date) {
      filter.date = req.query.date;
    }
    if (req.query.msv) {
      filter.msv = req.query.msv;
    }
    if (req.query.lop) {
      filter.lop = req.query.lop;
    }

    const records = await Attendance.find(filter);
    res.json({ success: true, records });
  } catch (error) {
    console.log(error);
    res.status(500).json({ 
      success: false, 
      message: "Lỗi server khi lấy dữ liệu điểm danh" 
    });
  }
};

// @route GET /api/attendance/stats
// @desc Get attendance statistics by class and date range
export const getAttendanceStats = async (req, res) => {
  try {
    const { lop, fromDate, toDate } = req.query;
    
    if (!lop || !fromDate || !toDate) {
      return res.status(400).json({ 
        success: false, 
        message: "Thiếu thông tin lớp hoặc khoảng thời gian" 
      });
    }

    const stats = await Attendance.getAttendanceStats(lop, fromDate, toDate);
    res.json({ success: true, stats });
  } catch (error) {
    console.log(error);
    res.status(500).json({ 
      success: false, 
      message: "Lỗi server khi lấy thống kê điểm danh" 
    });
  }
};

// @route POST /api/attendance/start-recognition
// @desc Start face recognition process for attendance
export const startFaceRecognition = async (req, res) => {
  try {
    const { lop } = req.body;
    
    if (!lop) {
      return res.status(400).json({ 
        success: false, 
        message: "Thiếu thông tin lớp" 
      });
    }

    // Path to Python script
    const scriptPath = path.resolve(__dirname, '../../face_recognition/attendance_recognition.py');
    
    // Launch Python process
    const pythonProcess = spawn('python', [scriptPath, lop]);
    
    // Send acknowledgement that process has started
    res.json({ 
      success: true, 
      message: "Đã khởi động quá trình nhận diện khuôn mặt" 
    });
    
    // Log output from Python process for debugging
    pythonProcess.stdout.on('data', (data) => {
      console.log(`Python output: ${data}`);
    });
    
    pythonProcess.stderr.on('data', (data) => {
      console.error(`Python error: ${data}`);
    });
    
    pythonProcess.on('close', (code) => {
      console.log(`Python process exited with code ${code}`);
    });
    
  } catch (error) {
    console.log(error);
    res.status(500).json({ 
      success: false, 
      message: "Lỗi server khi khởi động nhận diện khuôn mặt" 
    });
  }
};

// @route POST /api/face-recognition
// @desc Process a single image frame for face recognition
export const processFaceRecognition = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Không nhận được hình ảnh"
      });
    }

    const { lop } = req.body;
    if (!lop) {
      return res.status(400).json({
        success: false,
        message: "Thiếu thông tin lớp"
      });
    }

    // Đường dẫn tới ảnh đã upload
    const imagePath = req.file.path;
    console.log('[Node.js Controller] Image path received:', imagePath);
    if (fs.existsSync(imagePath)) {
      console.log('[Node.js Controller] Image file found at path:', imagePath);
    } else {
      console.error('[Node.js Controller] Error: Image file NOT found at path:', imagePath);
      return res.status(500).json({ 
        success: false, 
        message: "Internal server error: Uploaded image file not found on server." 
      });
    }
    
    // Tạo form-data để gửi đến Python API
    const formData = new FormData();
    formData.append('image', fs.createReadStream(imagePath));
    
    try {
      // Gọi API Python chạy ở Pycharm (port 5001)
      const response = await fetch('http://localhost:5001/api/recognize', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const result = await response.json();
      
      // Xóa file ảnh tạm
      fs.unlink(imagePath, (err) => {
        if (err) console.error(`Error deleting file: ${err}`);
      });
      
      if (!result.recognized) {
        return res.json({
          success: false,
          message: "Không nhận dạng được khuôn mặt"
        });
      }
      
      // Nếu nhận dạng thành công, thực hiện điểm danh
      const student = await Student.findOne({ msv: result.msv });
      if (!student) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy sinh viên với mã sinh viên này"
        });
      }

      // Kiểm tra xem sinh viên đã điểm danh cho lớp này trong vòng 24 giờ qua chưa
      const twentyFourHoursAgo = new Date(new Date().getTime() - (24 * 60 * 60 * 1000));
      const recentAttendance = await Attendance.findOne({
        msv: result.msv,
        lop: lop,
        time: { $gte: twentyFourHoursAgo } // Giả sử có thể dùng $gte tương tự MongoDB, cần điều chỉnh cho MySQL
      });

      if (recentAttendance) {
        console.log(`[Node.js Controller] Student ${result.msv} already attended class ${lop} within the last 24 hours.`);
        // Không ghi điểm danh mới, có thể trả về thông báo hoặc chỉ không làm gì
        // Để đơn giản, chúng ta sẽ không gửi lại thông báo thành công cho lần điểm danh lặp lại này
        // Frontend sẽ không nhận được toast "Điểm danh thành công" cho lần này
        // Hoặc có thể trả về một response riêng để frontend xử lý (ví dụ: đã điểm danh)
        return res.json({
          success: true, // Vẫn là true để không báo lỗi ở client, nhưng thêm cờ báo đã điểm danh
          recognized: true, // Giữ nguyên từ Flask
          already_attended: true,
          message: "Sinh viên đã điểm danh trong 24 giờ qua.",
          student: {
            msv: result.msv,
            name: student.name
          }
        });
      }
      
      // Lưu thông tin điểm danh
      const attendanceData = {
        msv: result.msv,
        lop,
        time: new Date(),
        status: 'present'
      };
      
      await Attendance.save(attendanceData);
      
      res.json({
        success: true,
        message: "Điểm danh thành công",
        student: {
          msv: result.msv,
          name: student.name
        }
      });
    } catch (error) {
      console.error('Error calling face recognition API:', error);
      
      // Nếu API không hoạt động, thử sử dụng Python script trực tiếp
      console.log('Falling back to direct Python script execution...');
      
      // Path to Python script for single frame processing
      const scriptPath = path.resolve(__dirname, '../../face_recognition/face_recognition.py');
      
      // Run the Python script to process the image
      const { stdout, stderr } = await execPromise(`python "${scriptPath}" "${imagePath}" "${lop}"`);
      
      if (stderr) {
        console.error(`Python error: ${stderr}`);
      }
      
      // Parse the Python script output
      let result;
      try {
        result = JSON.parse(stdout);
      } catch (e) {
        console.error('Could not parse Python output:', stdout);
        result = { recognized: false };
      }
      
      // Xóa file ảnh tạm
      fs.unlink(imagePath, (err) => {
        if (err) console.error(`Error deleting file: ${err}`);
      });
      
      if (!result.recognized) {
        return res.json({
          success: false,
          message: "Không nhận dạng được khuôn mặt"
        });
      }
      
      // Nếu nhận dạng thành công, thực hiện điểm danh
      const student = await Student.findOne({ msv: result.msv });
      if (!student) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy sinh viên với mã sinh viên này"
        });
      }

      // Kiểm tra xem sinh viên đã điểm danh cho lớp này trong vòng 24 giờ qua chưa
      const twentyFourHoursAgo = new Date(new Date().getTime() - (24 * 60 * 60 * 1000));
      const recentAttendance = await Attendance.findOne({
        msv: result.msv,
        lop: lop,
        time: { $gte: twentyFourHoursAgo } // Giả sử có thể dùng $gte tương tự MongoDB, cần điều chỉnh cho MySQL
      });

      if (recentAttendance) {
        console.log(`[Node.js Controller] Student ${result.msv} already attended class ${lop} within the last 24 hours.`);
        // Không ghi điểm danh mới, có thể trả về thông báo hoặc chỉ không làm gì
        // Để đơn giản, chúng ta sẽ không gửi lại thông báo thành công cho lần điểm danh lặp lại này
        // Frontend sẽ không nhận được toast "Điểm danh thành công" cho lần này
        // Hoặc có thể trả về một response riêng để frontend xử lý (ví dụ: đã điểm danh)
        return res.json({
          success: true, // Vẫn là true để không báo lỗi ở client, nhưng thêm cờ báo đã điểm danh
          recognized: true, // Giữ nguyên từ Flask
          already_attended: true,
          message: "Sinh viên đã điểm danh trong 24 giờ qua.",
          student: {
            msv: result.msv,
            name: student.name
          }
        });
      }
      
      // Lưu thông tin điểm danh
      const attendanceData = {
        msv: result.msv,
        lop,
        time: new Date(),
        status: 'present'
      };
      
      await Attendance.save(attendanceData);
      
      res.json({
        success: true,
        message: "Điểm danh thành công",
        student: {
          msv: result.msv,
          name: student.name
        }
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi xử lý nhận diện khuôn mặt"
    });
  }
}; 