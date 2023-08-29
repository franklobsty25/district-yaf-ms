const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const Schema = mongoose.Schema;

const UserSchema = new Schema(
  {
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    role: { type: String, required: true },
    isDeleted: { type: Boolean, default: false },
    lastLogin: { type: Date },
  },
  {
    timestamps: true,
  }
);

UserSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('User', UserSchema);
