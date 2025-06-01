import { Student, Users } from "../models/db.js";
import xlsx from "xlsx";
import argon2 from "argon2";
import jwt from "jsonwebtoken";
import axios from "axios";

const headers = {
  "PRIVATE-KEY": "14bf1d3f-a86c-4b1b-ad74-9675722ee4f8",
};

export const getAllStudent = async (req, res) => {
  try {
    const ListStudents = await Student.find({ lop: req.params.lop });
    res.json({ success: true, ListStudents });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ success: false, message: "Server error ~ getAllStudent" });
  }
};

export const updateStudent = async (req, res) => {
  try {
    console.log(req.body);
    const { name, birthday, gender, phone, address } = req.body;
    const updatedStudent = await Student.findByIdAndUpdate(
      { _id: req.params.id },
      { name, birthday, gender, phone, address }
    );
    
    if (updatedStudent) {
      res.json({ message: "Update successfully" });
    } else {
      res.json({ message: "Update fail" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error ~ updateStudent" });
  }
};

export const createStudent = async (req, res) => {
  try {
    console.log("Creating student with data:", req.body);
    
    const {
      msv,
      name,
      birthday,
      gender,
      phone,
      address,
      sum_of_credits,
      gpa,
      status,
      lop,
    } = req.body;
    
    // Kiểm tra dữ liệu đầu vào
    if (!msv || !name || !birthday || !gender || !phone || !lop) {
      return res.status(400).json({ 
        success: false, 
        message: "Thiếu thông tin bắt buộc" 
      });
    }
    
    // Kiểm tra sinh viên đã tồn tại chưa
    const isExist = await Student.findOne({ msv });
    if (isExist) {
      console.log("Student already exists with MSV:", msv);
      return res
        .status(400)
        .json({ success: false, message: "Sinh viên đã tồn tại!" });
    }
    
    // Tạo đối tượng sinh viên mới
    const newStudent = {
      msv,
      name,
      birthday,
      gender,
      phone,
      address: address || "",
      sum_of_credits: sum_of_credits || 0,
      gpa: gpa || 0,
      status: status || "Không",
      lop,
    };
    
    console.log("Saving new student:", newStudent);
    
    // Lưu sinh viên vào database
    const savedStudent = await Student.save(newStudent);
    
    if (savedStudent) {
      console.log("Student created successfully:", savedStudent);
      res.json({ 
        success: true, 
        message: "Thêm sinh viên thành công",
        student: savedStudent
      });
    } else {
      console.log("Failed to create student");
      res.status(500).json({ 
        success: false, 
        message: "Thêm sinh viên thất bại" 
      });
    }
  } catch (error) {
    console.log("Error in createStudent:", error);
    
    // Kiểm tra lỗi cụ thể để trả về thông báo phù hợp
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ 
        success: false, 
        message: "Mã sinh viên đã tồn tại" 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: "Lỗi server khi tạo sinh viên",
      error: error.message
    });
  }
};

export const deleteStudent = async (req, res) => {
  try {
    console.log("Deleting student with ID:", req.params.id);
    
    if (!req.params.id) {
      return res.status(400).json({ 
        success: false, 
        message: "ID sinh viên không được cung cấp" 
      });
    }
    
    // Xóa sinh viên trực tiếp bằng ID
    const deletedStudent = await Student.findOneAndDelete({
      _id: req.params.id,
    });
    
    if (deletedStudent) {
      console.log("Student deleted successfully:", req.params.id);
      res.json({ 
        success: true, 
        message: "Deleted successfully!",
        deletedStudent: deletedStudent
      });
    } else {
      console.log("Student not found with ID:", req.params.id);
      res.status(404).json({ 
        success: false, 
        message: "Không tìm thấy sinh viên để xóa" 
      });
    }
  } catch (error) {
    console.log("Error in deleteStudent:", error);
    
    // Kiểm tra lỗi cụ thể để trả về thông báo phù hợp
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        success: false, 
        message: "ID sinh viên không hợp lệ" 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: "Server error ~ deleteStudent",
      error: error.message
    });
  }
};

export const importFromExcel = async (req, res) => {
  try {
    const wb = xlsx.readFile("./uploads/import.xlsx", { cellDates: true });
    const ws = wb.Sheets["Sheet1"];
    const dataStudent = xlsx.utils.sheet_to_json(ws);
    console.log(dataStudent);
    
    // Create user accounts for each student
    for (let i = 0; i < dataStudent.length; i++) {
      const hashedPassword = await argon2.hash(dataStudent[i].msv.toString());
      
      const newUser = {
        username: dataStudent[i].msv,
        password: hashedPassword,
        role: "student",
        lop: dataStudent[i].lop
      };
      
      const savedUser = await Users.save(newUser);
      
      // Generate token
      jwt.sign(
        { userId: savedUser._id }, 
        process.env.ACCESS_TOKEN_SECRET
      );
      
      // Create chat engine user
      axios.post(
        "https://api.chatengine.io/users/",
        {
          username: dataStudent[i].msv.toString(),
          secret: dataStudent[i].msv.toString(),
        },
        {
          headers: headers,
        }
      );
    }

    // Insert all students into the database
    const isImported = await Student.insertMany(dataStudent);
    
    if (isImported) {
      res.send("Import successfully");
    } else {
      res.send("Import fail");
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error ~ importFromExcel" });
  }
};

export const getStudentDetail = async (req, res) => {
  try {
    console.log("Getting student detail for ID:", req.params.id);
    
    if (!req.params.id) {
      return res.status(400).json({ 
        success: false, 
        message: "ID sinh viên không được cung cấp" 
      });
    }
    
    // Tìm sinh viên theo ID
    const studentDetail = await Student.find({ _id: req.params.id });
    console.log("Found student data:", studentDetail);
    
    if (!studentDetail || studentDetail.length === 0) {
      console.log("No student found with ID:", req.params.id);
      return res.status(404).json({ 
        success: false, 
        message: "Không tìm thấy thông tin sinh viên" 
      });
    }
    
    // Trả về dữ liệu sinh viên
    res.json({ 
      success: true,
      StudentDetail: studentDetail,
      // Thêm dữ liệu trực tiếp để frontend có thể truy cập dễ dàng hơn
      student: studentDetail[0]
    });
  } catch (error) {
    console.log("Error in getStudentDetail:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error ~ getStudentDetail" });
  }
};