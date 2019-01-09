const mongoose = require('mongoose');
const USERSTYPE = ["Normal", "Anonymous"];


const scheduleMessageSchema = new mongoose.Schema({
  senderUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: 'senderUserId cannot be blank'
  },
  senderName: {
    type: String
  },
  receiverUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: 'receiverUserId cannot be blank'
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
  location: {
    type: {
      type: String
    },
    coordinates: [Number],
  },
  timezone: {
    type: String
  },
  userType: {
    type: String,
    enum: USERSTYPE,
    required: `User must be of type ${USERSTYPE[0]} or ${USERSTYPE[1]}`
  },
  deviceId: {
    type: String
  },
  platform: {
    type: String
  },
  timeLeft: {
    type: Number
  }
})

scheduleMessageSchema.index({
  receiverUserId: 1,
  senderUserId: 1,
  senderName: 1,
  "location": "2dsphere"
});
const ScheduleMessage = mongoose.model('ScheduleMessage', scheduleMessageSchema);

module.exports = ScheduleMessage;