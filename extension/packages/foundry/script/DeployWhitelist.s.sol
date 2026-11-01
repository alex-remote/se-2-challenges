//SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "../contracts/00_Whitelist/WhitelistOracle.sol";
import "../contracts/00_Whitelist/SimpleOracle.sol";
import "./DeployHelpers.s.sol";

contract DeployWhitelist is ScaffoldETHDeploy {
    // 默认 ETH 价格（约 2000 USD），采用 18 位小数格式，与 Uniswap 喂价格式一致
    uint256 constant DEFAULT_PRICE = 2000 ether;

    function run() external ScaffoldEthDeployerRunner {
        WhitelistOracle whitelistOracle = new WhitelistOracle();
        console.logString(
            string.concat("WhitelistOracle deployed at: ", vm.toString(address(whitelistOracle)))
        );

        // 创建 10 个拥有者各不相同的 SimpleOracle 实例（与 Hardhat 部署保持一致）
        uint256 oracleCount = 10;
        for (uint256 i = 0; i < oracleCount; i++) {
            address owner = vm.addr(i + 1);
            whitelistOracle.addOracle(owner);
            console.logString(
                string.concat("Created SimpleOracle ", vm.toString(i + 1), " with owner: ", vm.toString(owner))
            );
        }

        // 仅在 localhost 上写入初始价格（Hardhat 从 Uniswap 获取价格，这里使用默认值）
        if (block.chainid == 31337) {
            console.logString("Localhost detected: seeding oracle prices...");
            for (uint256 i = 0; i < oracleCount; i++) {
                try whitelistOracle.oracles(i) returns (SimpleOracle oracle) {
                    oracle.setPrice(DEFAULT_PRICE);
                    console.logString(
                        string.concat(
                            "Set price for SimpleOracle ", vm.toString(i + 1), " to: ", vm.toString(DEFAULT_PRICE)
                        )
                    );
                } catch {
                    console.logString("Oracle not yet implemented, skipping price seeding");
                    break;
                }
            }
        }
    }
}
