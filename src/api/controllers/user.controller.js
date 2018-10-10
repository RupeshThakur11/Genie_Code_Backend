const httpStatus = require('http-status');
const {
  omit
} = require('lodash');
const User = require('../models/user.model');
const {
  handler: errorHandler
} = require('../middlewares/error');

/**
 * Load user and append to req.
 * @public
 */
exports.load = async (req, res, next, id) => {
  try {
    const user = await User.get(id);
    req.locals = {
      user
    };
    return next();
  } catch (error) {
    return errorHandler(error, req, res);
  }
};

/**
 * Get user
 * @public
 */
exports.get = (req, res) => res.status(200).json(req.locals.user.transform());

/**
 * Get logged in user info
 * @public
 */
exports.loggedIn = (req, res) => res.status(200).json(req.user.transform());

/**
 * Create new user
 * @public
 */
exports.create = async (req, res, next) => {
  try {
    const user = new User(req.body);
    const savedUser = await user.save();
    res.status(httpStatus.CREATED);
    res.json(savedUser.transform());
  } catch (error) {
    next(User.checkDuplicateEmail(error));
  }
};

/**
 * Replace existing user
 * @public
 */
exports.replace = async (req, res, next) => {
  try {
    const {
      user
    } = req.locals;
    const newUser = new User(req.body);
    const ommitRole = user.role !== 'admin' ? 'role' : '';
    const newUserObject = omit(newUser.toObject(), '_id', ommitRole);

    await user.update(newUserObject, {
      override: true,
      upsert: true
    });
    const savedUser = await User.findById(user._id);

    res.status(200).json(savedUser.transform());
  } catch (error) {
    next(User.checkDuplicateEmail(error));
  }
};

/**
 * Update existing user
 * @public
 */
exports.update = (req, res, next) => {
  const ommitRole = req.locals.user.role !== 'admin' ? 'role' : '';
  const updatedUser = omit(req.body, ommitRole);
  const user = Object.assign(req.locals.user, updatedUser);

  user.save()
    .then(savedUser => res.status(200).json(savedUser))
    .catch(e => next(User.checkDuplicateEmail(e)));
};

/**
 * Get user list
 * @public
 */
exports.list = async (req, res, next) => {
  try {
    const users = await User.list(req.query);
    const transformedUsers = users.map(user => user.transform());
    res.status(200).json(transformedUsers);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete user
 * @public
 */
exports.remove = (req, res, next) => {
  const {
    user
  } = req.locals;

  user.remove()
    .then(() => res.status(httpStatus.NO_CONTENT).end())
    .catch(e => next(e));
};

/**
 * Find One user
 * @public
 */

exports.findByUserID = (req, res) => {
  var userID = req.params.userID;
  console.log(userID);
  User.find({
    userID
  }, function(err, person) {
    if (err) return handleError(err);
    res.status(200).send(person);
  });
}

/**
 * All users
 * @public
 */

exports.getAllUsers = (req, res) => {
  User.find({})
    .exec((err, result) => {
      if (err) {
        res.status(500).send("Internal error");
      } else {
        res.status(200).send(result);
      }
    });
}

/**
 * Single user
 * @public
 */

exports.getSingleUser = (req, res) => {
  console.log('hello');
  return false;
  User.findOne({
      'userID': req.params.id
    })
    .exec((err, result) => {
      if (err) {
        res.status(500).send("Internal error");
      } else {
        res.status(200).send(result);
      }
    });
}

exports.getAllMatchingUsers = (req, res) => {


  let listOfUsers = req.body.users.map((value) => {
    return value;
  })
  console.log(listOfUsers);
  User.find({
    "userID": {
      $in: listOfUsers
    }
  }).limit(10).
  sort({
    occupation: -1
  }).exec((err, data) => {
    if (err) {
      new new Error({
        message: 'Error Occured'
      })
    } else if (data.length === 0) {
      return res.status(200).send([{
        message: 'Data Unavailable',
        count: data.length
      }]);
    } else {
      return res.status(200).send(data);
    }
  })
}