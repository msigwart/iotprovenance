const { readFileSync } = require('fs');
const path = require('path');
const HDWalletProvider = require("@truffle/hdwallet-provider");



module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!
  // solc: {
  //   optimizer: {
  //     enabled: true,
  //     runs: 2000
  //   }
  // },
  contracts_build_directory: path.join(__dirname, './library/contracts'),
  networks: {
    development: {
      host: '127.0.0.1',
      port: 8545,
      network_id: '*',
      gas: 4700000,
    },
    rinkeby: {
      provider: function() {
        const mnemonic = readFileSync(path.join(__dirname, 'rinkeby_mnemonic'), 'utf-8');
        if (!process.env.INFURA_API_KEY) {
          throw new Error("INFURA_API_KEY env var not set");
        }
        return new HDWalletProvider(mnemonic, `https://rinkeby.infura.io/${process.env.INFURA_API_KEY}`, 0, 10);
      },
      network_id: 4,
      gasPrice: 1500000000,
      skipDryRun: true
    },
    ropsten: {
      provider: function() {
        const mnemonic = readFileSync(path.join(__dirname, 'ropsten_mnemonic'), 'utf-8');
        if (!process.env.INFURA_API_KEY) {
          throw new Error("INFURA_API_KEY env var not set");
        }
        return new HDWalletProvider(mnemonic, `https://ropsten.infura.io/${process.env.INFURA_API_KEY}`);
      },
      network_id: 3,
      gasPrice: 1500000000,
      skipDryRun: true
    },
  }
};
