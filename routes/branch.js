var express = require('express');
var router = express.Router();
const Branch = require('../models/branch');
const validator = require('../validation/validators');
const { authenticate, adminAuthenticate } = require('../authentication');

router.get('/count', authenticate, function (req, res, next) {
  Branch.countDocuments({ isDeleted: { $ne: true } })
    .then((total) => {
      res.json({
        status: 'success',
        message: 'Total branhes.',
        data: { total },
      });
    })
    .catch(next);
});

router.get('/', authenticate, function (req, res, next) {
  Branch.find({ isDeleted: { $ne: true } })
    .then((branches) => {
      res.json({
        status: 'success',
        message: 'Branches fetched successfully.',
        data: branches,
      });
    })
    .catch(next);
});

router.post(
  '/create',
  authenticate,
  adminAuthenticate,
  validator.createBranchValidator,
  function (req, res, next) {
    new Branch(req.body)
      .save()
      .then((branch) => {
        res.json({
          status: 'success',
          message: 'Branch saved successfully.',
        });
      })
      .catch((err) => res.send({ status: 'error', message: err.message }));
  }
);

router.put(
  '/:branch/edit',
  authenticate,
  adminAuthenticate,
  validator.createBranchValidator,
  function (req, res, next) {
    Branch.findOneAndUpdate(
      { _id: req.params.branch, isDeleted: { $ne: true } },
      req.body,
      { new: true }
    )
      .then((branch) => {
        res.json({ message: 'Branch updated successfully.', data: branch });
      })
      .catch(next);
  }
);

router.delete(
  '/:branch/delete',
  authenticate,
  adminAuthenticate,
  function (req, res, next) {
    Branch.findOneAndUpdate(
      { _id: req.params.branch, isDeleted: { $ne: true } },
      { isDeleted: true },
      { new: true }
    )
      .then((branch) => {
        res.json({ message: 'Branch deleted successfully.', data: branch });
      })
      .catch(next);
  }
);

module.exports = router;
