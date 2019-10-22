var $ = require('./$.js')
var Device = require('./device.js')
var Support = require('./support.js')
var Utils = require('./utils.js')

var defaults = {
  init: true,
  touchEventsTarget: 'container',
  speed: 300,
  // NS
  containerModifierClass: 'fullscreen-container-',
  slideClass: 'fullscreen-slide',
  slideActiveClass: 'fullscreen-slide-active',
  wrapperClass: 'fullscreen-wrapper',

  // Slides grid
  slidesPerGroup: 1,

  // Touches
  touchRatio: 1,
  longSwipes: true,
  longSwipesRatio: 0.04,
  longSwipesMs: 300,
  followFinger: true,

  // Resistance
  resistance: true,
  resistanceRatio: 0.85
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
    params = assign[1]
  }
  if (!params) {
    params = {}
  }
  params = Utils.extend({}, params)
  if (el && !params.el) {
    params.el = el
  }

  // FullScreen Instance
  var fullscreen = this

  fullscreen.eventsListeners = {}

  if (params && params.on) {
    Object.keys(params.on).forEach(function(eventName) {
      fullscreen.on(eventName, params.on[eventName])
    })
  }

  // Extend defaults with passed params
  var fullscreenParams = Utils.extend({}, defaults)
  fullscreen.params = Utils.extend({}, fullscreenParams, params)
  fullscreen.originalParams = Utils.extend({}, fullscreen.params)
  fullscreen.passedParams = Utils.extend({}, params)

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

    // Slides
    slides: $(),
    slidesGrid: [],
    snapGrid: [],
    slidesSizesGrid: [],

    // RTL
    rtl: true,
    rtlTranslate: false,

    // Indexes
    activeIndex: 0,

    //
    isBeginning: true,
    isEnd: false,

    // Props
    translate: 0,
    previousTranslate: 0,
    progress: 0,
    velocity: 0,
    animating: false,

    // Touch Events
    touchEvents: (function touchEvents() {
      var touch = ['touchstart', 'touchmove', 'touchend', 'touchcancel']

      fullscreen.touchEventsTouch = {
        start: touch[0],
        move: touch[1],
        end: touch[2],
        cancel: touch[3]
      }

      return fullscreen.touchEventsTouch
    })(),
    touchEventsData: {
      isTouched: undefined,
      isMoved: undefined,
      touchStartTime: undefined,
      isScrolling: undefined,
      currentTranslate: undefined,
      startTranslate: undefined,
      isTouchEvent: undefined,
      startMoving: undefined
    },
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

FullScreen.prototype.emit = function() {
  var args = [],
    len = arguments.length
  while (len--) args[len] = arguments[len]

  var that = this
  if (!that.eventsListeners) {
    return that
  }
  var events
  var data
  var context
  if (typeof args[0] === 'string' || Array.isArray(args[0])) {
    events = args[0]
    data = args.slice(1, args.length)
    context = that
  } else {
    events = args[0].events
    data = args[0].data
    context = args[0].context || that
  }
  var eventsArray = Array.isArray(events) ? events : events.split(' ')
  eventsArray.forEach(function(event) {
    if (that.eventsListeners && that.eventsListeners[event]) {
      var handlers = []
      that.eventsListeners[event].forEach(function(eventHandler) {
        handlers.push(eventHandler)
      })
      handlers.forEach(function(eventHandler) {
        eventHandler.apply(context, data)
      })
    }
  })
  return that
}

FullScreen.prototype.on = function(events, handler, priority) {
  var that = this
  if (typeof handler !== 'function') {
    return that
  }

  var method = priority ? 'unshift' : 'push'
  events.split(' ').forEach(function(event) {
    if (!that.eventsListeners[event]) {
      that.eventsListeners[event] = []
    }
    that.eventsListeners[event][method](handler)
  })
  return that
}

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
  suffixes.push('vertical')

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

FullScreen.prototype.removeClasses = function() {
  var that = this
  var $el = that.$el
  var classNames = that.classNames

  $el.removeClass(classNames.join(' '))
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
  var params = that.params
  var snapGrid = that.snapGrid
  var slidesGrid = that.slidesGrid
  var previousIndex = that.previousIndex
  var activeIndex = that.activeIndex
  var rtl = that.rtlTranslate
  var wrapperEl = that.wrapperEl

  var snapIndex = Math.floor(slideIndex / params.slidesPerGroup)
  if (snapIndex >= snapGrid.length) {
    snapIndex = snapGrid.length - 1
  }

  var translate = -snapGrid[snapIndex]

  // Update progress
  that.updateProgress(translate)

  var direction
  if (slideIndex > activeIndex) {
    direction = 'next'
  } else if (slideIndex < activeIndex) {
    direction = 'prev'
  } else {
    direction = 'reset'
  }
  debugger
  // Update Index
  if (
    (rtl && -translate === that.translate) ||
    (!rtl && translate === that.translate)
  ) {
    that.updateActiveIndex(slideIndex)
    that.updateSlidesClasses()
    if (direction !== 'reset') {
      that.transitionStart(runCallbacks, direction)
      that.transitionEnd(runCallbacks, direction)
    }
    return false
  }

  // speed === 0
  if (speed === 0) {
    that.setTransition(0)
    that.setTranslate(translate)
    that.updateActiveIndex(slideIndex)
    that.updateSlidesClasses()
    that.transitionStart(runCallbacks, direction)
    that.transitionEnd(runCallbacks, direction)
  } else {
    that.setTransition(speed)
    that.setTranslate(translate)
    that.updateActiveIndex(slideIndex)
    that.updateSlidesClasses()
    that.transitionStart(runCallbacks, direction)
    if (!that.animating) {
      that.animating = true
      if (!that.onSlideToWrapperTransitionEnd) {
        that.onSlideToWrapperTransitionEnd = function transitionEnd(e) {
          if (!that || that.destroyed) {
            return
          }
          if (e.target !== this) {
            return
          }
          that.$wrapperEl[0].removeEventListener(
            'transitionend',
            that.onSlideToWrapperTransitionEnd
          )
          that.$wrapperEl[0].removeEventListener(
            'webkitTransitionEnd',
            that.onSlideToWrapperTransitionEnd
          )
          that.onSlideToWrapperTransitionEnd = null
          delete that.onSlideToWrapperTransitionEnd
          that.transitionEnd(runCallbacks, direction)
        }
      }
      that.$wrapperEl[0].addEventListener(
        'transitionend',
        that.onSlideToWrapperTransitionEnd
      )
      that.$wrapperEl[0].addEventListener(
        'webkitTransitionEnd',
        that.onSlideToWrapperTransitionEnd
      )
    }
  }

  return true
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

FullScreen.prototype.updateActiveIndex = function(newActiveIndex) {
  var that = this

  var previousIndex = that.activeIndex
  var activeIndex = newActiveIndex
  if (typeof activeIndex === 'undefined') {
    activeIndex = 0
  }

  if (activeIndex === previousIndex) {
    return
  }

  Utils.extend(that, {
    activeIndex: activeIndex
  })
}

FullScreen.prototype.updateSlides = function updateSlides() {
  var that = this

  var $wrapperEl = that.$wrapperEl
  var swiperSize = that.size
  var slides = $wrapperEl.children('.' + that.params.slideClass)
  var slidesLength = slides.length
  var snapGrid = []
  var slidesGrid = []
  var slidesSizesGrid = []

  var slidePosition = -0

  // Calc slides
  var slideSize

  for (var i = 0; i < slidesLength; i += 1) {
    slideSize = 0
    slideSize = swiperSize
    if (slides[i]) {
      slides[i].style.height = slideSize + 'px'
    }

    slidesSizesGrid.push(slideSize)
    snapGrid.push(slidePosition)
    slidesGrid.push(slidePosition)
    slidePosition = slidePosition + slideSize
  }

  Utils.extend(that, {
    slides: slides,
    snapGrid: snapGrid,
    slidesGrid: slidesGrid,
    slidesSizesGrid: slidesSizesGrid
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
  activeSlide
    .nextAll('.' + params.slideClass)
    .eq(0)
    .addClass(params.slideNextClass)
  // Prev Slide
  activeSlide
    .prevAll('.' + params.slideClass)
    .eq(0)
    .addClass(params.slidePrevClass)
}

FullScreen.prototype.updateProgress = function(translate) {
  var that = this

  var params = that.params
  var translatesDiff = that.maxTranslate() - that.minTranslate()
  var progress = that.progress
  var isBeginning = that.isBeginning
  var isEnd = that.isEnd
  var wasBeginning = isBeginning
  var wasEnd = isEnd
  if (translatesDiff === 0) {
    progress = 0
    isBeginning = true
    isEnd = true
  } else {
    progress = (translate - that.minTranslate()) / translatesDiff
    isBeginning = progress <= 0
    isEnd = progress >= 1
  }
  Utils.extend(that, {
    progress: progress,
    isBeginning: isBeginning,
    isEnd: isEnd
  })
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

  var capture = false

  // Touch Events
  if (
    !Support.touch &&
    (Support.pointerEvents || Support.prefixedPointerEvents)
  ) {
    el.addEventListener(touchEvents.start, that.onTouchStart, false)
    document.addEventListener(touchEvents.move, that.onTouchMove, capture)
    document.addEventListener(touchEvents.end, that.onTouchEnd, false)
  } else {
    if (Support.touch) {
      var passiveListener =
        touchEvents.start === 'touchstart' &&
        Support.passiveListener &&
        params.passiveListeners
          ? {
              passive: true,
              capture: false
            }
          : false
      el.addEventListener(touchEvents.start, that.onTouchStart, passiveListener)
      el.addEventListener(
        touchEvents.move,
        that.onTouchMove,
        Support.passiveListener
          ? {
              passive: false,
              capture: capture
            }
          : capture
      )
      el.addEventListener(touchEvents.end, that.onTouchEnd, passiveListener)
      if (touchEvents.cancel) {
        el.addEventListener(
          touchEvents.cancel,
          that.onTouchEnd,
          passiveListener
        )
      }
    }
  }

  that.on('resize orientationchange observerUpdate', onResize, true)
}

FullScreen.prototype.detachEvents = function() {
  var that = this

  var params = that.params
  var touchEvents = that.touchEvents
  var el = that.el
  var wrapperEl = that.wrapperEl

  var capture = false

  // Touch Events
  if (
    !Support.touch &&
    (Support.pointerEvents || Support.prefixedPointerEvents)
  ) {
    el.removeEventListener(touchEvents.start, that.onTouchStart, false)
    document.removeEventListener(touchEvents.move, that.onTouchMove, capture)
    document.removeEventListener(touchEvents.end, that.onTouchEnd, false)
  } else {
    if (Support.touch) {
      var passiveListener =
        touchEvents.start === 'onTouchStart' &&
        Support.passiveListener &&
        params.passiveListeners
          ? {
              passive: true,
              capture: false
            }
          : false
      el.removeEventListener(
        touchEvents.start,
        that.onTouchStart,
        passiveListener
      )
      el.removeEventListener(touchEvents.move, that.onTouchMove, capture)
      el.removeEventListener(touchEvents.end, that.onTouchEnd, passiveListener)
      if (touchEvents.cancel) {
        el.removeEventListener(
          touchEvents.cancel,
          that.onTouchEnd,
          passiveListener
        )
      }
    }
  }

  // Resize handler
  that.off('resize orientationchange observerUpdate', onResize)
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
  var axis = 'y'
  var that = this

  var rtl = that.rtlTranslate
  var $wrapperEl = that.$wrapperEl

  var currentTranslate = Utils.getTranslate($wrapperEl[0], axis)
  if (rtl) {
    currentTranslate = -currentTranslate
  }

  return currentTranslate || 0
}

FullScreen.prototype.setTransition = function(duration, byController) {
  var that = this

  that.$wrapperEl.transition(duration)
}

FullScreen.prototype.transitionStart = function(runCallbacks, direction) {
  if (runCallbacks === void 0) runCallbacks = true

  var that = this
  var activeIndex = that.activeIndex
  var params = that.params
  var previousIndex = that.previousIndex

  var dir = direction
  if (!dir) {
    if (activeIndex > previousIndex) {
      dir = 'next'
    } else if (activeIndex < previousIndex) {
      dir = 'prev'
    } else {
      dir = 'reset'
    }
  }

  that.emit('transitionStart')

  if (runCallbacks && activeIndex !== previousIndex) {
    if (dir === 'reset') {
      that.emit('slideResetTransitionStart')
      return
    }
    that.emit('slideChangeTransitionStart')
    if (dir === 'next') {
      that.emit('slideNextTransitionStart')
    } else {
      that.emit('slidePrevTransitionStart')
    }
  }
}

FullScreen.prototype.transitionEnd = function(runCallbacks, direction) {
  if (runCallbacks === void 0) runCallbacks = true

  var that = this
  var activeIndex = that.activeIndex
  var previousIndex = that.previousIndex
  var params = that.params

  that.animating = false

  that.setTransition(0)

  var dir = direction
  if (!dir) {
    if (activeIndex > previousIndex) {
      dir = 'next'
    } else if (activeIndex < previousIndex) {
      dir = 'prev'
    } else {
      dir = 'reset'
    }
  }

  that.emit('transitionEnd')

  if (runCallbacks && activeIndex !== previousIndex) {
    if (dir === 'reset') {
      that.emit('slideResetTransitionEnd')
      return
    }
    that.emit('slideChangeTransitionEnd')
    if (dir === 'next') {
      that.emit('slideNextTransitionEnd')
    } else {
      that.emit('slidePrevTransitionEnd')
    }
  }
}

FullScreen.prototype.destroy = function destroy(deleteInstance, cleanStyles) {
  if (deleteInstance === void 0) deleteInstance = true
  if (cleanStyles === void 0) cleanStyles = true

  var that = this
  var params = that.params
  var $el = that.$el
  var $wrapperEl = that.$wrapperEl
  var slides = that.slides

  if (typeof that.params === 'undefined' || that.destroyed) {
    return null
  }

  that.emit('beforeDestroy')

  // Init Flag
  that.initialized = false

  // Detach events
  that.detachEvents()

  // Cleanup styles
  if (cleanStyles) {
    that.removeClass()
    $el.removeAttr('style')
    $wrapperEl.removeAttr('style')
    if (slides && slides.length) {
      slides
        .removeClass(
          [
            params.slideVisibleClass,
            params.slideActiveClass,
            params.slideNextClass,
            params.slidePrevClass
          ].join(' ')
        )
        .removeAttr('style')
        .removeAttr('data-swiper-slide-index')
    }
  }

  that.emit('destroy')

  // Detach emitter events
  Object.keys(that.eventsListeners).forEach(function(eventName) {
    that.off(eventName)
  })

  if (deleteInstance !== false) {
    that.$el[0].fullscreen = null
    that.$el.data('fullscreen', null)
    Utils.deleteProps(that)
  }
  that.destroyed = true

  return null
}

FullScreen.prototype.appendSlide = function(slides) {
  var that = this
  var $wrapperEl = that.$wrapperEl
  var params = that.params
  if (typeof slides === 'object' && 'length' in slides) {
    for (var i = 0; i < slides.length; i += 1) {
      if (slides[i]) {
        $wrapperEl.append(slides[i])
      }
    }
  } else {
    $wrapperEl.append(slides)
  }
  if (!(params.observer && Support.observer)) {
    that.update()
  }
}

FullScreen.prototype.prependSlide = function(slides) {
  var that = this
  var params = that.params
  var $wrapperEl = that.wrapperEl
  var activeIndex = that.activeIndex

  var newActiveIndex = activeIndex + 1

  if (typeof slides === 'object' && 'length' in slides) {
    for (var i = 0; i < slides.length; i += 1) {
      if (slides[i]) {
        $wrapperEl.prepend(slides[i])
      }
    }
    newActiveIndex = activeIndex + slides.length
  } else {
    $wrapperEl.prepend(slides)
  }
  if (!(params.observer && Support.observer)) {
    that.update()
  }
  swiper.slideTo(newActiveIndex, 0, false)
}

FullScreen.prototype.update = function() {
  var that = this
  if (!that || that.destroyed) {
    return
  }

  that.updateSize()
  that.updateSlides()
  that.updateProgress()
  that.updateSlidesClasses()

  function setTranslate() {
    var translateValue = that.rtlTranslate
      ? that.translate * -1
      : that.translate

    var newTranslate = Math.min(
      Math.max(translateValue, that.maxTranslate()),
      that.minTranslate()
    )
    that.setTranslate(newTranslate)
    that.updateActiveIndex()
    that.updateSlidesClasses()
  }

  var translated
  translated = that.slideTo(that.activeIndex, 0, false, true)
  if (!translated) {
    setTranslate()
  }

  that.emit('update')
}

FullScreen.prototype.addSlide = function(index, slides) {
  var that = this
  // var $wrapperEl = that.$wrapperEl
  // var params = that.params
  // var activeIndex = that.activeIndex
  // var activeIndexBuffer = activeIndex

  var baseLength = that.slides.length
  if (index <= 0) {
    that.prependSlide(slides)
    return
  }
  if (index >= baseLength) {
    that.appendSlide(slides)
    return
  }
  // var newActiveIndex =
  //   activeIndexBuffer > index ? activeIndexBuffer + 1 : activeIndexBuffer

  // var slidesBuffer = []
  // for (var i = baseLength - 1; i >= index; i -= 1) {
  //   var currentSlide = that.slides.eq(i)
  //   currentSlide.remove()
  //   slidesBuffer.unshift(currentSlide)
  // }

  // if (typeof slides === 'object' && 'length' in slides) {
  //   for (var i$1 = 0; i$1 < slides.length; i$1 += 1) {
  //     if (slides[i$1]) {
  //       $wrapperEl.append(slides[i$1])
  //     }
  //   }
  //   newActiveIndex =
  //     activeIndexBuffer > index
  //       ? activeIndexBuffer + slides.length
  //       : activeIndexBuffer
  // } else {
  //   $wrapperEl.append(slides)
  // }

  // for (var i$2 = 0; i$2 < slidesBuffer.length; i$2 += 1) {
  //   $wrapperEl.append(slidesBuffer[i$2])
  // }

  // swiper.slideTo(newActiveIndex, 0, false)
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
  var rtl = that.rtlTranslate
  var touches = that.touches
  var e = event
  if (e.originalEvent) {
    e = e.originalEvent
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

  data.isScrolling = false

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

  e.preventDefault()

  if (!data.isMoved) {
    data.startTranslate = that.getTranslate()
    that.setTransition(0)
  }

  data.isMoved = true
  var diff = diffY
  touches.diff = diff
  diff *= params.touchRatio
  if (rtl) {
    diff = -diff
  }
  that.swipeDirection = diff > 0 ? 'prev' : 'next'
  data.currentTranslate = diff + data.startTranslate

  var resistanceRatio = params.resistanceRatio

  if (diff > 0 && data.currentTranslate > that.minTranslate()) {
    disableParentSwiper = false
    if (params.resistance) {
      data.currentTranslate =
        that.minTranslate() -
        1 +
        Math.pow(
          -that.minTranslate() + data.startTranslate + diff,
          resistanceRatio
        )
    }
  } else if (diff < 0 && data.currentTranslate < that.maxTranslate()) {
    disableParentSwiper = false
    if (params.resistance) {
      data.currentTranslate =
        that.maxTranslate() +
        1 -
        Math.pow(
          that.maxTranslate() - data.startTranslate - diff,
          resistanceRatio
        )
    }
  }

  // Update progress
  that.updateProgress(data.currentTranslate)

  // Update translate
  that.setTranslate(data.currentTranslate)
}

function onTouchEnd(event) {
  var that = this
  var data = that.touchEventsData

  var params = that.params
  var touches = that.touches
  var rtl = that.rtlTranslate
  var slidesGrid = that.slidesGrid
  var slidesSizesGrid = that.slidesSizesGrid
  var e = event
  if (e.originalEvent) {
    e = e.originalEvent
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
    !that.swipeDirection ||
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
  currentPos = rtl ? that.translate : -that.translate

  // Find current slide
  var stopIndex = 0
  var groupSize = slidesSizesGrid[0]
  for (var i = 0; i < slidesGrid.length; i += 1) {
    if (typeof slidesGrid[i + 1] !== 'undefined') {
      if (currentPos >= slidesGrid[i] && currentPos < slidesGrid[i + 1]) {
        stopIndex = i
        groupSize = slidesGrid[i + params.slidesPerGroup] - slidesGrid[i]
      }
    } else if (currentPos >= slidesGrid[i]) {
      stopIndex = i
      groupSize =
        slidesGrid[slidesGrid.length - 1] - slidesGrid[slidesGrid.length - 2]
    }
  }

  // Find current slide size
  var ratio = (currentPos - slidesGrid[stopIndex]) / groupSize

  if (timeDiff > params.longSwipesMs) {
    // Long touches
    if (that.swipeDirection === 'next') {
      if (ratio >= params.longSwipesRatio) {
        that.slideTo(stopIndex + 1)
      } else {
        that.slideTo(stopIndex + 1)
      }
    }
    if (that.swipeDirection === 'prev') {
      if (ratio > 1 - params.longSwipesRatio) {
        that.slideTo(stopIndex + 1)
      } else {
        that.slideTo(stopIndex)
      }
    }
  } else {
    if (that.swipeDirection === 'next') {
      that.slideTo(stopIndex + 1)
    }
    if (that.swipeDirection === 'prev') {
      that.slideTo(stopIndex)
    }
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
