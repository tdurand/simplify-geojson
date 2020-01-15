var simplify = require('./simplify.js');

module.exports = function (geojson, tolerance, toleranceZ, dontClone) {
  if (!dontClone) geojson = JSON.parse(JSON.stringify(geojson)) // clone obj
  if (geojson.features) return simplifyFeatureCollection(geojson, tolerance, toleranceZ)
  else if (geojson.type && geojson.type === 'Feature') return simplifyFeature(geojson, tolerance, toleranceZ)
  else return new Error('FeatureCollection or individual Feature required')
}

module.exports.simplify = function (coordinates, tolerance, toleranceZ) {
  return simplify(coordinates, tolerance, toleranceZ)
}

// modifies in-place
function simplifyFeature (feat, tolerance, toleranceZ) {
  var geom = feat.geometry
  var type = geom.type
  if (type === 'LineString') {
    geom.coordinates = module.exports.simplify(geom.coordinates, tolerance, toleranceZ)
  } else if (type === 'Polygon' || type === 'MultiLineString') {
    for (var j = 0; j < geom.coordinates.length; j++) {
      geom.coordinates[j] = module.exports.simplify(geom.coordinates[j], tolerance, toleranceZ)
    }
  } else if (type === 'MultiPolygon') {
    for (var k = 0; k < geom.coordinates.length; k++) {
      for (var l = 0; l < geom.coordinates[k].length; l++) {
        geom.coordinates[k][l] = module.exports.simplify(geom.coordinates[k][l], tolerance, toleranceZ)
      }
    }
  }
  return feat
}

// modifies in-place
function simplifyFeatureCollection (fc, tolerance, toleranceZ) {
  // process all LineString features, skip non LineStrings
  for (var i = 0; i < fc.features.length; i++) {
    fc.features[i] = simplifyFeature(fc.features[i], tolerance, toleranceZ)
  }
  return fc
}
