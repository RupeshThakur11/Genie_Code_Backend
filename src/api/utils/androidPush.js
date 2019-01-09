const gcm = require('node-gcm');

const {
    serverkey
} = require('../../config/vars');

var sender = new gcm.Sender(serverkey);
exports.sendAndroid= (devices) =>{
    let message = new gcm.Message({
        notification : {
            title : 'Hello, you are revealed successfully!'
        }
    });

    
    sender.send(message, {
        registrationTokens : devices
    }, (err, response) =>{
        if (err) {
            console.error(err);
        } else {
            console.log(response);
        }
    });
}