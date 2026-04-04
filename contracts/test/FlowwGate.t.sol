// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../src/FlowwGate.sol";

contract FlowwGateTest is Test {
    FlowwGate public gate;

    address public treasury = makeAddr("treasury");
    address public creator = makeAddr("creator");
    address public fan = makeAddr("fan");

    uint256 public constant PASS_PRICE = 0.1 ether;
    uint256 public constant MAX_SUPPLY = 100;
    string public constant PASS_URI = "ipfs://QmTest123";

    function setUp() public {
        gate = new FlowwGate(treasury);
        vm.deal(fan, 100 ether);
    }

    // --- createPass ---

    function test_createPass() public {
        vm.prank(creator);
        uint256 passId = gate.createPass(PASS_PRICE, MAX_SUPPLY, PASS_URI);

        assertEq(passId, 0);
        (
            address passCreator,
            uint256 price,
            uint256 maxSupply,
            uint256 minted,
            string memory uri,
            bool active
        ) = gate.passes(0);

        assertEq(passCreator, creator);
        assertEq(price, PASS_PRICE);
        assertEq(maxSupply, MAX_SUPPLY);
        assertEq(minted, 0);
        assertEq(uri, PASS_URI);
        assertTrue(active);
    }

    function test_createPass_revertZeroSupply() public {
        vm.prank(creator);
        vm.expectRevert("Max supply must be > 0");
        gate.createPass(PASS_PRICE, 0, PASS_URI);
    }

    function test_createPass_freePass() public {
        vm.prank(creator);
        uint256 passId = gate.createPass(0, MAX_SUPPLY, PASS_URI);
        assertEq(passId, 0);
    }

    // --- mintPass ---

    function test_mintPass_success() public {
        vm.prank(creator);
        gate.createPass(PASS_PRICE, MAX_SUPPLY, PASS_URI);

        uint256 creatorBefore = creator.balance;
        uint256 treasuryBefore = treasury.balance;

        vm.prank(fan);
        gate.mintPass{value: PASS_PRICE}(0);

        uint256 expectedFee = (PASS_PRICE * 250) / 10000;
        uint256 expectedNet = PASS_PRICE - expectedFee;

        assertEq(creator.balance - creatorBefore, expectedNet);
        assertEq(treasury.balance - treasuryBefore, expectedFee);
        assertEq(gate.balanceOf(fan, 0), 1);
        assertTrue(gate.hasAccess(fan, 0));
    }

    function test_mintPass_emitsEvent() public {
        vm.prank(creator);
        gate.createPass(PASS_PRICE, MAX_SUPPLY, PASS_URI);

        vm.expectEmit(true, true, false, true);
        emit FlowwGate.PassMinted(0, fan);

        vm.prank(fan);
        gate.mintPass{value: PASS_PRICE}(0);
    }

    function test_mintPass_revertInsufficientPayment() public {
        vm.prank(creator);
        gate.createPass(PASS_PRICE, MAX_SUPPLY, PASS_URI);

        vm.prank(fan);
        vm.expectRevert("Insufficient payment");
        gate.mintPass{value: 0.05 ether}(0);
    }

    function test_mintPass_revertSoldOut() public {
        vm.prank(creator);
        gate.createPass(PASS_PRICE, 1, PASS_URI); // maxSupply = 1

        vm.prank(fan);
        gate.mintPass{value: PASS_PRICE}(0);

        address fan2 = makeAddr("fan2");
        vm.deal(fan2, 1 ether);

        vm.prank(fan2);
        vm.expectRevert("Sold out");
        gate.mintPass{value: PASS_PRICE}(0);
    }

    function test_mintPass_revertInactive() public {
        vm.prank(creator);
        gate.createPass(PASS_PRICE, MAX_SUPPLY, PASS_URI);

        vm.prank(creator);
        gate.deactivatePass(0);

        vm.prank(fan);
        vm.expectRevert("Pass not active");
        gate.mintPass{value: PASS_PRICE}(0);
    }

    // --- hasAccess ---

    function test_hasAccess_falseIfNotMinted() public {
        vm.prank(creator);
        gate.createPass(PASS_PRICE, MAX_SUPPLY, PASS_URI);

        assertFalse(gate.hasAccess(fan, 0));
    }

    // --- uri ---

    function test_uri() public {
        vm.prank(creator);
        gate.createPass(PASS_PRICE, MAX_SUPPLY, PASS_URI);

        assertEq(gate.uri(0), PASS_URI);
    }

    // --- deactivatePass ---

    function test_deactivatePass() public {
        vm.prank(creator);
        gate.createPass(PASS_PRICE, MAX_SUPPLY, PASS_URI);

        vm.prank(creator);
        gate.deactivatePass(0);

        (,,,,, bool active) = gate.passes(0);
        assertFalse(active);
    }

    function test_deactivatePass_revertNotCreator() public {
        vm.prank(creator);
        gate.createPass(PASS_PRICE, MAX_SUPPLY, PASS_URI);

        vm.prank(fan);
        vm.expectRevert("Not pass creator");
        gate.deactivatePass(0);
    }

    // --- Fuzz ---

    function testFuzz_mintPass_feeCalculation(uint256 price) public {
        price = bound(price, 1, 10 ether);

        vm.prank(creator);
        gate.createPass(price, MAX_SUPPLY, PASS_URI);

        vm.deal(fan, price);

        uint256 expectedFee = (price * 250) / 10000;
        uint256 expectedNet = price - expectedFee;

        uint256 creatorBefore = creator.balance;
        uint256 treasuryBefore = treasury.balance;

        vm.prank(fan);
        gate.mintPass{value: price}(0);

        assertEq(creator.balance - creatorBefore, expectedNet);
        assertEq(treasury.balance - treasuryBefore, expectedFee);
    }

    function test_mintPass_freePass() public {
        vm.prank(creator);
        gate.createPass(0, MAX_SUPPLY, PASS_URI);

        vm.prank(fan);
        gate.mintPass{value: 0}(0);

        assertEq(gate.balanceOf(fan, 0), 1);
    }
}
