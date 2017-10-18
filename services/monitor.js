var _ = require('underscore');
var moment = require("moment");
var tools = require(__dirname + '/../util/tools.js');

var monitor = function(candyConfig, linenotify, setting){

    this.candyConfig = candyConfig;
    this.linenotify = linenotify;
    this.setting = setting;
    _.bindAll(this,
        'monitorcalculate',
        'monitorfilterEqual'
    );
};

//---EventEmitter Setup
var Util = require('util');
var EventEmitter = require('events').EventEmitter;
Util.inherits(monitor, EventEmitter);
//---EventEmitter Setup

/*
** @result  trade直下全てのデータ
*/
monitor.prototype.monitorcalculate = function(result,from,to){
    var subject =  "[Candy_LINE](" + from + "~" + to + ")" + "\n";
    var message = "";

    var datatime = moment().format("YYYY-MM-DD HH:mm:ss");
    var monitorlist = [];
    _.each(result,function(order,key){
        var pass = key;
        _.each(order,function(orderObj,key){
            var object = {
                datatime:datatime,
                pass : pass
            };
            var monitorObject =_.extend(object, orderObj);
            if(!monitorObject.formatedpair){
                monitorObject.formatedpair = monitorObject.pair
            }
            if(!monitorObject.formatedprice_exec){
                monitorObject.formatedprice_exec = monitorObject.price_exec
            }
            monitorlist.push(monitorObject);
        });
    }.bind(this));


    //
    var caluculateList = 
        _.filter(monitorlist, function(caluculatelist){
            return (
                /*
                moment(caluculatelist.datatime) < moment(caluculatelist.time).add(minus, minustype)
                */
                caluculatelist.time >= from
                && caluculatelist.time <= to
                && (caluculatelist.pass === "orderCompleted" || caluculatelist.pass === "orderFinished")
            ) 
        });

    var eachpairs = _.groupBy(this.monitorfilterEqual(caluculateList,"pass","orderCompleted") , function(obj){return (obj.formatedpair)});
    _.each(eachpairs,function(eachpair,pairkey){
        message = "";
        //BUY
        var buyList = this.monitorfilterEqual(eachpair,"result","BUY");
        //sizeとsize_execの抽出,金額計算
        var amount_buy = 0 ;
        var size_exec_buy = 0;
        _.each(buyList,function(buylist,key){
            amount_buy = amount_buy + tools.floor(Number(buylist.formatedprice_exec) * Number(buylist.size_exec), 7) * 1.0025;
            size_exec_buy = size_exec_buy + Number(buylist.size_exec);
        }.bind(this));

        //SELL
        var sellList = this.monitorfilterEqual(eachpair,"result","SELL");
        //sizeとsize_execの抽出,金額計算
        var amount_sell = 0 ;
        var size_exec_sell = 0;
        _.each(sellList,function(selllist,key){
            amount_sell = amount_sell + tools.floor(Number(selllist.formatedprice_exec) * Number(selllist.size_exec), 7) * 0.9975;
            size_exec_sell = size_exec_sell + Number(selllist.size_exec);
        }.bind(this));

        var amount_key = tools.floor(amount_sell - amount_buy, 9);
        var amount_settlement = tools.floor((tools.floor(size_exec_buy,7) - tools.floor(size_exec_sell,7)),7);

        message = message
             + "[" + pairkey + "]" + "\n"
             + " " +pairkey.split ("_")[1] + "：" + amount_key  +"\n"
             + " " + pairkey.split ("_")[0] + "：" + amount_settlement + "\n"
             //+ ' * 売数量(' + tools.floor(size_exec_sell,7) + ') - 買数量(' + tools.floor(size_exec_buy,7) + ') = ' + tools.floor((tools.floor(size_exec_sell,7) - tools.floor(size_exec_buy,7)),7) + "\n"
             + "\n";

        var eachexchanges = _.groupBy(eachpair , function(obj){
            return obj.exchange;
        });
        
        
        
        //各取引所の状況を取得
        _.each(eachexchanges,function(eachexchange,key){
            message = message
                 + "  " + "[" + key + "]" + "\n"
                 ;
            //各取引所毎のbuy/sell
            eachexchange = _.sortBy(eachexchange, 'result');
            var resultlists = _.groupBy(eachexchange , function(obj){
                return obj.result;
            });
            resultlists = 
            _.each(resultlists,function(resultlist,key){
                var eachexchangeSize = 0;
                _.each(resultlist,function(result,key){
                    console.log(eachexchangeSize + "  " + result.size_exec);
                    eachexchangeSize = eachexchangeSize + Number(result.size_exec);
                });
                message = message + "  " + "・" + key + ":" + tools.floor(eachexchangeSize,8) + "\n";
            });
            //eachexchange全体件数
            var eachexchangeListnum = eachexchange.length;
            //eachexchange済件数
            var eachexchangefinishednum = this.monitorfilterEqual(eachexchange,"pass","orderFinished").length;
            //eachexchange終了件数
            var eachexchangecompletednum = this.monitorfilterEqual(eachexchange,"pass","orderCompleted").length;
            //eachexchange pending件数
            var eachexchangependingnum = this.monitorfilterEqual(eachexchange,"status","pending").length;
            //eachexchange open件数
            var eachexchangeopennum = this.monitorfilterEqual(eachexchange,"status","open").length;
            //eachexchange canceled件数
            var eachexchangecancelednum = this.monitorfilterEqual(eachexchange,"status","canceled").length;
            //eachexchange expired件数
            var eachexchangeexpirednum = this.monitorfilterEqual(eachexchange,"status","expired").length;
            //eachexchange partclosed件数
            var eachexchangepartclosednum = this.monitorfilterEqual(eachexchange,"status","partclosed").length;
            //eachexchange closed件数
            var eachexchangeclosednum = this.monitorfilterEqual(eachexchange,"status","closed").length;
            var eachexchangependingpercent = isNaN(eachexchangependingnum / eachexchangeListnum) ? 0 : tools.round(eachexchangependingnum / eachexchangeListnum * 100, 1);
            var eachexchangeopenpercent = isNaN(eachexchangeopennum / eachexchangeListnum) ? 0 : tools.round(eachexchangeopennum / eachexchangeListnum * 100, 1);
            var eachexchangecanceledpercent = isNaN(eachexchangecancelednum / eachexchangeListnum) ? 0 : tools.round(eachexchangecancelednum / eachexchangeListnum * 100, 1);
            var eachexchangeexpiredpercent = isNaN(eachexchangeexpirednum / eachexchangeListnum) ? 0 : tools.round(eachexchangeexpirednum / eachexchangeListnum * 100, 1);
            var eachexchangepartclosedpercent = isNaN(eachexchangepartclosednum / eachexchangeListnum) ? 0 : tools.round(eachexchangepartclosednum / eachexchangeListnum * 100, 1);
            var eachexchangeclosedpercent = isNaN(eachexchangeclosednum / eachexchangeListnum) ? 0 : tools.round(eachexchangeclosednum / eachexchangeListnum * 100, 1);
            
            message = message
               //+ "  " + "・全体件数：" + eachexchangeListnum + "\n"
                 + "  " + "・未約定件数：" + eachexchangefinishednum + "\n"
                 + "  " + "・約定済件数：" + eachexchangecompletednum + "\n"
               //+ "  " + "■pending   :"+ eachexchangependingnum + "(" + eachexchangependingpercent + "%)" + "\n"
               //  +"  " + "■open      :" + eachexchangeopennum + "(" + eachexchangeopenpercent + "%)" + "\n"
               //  + "  " + "■canceled  :" + eachexchangecancelednum + "(" + eachexchangecanceledpercent + "%)" + "\n"
               //+ "  " + "■expired   :" + eachexchangeexpirednum + "(" + eachexchangeexpiredpercent + "%)" + "\n"
               //  + "  " + "■partclosed:" + eachexchangepartclosednum + "(" + eachexchangepartclosedpercent + "%)" + "\n"
                 + "  " + "・約定率    :" + eachexchangeclosednum + "(" + eachexchangeclosedpercent + "%)" + "\n"
                 + "\n";
        }.bind(this));

        console.log(subject + message);
        if(message !== "" && message !== undefined){
            this.linenotify.notify(subject + message);
        }else{
            this.linenotify.notify(subject + "表示するデータがありません。");
        }
    }.bind(this));

    subject =  "[Candy_LINE]" + "\n";
    message = "";
    //orderfail
    var orderfailedlist = [];
    _.each(result,function(allorder,key){
        var pass = key;
        if(pass === 'orderfailed'){
            _.each(allorder,function(orderfail,key){
                orderfailedlist.push(orderfail);
            });
        }
    }.bind(this));
    
    if(orderfailedlist.length > 0){
        message = message
            + 'orderfailed件数:' + orderfailedlist.length;
        console.log(subject + message);
        if(message !== "" && message !== undefined){
            this.linenotify.notify(subject + message);
        }else{
            this.linenotify.notify(subject + "表示するデータがありません。");
        }
    }

};

monitor.prototype.monitorfilterEqual = function(caluculateList,item,condition){
    return list = 
        _.filter(caluculateList, function(list){
            return (
                list[item] === condition
            ) 
        });
};



module.exports = monitor;
