// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../src/FlowwSubscription.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockUSDC is ERC20 {
    constructor() ERC20("USD Coin", "USDC") {}

    function decimals() public pure override returns (uint8) {
        return 6;
    }

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}

contract FlowwSubscriptionTest is Test {
    FlowwSubscription public sub;
    MockUSDC public usdc;

    address public treasury = makeAddr("treasury");
    address public creator = makeAddr("creator");
    address public fan = makeAddr("fan");

    uint256 public constant PLAN_PRICE = 10 * 1e6; // 10 USDC

    function setUp() public {
        usdc = new MockUSDC();
        sub = new FlowwSubscription(address(usdc), treasury);

        // Fund fan
        usdc.mint(fan, 100_000 * 1e6);
        vm.prank(fan);
        usdc.approve(address(sub), type(uint256).max);
    }

    // --- createPlan ---

    function test_createPlan() public {
        vm.prank(creator);
        uint256 planId = sub.createPlan(PLAN_PRICE);

        assertEq(planId, 0);
        (uint256 price, bool active) = sub.plans(creator, 0);
        assertEq(price, PLAN_PRICE);
        assertTrue(active);
    }

    function test_createPlan_incrementsCounter() public {
        vm.startPrank(creator);
        sub.createPlan(PLAN_PRICE);
        uint256 planId2 = sub.createPlan(20 * 1e6);
        vm.stopPrank();

        assertEq(planId2, 1);
    }

    function test_createPlan_revertZeroPrice() public {
        vm.prank(creator);
        vm.expectRevert("Price must be > 0");
        sub.createPlan(0);
    }

    // --- subscribe ---

    function test_subscribe_success() public {
        vm.prank(creator);
        sub.createPlan(PLAN_PRICE);

        uint256 expectedFee = (PLAN_PRICE * 500) / 10000;
        uint256 expectedNet = PLAN_PRICE - expectedFee;

        vm.prank(fan);
        sub.subscribe(creator, 0);

        assertEq(usdc.balanceOf(creator), expectedNet);
        assertEq(usdc.balanceOf(treasury), expectedFee);
        assertTrue(sub.isActive(fan, creator));
    }

    function test_subscribe_revertInactivePlan() public {
        vm.prank(fan);
        vm.expectRevert("Plan not active");
        sub.subscribe(creator, 0);
    }

    function test_subscribe_revertAlreadySubscribed() public {
        vm.prank(creator);
        sub.createPlan(PLAN_PRICE);

        vm.prank(fan);
        sub.subscribe(creator, 0);

        vm.prank(fan);
        vm.expectRevert("Already subscribed");
        sub.subscribe(creator, 0);
    }

    // --- renew ---

    function test_renew_success() public {
        vm.prank(creator);
        sub.createPlan(PLAN_PRICE);

        vm.prank(fan);
        sub.subscribe(creator, 0);

        // Warp 30 days forward
        vm.warp(block.timestamp + 30 days);

        uint256 creatorBefore = usdc.balanceOf(creator);
        sub.renew(fan, creator); // anyone can call renew

        uint256 expectedFee = (PLAN_PRICE * 500) / 10000;
        uint256 expectedNet = PLAN_PRICE - expectedFee;
        assertEq(usdc.balanceOf(creator) - creatorBefore, expectedNet);
        assertTrue(sub.isActive(fan, creator));
    }

    function test_renew_revertNotDue() public {
        vm.prank(creator);
        sub.createPlan(PLAN_PRICE);

        vm.prank(fan);
        sub.subscribe(creator, 0);

        vm.expectRevert("Not due yet");
        sub.renew(fan, creator);
    }

    function test_renew_revertNoSubscription() public {
        vm.expectRevert("No active subscription");
        sub.renew(fan, creator);
    }

    function test_renew_revertDeactivatedPlan() public {
        vm.prank(creator);
        sub.createPlan(PLAN_PRICE);

        vm.prank(fan);
        sub.subscribe(creator, 0);

        vm.prank(creator);
        sub.deactivatePlan(0);

        vm.warp(block.timestamp + 30 days);

        vm.expectRevert("Plan no longer active");
        sub.renew(fan, creator);
    }

    // --- cancel ---

    function test_cancel_success() public {
        vm.prank(creator);
        sub.createPlan(PLAN_PRICE);

        vm.prank(fan);
        sub.subscribe(creator, 0);

        vm.prank(fan);
        sub.cancel(creator);

        assertFalse(sub.isActive(fan, creator));
    }

    function test_cancel_revertNoSubscription() public {
        vm.prank(fan);
        vm.expectRevert("No active subscription");
        sub.cancel(creator);
    }

    // --- isActive ---

    function test_isActive_falseAfterExpiry() public {
        vm.prank(creator);
        sub.createPlan(PLAN_PRICE);

        vm.prank(fan);
        sub.subscribe(creator, 0);

        assertTrue(sub.isActive(fan, creator));

        // Warp past expiry without renewal
        vm.warp(block.timestamp + 31 days);

        assertFalse(sub.isActive(fan, creator));
    }

    // --- deactivatePlan ---

    function test_deactivatePlan() public {
        vm.prank(creator);
        sub.createPlan(PLAN_PRICE);

        vm.prank(creator);
        sub.deactivatePlan(0);

        (, bool active) = sub.plans(creator, 0);
        assertFalse(active);
    }

    // --- Fuzz ---

    function testFuzz_subscribe_feeCalculation(uint256 price) public {
        price = bound(price, 1, 1_000_000 * 1e6);

        vm.prank(creator);
        sub.createPlan(price);

        usdc.mint(fan, price);
        vm.prank(fan);
        usdc.approve(address(sub), type(uint256).max);

        uint256 expectedFee = (price * 500) / 10000;
        uint256 expectedNet = price - expectedFee;

        uint256 creatorBefore = usdc.balanceOf(creator);
        uint256 treasuryBefore = usdc.balanceOf(treasury);

        vm.prank(fan);
        sub.subscribe(creator, 0);

        assertEq(usdc.balanceOf(creator) - creatorBefore, expectedNet);
        assertEq(usdc.balanceOf(treasury) - treasuryBefore, expectedFee);
    }
}
