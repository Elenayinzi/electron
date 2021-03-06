const { ipcRenderer } = require('electron')
const { $ } = require('./helper')

let musicAudio = new Audio()
let allTracks
let currentTrack

$('add-music-button').addEventListener('click',()=>{
    ipcRenderer.send('add-music-window')
})
const renderListHTML = (tracks) => {
    const tracksList = $('tracksList')
    const trackListHTML = tracks.reduce((html, track) => {
        html += `<li class="row music-track list-group-item d-flex justify-content-between align-items-center">
            <div class="col-10">
                <i class="fas fa-music mr-2 text-secondary"></i>
                <b>${track.fileName}</b>
            </div>
            <div class="col-2">
                <i class="fas fa-play mr-3" data-id="${track.id}"></i>
                <i class="fas fa-trash" data-id="${track.id}"></i>
            </div>
        </li>`
        return html
    },'')
    const emptyTrackHTML = '<div class="alert alert-primary">还没有添加任何音乐</div>'
    tracksList.innerHTML = tracks.length ? `<ul class="list-group">${trackListHTML}</ul>`:emptyTrackHTML
}
ipcRenderer.on('getTracks',(event, tracks) => {
    allTracks = tracks
    renderListHTML(tracks)
})

$('tracksList').addEventListener('click',(event)=>{
    event.preventDefault()
    const { dataset, classList } = event.target
    const id = dataset && dataset.id
    if(id && classList.contains('fa-play')){
        //是当前音乐则继续播放
        if(currentTrack && currentTrack.id === id) {
            musicAudio.play()
        } else {
            //播放音乐
            currentTrack = allTracks.find(track => track.id === id)
            musicAudio.src = currentTrack.path
            musicAudio.play()
            const resetIconEle = document.querySelector('.fa-pause')
            if(resetIconEle) {
                resetIconEle.classList.replace('fa-pause', 'fa-play')
            }
        } 
        classList.replace('fa-play', 'fa-pause')
    } else if (id && classList.contains('fa-pause')) {
        //暂停播放
        musicAudio.pause()
        classList.replace('fa-pause', 'fa-play')
    } else if (id && classList.contains('fa-trash')) {
        //删除
        ipcRenderer.send('delete-track',id)
    }
})