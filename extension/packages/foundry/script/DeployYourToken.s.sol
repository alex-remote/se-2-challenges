//SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "../contracts/YourToken.sol";
import "../contracts/Vendor.sol";
import "./DeployHelpers.s.sol";

contract DeployYourToken is ScaffoldETHDeploy {
    /**
     * 学生 TODO:
     * - 在这里填入你在前端使用的地址（保留 address(0) 则默认使用部署者地址）
     */
    address constant FRONTEND_ADDRESS = address(0);

    /**
     * 模式开关：
     * - 为 true 时：部署 Vendor，并把代币余额转入其中作为初始库存
     * - 为 false 时：把代币发送到你的前端地址（未设置时发送给部署者）
     */
    bool constant SEND_TOKENS_TO_VENDOR = false; // 在 Checkpoint 2 之前不要切换！

    function run() external ScaffoldEthDeployerRunner {
        YourToken yourToken = new YourToken();
        console.logString(string.concat("YourToken deployed at: ", vm.toString(address(yourToken))));

        address recipient = FRONTEND_ADDRESS != address(0) ? FRONTEND_ADDRESS : msg.sender;

        if (!SEND_TOKENS_TO_VENDOR) {
            // 把全部初始供应量发送到你在界面中使用的钱包。
            // 如果 FRONTEND_ADDRESS 为 address(0)，则默认为部署者（即不做任何转账）。
            if (recipient != msg.sender) {
                yourToken.transfer(recipient, 1000 ether);
            }
            return;
        }

        // 部署 Vendor 并向其注入代币
        Vendor vendor = new Vendor(address(yourToken));
        console.logString(string.concat("Vendor deployed at: ", vm.toString(address(vendor))));

        yourToken.transfer(address(vendor), 1000 ether);

        // 将界面所用的钱包设为所有者（用于 withdraw() 等）。未设置时默认为部署者。
        vendor.transferOwnership(recipient);
    }
}
