// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract FlowwTip is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    address public treasury;
    uint256 public feeBps = 250; // 2.5%

    event Tipped(
        address indexed from,
        address indexed creator,
        address token,
        uint256 amount,
        uint256 fee,
        string message
    );

    event TreasuryUpdated(address indexed oldTreasury, address indexed newTreasury);
    event FeeBpsUpdated(uint256 oldFeeBps, uint256 newFeeBps);

    constructor(address _treasury) Ownable(msg.sender) {
        require(_treasury != address(0), "Treasury cannot be zero");
        treasury = _treasury;
    }

    /// @notice Tip a creator in native ETH
    function tipETH(
        address payable creator,
        string calldata message
    ) external payable nonReentrant {
        require(msg.value > 0, "Amount must be > 0");
        require(creator != address(0), "Creator cannot be zero");

        uint256 fee = (msg.value * feeBps) / 10000;
        uint256 net = msg.value - fee;

        (bool sentCreator,) = creator.call{value: net}("");
        require(sentCreator, "Transfer to creator failed");

        (bool sentTreasury,) = payable(treasury).call{value: fee}("");
        require(sentTreasury, "Transfer to treasury failed");

        emit Tipped(msg.sender, creator, address(0), msg.value, fee, message);
    }

    /// @notice Tip a creator in USDC or any ERC-20
    function tipERC20(
        address creator,
        address token,
        uint256 amount,
        string calldata message
    ) external nonReentrant {
        require(amount > 0, "Amount must be > 0");
        require(creator != address(0), "Creator cannot be zero");
        require(token != address(0), "Token cannot be zero");

        uint256 fee = (amount * feeBps) / 10000;
        uint256 net = amount - fee;

        IERC20(token).safeTransferFrom(msg.sender, creator, net);
        IERC20(token).safeTransferFrom(msg.sender, treasury, fee);

        emit Tipped(msg.sender, creator, token, amount, fee, message);
    }

    function setFeeBps(uint256 _feeBps) external onlyOwner {
        require(_feeBps <= 1000, "Max 10%");
        emit FeeBpsUpdated(feeBps, _feeBps);
        feeBps = _feeBps;
    }

    function setTreasury(address _treasury) external onlyOwner {
        require(_treasury != address(0), "Treasury cannot be zero");
        emit TreasuryUpdated(treasury, _treasury);
        treasury = _treasury;
    }
}
