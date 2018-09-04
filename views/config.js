"use strict";
var global2 = typeof window !== 'undefined' ? window : self;
global2.config = {
    apiUrl: typeof window !== 'undefined' && window.location ? window.location.href.substr(0, window.location.href.lastIndexOf('/') + 1) + 'api/' : 'https://www.masariwallet.com/api/',
    mainnetExplorerUrl: "https://msrchain.net/",
    testnetExplorerUrl: "http://testnet.msrchain.net/",
    testnet: false,
    coinUnitPlaces: 12,
    txMinConfirms: 10,
    txCoinbaseMinConfirms: 60,
    addressPrefix: 28,
    integratedAddressPrefix: 29,
    addressPrefixTestnet: 33,
    integratedAddressPrefixTestnet: 34,
    subAddressPrefix: 52,
    subAddressPrefixTestnet: 73,
    feePerKB: new JSBigInt('400000000'),
    dustThreshold: new JSBigInt('1000000000'),
    defaultMixin: 12,
    idleTimeout: 30,
    idleWarningDuration: 20,
    coinSymbol: 'MSR',
    openAliasPrefix: "msr",
    coinName: 'Masari',
    coinUriPrefix: 'masari:',
    avgBlockTime: 120,
    maxBlockNumber: 500000000,
};
//# sourceMappingURL=config.js.map