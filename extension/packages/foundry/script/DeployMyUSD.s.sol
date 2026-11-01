//SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "../contracts/MyUSD.sol";
import "../contracts/MyUSDEngine.sol";
import "../contracts/MyUSDStaking.sol";
import "../contracts/DEX.sol";
import "../contracts/Oracle.sol";
import "../contracts/RateController.sol";
import "./DeployHelpers.s.sol";

contract DeployMyUSD is ScaffoldETHDeploy {
    // 默认 ETH 价格（约 2000 美元，按 18 位小数缩放）。
    // 注意：Hardhat 部署会通过 fetchPriceFromUniswap() 从 Uniswap 获取真实的 ETH 价格。
    // Foundry 在部署时不便调用外部合约，所以这里使用硬编码的默认值。
    uint256 constant DEFAULT_ETH_PRICE = 2000 ether;

    // 设置为非零地址，即可在部署后转移引擎/质押合约的所有权。
    // 对应 Hardhat 中的 CONTRACT_OWNER 逻辑——默认为 address(0)（不转移）。
    address constant CONTRACT_OWNER = address(0);

    function run() external ScaffoldEthDeployerRunner {
        // 预先计算合约未来的地址，以解决循环依赖
        // 部署顺序：RateController(+0)、MyUSD(+1)、DEX(+2)、Oracle(+3)、MyUSDStaking(+4)、MyUSDEngine(+5)
        uint64 deployerNonce = vm.getNonce(deployer);

        address futureStakingAddress = vm.computeCreateAddress(deployer, deployerNonce + 4);
        address futureEngineAddress = vm.computeCreateAddress(deployer, deployerNonce + 5);

        // 1. 部署 RateController（需要引擎和质押合约未来的地址）
        RateController rateController = new RateController(futureEngineAddress, futureStakingAddress);
        console.logString(string.concat("RateController deployed at: ", vm.toString(address(rateController))));

        // 2. 部署 MyUSD 代币（需要引擎和质押合约未来的地址）
        MyUSD myUSD = new MyUSD(futureEngineAddress, futureStakingAddress);
        console.logString(string.concat("MyUSD deployed at: ", vm.toString(address(myUSD))));

        // 3. 部署 DEX
        DEX dex = new DEX(address(myUSD));
        console.logString(string.concat("DEX deployed at: ", vm.toString(address(dex))));

        // 4. 部署 Oracle
        Oracle oracle = new Oracle(address(dex), DEFAULT_ETH_PRICE);
        console.logString(string.concat("Oracle deployed at: ", vm.toString(address(oracle))));

        // 5. 部署 MyUSDStaking
        MyUSDStaking staking = new MyUSDStaking(address(myUSD), futureEngineAddress, address(rateController));
        console.logString(string.concat("MyUSDStaking deployed at: ", vm.toString(address(staking))));
        require(address(staking) == futureStakingAddress, "Staking address mismatch");

        // 6. 部署 MyUSDEngine
        MyUSDEngine engine = new MyUSDEngine(address(oracle), address(myUSD), address(staking), address(rateController));
        console.logString(string.concat("MyUSDEngine deployed at: ", vm.toString(address(engine))));
        require(address(engine) == futureEngineAddress, "Engine address mismatch");

        // 注入初始流动性——仅限 localhost（与 Hardhat 中对 localhost 的判断一致）。
        // `yarn chain` 会以 --balance 100_000_000_000 启动 anvil，因此部署者
        // 有足够的真实 ETH 来为深度充足的 DEX 和大额抵押仓位提供资金。
        if (block.chainid == 31337) {
            uint256 ethCollateralAmount = 3e7 ether;
            uint256 ethDEXAmount = 1e7 ether;
            uint256 myUSDAmount = DEFAULT_ETH_PRICE * 1e7;

            engine.addCollateral{ value: ethCollateralAmount }();
            engine.mintMyUSD(myUSDAmount);

            if (myUSD.balanceOf(deployer) == myUSDAmount) {
                myUSD.approve(address(dex), myUSDAmount);
                dex.init{ value: ethDEXAmount }(myUSDAmount);
            }

            // 如果设置了 CONTRACT_OWNER，则转移所有权
            if (CONTRACT_OWNER != address(0) && CONTRACT_OWNER != deployer) {
                engine.transferOwnership(CONTRACT_OWNER);
                staking.transferOwnership(CONTRACT_OWNER);
            }
        }
    }
}
