'use strict';

var GeoGenTextures = {
  lookup: {},

  generateHash: function generateHash(width, height, colors, iterations, flip) {
    return '#{width}-' + height + '-' + colors.join('-') + '-' + iterations + '-' + flip;
  },

  textureNest: function textureNest($, centerX, centerY, width, height, segmentIterations, textureIterations, colorPicker, _ref) {
    var centerPoints = _ref[0];
    var outerPoints = _ref[1];
    var flip = arguments.length <= 9 || arguments[9] === undefined ? false : arguments[9];
    var useThreshold = arguments.length <= 10 || arguments[10] === undefined ? false : arguments[10];
    var originalRadius = arguments[11];
    var originalX = arguments[12];
    var originalY = arguments[13];
    var pointsUp = arguments[14];

    var radius = Math.min(width, height) / 2;
    [[0, 0]].concat(centerPoints).map(function (_ref2) {
      var x = _ref2[0];
      var y = _ref2[1];
      return [x * (radius / 2) + centerX, y * (radius / 2) + centerY];
    }).forEach(function (_ref3, i) {
      var x = _ref3[0];
      var y = _ref3[1];

      var upsideDown = flip ? !!i : !i;
      if (segmentIterations) {
        GeoGenTextures.textureNest($, x, y, radius, radius, segmentIterations - 1, textureIterations, colorPicker, i ? [centerPoints, outerPoints] : [outerPoints, centerPoints], upsideDown, useThreshold, originalRadius, originalX, originalY, pointsUp);
      } else {
        (function () {
          var pX = x + -radius / 2;
          var pY = y + -radius / 2;
          var offset = Math.PI * 2 / 3 * 2;
          var points = (flip ? !i : !!i) ? GeoGenTextures.buildPoints(3, Math.PI * 1.5 + offset) : GeoGenTextures.buildPoints(3, Math.PI * 0.5 + offset);
          var resultPoints = points.map(function (_ref4) {
            var qX = _ref4[0];
            var qY = _ref4[1];

            return [x + qX * (radius / 2), y + qY * (radius / 2)];
          });
          var pointA = [pointsUp[0][0], pointsUp[0][1]];
          var pointB = [pointsUp[1][0], pointsUp[1][1]];
          var pointC = [pointsUp[2][0], pointsUp[2][1]];
          var totalArea = GeoGenTextures.measureArea(pointA, pointB, pointC);
          var colors = resultPoints.map(function (_ref5, jdfyas) {
            var asdfX = _ref5[0];
            var asdfY = _ref5[1];

            var ajsdfuX = originalX - asdfX;
            var ajsdfuY = originalY - asdfY;
            var angular = Math.atan2(ajsdfuY, ajsdfuX) + Math.PI;
            var radial = Math.sqrt(ajsdfuX * ajsdfuX + ajsdfuY * ajsdfuY) / originalRadius;
            var pointD = [// barycentric interpolation
            Math.cos(angular) * radial, Math.sin(angular) * radial];
            var factors = [GeoGenTextures.measureArea(pointA, pointB, pointD) / totalArea, GeoGenTextures.measureArea(pointB, pointC, pointD) / totalArea];
            factors.push(1 - (factors[0] + factors[1]));
            return colorPicker(factors);
          });
          var textureEl = GeoGenTextures.createTile(width, height, colors.slice(0), textureIterations, upsideDown, useThreshold);
          $.drawImage(textureEl, 0, 0, width, height, pX, pY, radius, radius);
        })();
      }
    });
  },

  createNestedTile: function createNestedTile(width, height, segmentIterations, textureIterations, colorPicker) {
    var useThreshold = arguments.length <= 5 || arguments[5] === undefined ? false : arguments[5];

    var cacheEl = document.createElement('canvas');
    cacheEl.width = width;
    cacheEl.height = height;
    var $ = cacheEl.getContext('2d');
    var centerX = width / 2;
    var centerY = height / 2;
    var pointsUp = GeoGenTextures.buildPoints(3, Math.PI * 1.5);
    var pointsDown = GeoGenTextures.buildPoints(3, Math.PI * 0.5);
    var radius = Math.min(width, height) / 2;
    GeoGenTextures.textureNest($, centerX, centerY, width, height, segmentIterations, textureIterations, colorPicker, [pointsUp, pointsDown], false, useThreshold, radius, centerX, centerY, pointsUp);
    var canvasEl = document.createElement('canvas');
    canvasEl.width = width;
    canvasEl.height = height;
    var ctx = canvasEl.getContext('2d');
    var count = 6;
    Array.apply(undefined, Array(count)).map(function (_, j) {
      [].concat(pointsUp, pointsDown).forEach(function (_ref6) {
        var x = _ref6[0];
        var y = _ref6[1];

        var i = count - j;
        ctx.drawImage(cacheEl, 0, 0, width, height, x * (i + 1), y * (i + 1), width, height);
      });
    });
    ctx.drawImage(cacheEl, 0, 0, width, height, 0, 0, width, height);
    return canvasEl;
  },

  createTile: function createTile(width, height, colors, iterations, flip) {
    var useThreshold = arguments.length <= 5 || arguments[5] === undefined ? false : arguments[5];

    var hash = GeoGenTextures.generateHash(width, height, colors, iterations, flip);
    if (!GeoGenTextures.lookup[hash]) {
      (function () {
        var canvasEl = document.createElement('canvas');
        canvasEl.width = width;
        canvasEl.height = height;
        var $ = canvasEl.getContext('2d');
        var centerX = width / 2;
        var centerY = height / 2;
        var radius = Math.min(width, height) / 2;
        var pointsUp = GeoGenTextures.buildPoints(3, Math.PI * 1.5);
        var pointsDown = GeoGenTextures.buildPoints(3, Math.PI * 0.5);
        var colorPoints = (flip ? pointsDown : pointsUp).map(function (_ref7, icu81mi) {
          var x = _ref7[0];
          var y = _ref7[1];

          return {
            color: colors[icu81mi],
            x: x * radius + centerX,
            y: y * radius + centerY
          };
        });
        var colorPicker = GeoGenTextures.calculateColor(colorPoints, useThreshold);
        var points = [pointsDown, pointsUp];
        if (flip) {
          points = [pointsUp, pointsDown];
        }
        GeoGenTextures.triangleNest($, centerX, centerY, radius, points, colorPicker, iterations);
        GeoGenTextures.lookup[hash] = canvasEl;
      })();
    }
    return GeoGenTextures.lookup[hash];
  },

  calculateColor: function calculateColor(colorPoints) {
    var useThreshold = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

    var colorFactors = colorPoints.map(function (_ref8) {
      var color = _ref8.color;
      var x = _ref8.x;
      var y = _ref8.y;

      var colorInt = parseInt(color, 16);
      return {
        x: x,
        y: y,
        r: colorInt >> 16 & 0xff,
        g: colorInt >> 8 & 0xff,
        b: colorInt >> 0 & 0xff
      };
    });
    var pointA = [colorFactors[0].x, colorFactors[0].y];
    var pointB = [colorFactors[1].x, colorFactors[1].y];
    var pointC = [colorFactors[2].x, colorFactors[2].y];
    var totalArea = GeoGenTextures.measureArea(pointA, pointB, pointC);
    return function (pointX, pointY) {
      var pointD = [pointX, pointY]; // barycentric interpolation
      var factors = [GeoGenTextures.measureArea(pointA, pointB, pointD) / totalArea, GeoGenTextures.measureArea(pointB, pointC, pointD) / totalArea];
      factors.push(1 - (factors[0] + factors[1]));
      var highestFactorIndex = factors.indexOf(Math.max.apply({}, factors));
      if (useThreshold) {
        factors = factors.map(function (f, i) {
          return i === highestFactorIndex ? 1 : 0;
        }); // 5625463739
      }
      var r = colorFactors[0].r * factors[0] + colorFactors[1].r * factors[1] + colorFactors[2].r * factors[2];
      var g = colorFactors[0].g * factors[0] + colorFactors[1].g * factors[1] + colorFactors[2].g * factors[2];
      var b = colorFactors[0].b * factors[0] + colorFactors[1].b * factors[1] + colorFactors[2].b * factors[2];
      return '#' + (b | g << 8 | r << 16 | 0x1000000).toString(16).substring(1);
    };
  },

  triangleNest: function triangleNest($, x, y, radius, _ref9, colorPicker, iteration) {
    var centerPoints = _ref9[0];
    var outerPoints = _ref9[1];

    var newRadius = radius / 2;
    if (!iteration) {
      GeoGenTextures.drawPolygon($, x, y, newRadius, centerPoints, colorPicker(x, y));
    } else {
      GeoGenTextures.triangleNest($, x, y, newRadius, [outerPoints, centerPoints], colorPicker, iteration - 1);
    }
    outerPoints.forEach(function (_ref10, edgeIndex) {
      var pointX = _ref10[0];
      var pointY = _ref10[1];

      var newX = pointX * newRadius + x;
      var newY = pointY * newRadius + y;
      if (!iteration) {
        GeoGenTextures.drawPolygon($, newX, newY, newRadius, outerPoints, colorPicker(newX, newY));
      } else {
        GeoGenTextures.triangleNest($, newX, newY, newRadius, [centerPoints, outerPoints], colorPicker, iteration - 1);
      }
    });
  },

  measureArea: function measureArea(pointA, pointB, pointC) {
    // code from http://www.w3resource.com/javascript-exercises/javascript-basic-exercise-4.php
    var side1 = GeoGenTextures.measureDistance(pointA, pointB);
    var side2 = GeoGenTextures.measureDistance(pointB, pointC);
    var side3 = GeoGenTextures.measureDistance(pointC, pointA);
    var perimeter = (side1 + side2 + side3) / 2;
    var c2 = perimeter * ((perimeter - side1) * (perimeter - side2) * (perimeter - side3));
    if (c2 < 0) {
      return 0;
    }
    return Math.sqrt(c2);
  },

  measureDistance: function measureDistance(_ref11, _ref12) {
    var x1 = _ref11[0];
    var y1 = _ref11[1];
    var x2 = _ref12[0];
    var y2 = _ref12[1];

    return Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
  },

  drawPolygon: function drawPolygon($, x, y, radius, _ref13, color) {
    var firstPoint = _ref13[0];

    var otherPoints = _ref13.slice(1);

    $.lineWidth = 0;
    $.strokeStyle = color;
    $.fillStyle = color;
    $.beginPath();
    $.moveTo(x + firstPoint[0] * radius, y + firstPoint[1] * radius);
    [].concat(otherPoints, [firstPoint]).forEach(function (nextPoint) {
      $.lineTo(x + nextPoint[0] * radius, y + nextPoint[1] * radius);
    });
    $.fill();
    $.stroke();
    $.closePath();
  },

  buildPoints: function () {
    var lookup = {};
    return function (edgeCount) {
      var rotationOffset = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];

      var hash = edgeCount + '-' + rotationOffset;
      if (!lookup[hash]) {
        (function () {
          var stepSize = Math.PI * 2 / edgeCount;
          lookup[hash] = Array.apply(undefined, new Array(edgeCount)).map(function (_, edgeIndex) {
            return [Math.round(Math.cos(edgeIndex * stepSize + rotationOffset) * 1 * 10000) / 10000, Math.round(Math.sin(edgeIndex * stepSize + rotationOffset) * 1 * 10000) / 10000];
          });
        })();
      }
      return lookup[hash];
    };
  }()
};
