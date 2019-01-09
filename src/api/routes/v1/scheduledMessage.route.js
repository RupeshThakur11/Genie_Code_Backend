const express = require('express');
const controller = require('../../controllers/schedule.controller');
const router = express.Router();

/**
 * @api {post} v1/generate/message Generate OTP
 * @apiDescription Generate 6 digit OTP
 * @apiVersion 1.0.0
 * @apiName GenerateOtp
 * @apiGroup Auth
 * @apiPermission public
 *
 * @apiParam  {String}          email     User's email
 *
 * @apiSuccess (Created 201) {String}  otp:otp     6 digit OTP
 *
 * @apiError (Bad Request 400)  ValidationError  Some parameters may contain invalid values
 */
router.route('/message')
	.post(controller.create);
router.route('/messages')
	.get(controller.index);
router.route('/message/:id')
	.get(controller.show);
router.route('/message/:id')
	.put(controller.update);
router.route('/message/:id')
	.delete(controller.destroy);
router.route('/sendSilentPush')
	.post(controller.silentPush);
router.route('/message/receivers')
	.post(controller.listMessagesByReceiverID);

module.exports = router;