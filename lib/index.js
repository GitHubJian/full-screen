var $ = require('./$.js')
var Device = require('./device.js')
var Support = require('./support.js')
var Utils = require('./utils.js')

function FullScreenClass() {}

FullScreenClass.prototype.on = function() {}
FullScreenClass.prototype.once = function() {}
FullScreenClass.prototype.off = function() {}
FullScreenClass.prototype.emit = function() {}
FullScreenClass.prototype.useModulesParams = function() {}
FullScreenClass.prototype.useModules = function() {}
FullScreen.installModule = function() {}
FullScreen.use = function() {}

var defaults = {
  init: true,
  touchEventsTarget: 'container',
  speed: 300,
  // NS
  containerModifierClass: 'swiper-container-',
  slideClass: 'swiper-slide',
  slideActiveClass: 'swiper-slide-active',
  wrapperClass: 'swiper-wrapper'
}

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

  FullScreenClass.call(this, params)

  // FullScreen Instance
  var fullscreen = this
  // Extend defaults with passed params
  var fullscreenParams = Utils.extend({}, defaults)
  fullscreen.params = Utils.extend({}, fullscreenParams, params)
  fullscreen.originalParams = Utils.extend({}, fullscreen.params)
  fullscreen.passedParams = Utils.extend({}, params)
  debugger
  // Save Dom lib
  fullscreen.$ = $

  // Find el
  var $el = $(fullscreen.params.el)
  el = $el[0]
  if (!el) {
    return undefined
  }

  el.fullscreen = fullscreen

  // Find Wrapper
  var $wrapperEl = $el.children('.' + fullscreen.params.wrapperClass)

  // Extend FullScreen
  Utils.extend(fullscreen, {
    $el: $el,
    el: el,
    $wrapperEl: $wrapperEl,
    wrapperEl: $wrapperEl[0],

    // Classes
    classNames: [],
    // Touch Events

    touchEvents: (function touchEvents() {
      var touch = ['touchstart', 'touchmove', 'touchend', 'touchcancel']

      fullscreen.touchEvents = {
        start: touch[0],
        move: touch[1],
        end: touch[2],
        cancel: touch[3]
      }
    })(),
    touchEventsData: {},
    touches: {
      startX: 0,
      startY: 0,
      currentX: 0,
      currentY: 0,
      diff: 0
    }
  })

  this.init()

  return fullscreen
}

FullScreen.prototype = new FullScreenClass()

FullScreen.prototype.constructor = FullScreen

FullScreen.prototype.init = function init() {
  var that = this
  if (that.initialized) {
    return
  }

  that.addClasses()

  // Update size
  that.updateSize()

  // Update slides
  that.updateSlides()

  // Slide To Initial Slide
  that.slideTo()

  // Attach events
  that.attachEvents()

  that.initialized = true
}

FullScreen.prototype.addClasses = function addClasses() {
  var that = this
  var classNames = that.classNames
  var params = that.params
  var $el = that.$el
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

FullScreen.prototype.slideTo = function(index, speed, runCallbacks) {
  var obj
  if (index === void 0) index = 0
  if (speed === void 0) speed = this.params.speed
  if (runCallbacks === void 0) runCallbacks = true

  var that = this
  var slideIndex = index
  if (slideIndex < 0) {
    slideIndex = 0
  }

  var params = that.params
  var activeIndex = that.activeIndex
  var wrapperEl = that.wrapperEl

  // Update Index
  that.updateActiveIndex(slideIndex)
  that.updateSlidesClasses()

  // speed === 0
  that.setTransition(0)
  that.setTranslate(translate)
  that.updateActiveIndex(slideIndex)
  that.updateSlidesClasses()
  that.transitionStart(runCallbacks, direction)
  that.transitionEnd(runCallbacks, direction)
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

FullScreen.prototype.updateAutoHeight = function(speed) {
  var that = this
  var activeSlides = []
  var newHeight = 0
  var i

  that.$wrapperEl.css('height', newHeight + 'px')
}

FullScreen.prototype.updateActiveIndex = function(newActiveIndex) {
  var that = this

  var translate = 0
  var previousIndex = that.activeIndex
  var activeIndex = newActiveIndex
}

FullScreen.prototype.updateSlides = function updateSlides() {
  debugger
  var that = this
  var params = that.params

  var $wrapperEl = that.$wrapperEl
  var swiperSize = that.size
  var slides = $wrapperEl.children('.' + that.params.slideClass)
  var slidesLength = slides.length

  Utils.extend(that, {
    slides: slides
  })
}

FullScreen.prototype.updateSlidesClasses = function() {
  var that = this
  var slides = that.slides
  var params = that.params
  var $wrapperEl = that.$wrapperEl
  var activeIndex = that.activeIndex

  slides.removeClass(params.slideActiveClass)

  var activeSlide
  activeSlide = slides.eq(activeIndex)

  // Active classes
  activeSlide.addClass(params.slideActiveClass)

  // Next Slide
  var nextSlide = activeSlide
    .nextAll('.' + params.slideClass)
    .eq(0)
    .addClass(params.slideNextClass)
  // Prev Slide
  var prevSlide = activeSlide
    .prevAll('.' + params.slideClass)
    .eq(0)
    .addClass(params.slidePrevClass)
}

FullScreen.prototype.attachEvents = function() {
  var that = this
  var params = that.params
  var touchEvents = that.touchEvents
  var el = that.el
  var wrapperEl = that.wrapperEl

  that.onTouchStart = onTouchStart.bind(that)
  that.onTouchMove = onTouchMove.bind(that)
  that.onTouchEnd = onTouchEnd.bind(that)

  // Touch Events
  if (
    !Support.touch &&
    (Support.pointerEvents || Support.prefixedPointerEvents)
  ) {
    el.addEventListener(touchEvents.start, that.onTouchStart, false)
    doc.addEventListener(touchEvents.move, that.onTouchMove, capture)
    doc.addEventListener(touchEvents.end, that.onTouchEnd, false)
  } else {
    if (Support.touch) {
      var passiveListener =
        touchEvents.start === 'touchstart' &&
        Support.passiveListener &&
        params.passiveListeners
          ? { passive: true, capture: false }
          : false
      el.addEventListener(touchEvents.start, that.onTouchStart, passiveListener)
      el.addEventListener(
        touchEvents.move,
        that.onTouchMove,
        Support.passiveListener ? { passive: false, capture: capture } : capture
      )
      el.addEventListener(touchEvents.end, that.onTouchEnd, passiveListener)
      if (touchEvents.cancel) {
        el.addEventListener(
          touchEvents.cancel,
          swiper.onTouchEnd,
          passiveListener
        )
      }
    }
  }

  that.on('resize orientationchange observerUpdate', onResize, true)
}

FullScreen.prototype.maxTranslate = function() {
  return -this.snapGrid[this.snapGrid.length - 1]
}

FullScreen.prototype.minTranslate = function() {
  return -this.snapGrid[0]
}

FullScreen.prototype.setTranslate = function(translate, byController) {
  var that = this
  var rtl = that.rtlTranslate
  var params = that.params
  var $wrapperEl = that.$wrapperEl
  var wrapperEl = that.wrapperEl
  var progress = that.progress
  var x = 0
  var y = 0
  var z = 0

  y = translate

  $wrapperEl.transform('translate3d(' + x + 'px, ' + y + 'px, ' + z + 'px)')

  that.previousTranslate = that.translate
  that.translate = y

  // Check if we need to update progress
  var newProgress
  var translatesDiff = that.maxTranslate() - that.minTranslate()
  if (translatesDiff === 0) {
    newProgress = 0
  } else {
    newProgress = (translate - that.minTranslate()) / translatesDiff
  }
  if (newProgress !== progress) {
    that.updateProgress(translate)
  }
}

FullScreen.prototype.getTranslate = function() {
  axis = 'y'
  var that = this

  var params = swiper.params
  var rtl = that.rtlTranslate
  var translate = that.translate
  var $wrapperEl = that.$wrapperEl

  var currentTranslate = Utils.getTranslate($wrapperEl[0], axis)
  if (rtl) {
    currentTranslate = -currentTranslate
  }

  return currentTranslate || 0
}

function onTouchStart(event) {
  var that = this
  var data = that.touchEventsData
  var params = that.params
  var touches = that.touches

  if (that.animating) {
    return
  }
  var e = event
  if (e.originalEvent) {
    e = e.originalEvent
  }
  var $targetEl = $(e.target)

  touches.currentX =
    e.type === 'touchstart' ? e.targetTouches[0].pageX : e.pageX
  touches.currentY =
    e.type === 'touchstart' ? e.targetTouches[0].pageY : e.pageY
  var startX = touches.currentX
  var startY = touches.currentY

  Utils.extend(data, {
    isTouched: true,
    isMoved: false,
    allowTouchCallbacks: true,
    isScrolling: undefined,
    startMoving: undefined
  })

  touches.startX = startX
  touches.startY = startY
  data.touchStartTime = Utils.now()
  that.updateSize()
}

function onTouchMove(event) {
  var that = this
  var data = that.touchEventsData
  var params = that.params
  var touches = that.touches
  var e = event
  if (e.originalEvent) {
    e = e.originalEvent
  }
  if (!data.isTouched) {
    if (data.startMoving && data.isScrolling) {
      that.emit('touchMoveOpposite', e)
    }
    return
  }
  if (data.isTouchEvent && e.type === 'mousemove') {
    return
  }
  var pageX = e.type === 'touchmove' ? e.targetTouches[0].pageX : e.pageX
  var pageY = e.type === 'touchmove' ? e.targetTouches[0].pageY : e.pageY

  touches.currentX = pageX
  touches.currentY = pageY

  var diffX = touches.currentX - touches.startX
  var diffY = touches.currentY - touches.startY
  if (
    that.params.threshold &&
    Math.sqrt(Math.pow(diffX, 2) + Math.pow(diffY, 2)) < that.params.threshold
  ) {
    return
  }

  if (data.isScrolling) {
    that.emit('touchMoveOpposite', e)
  }
  if (typeof data.startMoving === 'undefined') {
    if (
      touches.currentX !== touches.startX ||
      touches.currentY !== touches.startY
    ) {
      data.startMoving = true
    }
  }
  if (data.isScrolling) {
    data.isTouched = false
    return
  }
  if (!data.startMoving) {
    return
  }
  if (!data.isMoved) {
    data.startTranslate = that.getTranslate()
    that.setTransition(0)
    swiper.emit('sliderMove', e)
    data.isMoved = true
    var diff = diffY
    touches.diff = diff
    diff *= params.touchRatio
    data.currentTranslate = diff + data.startTranslate

    var disableParentSwiper = true
    if (diff > 0 && data.currentTranslate > that.minTranslate()) {
      disableParentSwiper = false
    } else if (diff < 0 && data.currentTranslate < that.maxTranslate()) {
      disableParentSwiper = false
    }

    if (disableParentSwiper) {
      e.preventedByNestedSwiper = true
    }

    // Threshold
    if (params.threshold > 0) {
      if (Math.abs(diff) > params.threshold || data.allowThresholdMove) {
        if (!data.allowThresholdMove) {
          data.allowThresholdMove = true
          touches.startX = touches.currentX
          touches.startY = touches.currentY
          data.currentTranslate = data.startTranslate
          touches.diff = touches.currentY - touches.startY
          return
        }
      } else {
        data.currentTranslate = data.startTranslate
        return
      }
    }

    // Update progress
    that.updateProgress(data.currentTranslate)

    // Update translate
    that.setTranslate(data.currentTranslate)
  }
}

function onTouchEnd(event) {
  var that = this
  var data = that.touchEventsData

  var params = that.params
  var touches = that.touches
  var rtl = that.rtlTranslate
  var $wrapperEl = that.$wrapperEl
  var e = event
  if (e.originalEvent) {
    e = e.originalEvent
  }
  if (data.allowTouchCallbacks) {
    that.emit('touchEnd', e)
  }
  data.allowTouchCallbacks = false
  if (!data.isTouched) {
    data.isMoved = false
    data.startMoving = false
    return
  }

  // Time diff
  var touchEndTime = Utils.now()
  var timeDiff = touchEndTime - data.touchStartTime

  if (
    !data.isTouched ||
    !data.isMoved ||
    !that.swiperDirection ||
    touches.diff === 0 ||
    data.currentTranslate === data.startTranslate
  ) {
    data.isTouched = false
    data.isMoved = false
    data.startMoving = false
    return
  }
  data.isTouched = false
  data.isMoved = false
  data.startMoving = false

  var currentPos
  currentPos = -data.currentTranslate

  // Find current slide
  var stopIndex = 0
  var groupSize

  // Find current slide size
  var ratio = 1

  if (timeDiff > params.longSwipesMs) {
    // Long touches
    if (!params.longSwipes) {
      that.slideTo(that.activeIndex)
      return
    }

    swiper.slideTo(stopIndex)
  } else {
    // Short swipes
    if (!params.shortSwipes) {
      that.slideTo(that.activeIndex)
      return
    }
    that.slideTo(stopIndex)
  }
}

function onResize() {
  var that = this

  var params = that.params
  var el = that.el

  if (el && el.offsetWidth === 0) {
    return
  }

  that.updateSize()
  that.updateSlides()

  that.updateSlidesClasses()
}

window.FullScreen = FullScreen

module.exports = FullScreen
