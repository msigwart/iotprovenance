const EthereumIotProvenance = require('./ethereum');
const IoTProvenance = require('base');

function onEthereum(endpoint, contractAddress, privateKey) {
  return new EthereumIotProvenance(endpoint, contractAddress, privateKey);
}

module.exports = {
  onEthereum,
  IoTProvenance
};
