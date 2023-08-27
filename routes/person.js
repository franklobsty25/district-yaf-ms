var express = require('express');
var router = express.Router();
const Person = require('../models/person');
const Branch = require('../models/branch');
const validator = require('../validation/validators');
const { authenticate } = require('../authentication');

router.get('/', authenticate, (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  Person.countDocuments({ isDeleted: { $ne: true } })
    .then((count) => {
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
        .skip((page - 1) * limit)
        .limit(limit)
        .then((members) => {
          res.json({
            status: 'success',
            message: 'Members fetch successfully.',
            data: members,
            metadata: {
              page,
              perPage: limit,
              totalPages: Math.ceil(count / limit),
              totalDocs: count,
            },
          });
        })
        .catch(next);
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
  const { page = 1, limit = 10, all = false } = req.query;

  const query = {
    branch: req.params.branch,
    isDeleted: { $ne: true },
  };

  Branch.findById(req.params.branch)
    .then((branch) => {
      Person.paginate(query, {
        page,
        limit,
        pagination: !all,
        sort: { createdAt: -1 },
      })
        .then((members) => {
          res.json({
            status: 'success',
            message: 'Branche members fetched successfully.',
            data: { branch, members },
          });
        })
        .catch(next);
    })
    .catch(next);
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
