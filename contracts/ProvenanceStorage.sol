pragma solidity ^0.5.0;

import "./ProvenanceCore.sol";

contract ProvenanceStorage is ProvenanceCore {

    struct ProvenanceRecord {
        uint tokenId;
        uint index;// corresponding position in the index array
        uint[] inputProvenanceIds;
        string context;
    }

    mapping (uint => ProvenanceRecord) private provenanceRecords;
    uint[] private provenanceIndex;

    function isProvenance(uint _provId) public view returns (bool isIndeed) {
        // the index of the provenance record is bigger than the index list -> provenance record does not exist
        if (provenanceRecords[_provId].index >= provenanceIndex.length) return false;

        // true, if the referenced provenance record exists
        return (provenanceIndex[provenanceRecords[_provId].index] == _provId);
    }

    function getProvenance(uint _provId) public view returns (uint tokenId, uint[] memory inputProvenanceIds, string memory context, uint index) {
        require(isProvenance(_provId), "Non-existent key");

        return (
        provenanceRecords[_provId].tokenId,
        provenanceRecords[_provId].inputProvenanceIds,
        provenanceRecords[_provId].context,
        provenanceRecords[_provId].index);
    }

    function getProvenanceCount() public view returns (uint count) {
        return provenanceIndex.length;
    }

    function getProvenanceIdAtIndex(uint _index) public view returns (uint provId) {
        require(_index < provenanceIndex.length, "Non-existent index");
        return provenanceIndex[_index];
    }

    function _createProvenance(uint _provId, uint _tokenId, uint[] memory _inputProvenanceIds, string memory _context) internal returns (uint index) {
        require(!isProvenance(_provId), "Key already exists");

        provenanceRecords[_provId].tokenId = _tokenId;
        provenanceRecords[_provId].inputProvenanceIds = _inputProvenanceIds;
        provenanceRecords[_provId].context = _context;
        provenanceRecords[_provId].index = provenanceIndex.push(_provId) - 1;   //add index to provenance record

        emit CreateProvenanceEvent(
            _provId,
            provenanceRecords[_provId].index,
            _tokenId,
            _inputProvenanceIds,
            _context
        );
        return provenanceRecords[_provId].index;
    }

    function _updateProvenance(uint _provId, uint _tokenId, uint[] memory _inputProvenanceIds, string memory _context) internal returns (bool success) {
        require(isProvenance(_provId), "Non-existent key");

        provenanceRecords[_provId].tokenId = _tokenId;
        provenanceRecords[_provId].inputProvenanceIds = _inputProvenanceIds;
        provenanceRecords[_provId].context = _context;

        emit UpdateProvenanceEvent(
            _provId,
            provenanceRecords[_provId].index,
            _tokenId,
            _inputProvenanceIds,
            _context
        );
        return true;
    }

    function _deleteProvenance(uint _provId) internal returns (bool success) {
        require(isProvenance(_provId), "Non-existent key");

        // Find out index of provenance record to be deleted and key of last provenance record in index
        uint recordToDelete = provenanceRecords[_provId].index;
        uint keyToMove = provenanceIndex[provenanceIndex.length-1];

        // Overwrite index of record to be deleted with key of last provenance record in index, update index in last provenance record
        provenanceIndex[recordToDelete] = keyToMove;
        provenanceRecords[keyToMove].index = recordToDelete;
        provenanceIndex.length--;

        emit DeleteProvenanceEvent(
            _provId,
            recordToDelete
        );
        emit UpdateProvenanceEvent(
            keyToMove,
            recordToDelete,
            provenanceRecords[keyToMove].tokenId,
            provenanceRecords[keyToMove].inputProvenanceIds,
            provenanceRecords[keyToMove].context
        );
        return true;
    }

}
