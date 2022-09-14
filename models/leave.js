const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const leaveSchema = new Schema({
    leaveDate: { type: String, required: true },
    leaveFromDate: { type: String, required: false },
    leaveToDate: { type: String, required: false },
    leaveTime: { type: Number, required: true },
    reason: { type: String, required: false },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
});

module.exports = mongoose.model('Leave', leaveSchema);