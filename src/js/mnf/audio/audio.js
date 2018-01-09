import Signal from 'mnf/Signal'

class Audio {

	constructor() {
		this.context = new (window.AudioContext || window.webkitAudioContext)()
		this.masterGain = this.context.createGain()

		this.volume = 0
		this.globalVolume = 1

		this.currentPlay = -1
		this.isPlaying = false
	}

	start({ 
			onLoad = null, 
			autoPlay=true, 
			live = true,
			debug = false, 
			playlist = ["audio/galvanize.mp3"], 
			mute = false, 
			analyze = true
		} = {}) {

		this.debug = debug
		this.playlist = playlist
		this.live = live
		this.autoPlay = autoPlay

		if (!live) {
			if (!mute) {
				this.masterGain.connect(this.context.destination)
			}
			this.playNext()
			if (onLoad) {
				onLoad()
			}
		}
		else {
			navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
			navigator.getUserMedia({ audio: true, video: false },
				(stream) => {
					let mediaStream = this.context.createMediaStreamSource(stream);
					let tracks = stream.getAudioTracks()
					mediaStream.connect(this.masterGain)
					if (onLoad) {
						onLoad()
					}
				},
				(e) => console.log('fail load stream\n', e)
			)
		}
	}

	play = (time=0)=>{
		if(this.isPlaying){
			return
		}
		this.audio.play()
		this.audio.currentTime = time
		this.isPlaying = true
	}

	pause = ()=>{
		if(!this.isPlaying){
			return
		}
		this.audio.pause()
		this.isPlaying = false
	}

	playNext = () => {
		this.isPlaying = false
		this.currentPlay++
		this.currentPlay %= this.playlist.length
		
		this.audio = document.createElement('audio')
		this.audio.src = this.playlist[this.currentPlay]
		this.audio.loop = false
		this.audio.addEventListener('ended', this.playNext)

		if (this.audioSource) {
			this.audioSource.disconnect(this.masterGain)
		}

		this.audioSource = this.context.createMediaElementSource(this.audio)
		this.audioSource.connect(this.masterGain)
		if(this.autoPlay){
			this.play()
		}	
	}
}

const audio = new Audio()
export default audio 
export {audio}
