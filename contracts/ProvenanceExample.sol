pragma solidity ^0.5.0;
import "./GenericProvenance.sol";
import "./Provenance.sol";

contract ProvenanceExample is Provenance, GenericProvenance("ProvenanceToken", "PROV")  {

    function createProvenance(uint _tokenId, string memory _context, uint[] memory _inputProvenanceIds) public returns (uint index) {
        return _createProvenance(_tokenId, _context, _inputProvenanceIds);
    }

    function updateProvenance(uint _provId, uint _tokenId, string memory _context, uint[] memory _inputProvenanceIds) public returns (bool success) {
        return _updateProvenance(_provId, _tokenId, _context, _inputProvenanceIds);
    }

    function deleteProvenance(uint _provId) public returns (bool success) {
        return _deleteProvenance(_provId);
    }

    function requestToken() public returns (uint tokenId) {
        return _requestToken();
    }
}

