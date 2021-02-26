const { app, dialog, BrowserWindow } = require('electron')
const http = require('http')
const fs = require('fs')
const cp = require('child_process')
const path = require('path')
const url = require('url')
const appInfo = require('./package.json')

function checkVersion() {
  http.get('http://112.74.186.30:60004/api?method=listAppVer&type=teacher&status=1', function (res) {
    let all = ''
    res.on('data', chunk => all += chunk)
    res.on('end', function () {
      let latest = JSON.parse(all).data[0]
      let version = +appInfo.version.replace(/\./g, '')
      if (!latest) return
      if (latest.verIndex > version) update()
    })
  })
}

function updateVersion() {
  checkVersion()
}

function update() {
  dialog.showMessageBox({
    type: 'info',
    buttons: ['更新', '不更新'],
    title: '更新提醒!',
    message: '贝塔课堂有新的版本, 是否要更新',
    buttonLabel: '更新',
  }).then(res => {
    if (res.response == 0) downloadFile()
  }).catch(err => {
    console.log(err);
  })
}

function loadLoadingPage() {
  const loadDialog = new BrowserWindow({
    height: 300,
    modal: true,
    webPreferences: {
      nodeIntegration: true,
      webSecurity: false
    }
  })

  loadDialog.loadURL(url.format({
    pathname: path.join(__dirname, './loading.html'),
    protocol: 'file:',
    slashes: true
  }))

  return loadDialog
}

function downloadFile() {
  let exeUrl = 'http://mt.basewq.com/app/贝塔课堂安装包.exe'
  execDownload(exeUrl, loadLoadingPage())
}

function execDownload(url, loadingInstanse) {
  // let dirname = path.dirname(app.getAppPath())
  let dirname = require('os').tmpdir()
  let total_bytes = 0
  let received_bytes = 0

  http.get(url, function (res) {
    total_bytes = res.headers['content-length']
    // let uri = decodeURI(res.req.path)
    // let filename = uri.split('/').pop()
    // let out = path.join(dirname, filename)
    let out = path.resolve(dirname, 'qmteacher.exe')
    let percent = 0

    res.pipe(fs.createWriteStream(out))

    res.on('data', function (data) {
      received_bytes += data.length
      percent = (received_bytes / total_bytes * 100).toFixed(0)
      loadingInstanse.webContents.send('progress', percent)
    })

    res.on('end', function () {
      let cmd = `\"${out}\" /sp- /silent`
      setTimeout(function () {
        loadingInstanse.close()
        cp.exec(cmd).on('close', app.quit)
      }, 3000)
    })
  })
}

module.exports = {
  updateVersion
}