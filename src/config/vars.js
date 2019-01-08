const path = require('path');

// import .env variables
require('dotenv-safe').load({
  path: path.join(__dirname, '../../.env'),
  sample: path.join(__dirname, '../../.env.example'),
});

module.exports = {
  env: process.env.NODE_ENV,
  port: process.env.PORT,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpirationInterval: process.env.JWT_EXPIRATION_DAYS,
  mongo: {
    uri: process.env.NODE_ENV === 'test'
      ? process.env.MONGO_URI_TESTS
      : process.env.MONGO_URI,
  },
  logs: process.env.NODE_ENV === 'production' ? 'combined' : 'dev',
  sendVerificationMail: true,
  sendVerificationSms: true,
  serverkey:'AAAAz3AZTKg:APA91bEu6rx4ZqjnyobmZLscH3uhGb36zC0heODtPn1IUPNYrcx-KcyRxNvYznl-mBW1_wXzg9Z2xd8oVs-mwdewzJokgeeN0kkvZcC1IG9S4xtLZNZQwhPy-Wng3-2By_U5hFUNNNBN'
};
