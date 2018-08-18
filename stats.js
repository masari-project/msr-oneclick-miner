/* Copyright (c) 2018 The Masari Project

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE. */

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
};
