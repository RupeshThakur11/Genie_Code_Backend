const Conversation = require('../models/conversation'),
  Message = require('../models/message'),
  User = require('../models/user.model');


exports.getConversations = function(req, res, next) {
  Conversation.find({
      participants: {
        $in: [req.body.id]
      }
    })
    .select('_id, participants')
    .exec((err, conversations) => {
      if (err) {
        res.send({
          error: err
        })
        return next(err)
      }

      return res.status(200).json(conversations)
    })
}

exports.getConversation = function(req, res, id) {
  Conversation.findOne({
      _id: req.params.id,
      participants: {
        $in: [req.body.id]
      }
    })
    .then(conversation => {
      if (conversation) {
        Message.find({
            conversationId: conversation._id
          })
          .select('createdAt body author')
          .then(messages => {
            return res.status(200).json(messages)
          })
      }
    })
}

exports.newConversation = function(req, res, next) {
  if (!req.body.recipient) {
    res.status(422).send({
      error: 'Please choose a valid recipient for your message.'
    })
    return next()
  }

  Conversation.findOne({
    participants: {
      $all: [req.body.id, req.body.recipient]
    }
  }, (err, existingConversation) => {
    if (err) {
      return next(err)
    }

    if (existingConversation) {
      Message.find({
          conversationId: existingConversation._id
        })
        .select('createdAt body author')
        .then(messages => {
          const data = existingConversation.toJSON()
          data.messages = messages
          return res.status(200).json(data)
        })
    } else {
      const conversation = new Conversation({
        participants: [req.body.id, req.body.recipient]
      })

      conversation.save((err, newConversation) => {
        if (err) {
          res.send({
            error: err
          })
          return next(err)
        }

        // Default Welcome message
        const message = new Message({
          conversationId: newConversation._id,
          body: 'I am inviting you to start conversation with me', // later on we can set permission to accpet/declient chat invitation
          author: req.body.id
        })

        message.save((err, newMessage) => {
          if (err) {
            res.send({
              error: err
            })
            return next(err)
          }

          return res.status(200).json(newConversation)
        })
      })
    }
  })
}


exports.sendReply = function (req, res, next) {
  const newMessage = req.body.body

  if (!newMessage) {
    return res.status(422).send({ error: 'Message body is required!' })
  }

  const reply = new Message({
    conversationId: req.params.conversationId,
    body: newMessage,
    author: req.body.id
  })

  reply.save((err, sentReply) => {
    if (err) {
      res.send({ error: err })
      return next(err)
    }

    return res.status(200).json(reply)
  })
}
