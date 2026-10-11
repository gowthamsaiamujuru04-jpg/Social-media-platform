const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Notification = require("../models/Notification");

const router = express.Router();

// ==================== REGISTER ====================

router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Please fill all fields",
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hashedPassword,
    });

    await user.save();

    res.status(201).json({
      message: "User registered successfully",
    });
  } catch (error) {
    console.log("REGISTER ERROR:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
});

// ==================== LOGIN ====================

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "Invalid email or password",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign(
      {
        userId: user._id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.log("LOGIN ERROR:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
});

// ==================== GET PROFILE ====================

router.get("/profile/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.json(user);
  } catch (error) {
    console.log("GET PROFILE ERROR:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
});

// ==================== UPDATE PROFILE ====================

router.put("/profile/:id", async (req, res) => {
  try {
    const { name, bio } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        name,
        bio,
      },
      {
        new: true,
      }
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.json({
      message: "Profile updated successfully",
      user,
    });
  } catch (error) {
    console.log("UPDATE PROFILE ERROR:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
});

// ==================== FOLLOW / UNFOLLOW ====================

router.put("/follow/:id", async (req, res) => {
  try {
    const { userId } = req.body;
    const targetUserId = req.params.id;

    console.log("=================================");
    console.log("FOLLOW REQUEST");
    console.log("Current User:", userId);
    console.log("Target User:", targetUserId);

    if (!userId || userId === targetUserId) {
      return res.status(400).json({
        message: "Invalid user",
      });
    }

    const user = await User.findById(userId);
    const targetUser = await User.findById(targetUserId);

    if (!user || !targetUser) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const alreadyFollowing = user.following.some(
      (id) => id.toString() === targetUserId
    );

    // ==================== UNFOLLOW ====================

    if (alreadyFollowing) {
      user.following = user.following.filter(
        (id) => id.toString() !== targetUserId
      );

      targetUser.followers = targetUser.followers.filter(
        (id) => id.toString() !== userId
      );

      await user.save();
      await targetUser.save();

      console.log("UNFOLLOW SUCCESS");
      console.log("=================================");

      return res.json({
        message: "Unfollowed",
        following: user.following.length,
        followers: targetUser.followers.length,
      });
    }

    // ==================== FOLLOW ====================

    user.following.push(targetUser._id);
    targetUser.followers.push(user._id);

    await user.save();
    await targetUser.save();

    console.log("FOLLOW SUCCESS");
    console.log("Creating notification...");

    // ==================== CREATE NOTIFICATION ====================

    const notification = new Notification({
      user: targetUser._id,
      sender: user._id,
      type: "follow",
      message: `${user.name} started following you`,
      read: false,
    });

    console.log("Notification object:", notification);

    await notification.save();

    console.log("NOTIFICATION SAVED");
    console.log("Notification ID:", notification._id);
    console.log("Notification receiver:", notification.user);
    console.log("Notification sender:", notification.sender);
    console.log("=================================");

    return res.json({
      message: "Following",
      following: user.following.length,
      followers: targetUser.followers.length,
    });
  } catch (error) {
    console.log("=================================");
    console.log("FOLLOW ERROR:");
    console.log(error);
    console.log("=================================");

    return res.status(500).json({
      message: "Server error",
    });
  }
});

// ==================== GET NOTIFICATIONS ====================

router.get("/notifications/:userId", async (req, res) => {
  try {
    console.log("GET NOTIFICATIONS");
    console.log("User ID:", req.params.userId);

    const notifications = await Notification.find({
      user: req.params.userId,
    })
      .populate("sender", "name")
      .sort({
        createdAt: -1,
      });

    console.log("Notifications found:", notifications.length);

    res.json(notifications);
  } catch (error) {
    console.log("GET NOTIFICATIONS ERROR:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
});

// ==================== GET UNREAD COUNT ====================

router.get(
  "/notifications/:userId/unread-count",
  async (req, res) => {
    try {
      const count = await Notification.countDocuments({
        user: req.params.userId,
        read: false,
      });

      res.json({
        count,
      });
    } catch (error) {
      console.log("UNREAD COUNT ERROR:", error);

      res.status(500).json({
        message: "Server error",
      });
    }
  }
);

// ==================== MARK NOTIFICATIONS AS READ ====================

router.put(
  "/notifications/:userId/read",
  async (req, res) => {
    try {
      await Notification.updateMany(
        {
          user: req.params.userId,
          read: false,
        },
        {
          $set: {
            read: true,
          },
        }
      );

      res.json({
        message: "Notifications marked as read",
      });
    } catch (error) {
      console.log("MARK READ ERROR:", error);

      res.status(500).json({
        message: "Server error",
      });
    }
  }
);

// ==================== DELETE NOTIFICATION ====================

router.delete(
  "/notifications/:notificationId",
  async (req, res) => {
    try {
      const notification =
        await Notification.findByIdAndDelete(
          req.params.notificationId
        );

      if (!notification) {
        return res.status(404).json({
          message: "Notification not found",
        });
      }

      res.json({
        message: "Notification deleted successfully",
      });
    } catch (error) {
      console.log("DELETE NOTIFICATION ERROR:", error);

      res.status(500).json({
        message: "Server error",
      });
    }
  }
);

// ==================== GET ALL USERS ====================

router.get("/users", async (req, res) => {
  try {
    const users = await User.find().select("-password");

    res.json(users);
  } catch (error) {
    console.log("GET USERS ERROR:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
});

module.exports = router;