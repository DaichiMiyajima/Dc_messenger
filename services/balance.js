var _ = require('underscore');
var moment = require("moment");
var tools = require(__dirname + '/../util/tools.js');

var balance = function(candyConfig, linenotify, setting){

    this.candyConfig = candyConfig;
    this.linenotify = linenotify;
    this.setting = setting;
    _.bindAll(this,
        'balancecalculate'
    );
};

//---EventEmitter Setup
var Util = require('util');
var EventEmitter = require('events').EventEmitter;
Util.inherits(balance, EventEmitter);
//---EventEmitter Setup

/*
** @result  trade直下全てのデータ
*/
balance.prototype.balancecalculate = function(result,from,to){
    var subject =  "[Candy_LINE](From" + from + "~" + to + ")" + "\n";
    var message = "";
    var exchangeArray = [];
    var pairArray = [];
    //var datatime = moment().format("YYYY-MM-DD HH:mm:ss");
    var balancelist = [];
    _.each(result,function(allbalance, exchangeDB){
        exchangeArray.push(exchangeDB);
        _.each(allbalance,function(eachpairBalance, pair){
            var pair = pair;
            pairArray.push(pair);
            _.each(eachpairBalance,function(balance,key){
                var fromdiff = moment(balance.time).diff(moment(from));
                var todiff = moment(balance.time).diff(moment(to));
                var object = {
                    //datatime:datatime,
                    pair : pair,
                    exchange : exchangeDB,
                    fromdiff : Math.abs(fromdiff),
                    todiff : Math.abs(todiff)
                };
                var balanceObject =_.extend(object, balance);
                
                balancelist.push(balanceObject);
            });
        });
    }.bind(this));
    
    var uniqueExchangeArray = _.uniq(exchangeArray);
    var uniquePairArray = _.uniq(pairArray);
    var result = "Difference" + "\n";
    var messageFrom = "Around " + from + "\n";
    var messageTo = "Around " + to + "\n";
    _.each(uniquePairArray,function(pair){
        result = result + " " + pair + ":";
        messageFrom = messageFrom + "[" + pair + "]" + "\n";
        messageTo = messageTo + "[" + pair + "]" + "\n";
        var totalFrom = 0;
        var totalTo = 0;
        _.each(uniqueExchangeArray,function(exchange){
            var pairExchageBalance = _.where(balancelist, {pair: pair, exchange: exchange});
            var pairExchageBalanceAsc = _.sortBy(pairExchageBalance, 'fromdiff');
            var pairExchageBalanceDesc = _.sortBy(pairExchageBalance, 'todiff');
            if(pairExchageBalanceAsc[0]){
                messageFrom = messageFrom + "  " + exchange + ":" + pairExchageBalanceAsc[0].item + "\n"
                totalFrom = Number(totalFrom) + Number(pairExchageBalanceAsc[0].item)
            }
            if(pairExchageBalanceDesc[0]){
                messageTo = messageTo + "  " + exchange + ":" + pairExchageBalanceDesc[0].item + "\n";
                totalTo = Number(totalTo) + Number(pairExchageBalanceDesc[0].item)
            }
        });
        var resultnum = Number(totalTo) - Number(totalFrom);
        result = result + tools.floor(resultnum, 8) +"\n";
        messageFrom = messageFrom + "  -----------------" + "\n" + "  total:" + tools.floor(totalFrom, 8) + "\n";
        messageTo = messageTo + "  -----------------" + "\n" + "  total:" + tools.floor(totalTo, 8) + "\n";
    });

    message = result + "\n" + messageFrom + "\n" + messageTo;

    console.log(message);

    if(message !== "" && message !== undefined){
        this.linenotify.notify(subject + message);
    }else{
        this.linenotify.notify(subject + "表示するデータがありません。");
    }

};

module.exports = balance;
