import express from "express";
import {
  recordAttendance,
  getAttendance,
  getAttendanceStats,
  startFaceRecognition,
  processFaceRecognition
} from "../controllers/attendance.controller.js";
import multer from 'multer';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads/faces');
  },
  filename: (req, file, cb) => {
    cb(null, `face-${Date.now()}.jpg`);
  }
});

const upload = multer({ storage });

// Routes for attendance
router.post("/api/attendance", recordAttendance);
router.get("/api/attendance", getAttendance);
router.get("/api/attendance/stats", getAttendanceStats);
router.post("/api/attendance/start-recognition", startFaceRecognition);
router.post("/api/face-recognition", upload.single('image'), processFaceRecognition);

export default router; 