var topojson = require('topojson'),
    d3       = require('d3'),
    Canvas   = require('canvas'),
    rw       = require('rw'),
    ss       = require('simple-statistics')

module.exports = function(argv) {
  var width = argv.width,
      height = argv.height,
      canvas = new Canvas(width, height),
      ctx = canvas.getContext('2d')

  var parts   = argv.property.split('.'),
      target  = parts.shift(),
      propkey = parts.join('.')

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.01)'
  ctx.lineJoin = 'round'
  ctx.lineWidth = 0
  ctx.antialias = 'subpixel'

  var projection = d3.geo[argv.projection]()
    .scale(width)
    .translate([width / 2, height / 2])

  var path = d3.geo.path()
    .projection(projection)
    .context(ctx)
    .pointRadius(2.5)

  var color = d3.scale.threshold()

  ctx.translate(0.5, 0.5)

  function render(file) {
    var json = JSON.parse(rw.readFileSync(file, 'utf8'))

    Object.keys(json.objects).forEach(function(obj) {


      if(obj === target) {
        var features = topojson.feature(json, json.objects[obj]).features
        var data = features.map(function(g) {
          return eval("+g.properties." + propkey)
        })

        var domain = ss.jenks(data, argv.colors.length - 1)
        color.range(argv.colors).domain(domain)

        features.forEach(function(f) {
          var val = eval("f.properties." + propkey)
          ctx.fillStyle = color(val)
          ctx.beginPath()
          path(f)
          ctx.fill()
        })
      }

      var mesh = topojson.mesh(json, json.objects[obj])

      ctx.save()
      ctx.globalCompositeOperation = 'overlay'
      ctx.beginPath()
      path(mesh)
      ctx.stroke()
      ctx.restore()
    })
  }

  argv.input.forEach(render)

  canvas.pngStream().pipe(argv.out)
}
