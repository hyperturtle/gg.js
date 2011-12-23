soundManager.url = 'assets/swf/'
soundManager.flashVersion = 9
soundManager.useFlashBlock = false

gg =
  keys: {}
  mouse: {x:0;y:0}
  scroll: {x:0;y:0}
  on:
    mousemove: () ->
    resize: () ->
    scroll: () ->
  go: () ->
    $(window).resize()
  snd: soundManager


$(window).on
  keydown: (evt) ->
    gg.keys[evt.which] = 'd'
  keyup: (evt) ->
    delete gg.keys[evt.which]
  blur: (evt) ->
    gg.keys = {}
  mousemove: _.throttle ((evt) ->
    gg.mouse.x = evt.pageX
    gg.mouse.y = evt.pageY
    gg.on.mousemove.apply(@,arguments)
  ), 25
  resize: _.throttle ((evt) ->
    gg.width = $(window).width()
    gg.height = $(window).height()
    gg.on.resize.apply(@,arguments)
  ), 25
  scroll: _.throttle ((evt) ->
    gg.scroll =
      x: $(window).scrollLeft()
      y: $(window).scrollTop()
    gg.on.scroll.apply(@,arguments)
  ),25


