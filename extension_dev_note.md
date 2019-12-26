## vscode插件开发

#### 关于vscode
众所周知，vscode基于electron开发，electron由chromium内核和node.js V8引擎构建。
所以，vscode的插件使用javascript编写。

---

#### 插件开发
- [官方文档](https://code.visualstudio.com/api)

- 安装脚手架
```
# 全局安装Yeoman（脚手架搭建工具）和vscode插件框架生成器
npm install -g yo generator-code
```

- 运行脚手架
```
# 选择配置项目信息
yo code
```
选择完成后，会在当前目录下，生成开发框架。

- 框架结构
配置文件： `package.json`  
开发文件： `extension.js`  

- 开发
1. 编写代码
逻辑代码直接写在`extension.js`，文件内有两个方法：  
`activate`插件激活时触发，`deactivate`插件释放时触发。
```
let testc = vscode.commands.registerCommand('extension.testc', function () {
    vscode.window.showInformationMessage('Hello World!');
});
```
\* 依赖安装和普通前端项目一样，例如安装`axios`
```
# 安装axios
npm install axios
```
```
# extension.js文件中调用
const axios = require('axios')
```
\* vscode开放了很多接口，编辑器样式的修改必须通过接口完成，不能直接通过html自定义

2. 命令注册
在`package.json`文件中注册命令
```
"commands": [
    {
        "command": "extension.testc",
        "title": "testc"
    }
],
"activationEvents": [
    "onCommand:extension.testc"
],
```

- 调试
`F5`

---

#### 打包发布

- 打包
```
# 安装打包工具
npm install -g vsce
# 项目目录下运行打包命令
vsce package
```
打包完成后，会在目录下生成`*.vsix`文件，即为插件包。

- 安装
Extensions -> 右上角 `...` -> Install from VSIX...

---

** * [参考博客](http://blog.haoji.me/vscode-plugin-overview.html) **