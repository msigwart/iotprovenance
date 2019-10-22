class Provenance {
  constructor(id, tokenId, context, inputProvenanceIds = []) {
    this.id = id;
    this.tokenId = tokenId;
    this.context = context;
    this.inputProvenanceIds = inputProvenanceIds;
  }
}

module.exports = Provenance;