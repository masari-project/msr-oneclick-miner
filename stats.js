"use strict"

const fs = require('fs');

function normalizeHashrate(value, unit) {
  var hashrate = parseFloat(value);
  if (unit === 'H/s')
    hashrate *= 1;
    if (unit === 'kH/s')
      hashrate *= 1000;
  return hashrate;
}

exports.get10SecHashRate = function () {

  var fileData = fs.readFileSync('stak-output.txt', 'utf8');

  var explodedLog = fileData.split('\n');
  var hashrateCpu10 = 0;

  for (var _i = 0, explodedLog_1 = explodedLog; _i < explodedLog_1.length; _i++) {
    var line = explodedLog_1[_i];
    var explodedLine = line.split(' ').filter(function (x) { return x; });

    if (explodedLine[0] === 'Totals' && explodedLine[1] === '(CPU):') {
      hashrateCpu10 = normalizeHashrate(explodedLine[2], explodedLine[5]);
    }
  }
  return hashrateCpu10;
}
