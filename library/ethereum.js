const IotProvenance = require('./base');
const Web3 = require('web3');

class EthereumIotProvenance extends IotProvenance {
  constructor(endpoint, contractAddress, privateKey) {
    const web3 = new Web3(Web3.givenProvider || endpoint);
    const account = web3.eth.accounts.privateKeyToAccount('0x' + privateKey);
    web3.eth.accounts.wallet.add(account);
    web3.eth.defaultAccount = account.address;

    super('Ethereum', web3, contractAddress, account.address);
  }
}

module.exports = EthereumIotProvenance;
