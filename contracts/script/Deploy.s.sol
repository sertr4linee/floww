// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/FlowwTip.sol";
import "../src/FlowwSubscription.sol";
import "../src/FlowwGate.sol";

contract Deploy is Script {
    function run() external {
        address treasury = vm.envAddress("TREASURY_ADDRESS");
        address usdc = vm.envAddress("USDC_ADDRESS");

        vm.startBroadcast();

        FlowwTip tip = new FlowwTip(treasury);
        FlowwSubscription subscription = new FlowwSubscription(usdc, treasury);
        FlowwGate gate = new FlowwGate(treasury);

        vm.stopBroadcast();

        console.log("FlowwTip deployed at:", address(tip));
        console.log("FlowwSubscription deployed at:", address(subscription));
        console.log("FlowwGate deployed at:", address(gate));
    }
}
