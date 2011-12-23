soundManager.url = 'assets/swf/'
soundManager.flashVersion = 9
soundManager.useFlashBlock = false


setInterval (() ->
  if gg.keys['38']
    console.log 'up'
  if gg.keys['40']
    console.log 'down'
  if gg.keys['37']
    console.log 'left'
  if gg.keys['39']
    console.log 'right'
),30

setInterval (() ->
  if _.size(gg.keys) > 0
    console.log JSON.stringify gg.keys
),1000

gg.on.scroll = (evt) ->
  gg.on.mousemove()

gg.on.mousemove = (evt) ->

gg.go()
