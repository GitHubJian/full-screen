var $ = require('./$.js')

function FullScreenClass() {}

FullScreenClass.prototype.on = function() {}
FullScreenClass.prototype.once = function() {}
FullScreenClass.prototype.off = function() {}
FullScreenClass.prototype.emit = function() {}
FullScreenClass.prototype.useModulesParams = function() {}
FullScreenClass.prototype.useModules = function() {}
FullScreen.installModule = function() {}
FullScreen.use = function() {}

function FullScreen() {
  var assign

  var args = [],
    len = arguments.length

  while (len--) args[len] = arguments[len]

  var el
  var params
  if (
    args.length === 1 &&
    args[0].constructor &&
    args[0].constructor === Object
  ) {
    params = args[0]
  } else {
    assign = args
    el = assign[0]
    params = assign
  }

  params || (params = {})
  if (el && !params.el) {
    params.el = el
  }

  this.params = params

  var touch = ['touchstart', 'touchmove', 'touchend', 'touchcancel']
  this.touchEvents = {
    start: touch[0],
    move: touch[1],
    end: touch[2],
    cancel: touch[3]
  }

  this.touches = {
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
    diff: 0
  }

  this.init()
}

FullScreen.prototype = new FullScreenClass()

FullScreen.prototype.constructor = FullScreen

FullScreen.prototype.init = function init() {
  var that = this
  if (that.initialized) {
    return
  }

  this.addClasses()
}

FullScreen.prototype.addClasses = function addClasses() {
  var that = this
  var classNames = that.classNames
  var params = that.params
  var $el = swiper.$el
  var suffixes = []

  suffixes.push('initialized')
  suffixes.push(params.direction)

  if (Device.android) {
    suffixes.push('android')
  }
  if (Device.ios) {
    suffixes.push('ios')
  }

  suffixes.forEach(function(suffix) {
    classNames.push(params.containerModifierClass + suffix)
  })

  $el.addClass(classNames.join(' '))
}

FullScreen.prototype.updateSize = function updateSize() {
  var that = this
  var width
  var height
  var $el = that.$el

  width = $el[0].clientWidth
  height = $el[0].clientHeight

  Utils.extend(that, {
    width: width,
    height: height,
    size: height
  })
}

FullScreen.prototype.updateSlides = function updateSlides() {
  var that = this
  var params = that.params

  var $wrapperEl = that.$wrapperEl
  var swiperSize = that.size
  var slides = $wrapperEl.children('.' + that.params.slidesClass)
  var slidesLength = slides.length
  var
}
