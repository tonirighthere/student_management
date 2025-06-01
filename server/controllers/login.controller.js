import { Users, Student } from "../models/db.js";
import argon2 from "argon2";
import jwt from "jsonwebtoken";

// @Router: /login
// @desc: user login
// @access: public
export const login = async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  try {
    const user = await Users.findOne({ username: username });
    const student = await Student.findOne({ msv: username });
    
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Tên đăng nhập hoặc mật khẩu không đúng!",
      });
    }

    // const verifiedPassword = await argon2.verify(user.password, password);

    if (user.password !== password) {
      return res.status(400).json({
        success: false,
        message: "Tên đăng nhập hoặc mật khẩu không đúng!",
      });
    } else {
      const accessToken = jwt.sign(
        { userId: user.id },
        process.env.ACCESS_TOKEN_SECRET
      );


      if (user.role === "student") {
        res.json({
          success: true,
          message: "Student logged in successfully",
          userId: student.id,
          username,
          role: user.role,
          lop: user.lop,
          accessToken,
        });
      } else {
        res.json({
          success: true,
          message: "Manager logged in successfully",
          role: user.role,
          username,
          lop: user.lop,
          accessToken,
        });
      }
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// @Router: POST /create-student-account
// @desc: Teacher create new account for student
// @access: Only teacher can do
export const createStudentAccount = async (req, res) => {
  const { username, password, lop } = req.body;
  
  console.log("Creating student account:", { username, lop });

  try {
    // Kiểm tra dữ liệu đầu vào
    if (!username || !password || !lop) {
      return res.status(400).json({ 
        success: false, 
        message: "Thiếu thông tin bắt buộc" 
      });
    }
    
    // Kiểm tra tài khoản đã tồn tại chưa
    const user = await Users.findOne({ username });

    if (user) {
      console.log("Username already exists:", username);
      return res
        .status(400)
        .json({ success: false, message: "Tên đăng nhập đã tồn tại" });
    }

    // Mã hóa mật khẩu
    const hashedPassword = await argon2.hash(password);
    const newUser = {
      username,
      password: hashedPassword,
      role: "student",
      lop: lop,
    };
    
    console.log("Saving new user account");
    const savedUser = await Users.save(newUser);

    if (!savedUser) {
      return res.status(500).json({ 
        success: false, 
        message: "Không thể tạo tài khoản" 
      });
    }
    
    console.log("Student account created successfully:", savedUser);

    // Tạo token
    const accessToken = jwt.sign(
      { userId: savedUser.id },
      process.env.ACCESS_TOKEN_SECRET || 'secret_key'
    );

    res.json({
      success: true,
      message: "Tạo tài khoản thành công",
      accessToken,
    });
  } catch (error) {
    console.log("Error in createStudentAccount:", error);
    
    // Kiểm tra lỗi cụ thể
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ 
        success: false, 
        message: "Tên đăng nhập đã tồn tại" 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: "Lỗi máy chủ khi tạo tài khoản",
      error: error.message
    });
  }
};

export const deleteStudentAccount = async (req, res) => {
  try {
    console.log("Deleting student account with MSV:", req.params.msv);
    
    if (!req.params.msv) {
      return res.status(400).json({ 
        success: false, 
        message: "MSV sinh viên không được cung cấp" 
      });
    }
    
    // Xóa tài khoản trực tiếp
    const deletedAccount = await Users.findOneAndDelete({ username: req.params.msv });
    
    if (deletedAccount) {
      console.log("Student account deleted successfully:", req.params.msv);
      res.json({ 
        success: true, 
        message: "Xóa tài khoản thành công"
      });
    } else {
      console.log("Student account not found with MSV:", req.params.msv);
      res.status(404).json({ 
        success: false, 
        message: "Không tìm thấy tài khoản sinh viên để xóa" 
      });
    }
  } catch (error) {
    console.log("Error in deleteStudentAccount:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error ~ deleteStudentAccount",
      error: error.message 
    });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { username, old_pass, new_pass } = req.body;
    const user = await Users.findOne({
      username: username,
    });
    
    const verifiedPassword = await argon2.verify(user.password, old_pass);
    console.log(verifiedPassword);
    
    if (!verifiedPassword) {
      return res.json({ message: "Mật khẩu cũ không đúng" });
    } else {
      const newHashedPassword = await argon2.hash(new_pass.toString());
      const UpdatedPassword = await Users.findOneAndUpdate(
        { username: username },
        { password: newHashedPassword }
      );
      
      if (UpdatedPassword) {
        res.json({ message: "Thay đổi mật khẩu thành công" });
      } else {
        res.json({ message: "Thay đổi mật khẩu thất bại" });
      }
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error ~ changePassword" });
  }
};