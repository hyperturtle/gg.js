soundManager.url = '/assets/swf/'
soundManager.flashVersion = 9
soundManager.useFlashBlock = false
ggGo = (func) ->
  ggo =
    keys: {}
    mouse: {x:0;y:0}
    scroll: {x:0;y:0}
    blocks: []
    on:
      mousemove: () ->
      resize: () ->
      scroll: () ->
      loop: () ->
      render: () ->
        _ensure(ggo.blocks.length)
        for domblock, i in DOMBLOCKS
          if i < ggo.blocks.length
            block = ggo.blocks[i]
            domblock.css
              top: block.x
              left: block.y
          else
            domblock.css
              top:   -100
              left:  -100
              height: 0
              width:  0
        return
    go: (func) ->
      func(ggo)
      $(window).resize()
      _loop()
      return
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

  lastLoop = new Date
  _loop = (thisLoop) ->
    ggo.on.loop(thisLoop - lastLoop)
    ggo.on.render()
    requestAnimationFrame _loop
    lastLoop = thisLoop
    return
  
  $container = $("#container")
  DOMBLOCKS = []
  _ensure = (n) ->
    while DOMBLOCKS.length < n
      $ele = $('<div class="block"></div>')
      $container.append $ele
      DOMBLOCKS.push($ele)
    return
  _ensure 100

  $(window).on
    keydown: (evt) ->
      ggo.keys[evt.which] = 'd'
      return
    keyup: (evt) ->
      delete ggo.keys[evt.which]
      return
    blur: (evt) ->
      ggo.keys = {}
      return
    mousemove: _.throttle ((evt) ->
      ggo.mouse.x = evt.pageX
      ggo.mouse.y = evt.pageY
      ggo.on.mousemove.apply(@,arguments)
      return
    ), 25
    resize: _.throttle ((evt) ->
      ggo.width = $(window).width()
      ggo.height = $(window).height()
      ggo.on.resize.apply(@,arguments)
      return
    ), 25
    scroll: _.throttle ((evt) ->
      ggo.scroll =
        x: $(window).scrollLeft()
        y: $(window).scrollTop()
      ggo.on.scroll.apply(@,arguments)
      return
    ),25


  ggo.go(func)
