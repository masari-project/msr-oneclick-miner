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

import {ChildProcess} from "child_process";
import * as fs from "fs";

const childProcess = require('child_process');

export type PoolConfig = {
	address : string,
	wallet : string
};

export class Miner {
	static minerProcess : ChildProcess|null = null;

	static writeConfigTxt() {
		let configText = "\"call_timeout\" : 10, \"retry_time\" : 30, \"giveup_limit\" : 0, \"verbose_level\" : 4, \"print_motd\" : true, \"h_print_time\" : 10, \"aes_override\" : null, \"use_slow_memory\" : \"warn\", \"tls_secure_algo\" : true, \"daemon_mode\" : false, \"flush_stdout\" : false, \"output_file\" : \"stak-output.txt\", \"httpd_port\" : 0, \"http_login\" : \"\", \"http_pass\" : \"\", \"prefer_ipv4\" : true,";
		fs.writeFile("config.txt", configText, (err: NodeJS.ErrnoException) => {});
	}

	static writePoolsTxt(config : PoolConfig) {
		let configText = "\"pool_list\" :[ {\"pool_address\" : \"" + config.address + "\", \"wallet_address\" : \"" + config.wallet + "\", \"rig_id\" : \"oneclick\", \"pool_password\" : \"x\", \"use_nicehash\" : false, \"use_tls\" : false, \"tls_fingerprint\" : \"\", \"pool_weight\" : 1 }, ], \"currency\" : \"masari\",";
		fs.writeFile("pools.txt", configText, (err: NodeJS.ErrnoException) => {})
	}

	static writeCpuTxt() {
		let configText = "\"cpu_threads_conf\" : [ { \"low_power_mode\" : false, \"no_prefetch\" : true, \"affine_to_cpu\" : 0 }, ],";
		fs.writeFile("cpu.txt", configText, (err: NodeJS.ErrnoException) => {});
	}

	static readPoolTxt() : PoolConfig{
	    let rawData : string = fs.readFileSync("pools.txt").toString().trim();
	    if(rawData[rawData.length-1] === ','){
			rawData = rawData.substr(0, rawData.length-1);
        }
        rawData = '{'+rawData+'}';
	    console.log(rawData);
	    //replace trailing characters
		rawData = rawData.replace(',]', ']');
		rawData = rawData.replace(', ]', ']');
		let data : any = JSON.parse(rawData);

	    return {
	        address: data.pool_list[0].pool_address,
			wallet: data.pool_list[0].wallet_address,
        };
    }

	static doConfigsExist() {
		// if (!fs.existsSync('config.txt') || !fs.existsSync('pools.txt') || !fs.existsSync('cpu.txt')) {
		if (!fs.existsSync('config.txt') || !fs.existsSync('pools.txt')) {
			return false;
		}
		else {
			return true;
		}
	}

	static startMining(): Promise<ChildProcess> {
		if (this.doConfigsExist()) {
			if(Miner.minerProcess !== null)
				Miner.minerProcess.kill();
			Miner.minerProcess = null;

			try {
				fs.unlinkSync('stak-output.txt');
			}catch (e) {}

			let child : ChildProcess;
			if (process.platform === "win32") {
				child = childProcess.spawn('msr-stak.exe');
			}
			else {
				child = childProcess.spawn('msr-stak');
			}

			return new Promise<ChildProcess>((resolve, reject) => {
				let childProcessError = false;
				child.on('error', function(err : any) {
					childProcessError = true;
					reject();
				});

				setTimeout(() => {
					if(!childProcessError) {
						resolve(child);
						Miner.minerProcess = child;
					}
				}, 100);
			});
		}
		else {
			return Promise.reject();
		}
	}

	static stopMining() {
		if(Miner.minerProcess !== null)
			Miner.minerProcess.kill();
		Miner.minerProcess = null;
	}


	static normalizeHashrate(value : string, unit : string) {
		let hashrate = parseFloat(value);
		if (unit === 'H/s')
			hashrate *= 1;
		if (unit === 'kH/s')
			hashrate *= 1000;
		return hashrate;
	}

	static get10SecHashRate = function () {
		let fileData = fs.readFileSync('stak-output.txt', 'utf8');

		let explodedLog = fileData.split('\n');
		let hashrateCpu10 = 0;
		let hashrateNvidia10 = 0;
		let hashrateall10 = 0;

		for (let _i = 0, explodedLog_1 = explodedLog; _i < explodedLog_1.length; _i++) {
			let line = explodedLog_1[_i];
			let explodedLine = line.split(' ').filter(function (x : string) { return x; });

			if (explodedLine[0] === 'Totals' && explodedLine[1] === '(CPU):') {
				hashrateCpu10 = Miner.normalizeHashrate(explodedLine[2], explodedLine[5]);
			}else if (explodedLine[0] === 'Totals' && explodedLine[1] === '(NVIDIA):') {
				hashrateNvidia10 = Miner.normalizeHashrate(explodedLine[2], explodedLine[5]);
			}else if (explodedLine[0] === 'Totals' && explodedLine[1] === '(ALL):') {
				hashrateall10 = Miner.normalizeHashrate(explodedLine[2], explodedLine[5]);
			}
		}
		return {
			cpu:hashrateCpu10,
			nvidia:hashrateNvidia10,
			all:hashrateall10,
		};
	};


}