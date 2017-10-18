var _ = require('underscore');
var moment = require("moment");

var firebase = function(config, setting){

    var admin = require("firebase-admin");
    this.admin = admin;
    var serviceAccount = require(__dirname + "/../config/digitalcurrency-72f17-firebase-adminsdk-fu9sz-cb367e2a26.json");
    this.changeflg = 0;
    this.changeBalanceflg = 0;
    this.setting = setting;
    
    //to check if Firebase has already been initialized.
    if (admin.apps.length === 0) {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            databaseURL: config.databaseURL
        });
    }

    // As an admin, the app has access to read and write all data, regardless of Security Rules
    this.FirebaseAccess = admin.database().ref();

    _.bindAll(this,
        'changeMonitor',
        'getOrderedAllInfo',
        'changeBalance',
        'getBalanceAllInfo',
        'referArray',
        'linenotify',
        'updateItem'
    );

};

//---EventEmitter Setup
var Util = require('util');
var EventEmitter = require('events').EventEmitter;
Util.inherits(firebase, EventEmitter);
//---EventEmitter Setup

firebase.prototype.changeMonitor = function(){
    this.FirebaseAccess.child(this.setting.tradepass).on("value", function(snapshot) {
        this.changeflg = 1;
    }.bind(this), function (errorObject) {
        console.log("The read failed: " + errorObject.code);
    });
}

firebase.prototype.getOrderedAllInfo = function(cb){
    this.FirebaseAccess.child(this.setting.tradepass).once("value",function(snapshot) {
        var data = snapshot.val();
        if(!cb){
            if(this.changeflg === 1){
                this.emit("getOrderedAllInfo", data);
                this.changeflg = 0;
            }
        }else{
            cb(data);
        }
    }.bind(this), function (errorObject) {
        console.log("The read failed: " + errorObject.code);
    });
}

firebase.prototype.changeBalance = function(){
    this.FirebaseAccess.child(this.setting.balancepass).on("value", function(snapshot) {
        this.changeBalanceflg = 1;
    }.bind(this), function (errorObject) {
        console.log("The read failed: " + errorObject.code);
    });
}

firebase.prototype.getBalanceAllInfo = function(){
    this.FirebaseAccess.child(this.setting.balancepass).once("value",function(snapshot) {
        var data = snapshot.val();
        if(this.changeBalanceflg === 1){
            this.emit("getBalanceAllInfo", data);
            this.changeBalanceflg = 0;
        }
    }.bind(this), function (errorObject) {
        console.log("The read failed: " + errorObject.code);
    });
}

firebase.prototype.referArray = function(pass, cb){
    this.FirebaseAccess.child(pass).once("value").then(function(snapshot) {
        var array = snapshot.val();
        if(cb){
            cb(array);
        }
    }.bind(this), function (errorObject) {
        console.log("The read failed: " + errorObject.code);
    });
}

firebase.prototype.linenotify = function(){
    this.FirebaseAccess.child(this.setting.linepass).on("child_added", function(snapshot) {
        var data = snapshot.val();
        this.emit("lineadd", data);
    }.bind(this), function (errorObject) {
        console.log("The read failed: " + errorObject.code);
    });
}

firebase.prototype.updateItem = function(item, pass, cb){
    var args = arguments;
    this.FirebaseAccess.child(pass).update(item, cb(pass + ":" + item));
};

module.exports = firebase;
