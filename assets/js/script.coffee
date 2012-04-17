gg = new GG
  spatial: ['bullet', 'bullet2']


root = new Node()


gg.loadsounds
  test: 'assets/sounds/test.mp3'

$container = $("#container")[0]

gg.frame = (diff, total) =>
  while gg.count('bullet') < 100
    gg.add
      vx: 0
      vy: 0
      x: 400
      y: 300
      w: 20
      h: 20
      color: '#000'
      tags: ['bullet']
  while gg.count('bullet2') < 100
    gg.add
      vx: 0
      vy: 0
      x: 400
      y: 300
      w: 5
      h: 5
      color: '#333'
      tags: ['bullet2']
  gg.each ['bullet2','bullet'], (bullet)->
    bullet.vx *= 0.999
    bullet.vy *= 0.999
    bullet.vy += (Math.random() - 0.5) * 1
    bullet.vx += (Math.random() - 0.5) * 1
    bullet.color = if gg.has_tag(bullet, 'bullet') then '#000' else '#00f'
    bullet.x += bullet.vx
    bullet.y += bullet.vy
    if 0 > bullet.y or bullet.y > 600 or 0 > bullet.x or bullet.x > 800
      if bullet.ele
        bullet.ele.parentNode.removeChild(bullet.ele)
      gg.remove(bullet)

  gg.update_spatials()

  gg.find_spatial 'bullet', { x: 0, y: 0, w: 400, h: 300 }, (bullet) ->
    bullet.color = '#f00'

  gg.collisions 'bullet', 'bullet2', (bullet, bullet2)->
    bullet.color = '#0f0'
    bullet2.color = '#0f0'

  gg.each (item) ->
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
  
  $("#count").html [gg.count(),gg.count('bullet'), gg.count('bullet2')].join('-')

gg.start()