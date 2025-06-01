import { Posts } from "../models/db.js";

export const getPost = async (req, res) => {
  try {
    const getpost = await Posts.find({ lop: req.params.item });
    
    // Filter out lop field from each post if needed
    const postsWithoutLop = getpost.map(post => {
      const { lop, ...rest } = post;
      return rest;
    });
    
    if (getpost) {
      res.json({ getpost: postsWithoutLop });
    } else {
      res.json({ message: "getpost error" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error ~ getPost" });
  }
};

export const createPost = async (req, res) => {
  try {
    const { id, content, lop } = req.body;

    const newPost = {
      id,
      content,
      lop,
    };
    
    await Posts.save(newPost);
    res.json({ message: "Create post successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error ~ createPost" });
  }
};

export const updatePost = async (req, res) => {
  try {
    const { content } = req.body;
    const updatedPost = await Posts.findOneAndUpdate(
      { id: req.params.id },
      { content }
    );
    
    if (updatedPost) {
      res.json({ message: "Update successfully" });
    } else {
      res.json({ message: "Update fail" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error ~ updatePost" });
  }
};

export const deletePost = async (req, res) => {
  try {
    const deletedPost = await Posts.findOneAndDelete({ id: req.params.id });
    
    if (deletedPost) {
      res.json({ message: "Delete successfully" });
    } else {
      res.json({ message: "Delete fail" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error ~ deletePost" });
  }
};

export const commentPost = async (req, res) => {
  try {
    const { msv, cmt } = req.body;
    const postId = req.params.id;
    
    // Add comment to the post in the comments table
    const sql = 'INSERT INTO comments (post_id, msv, cmt) VALUES (?, ?, ?)';
    const [result] = await global.db.execute(sql, [postId, msv, cmt]);
    
    if (result.affectedRows > 0) {
      res.json({ message: "Comment successfully" });
    } else {
      res.json({ message: "Comment fail" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error ~ commentPost" });
  }
};