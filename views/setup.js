const electron = require('electron');
const setup = require('../models/setup.js');

let pool;

function masaricoin() {
	pool = "pool.masaricoin.com:3333";
}

function optimusblue() {
	pool = "msr.optimusblue.com:3333";
}

function finish() {
	var address = document.getElementById('address').value;
	setup.writeConfigTxt();
	setup.writePoolsTxt(address);
	setup.writeCpuTxt();
	var thisWindow = electron.remote.getCurrentWindow();
	setTimeout( function () { thisWindow.close() } , 500);
}