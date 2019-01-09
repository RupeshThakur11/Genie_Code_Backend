const _ = require('lodash');
const ScheduleMessage = require('../models/scheduledMessage.model');
const User = require('../models/user.model');
const schedule = require('node-schedule');
const crontab = require('node-crontab');
const androidNotification = require('../utils/androidPush');
const appleNotification = require('../utils/applePush');
const FCM = require('fcm-push');
const {
	serverkey
} = require('../../config/vars');

const fcm = new FCM(serverkey);

const handleError = (res, err) => {
	return res.status(500).send(err);
}


exports.index = (req, res) => {
	ScheduleMessage.find({}, (err, messages) => {

		if (err) {
			res.status(200).send({
				status: 'error',
				message: 'Something went wrong',
				errorInfo: err
			})


		}

		return res.status(200).send({
			status: 'success',
			res: messages
		})
		var message = {
			to: '<insert-device-token>',
			collapse_key: '<insert-collapse-key>',
			data: {
				key1: 'random-data-value1',
				key2: 'random-data-value2'
			},
			notification: {
				title: 'Title of the notification',
				body: 'Body of the notification'
			}
		};
		fcm.send(message, function(err, response) {
			if (err) {
				console.log("Something has gone wrong !");
			} else {
				console.log("Successfully sent with resposne :", response);
			}
		});
	})
}

exports.show = (req, res) => {
	ScheduleMessage.findById(req.params.id, (err, message) => {
		if (err) {
			res.status(200).send({
				status: 'error',
				message: 'Something went wrong',
				errorInfo: err
			})
		}
		if (!message) {
			return res.status(404).end();
		}
		return res.status(200).send({
			status: 'success',
			response: message
		})
	})
}

exports.create = (req, res) => {
	ScheduleMessage.create(req.body, (err, messages) => {
		if (err) {
			res.status(200).send({
				status: 'error',
				message: 'Something went wrong',
				errorInfo: err
			})
		}
		return res.status(201).json({
			status: 'schedule message saved successfully',
			messages
		});
	})
}

exports.update = (req, res) => {
	if (req.body._id) {
		delete req.body._id;
	}
	ScheduleMessage.findById(req.params.id, (err, message) => {
		if (err) {
			res.status(200).send({
				status: 'error',
				message: 'Something went wrong',
				errorInfo: err
			})
		}
		if (!message) {
			return res.status(404).end();
		}
		let updated = _.merge(message, req.body);
		updated.save((err) => {
			if (err) {
				res.status(200).send({
					status: 'error',
					message: 'Something went wrong',
					errorInfo: err
				})
			}
			return res.status(200).send({
				status: 'success',
				response: message
			})
		})
	})
}

exports.destroy = (req, res) => {
	ScheduleMessage.findById(req.params.id, (err, message) => {
		if (err) {
			res.status(200).send({
				status: 'error',
				message: 'Something went wrong',
				errorInfo: err
			})
		}
		if (!message) {
			return res.status(404).end();
		}
		message.remove((err) => {
			if (err) {
				res.status(200).send({
					status: 'error',
					message: 'Something went wrong',
					errorInfo: err
				})
			}
			return res.status(204).send({
				message: 'schedule kismet deleted successfully'
			})

		})
	})
}

exports.listMessagesByReceiverID = async (req, res) => {

	try {
		let ids = req.body;
		let listOfMessages = await ScheduleMessage.find({
			'receiverUserId': {
				$in: ids
			}
		});

		res.status(200).send({
			status: 'success',
			response: listOfMessages
		});
	} catch (err) {
		return res.status(500).send(err);
	}
}

exports.silentPush = async (req, res) => {

	ScheduleMessage.find((err, devices) => {
		if (!err && devices) {
			let androidDevices = [];
			devices.forEach(device => {
				if (device.platform === 'ios') {
					appleNotification.sendIos(device.deviceId);
				} else if (device.platform === 'android') {
					androidDevices.push(device.deviceId);
				}
			});

			androidNotification.sendAndroid(androidDevices);
			res.status(200).send({
				message: 'notification message send successfully'
			});
		} else {
			res.status(500).send(err);
		}
	});

}