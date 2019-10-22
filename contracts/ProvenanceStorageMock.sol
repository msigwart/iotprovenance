pragma solidity ^0.5.0;

import "./ProvenanceStorage.sol";
import "./ProvenanceCore.sol";

/**
 * @title ProvenanceStorageMock
 * This mock just provides public create/retrieve/update/delete functions for testing purposes.
 */
contract ProvenanceStorageMock is ProvenanceCore, ProvenanceStorage {

    function createProvenanceMock(uint _provId, uint _tokenId, uint[] memory _inputProvenanceIds, string memory _context) public returns (uint index) {
        return _createProvenance(_provId, _tokenId, _inputProvenanceIds, _context);
    }

    function updateProvenanceMock(uint _provId, uint _tokenId, uint[] memory _inputProvenanceIds, string memory _context) public returns (bool success) {
        return _updateProvenance(_provId, _tokenId, _inputProvenanceIds, _context);
    }

    function deleteProvenance(uint _provId) public returns (bool success) {
        return _deleteProvenance(_provId);
    }

    // Functions required by interface Provenance
    function createProvenance(uint _tokenId, string memory _context, uint[] memory _inputProvenanceIds) public returns (uint index) {require(false);}
    function updateProvenance(uint _provId, uint _tokenId, string memory _context, uint[] memory _inputProvenanceIds) public returns (bool success) {require(false);}
    function requestToken() public returns (uint tokenId) {require(false);}
    function numberOfProvenanceRecordsFor(uint _tokenId) public view returns (uint256) {require(false);}
    function provenanceOfTokenByIndex(uint _tokenId, uint _index) public view returns (uint provId) {require(false);}


}
