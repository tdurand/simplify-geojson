/*
 (c) 2017, Vladimir Agafonkin
 Simplify.js, a high-performance JS polyline simplification library
 mourner.github.io/simplify-js
*/

(function () { 'use strict';

// to suit your point format, run search/replace for '[0]' and '[1]';
// for 3D version, see 3d branch (configurability would draw significant performance overhead)

// square distance between 2 points
function getSqDist(p1, p2) {

    var dx = p1[0] - p2[0],
        dy = p1[1] - p2[1];

    return dx * dx + dy * dy;
}

// square distance from a point to a segment
function getSqSegDist(p, p1, p2) {

    var x = p1[0],
        y = p1[1],
        dx = p2[0] - x,
        dy = p2[1] - y;

    if (dx !== 0 || dy !== 0) {

        var t = ((p[0] - x) * dx + (p[1] - y) * dy) / (dx * dx + dy * dy);

        if (t > 1) {
            x = p2[0];
            y = p2[1];

        } else if (t > 0) {
            x += dx * t;
            y += dy * t;
        }
    }

    dx = p[0] - x;
    dy = p[1] - y;

    return dx * dx + dy * dy;
}
// rest of the code doesn't care about point format

// basic distance-based simplification
function simplifyRadialDist(points, sqTolerance) {

    var prevPoint = points[0],
        newPoints = [prevPoint],
        point;

    for (var i = 1, len = points.length; i < len; i++) {
        point = points[i];

        if (getSqDist(point, prevPoint) > sqTolerance) {
            newPoints.push(point);
            prevPoint = point;
        }
    }

    if (prevPoint !== point) newPoints.push(point);

    return newPoints;
}

function simplifyDPStep(points, first, last, sqTolerance, simplified, toleranceZ) {
    var maxSqDist = sqTolerance,
        index;

    for (var i = first + 1; i < last; i++) {
        var sqDist = getSqSegDist(points[i], points[first], points[last]);
        
        // new code
        // Here improvement would be to compute steepness instead of just the deltaZ
        // console.log(`Comparing gap betweeen ${first} and ${i}`)
        if (Math.abs(points[i][2] - points[first][2]) > toleranceZ) {
            // gap to high between
            // console.log(`Gap too high between ${first} and ${i}`)
            index = i - 1;
            if(index < first + 1) {
                index = first + 1;
            }
            if(sqDist > maxSqDist) {
                maxSqDist = sqDist;
            }
            // break loop
            i = last;
        } else {
            if(sqDist > maxSqDist) {
                index = i;
                maxSqDist = sqDist;
            }
        }
        // end new code
        
    }

    // if(index === undefined) {
    //     console.log("-------")
    //     console.log(first);
    //     console.log(last);
    //     console.log("-------")
    //     console.log("-------")
    // }

    // if(index !== undefined) {
    //     console.log(maxSqDist > sqTolerance);
    //     console.log(Math.abs(points[index][2] - points[first][2]));
    // }

    // If tolerance is not reached or elevation delta is too much, re-run
    if (maxSqDist > sqTolerance || 
        index !== undefined) { // new code
        if (index - first > 1) simplifyDPStep(points, first, index, sqTolerance, simplified, toleranceZ);
        simplified.push(points[index]);
        if (last - index > 1)  simplifyDPStep(points, index, last, sqTolerance, simplified, toleranceZ);
    }
}

// simplification using Ramer-Douglas-Peucker algorithm
function simplifyDouglasPeucker(points, sqTolerance, toleranceZ) {
    var last = points.length - 1;

    var simplified = [points[0]];
    simplifyDPStep(points, 0, last, sqTolerance, simplified, toleranceZ);
    simplified.push(points[last]);

    return simplified;
}

// both algorithms combined for awesome performance
function simplify(points, tolerance, toleranceZ) {

    if (points.length <= 2) return points;

    var sqTolerance = tolerance !== undefined ? tolerance * tolerance : 1;

    // points = highestQuality ? points : simplifyRadialDist(points, sqTolerance);
    points = simplifyDouglasPeucker(points, sqTolerance, toleranceZ);

    return points;
}

// export as AMD module / Node module / browser or worker variable
if (typeof define === 'function' && define.amd) define(function() { return simplify; });
else if (typeof module !== 'undefined') {
    module.exports = simplify;
    module.exports.default = simplify;
} else if (typeof self !== 'undefined') self.simplify = simplify;
else window.simplify = simplify;

})();