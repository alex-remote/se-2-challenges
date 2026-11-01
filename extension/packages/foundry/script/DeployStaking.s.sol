//SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "../contracts/01_Staking/OracleToken.sol";
import "../contracts/01_Staking/StakingOracle.sol";
import "./DeployHelpers.s.sol";

contract DeployStaking is ScaffoldETHDeploy {
    function run() external ScaffoldEthDeployerRunner {
        ORA oraToken = new ORA();
        console.logString(string.concat("ORA token deployed at: ", vm.toString(address(oraToken))));

        StakingOracle stakingOracle = new StakingOracle(address(oraToken));
        console.logString(
            string.concat("StakingOracle deployed at: ", vm.toString(address(stakingOracle)))
        );

        // 把 ORA 的所有权转移给 StakingOracle，使其能够铸造奖励
        oraToken.transferOwnership(address(stakingOracle));
        console.logString("ORA ownership transferred to StakingOracle");
    }
}
