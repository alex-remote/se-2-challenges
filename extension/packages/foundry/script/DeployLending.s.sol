//SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "../contracts/Corn.sol";
import "../contracts/CornDEX.sol";
import "../contracts/Lending.sol";
import "../contracts/MovePrice.sol";
import "./DeployHelpers.s.sol";

contract DeployLending is ScaffoldETHDeploy {
    function run() external ScaffoldEthDeployerRunner {
        Corn corn = new Corn();
        console.logString(string.concat("Corn deployed at: ", vm.toString(address(corn))));

        CornDEX cornDEX = new CornDEX(address(corn));
        console.logString(string.concat("CornDEX deployed at: ", vm.toString(address(cornDEX))));

        Lending lending = new Lending(address(cornDEX), address(corn));
        console.logString(string.concat("Lending deployed at: ", vm.toString(address(lending))));

        MovePrice movePrice = new MovePrice(address(cornDEX), address(corn));
        console.logString(string.concat("MovePrice deployed at: ", vm.toString(address(movePrice))));

        // 仅在 localhost 上注入初始流动性并设置状态
        if (block.chainid == 31337) {
            corn.mintTo(deployer, 1_000_000 ether);

            // 给 MovePrice 合约发放 ETH 和 CORN，用于价格操纵测试
            // （vm.deal 是作弊码（cheatcode），不会广播到实际运行的节点，因此这里使用真实转账）
            (bool sent,) = address(movePrice).call{value: 5000 ether}("");
            require(sent, "Failed to fund MovePrice");
            corn.mintTo(address(movePrice), 5_000_000 ether);

            // 向 Lending 合约铸造 CORN，供借款人借用
            corn.mintTo(address(lending), 10_000_000 ether);

            // 为 DEX 注入初始流动性：1000 ETH + 1M CORN（1:1000 的比例）
            corn.approve(address(cornDEX), 1_000_000 ether);
            cornDEX.init{ value: 1000 ether }(1_000_000 ether);
        }
    }
}
