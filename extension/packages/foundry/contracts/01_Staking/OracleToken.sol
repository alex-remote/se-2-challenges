// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ORA is ERC20, Ownable {
    //////////////////
    /// 常量 ////
    //////////////////

    // 0.5 ETH = 100 ORA  =>  1 ETH = 200 ORA（18 位小数）
    uint256 public constant ORA_PER_ETH = 200;

    //////////////////////
    /// 状态变量 //
    //////////////////////

    ////////////////
    /// 事件 /////
    ////////////////

    event OraPurchased(address indexed buyer, uint256 ethIn, uint256 oraOut);
    event EthWithdrawn(address indexed to, uint256 amount);

    /////////////////
    /// 错误 //////
    /////////////////

    error EthTransferFailed();

    constructor() ERC20("Oracle Token", "ORA") Ownable(msg.sender) {
        // 向合约部署者铸造初始供应量
        _mint(msg.sender, 1000000000000 ether);
    }

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }

    function burn(uint256 amount) public {
        _burn(msg.sender, amount);
    }

    /**
     * @notice 发送 ETH 即可按固定比率购买 ORA，代币直接铸造给购买者。
     */
    receive() external payable {
        _buy(msg.sender);
    }

    function buy() external payable {
        _buy(msg.sender);
    }

    function quoteOra(uint256 ethAmountWei) public pure returns (uint256) {
        return ethAmountWei * ORA_PER_ETH;
    }

    function _buy(address buyer) internal {
        uint256 oraOut = quoteOra(msg.value);
        _mint(buyer, oraOut);
        emit OraPurchased(buyer, msg.value, oraOut);
    }
}
