const ParentTeacherMessage = require('../models/ParentTeacherMessage');
const User = require('../models/User');
const Group = require('../models/Group');
const Student = require('../models/Student');
const AppError = require('../utils/appError');
const mongoose = require('mongoose');

/**
 * Send a message to a parent or teacher
 * POST /api/v1/chat/send
 */
exports.sendMessage = async (req, res, next) => {
  try {
    const { receiverId, message } = req.body;
    const senderId = req.user._id;

    if (!receiverId || !message) {
      return next(new AppError("Qabul qiluvchi va xabar matnini kiriting", 400));
    }

    const newMessage = await ParentTeacherMessage.create({
      sender: senderId,
      receiver: receiverId,
      message,
    });

    res.status(201).json({
      status: 'success',
      data: { message: newMessage },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get messages between the logged in user and another user
 * GET /api/v1/chat/messages/:userId
 */
exports.getMessages = async (req, res, next) => {
  try {
    const currentUserId = req.user._id;
    const { userId } = req.params; // The other person

    const messages = await ParentTeacherMessage.find({
      $or: [
        { sender: currentUserId, receiver: userId },
        { sender: userId, receiver: currentUserId },
      ],
    }).sort({ createdAt: 1 });

    // Mark messages as read where current user is the receiver
    await ParentTeacherMessage.updateMany(
      { sender: userId, receiver: currentUserId, isRead: false },
      { $set: { isRead: true } }
    );

    res.status(200).json({
      status: 'success',
      data: { messages },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get list of users the logged in user has chatted with, or related to them.
 * For Teachers: all parents of their students + recent chats.
 * GET /api/v1/chat/users
 */
exports.getChatUsers = async (req, res, next) => {
  try {
    const currentUserId = req.user._id;

    // To keep it simple, we will find all distinct senders and receivers where the current user is involved.
    const messages = await ParentTeacherMessage.find({
      $or: [{ sender: currentUserId }, { receiver: currentUserId }],
    }).sort({ createdAt: -1 });

    const userMap = new Map();

    messages.forEach((msg) => {
      const otherUserId = msg.sender.toString() === currentUserId.toString() ? msg.receiver.toString() : msg.sender.toString();
      
      if (!userMap.has(otherUserId)) {
        userMap.set(otherUserId, {
          userId: otherUserId,
          lastMessage: msg.message,
          lastMessageTime: msg.createdAt,
          unreadCount: 0,
        });
      }
      
      if (msg.receiver.toString() === currentUserId.toString() && !msg.isRead) {
        userMap.get(otherUserId).unreadCount += 1;
      }
    });

    // Populate user details
    const userIds = Array.from(userMap.keys());
    const users = await User.find({ _id: { $in: userIds } }).select('firstname lastname phone avatar role');

    // For each parent user, find their children (students) by matching parentPhone
    const parentPhones = users
      .filter((u) => u.role === 'PARENT')
      .map((u) => u.phone)
      .filter(Boolean);

    const linkedStudents = parentPhones.length > 0
      ? await Student.find({ parentPhone: { $in: parentPhones } }).populate('user', 'firstname lastname')
      : [];

    // Build a phone -> children map
    const phoneToChildren = {};
    linkedStudents.forEach((s) => {
      const phone = s.parentPhone;
      if (!phoneToChildren[phone]) phoneToChildren[phone] = [];
      if (s.user) {
        phoneToChildren[phone].push({
          _id: s._id,
          firstname: s.user.firstname,
          lastname: s.user.lastname,
        });
      }
    });

    const chatList = users.map((u) => {
      const chatData = userMap.get(u._id.toString());
      return {
        _id: u._id,
        firstname: u.firstname,
        lastname: u.lastname,
        phone: u.phone,
        avatar: u.avatar,
        role: u.role,
        // Attach children info so teacher knows whose parent this is
        children: phoneToChildren[u.phone] || [],
        lastMessage: chatData.lastMessage,
        lastMessageTime: chatData.lastMessageTime,
        unreadCount: chatData.unreadCount,
      };
    });

    chatList.sort((a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime));

    res.status(200).json({
      status: 'success',
      data: { users: chatList },
    });
  } catch (err) {
    next(err);
  }
};
