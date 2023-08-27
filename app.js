var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');
require('dotenv').config();
const mongoose = require('mongoose');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const personRouter = require('./routes/person');
const branchRouter = require('./routes/branch');

mongoose
  .connect(process.env.MONGODB_URL)
  .then(() => {
    console.log('Database Connected Successfully...');
  })
  .catch((err) => console.error(err));

var app = express();

app.use(
  session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true, maxAge: 60 * 60 },
  })
);

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/v1/', indexRouter);
app.use('/api/v1/users', usersRouter);
app.use('/api/v1/persons', personRouter);
app.use('/api/v1/branches', branchRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next();
});

// // error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  if (err.code == 11000)
    res.status(500).send({ message: 'Duplicate email address' });

  res.status(err.status || 500);
  res.send({ message: err.message });
});

module.exports = app;
