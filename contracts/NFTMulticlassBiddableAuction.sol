// SPDX-License-Identifier: GPL

pragma solidity ^0.8.0;

abstract contract ReentrancyGuard {
    // Booleans are more expensive than uint256 or any type that takes up a full
    // word because each write operation emits an extra SLOAD to first read the
    // slot's contents, replace the bits taken up by the boolean, and then write
    // back. This is the compiler's defense against contract upgrades and
    // pointer aliasing, and it cannot be disabled.

    // The values being non-zero value makes deployment a bit more expensive,
    // but in exchange the refund on every call to nonReentrant will be lower in
    // amount. Since refunds are capped to a percentage of the total
    // transaction's gas, it is best to keep them low in cases like this one, to
    // increase the likelihood of the full refund coming into effect.
    uint256 private constant _NOT_ENTERED = 1;
    uint256 private constant _ENTERED = 2;

    uint256 private _status;

    constructor() {
        _status = _NOT_ENTERED;
    }

    /**
     * @dev Prevents a contract from calling itself, directly or indirectly.
     * Calling a `nonReentrant` function from another `nonReentrant`
     * function is not supported. It is possible to prevent this from happening
     * by making the `nonReentrant` function external, and making it call a
     * `private` function that does the actual work.
     */
    modifier nonReentrant() {
        // On the first call to nonReentrant, _notEntered will be true
        require(_status != _ENTERED, "ReentrancyGuard: reentrant call");

        // Any calls to nonReentrant after this point will fail
        _status = _ENTERED;

        _;

        // By storing the original value once again, a refund is triggered (see
        // https://eips.ethereum.org/EIPS/eip-2200)
        _status = _NOT_ENTERED;
    }
}

abstract contract Context {
    function _msgSender() internal view virtual returns (address) {
        return msg.sender;
    }
}

abstract contract Ownable is Context {
    address internal _owner;

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    /**
     * @dev Initializes the contract setting the deployer as the initial owner.
    constructor() {
        _transferOwnership(_msgSender());
    }
    */

    /**
     * @dev Returns the address of the current owner.
     */
    function owner() public view virtual returns (address) {
        return _owner;
    }

    /**
     * @dev Throws if called by any account other than the owner.
     */
    modifier onlyOwner() {
        require(owner() == _msgSender(), "Ownable: caller is not the owner");
        _;
    }

    /**
     * @dev Leaves the contract without owner. It will not be possible to call
     * `onlyOwner` functions anymore. Can only be called by the current owner.
     *
     * NOTE: Renouncing ownership will leave the contract without an owner,
     * thereby removing any functionality that is only available to the owner.
     */
    /*
    function renounceOwnership() public virtual onlyOwner {
        _transferOwnership(address(0));
    }
    */
    /**
     * @dev Transfers ownership of the contract to a new account (`newOwner`).
     * Can only be called by the current owner.
     */
    function transferOwnership(address newOwner) public virtual onlyOwner {
        require(newOwner != address(0), "Ownable: new owner is the zero address");
        _transferOwnership(newOwner);
    }

    /**
     * @dev Transfers ownership of the contract to a new account (`newOwner`).
     * Internal function without access restriction.
     */
    function _transferOwnership(address newOwner) internal virtual {
        address oldOwner = _owner;
        _owner = newOwner;
        emit OwnershipTransferred(oldOwner, newOwner);
    }
}

contract ActivatedByOwner is Ownable {
    bool public active = true;

    function setActive(bool _active) public  onlyOwner
    {
        active = _active;
    }

    modifier onlyActive
    {
        require(active, "This contract is deactivated by owner");
        _;
    }
}

interface NFTInterface {
    function mintWithClass(uint256 classId) external returns (uint256 _newTokenID);
    function transfer(address _to, uint256 _tokenId, bytes calldata _data) external returns (bool);
    function addPropertyWithContent(uint256 _tokenId, string calldata _content) external;
}

contract NFTMulticlassBiddableAuction is ActivatedByOwner, ReentrancyGuard {

    event AuctionCreated(uint256 indexed tokenClassAuctionID, uint256 timestamp);
    event NFTContractSet(address indexed newNFTContract, address indexed oldNFTContract);
    event RevenueWithdrawal(uint256 amount);
    event RoundEnd(uint256 indexed tokenClassAuctionID, address indexed winner, uint256 indexed acquiredTokenID);
    event NewRound(uint256 indexed tokenClassAuctionID, uint256 indexed startTimestamp, uint256 indexed endTimestamp);

    address public nft_contract;

    struct NFTBiddableAuctionClass
    {
        uint256 max_supply;
        uint256 amount_sold;
        uint256 start_timestamp;
        uint256 duration;
        uint256 min_priceInWei;
        uint256 highest_bid;
        address winner;
        string[] configuratin_properties;
    }

    struct NFTBidClass
    {
        uint256 classID;
        address owner;
        uint256 bid_amount;
        uint256 bid_timestamp;
    }

    mapping (uint256 => NFTBidClass) public bids; // Mapping all bids
    uint256 public nextBidIndex = 0; //Bids index

    mapping (uint256 => NFTBiddableAuctionClass) public auctions; // Mapping from classID (at NFT contract) to set of variables
                                                                  //  defining the auction for this token class.
    uint256 public revenue_amount; // total amount of revenue

    address payable public revenue = payable(0x01000B5fE61411C466b70631d7fF070187179Bbf); // This address has the rights to withdraw funds from the auction.

    constructor()
    {
        _owner = msg.sender;
    }

    function createNFTAuction(
        uint256 _classID, 
        uint256 _max_supply, 
        uint256 _start_timestamp, 
        uint256 _duration, 
        uint256 _minPriceInWEI,
        uint256 _already_sold 
    ) public onlyOwner
    {
        auctions[_classID].max_supply      = _max_supply;
        auctions[_classID].amount_sold     = _already_sold;
        auctions[_classID].start_timestamp = _start_timestamp;
        auctions[_classID].duration        = _duration;
        auctions[_classID].min_priceInWei  = _minPriceInWEI;
        auctions[_classID].winner          = owner();

        emit AuctionCreated(_classID, block.timestamp);
    }

    function setRevenueAddress(address payable _revenue_address) public onlyOwner {
        revenue = _revenue_address;
    }

    function setNFTContract(address _nftContract) public onlyOwner
    {
        emit NFTContractSet(nft_contract, _nftContract);

        nft_contract = _nftContract;
    }
    
    function bidOnNFT(uint256 _classID) public payable onlyActive
    {
        uint256 bid = msg.value;
        uint256 min_price = auctions[_classID].min_priceInWei;
        uint256 start = auctions[_classID].start_timestamp;
        uint256 max_supply = auctions[_classID].max_supply;
        address payable bidder = payable(msg.sender);
        bool sent;

        require(start < block.timestamp, "Auction did not start yet");
        require(min_price != 0, "Min price is not configured by the owner");
        require(max_supply > auctions[_classID].amount_sold, "All NFTs of this artwork are already sold");
        require(
            bid >= auctions[_classID].highest_bid + auctions[_classID].highest_bid/20,
            "Does not outbid current winner by 5%"
        );
        require(bid >= auctions[_classID].highest_bid + 1 ether, "Does not outbid current winner by 1 CLO");
        require(bid >= min_price, "Min price criteria is not met");

        if(start + auctions[_classID].duration < block.timestamp)
        {
            endRound(_classID);
            if(max_supply > auctions[_classID].amount_sold){
                sent = bidder.send(bid - min_price);
                bid = min_price;                
            }else{
                sent = bidder.send(bid);
            }
        }

        if(auctions[_classID].highest_bid > 0){
           sent = payable(auctions[_classID].winner).send(auctions[_classID].highest_bid); 
        }        

        auctions[_classID].winner      = bidder;
        auctions[_classID].highest_bid = bid;

        bids[nextBidIndex].classID = _classID;
        bids[nextBidIndex].owner = bidder;
        bids[nextBidIndex].bid_amount = bid;
        bids[nextBidIndex].bid_timestamp = block.timestamp;

        nextBidIndex++;

    }

    function resetRound(uint256 _classID) internal
    {
        auctions[_classID].winner          = owner();
        auctions[_classID].highest_bid     = 0;
        auctions[_classID].start_timestamp = block.timestamp + 600;

        emit NewRound(_classID, auctions[_classID].start_timestamp, auctions[_classID].start_timestamp + auctions[_classID].duration);
    }

    function endRound(uint256 _classID) public nonReentrant
    {
        require(block.timestamp > auctions[_classID].start_timestamp + auctions[_classID].duration, "Auction is still in progress");
        require(auctions[_classID].max_supply > auctions[_classID].amount_sold, "All NFTs of this artwork are already sold");
        auctions[_classID].amount_sold++;

        uint256 _mintedId = NFTInterface(nft_contract).mintWithClass(_classID);
        configureNFT(_mintedId, _classID);

        NFTInterface(nft_contract).transfer(auctions[_classID].winner, _mintedId, "");

        emit RoundEnd(_classID, auctions[_classID].winner, _mintedId);
        revenue_amount += auctions[_classID].highest_bid;

        if(auctions[_classID].amount_sold != auctions[_classID].max_supply)
        {
            resetRound(_classID);
        }
    }

    function configureNFT(uint256 _tokenId, uint256 _classId) internal
    {
        //Add Serial Number to the created Token
        uint256 tokenSerialNumber = auctions[_classId].amount_sold;
        NFTInterface(nft_contract).addPropertyWithContent(_tokenId, toString(tokenSerialNumber));
    }

    function withdrawRevenue() public onlyOwner
    {
        require(msg.sender == revenue, "This action requires revenue permission");

        uint256 toPay = revenue_amount;

        revenue_amount = 0;

        bool sent = revenue.send(toPay);

        emit RevenueWithdrawal(toPay);
    }

    function toString(uint256 value) internal pure returns (string memory) {
        // Inspired by OraclizeAPI's implementation - MIT licence
        // https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/utils/Strings.sol#L15-L35

        if (value == 0) {
            return "0";
        }
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }
}