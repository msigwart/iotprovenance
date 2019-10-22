const ProvenanceStorageMock = artifacts.require('./ProvenanceStorageMock');

const {expectRevert} = require('@openzeppelin/test-helpers');
const {assertEqualProvenanceRecord, toProvenanceRecord} = require('./utils');

contract('ProvenanceStorage', async (accounts) => {

  let storage;

  before(async () => {
    storage = await ProvenanceStorageMock.deployed();
  });

  beforeEach(async () => {
      const count = await storage.getProvenanceCount.call();
      for (let i=0; i<count; i++) {
        const provId = await storage.getProvenanceIdAtIndex.call(0);   // always delete the record at index 0, otherwise we might try to access an index out of bounds
        const tx = await storage.deleteProvenance(provId);
      }
  });


  it("should initialise correctly", async () => {
    const count = await storage.getProvenanceCount.call();
    assert.equal(count.valueOf(), 0, "The contract should have 0 provenance records initially");
  });


  it("should allow adding, deleting, and adding again a provenance record with the same ID", async () => {
      // create
      let expected = {
          0: {dataId: 0, inputProvenanceIds: [], context: "contextA", index: 0},
          1: {dataId: 1, inputProvenanceIds: [], context: "contextB", index: 1}
      };
      await createProvenanceRecord(storage, 0, expected[0]);
      await createProvenanceRecord(storage, 1, expected[1]);
      await checkCorrectProvenanceRecords(storage, expected);

      // delete
      expected = {
          0: {dataId: 0, inputProvenanceIds: [], context: "contextA", index: 0}
      };
      await storage.deleteProvenance(1);
      await checkCorrectProvenanceRecords(storage, expected);

      // create again
      expected = {
          0: {dataId: 0, inputProvenanceIds: [], context: "contextA", index: 0},
          1: {dataId: 1, inputProvenanceIds: [], context: "contextBModified", index: 1}
      };
      await createProvenanceRecord(storage, 1, expected[1]);
      await checkCorrectProvenanceRecords(storage, expected);
  });


  it("should create, retrieve, update, and delete provenance records correctly", async () => {

      // create first
      let expected = {
          0: {dataId: 0, inputProvenanceIds: [], context: "contextA", index: 0}
      };
      await createProvenanceRecord(storage, 0, expected[0]);
      await checkCorrectProvenanceRecords(storage, expected);

      // create second
      expected = {
          0: {dataId: 0, inputProvenanceIds: [], context: "contextA", index: 0},
          1: {dataId: 1, inputProvenanceIds: [0], context: "contextB", index: 1}
      };
      await createProvenanceRecord(storage, 1, expected[1]);
      await checkCorrectProvenanceRecords(storage, expected);

      // update first
      expected = {
          0: {dataId: 1, inputProvenanceIds: [0, 1], context: "updatedContextA", index: 0},
          1: {dataId: 1, inputProvenanceIds: [0], context: "contextB", index: 1}
      };
      await updateProvenanceRecord(storage, 0, expected[0]);
      await checkCorrectProvenanceRecords(storage, expected);

      // delete second
      expected = {
          0: {dataId: 1, inputProvenanceIds: [0, 1], context: "updatedContextA", index: 0}
      };
      await storage.deleteProvenance(1);
      await checkCorrectProvenanceRecords(storage, expected);

  });


  it("should update indices correctly when provenance records are deleted", async () => {

      // create provenance records
      let expected = {
          0: {dataId: 0, inputProvenanceIds: [], context: "contextA", index: 0},
          1: {dataId: 1, inputProvenanceIds: [], context: "contextB", index: 1},
          2: {dataId: 1, inputProvenanceIds: [], context: "contextC", index: 2},
          3: {dataId: 1, inputProvenanceIds: [], context: "contextD", index: 3}
      };
      for (let i in expected) {
          await createProvenanceRecord(storage, i, expected[i]);
      }
      await checkCorrectProvenanceRecords(storage, expected);

      // removing the record 0 causes record 3 to have index 0
      expected = {
          1: {dataId: 1, inputProvenanceIds: [], context: "contextB", index: 1},
          2: {dataId: 1, inputProvenanceIds: [], context: "contextC", index: 2},
          3: {dataId: 1, inputProvenanceIds: [], context: "contextD", index: 0}
      };
      await storage.deleteProvenance(0);
      await checkCorrectProvenanceRecords(storage, expected);

      // removing record 1 causes record 2 to have index 1
      expected = {
          2: {dataId: 1, inputProvenanceIds: [], context: "contextC", index: 1},
          3: {dataId: 1, inputProvenanceIds: [], context: "contextD", index: 0}
      };
      await storage.deleteProvenance(1);
      await checkCorrectProvenanceRecords(storage, expected);

      // removing record 3 will cause record 2 to have index 0
      expected = {
          2: {dataId: 1, inputProvenanceIds: [], context: "contextC", index: 0},
      };
      await storage.deleteProvenance(3);
      await checkCorrectProvenanceRecords(storage, expected);


  });

  it("should throw an exception when creating a provenance record with an already existent ID", async () => {
      await storage.createProvenanceMock(0, 0, [1], "contextA");
      await expectRevert.unspecified(storage.createProvenanceMock(0, 1, [], "contextB"));
  });

  it("should throw an exception when deleting non-existent provenance records", async () => {
      await expectRevert.unspecified(storage.deleteProvenance(0));
  });

  it("should throw an exception when updating non-existent provenance records", async () => {
      await expectRevert.unspecified(storage.updateProvenanceMock(0, 0, [], "context"));
  });

  it("should throw an exception when retrieving the provenance ID of an unused index", async () => {
      await expectRevert.unspecified(storage.getProvenanceIdAtIndex.call(0));
  });

  it("should throw an exception when retrieving a non-existent provenance record", async () => {
     await expectRevert.unspecified(storage.getProvenance.call(0));
  });

});

async function createProvenanceRecord(storage, id, record) {
  await storage.createProvenanceMock(id, record.dataId, record.inputProvenanceIds, record.context);
}

async function updateProvenanceRecord(storage, id, record) {
  await storage.updateProvenanceMock(id, record.dataId, record.inputProvenanceIds, record.context);
}

async function checkCorrectProvenanceRecords(storage, expected) {
  // check number of provenance records
  const count  = await storage.getProvenanceCount.call();
  assert.equal(count, Object.keys(expected).length, "wrong number of provenance records");

  // check individual records
  for (let provId in expected) {
    const isValid = await storage.isProvenance.call(provId);
    const result = await storage.getProvenance.call(provId);
    const actual = toProvenanceRecord(result);
    assert.equal(isValid, true, "not a valid provenance record");
    assertEqualProvenanceRecord(actual, expected[provId]);
  }
}


