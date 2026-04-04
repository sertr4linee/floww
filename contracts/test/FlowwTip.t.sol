// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../src/FlowwTip.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockUSDC is ERC20 {
    constructor() ERC20("USD Coin", "USDC") {
        _mint(msg.sender, 1_000_000 * 1e6);
    }

    function decimals() public pure override returns (uint8) {
        return 6;
    }

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}

contract FlowwTipTest is Test {
    FlowwTip public tip;
    MockUSDC public usdc;

    address public owner = address(this);
    address public treasury = makeAddr("treasury");
    address public creator = makeAddr("creator");
    address public fan = makeAddr("fan");

    function setUp() public {
        tip = new FlowwTip(treasury);
        usdc = new MockUSDC();

        // Fund the fan
        vm.deal(fan, 100 ether);
        usdc.mint(fan, 10_000 * 1e6);

        // Approve the tip contract
        vm.prank(fan);
        usdc.approve(address(tip), type(uint256).max);
    }

    // --- tipETH ---

    function test_tipETH_success() public {
        uint256 creatorBefore = creator.balance;
        uint256 treasuryBefore = treasury.balance;

        vm.prank(fan);
        tip.tipETH{value: 1 ether}(payable(creator), "great content!");

        uint256 expectedFee = (1 ether * 250) / 10000; // 0.025 ETH
        uint256 expectedNet = 1 ether - expectedFee;

        assertEq(creator.balance - creatorBefore, expectedNet);
        assertEq(treasury.balance - treasuryBefore, expectedFee);
    }

    function test_tipETH_emitsEvent() public {
        uint256 expectedFee = (1 ether * 250) / 10000;

        vm.expectEmit(true, true, false, true);
        emit FlowwTip.Tipped(fan, creator, address(0), 1 ether, expectedFee, "hello");

        vm.prank(fan);
        tip.tipETH{value: 1 ether}(payable(creator), "hello");
    }

    function test_tipETH_revertZeroAmount() public {
        vm.prank(fan);
        vm.expectRevert("Amount must be > 0");
        tip.tipETH{value: 0}(payable(creator), "");
    }

    function test_tipETH_revertZeroCreator() public {
        vm.prank(fan);
        vm.expectRevert("Creator cannot be zero");
        tip.tipETH{value: 1 ether}(payable(address(0)), "");
    }

    function testFuzz_tipETH_feeCalculation(uint256 amount) public {
        amount = bound(amount, 1, 100 ether);
        vm.deal(fan, amount);

        uint256 expectedFee = (amount * 250) / 10000;
        uint256 expectedNet = amount - expectedFee;

        uint256 creatorBefore = creator.balance;
        uint256 treasuryBefore = treasury.balance;

        vm.prank(fan);
        tip.tipETH{value: amount}(payable(creator), "");

        assertEq(creator.balance - creatorBefore, expectedNet);
        assertEq(treasury.balance - treasuryBefore, expectedFee);
    }

    // --- tipERC20 ---

    function test_tipERC20_success() public {
        uint256 amount = 100 * 1e6; // 100 USDC
        uint256 expectedFee = (amount * 250) / 10000;
        uint256 expectedNet = amount - expectedFee;

        vm.prank(fan);
        tip.tipERC20(creator, address(usdc), amount, "USDC tip");

        assertEq(usdc.balanceOf(creator), expectedNet);
        assertEq(usdc.balanceOf(treasury), expectedFee);
    }

    function test_tipERC20_emitsEvent() public {
        uint256 amount = 50 * 1e6;
        uint256 expectedFee = (amount * 250) / 10000;

        vm.expectEmit(true, true, false, true);
        emit FlowwTip.Tipped(fan, creator, address(usdc), amount, expectedFee, "thanks");

        vm.prank(fan);
        tip.tipERC20(creator, address(usdc), amount, "thanks");
    }

    function test_tipERC20_revertZeroAmount() public {
        vm.prank(fan);
        vm.expectRevert("Amount must be > 0");
        tip.tipERC20(creator, address(usdc), 0, "");
    }

    function test_tipERC20_revertZeroCreator() public {
        vm.prank(fan);
        vm.expectRevert("Creator cannot be zero");
        tip.tipERC20(address(0), address(usdc), 100, "");
    }

    function test_tipERC20_revertZeroToken() public {
        vm.prank(fan);
        vm.expectRevert("Token cannot be zero");
        tip.tipERC20(creator, address(0), 100, "");
    }

    function testFuzz_tipERC20_feeCalculation(uint256 amount) public {
        amount = bound(amount, 1, 1_000_000 * 1e6);
        usdc.mint(fan, amount);

        vm.prank(fan);
        usdc.approve(address(tip), type(uint256).max);

        uint256 expectedFee = (amount * 250) / 10000;
        uint256 expectedNet = amount - expectedFee;

        uint256 creatorBefore = usdc.balanceOf(creator);
        uint256 treasuryBefore = usdc.balanceOf(treasury);

        vm.prank(fan);
        tip.tipERC20(creator, address(usdc), amount, "");

        assertEq(usdc.balanceOf(creator) - creatorBefore, expectedNet);
        assertEq(usdc.balanceOf(treasury) - treasuryBefore, expectedFee);
    }

    // --- Admin ---

    function test_setFeeBps() public {
        tip.setFeeBps(100); // 1%
        assertEq(tip.feeBps(), 100);
    }

    function test_setFeeBps_revertMax() public {
        vm.expectRevert("Max 10%");
        tip.setFeeBps(1001);
    }

    function test_setFeeBps_revertNotOwner() public {
        vm.prank(fan);
        vm.expectRevert();
        tip.setFeeBps(100);
    }

    function test_setTreasury() public {
        address newTreasury = makeAddr("newTreasury");
        tip.setTreasury(newTreasury);
        assertEq(tip.treasury(), newTreasury);
    }

    function test_setTreasury_revertZero() public {
        vm.expectRevert("Treasury cannot be zero");
        tip.setTreasury(address(0));
    }

    function test_constructorRevertZeroTreasury() public {
        vm.expectRevert("Treasury cannot be zero");
        new FlowwTip(address(0));
    }
}
