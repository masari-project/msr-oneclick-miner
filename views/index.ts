
import {VueClass, VueComputed, VueRequireFilter, VueVar, VueWatched} from "./lib/VueAnnotate";
import Timer = NodeJS.Timer;
import {Miner} from "../models/miner";
import webContents = Electron.webContents;
import {ChildProcess} from "child_process";

enum PoolType{
	snipa22=1,
	dvandal=2
}

type PoolStruct = {
	miningAddress:string,
	miningDefaultPort:number,
	staticDiffSeparator:string,
	name:string,
	websiteUrl:string,
	apiUrl:string,
	poolType:PoolType
};

function FormatPiconero(amount : number){
	return Math.floor(amount / 1000000000000 * 100)/100;
}

@VueRequireFilter('piconero', FormatPiconero)
@VueClass()
class View extends Vue{

	@VueVar(0) priceBtc !: number;
	@VueVar(0) priceUsd !: number;
	@VueVar(0) priceEur !: number;

	@VueVar(0) networkHashrate !: number;
	@VueVar(0) lastBlockReward !: number;

	@VueVar(0) hashrate !: number;
	@VueVar(0) amountDue !: number;
	@VueVar(0) totalPaid !: number;

	@VueVar('5nYWvcvNThsLaMmrsfpRLBRou1RuGtLabUwYH7v6b88bem2J4aUwsoF33FbJuqMDgQjpDRTSpLCZu3dXpqXicE2uSWS4LUP') wallet !: string;
	@VueVar('5nYWvcvNThsLaMmrsfpRLBRou1RuGtLabUwYH7v6b88bem2J4aUwsoF33FbJuqMDgQjpDRTSpLCZu3dXpqXicE2uSWS4LUP') defaultWallet !: string;

	@VueVar(0) shares !: number;
	@VueVar([]) pools !: Array<PoolStruct>;
	@VueVar() currentPoolMiningAddress:string;

	@VueVar(true) validWallet !: boolean;
	@VueVar(false) isMining !: boolean;

	hashrateRefreshInterval : Timer|null = null;

	constructor(container : string, vueContructorParams : VueConstructObject|null=null){
		super(vueContructorParams);

		this.pools.push(
			{
				miningAddress:'pool.masaricoin.com',
				miningDefaultPort:3333,
				staticDiffSeparator:'+',
				name:'Masaricoin',
				websiteUrl:'https://get.masaricoin.com',
				apiUrl:'https://get.masaricoin.com/api/miner/',
				poolType:PoolType.snipa22
			},
			{
				miningAddress:'msr.optimusblue.com',
				miningDefaultPort:3333,
				staticDiffSeparator:'.',
				name:'OptimusBlue',
				websiteUrl:'https://msr.optimusblue.com',
				apiUrl:'https://msr.optimusblue.com:8119/',
				poolType:PoolType.dvandal
			}
		);

		this.currentPoolMiningAddress = this.pools[0].miningAddress;

		try {
			let writtenConfig = Miner.readPoolTxt();
			console.log(writtenConfig);
			this.wallet = writtenConfig.wallet;
			let poolAddress = writtenConfig.address.split(':')[0];
			let poolPort = writtenConfig.address.split(':')[1];

			for (let pool of this.pools) {
				if (pool.miningAddress === poolAddress) {
					this.currentPoolMiningAddress = pool.miningAddress;
				}
			}
		}catch (e) {}

		if(!Miner.doConfigsExist()) {
			this.saveConfig();
		}

		setInterval(() => {
			this.retrieveStatsFromPool();
		}, 30*1000);
		this.retrieveStatsFromPool();
	}

	saveConfig(){
		let currentPool = this.getMiningPool();
		if(currentPool !== null) {
			Miner.writeConfigTxt();
			Miner.writePoolsTxt({
				wallet:this.wallet.trim(),
				address:currentPool.miningAddress + ':' + currentPool.miningDefaultPort
			});
			// Miner.writeCpuTxt();
		}
	}

	@VueWatched() walletWatch(){
		try{
			cnUtil.decode_address(this.wallet.trim());
			this.validWallet = true;
			this.saveConfig();
		}catch(e){
			console.error(e);
			this.validWallet = false;
		}
	}

	@VueWatched() currentPoolMiningAddressWatch(){
		this.saveConfig();
		this.retrieveStatsFromPool();
	}

	@VueComputed()
	getEarnings24H(){
		if(this.networkHashrate === 0)
			return 0;
		return this.hashrate/this.networkHashrate*24*(60/2)*this.lastBlockReward;
	}

	startMining() {
		this.hashrate = 0;

		try {
			Miner.startMining().then((child : ChildProcess) => {
				this.isMining = true;
				this.hashrateRefreshInterval = setInterval(() => {
					this.updateHashRate()
				}, 2000);
				this.updateHashRate();
			}).catch(function(){
				swal({
					type: 'error',
					title: 'Oups',
					html: 'Please check your Anti-Virus. One file might have been deleted. Redownload the miner once you either have disable you AN or added an exclusion'
				});
			});
		}catch (e) {
		}
	}

	stopMining() {
		this.isMining = false;
		Miner.stopMining();

		if(this.hashrateRefreshInterval !== null) {
			clearInterval(this.hashrateRefreshInterval);
			this.hashrateRefreshInterval = null;
		}
	}

	updateHashRate() {
		if(!this.isMining)
			this.hashrate = 0;
		else
			this.hashrate = Miner.get10SecHashRate().all;
	}

	getMiningPool() : PoolStruct|null{
		for(let pool of this.pools) {
			if (pool.miningAddress === this.currentPoolMiningAddress)
				return pool;
		}
		return null;
	}

	retrieveStatsFromPool(){
		let pool = this.getMiningPool();
		if(pool !== null){
			$.ajax({
				url:'https://api.coinmarketcap.com/v1/ticker/masari/?convert=EUR'
			}).done((data : any)=>{
				this.priceBtc = data[0].price_btc;
				this.priceUsd = data[0].price_usd;
				this.priceEur = data[0].price_eur;
			});

			$.ajax({
				url:'https://get.masaricoin.com/api/network/stats'
			}).done((data : any)=>{
				this.networkHashrate = data.difficulty/2/60;
				this.lastBlockReward = data.value;
			});

			if(pool.poolType === PoolType.snipa22) {
				$.ajax({
					url: pool.apiUrl + this.wallet + '/stats'
				}).done((apiData: {"hash":number,"identifier":string,"lastHash":number,"totalHashes":number,"pplnsShares":number,"validShares":number,"invalidShares":number,"amtPaid":number,"amtDue":number,"txnCount":number}) => {
					this.shares = apiData.validShares;
					this.totalPaid = apiData.amtPaid;
					this.amountDue = apiData.amtDue;
				});
			}else if(pool.poolType === PoolType.dvandal){
				$.ajax({
					url: pool.apiUrl + 'stats_address?address=' + this.wallet
				}).done((apiData:
					 {"stats"?:
							 {
							 	"hashes":string|number,
								 "lastShare":string|number,
								 "balance"?:string|number,
								 "paid"?:string|number,
								 "hashrate":number,
								 "roundScore":number,
								 "roundHashes":number,
								 "hashrate_1h":number,
								 "hashrate_6h":number,
								 "hashrate_24h":number
							 },
						 "payments"?:[string],
						 "charts"?:any,
						 "workers"?:{"name":string,"hashrate":number,"lastShare":number,"hashes":number,"hashrate_1h":number,"hashrate_6h":number,"hashrate_24h":number}[],
						 error?:string
					 }
				) => {
					this.shares = -1;
					if(typeof apiData.stats !== 'undefined') {
						this.totalPaid = typeof apiData.stats.paid !== 'undefined' ? parseFloat('' + apiData.stats.paid) : 0;
						this.amountDue = typeof apiData.stats.balance !== 'undefined' ? parseFloat('' + apiData.stats.balance) : 0;
					}else{
						this.totalPaid = 0;
						this.amountDue = 0;
					}
				});
			}
		}
	}

	openExternalLink(event : Event) {
		event.preventDefault();
		if (event.srcElement !== null) {
			let url = event.srcElement.getAttribute('href');
			if(url !== null)
				require('electron').shell.openExternal(url);
		}
	}


}

let app = new View('#app');
