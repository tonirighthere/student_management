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

    const isExist = await Student.findOne({ msv });
    if (isExist) {
      return res
        .status(400)
        .json({ success: false, message: "Student already exist!" });
    }

    const newStudent = {
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
    };
    
    await Student.save(newStudent);
    res.json({ success: true, message: "Create successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error ~ createStudent" });
  }
};

export const deleteStudent = async (req, res) => {
  try {
    const deletedStudent = await Student.findOneAndDelete({
      _id: req.params.id,
    });
    
    if (deletedStudent) {
      res.json({ success: true, message: "Deleted successfully!" });
    } else {
      res.status(404).json({ success: false, message: "Deleted fail!" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error ~ deleteStudent" });
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
    const studentDetail = await Student.find({ _id: req.params.id });
    res.json({ StudentDetail: studentDetail });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ success: false, message: "Server error ~ getStudentDetail" });
  }
};