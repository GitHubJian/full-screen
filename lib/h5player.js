var dom = require('./dom.js')
var _toString = Object.prototype.toString

function H5Player(el, options) {
  // TODO: defaults
  el = el || '#bofqi'
  options = options || {}
  _toString.call(el).match(/HTML.+Element/) || (el = document.querySelector(el))

  this.el = el

  this.elem = el

  this.options = options

  this.create()
}

H5Player.prototype.constructor = H5Player

H5Player.prototype.create = function() {
  var html =
    '<video ' +
    // ' controls ' +
    ' preload ' +
    ' autoplay ' +
    ' width="100%" height="100%" ' +
    ' x-webkit-airplay="allow" webkit-playsinline playsinline x5-playsinline x5-video-player-fullscreen="false"></video>'

  const fragment = document.createDocumentFragment(),
    div = document.createElement('div')

  div.innerHTML = html
  fragment.appendChild(div)

  dom.appendTo(fragment.firstChild.childNodes, this.elem)

  return this
}

H5Player.prototype.set = function set(opts) {
  var video_url = opts.video_url

  console.log('video_url ->', video_url)
  var type = 'video/mp4'

  var video = this.elem.querySelector('video')

  this.video = video

  var source = video.querySelector('source')

  if (!source) {
    source = document.createElement('source')
    dom.appendTo(source, video)
  }

  debugger
  source.setAttribute('src', video_url)
  source.setAttribute('type', type)
}

H5Player.prototype.play = function() {
  // TODO: poster hide
  var video = this.video
  // TODO:stop other video
  video.load()
  video.play()
}

H5Player.prototype.destroy = function() {
  this.elem.removeChild(this.video)
}

window.H5Player = H5Player

module.exports = H5Player
