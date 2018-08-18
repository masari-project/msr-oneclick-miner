const setup = require('../models/setup.js');
const stats = require('../models/stats.js');

if(!setup.doConfigsExist()) {
	setup.openSetupWindow();
}

var child;
var interval;


let app = new Vue({
	el: '#app',
	data: {
		hashrate:0
	},
	methods:{
		startMining: function() {
			child = setup.startChild();
			alert(child);
			if(child === false)
				setup.openSetupWindow();

			interval = setInterval(()=>{
				this.updateHashRate()
			}, 2000);
		},
		stopMining:function() {
			setup.stopChild(child);
			clearInterval(interval);
		},
		updateHashRate:function() {
			if(!child)
				this.hashRate = 0;
			else
				this.hashrate = stats.get10SecHashRate();
		}
	}
});
