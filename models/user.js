const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  department: { type: String, required: true },
  Dob: { type: String, required: true },
  salaryScale: { type: Number, required: true },
  startDate: { type: String, required: true },
  annualLeave: { type: Number, required: true },
  time: { type: Number, required: true },
  statusWork: { type: Boolean, required: true },
  vacxin1: { type: String, required: false },
  dateV1: { type: String, required: false },
  vacxin2: { type: String, required: false },
  dateV2: { type: String, required: false },
  statusCovid: { type: Boolean, required: true },
  workId: {
    type: Schema.Types.ObjectId,
    ref: 'Work',
    required: false
  },
  imageUrl: { type: String, required: true },
});


module.exports = mongoose.model('User', userSchema);