var MessengerConst = {};


MessengerConst.help = "help";
MessengerConst.emergencyStop = "緊急停止";
MessengerConst.restart = "再起動";
MessengerConst.idling = "アイドリング";
MessengerConst.tradestatus = "tradestatus起動";
MessengerConst.confirmTrade = "状況確認";
MessengerConst.confirmTradeFrom = "状況確認From";
MessengerConst.confirmTradeTo = "状況確認To";
MessengerConst.confirmBalance = "残高確認";
MessengerConst.confirmBalanceFrom = "残高確認From";
MessengerConst.confirmBalanceTo = "残高確認To";
MessengerConst.command = "command";
MessengerConst.commandexit = "commandexit";
MessengerConst.request = "request";

MessengerConst.helpMessage = "・緊急停止 : common/system/runningを'stop'に変更する" + "\n"
                        + "・再起動 : common/system/runningを'running'に変更する" + "\n"
                        + "・アイドリング : common/system/runningを'idle'に変更する" + "\n"
                        + "・状況確認 : 取引の利益率を確認できる" + "\n"
                        + "・command : command実行モードを実行する。commandexitを打つまではshellを実行する" + "\n"
                        + "・tradestatus起動 : tradestatus-timeを更新" + "\n"
                        + "・commandexit : command実行モードをexitする。" + "\n"
                        + "※下記コマンドでThink/Tradeを起動可能＊コマンドモードで実行" + "\n"
                        + "   sh candyStartShell";

MessengerConst.confirmFromMessage = "From When?" + "\n" + "YYYY-MM-DD HH:mmで入力してください。";

MessengerConst.confirmToMessage = "To When?" + "\n" + "YYYY-MM-DD HH:mmで入力してください。";

MessengerConst.requestStartMessage = "Start Request Mode";

MessengerConst.requestFinishMessage = "Finish Request Mode";

MessengerConst.commandStart = "commandモード開始";

MessengerConst.commandFinishMessage = "commandモード終了";

module.exports = MessengerConst;
