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

var fs = require('fs');
const childProcess = require('child_process');
const electron = require('electron');

exports.writeConfigTxt = function() {
    var configText = "\"call_timeout\" : 10, \"retry_time\" : 30, \"giveup_limit\" : 0, \"verbose_level\" : 4, \"print_motd\" : true, \"h_print_time\" : 10, \"aes_override\" : null, \"use_slow_memory\" : \"warn\", \"tls_secure_algo\" : true, \"daemon_mode\" : false, \"flush_stdout\" : false, \"output_file\" : \"stak-output.txt\", \"httpd_port\" : 0, \"http_login\" : \"\", \"http_pass\" : \"\", \"prefer_ipv4\" : true,";
    fs.writeFile("config.txt", configText);
};

exports.writePoolsTxt = function(address) {
    var configText = "\"pool_list\" :[ {\"pool_address\" : \"" + pool + "\", \"wallet_address\" : \"" + address + "\", \"rig_id\" : \"oneclick\", \"pool_password\" : \"x\", \"use_nicehash\" : false, \"use_tls\" : false, \"tls_fingerprint\" : \"\", \"pool_weight\" : 1 }, ], \"currency\" : \"masari\",";
    fs.writeFile("pools.txt", configText)
};

exports.writeCpuTxt = function() {
    var configText = "\"cpu_threads_conf\" : [ { \"low_power_mode\" : false, \"no_prefetch\" : true, \"affine_to_cpu\" : 0 }, ],";
    fs.writeFile("cpu.txt", configText);
};

exports.doConfigsExist = function() {
    if(!fs.existsSync('config.txt') || !fs.existsSync('pools.txt') || !fs.existsSync('cpu.txt')) {
      return false;
    }
    else {
      return true;
    }
};

exports.openSetupWindow = function() {
    const BrowserWindow = electron.remote.BrowserWindow;
    let win = new BrowserWindow({width:400, height: 450, frame: false, backgroundColor: '#1c222e'});
    win.on('close', function() { win = null });
    win.loadFile('../views/setup.html');
    win.show();
};

exports.startChild = function() {
    if(this.doConfigsExist()) {
      var child;
      if (process.platform === "win32") {
        child = childProcess.spawn('../msr-stak.exe');
      }
      else {
        child = childProcess.spawn('../msr-stak');
      }
      return child;
    }
    else {
      return false;
    }
};

exports.stopChild = function(child) {
    child.kill();
};
