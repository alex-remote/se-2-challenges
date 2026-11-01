//SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "../contracts/Balloons.sol";
import "../contracts/DEX.sol";
import "./DeployHelpers.s.sol";

contract DeployDEX is ScaffoldETHDeploy {
    function run() external ScaffoldEthDeployerRunner {
        Balloons balloons = new Balloons();
        console.logString(string.concat("Balloons deployed at: ", vm.toString(address(balloons))));

        DEX dex = new DEX(address(balloons));
        console.logString(string.concat("DEX deployed at: ", vm.toString(address(dex))));

        // CHECKPOINT 2: 取消注释，并把 YOUR_FRONTEND_ADDRESS 替换为你的前端地址，即可向前端发送 10 BAL
        // balloons.transfer(YOUR_FRONTEND_ADDRESS, 10 ether);

        // CHECKPOINT 3: 实现 init() 之后，取消下面几行的注释，为 DEX 注入初始流动性
        // balloons.approve(address(dex), 100 ether);
        // dex.init{value: 5 ether}(5 ether);
    }
}
