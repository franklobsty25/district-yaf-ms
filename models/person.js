const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const { BRANCH, USER } = require('../constants/constant');
const Schema = mongoose.Schema;

const PersonSchema = new Schema(
  {
    firstname: { type: String, required: true },
    middlename: String,
    lastname: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    dob: { type: Date, required: true },
    phonenumber: { type: String, required: true },
    branch: { type: Schema.Types.ObjectId, ref: BRANCH },
    registrationDate: { type: Date, required: true },
    isDeleted: { type: Boolean, default: false },
    createdBy: { type: Schema.Types.ObjectId, ref: USER },
  },
  {
    timestamps: true,
  }
);

PersonSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Person', PersonSchema);
