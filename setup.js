"use strict"

var fs = require('fs');
const childProcess = require('child_process');
const electron = require('electron');

exports.writeConfigTxt = function() {
    var configText = "\"call_timeout\" : 10, \"retry_time\" : 30, \"giveup_limit\" : 0, \"verbose_level\" : 3, \"print_motd\" : true, \"h_print_time\" : 60, \"aes_override\" : null, \"use_slow_memory\" : \"warn\", \"tls_secure_algo\" : true, \"daemon_mode\" : false, \"flush_stdout\" : false, \"output_file\" : \"\", \"httpd_port\" : 0, \"http_login\" : \"\", \"http_pass\" : \"\", \"prefer_ipv4\" : true,"
    fs.writeFile("config.txt", configText);
}

exports.writePoolsTxt = function(address) {
    var configText = "\"pool_list\" :[ {\"pool_address\" : \"" + pool + "\", \"wallet_address\" : \"" + address + "\", \"rig_id\" : \"oneclick\", \"pool_password\" : \"x\", \"use_nicehash\" : false, \"use_tls\" : false, \"tls_fingerprint\" : \"\", \"pool_weight\" : 1 }, ], \"currency\" : \"masari\","
    fs.writeFile("pools.txt", configText)
}

exports.writeCpuTxt = function() {
    var configText = "\"cpu_threads_conf\" : [ { \"low_power_mode\" : false, \"no_prefetch\" : true, \"affine_to_cpu\" : 0 }, ],"
    fs.writeFile("cpu.txt", configText);
}

exports.doConfigsExist = function() {
    if(!fs.existsSync('config.txt') || !fs.existsSync('pools.txt') || !fs.existsSync('cpu.txt')) {
      return false;
    }
    else {
      return true;
    }
}

exports.openSetupWindow = function() {
    const BrowserWindow = electron.remote.BrowserWindow;
    let win = new BrowserWindow({width:400, height: 450, frame: false, backgroundColor: '#1c222e'});
    win.on('close', function() { win = null });
    win.loadFile('setup.html');
    win.show();
}

exports.startChild = function() {
    if(this.doConfigsExist()) {
      var child;
      if (process.platform === "win32") {
        child = childProcess.spawn('msr-stak.exe');
      }
      else {
        child = childProcess.spawn('./msr-stak');
      }
      return child;
    }
    else {
      return false;
    }
}

exports.stopChild = function(child) {
    child.kill();
}
