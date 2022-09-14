const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const covidSchema = new Schema({
  date: { type: String, required: false },
  time: { type: String, required: false },
  temperature: { type: Number, required: false },
  positive: { type: Boolean, required: false },
  positiveDay: { type: String, required: false },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
});

module.exports = mongoose.model('Covid', covidSchema);