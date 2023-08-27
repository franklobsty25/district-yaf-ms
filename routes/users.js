var express = require('express');
var router = express.Router();
const validator = require('../validation/validators');
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const argon2 = require('argon2');
const { authenticate } = require('../authentication');

router.get('/list', authenticate, function (req, res, next) {
  const { page = 1, limit = 10, all = false, search } = req.query;

  const query = { isDeleted: { $ne: true } };

  if (search) query.$or = [{ firstname: { $regrex: search, $option: 'i' } }];

  User.paginate(query, {
    page,
    limit,
    sort: { createdAt: -1 },
    pagination: !all,
  })
    .then((users) => {
      res.json({
        status: 'success',
        message: 'User fetched successfully.',
        data: users,
      });
    })
    .catch(next);
});

router.post(
  '/register',
  validator.createUserValidator,
  function (req, res, next) {
    new User(req.body)
      .save()
      .then(() => {
        res.json({
          status: 'success',
          message: 'User account created successfully.',
        });
      })
      .catch((err) => res.send({ status: 'error', message: err.message }));
  }
);

router.get('/', authenticate, function (req, res, next) {
  res.json({ status: 'success', data: { user: req.user } });
});

router.post('/login', async function (req, res, next) {
  const { email, password } = req.body;
  User.findOne({ email, isDeleted: { $ne: true } })
    .then((user) => {
      if (user) {
        argon2
          .verify(user.password, password)
          .then((isValid) => {
            if (isValid) {
              jwt.sign(
                { id: user.id, email },
                process.env.SECRET,
                {
                  expiresIn: process.env.EXPIRES_IN,
                  algorithm: 'HS512',
                },
                (err, token) => {
                  if (err) {
                    next(err);
                  }
                  res.json({
                    status: 'success',
                    message: 'Login successful',
                    data: { user, token },
                  });
                }
              );
            } else {
              res.send({ status: 'error', message: 'Invalid password.' });
            }
          })
          .catch(next);
      } else {
        res.send({ status: 'error', message: 'User not found.' });
      }
    })
    .catch((err) => res.send({ status: 'error', message: err.message }));
});

router.put(
  '/:user/edit',
  authenticate,
  validator.editUserValidator,
  (req, res, next) => {
    const { current_password, new_password } = req.body;

    if (new_password) {
      User.findOne({ _id: req.params.user, isDeleted: { $ne: true } })
        .then((user) => {
          if (!current_password)
            res.send({ status: 'error', message: 'No current password.' });

          argon2
            .verify(user.password, current_password)
            .then((isValid) => {
              if (isValid) {
                User.findOneAndUpdate(
                  {
                    _id: req.params.user,
                    isDeleted: { $ne: true },
                  },
                  { $set: { password: new_password } },
                  { new: true }
                )
                  .then(() => {
                    res.json({
                      status: 'success',
                      message: 'User password updated successfully.',
                    });
                  })
                  .catch((err) =>
                    res.send({ status: 'error', message: err.message })
                  );
              } else {
                res.send({
                  status: 'error',
                  message: 'Current paassword does not match.',
                });
              }
            })
            .catch((err) =>
              res.send({ status: 'error', message: err.message })
            );
        })
        .catch(next);
    } else {
      User.findOneAndUpdate(
        { _id: req.params.user, isDeleted: { $ne: true } },
        req.body,
        { new: true }
      )
        .then(() => {
          res.json({
            status: 'error',
            message: 'User profile updated successfully.',
          });
        })
        .catch(next);
    }
  }
);

router.delete('/:user/delete', authenticate, (req, res, next) => {
  User.findOneAndUpdate(
    { _id: req.params.user, isDeleted: { $ne: true } },
    { $set: { isDeleted: true } },
    { new: true }
  )
    .then(() => {
      res.json({
        status: 'error',
        message: 'User profile deleted successfully.',
      });
    })
    .catch(next);
});

module.exports = router;
