// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const axios = require('axios');
const iconv = require('iconv-lite');

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
	var statusBar // = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right)
    var _sleep

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "ashares" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with  registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('extension.ash', function () {
		// The code you place here will be executed every time your command is executed

		// Display a message box to the user
		// vscode.window.showInformationMessage('Hello World!');

		// 读取配置参数
		var codes = vscode.workspace.getConfiguration().get('astock.code')
        console.log(codes)

        if (codes != "") {
			statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right)
			statusBar.text = '大牛股正在来的路上……'
			statusBar.command = 'extension.closeclose'
			statusBar.show()

			var codeArr = codes.split(",")

			var i = 0
			var len = codeArr.length
			_sleep = setInterval(function() {
				axios({
					method: 'get',
					url: 'http://hq.sinajs.cn/list=' + codeArr[i], // 'http://qt.gtimg.cn/q=sh600519',
					responseType: 'stream',
				}).then(function(res) {
					var chunks = []
					res.data.on('data', chunk=>{
						chunks.push(chunk)
					})

					res.data.on('end', ()=>{
						var buffer = Buffer.concat(chunks)
						// 通过iconv来进行转化
						var str = iconv.decode(buffer, 'gbk')
						console.log(str)
	
						eval(str)
	
						var arr = []
						eval('arr = ' + 'hq_str_' + codeArr[i] + ".split(',')")
						console.log(arr)

						// 涨跌幅（(现价 - 昨日收盘价) / 昨日收盘价）
						var upup = ((arr[3] - arr[2]) / arr[2] * 100).toFixed(2)
						statusBar.text = arr[0] + " - " + arr[3] + ' (' + upup + '%)' // - ' + arr[31]

						statusBar.color = 'gray'
						if (upup > 0) {
							statusBar.color = 'red'
						} else if (upup < 0) {
							statusBar.color = 'green'
						}

						i++
						if (i >= len) {
                            i = 0
						}

						// statusBar.command = 'extension.closeclose'
						statusBar.show()
					})
				})
			}, 3000)
		} else {
			vscode.window.showInformationMessage('请先配置股票代码！');
		}
	});

	let closeclose = vscode.commands.registerCommand('extension.closeclose', function () {
		statusBar.dispose()

		clearInterval(_sleep)
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