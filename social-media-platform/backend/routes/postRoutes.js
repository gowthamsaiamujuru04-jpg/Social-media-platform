const express = require("express");
const Post = require("../models/Post");
const User = require("../models/User");

const router = express.Router();

// Create post
router.post("/", async (req, res) => {
  try {
    const { user, content, image } = req.body;

    if (!user || !content) {
      return res.status(400).json({
        message: "User and content are required",
      });
    }

    const post = new Post({
      user,
      content,
      image,
    });

    await post.save();

    res.status(201).json({
      message: "Post created successfully",
      post,
    });
  } catch (error) {
    console.log("CREATE POST ERROR:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
});

// Get all posts
router.get("/", async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("user", "name email")
      .populate({
        path: "sharedFrom",
        populate: {
          path: "user",
          select: "name",
        },
      })
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (error) {
    console.log("GET POSTS ERROR:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
});

// Get follower feed
router.get("/feed/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const feedUsers = [
      user._id,
      ...user.following,
    ];

    const posts = await Post.find({
      user: { $in: feedUsers },
    })
      .populate("user", "name email")
      .populate({
        path: "sharedFrom",
        populate: {
          path: "user",
          select: "name",
        },
      })
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (error) {
    console.log("FEED ERROR:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
});

// Share post
router.post("/:id/share", async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        message: "User ID is required",
      });
    }

    const originalPost = await Post.findById(req.params.id);

    if (!originalPost) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    const sharedPost = new Post({
      user: userId,
      content: originalPost.content,
      image: originalPost.image,
      sharedFrom: originalPost._id,
    });

    await sharedPost.save();

    const result = await Post.findById(sharedPost._id)
      .populate("user", "name email")
      .populate({
        path: "sharedFrom",
        populate: {
          path: "user",
          select: "name",
        },
      });

    res.status(201).json({
      message: "Post shared successfully",
      post: result,
    });
  } catch (error) {
    console.log("SHARE ERROR:", error);

    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
});

// Like / Unlike post
router.put("/:id/like", async (req, res) => {
  try {
    const { userId } = req.body;

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    const alreadyLiked = post.likes.some(
      (id) => id.toString() === userId
    );

    if (alreadyLiked) {
      post.likes = post.likes.filter(
        (id) => id.toString() !== userId
      );
    } else {
      post.likes.push(userId);
    }

    await post.save();

    res.json({
      message: alreadyLiked
        ? "Post unliked"
        : "Post liked",
      likes: post.likes.length,
    });
  } catch (error) {
    console.log("LIKE ERROR:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
});

// Add comment
router.put("/:id/comment", async (req, res) => {
  try {
    const { userId, text } = req.body;

    if (!userId || !text) {
      return res.status(400).json({
        message: "User and comment are required",
      });
    }

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    post.comments.push({
      user: userId,
      text,
    });

    await post.save();

    res.json({
      message: "Comment added successfully",
      post,
    });
  } catch (error) {
    console.log("COMMENT ERROR:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
});

// Edit post
router.put("/:id", async (req, res) => {
  try {
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({
        message: "Post content is required",
      });
    }

    const post = await Post.findByIdAndUpdate(
      req.params.id,
      {
        content: content.trim(),
      },
      {
        new: true,
      }
    );

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    res.json({
      message: "Post updated successfully",
      post,
    });
  } catch (error) {
    console.log("EDIT POST ERROR:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
});

// Delete post
router.delete("/:id", async (req, res) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.id);

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    res.json({
      message: "Post deleted successfully",
    });
  } catch (error) {
    console.log("DELETE POST ERROR:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
});

module.exports = router;