Promise = require('bluebird'); 
const { port, env } = require('./config/vars');
const app = require('./config/express');
const http = require('http').Server(app);
const io = require('socket.io')(http);
const socketEvents = require('./config/socketEvents')
const mongoose = require('./config/mongoose');

// open mongoose connection
mongoose.connect();

// listen to requests
// app.listen(port, () => console.info(`server started on port ${port} (${env})`));

let server = app.listen(port, () => {
 console.log(`server started on port ${port}`);
});

socketEvents(io);
/**
* Exports express
* @public
*/
module.exports = app;