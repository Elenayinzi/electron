const { app, BrowserWindow, ipcMain, dialog } = require('electron')
const DataStore = require('./MusicDataStore')

const myStore = new DataStore({'name': 'Music Data'})

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
  mainWindow.webContents.on('did-finish-load',()=>{
    mainWindow.send('getTracks',myStore.getTracks())
  })

  //创建添加音乐窗口
  ipcMain.on('add-music-window',()=>{
    const addWindow = new AppWindow({
      width: 600,
      height: 400,
      parent: mainWindow
    },'./renderer/add.html')
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

  ipcMain.on('add-tracks', (event, tracks) => {
    const updatedTracks = myStore.addTracks(tracks).getTracks()
    mainWindow.send('getTracks', updatedTracks)
  })

  ipcMain.on('delete-track', (event, id) => {
    const updatedTracks = myStore.deleteTrack(id).getTracks()
    mainWindow.send('getTracks', updatedTracks)
  })

  //addWindow.webContents.openDevTools()
  //mainWindow.loadFile('index.html')
  // ipcMain.on('message',(event, arg) => {
  //   console.log(arg)
  //   //event.sender.send('reply','hello from main')
  //   event.reply('reply','hello from main')
  //   //mainWindow.send('reply','hello from main')
  // })
  // const Store = require('electron-store')
// console.log(app.getPath('userData'))
// const store = new Store()
// store.set('unicorn', '🦄')
// console.log(store.get('unicorn'))
// store.set('foo.bar', true)
// console.log(store.get('foo'))
// store.delete('unicorn');
// console.log(store.get('unicorn'))

})