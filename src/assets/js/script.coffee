gg.loadsnds
  test: '../assets/sounds/test.mp3'

$container = $("#container")[0]

gg.frame = (diff, total) =>
  if Math.random() > 0.1
    gg.add
      vx: 0
      vy: 0
      x: 400
      y: 300
      tags: ['bullet']
  gg.each 'bullet', (bullet)->
    bullet.vx *= 0.99
    bullet.vy *= 0.99
    bullet.vy += (Math.random() - 0.5) * 1
    bullet.vx += (Math.random() - 0.5) * 1
    if 0 > bullet.y or bullet.y > 600 or 0 > bullet.x or bullet.x > 800
      bullet.ele.parentNode.removeChild(bullet.ele)
      gg.remove(bullet)
      if gg.snds.test
        gg.snds.test.play({volume:10, pan: bullet.x * 100 / 800})

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
    ].join('')

  #$("#count").html gg.count 'bullet'

gg.start()