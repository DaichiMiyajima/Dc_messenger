var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');
var app = express();
var admin = require("firebase-admin");
var config = require(__dirname + '/config.js');
var config = config.init();
var moment = require("moment");
var _ = require('underscore');
const line = require('@line/bot-sdk');
var moment = require("moment");
var execSync = require('child_process').execSync;
var firebaseService = require(__dirname + '/services/firebase.js');
var monitorService = require(__dirname + '/services/monitor.js');
var balanceService = require(__dirname + '/services/balance.js');
var linenotifyService = require(__dirname + '/services/linenotify.js');
var setting = require('./setting.js');
var MessengerConst = require('./MessengerConst.js');

// POSTでdataを受け取るための記述
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var serviceAccount = require(__dirname + "/config/digitalcurrency-72f17-firebase-adminsdk-fu9sz-cb367e2a26.json");
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: config.databaseURL
});

var ref = admin.database().ref();

var firebase = new firebaseService(config, setting);
var linenotify = new linenotifyService(config, setting);
var monitor = new monitorService(config, linenotify, setting);
var balance = new balanceService(config, linenotify, setting);

firebase.changeMonitor();
setInterval(firebase.getOrderedAllInfo, 30 * 60 * 1000);
firebase.changeBalance();
setInterval(firebase.getBalanceAllInfo, 30 * 60 * 1000);
firebase.linenotify();
firebase.changeAnalysisMonitor();
setInterval(firebase.analysis, 30 * 60 * 1000);

firebase.on('getOrderedAllInfo', function(result){
   monitor.monitorcalculate(result,"2018-01-01","2030-12-31");
});

firebase.on('getBalanceAllInfo', function(result){
   balance.balancecalculate(result,"2018-01-01","2030-12-31");
});

firebase.on('lineadd', function(result){
    linenotify.notifyMonitor(result);
});

firebase.on('analysischange', function(result){
    var data = {
        message : JSON.stringify(result,undefined,4),
        system : 'Analysis',
        time : moment().format("YYYY-MM-DD HH:mm:ss")
    };
    linenotify.notifyMonitor(data);
});

app.post('/', function(req, res){
    res.status(200).end();
    var message;
    for (var event of req.body.events){
        if(event.type == 'message'){
            if (event.message.text == MessengerConst.help){
                linenotify.reply(event.replyToken,MessengerConst.helpMessage);
            }else if (event.message.text == MessengerConst.emergencyStop){
                firebase.updateItem({running:"stop"}, setting.systempass,function(message){
                    linenotify.reply(event.replyToken,JSON.stringify(message,undefined,1));
                });
            }else if (event.message.text == MessengerConst.restart){
                firebase.updateItem({running:"running"}, setting.systempass,function(message){
                    linenotify.reply(event.replyToken,JSON.stringify(message,undefined,1));
                });
            }else if (event.message.text == MessengerConst.idling){
                firebase.updateItem({running:"idle"}, setting.systempass,function(message){
                    linenotify.reply(event.replyToken,JSON.stringify(message,undefined,1));
                });
            }else if (event.message.text == MessengerConst.tradestatus){
                firebase.updateItem({time:moment().format("YYYY-MM-DD HH:mm:ss")}, setting.tradestatuspass,function(message){
                    linenotify.reply(event.replyToken,JSON.stringify(message,undefined,1));
                });
            }else if(event.message.text == MessengerConst.confirmTrade){
                linenotify.lastmessage = MessengerConst.confirmTradeFrom;
                linenotify.reply(event.replyToken, MessengerConst.confirmFromMessage);
            }else if(linenotify.lastmessage == MessengerConst.confirmTradeFrom){
                linenotify.lastmessage = MessengerConst.confirmTradeTo;
                linenotify.from = event.message.text;
                linenotify.reply(event.replyToken, MessengerConst.confirmToMessage);
            }else if(linenotify.lastmessage == MessengerConst.confirmTradeTo){
                linenotify.lastmessage = "";
                firebase.getOrderedAllInfo(function(result){
                    monitor.monitorcalculate(result,linenotify.from,event.message.text)
                });
            }else if(event.message.text == MessengerConst.confirmBalance){
                linenotify.lastmessage = MessengerConst.confirmBalanceFrom;
                linenotify.reply(event.replyToken, MessengerConst.confirmFromMessage);
            }else if(linenotify.lastmessage == MessengerConst.confirmBalanceFrom){
                linenotify.lastmessage = MessengerConst.confirmBalanceTo;
                linenotify.from = event.message.text;
                linenotify.reply(event.replyToken, MessengerConst.confirmToMessage);
            }else if(linenotify.lastmessage == MessengerConst.confirmBalanceTo){
                linenotify.lastmessage = "";
                firebase.referArray(setting.balancepass, function(result){
                    balance.balancecalculate(result,linenotify.from,event.message.text)
                });
            }else if(event.message.text == MessengerConst.command){
                linenotify.lastmessage = MessengerConst.command;
                linenotify.reply(event.replyToken, MessengerConst.commandStart);
            }else if(linenotify.lastmessage == MessengerConst.command && event.message.text != MessengerConst.commandexit){
                try{
                    var result =  execSync(event.message.text);
                    linenotify.reply(event.replyToken,result.toString());
                }catch(err){
                    var errormessage = err.stdout.toString() + "\n"
                                     + err.stderr.toString() + "\n"
                                     + MessengerConst.commandFinishMessage;
                    linenotify.lastmessage = "";
                    linenotify.reply(event.replyToken, errormessage);
                }
            }else if(event.message.text == MessengerConst.commandexit){
                linenotify.lastmessage = "";
                linenotify.reply(event.replyToken, MessengerConst.commandFinishMessage);
            }else if(event.message.text == MessengerConst.request){
                linenotify.lastmessage = MessengerConst.request;
                linenotify.reply(event.replyToken, MessengerConst.requestStartMessage);
            }else if(linenotify.lastmessage == MessengerConst.request){
                linenotify.lastmessage = "";
                firebase.updateItem(
                    {
                        request: event.message.text,
                        time : moment().format("YYYY-MM-DD HH:mm:ss")
                    },
                    setting.requestpass,
                    function(message){
                        linenotify.reply(event.replyToken,JSON.stringify(message,undefined,1));
                        linenotify.reply(event.replyToken, MessengerConst.requestFinishMessage);
                    }
                );
            }
        }
    }
});

var port = "3035";
app.set('port', port);

module.exports = app;
