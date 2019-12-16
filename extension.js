const vscode = require('vscode');
const axios = require('axios');
const iconv = require('iconv-lite');

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
    var statusBar, loop

    console.log('Congratulations, your extension "ashares" is now active!');

    // 定义插件启动命令
    let disposable = vscode.commands.registerCommand('extension.ash', function () {
        // 读取配置参数
        var codes = vscode.workspace.getConfiguration().get('astock.code')

        if (codes != "") { // 股票代码不空
            // 初始化状态栏对象
            statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right)
            statusBar.text = '大牛股正在来的路上……'
            // 定义状态栏点击事件，点击关闭插件
            statusBar.command = 'extension.closeclose'
            statusBar.show()

            // 多个股票代码通过逗号截取
            var codeArr = codes.split(",")

            var i = 0, len = codeArr.length

            // 定时刷新股票数据
            loop = setInterval(function() {
                // 请求新浪股票接口获取实时股票信息
                axios({
                    method: 'get',
                    url: 'http://hq.sinajs.cn/list=' + codeArr[i], // 'http://qt.gtimg.cn/q=sh600519',
                    responseType: 'stream',
                }).then(function(res) { // 由于新浪接口返回的数据为gbk格式，中文出现乱码，所以进行了繁琐的处理
                    /* gbk中文乱码处理 start */
                    var chunks = []
                    res.data.on('data', chunk=>{
                        chunks.push(chunk)
                    })
                    /* gbk中文乱码处理 end */

                    res.data.on('end', ()=>{
                        var buffer = Buffer.concat(chunks)
                        // 通过iconv来进行转化
                        var str = iconv.decode(buffer, 'gbk')
                        /* gbk中文乱码处理 end */

                        // 接口返回的数据是一串js代码，eval方法直接把字符串当成js代码来执行
                        // 接口返回的格式类似于 var hq_str_sh600050="中国联通,0.000,5.740,5.740,0.000,0.000,5.750,5.750,0,0.000";
                        eval(str)
                        // 将配置参数中的字符串股票代码，通过eval，拼接截取
                        var arr = []
                        eval('arr = ' + 'hq_str_' + codeArr[i] + ".split(',')")

                        // 涨跌幅（(现价 - 昨日收盘价) / 昨日收盘价）
                        var upup = ((arr[3] - arr[2]) / arr[2] * 100).toFixed(2)

                        // 将接口返回的股票信息拼接，赋给状态栏
                        // arr[0] 股票名称（中文） arr[3] 当前价格 arr[2] 昨日收盘价
                        statusBar.text = arr[0] + " - " + arr[3] + ' (' + upup + '%)'

                        // 状态栏颜色处理 平灰 涨红 跌绿
                        statusBar.color = 'gray'
                        if (upup > 0) {
                            statusBar.color = 'red'
                        } else if (upup < 0) {
                            statusBar.color = 'green'
                        }

                        // 多个股票代码，顺序切换
                        i++
                        if (i >= len) {
                            i = 0
                        }

                        // 更新显示在状态栏
                        statusBar.show()
                    })
                })
            }, 3000) // 每3秒刷新一次
        } else { // 股票代码为空
            // 弹窗提示
            vscode.window.showInformationMessage('请先配置股票代码！');
        }
    });

    // 定义关闭方法
    let closeclose = vscode.commands.registerCommand('extension.closeclose', function () {
        // 关闭定时器
        clearInterval(loop)
        // 回收状态栏
        statusBar.dispose()
        context.subscriptions.push(disposable)
    });

    context.subscriptions.push(closeclose);
}

exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {}

module.exports = {
    activate,
    deactivate
}