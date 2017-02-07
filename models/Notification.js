/**
 * Created by arif on 28/12/16.
 */
'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Schema
var schema =  new Schema({

    from: {
        name: {type: String}
    },
    messageType: {type: String},
    message: {
        title: {type: String},
        text: {type: String}
    },
    userIds:{type:[String]},
    createdDate: {
        type: Date,
        require: true,
        default: Date.now
    }
});

// Model
var model = mongoose.model('Notification', schema);

// Public API
module.exports = model;