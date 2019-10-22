pragma solidity ^0.5.0;

contract ProvenanceCore {
    // Basic provenance functionality
    function isProvenance(uint _provId) public view returns (bool isIndeed);
    function getProvenance(uint _provId) public view returns (uint tokenId, uint[] memory inputProvenanceIds, string memory context, uint index);
    function createProvenance(uint _tokenId, string memory _context, uint[] memory _inputProvenanceIds) public returns (uint index);
    function updateProvenance(uint _provId, uint _tokenId, string memory _context, uint[] memory _inputProvenanceIds) public returns (bool success);
    function deleteProvenance(uint _provId) public returns (bool success);

    // Enumerable provenance functionality
    function getProvenanceCount() public view returns (uint count);
    function getProvenanceIdAtIndex(uint _index) public view returns (uint provId);

    // Provenance token functionality
    function requestToken() public returns (uint tokenId);
    function numberOfProvenanceRecordsFor(uint _tokenId) public view returns (uint256);
    function provenanceOfTokenByIndex(uint _tokenId, uint _index) public view returns (uint provId);

    event CreateProvenanceEvent (
        uint provId,
        uint index,
        uint indexed tokenId,
        uint[] inputProvenanceIds,
        string context);

    event UpdateProvenanceEvent (
        uint indexed provId,
        uint index,
        uint indexed tokenId,
        uint[] inputProvenanceIds,
        string context);

    event DeleteProvenanceEvent (
        uint indexed provId,
        uint index);
}
