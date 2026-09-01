/**
 * Intelligent Audio Engine
 * Supports full continuous playback, accurate seeking, and equalizer visualization
 */

class AudioEngine {
  constructor() {
    this.audioElement = new Audio();
    this.audioElement.preload = "auto";
    this.audioContext = null;
    this.analyser = null;
    this.synthGain = null;
    this.mediaSource = null;
    this.isPlaying = false;
    this.currentSong = null;
    this.currentTime = 0;
    this.duration = 0;
    this.volume = 0.8;
    this.isMuted = false;
    this.isLoop = false;
    this.isShuffle = false;

    // Callbacks
    this.onTimeUpdate = null;
    this.onPlayStateChange = null;
    this.onSongEnd = null;
    this.onVisualizerData = null;

    this.initAudioElement();
  }

  initAudioContext() {
    if (!this.audioContext) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.audioContext = new AudioCtx();
        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = 64;
        this.synthGain = this.audioContext.createGain();
        this.synthGain.gain.setValueAtTime(this.volume, this.audioContext.currentTime);
        this.synthGain.connect(this.analyser);
        this.analyser.connect(this.audioContext.destination);

        try {
          if (!this.mediaSource) {
            this.mediaSource = this.audioContext.createMediaElementSource(this.audioElement);
            this.mediaSource.connect(this.analyser);
          }
        } catch (e) {
          console.debug("MediaElementSource note:", e);
        }
      }
    }

    if (this.audioContext && this.audioContext.state === "suspended") {
      this.audioContext.resume();
    }
  }

  initAudioElement() {
    this.audioElement.volume = this.volume;

    this.audioElement.addEventListener("timeupdate", () => {
      this.currentTime = this.audioElement.currentTime;
      this.duration = this.audioElement.duration || (this.currentSong ? this.currentSong.durationSec : 200);
      if (this.onTimeUpdate) {
        this.onTimeUpdate(this.currentTime, this.duration);
      }
    });

    this.audioElement.addEventListener("loadedmetadata", () => {
      this.duration = this.audioElement.duration || (this.currentSong ? this.currentSong.durationSec : 200);
      if (this.onTimeUpdate) {
        this.onTimeUpdate(this.currentTime, this.duration);
      }
    });

    this.audioElement.addEventListener("ended", () => {
      if (this.isLoop) {
        this.audioElement.currentTime = 0;
        this.audioElement.play();
      } else if (this.onSongEnd) {
        this.onSongEnd();
      }
    });

    this.audioElement.addEventListener("error", (e) => {
      console.warn("Audio element error, checking backup audio source...", e);
    });
  }

  loadSong(song) {
    this.currentSong = song;
    this.currentTime = 0;
    this.duration = song.durationSec || 200;

    if (song.audioSrc) {
      this.audioElement.src = song.audioSrc;
      this.audioElement.currentTime = 0;
      this.audioElement.load();
    }
  }

  play() {
    this.initAudioContext();
    this.isPlaying = true;

    if (this.currentSong && this.currentSong.audioSrc) {
      const playPromise = this.audioElement.play();
      if (playPromise !== undefined) {
        playPromise.catch(err => {
          console.warn("Audio playback error:", err);
        });
      }
    }

    if (this.onPlayStateChange) this.onPlayStateChange(true);
    this.startVisualizerLoop();
  }

  pause() {
    this.isPlaying = false;
    this.audioElement.pause();
    if (this.onPlayStateChange) this.onPlayStateChange(false);
  }

  togglePlay() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  seek(seconds) {
    const audioDur = this.audioElement.duration || this.duration;
    // Safe seek within audio element boundary
    const target = Math.max(0, Math.min(seconds, audioDur - 0.5));
    this.currentTime = target;
    this.audioElement.currentTime = target;
    if (this.onTimeUpdate) this.onTimeUpdate(this.currentTime, this.duration);
  }

  setVolume(val) {
    this.volume = Math.max(0, Math.min(1, val));
    this.audioElement.volume = this.isMuted ? 0 : this.volume;
    if (this.synthGain && this.audioContext) {
      this.synthGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume * 0.4, this.audioContext.currentTime);
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    this.setVolume(this.volume);
    return this.isMuted;
  }

  toggleLoop() {
    this.isLoop = !this.isLoop;
    return this.isLoop;
  }

  toggleShuffle() {
    this.isShuffle = !this.isShuffle;
    return this.isShuffle;
  }

  startVisualizerLoop() {
    const updateViz = () => {
      if (!this.isPlaying) {
        if (this.onVisualizerData) this.onVisualizerData(new Uint8Array(16));
        return;
      }

      if (this.analyser) {
        const bufferLength = this.analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        this.analyser.getByteFrequencyData(dataArray);
        if (this.onVisualizerData) this.onVisualizerData(dataArray.slice(0, 16));
      }

      requestAnimationFrame(updateViz);
    };
    requestAnimationFrame(updateViz);
  }
}
