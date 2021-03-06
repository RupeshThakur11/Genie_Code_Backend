const express = require('express');
const userRoutes = require('./user.route');
const authRoutes = require('./auth.route');
const verificationRoutes = require('./verify.route');
const generationRoutes = require('./generate.route');
const uploadRoutes = require('./upload.route');
const scheduledRoutes = require('./scheduledMessage.route');
const chatRoutes = require('./chat.route');
const router = express.Router();

/**
 * GET v1/status
 */
router.get('/status', (req, res) => res.send('OK'));

/**
 * GET v1/docs
 */
router.use('/docs', express.static('docs'));

router.use('/users', userRoutes);
router.use('/auth', authRoutes);
router.use('/proto',uploadRoutes);
router.use('/verify', verificationRoutes);
router.use('/generate', generationRoutes);
router.use('/automatic', scheduledRoutes);
router.use('/chat', chatRoutes);

module.exports = router;
