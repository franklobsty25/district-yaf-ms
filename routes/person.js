var express = require('express');
var router = express.Router();
const Person = require('../models/person');
const Branch = require('../models/branch');
const validator = require('../validation/validators');
const { authenticate } = require('../authentication');
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

router.get('/', authenticate, (req, res, next) => {
  const query = {
    $lookup: {
      from: 'branches',
      localField: 'branch',
      foreignField: '_id',
      pipeline: [
        { $sort: { createdAt: -1 } },
        { $match: { isDeleted: { $ne: true } } },
      ],
      as: 'branches',
    },
  };

  Person.aggregate([query])
    .then((members) => {
      const data = members.map((m) => {
        return {
          firstname: m.firstname,
          lastname: m.lastname,
          email: m.email,
          branch: m.branches?.shift()?.name || '',
          registrationDate: new Date(m.registrationDate).toDateString(),
        };
      });
      res.json({
        status: 'success',
        message: 'Members fetch successfully.',
        data,
      });
    })
    .catch(next);
});

router.get('/statistics', authenticate, (req, res, next) => {
  const { branch, registration } = req.query;

  if (branch) {
    Person.countDocuments({ branch, isDeleted: { $ne: true } })
      .then((total) => {
        Branch.findById(branch)
          .then((branch) => {
            res.json({
              status: 'success',
              message: `Total members of ${branch.name}.`,
              data: { total },
            });
          })
          .catch(next);
      })
      .catch(next);
  } else if (registration) {
    Person.countDocuments({
      registrationDate: new Date(new Date().toISOString().split('T').shift()),
      isDeleted: { $ne: true },
    })
      .then((total) => {
        res.json({
          status: 'success',
          message: 'Total registrations today.',
          data: { total },
        });
      })
      .catch(next);
  } else {
    Person.countDocuments({ isDeleted: { $ne: true } })
      .then((total) => {
        res.json({
          status: 'success',
          message: 'Total district members.',
          data: { total },
        });
      })
      .catch(next);
  }
});

router.get('/:branch', authenticate, (req, res, next) => {
  Branch.findById(req.params.branch).then((branch) => {
    Person.find({ branch: req.params.branch, isDeleted: { $ne: true } })
      .then((members) => {
        const data = members.map((member) => {
          return {
            firstname: member.firstname,
            lastname: member.lastname,
            email: member.email,
            branch: branch?.name || '',
            registrationDate: new Date(member.registrationDate).toDateString(),
          };
        });
        res.json({
          status: 'success',
          message: `${
            branch?.name || ''
          } members fetched successfully.`,
          data,
        });
      })
      .catch(next);
  });
});

router.get('/:person', authenticate, (req, res, next) => {
  Person.findOne({ _id: req.params.person, isDeleted: { $ne: true } })
    .then((person) => {
      res.json({
        status: 'success',
        message: `${person.firstname} ${person.lastname} information fetched successfully.`,
        data: { person },
      });
    })
    .catch((err) => res.send({ status: 'error', message: err.message }));
});

router.post(
  '/create',
  authenticate,
  validator.createPersonValidator,
  (req, res, next) => {
    new Person(req.body)
      .save()
      .then(() => {
        res.json({
          status: 'success',
          message: 'Person profile saved successfully.',
        });
      })
      .catch((err) => res.send({ status: 'error', message: err.message }));
  }
);

router.put(
  '/:person/edit',
  authenticate,
  validator.editPersonValidator,
  (req, res, next) => {
    Person.findByIdAndUpdate(
      { _id: req.params.person, isDeleted: { $ne: true } },
      req.body,
      { new: true }
    )
      .then((person) => {
        res.json({
          status: 'success',
          message: 'Person profile updated successfully.',
          data: person,
        });
      })
      .catch(next);
  }
);

router.delete('/:person/delete', authenticate, (req, res, next) => {
  Person.findByIdAndUpdate(
    { _id: req.params.person, isDeleted: { $ne: true } },
    { $set: { isDeleted: true } },
    { new: true }
  )
    .then((deleted) => {
      res.json({
        status: 'success',
        message: 'Person profile deleted successfully.',
        data: deleted,
      });
    })
    .catch(next);
});

module.exports = router;
