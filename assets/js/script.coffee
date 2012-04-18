gg = new GG
  spatial: ['bullet']


root = new Node()


gg.loadsounds
  test: 'assets/sounds/test.mp3'

$container = $("#container")[0]

spawn = (x=Math.random()*800, y=Math.random()*600, s=42) ->
  ele = document.createElement('div')
  gg.add
    vx: 0
    vy: 0
    x: x
    y: y
    w: s
    h: s
    spriteX: 0
    spriteY: 0
    klass: 'block'
    color: '#000'
    tags: ['bullet']
    ele: ele
  $container.appendChild ele

gg.frame = (diff, total) =>
  while gg.count('bullet') < 100
   spawn()
  gg.each ['bullet'], (bullet)->
    bullet.vx *= 0.999
    bullet.vy *= 0.999
    bullet.vy += (Math.random() - 0.5) * 0.5
    bullet.vx += (Math.random() - 0.5) * 0.5
    bullet.color = if gg.has_tag(bullet, 'bullet') then '#000' else '#00f'
    bullet.x += bullet.vx
    bullet.y += bullet.vy
    if 0 > (bullet.y + bullet.h) or bullet.y > 600 or 0 > (bullet.x + bullet.w) or bullet.x > 800
      bullet.kill = 1

  gg.update_spatials()

  gg.collisions 'bullet', 'bullet', (bullet1, bullet2)->
    #if gg.count('bullet') < 100
    #  spawn(bullet1.x + 20*(Math.random()-0.5), bullet1.y + 20*(Math.random()-0.5))
    #  spawn(bullet1.x + 20*(Math.random()-0.5), bullet1.y + 20*(Math.random()-0.5))
    #bullet1.color = '#0f0'
    #bullet2.color = '#0f0'
    #bullet1.kill = 1
    #bullet2.kill = 1
    bullet1.vy += (Math.random() - 0.5) * 0.5
    bullet2.vy += (Math.random() - 0.5) * 0.5
    bullet1.vx += (Math.random() - 0.5) * 0.5
    bullet2.vx += (Math.random() - 0.5) * 0.5
    bullet2.spriteX = (bullet2.spriteX + 1) % 25
    #bullet1.spriteX = (bullet1.spriteX + 1) % 25
    #bullet2.spriteY = (bullet2.spriteX + 1) % 26
    bullet1.spriteY = (bullet1.spriteX + 1) % 26
    
    #gg.playsound('test')

  gg.each (item) ->
    if item.kill
      if item.ele
        item.ele.parentNode.removeChild(item.ele)
      gg.remove(item)
    else
      item.ele.className = item.klass
      item.ele.style.cssText = [
        'top:', item.y-10, 'px;',
        'left:', item.x-10, 'px;',
        'height:', item.h+20, 'px;',
        'width:', item.w+20, 'px;',
        'background-position:', item.spriteX*64, 'px ', item.spriteY*64, 'px;'
      ].join('')
  
  #$("#count").html [gg.count(),gg.count('bullet'), gg.count('bullet2')].join('-')

gg.start()