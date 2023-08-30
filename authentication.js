const jwt = require('jsonwebtoken');
const User = require('./models/user');
const { ADMIN } = require('./constants/constant');

authenticate = (req, res, next) => {
  if (req.headers['authorization']) {
    const token = req.headers['authorization'].split(' ')[1];

    if (!token) res.status(401).send({ status: 'error', message: 'No token access' });

    jwt.verify(token, process.env.SECRET, (err, user) => {
      if (err) res.status(401).send({ status: 'error', message: 'Unauthorized token access' });

      User.findById(user.id)
        .select('-password')
        .then((user) => {
          req.user = user;

          next();
        });
    });
  } else {
    res.status(403).send({ status: 'error', message: 'No token access' });
  }
};

adminAuthenticate = (req, res, next) => {
  if (req.user.role !== ADMIN)
    res.status(401).send({ status: 'error', message: 'Unauthorized access' });

  next();
};

module.exports = { authenticate, adminAuthenticate };
