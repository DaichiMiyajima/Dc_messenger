var _ = require('underscore');
var moment = require("moment");
const line = require('@line/bot-sdk');

var linenotify = function(candyConfig, setting){

    this.candyConfig = candyConfig;
    this.setting = setting;
    this.client = new line.Client({
        channelAccessToken: candyConfig.channelToken
    });

    this.lastmessage = "";
    this.from = "";
    this.to = "";

    _.bindAll(this,
        'notifyMonitor',
        'notify',
        'reply'
    );
};

linenotify.prototype.notifyMonitor = function(data){
    var datatime = moment(data.time,"YYYY-MM-DD HH:mm:SSS").add(1,"minutes").format();
    if(datatime && datatime >= moment().format()){
        if(data.system !== undefined && data.message !== undefined){
            var systemMessage = "[" + data.system + "]\n" + data.message;
            const message = {
                type: 'text',
                text: systemMessage
            };
            this.client.pushMessage(this.candyConfig.groupId, message).then(() => {
            }).catch((err) => {
                // error handling
                console.log(err);
            });
        }
    }
};

linenotify.prototype.notify = function(message){
    const messages = {
        type: 'text',
        text: message
    };

    this.client.pushMessage(this.candyConfig.groupId, messages).then(() => {
        console.log("success!");
    }).catch((err) => {
        // error handling
        console.log(err);
    });
};

linenotify.prototype.reply = function(replyToken,message){
    const messages = {
        type: 'text',
        text: message
    };

    this.client.replyMessage(replyToken, messages).then(() => {
    }).catch((err) => {
        // error handling
        console.log(err);
    });
};

module.exports = linenotify;