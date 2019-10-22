const toProvenanceRecord = (result) => {
  return {dataId: result[0], inputProvenanceIds: result[1], context: result[2], index: result[3]};
};

const assertEqualProvenanceRecord = (recordActual, recordExpected) => {
  assert.equal(recordActual.dataId, recordExpected.dataId, "wrong dataId");
  assert.sameOrderedMembers(toNumberArray(recordActual.inputProvenanceIds), recordExpected.inputProvenanceIds, "wrong input provenance IDs");
  assert.equal(recordActual.context, recordExpected.context, "wrong context");
  assert.equal(recordActual.index, recordExpected.index, "wrong index");
};

const toNumberArray = (bigNumberArray) => {
  let numberArray = [];
  bigNumberArray.forEach((value, index) => {
    numberArray[index] = value.toNumber();
  });
  return numberArray;
};

module.exports = {
  toProvenanceRecord,
  assertEqualProvenanceRecord,
};