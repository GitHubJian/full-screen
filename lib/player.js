const dom = require('./dom.js')

const defaultOptions = {}

function Player(elem, options) {
  this.elem = elem
  this.options = Object.assign({}, defaultOptions, options)

  this.init_ui(this.options)
}

Player.prototype.init_ui = function(options) {
  const layer = this.elem.querySelector('.load-layer')
  if (options.video_url) {
    options.img && layer.querySelector('img').setAttribute('src', options.img)
  } else {
    layer.classList.add('hide')
  }

  if (options.preload) {
    const video = this.elem.querySelector('video')
    const source = document.createElement('source')
    dom.appendTo(source, video)
    source.setAttribute('src', options.video_url)
    source.setAttribute('type', options.video_type)
    this.video = video
  }
}

Player.prototype.start_video = function() {
  const options = this.options,
    that = this

  this.elem.querySelector('.load-layer').classList.add('hide')
  this.elem.querySelector('.load-layer').classList.add('ui-hide')
  this.init_video(options.video_url, options.video_type, options.preload)
  options.autoplay || this.play_video()
  this.elem.querySelector('video').style.display = 'inline'
}

Player.prototype.init_video = function(url, type, preload) {
  url = url || ''
  type = type || 'video/mp4'

  const that = this,
    video = this.elem.querySelector('video')

  this.video = video

  if (!preload) {
    this.play_video()

    const source = document.createElement('source')
    dom.appendTo(source, video)
    source.setAttribute('src', url)
    source.setAttribute('type', type)
  }
}

Player.prototype.play_video = function() {
  const video = this.video
  const userAgent = window.navigator.userAgent
  const media = document.querySelectorAll('video')

  if (video) {
    if (
      userAgent.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/) ||
      userAgent.indexOf('iPad') > -1
    ) {
      let i = 0
      for (; i < media.length; i++) {
        media[i].pause()
      }
    }

    video.play()
  }
}

module.exports = Player
