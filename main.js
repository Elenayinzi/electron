const { app, BrowserWindow, ipcMain, dialog } = require('electron')

// const Store = require('electron-store')
// console.log(app.getPath('userData'))
// const store = new Store()
// store.set('unicorn', '🦄')
// console.log(store.get('unicorn'))
// store.set('foo.bar', true)
// console.log(store.get('foo'))
// store.delete('unicorn');
// console.log(store.get('unicorn'))


class AppWindow extends BrowserWindow  {
  constructor(config,fileLocation){
    const basicConfig = {
      width: 800,
      height: 600,
      webPreferences: {
        nodeIntegration: true    //允许使用node的API
      }
    }
    const finalConfig = { ...basicConfig, ...config}
    super(finalConfig)
    this.loadFile(fileLocation)
    this.once('ready-to-show', () => {
      this.show()
    })
  }
}

app.on('ready', () => {
  const mainWindow = new AppWindow({},'./renderer/index.html')

  ipcMain.on('add-music-window',()=>{
    const addWindow = new AppWindow({
      width: 600,
      height: 300,
      parent: mainWindow
    },'./renderer/add.html')
    //addWindow.webContents.openDevTools()
  })

  ipcMain.on('open-music-file', (event) => {

    dialog.showOpenDialog({
      properties: ['openFile', 'multiSelections'],
      filters: [{ name: 'Music', extensions: ['mp3'] }]
    }).then( result => {
      if(result.filePaths.length > 0) {
        event.sender.send('selected-file',result.filePaths)
      }
    })

  })

  //mainWindow.loadFile('index.html')
  // ipcMain.on('message',(event, arg) => {
  //   console.log(arg)
  //   //event.sender.send('reply','hello from main')
  //   event.reply('reply','hello from main')
  //   //mainWindow.send('reply','hello from main')
  // })

})