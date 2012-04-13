(->
  vendors = [ "ms", "moz", "webkit", "o" ]

  for vendor in vendors
    window.requestAnimationFrame = window[vendor + "RequestAnimationFrame"]
    window.cancelAnimationFrame = window[vendor + "CancelAnimationFrame"] or window[vendor + "CancelRequestAnimationFrame"]
    return if window.requestAnimationFrame

  unless window.requestAnimationFrame
    lastTime = 0
    id = null
    window.requestAnimationFrame = (callback, element) ->
      currTime = new Date().getTime()
      timeToCall = Math.max(0, 16 - (currTime - lastTime))
      id = window.setTimeout(->
        callback currTime + timeToCall
      , timeToCall)
      lastTime = currTime + timeToCall
      return id
  unless window.cancelAnimationFrame
    window.cancelAnimationFrame = (id) ->
      clearTimeout id
      return
  return
)()

if soundManager
  soundManager.url = '/assets/swf/'
  soundManager.flashVersion = 9
  soundManager.useFlashBlock = false

class GG
  constructor: (@options) ->
    @entities = {}
    @entities_uuid = 0
    @tags = {}
    @keys = {}
    @snds = {}

    $(window).on
      keydown: (evt) =>
        @keys[evt.which] = 'd'
        return
      keyup: (evt) =>
        delete @keys[evt.which]
        return
      blur: (evt) =>
        @keys = {}
        return

    if @options
      if @options.sounds
        @loadsounds @options.sounds
  add: (item) ->
    @entities_uuid += 1
    uuid = @entities_uuid.toString(36)
    if item.tags
      for tag in item.tags
        if not @tags[tag]
          @tags[tag] = {}
        @tags[tag][uuid] = 1
    item.uuid = uuid
    @entities[uuid] = item
    return @entities_uuid
  get: (uuid) ->
    return @entities[uuid]
  each: (tag, cb) ->
    if cb
      for id of @tags[tag]
        cb(@entities[id])
    else
      cb = tag
      for id of @entities
        cb(@entities[id])
  count: (tag) ->
    s = 0

    if tag
      for id of @tags[tag]
        s += 1
    else        
      for id of @entities
        s += 1

    return s
  find: (tag) ->
    for id of @tags[tag]
      @entities[id]
  remove: (bullet) ->
    uuid = bullet.uuid
    if @entities[uuid]
      if @entities[uuid].tags
        for tag in @entities[uuid].tags
          delete @tags[tag][uuid]
      delete @entities[uuid]
  start: () ->
    @prevFrame = new Date().getTime()
    @_frame()
  frame: (diff, total) ->
  _frame: (total) =>
    diff = total - @prevFrame
    @frame(diff, total)
    requestAnimationFrame @_frame
  playsound: (snd, opts) =>
    if gg.snds[snd]
      gg.snds[snd].play(opts)
    return
  loadsounds: (loadthese) =>
    if soundManager
      soundManager.onready () =>
        for soundId, url of loadthese
          @snds[soundId] = soundManager.createSound
            id: soundId
            url: url
        return
      return
    return

