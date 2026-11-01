pragma solidity >=0.8.0 <0.9.0; //不要修改 solidity 版本，否则会对提交评分产生负面影响
//SPDX-License-Identifier: MIT

import "./DiceGame.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract RiggedRoll is Ownable {
    /////////////////
    /// 错误 //////
    /////////////////

    // 在这里定义错误...

    //////////////////////
    /// 状态变量 //
    //////////////////////

    DiceGame public diceGame;

    ///////////////////
    /// 构造函数 ///
    ///////////////////

    constructor(address payable diceGameAddress) Ownable(msg.sender) {
        diceGame = DiceGame(diceGameAddress);
    }

    ///////////////////
    /// 函数 /////
    ///////////////////

    // 在这里编写函数...
}
