pragma solidity ^0.5.0;

import "./Provenance.sol";
import "./ProvenanceStorage.sol";
import 'openzeppelin-solidity/contracts/token/ERC721/ERC721.sol';
import "openzeppelin-solidity/contracts/token/ERC721/ERC721Metadata.sol";
import "openzeppelin-solidity/contracts/token/ERC721/ERC721Enumerable.sol";

contract GenericProvenance is Provenance, ERC721, ERC721Metadata, ERC721Enumerable, ProvenanceStorage {

    uint private provIdCounter;
    uint private tokenIdCounter;

    // Mapping from token ID to list of associated provenance IDs
    mapping (uint => uint[]) internal associatedProvenanceIds;

    // Mapping from provenance ID to index in associated provenance index
    mapping (uint => uint) internal associatedProvenanceIndex;


    constructor(string memory _name, string memory _symbol) ERC721Metadata(_name, _symbol) public {}

    /**
     * @dev Gets the amount of provenance records associated with the specified token ID.
     * Reverts if
     *   - the specified token ID does not exist.
     * @param _tokenId uint256 to query the amount of provenance records of.
     * @return uint256 representing the amount of provenance records associated with the specified token ID.
     */
    function numberOfProvenanceRecordsFor(uint _tokenId) public view returns (uint256) {
        return associatedProvenanceIds[_tokenId].length;
    }

    /**
     * @dev Gets the provenance ID at a given index of the provenance list of the requested token ID.
     * Reverts if
     *   - the requested index is out-of-bounds.
     * @param _tokenId uint256 owning the provenance list to be accessed.
     * @param _index uint256 representing the index to be accessed of the requested provenance list.
     * @return uint256 provenance ID at the given index of the provenance list associated with the given token ID.
     */
    function provenanceOfTokenByIndex(
        uint _tokenId,
        uint _index
    )
    public
    view
    returns (uint provId)
    {
        require(_index < numberOfProvenanceRecordsFor(_tokenId));
        return associatedProvenanceIds[_tokenId][_index];
    }

    /**
     * @dev Function to create a new provenance record.
     * Reverts if
     *   - the given token does not exist.
     *   - the sender is not the owner of the token.
     *   – the given input provenance IDs do not exist.
     * @param _tokenId               uint256 ID of the token for which to create a provenance record.
     * @param _inputProvenanceIds   uint256 array containing the IDs of the input data points of the
                                    provenance record to be created.
     * @param _context              string containing the actual context (or URI of the context) of the
                                    provenance record to be created.
     */
    function _createProvenance(
        uint _tokenId,
        string memory _context,
        uint[] memory _inputProvenanceIds
    )
    internal
    returns (uint index)
    {
        require(_exists(_tokenId));
        require(ownerOf(_tokenId) == msg.sender);
        _checkValidProvenanceRecords(_inputProvenanceIds);

        uint provId = _getProvId();
        _addAssociatedProvenance(_tokenId, provId);
        return super._createProvenance(provId, _tokenId, _inputProvenanceIds, _context);
    }

    /**
     * @dev Function to update an existing provenance record.
     * Reverts if
     *   - the provenance record of the given provenance ID does not exist.
     *   - the given updated token ID does not exist.
     *   - the sender is not the owner of the new token ID.
     *   - the sender is not the owner of the old token ID.
     *   - the provenance records of the given input provenance IDs do not exist.
     * @param _provId               uint256 ID of the provenance record to change.
     * @param _tokenId               uint256 ID of the updated token.
     * @param _inputProvenanceIds   uint256 array containing the IDs of the updated input provenance records.
     * @param _context              string containing the updated context (or URI of the context).
     */
    function _updateProvenance(
        uint _provId,
        uint _tokenId,
        string memory _context,
        uint[] memory _inputProvenanceIds
    )
    internal
    returns (bool success)
    {
        require(_exists(_tokenId));
        require(ownerOf(_tokenId) == msg.sender);
        (uint oldTokenId,,,) = getProvenance(_provId);
        require(ownerOf(oldTokenId) == msg.sender);
        _checkValidProvenanceRecords(_inputProvenanceIds);

        if (oldTokenId != _tokenId) {
            _removeAssociatedProvenance(oldTokenId, _provId);
            _addAssociatedProvenance(_tokenId, _provId);
        }
        return super._updateProvenance(_provId, _tokenId, _inputProvenanceIds, _context);
    }

    /**
     * @dev Function to delete an existing provenance record.
     * Reverts if
     *   - the provenance record of the given provenance ID does not exist.
     *   - the sender is not the owner of the token ID of the provenance record.
     * @param _provId               uint256 ID of the provenance record to delete.
     */
    function _deleteProvenance(
        uint _provId
    )
    internal
    returns (bool success)
    {
        (uint tokenId,,,) = getProvenance(_provId);
        require(ownerOf(tokenId) == msg.sender);

        _removeAssociatedProvenance(tokenId, _provId);
        return super._deleteProvenance(_provId);
    }


    /**
     * @dev Internal function to request a new ID for a data point.
     * Reverts if the given token ID already exists.
     */
    function _requestToken() internal returns (uint) {
        uint tokenId = _getTokenId();
        _mint(msg.sender, tokenId);
        return tokenId;
    }

    function _getProvId() private returns (uint) {
        return ++provIdCounter;
    }

    function _getTokenId() private returns (uint) {
        return ++tokenIdCounter;
    }

    /**
     * @dev Private function to remove the associated provenance ID of a token.
     * It does so by moving the provenance ID at the last index of associated provenance IDs
     * to the index of the provenance ID to be removed.
     * @param _tokenId uint256 token ID of which to remove the associated provenance ID.
     * @param _provId uint256 provenance ID to be removed.
     */
    function _removeAssociatedProvenance(uint _tokenId, uint _provId) private {
        uint keyToRemove = associatedProvenanceIndex[_provId];
        uint provIdToMove = associatedProvenanceIds[_tokenId][associatedProvenanceIds[_tokenId].length - 1];
        associatedProvenanceIds[_tokenId][keyToRemove] = provIdToMove;
        associatedProvenanceIndex[provIdToMove] = keyToRemove;
        associatedProvenanceIds[_tokenId].length--;
    }

    /**
     * @dev Private function to add an associated provenance ID of a token.
     * @param _tokenId uint256 token ID for which to add the associated provenance ID.
     * @param _provId uint256 provenance ID to be added.
     */
    function _addAssociatedProvenance(uint _tokenId, uint _provId) private {
        // We save the index of the provenance ID in the list of associated provenance records
        // for the token ID. This makes it easier to implement updates and deletes of provenance records.
        associatedProvenanceIndex[_provId] = associatedProvenanceIds[_tokenId].push(_provId) - 1;
    }

    function _checkValidProvenanceRecords(uint[] memory _provenanceIds) private view {
        for (uint i=0; i<_provenanceIds.length; i++) {
            require(isProvenance(_provenanceIds[i]));
        }
    }
}
