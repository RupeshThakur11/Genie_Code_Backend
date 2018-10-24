Promise = require('bluebird'); 
const { port, env } = require('./config/vars');
const app = require('./config/express');
const mongoose = require('./config/mongoose');

// open mongoose connection
mongoose.connect();

// listen to requests
app.listen(port, () => console.info(`server started on port ${port} (${env})`));

/**
* Exports express
* @public
*/
module.exports = app;
