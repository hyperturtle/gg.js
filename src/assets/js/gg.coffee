soundManager.url = '/assets/swf/'
soundManager.flashVersion = 9
soundManager.useFlashBlock = false
ggGo = (func) ->
  ggo =
    keys: {}
    mouse: {x:0;y:0}
    scroll: {x:0;y:0}
    on:
      mousemove: () ->
      resize: () ->
      scroll: () ->
    go: (func) ->
      func(ggo)
      $(window).resize()
    snd: soundManager
    loadsnds: (loadthese) ->
      ggo.snd.onready () ->
        _.each loadthese, (url, soundId) ->
          ggo.snds[soundId] = ggo.snd.createSound
            id: soundId
            url: url
          ggo.snds[soundId].load()
          return
        return
      return
    snds: {}


  $(window).on
    keydown: (evt) ->
      ggo.keys[evt.which] = 'd'
    keyup: (evt) ->
      delete ggo.keys[evt.which]
    blur: (evt) ->
      ggo.keys = {}
    mousemove: _.throttle ((evt) ->
      ggo.mouse.x = evt.pageX
      ggo.mouse.y = evt.pageY
      ggo.on.mousemove.apply(@,arguments)
    ), 25
    resize: _.throttle ((evt) ->
      ggo.width = $(window).width()
      ggo.height = $(window).height()
      ggo.on.resize.apply(@,arguments)
    ), 25
    scroll: _.throttle ((evt) ->
      ggo.scroll =
        x: $(window).scrollLeft()
        y: $(window).scrollTop()
      ggo.on.scroll.apply(@,arguments)
    ),25


  ggo.go(func)
