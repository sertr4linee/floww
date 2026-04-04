// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract FlowwSubscription is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    address public treasury;
    address public usdc;
    uint256 public feeBps = 500; // 5%

    struct Plan {
        uint256 pricePerMonth; // USDC amount (6 decimals)
        bool active;
    }

    struct Subscription {
        uint256 planId;
        uint256 nextBillingDate;
        bool active;
    }

    // creator => planId => Plan
    mapping(address => mapping(uint256 => Plan)) public plans;
    // creator => next plan counter
    mapping(address => uint256) public planCounter;
    // subscriber => creator => Subscription
    mapping(address => mapping(address => Subscription)) public subscriptions;

    event PlanCreated(address indexed creator, uint256 planId, uint256 price);
    event PlanDeactivated(address indexed creator, uint256 planId);
    event Subscribed(address indexed subscriber, address indexed creator, uint256 planId);
    event Renewed(address indexed subscriber, address indexed creator, uint256 amount);
    event Cancelled(address indexed subscriber, address indexed creator);

    constructor(address _usdc, address _treasury) Ownable(msg.sender) {
        require(_usdc != address(0), "USDC cannot be zero");
        require(_treasury != address(0), "Treasury cannot be zero");
        usdc = _usdc;
        treasury = _treasury;
    }

    function createPlan(uint256 pricePerMonth) external returns (uint256) {
        require(pricePerMonth > 0, "Price must be > 0");
        uint256 planId = planCounter[msg.sender]++;
        plans[msg.sender][planId] = Plan(pricePerMonth, true);
        emit PlanCreated(msg.sender, planId, pricePerMonth);
        return planId;
    }

    function deactivatePlan(uint256 planId) external {
        require(plans[msg.sender][planId].active, "Plan not active");
        plans[msg.sender][planId].active = false;
        emit PlanDeactivated(msg.sender, planId);
    }

    function subscribe(address creator, uint256 planId) external nonReentrant {
        Plan memory plan = plans[creator][planId];
        require(plan.active, "Plan not active");
        require(!subscriptions[msg.sender][creator].active, "Already subscribed");

        _charge(msg.sender, creator, plan.pricePerMonth);

        subscriptions[msg.sender][creator] = Subscription(
            planId,
            block.timestamp + 30 days,
            true
        );

        emit Subscribed(msg.sender, creator, planId);
    }

    function renew(address subscriber, address creator) external nonReentrant {
        Subscription storage sub = subscriptions[subscriber][creator];
        require(sub.active, "No active subscription");
        require(block.timestamp >= sub.nextBillingDate, "Not due yet");

        Plan memory plan = plans[creator][sub.planId];
        require(plan.active, "Plan no longer active");

        _charge(subscriber, creator, plan.pricePerMonth);
        sub.nextBillingDate += 30 days;

        emit Renewed(subscriber, creator, plan.pricePerMonth);
    }

    function cancel(address creator) external {
        Subscription storage sub = subscriptions[msg.sender][creator];
        require(sub.active, "No active subscription");
        sub.active = false;
        emit Cancelled(msg.sender, creator);
    }

    function isActive(address subscriber, address creator) external view returns (bool) {
        Subscription memory sub = subscriptions[subscriber][creator];
        return sub.active && block.timestamp < sub.nextBillingDate;
    }

    function _charge(address subscriber, address creator, uint256 amount) internal {
        uint256 fee = (amount * feeBps) / 10000;
        uint256 net = amount - fee;
        IERC20(usdc).safeTransferFrom(subscriber, creator, net);
        IERC20(usdc).safeTransferFrom(subscriber, treasury, fee);
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
