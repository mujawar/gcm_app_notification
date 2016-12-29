/**
 * Created by arif on 28/12/16.
 */
'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Schema
var schema = new Schema({
    deviceType:{type:String, require: true},
    userId:{type: Schema.Types.ObjectId, require: true},
    gcmToken:{type: String, require: true}
});


var model = mongoose.model('MobileNotificationToken', schema);

// Public API
module.exports = model;