const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userSchema = new Schema({
  email: { type: String, required: true },
  password: { type: String, required: true },
  name: { type: String, required: false },
  department: { type: String, required: false },
  Dob: { type: String, required: false },
  salaryScale: { type: Number, required: false },
  startDate: { type: String, required: false },
  annualLeave: { type: Number, required: false },
  time: { type: Number, required: false },
  statusWork: { type: Boolean, required: false },
  vacxin1: { type: String, required: false },
  dateV1: { type: String, required: false },
  vacxin2: { type: String, required: false },
  dateV2: { type: String, required: false },
  statusCovid: { type: Boolean, required: false },
  workId: {
    type: Schema.Types.ObjectId,
    ref: "Work",
    required: false,
  },
  user_manage: {
    user_manage_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    name: { type: String, required: false },
  },
  imageUrl: { type: String, required: false },
  manage: [
    {
      type: Object,
      required: false,
    },
  ],
  lock: [
    {
      type: String,
      required: false,
    },
  ],
});

module.exports = mongoose.model("User", userSchema);
