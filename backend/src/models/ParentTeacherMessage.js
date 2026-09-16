const mongoose = require('mongoose');

const ParentTeacherMessageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    message: {
      type: String,
      required: [true, 'Xabar matni kiritilishi shart'],
      trim: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Optimize query for chat history between two users
ParentTeacherMessageSchema.index({ sender: 1, receiver: 1, createdAt: -1 });

module.exports = mongoose.model('ParentTeacherMessage', ParentTeacherMessageSchema);
