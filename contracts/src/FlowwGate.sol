// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract FlowwGate is ERC1155, Ownable, ReentrancyGuard {
    address public treasury;
    uint256 public feeBps = 250; // 2.5%

    struct Pass {
        address creator;
        uint256 price;  // in ETH
        uint256 maxSupply;
        uint256 minted;
        string uri;
        bool active;
    }

    mapping(uint256 => Pass) public passes;
    uint256 public passCounter;

    event PassCreated(uint256 indexed passId, address indexed creator, uint256 price, uint256 maxSupply);
    event PassMinted(uint256 indexed passId, address indexed buyer);

    constructor(address _treasury) ERC1155("") Ownable(msg.sender) {
        require(_treasury != address(0), "Treasury cannot be zero");
        treasury = _treasury;
    }

    function createPass(
        uint256 price,
        uint256 maxSupply,
        string calldata _uri
    ) external returns (uint256) {
        require(maxSupply > 0, "Max supply must be > 0");
        uint256 passId = passCounter++;
        passes[passId] = Pass(
            msg.sender, price, maxSupply, 0, _uri, true
        );
        emit PassCreated(passId, msg.sender, price, maxSupply);
        return passId;
    }

    function deactivatePass(uint256 passId) external {
        require(passes[passId].creator == msg.sender, "Not pass creator");
        passes[passId].active = false;
    }

    function mintPass(uint256 passId) external payable nonReentrant {
        Pass storage pass = passes[passId];
        require(pass.active, "Pass not active");
        require(msg.value >= pass.price, "Insufficient payment");
        require(pass.minted < pass.maxSupply, "Sold out");

        uint256 fee = (msg.value * feeBps) / 10000;
        uint256 net = msg.value - fee;

        (bool sentCreator,) = payable(pass.creator).call{value: net}("");
        require(sentCreator, "Transfer to creator failed");

        (bool sentTreasury,) = payable(treasury).call{value: fee}("");
        require(sentTreasury, "Transfer to treasury failed");

        pass.minted++;
        _mint(msg.sender, passId, 1, "");
        emit PassMinted(passId, msg.sender);
    }

    function uri(uint256 passId) public view override returns (string memory) {
        return passes[passId].uri;
    }

    function hasAccess(address user, uint256 passId) external view returns (bool) {
        return balanceOf(user, passId) > 0;
    }

    function setFeeBps(uint256 _feeBps) external onlyOwner {
        require(_feeBps <= 1000, "Max 10%");
        feeBps = _feeBps;
    }

    function setTreasury(address _treasury) external onlyOwner {
        require(_treasury != address(0), "Treasury cannot be zero");
        treasury = _treasury;
    }
}
