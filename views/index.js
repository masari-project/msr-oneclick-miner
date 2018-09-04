"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var VueAnnotate_1 = require("./lib/VueAnnotate");
var miner_1 = require("../models/miner");
var PoolType;
(function (PoolType) {
    PoolType[PoolType["snipa22"] = 1] = "snipa22";
})(PoolType || (PoolType = {}));
function FormatPiconero(amount) {
    return Math.floor(amount / 1000000000000 * 100) / 100;
}
var View = /** @class */ (function (_super) {
    __extends(View, _super);
    function View(container, vueContructorParams) {
        if (vueContructorParams === void 0) { vueContructorParams = null; }
        var _this = _super.call(this, vueContructorParams) || this;
        _this.hashrateRefreshInterval = null;
        _this.pools.push({
            miningAddress: 'pool.masaricoin.com', miningDefaultPort: 3333, staticDiffSeparator: '+', name: 'Masaricoin', websiteUrl: 'https://get.masaricoin.com', apiUrl: 'https://get.masaricoin.com/api/miner/', poolType: PoolType.snipa22
        });
        _this.currentPoolMiningAddress = _this.pools[0].miningAddress;
        try {
            var writtenConfig = miner_1.Miner.readPoolTxt();
            console.log(writtenConfig);
            _this.wallet = writtenConfig.wallet;
            var poolAddress = writtenConfig.address.split(':')[0];
            var poolPort = writtenConfig.address.split(':')[1];
            for (var _i = 0, _a = _this.pools; _i < _a.length; _i++) {
                var pool = _a[_i];
                if (pool.miningAddress === poolAddress) {
                    _this.currentPoolMiningAddress = pool.miningAddress;
                }
            }
        }
        catch (e) { }
        if (!miner_1.Miner.doConfigsExist()) {
            _this.saveConfig();
        }
        setInterval(function () {
            _this.retrieveStatsFromPool();
        }, 30 * 1000);
        _this.retrieveStatsFromPool();
        return _this;
    }
    View.prototype.saveConfig = function () {
        var currentPool = this.getMiningPool();
        if (currentPool !== null) {
            miner_1.Miner.writeConfigTxt();
            miner_1.Miner.writePoolsTxt({
                wallet: this.wallet.trim(),
                address: currentPool.miningAddress + ':' + currentPool.miningDefaultPort
            });
            // Miner.writeCpuTxt();
        }
    };
    View.prototype.walletWatch = function () {
        try {
            cnUtil.decode_address(this.wallet.trim());
            this.validWallet = true;
            this.saveConfig();
        }
        catch (e) {
            console.error(e);
            this.validWallet = false;
        }
    };
    View.prototype.currentPoolMiningAddressWatch = function () {
        this.saveConfig();
    };
    View.prototype.getEarnings24H = function () {
        if (this.networkHashrate === 0)
            return 0;
        return this.hashrate / this.networkHashrate * 24 * (60 / 2) * this.lastBlockReward;
    };
    View.prototype.startMining = function () {
        var _this = this;
        this.hashrate = 0;
        try {
            miner_1.Miner.startMining().then(function (child) {
                _this.isMining = true;
                _this.hashrateRefreshInterval = setInterval(function () {
                    _this.updateHashRate();
                }, 2000);
                _this.updateHashRate();
            }).catch(function () {
                swal({
                    type: 'error',
                    title: 'Oups',
                    html: 'Please check your Anti-Virus. One file might have been deleted. Redownload the miner once you either have disable you AN or added an exclusion'
                });
            });
        }
        catch (e) {
        }
    };
    View.prototype.stopMining = function () {
        this.isMining = false;
        miner_1.Miner.stopMining();
        if (this.hashrateRefreshInterval !== null) {
            clearInterval(this.hashrateRefreshInterval);
            this.hashrateRefreshInterval = null;
        }
    };
    View.prototype.updateHashRate = function () {
        if (!this.isMining)
            this.hashrate = 0;
        else
            this.hashrate = miner_1.Miner.get10SecHashRate().all;
    };
    View.prototype.getMiningPool = function () {
        for (var _i = 0, _a = this.pools; _i < _a.length; _i++) {
            var pool = _a[_i];
            if (pool.miningAddress = this.currentPoolMiningAddress)
                return pool;
        }
        return null;
    };
    View.prototype.retrieveStatsFromPool = function () {
        var _this = this;
        var pool = this.getMiningPool();
        if (pool !== null) {
            $.ajax({
                url: 'https://api.coinmarketcap.com/v1/ticker/masari/?convert=EUR'
            }).done(function (data) {
                _this.priceBtc = data[0].price_btc;
                _this.priceUsd = data[0].price_usd;
                _this.priceEur = data[0].price_eur;
            });
            $.ajax({
                url: 'https://get.masaricoin.com/api/network/stats'
            }).done(function (data) {
                _this.networkHashrate = data.difficulty / 2 / 60;
                _this.lastBlockReward = data.value;
            });
            if (pool.poolType === PoolType.snipa22) {
                $.ajax({
                    url: pool.apiUrl + this.wallet + '/stats'
                }).done(function (apiData) {
                    _this.shares = apiData.validShares;
                    _this.totalPaid = apiData.amtPaid;
                    _this.amountDue = apiData.amtDue;
                });
            }
        }
    };
    View.prototype.openExternalLink = function (event) {
        event.preventDefault();
        if (event.srcElement !== null) {
            var url = event.srcElement.getAttribute('href');
            if (url !== null)
                require('electron').shell.openExternal(url);
        }
    };
    __decorate([
        VueAnnotate_1.VueVar(0)
    ], View.prototype, "priceBtc", void 0);
    __decorate([
        VueAnnotate_1.VueVar(0)
    ], View.prototype, "priceUsd", void 0);
    __decorate([
        VueAnnotate_1.VueVar(0)
    ], View.prototype, "priceEur", void 0);
    __decorate([
        VueAnnotate_1.VueVar(0)
    ], View.prototype, "networkHashrate", void 0);
    __decorate([
        VueAnnotate_1.VueVar(0)
    ], View.prototype, "lastBlockReward", void 0);
    __decorate([
        VueAnnotate_1.VueVar(0)
    ], View.prototype, "hashrate", void 0);
    __decorate([
        VueAnnotate_1.VueVar(0)
    ], View.prototype, "amountDue", void 0);
    __decorate([
        VueAnnotate_1.VueVar(0)
    ], View.prototype, "totalPaid", void 0);
    __decorate([
        VueAnnotate_1.VueVar('5nYWvcvNThsLaMmrsfpRLBRou1RuGtLabUwYH7v6b88bem2J4aUwsoF33FbJuqMDgQjpDRTSpLCZu3dXpqXicE2uSWS4LUP')
    ], View.prototype, "wallet", void 0);
    __decorate([
        VueAnnotate_1.VueVar('5nYWvcvNThsLaMmrsfpRLBRou1RuGtLabUwYH7v6b88bem2J4aUwsoF33FbJuqMDgQjpDRTSpLCZu3dXpqXicE2uSWS4LUP')
    ], View.prototype, "defaultWallet", void 0);
    __decorate([
        VueAnnotate_1.VueVar(0)
    ], View.prototype, "shares", void 0);
    __decorate([
        VueAnnotate_1.VueVar([])
    ], View.prototype, "pools", void 0);
    __decorate([
        VueAnnotate_1.VueVar()
    ], View.prototype, "currentPoolMiningAddress", void 0);
    __decorate([
        VueAnnotate_1.VueVar(true)
    ], View.prototype, "validWallet", void 0);
    __decorate([
        VueAnnotate_1.VueVar(false)
    ], View.prototype, "isMining", void 0);
    __decorate([
        VueAnnotate_1.VueWatched()
    ], View.prototype, "walletWatch", null);
    __decorate([
        VueAnnotate_1.VueWatched()
    ], View.prototype, "currentPoolMiningAddressWatch", null);
    __decorate([
        VueAnnotate_1.VueComputed()
    ], View.prototype, "getEarnings24H", null);
    View = __decorate([
        VueAnnotate_1.VueRequireFilter('piconero', FormatPiconero),
        VueAnnotate_1.VueClass()
    ], View);
    return View;
}(Vue));
var app = new View('#app');
//# sourceMappingURL=index.js.map