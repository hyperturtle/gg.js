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

