var setting = {};

setting.parentpass = 'production/'
setting.commonpass = setting.parentpass + 'common'
setting.systempass = setting.commonpass + '/system'
setting.systemkey = 'system'
setting.runningpass = setting.systempass + '/running';
setting.linepass = setting.systempass + '/line';
setting.tradestatus = 'tradestatus';
setting.tradestatuspass = setting.systempass + '/tradestatus';
setting.requestpass = setting.systempass + '/Request';

setting.analysispass = 'analysis';

setting.thinkpass = setting.parentpass + 'think'
setting.balancepass = setting.thinkpass + '/chart/balance';
setting.notyetpass = setting.thinkpass + '/order';

setting.tradepass = setting.parentpass + 'trade';
setting.finishedpass = setting.tradepass + '/orderFinished';
setting.completedpass = setting.tradepass + '/orderCompleted';
setting.orderFailedPass = setting.tradepass + '/orderfailed';


module.exports = setting;
