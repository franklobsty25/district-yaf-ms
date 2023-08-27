const mongoose = require('mongoose');
const { USER } = require('../constants/constant');
const Schema = mongoose.Schema;

const BranchSchema = new Schema({
  name: { type: String, required: true },
  isDeleted: { type: Boolean, default: false },
  createdBy: { type: Schema.Types.ObjectId, ref: USER },
});

module.exports = mongoose.model('Branch', BranchSchema);
