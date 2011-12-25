ggGo (gg) ->
  gg.on.scroll = (evt) ->

  gg.on.mousemove = (evt) ->

  gg.loadsnds
    test: '../assets/sounds/test.mp3'

  setInterval (() ->
    if gg.keys['38']
      console.log 'up'
      gg.snds.test.play()
    if gg.keys['40']
      console.log 'down'
    if gg.keys['37']
      console.log 'left'
    if gg.keys['39']
      console.log 'right'
  ),30

  setInterval ( ()->
  ),30

  setInterval (() ->
    if _.size(gg.keys) > 0
      console.log JSON.stringify gg.keys
  ),1000

  return
