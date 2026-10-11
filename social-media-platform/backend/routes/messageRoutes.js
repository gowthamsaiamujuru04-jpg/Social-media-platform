const express = require("express");
const Message = require("../models/Message");

const router = express.Router();

router.get("/", (req, res) => {
  res.json({
    message: "Message API is working",
  });
});

router.post("/", async (req, res) => {
  try {
    const { sender, receiver, text } = req.body;

    console.log("MESSAGE REQUEST:", {
      sender,
      receiver,
      text,
    });

    if (!sender || !receiver || !text || !text.trim()) {
      return res.status(400).json({
        message: "Sender, receiver and message are required",
      });
    }

    const message = new Message({
      sender,
      receiver,
      text: text.trim(),
    });

    await message.save();

    const savedMessage = await Message.findById(message._id)
      .populate("sender", "name")
      .populate("receiver", "name");

    res.status(201).json({
      message: "Message sent successfully",
      data: savedMessage,
    });
  } catch (error) {
    console.log("MESSAGE ERROR:", error);

    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
});

router.get("/:userId/:otherUserId", async (req, res) => {
  try {
    const { userId, otherUserId } = req.params;

    const messages = await Message.find({
      $or: [
        {
          sender: userId,
          receiver: otherUserId,
        },
        {
          sender: otherUserId,
          receiver: userId,
        },
      ],
    })
      .populate("sender", "name")
      .populate("receiver", "name")
      .sort({ createdAt: 1 });

    await Message.updateMany(
      {
        sender: otherUserId,
        receiver: userId,
        read: false,
      },
      {
        $set: {
          read: true,
        },
      }
    );

    res.json(messages);
  } catch (error) {
    console.log("GET MESSAGES ERROR:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
});

router.get("/unread/:userId", async (req, res) => {
  try {
    const count = await Message.countDocuments({
      receiver: req.params.userId,
      read: false,
    });

    res.json({
      count,
    });
  } catch (error) {
    console.log("UNREAD ERROR:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
});

module.exports = router;