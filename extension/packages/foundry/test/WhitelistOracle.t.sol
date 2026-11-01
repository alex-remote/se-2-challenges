// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import { Test, Vm } from "forge-std/Test.sol";
import { WhitelistOracle } from "../contracts/00_Whitelist/WhitelistOracle.sol";
import { IWhitelistOracle } from "../contracts/00_Whitelist/IWhitelistOracle.sol";
import { SimpleOracle } from "../contracts/00_Whitelist/SimpleOracle.sol";

contract WhitelistOracleTest is Test {
    IWhitelistOracle public whitelistOracle;
    address public owner;
    address public addr1;
    address public addr2;
    address public addr3;
    address public addr4;

    function setUp() public {
        owner = address(this);
        addr1 = makeAddr("addr1");
        addr2 = makeAddr("addr2");
        addr3 = makeAddr("addr3");
        addr4 = makeAddr("addr4");

        whitelistOracle = IWhitelistOracle(address(new WhitelistOracle()));
    }

    // ============================================================
    // Checkpoint 1: WhitelistOracle
    // ============================================================

    function test_Checkpoint1_DeployAndSetOwner() public view {
        assertEq(whitelistOracle.owner(), owner);
    }

    function test_Checkpoint1_AddOracleDeploysSimpleOracle() public {
        whitelistOracle.addOracle(addr1);

        SimpleOracle oracle = SimpleOracle(address(whitelistOracle.oracles(0)));
        assertTrue(address(oracle) != address(0));
        assertEq(oracle.owner(), addr1);
    }

    function test_Checkpoint1_RemoveOracleByIndex() public {
        whitelistOracle.addOracle(addr1);
        whitelistOracle.addOracle(addr2);

        address oracle1Address = address(whitelistOracle.oracles(0));

        whitelistOracle.removeOracle(0);

        // 移除后，索引 0 处的预言机应当变成另一个（由末尾元素换过来）
        address newOracle0Address = address(whitelistOracle.oracles(0));
        assertTrue(newOracle0Address != oracle1Address);

        // 应当只剩下一个预言机
        vm.expectRevert();
        whitelistOracle.oracles(1);
    }

    function test_Checkpoint1_EmitOracleAddedEvent() public {
        vm.recordLogs();
        whitelistOracle.addOracle(addr1);

        Vm.Log[] memory entries = vm.getRecordedLogs();
        bool found = false;
        for (uint256 i = 0; i < entries.length; i++) {
            if (entries[i].topics[0] == keccak256("OracleAdded(address,address)")) {
                found = true;
            }
        }
        assertTrue(found, "OracleAdded event should be emitted");
    }

    function test_Checkpoint1_EmitOracleRemovedEvent() public {
        whitelistOracle.addOracle(addr1);
        address oracleAddress = address(whitelistOracle.oracles(0));

        vm.recordLogs();
        whitelistOracle.removeOracle(0);

        Vm.Log[] memory entries = vm.getRecordedLogs();
        bool found = false;
        for (uint256 i = 0; i < entries.length; i++) {
            if (entries[i].topics[0] == keccak256("OracleRemoved(address)")) {
                // 验证被移除的地址一致
                address removedAddr = abi.decode(entries[i].data, (address));
                if (removedAddr == oracleAddress) {
                    found = true;
                }
            }
        }
        assertTrue(found, "OracleRemoved event should be emitted");
    }

    function test_Checkpoint1_RevertIndexOutOfBoundsOnRemove() public {
        vm.expectRevert(abi.encodeWithSelector(bytes4(keccak256("IndexOutOfBounds()"))));
        whitelistOracle.removeOracle(0);

        whitelistOracle.addOracle(addr1);
        vm.expectRevert(abi.encodeWithSelector(bytes4(keccak256("IndexOutOfBounds()"))));
        whitelistOracle.removeOracle(1);

        whitelistOracle.removeOracle(0);
        vm.expectRevert(abi.encodeWithSelector(bytes4(keccak256("IndexOutOfBounds()"))));
        whitelistOracle.removeOracle(0);
    }

    function test_Checkpoint1_RevertNoOraclesOnGetPrice() public {
        vm.expectRevert(abi.encodeWithSelector(bytes4(keccak256("NoOraclesAvailable()"))));
        whitelistOracle.getPrice();
    }

    function test_Checkpoint1_CorrectPriceWithOneOracle() public {
        whitelistOracle.addOracle(addr1);
        SimpleOracle oracle = SimpleOracle(address(whitelistOracle.oracles(0)));
        oracle.setPrice(1000);

        uint256 price = whitelistOracle.getPrice();
        assertEq(price, 1000);
    }

    function test_Checkpoint1_CorrectMedianPriceOddOracles() public {
        whitelistOracle.addOracle(addr1);
        whitelistOracle.addOracle(addr2);
        whitelistOracle.addOracle(addr3);

        SimpleOracle(address(whitelistOracle.oracles(0))).setPrice(1000);
        SimpleOracle(address(whitelistOracle.oracles(1))).setPrice(3000);
        SimpleOracle(address(whitelistOracle.oracles(2))).setPrice(2000);

        uint256 medianPrice = whitelistOracle.getPrice();
        assertEq(medianPrice, 2000);
    }

    function test_Checkpoint1_CorrectMedianPriceEvenOracles() public {
        whitelistOracle.addOracle(addr1);
        whitelistOracle.addOracle(addr2);
        whitelistOracle.addOracle(addr3);
        whitelistOracle.addOracle(addr4);

        SimpleOracle(address(whitelistOracle.oracles(0))).setPrice(1000);
        SimpleOracle(address(whitelistOracle.oracles(1))).setPrice(3000);
        SimpleOracle(address(whitelistOracle.oracles(2))).setPrice(2000);
        SimpleOracle(address(whitelistOracle.oracles(3))).setPrice(4000);

        uint256 medianPrice = whitelistOracle.getPrice();
        assertEq(medianPrice, 2500);
    }

    function test_Checkpoint1_ExcludeStaleDataFromMedian() public {
        whitelistOracle.addOracle(addr1);
        whitelistOracle.addOracle(addr2);
        whitelistOracle.addOracle(addr3);

        SimpleOracle oracle1 = SimpleOracle(address(whitelistOracle.oracles(0)));
        SimpleOracle oracle2 = SimpleOracle(address(whitelistOracle.oracles(1)));
        SimpleOracle oracle3 = SimpleOracle(address(whitelistOracle.oracles(2)));

        oracle1.setPrice(1000);
        oracle2.setPrice(2000);
        oracle3.setPrice(3000);

        uint256 medianPrice = whitelistOracle.getPrice();
        assertEq(medianPrice, 2000);

        // 时间前进 25 秒（超过 24 秒的 STALE_DATA_WINDOW）
        vm.warp(block.timestamp + 25);

        // 只为两个预言机设置新价格（旧价格应当已过期）
        oracle1.setPrice(5000);
        oracle2.setPrice(3000);

        // 应当只使用这两个新鲜价格：[3000, 5000] 的中位数 = 4000
        medianPrice = whitelistOracle.getPrice();
        assertEq(medianPrice, 4000);
    }

    function test_Checkpoint1_EmptyActiveNodesWhenNoneActive() public view {
        address[] memory activeNodes = whitelistOracle.getActiveOracleNodes();
        assertEq(activeNodes.length, 0);
    }

    function test_Checkpoint1_CorrectActiveOracleNodes() public {
        whitelistOracle.addOracle(addr1);
        whitelistOracle.addOracle(addr2);

        address oracle1Address = address(whitelistOracle.oracles(0));
        address oracle2Address = address(whitelistOracle.oracles(1));

        SimpleOracle(oracle1Address).setPrice(1000);
        SimpleOracle(oracle2Address).setPrice(2000);

        address[] memory activeNodes = whitelistOracle.getActiveOracleNodes();
        assertEq(activeNodes.length, 2);

        // 让 oracle1 的价格过期
        vm.warp(block.timestamp + 25);

        // 只更新 oracle2
        SimpleOracle(oracle2Address).setPrice(3000);

        activeNodes = whitelistOracle.getActiveOracleNodes();
        assertEq(activeNodes.length, 1);
        assertEq(activeNodes[0], oracle2Address);
    }

    function test_Checkpoint1_AllPricesStaleEdgeCase() public {
        whitelistOracle.addOracle(addr1);
        whitelistOracle.addOracle(addr2);

        SimpleOracle(address(whitelistOracle.oracles(0))).setPrice(1000);
        SimpleOracle(address(whitelistOracle.oracles(1))).setPrice(2000);

        // 先验证中位数一开始能正常计算
        uint256 medianPrice = whitelistOracle.getPrice();
        assertEq(medianPrice, 1500);

        // 让所有价格都过期
        vm.warp(block.timestamp + 25);

        address[] memory activeNodes = whitelistOracle.getActiveOracleNodes();
        assertEq(activeNodes.length, 0);
    }
}
