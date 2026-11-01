//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "../contracts/DiceGame.sol";
import "../contracts/RiggedRoll.sol";
import "./DeployHelpers.s.sol";

contract DeployDiceGame is ScaffoldETHDeploy {
    function run() external ScaffoldEthDeployerRunner {
        DiceGame diceGame = new DiceGame{ value: 0.05 ether }();
        console.logString(string.concat("DiceGame deployed at: ", vm.toString(address(diceGame))));

        // 取消注释以部署 RiggedRoll 合约
        // RiggedRoll riggedRoll = new RiggedRoll(payable(address(diceGame)));
        // console.logString(string.concat("RiggedRoll deployed at: ", vm.toString(address(riggedRoll))));

        // 请把文本 "Your Address" 替换为你自己的地址。
        // riggedRoll.transferOwnership(Your Address);
    }
}
