// Modules to control application life and create native browser window
// const {app, BrowserWindow} = require('electron');

import {app, BrowserWindow} from "electron";
let open = require("open");

let mainWindow : any;

function createWindow () {
	// Create the browser window.
	mainWindow = new BrowserWindow(
	{
		width: 500,
		height: 900,
		center:true,
		resizable:false,
		title:'Masari OneClick Miner',
		icon:'views/imgs/icon-128x128.png',
		autoHideMenuBar:true,
	});

	mainWindow.loadFile('views/index.html');

	mainWindow.on('closed', function () {
		mainWindow = null;
	});

	mainWindow.on('new-window', function(event : any, url : string){
		event.preventDefault();
		alert('open '+url);
		open(url);
	});
}

app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
});

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
  	createWindow();
  }
});
