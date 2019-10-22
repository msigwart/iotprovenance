const abi = require("./contracts/Provenance.json").abi;
const Provenance = require("./provenance");

const EXTRA_GAS_BUFFER = 5000;
const DEFAULT_GAS_PRICE = 1000000000; // in Wei

class ProvenanceContract {
  constructor(web3, contractAddress, ownerAddress) {
    this.ownerAddress = ownerAddress;
    this.contractAddress = contractAddress;
    this.instance = new web3.eth.Contract(abi, contractAddress, {
      from: ownerAddress
    });
  }

  async getProvenance(provId) {
    const result = await this.instance.methods.getProvenance(provId).call();
    return new Provenance(provId, result.tokenId, result.context, result.inputProvenanceIds);
  }

  async getProvenanceCount(tokenId) {
    if (tokenId) {
      return await this.instance.methods.numberOfProvenanceRecordsFor(tokenId).call({
        from: this.ownerAddress
      });
    }

    return await this.instance.methods.getProvenanceCount().call({
      from: this.ownerAddress
    });
  }

  async getProvenanceAtIndex(index) {
    const provId = await this.instance.methods.getProvenanceIdAtIndex(index).call({
      from: this.ownerAddress
    });
    return await this.getProvenance(provId);
  }

  async getProvenanceOfTokenAtIndex(tokenId, index) {
    const provId = await this.instance.methods.provenanceOfTokenByIndex(tokenId, index).call({
      from: this.ownerAddress
    });
    return await this.getProvenance(provId);
  }

  async getAll() {
    const result = await this.instance.methods.getProvenanceCount().call({
      from: this.ownerAddress
    });
    let provenanceIds = [];
    for (let i=0; i<result; i++) {
      provenanceIds.push(await this.instance.methods.getProvenanceIdAtIndex(i).call({
        from: this.ownerAddress
      }));
    }
    return provenanceIds;
  }

  async getAllOfToken(tokenId) {
    const result = await this.instance.methods.numberOfProvenanceRecordsFor(tokenId).call();
    let provenanceIds = [];
    for (let i=0; i<result; i++) {
      provenanceIds.push(await this.instance.methods.provenanceOfTokenByIndex(tokenId, i).call());
    }
    return provenanceIds;
  };

  async tokensOf(owner) {
    let owningAddress = owner ? owner : this.ownerAddress;
    const balance = await this.instance.methods.balanceOf(owningAddress).call({
      from: this.ownerAddress
    });
    let tokenIds = [];
    for (let i=0; i<balance; i++) {
      let tokenId = await this.instance.methods.tokenOfOwnerByIndex(owningAddress, i).call({
        from: this.ownerAddress
      });
      tokenIds.push(tokenId);
    }
    return tokenIds;
  };

  async ownerOf(tokenId) {
    return await this.instance.methods.ownerOf(tokenId).call();
  };

  async getApproved(tokenId) {
    return await this.instance.methods.getApproved(tokenId).call();
  };

  async isApprovedForAll(owner, operator) {
    return await this.instance.methods.isApprovedForAll(owner, operator).call();
  };

  async createProvenance(tokenId, context, inputProvenanceIds = [], options) {
    let defaultOptions = {
      gasPrice: DEFAULT_GAS_PRICE,
      wait: true,
    };
    options = Object.assign(defaultOptions, options);

    let gasEstimate = await this.instance.methods.createProvenance(tokenId, context, inputProvenanceIds).estimateGas({
      from: this.ownerAddress
    });

    let eventEmitter = this.instance.methods.createProvenance(tokenId, context, inputProvenanceIds).send({
      from: this.ownerAddress,
      gas: gasEstimate + EXTRA_GAS_BUFFER,
      gasPrice: options.gasPrice,
      nonce: options.nonce
    });

    return transactionPromise(eventEmitter, options.wait);
  };

  async updateProvenance(provId, tokenId, context, inputProvenanceIds = [], options) {
    let defaultOptions = {
      gasPrice: DEFAULT_GAS_PRICE,
      wait: true,
    };
    options = Object.assign(defaultOptions, options);

    let gasEstimate = await this.instance.methods.updateProvenance(provId, tokenId, context, inputProvenanceIds).estimateGas({
      from: this.ownerAddress
    });
    // console.log(gasEstimate);
    let eventEmitter = this.instance.methods.updateProvenance(provId, tokenId, context, inputProvenanceIds).send({
      from: this.ownerAddress,
      gas: gasEstimate + EXTRA_GAS_BUFFER,
      gasPrice: options.gasPrice
    });

    return transactionPromise(eventEmitter, options.wait)
  };

  async deleteProvenance(provId, options) {
    let defaultOptions = {
      gasPrice: DEFAULT_GAS_PRICE,
      wait: true,
    };
    options = Object.assign(defaultOptions, options);

    let gasEstimate = await this.instance.methods.deleteProvenance(provId).estimateGas({
      from: this.ownerAddress
    });
    let eventEmitter = this.instance.methods.deleteProvenance(provId).send({
      from: this.ownerAddress,
      gas: gasEstimate + EXTRA_GAS_BUFFER,
      gasPrice: options.gasPrice
    });

    return transactionPromise(eventEmitter, options.wait);
  };

  async requestToken(options) {
    let defaultOptions = {
      gasPrice: DEFAULT_GAS_PRICE,
      wait: true,
    };
    options = Object.assign(defaultOptions, options);

    let gasEstimate = await this.instance.methods.requestToken().estimateGas({
      from: this.ownerAddress
    });
    let eventEmitter = this.instance.methods.requestToken().send({
      from: this.ownerAddress,
      gas: gasEstimate + EXTRA_GAS_BUFFER,
      gasPrice: options.gasPrice
    });

    return transactionPromise(eventEmitter, options.wait);
  };

  async transferFrom(from, to, tokenId, options) {
    let defaultOptions = {
      gasPrice: DEFAULT_GAS_PRICE,
      wait: true,
    };
    options = Object.assign(defaultOptions, options);

    let gasEstimate = await this.instance.methods.safeTransferFrom(from, to, tokenId).estimateGas({
      from: this.ownerAddress
    });
    let eventEmitter = this.instance.methods.safeTransferFrom(from, to, tokenId).send({
      from: this.ownerAddress,
      gas: gasEstimate + EXTRA_GAS_BUFFER,
      gasPrice: options.gasPrice
    });

    return transactionPromise(eventEmitter, options.wait);
  };

  async approve(to, tokenId, options) {
    let defaultOptions = {
      gasPrice: DEFAULT_GAS_PRICE,
      wait: true,
    };
    options = Object.assign(defaultOptions, options);

    let gasEstimate = await this.instance.methods.approve(to, tokenId).estimateGas({
      from: this.ownerAddress
    });
    let eventEmitter = this.instance.methods.approve(to, tokenId).send({
      from: this.ownerAddress,
      gas: gasEstimate + EXTRA_GAS_BUFFER,
      gasPrice: options.gasPrice
    });

    return transactionPromise(eventEmitter, options.wait);
  };

  async setApprovalForAll(operator, approved, options) {
    let defaultOptions = {
      gasPrice: DEFAULT_GAS_PRICE,
      wait: true,
    };
    options = Object.assign(defaultOptions, options);

    let gasEstimate = await this.instance.methods.setApprovalForAll(operator, approved).estimateGas({
      from: this.ownerAddress
    });
    let eventEmitter = this.instance.methods.setApprovalForAll(operator, approved).send({
      from: this.ownerAddress,
      gas: gasEstimate + EXTRA_GAS_BUFFER,
      gasPrice: options.gasPrice
    });

    return transactionPromise(eventEmitter, options.wait)
  };
}

function transactionPromise(eventEmitter, wait) {
  return new Promise((resolve, reject) => {
    eventEmitter.on("transactionHash", (hash) => {
      if (!wait) {
        eventEmitter.removeAllListeners();
        resolve(hash);
      }
    });

    eventEmitter.on("receipt", receipt => {
      eventEmitter.removeAllListeners();
      resolve(receipt);
    });

    eventEmitter.on("error", error => {
      console.log("Could not send transaction.");
      eventEmitter.removeAllListeners();
      reject(error);
    });
  });
}

module.exports = ProvenanceContract;
