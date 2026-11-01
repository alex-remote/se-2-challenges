//SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "../contracts/02_Optimistic/OptimisticOracle.sol";
import "../contracts/02_Optimistic/Decider.sol";
import "./DeployHelpers.s.sol";

contract DeployOptimistic is ScaffoldETHDeploy {
    function run() external ScaffoldEthDeployerRunner {
        // 先用临时裁决者部署 OptimisticOracle，等 Decider 部署完成后再更新
        OptimisticOracle optimisticOracle = new OptimisticOracle(address(0));
        console.logString(string.concat("OptimisticOracle deployed at: ", vm.toString(address(optimisticOracle))));

        Decider decider = new Decider(address(optimisticOracle));
        console.logString(string.concat("Decider deployed at: ", vm.toString(address(decider))));

        optimisticOracle.setDecider(address(decider));
        console.logString("Decider address set on OptimisticOracle");
    }
}
