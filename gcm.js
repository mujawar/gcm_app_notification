'use strict';

var express = require('express');
var app = express();
var mongoose = require('mongoose');
var bodyParser     = require('body-parser');
var io = require("socket.io");  // socket io server
var gcm = require('node-gcm'); // Node GCM
var config = require('./config/dev.json');
var mongooseTypes = require('mongoose').Types;
var db = require('./config/dev.json').db;
var Notification = require('./models/Notification');
var MobileNotificationToken = require('./models/MobileNotificationToken');

app.use(bodyParser.json()); // parse application/json
app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json
app.use(bodyParser.urlencoded({ extended: true })); // parse application/x-www-form-urlencoded

app.use(bodyParser.json());

/*------------------------------------------- main process ------------------------------*/
mongoose.connect('mongodb://' + config.db.mongo.host + '/' + config.db.mongo.db);

/*mongoose.connection.on('connected', function (err, db) {
    console.log(new Date() +' @ MongoDB: Successfully connected to: ' + 'mongodb://'+config.db.mongo.host+'/'+config.db.mongo.db);
    getGCMTokens(db, function(tokens){ // Get Tokens
        delete doc._id;
        db.collection('notifications', function(err, collection) { // Save doc in DB
            collection.insert(doc, function(err, result) {
                console.log('Saved Doc - status:', err, '| Sending notification: ', doc);
                sendNotification(doc, tokens); // Send Notification
            });
        });
    });

});*/

app.post('/sendNotification',function(req) {
    console.log('req.body============', req.body)
    var notification = {
        from: {
            name: req.body.from.name
        },
        message: {
            title:req.body.message.title,
            text:req.body.message.text

        },
        messageType: 'MDX_PROMOTION',
        userIds: req.body.userIds,

    };
    console.log('All---->', JSON.stringify(notification));
     Notification.create(notification, function (error, newNotification) {
        console.log('Notification created in db---->', JSON.stringify(newNotification));
         sendalldocs(newNotification);
       // publishers.publishMessageToChannel({channelName: 'NFS_CHANNEL', messageID: newNotification._id});
    });
});


function getGcmToken(alldocs) {
    var users = [];
    console.log('alldocs',alldocs.userIds);
    MobileNotificationToken.find({userId: {$in:mongooseTypes.ObjectId(alldocs.userIds[0])}},function (err, coll) { // ID to GCM tokens
        console.log('coll=================' + JSON.stringify(coll));
        var docgcm = coll;
        docgcm.forEach(function(doc) {
            if (doc && doc.gcmToken) {
                users.push(doc.gcmToken);
            }
        });
        console.log('users token=================' +JSON.stringify(users));
        sendNotification(docgcm,alldocs,users);

    })
}
function sendalldocs(alldocs) {
    getGcmToken(alldocs);

}


function sendNotification(userdoc,alldocs,tokens) {

        console.log('callinf sendNotification userdoc--------' + JSON.stringify(userdoc));
         console.log('sendalldocs--------' + JSON.stringify(alldocs));
    console.log('tokens--in sendnot------' + JSON.stringify(tokens));
        var sender = new gcm.Sender(/*insert ur token gere*/);
        if (alldocs && alldocs.message) {
            var message = new gcm.Message({
                collapseKey: 'Medibox',
                delayWhileIdle: true,
                timeToLive: 3000,
                data: {title: alldocs.message.title, message: alldocs.message.text}
            });
        }
        console.log('message',message);
        if (tokens.length) {
            sender.send(message, tokens, 4, function (err, result) {
                if (err) console.log('Error:', err);
                else console.log('Result:', result);
            });
        }
        console.log('messge sent', message, tokens);

}

app.listen(8000);
console.log('server started at 8000 port');