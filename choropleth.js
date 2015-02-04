var topojson = require('topojson'),
    d3       = require('d3'),
    Canvas   = require('canvas'),
    rw       = require('rw')

module.exports = function(argv) {
  var width = argv.width,
      height = argv.height,
      canvas = new Canvas(width, height),
      ctx = canvas.getContext('2d')

  ctx.fillStyle = '#777'
  ctx.strokeStyle = '#777'
  ctx.lineWidth = 0.5
  ctx.lineJoin = 'round'
  ctx.antialias = 'subpixel'

  var projection = d3.geo[argv.projection]()
    .scale(width)
    .translate([width / 2, height / 2])

  var path = d3.geo.path()
    .projection(projection)
    .context(ctx)
    .pointRadius(1)

  function render(file) {
    var json = JSON.parse(rw.readFileSync(file, 'utf8'))

    Object.keys(json.objects).forEach(function(obj) {
      var features = topojson.feature(json, json.objects[obj]).features

      features.forEach(function(feature) {
        ctx.beginPath()
        path(feature)
        ctx.stroke()
      })
    })
  }

  argv.input.forEach(render)

  canvas.pngStream().pipe(argv.out)
}
