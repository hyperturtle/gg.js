(->
  vendors = [ "ms", "moz", "webkit", "o" ]

  for vendor in vendors
    window.requestAnimationFrame = window[vendor + "RequestAnimationFrame"]
    window.cancelAnimationFrame = window[vendor + "CancelAnimationFrame"] or window[vendor + "CancelRequestAnimationFrame"]
    return if window.requestAnimationFrame

  unless window.requestAnimationFrame
    lastTime = 0
    id = null
    window.requestAnimationFrame = (callback, element) ->
      currTime = new Date().getTime()
      timeToCall = Math.max(0, 16 - (currTime - lastTime))
      id = window.setTimeout(->
        callback currTime + timeToCall
      , timeToCall)
      lastTime = currTime + timeToCall
      return id
  unless window.cancelAnimationFrame
    window.cancelAnimationFrame = (id) ->
      clearTimeout id
      return
  return
)()

class Node
  constructor: (@w=800, @h=600, @partition=100) ->
    @children = {}
    @ph = Math.ceil(@h / @partition)
    @pw = Math.ceil(@w / @partition)
    
    @clear()

  where: (x, y) ->
    x = Math.min @pw - 1, Math.max(0, Math.floor(x/@partition))
    y = Math.min @ph - 1, Math.max(0, Math.floor(y/@partition))
    return [x, y]

  find: (range) ->
    c1 = @where(range.x, range.y)
    c2 = @where(range.x + range.w, range.y + range.h)
    out = []
    for x in [c1[0]..c2[0]]
      for y in [c1[1]..c2[1]]
        p = @children[x + ',' + y]
        out = out.concat p
    return out 

  add: (newnode) ->
    c1 = @where(newnode.x, newnode.y)
    c2 = @where(newnode.x + newnode.w, newnode.y + newnode.h)
    for x in [c1[0]..c2[0]]
      for y in [c1[1]..c2[1]]
        @children[x + ',' + y].push(newnode.uuid)

    return
  clear: () ->
    @children = {}
    for x in [0..@pw-1]
      for y in [0..@ph-1]
        @children[x + ',' + y] = []

class GG
  constructor: (@options) ->
    @entities = {}
    @entities_uuid = 0
    @tags = {}
    @keys = {}
    @snds = {}
    @entityCount = 0
    @tag_counts = {}

    $(window).on
      keydown: (evt) =>
        @keys[evt.which] = 'd'
        return
      keyup: (evt) =>
        delete @keys[evt.which]
        return
      blur: (evt) =>
        @keys = {}
        return

    if window.soundManager
      window.soundManager.url = 'assets/swf/'
      window.soundManager.flashVersion = 9
      window.soundManager.useFlashBlock = false

    if @options.spatial
      @spatial = {}
      for tag in @options.spatial
        @spatial[tag] = new Node()
    if @options
      if @options.sounds
        @loadsounds @options.sounds
  add: (item) ->
    @entities_uuid += 1
    uuid = @entities_uuid.toString(36)
    @entityCount += 1
    if item.tags
      for tag in item.tags
        if not @tags[tag]
          @tags[tag] = {}
          @tag_counts[tag] = 0
        @tags[tag][uuid] = 1
        @tag_counts[tag] += 1
    item.uuid = uuid
    @entities[uuid] = item
    return @entities_uuid
  has_tag: (item, tag) ->
    return @tags[tag] and @tags[tag][item.uuid]
  update_spatials: () ->
    for own spatial_index of @spatial
      @spatial[spatial_index].clear()
      @each [spatial_index], (item) ->
        @spatial[spatial_index].add(item)
  find_spatial: (spatial_index, range, cb) ->
    for near in @spatial[spatial_index].find range
      p = @entities[near]
      if (p.x - range.x < range.w) and (range.x - p.x < p.w) and (p.y - range.y < range.h) and (range.y - p.y < p.h)
        cb.apply(this, [p])
    return
  collisions: (spatial_index1, spatial_index2, cb) ->
    for own node1 of @spatial[spatial_index1].children
      region1 = @spatial[spatial_index1].children[node1]
      region2 = @spatial[spatial_index2].children[node1]
      for e1 in region1
        for e2 in region2
          if e1 != e2
            p1 = @entities[e1]
            p2 = @entities[e2]
            if (p1.x - p2.x < p2.w) and (p2.x - p1.x < p1.w) and (p1.y - p2.y < p2.h) and (p2.y - p1.y < p1.h)
              cb.apply(this, [p1, p2])
    return
  get: (uuid) ->
    return @entities[uuid]
  each: (tags, cb) ->
    if cb
      for tag in tags
        for own id of @tags[tag]
          cb.apply(this, [@entities[id]])
    else
      cb = tags
      for id of @entities
        cb.apply(this, [@entities[id]])
    return
  count: (tag) ->
    if tag
      return @tag_counts[tag] or 0
    else        
      return @entityCount or 0
  find: (tag) ->
    for own id of @tags[tag]
      @entities[id]
  remove: (bullet) ->
    uuid = bullet.uuid
    if @entities[uuid]
      @entityCount -= 1
      if @entities[uuid].tags
        for tag in @entities[uuid].tags
          @tag_counts[tag] -= 1
          delete @tags[tag][uuid]
      delete @entities[uuid]
  start: () ->
    @prevFrame = new Date().getTime()
    @_frame()
  frame: (diff, total) ->
  _frame: (total) =>
    diff = total - @prevFrame
    @frame(diff, total)
    requestAnimationFrame @_frame
  playsound: (snd, opts) =>
    if @snds[snd]
      @snds[snd].play(opts)
    return
  loadsounds: (loadthese) =>
    if window.soundManager
      window.soundManager.onready () =>
        for own soundId, url of loadthese
          @snds[soundId] = window.soundManager.createSound
            id: soundId
            url: url
        return
      return
    return

