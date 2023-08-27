const Joi = require('joi');

const createUserSchema = Joi.object().keys({
  firstname: Joi.string().min(3).max(30).required(),
  lastname: Joi.string().min(3).max(30),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).max(30).required(),
  role: Joi.string().required(),
});

const editUserSchema = Joi.object().keys({
  firstname: Joi.string().min(3).max(30),
  middlename: Joi.string().min(3).max(30),
  lastname: Joi.string().min(3).max(30),
  email: Joi.string().email(),
  current_password: Joi.string().min(8).max(30),
  new_password: Joi.string().min(8).max(30),
});

const loginSchema = Joi.object().keys({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).max(30).required(),
});

const createPersonSchema = Joi.object().keys({
  firstname: Joi.string().min(3).max(30).required(),
  middlename: Joi.string().min(3).max(30),
  lastname: Joi.string().min(3).max(30).required(),
  email: Joi.string().email().required(),
  dob: Joi.date().required(),
  phonenumber: Joi.string().min(10).max(13).required(),
  branch: Joi.string().required(),
  registrationDate: Joi.date().required(),
  createdBy: Joi.string().required(),
});

const editPersonSchema = Joi.object().keys({
  firstname: Joi.string().min(3).max(30),
  middlename: Joi.string().min(3).max(30),
  lastname: Joi.string().min(3).max(30),
  email: Joi.string().email(),
  phonenumber: Joi.string().min(10).max(13),
});

const createBranchSchema = Joi.object().keys({
  name: Joi.string().min(3).max(20),
  createdBy: Joi.string().required(),
});

module.exports = {
  createUserSchema,
  loginSchema,
  createPersonSchema,
  editUserSchema,
  editPersonSchema,
  createBranchSchema,
};
