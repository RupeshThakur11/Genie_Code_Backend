const express = require('express');
const ChatController = require('../../controllers/chat.controller');
const router = express.Router();

/**
 * @api {post} v1/chat/message Generate OTP
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
router.route('/allMessages')
	.get(ChatController.getConversations);
router.route('/:conversationId')
	.get(ChatController.getConversation);
router.route('/send-message/:conversationId')
	.post(ChatController.sendReply);
router.route('/conversation')
	.post(ChatController.newConversation);

module.exports = router;