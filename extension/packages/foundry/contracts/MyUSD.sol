// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";

import "./MyUSDStaking.sol";

error MyUSD__InvalidAmount();
error MyUSD__InsufficientBalance();
error MyUSD__InsufficientAllowance();
error MyUSD__InvalidAddress();
error MyUSD__NotAuthorized();

contract MyUSD is ERC20, ERC20Burnable, Ownable {
    address public stakingContract;
    address public engineContract;

    constructor(address _engineContract, address _stakingContract) ERC20("MyUSD", "MyUSD") Ownable(msg.sender) {
        engineContract = _engineContract;
        stakingContract = _stakingContract;
    }

    function burnFrom(address account, uint256 amount) public override {
        if (msg.sender != engineContract) revert MyUSD__NotAuthorized();

        return super.burnFrom(account, amount);
    }

    function mintTo(address to, uint256 amount) external returns (bool) {
        // 只有引擎合约可以铸造，因为 MyUSD 必须始终有抵押品作为支撑
        if (msg.sender != engineContract) revert MyUSD__NotAuthorized();

        if (to == address(0)) {
            revert MyUSD__InvalidAddress();
        }
        if (amount == 0) {
            revert MyUSD__InvalidAmount();
        }
        _mint(to, amount);
        return true;
    }

    /**
     * @dev 重写标准的 balanceOf 函数，以处理质押的虚拟余额
     */
    function balanceOf(address account) public view override returns (uint256) {
        // 对于普通账户，返回标准余额
        if (account != stakingContract) {
            return super.balanceOf(account);
        }

        // 对于质押合约，返回份额的价值
        MyUSDStaking staking = MyUSDStaking(stakingContract);
        return staking.getSharesValue(staking.totalShares());
    }

    /**
     * @dev 重写标准的 _update 函数，以处理质押的虚拟余额
     */
    function _update(address from, address to, uint256 value) internal override {
        // 如果是质押合约参与转账，则改为销毁或铸造，因为它的余额是虚拟的
        if (from == stakingContract) {
            super._mint(to, value);
        } else if (to == stakingContract) {
            super._burn(from, value);
        } else {
            super._update(from, to, value);
        }
    }

    /**
     * @dev 重写标准的 totalSupply 函数，以处理质押的虚拟余额
     */
    function totalSupply() public view override returns (uint256) {
        MyUSDStaking staking = MyUSDStaking(stakingContract);
        uint256 stakedTotalSupply = staking.getSharesValue(staking.totalShares());
        return super.totalSupply() + stakedTotalSupply;
    }
}
