const dom = require('./dom.js')
const Player = require('./player.js')

const _toString = Object.prototype.toString

function H5Player() {
  this.options = {
    el: '#bofqi',
    image: null,
    video_url: null
  }
}

H5Player.prototype.create = function(opts) {
  const that = this

  '[object Object]' === _toString.call(opts) &&
    (this.options = Object.assign({}, this.options, opts))

  if (!this.options.el) {
    this.player = {}

    return !1
  }

  const html =
    '<div class="player-container ui-wrap">' +
    '<div class="player-box ui-video">' +
    '<video controls ' +
    ('string' === typeof this.options.preload ? ' preload ' : '') +
    ' width="100%" height="100%" ' +
    (this.options.autoplay ? ' autoplay ' : '') +
    ' x-webkit-airplay="allow" webkit-playsinline playsinline x5-playsinline x5-video-player-fullscreen="false"></video>' +
    '<div class="display" style="display:none;">' +
    '<div class="load-layer">' +
    '<img />' +
    '</div>' +
    '</div>' +
    '</div>' +
    '</div>'

  const fragment = document.createDocumentFragment(),
    div = document.createElement('div')

  div.innerHTML = html
  fragment.appendChild(div)

  let el = this.options.el
  _toString.call(this.options.el).match(/HTML.+Element/) ||
    (el = document.querySelector(this.options.el))

  if (!el) {
    el = document.createElement('div')
    el.setAttribute('id', this.options.el.substring(1))

    dom.appendTo(el, document.body)
  }

  this.options.el = el

  dom.appendTo(fragment.firstChild.childNodes, el)

  return this
}

H5Player.prototype.setVideo = function(opts) {
  const that = this

  '[object Object]' === _toString.call(opts) &&
    (this.options = Object.assign({}, this.options, opts))

  let el = this.options.el
  _toString.call(el).match(/HTML.+Element/) ||
    (el = document.querySelector(this.options.el))

  this.player = new Player(this.options.el, {
    img: this.options.image,
    video_url: this.options.video_url,
    video_type: 'video/mp4',
    autoplay: this.options.autoplay
  })

  if (this.options.autoplay) {
    this.player.start_video()
  }
}

H5Player.prototype.play = function() {
  this.player.start_video()
}

window.H5Player = H5Player

module.exports = H5Player
