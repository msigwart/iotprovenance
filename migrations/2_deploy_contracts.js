const ProvenanceExample = artifacts.require("ProvenanceExample");
const ProvenanceStorageMock = artifacts.require("ProvenanceStorageMock");

module.exports = (deployer, network) => {
  if (network === "live") {
    return;
  }

  if (network === "development") {
    console.log("Deploying contracts to Ganache");

    deployer.then(async () => {
      await deployer.deploy(ProvenanceExample);
      await deployer.deploy(ProvenanceStorageMock);
      const provenanceInstance = await ProvenanceExample.deployed();
      const provenanceStorageInstance = await ProvenanceStorageMock.deployed();

      console.log('\n*************************************************************************\n');
      console.log(`Provenance Contract Address (Ganache): ${provenanceInstance.address}`);
      console.log(`Provenance Storage Contract Address (Ganache): ${provenanceStorageInstance.address}`);
      console.log('\n*************************************************************************\n');
    });
  }

  if (network === "rinkeby") {
    deployer.then(async () => {
      await deployer.deploy(ProvenanceExample);
      const provenanceInstance = await ProvenanceExample.deployed();

      console.log('\n*************************************************************************\n');
      console.log(`Provenance Contract Address (Rinkeby): ${provenanceInstance.address}`);
      console.log('\n*************************************************************************\n');
    });
  }

  if (network === "ropsten") {
    deployer.then(async () => {
      await deployer.deploy(ProvenanceExample);
      const provenanceInstance = await ProvenanceExample.deployed();

      console.log('\n*************************************************************************\n');
      console.log(`Provenance Contract Address (Ropsten): ${provenanceInstance.address}`);
      console.log('\n*************************************************************************\n');
    });
  }


};
