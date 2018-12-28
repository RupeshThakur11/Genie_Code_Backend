const mongoose = require('mongoose');
const httpStatus = require('http-status');
const {
  omitBy,
  isNil
} = require('lodash');
const bcrypt = require('bcryptjs');
const moment = require('moment-timezone');
const jwt = require('jwt-simple');
const uuidv4 = require('uuid/v4');
const APIError = require('../utils/APIError');
const {
  env,
  jwtSecret,
  jwtExpirationInterval
} = require('../../config/vars');
const Schema = mongoose.Schema;
const autoIncrement = require('mongoose-auto-increment');
const arrayUniquePlugin = require('mongoose-unique-array');

/**
 * User Roles
 */
const roles = ['user', 'admin', 'superadmin', 'subscriber'];

/**
 * User Schema
 * @private
 */



const userSchema = new mongoose.Schema({
  email: {
    type: String,
    match: /^\S+@\S+\.\S+$/,
    required: false,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    maxlength: 128,
  },
  name: {
    type: String,
    maxlength: 128,
    index: true,
    trim: true,
  },
  display_name: {
    type: String,
    minlength: 1,
    trim: true
  },
  display_name_as: {
    type: String
  },
  profile: {
    firstName: {
      type: String
    },
    lastName: {
      type: String
    }
  },
  services: {
    facebook: String,
    google: String,
    phone: String
  },
  role: {
    type: String,
    enum: roles,
    default: 'user',
  },
  picture: {
    type: String,
    trim: true,
  },
  birthday: {
    type: String,
    trim: true,
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other'],
  },

  location: {
    type: String,
    trim: true,
  },
  surfingSince: {
    type: Number,
  },
  awards: {
    type: [String],
  },
  uploadedVideos: {
    type: [String],
  },
  interests: {
    type: [String],
  },
  uuid: {
    type: String,
    default: uuidv4(),
  },
  otp: {
    type: Number,
  },
  age: {
    type: Number,
    required: true,
    default: 18
  },
  height: {
    type: String
  },
  education: {
    type: String
  },
  company_name: {
    type: String
  },
  job_title: {
    type: String
  },
  body_type: {
    type: String
  },
  about_me: {
    type: String
  },
  phone: {
    type: Number,
    trim: true,
  },
  lives_in: {
    type: String
  },
  car_model: {
    type: String
  },
  images: {
    type: [String],
  },
  profilePhoto: String,
  authType: {
    type: String
  },
  fbID: {
    type: String
  },
  likes: [Schema.ObjectId],
  dislikes: [Schema.ObjectId],
  profiles_sent: [Schema.ObjectId],
  address: {
    type: String
  },
  education: {
    type: String
  },
  firebase_token: {
    type: String
  },
  revealYourself: {
    type: Boolean,
    default: false,
  },
  revealUsersID: {
    type: Array,
    default: [],
    unique:true
  },
  // revealUsersID:[{ type: String, unique: true }],
  message: {
    type: String
  },
  userID: {
    type: Number,
    default: 0,
    unique: true
  },
  mobileVerified: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
}, {
  usePushEach: true,

});

/**
 * Add your
 * - pre-save hooks
 * - validations
 * - virtuals
 */
userSchema.plugin(arrayUniquePlugin); 
autoIncrement.initialize(mongoose.connection);
userSchema.plugin(autoIncrement.plugin, {
  model: 'User',
  field: 'userID',
  startAt: 1,
  incrementBy: 1
});
userSchema.pre('save', async function save(next) {
  try {
    if (!this.isModified('password')) return next();

    const rounds = env === 'test' ? 1 : 10;

    const hash = await bcrypt.hash(this.password, rounds);
    this.password = hash;

    return next();
  } catch (error) {
    return next(error);
  }
});

/**
 * Methods
 */
userSchema.method({
  transform() {
    const transformed = {};
    const fields = ['id', 'name', 'email', 'picture', 'role', 'createdAt', 'userID', 'birthday', 'gender'];

    fields.forEach((field) => {
      transformed[field] = this[field];
    });

    return transformed;
  },

  token() {
    const playload = {
      exp: moment().add(jwtExpirationInterval, 'days').unix(),
      iat: moment().unix(),
      sub: this._id,
    };
    return jwt.encode(playload, jwtSecret);
  },

  async passwordMatches(password) {
    return bcrypt.compare(password, this.password);
  },
});

userSchema.statics.findByCredentials = function(phone, password) {
  var User = this;
  return User.findOne({
    phone
  }).select('+password').then(function(user) {
    if (!user) {
      return Promise.reject();
    }
    return new Promise(function(resolve, reject) {
      bcrypt.compare(password, user.password, function(err, res) {
        if (res) {
          resolve(user);
        } else {
          reject();
        }
      });
    });
  });
};

/**
 * Statics
 */
userSchema.statics = {

  roles,

  /**
   * Get user
   *
   * @param {ObjectId} id - The objectId of user.
   * @returns {Promise<User, APIError>}
   */
  async get(id) {
    try {
      let user;

      if (mongoose.Types.ObjectId.isValid(id)) {
        user = await this.findById(id).exec();
      }
      if (user) {
        return user;
      }

      throw new APIError({
        message: 'User does not exist',
        status: httpStatus.NOT_FOUND,
      });
    } catch (error) {
      throw error;
    }
  },

  /**
   * Find user by email and tries to generate a JWT token
   *
   * @param {ObjectId} id - The objectId of user.
   * @returns {Promise<User, APIError>}
   */
  async findAndGenerateToken(options) {
    const {
      email,
      password,
      refreshObject
    } = options;
    if (!email) throw new APIError({
      message: 'An email is required to generate a token'
    });

    const user = await this.findOne({
      email
    }).exec();
    const err = {
      status: httpStatus.UNAUTHORIZED,
      isPublic: true,
    };
    if (password) {
      if (user && await user.passwordMatches(password)) {
        return {
          user,
          accessToken: user.token()
        };
      }
      err.message = 'Incorrect email or password';
    } else if (refreshObject && refreshObject.userEmail === email) {
      if (moment(refreshObject.expires).isBefore()) {
        err.message = 'Invalid refresh token.';
      } else {
        return {
          user,
          accessToken: user.token()
        };
      }
    } else {
      err.message = 'Incorrect email or refreshToken';
    }
    throw new APIError(err);
  },

  /**
   * List users in descending order of 'createdAt' timestamp.
   *
   * @param {number} skip - Number of users to be skipped.
   * @param {number} limit - Limit number of users to be returned.
   * @returns {Promise<User[]>}
   */
  list({
    page = 1,
    perPage = 30,
    name,
    email,
    role,
  }) {
    const options = omitBy({
      name,
      email,
      role
    }, isNil);

    return this.find(options)
      .sort({
        createdAt: -1
      })
      .skip(perPage * (page - 1))
      .limit(perPage)
      .exec();
  },

  /**
   * Return new validation error
   * if error is a mongoose duplicate key error
   *
   * @param {Error} error
   * @returns {Error|APIError}
   */
  checkDuplicateEmail(error) {
    if (error.name === 'MongoError' && error.code === 11000) {
      return new APIError({
        message: 'Validation Error',
        errors: [{
          field: 'email',
          location: 'body',
          messages: ['"email" already exists'],
        }],
        status: httpStatus.CONFLICT,
        isPublic: true,
        stack: error.stack,
      });
    }
    return error;
  },

  async oAuthLogin({
    service,
    id,
    email,
    name,
    picture,
    message,
  }) {
    const user = await this.findOne({
      $or: [{
        [`services.${service}`]: id
      }, {
        email
      }]
    });
    if (user) {
      user.services[service] = id;
      if (!user.name) user.name = name;
      if (!user.picture) user.picture = picture;
      if (!user.message) user.message = 'User already registered';
      return user.save();
    }
    const password = uuidv4();
    return this.create({
      services: {
        [service]: id
      },
      message,
      email,
      password,
      name,
      picture,
    });
  },

  async verifyEmail(uuid) {
    if (!uuid) throw new APIError({
      message: 'No token found for verification'
    });
    try {
      const user = await this.findOneAndUpdate({
        uuid
      }, {
        emailVerified: true
      }).exec();

      if (user) {
        return {
          message: 'Thank you for verification'
        }
      }
      throw new APIError({
        message: 'User does not exist',
        status: httpStatus.NOT_FOUND,
      });
    } catch (err) {
      throw new APIError(err);
    }
  },

  async verifyMobileOtp(email, otp) {
    if (!email || !otp) throw new APIError({
      message: 'Can not verify otp due to insufficient information',
      status: httpStatus.BAD_REQUEST
    });

    try {
      const user = await this.findOne({
        email,
        otp
      }).exec();
      if (user) {
        return {
          message: 'OTP verified'
        };
      }
      throw new APIError({
        message: 'OTP did not match',
        status: httpStatus.NOT_FOUND,
      });
    } catch (err) {
      throw new APIError(err);
    }
  },

  async FindOneAndUpdate(query, update) {
    try {
      const user = await this.findOneAndUpdate(query, update).exec();
      if (user) {
        return user
      }

      throw new APIError({
        message: 'User does not exist',
        status: httpStatus.NOT_FOUND,
      });
    } catch (err) {
      throw new APIError({
        message: 'User does not exist',
        status: httpStatus.BAD_REQUEST,
      });
    }
  },
};

userSchema.statics.findByGender = function(gender, liked_disliked) {
  var User = this;
  return User.find({
    gender,
    _id: {
      $nin: liked_disliked
    }
  }).then(function(users) {
    if (!users) {
      return Promise.reject();
    } else {
      return Promise.resolve(users);
    }
  });
};


/**
 * @typedef User
 */
module.exports = mongoose.model('User', userSchema);