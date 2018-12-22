const _ = require('lodash');
const ScheduleMessage = require('../models/scheduledMessage.model');
const User = require('../models/user.model');
const schedule = require('node-schedule');
const crontab = require('node-crontab');



const handleError = (res, err) =>{
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
			return res.status(200).send({
				status: 'success',
				response: messages
			})
		}
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
		return res.status(201).json(messages);
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