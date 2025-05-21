import express from "express";
import cors from "cors";
import mysql from "mysql2/promise";
import loginRoute from "./routes/login.js";
import dotenv from "dotenv";
import Students from "./routes/student.js";
import Posts from "./routes/post.js";

dotenv.config();
const PORT = process.env.PORT || 5000;

// Creating a connection pool instead of a single connection
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: 'student_management',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Make the pool available globally
global.db = pool;

const app = express();
app.use(cors());
app.use(express.json({ extended: true }));
app.use(express.urlencoded({ extended: true }));

// Test database connection
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log("Database connected successfully");
    connection.release();
  } catch (error) {
    console.error("Database connection error:", error);
  }
};

testConnection();

app.use("/", loginRoute);
app.use("/", Students);
app.use("/", Posts);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));