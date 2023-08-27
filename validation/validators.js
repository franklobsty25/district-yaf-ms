const {
  createUserSchema,
  loginSchema,
  createPersonSchema,
  editUserSchema,
  editPersonSchema,
  createBranchSchema,
} = require('./schemas');
const argon2 = require('argon2');

exports.createUserValidator = (req, res, next) => {
  createUserSchema
    .validateAsync(req.body)
    .then((validated) => {
      const { email, password } = validated;

      argon2
        .hash(password)
        .then((hash) => {
          validated.email = email.toLowerCase();
          validated.password = hash;
          req.body = validated;
          next();
        })
        .catch((err) => res.send({ status: 'error', message: err.message }));
    })
    .catch((err) => res.send({ status: 'error', message: err.message }));
};

exports.editUserValidator = (req, res, next) => {
  editUserSchema
    .validateAsync(req.body)
    .then((validated) => {
      const { email, new_password } = validated;
      if (new_password) {
          argon2
            .hash(new_password)
            .then((hash) => {
              validated.new_password = hash; // hash and add to object
              req.body = validated;
              next();
            })
            .catch((err) =>
              res.send({ status: 'error', message: err.message })
            );
      } else {
        validated.email = email.toLowerCase();
        req.body = validated;
        next();
      }
    })
    .catch((err) => res.send({ status: 'error', message: err.message }));
};

exports.createLoginValidator = (req, res, next) => {
  loginSchema
    .validateAsync(req.body)
    .then((validated) => {
      const { email } = validated;
      validated.email = email.toLowerCase();
      req.body = validated;
      next();
    })
    .catch((err) => res.send({ status: 'error', message: err.message }));
};

exports.createPersonValidator = (req, res, next) => {
  createPersonSchema
    .validateAsync(req.body)
    .then((validated) => {
      const { email } = validated;
      validated.email = email.toLowerCase();
      req.body = validated;
      next();
    })
    .catch((err) => res.send({ status: 'error', message: err.message }));
};

exports.editPersonValidator = (req, res, next) => {
  editPersonSchema
    .validateAsync(req.body)
    .then((validated) => {
      req.body = validated;
      next();
    })
    .catch((err) => res.send({ status: 'error', message: err.message }));
};

exports.createBranchValidator = (req, res, next) => {
  createBranchSchema
    .validateAsync(req.body)
    .then((validated) => {
      req.body = validated;
      next();
    })
    .catch((err) => res.send({ status: 'error', message: err.message }));
};
