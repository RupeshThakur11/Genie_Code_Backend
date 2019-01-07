const mjml2html = require('mjml');
const credentials = require('../../config/credentials');
const registrationTemplate = require('../../templates/email/registration');
const client = require('../../config/client');
const BulkMailer = require("../services/bulkEmail");
const User = require('../models/user.model');

let bulkMailer = new BulkMailer({
  transport: credentials.email,
  verbose: true
});

let __mailerOptions = (hash, options) => {
  let companyLogo = client.logoUrl;
  let verificationUrl = `${client.baseUrl}${client.verifyEmail}/${hash}`;
  let template = registrationTemplate(companyLogo, verificationUrl);
  let html = mjml2html(template);

  let mailOptions = options;
  mailOptions['html'] = html.html;
  mailOptions['text'] = 'Hi there!';
  mailOptions['from'] = credentials.email.auth.user;
  mailOptions['subject'] = 'Please verify your email';

  return mailOptions;
}

exports.sendVerificationEmail = (hash, options) => {
  let mailerOptions = __mailerOptions(hash, options);
  bulkMailer.send(mailerOptions, true, (error, result) => { // arg1: mailinfo, agr2: parallel mails, arg3: callback
    if (error) {
      console.error(error);
    } else {
      console.info(result);
    }
  });
}

exports.verifyUserEmail = async (req, res, next) => {
  const {
    uuid
  } = req.params;

  try {
    const message = await User.verifyEmail(uuid);
    return res.status(200).send(message);
  } catch (err) {
    return next(err);
  }
}

exports.verifyMobileOtp = async (req, res, next) => {
  const {
    email,
    otp
  } = req.body;
  try {
    const message = await User.verifyMobileOtp(email, otp);
    return res.status(200).send(message);
  } catch (err) {
    return next(err);
  }
}