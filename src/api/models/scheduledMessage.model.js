const mongoose = require('mongoose');



const scheduleMessageSchema = new mongoose.Schema({
  senderUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  senderName: {
    type: String
  },
  receiverUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  scheduledTime: {
    type: Date,
    default: +new Date() + 1 * 24 * 60 * 60 * 1000
  },
  scheduleDone: {
    type: Boolean,
    default: false
  },
  scheduleNumber: {
    type: Number
  },
  heighestLike: {
    type: String
  },
  likes: {
    type: String
  },
  message: {
    type: String,
    default: '',
    trim: true,
    required: 'Message cannot be blank'
  },
  token: {
    type: String,
    trim: true
  },
  timeLeft: {
    type: Number
  }
})

scheduleMessageSchema.index({
  receiverUserId: 1,
  senderUserId: 1,
  senderName: 1
});
const ScheduleMessage = mongoose.model('ScheduleMessage', scheduleMessageSchema);
module.exports = ScheduleMessage;