// db.js - Database utility functions for each model
// This file replaces the MongoDB models with MySQL equivalent functionality

// User model functions
export const Users = {
    findOne: async (filter) => {
      let sql = 'SELECT * FROM users WHERE ';
      const params = [];
      
      if (filter.username) {
        sql += 'username = ?';
        params.push(filter.username);
      } else if (filter._id) {
        sql += 'id = ?';
        params.push(filter._id);
      }
      
      sql += ' LIMIT 1';
      
      const [rows] = await global.db.execute(sql, params);
      return rows[0];
    },
    
    findOneAndDelete: async (filter) => {
      let sql = 'DELETE FROM users WHERE ';
      const params = [];
      
      if (filter.username) {
        sql += 'username = ?';
        params.push(filter.username);
      } else if (filter._id) {
        sql += 'id = ?';
        params.push(filter._id);
      }
      
      const [result] = await global.db.execute(sql, params);
      return result.affectedRows > 0 ? { deleted: true } : null;
    },
    
    findOneAndUpdate: async (filter, update) => {
      let sql = 'UPDATE users SET ';
      const updateParams = [];
      const whereParams = [];
      
      // Build SET clause
      const setFields = [];
      if (update.password) {
        setFields.push('password = ?');
        updateParams.push(update.password);
      }
      
      sql += setFields.join(', ');
      
      // Build WHERE clause
      if (filter.username) {
        sql += ' WHERE username = ?';
        whereParams.push(filter.username);
      } else if (filter._id) {
        sql += ' WHERE id = ?';
        whereParams.push(filter._id);
      }
      
      const params = [...updateParams, ...whereParams];
      const [result] = await global.db.execute(sql, params);
      
      if (result.affectedRows > 0) {
        return { updated: true };
      }
      return null;
    },
    
    save: async (userData) => {
      // For new user creation
      const sql = 'INSERT INTO users (username, password, role, lop) VALUES (?, ?, ?, ?)';
      const params = [
        userData.username, 
        userData.password, 
        userData.role || 'student', 
        userData.lop
      ];
      
      const [result] = await global.db.execute(sql, params);
      return { _id: result.insertId, ...userData };
    },
    
    insertMany: async (usersData) => {
      // For batch insertion
      const sql = 'INSERT INTO users (username, password, role, lop) VALUES ?';
      const values = usersData.map(user => [
        user.username,
        user.password,
        user.role || 'student',
        user.lop
      ]);
      
      const [result] = await global.db.query(sql, [values]);
      return result.affectedRows > 0;
    }
  };
  
  // Student model functions
  export const Student = {
    find: async (filter) => {
      let sql = 'SELECT * FROM students WHERE ';
      const params = [];
      
      if (filter.lop) {
        sql += 'lop = ?';
        params.push(filter.lop);
      } else if (filter._id) {
        sql += 'id = ?';
        params.push(filter._id);
      } else if (filter.msv) {
        sql += 'msv = ?';
        params.push(filter.msv);
      } else {
        sql = 'SELECT * FROM students';
      }
      
      const [rows] = await global.db.execute(sql, params);
      return rows;
    },
    
    findOne: async (filter) => {
      let sql = 'SELECT * FROM students WHERE ';
      const params = [];
      
      if (filter.msv) {
        sql += 'msv = ?';
        params.push(filter.msv);
      } else if (filter._id) {
        sql += 'id = ?';
        params.push(filter._id);
      }
      
      sql += ' LIMIT 1';
      
      const [rows] = await global.db.execute(sql, params);
      return rows[0];
    },
    
    findByIdAndUpdate: async (filter, update) => {
      let sql = 'UPDATE students SET ';
      const updateParams = [];
      const whereParams = [];
      
      // Build SET clause
      const setFields = [];
      if (update.name) {
        setFields.push('name = ?');
        updateParams.push(update.name);
      }
      if (update.birthday) {
        setFields.push('birthday = ?');
        updateParams.push(update.birthday);
      }
      if (update.gender) {
        setFields.push('gender = ?');
        updateParams.push(update.gender);
      }
      if (update.phone) {
        setFields.push('phone = ?');
        updateParams.push(update.phone);
      }
      if (update.address) {
        setFields.push('address = ?');
        updateParams.push(update.address);
      }
      if (update.sum_of_credits) {
        setFields.push('sum_of_credits = ?');
        updateParams.push(update.sum_of_credits);
      }
      if (update.gpa) {
        setFields.push('gpa = ?');
        updateParams.push(update.gpa);
      }
      if (update.status) {
        setFields.push('status = ?');
        updateParams.push(update.status);
      }
      
      sql += setFields.join(', ');
      
      // Build WHERE clause
      if (filter._id) {
        sql += ' WHERE id = ?';
        whereParams.push(filter._id);
      }
      
      const params = [...updateParams, ...whereParams];
      const [result] = await global.db.execute(sql, params);
      
      if (result.affectedRows > 0) {
        return { updated: true };
      }
      return null;
    },
    
    findOneAndDelete: async (filter) => {
      let sql = 'DELETE FROM students WHERE ';
      const params = [];
      
      if (filter._id) {
        sql += 'id = ?';
        params.push(filter._id);
      } else if (filter.msv) {
        sql += 'msv = ?';
        params.push(filter.msv);
      }
      
      const [result] = await global.db.execute(sql, params);
      return result.affectedRows > 0 ? { deleted: true } : null;
    },
    
    save: async (studentData) => {
      // For new student creation
      const sql = 'INSERT INTO students (msv, name, birthday, gender, phone, address, sum_of_credits, gpa, status, lop) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
      const params = [
        studentData.msv,
        studentData.name,
        studentData.birthday,
        studentData.gender,
        studentData.phone,
        studentData.address,
        studentData.sum_of_credits,
        studentData.gpa,
        studentData.status || 'Không',
        studentData.lop
      ];
      
      const [result] = await global.db.execute(sql, params);
      return { _id: result.insertId, ...studentData };
    },
    
    insertMany: async (studentsData) => {
      // For batch insertion
      const sql = 'INSERT INTO students (msv, name, birthday, gender, phone, address, sum_of_credits, gpa, status, lop) VALUES ?';
      const values = studentsData.map(student => [
        student.msv,
        student.name,
        student.birthday,
        student.gender,
        student.phone,
        student.address,
        student.sum_of_credits,
        student.gpa,
        student.status || 'Không',
        student.lop
      ]);
      
      const [result] = await global.db.query(sql, [values]);
      return result.affectedRows > 0;
    }
  };
  
  // Post model functions
  export const Posts = {
    find: async (filter) => {
      let sql = 'SELECT p.*, c.msv, c.cmt FROM posts p LEFT JOIN comments c ON p.id = c.post_id WHERE ';
      const params = [];
      
      if (filter.lop) {
        sql += 'p.lop = ?';
        params.push(filter.lop);
      } else if (filter.id) {
        sql += 'p.id = ?';
        params.push(filter.id);
      } else {
        sql = 'SELECT p.*, c.msv, c.cmt FROM posts p LEFT JOIN comments c ON p.id = c.post_id';
      }
      
      const [rows] = await global.db.execute(sql, params);
      
      // Transform the flat result to match MongoDB structure
      const posts = {};
      rows.forEach(row => {
        if (!posts[row.id]) {
          posts[row.id] = {
            id: row.id,
            content: row.content,
            lop: row.lop,
            createdAt: row.created_at,
            comment: []
          };
        }
        
        if (row.msv && row.cmt) {
          posts[row.id].comment.push({
            msv: row.msv,
            cmt: row.cmt
          });
        }
      });
      
      return Object.values(posts);
    },
    
    findOne: async (filter) => {
      let sql = 'SELECT * FROM posts WHERE ';
      const params = [];
      
      if (filter.id) {
        sql += 'id = ?';
        params.push(filter.id);
      }
      
      sql += ' LIMIT 1';
      
      const [rows] = await global.db.execute(sql, params);
      return rows[0];
    },
    
    findOneAndUpdate: async (filter, update) => {
      let sql = 'UPDATE posts SET ';
      const updateParams = [];
      const whereParams = [];
      
      // Build SET clause
      const setFields = [];
      if (update.content) {
        setFields.push('content = ?');
        updateParams.push(update.content);
      }
      
      sql += setFields.join(', ');
      
      // Build WHERE clause
      if (filter.id) {
        sql += ' WHERE id = ?';
        whereParams.push(filter.id);
      }
      
      const params = [...updateParams, ...whereParams];
      const [result] = await global.db.execute(sql, params);
      
      if (result.affectedRows > 0) {
        return { updated: true };
      }
      return null;
    },
    
    findOneAndDelete: async (filter) => {
      let sql = 'DELETE FROM posts WHERE ';
      const params = [];
      
      if (filter.id) {
        sql += 'id = ?';
        params.push(filter.id);
      }
      
      const [result] = await global.db.execute(sql, params);
      return result.affectedRows > 0 ? { deleted: true } : null;
    },
    
    save: async (postData) => {
      // For new post creation
      const sql = 'INSERT INTO posts (id, content, lop) VALUES (?, ?, ?)';
      const params = [
        postData.id,
        postData.content,
        postData.lop
      ];
      
      const [result] = await global.db.execute(sql, params);
      return { ...postData };
    }
  };

  // Attendance model functions
  export const Attendance = {
    find: async (filter) => {
      let sql = 'SELECT a.*, s.name FROM attendance a JOIN students s ON a.msv = s.msv';
      const params = [];
      const whereClauses = [];

      if (filter.date) {
        whereClauses.push('DATE(a.time) = ?');
        params.push(filter.date);
      }
      if (filter.msv) {
        whereClauses.push('a.msv = ?');
        params.push(filter.msv);
      }
      if (filter.lop) {
        whereClauses.push('a.lop = ?');
        params.push(filter.lop);
      }
      // Handle time condition for findOne logic (e.g., time: { $gte: someDate })
      if (filter.time && filter.time.$gte) {
        whereClauses.push('a.time >= ?');
        params.push(filter.time.$gte);
      }

      if (whereClauses.length > 0) {
        sql += ' WHERE ' + whereClauses.join(' AND ');
      }
      sql += ' ORDER BY a.time DESC'; // Default ordering, can be overridden if needed
      
      const [rows] = await global.db.execute(sql, params);
      return rows; // find will return all matching rows
    },

    findOne: async (filter) => {
      let sql = 'SELECT a.*, s.name FROM attendance a JOIN students s ON a.msv = s.msv';
      const params = [];
      const whereClauses = [];

      if (filter.msv) {
        whereClauses.push('a.msv = ?');
        params.push(filter.msv);
      }
      if (filter.lop) {
        whereClauses.push('a.lop = ?');
        params.push(filter.lop);
      }
      // Handle time condition for findOne logic (e.g., time: { $gte: someDate })
      if (filter.time && filter.time.$gte) {
        // Ensure time is formatted correctly for MySQL if it's a Date object
        const timeValue = filter.time.$gte instanceof Date ? filter.time.$gte.toISOString().slice(0, 19).replace('T', ' ') : filter.time.$gte;
        whereClauses.push('a.time >= ?');
        params.push(timeValue);
      }
      // Add other conditions for findOne if necessary, like specific ID
      if (filter.id) { // Assuming 'id' is the primary key column for attendance table
        whereClauses.push('a.id = ?');
        params.push(filter.id);
      }

      if (whereClauses.length > 0) {
        sql += ' WHERE ' + whereClauses.join(' AND ');
      } else {
        // findOne without specific filters might not be desired, but handle gracefully
        // Or throw an error if specific filters are always required for findOne
        console.warn("Attendance.findOne called without specific filters. This might return an arbitrary record.");
      }
      
      sql += ' ORDER BY a.time DESC LIMIT 1'; // Get the most recent one if multiple match
      
      const [rows] = await global.db.execute(sql, params);
      return rows[0]; // findOne will return the first matching row or undefined
    },
    
    save: async (attendanceData) => {
      const sql = 'INSERT INTO attendance (msv, lop, time, status) VALUES (?, ?, ?, ?)';
      const params = [
        attendanceData.msv,
        attendanceData.lop,
        attendanceData.time || new Date(),
        attendanceData.status || 'present'
      ];
      
      const [result] = await global.db.execute(sql, params);
      return { id: result.insertId, ...attendanceData };
    },
    
    getAttendanceStats: async (lop, fromDate, toDate) => {
      const sql = `
        SELECT 
          s.msv, 
          s.name, 
          COUNT(a.id) as present_count,
          (SELECT COUNT(*) FROM attendance a2 
           WHERE a2.msv = s.msv 
           AND a2.status = 'late'
           AND DATE(a2.time) BETWEEN ? AND ?) as late_count
        FROM students s
        LEFT JOIN attendance a ON s.msv = a.msv AND a.status = 'present' AND DATE(a.time) BETWEEN ? AND ?
        WHERE s.lop = ?
        GROUP BY s.msv, s.name
      `;
      
      const params = [fromDate, toDate, fromDate, toDate, lop];
      const [rows] = await global.db.execute(sql, params);
      return rows;
    }
  };