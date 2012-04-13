gg = new GG()

gg.loadsounds
  test: 'assets/sounds/test.mp3'

$container = $("#container")[0]

gg.frame = (diff, total) =>
  for x in [0..1]
    gg.add
      vx: 0
      vy: 0
      x: 400
      y: 300
      w: 10
      h: 10
      color: ['#f60', '#06f', '#6f0', '#0f6', '#06f', '#06f'][Math.floor(Math.random() * 6)]
      tags: ['bullet']
  gg.each 'bullet', (bullet)->
    bullet.vx *= 0.999
    bullet.vy *= 0.999
    bullet.vy += (Math.random() - 0.5) * 1
    bullet.vx += (Math.random() - 0.5) * 1
    if 0 > bullet.y or bullet.y > 600 or 0 > bullet.x or bullet.x > 800
      bullet.ele.parentNode.removeChild(bullet.ele)
      gg.remove(bullet)
      gg.playsound('test', {volume:10, pan: bullet.x * 100 / 800})

  gg.each (item) ->
    item.x += item.vx
    item.y += item.vy

    if not item.ele
      item.ele = document.createElement('div')
      item.ele.className = "block"
      $container.appendChild item.ele

    item.ele.style.cssText = [
      'top:', item.y, 'px;',
      'left:', item.x, 'px;',
      'height:', item.h, 'px;',
      'width:', item.w, 'px;',
      'background-color:', item.color, ';'
    ].join('')

  if Math.random() < 0.01
    $("#count").html gg.count 'bullet'

gg.start()