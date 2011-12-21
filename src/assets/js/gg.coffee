gg =
  keys: {}
  mouse: {x:0;y:0}


$(window).on
  keydown: (evt) ->
    gg.keys[evt.which] = 'd'
  keyup: (evt) ->
    delete gg.keys[evt.which]
  blur: (evt) ->
    gg.keys = {}
  mousemove: (evt) ->
    gg.mouse.x = evt.pageX
    gg.mouse.y = evt.pageY