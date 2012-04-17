gg = new GG
  spatial: ['bullet']


root = new Node()


gg.loadsounds
  test: 'assets/sounds/test.mp3'

$container = $("#container")[0]

spawn = (x=Math.random()*800, y=Math.random()*600, s=5) ->
  gg.add
    vx: 0
    vy: 0
    x: x
    y: y
    w: s
    h: s
    color: '#000'
    tags: ['bullet']

gg.frame = (diff, total) =>
  while gg.count('bullet') < 30
   spawn()
  gg.each ['bullet'], (bullet)->
    bullet.vx *= 0.999
    bullet.vy *= 0.999
    bullet.vy += (Math.random() - 0.5) * 1
    bullet.vx += (Math.random() - 0.5) * 1
    bullet.w = Math.min(20, bullet.w * 1.01)
    bullet.h = Math.min(20, bullet.h * 1.01)
    bullet.color = if gg.has_tag(bullet, 'bullet') then '#000' else '#00f'
    bullet.x += bullet.vx
    bullet.y += bullet.vy
    if 0 > bullet.y or bullet.y > 600 or 0 > bullet.x or bullet.x > 800
      bullet.kill = 1

  gg.update_spatials()

  gg.collisions 'bullet', 'bullet', (bullet1, bullet2)->
    if bullet1.w + bullet2.w >= 20 and gg.count('bullet') < 100
      spawn(bullet1.x + 20*(Math.random()-0.5), bullet1.y + 20*(Math.random()-0.5))
      spawn(bullet1.x + 20*(Math.random()-0.5), bullet1.y + 20*(Math.random()-0.5))
    bullet1.color = '#0f0'
    bullet2.color = '#0f0'
    bullet1.kill = 1
    bullet2.kill = 1
    #gg.playsound('test')

  gg.each (item) ->
    if item.kill
      if item.ele
        item.ele.parentNode.removeChild(item.ele)
      gg.remove(item)
    else
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
  
  #$("#count").html [gg.count(),gg.count('bullet'), gg.count('bullet2')].join('-')

gg.start()