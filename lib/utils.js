function deleteProps(obj) {
  var object = obj
  Object.keys(object).forEach(function(key) {
    try {
      object[key] = null
    } catch (error) {
      // no getter for object
    }
    try {
      delete object[key]
    } catch (error) {
      // something got wrong
    }
  })
}

function nextTick(callback, delay) {
  if (delay === void 0) delay = 0

  return setTimeout(callback, delay)
}

function now() {
  return +new Date()
}

function getTranslate(el, axis) {
  if (axis === void 0) axis = 'x'

  var matrix
  var curTransform
  var transformMatrix

  var curStyle = window.getComputedStyle(el, null)

  if (window.WebKitCSSMatrix) {
  }
}

function parseUrlQuery(url) {
  var query = {}
  var urlToParse = url
  var i
  var params
  var param
  if (typeof urlToParse === 'string' && urlToParse.length) {
    urlToParse =
      urlToParse.indexOf('?') > -1 ? urlToParse.replace(/\S*\?/, '') : ''
    params = urlToParse.split('&').filter(function(paramsPart) {
      return paramsPart !== ''
    })
    length = params.length

    for (i = 0; i < length; i += 1) {
      param = params[i].replace(/#\S+/g, '').split('=')
      query[decodeURIComponent(param[0])] =
        typeof param[1] === 'undefined'
          ? undefined
          : decodeURIComponent(param[1]) || ''
    }
  }

  return query
}

function extend() {
  var args = [],
    len$1 = arguments.length

  while (len$1--) args[len$1] = arguments[len$1]

  var to = Object(args[0])
  for (var i = 1; i < args.length; i += 1) {
    var nextSource = args[i]
    if (nextSource !== undefined && nextSource !== null) {
      var keysArray = Object.keys(Object(nextSource))
      for (
        var nextIndex = 0, len = keysArray.length;
        nextIndex < len;
        nextIndex += 1
      ) {
        var nextKey = keysArray[nextIndex]
        var desc = Object.getOwnPropertyDescriptor(nextSource, nextKey)
        if (desc !== undefined && desc.enumerable) {
          if (isObject(to[nextKey]) && isObject(nextSource[nextKey])) {
            extend(to[nextKey], nextSource[nextKey])
          } else if (!isObject(to[nextKey]) && isObject(nextSource[nextKey])) {
            to[nextKey] = {}
            extend(to[nextKey], nextSource[nextKey])
          } else {
            to[nextKey] = nextSource[nextKey]
          }
        }
      }
    }
  }

  return to
}

function isObject(o) {
  return (
    typeof o === 'object' &&
    o !== null &&
    o.constructor &&
    o.constructor === Object
  )
}

module.exports = {
  getTranslate: getTranslate,
  now: now,
  extend: extend
}
