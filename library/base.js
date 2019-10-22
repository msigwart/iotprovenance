const ProvenanceContract = require('./provenance-contract');
const { check } = require('./util');

class IotProvenance {

  constructor(chainName, web3, contractAddress, ownerAddress) {

    this.web3 = web3;
    this.contractAddress = contractAddress;
    this.ownerAddress = ownerAddress;
    this.provenanceContract = new ProvenanceContract(web3, contractAddress, ownerAddress);

    let getProvenanceLineage = async (rootId, depth, ignoreError) => {
      try {
        let record = await this.provenanceContract.getProvenance(rootId);
        if (!depth) return record;

        let ancestors = {};
        for (let ancestorId of record.inputProvenanceIds) {
          ancestors[ancestorId] = await getProvenanceLineage(ancestorId, depth - 1, ignoreError);
        }
        record.inputProvenance = ancestors;
        return record;
      } catch (error) {
        if (!ignoreError) throw error;
        return {};
      }
    };

    this.getProvenance = async (provId, depth) => {
      let all = false;
      let depthLevel = 0;
      if (depth === 'all') {
        all = true;
        depthLevel = Number.MAX_VALUE;
      } else {
        try {
          depthLevel = depth ? parseInt(depth) : 0;
          check(depthLevel >= 0);
        } catch (error) {
          throw new Error("Option --depth has to be a positive number or 'all'")
        }
      }

      let lineageString = depthLevel > 0 ? "lineage of " : "";
      let depthString = depthLevel > 0 ? ` (depth: ${all ? "ALL" : depthLevel})` : "";
      console.log(`Retrieving ${lineageString}provenance record with ID ${provId}${depthString}...`);
      return getProvenanceLineage(provId, depthLevel, depthLevel > 0);
    };

    this.ERROR_OPERATION_NOT_PERMITTED = (operation) => `Operation "${operation}" is not permitted for provenance contract on ${chainName} chain`;

  }

  async createProvenance (tokenId, context, inputProvenanceIds = [], options) {
    return this.provenanceContract.createProvenance(tokenId, context, inputProvenanceIds, options);
  }

  async updateProvenance(provId, tokenId, context, inputProvenanceIds = [], options) {
    return this.provenanceContract.updateProvenance(provId, tokenId, context, inputProvenanceIds, options);
  }

  async deleteProvenance (provId, options) {
    return this.provenanceContract.deleteProvenance(provId, options);
  }

  async getAll (tokenId) {
    if (tokenId) {
      return this.provenanceContract.getAllOfToken(tokenId);
    } else {
      return this.provenanceContract.getAll();
    }
  }

  async getProvenanceAtIndex(index) {
    return this.provenanceContract.getProvenanceAtIndex(index);
  }

  async getProvenanceCount(tokenId) {
    return this.provenanceContract.getProvenanceCount(tokenId);
  }

  async getProvenanceOfTokenAtIndex(tokenId, index) {
    return this.provenanceContract.getProvenanceOfTokenAtIndex(tokenId, index);
  }

  async requestToken(quantity, options) {
    return this.provenanceContract.requestToken(options);
  }

  async tokensOf(owner) {
    return this.provenanceContract.tokensOf(owner);
  }

  async getOwner(tokenId) {
    return this.provenanceContract.ownerOf(tokenId);
  }

  async getApproved(tokenId) {
    return this.provenanceContract.getApproved(tokenId);
  }

  async transferToken(tokenId, from, to, options) {
    return this.provenanceContract.transferFrom(from, to, tokenId, options);
  }

  async approveToken(tokenId, to, options) {
    return this.provenanceContract.approve(to, tokenId, options);
  }

  async authorize(operator, isAuthorized, options) {
    return this.provenanceContract.setApprovalForAll(operator, isAuthorized, options);
  }

  async isAuthorized(operator, owner) {
    return this.provenanceContract.isApprovedForAll(owner, operator);
  }

  async depositToken() {
    throw this.ERROR_OPERATION_NOT_PERMITTED("depositToken");
  }

  async withdrawToken() {
    throw this.ERROR_OPERATION_NOT_PERMITTED("withdrawToken");
  }

  async pendingWithdrawal() {
    throw this.ERROR_OPERATION_NOT_PERMITTED("pendingWithdrawal");
  }

}

module.exports = IotProvenance;