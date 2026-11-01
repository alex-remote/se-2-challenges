//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import { LeanIMT, LeanIMTData } from "@zk-kit/lean-imt.sol/LeanIMT.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
/// Checkpoint 6 //////
// import {IVerifier} from "./Verifier.sol";

contract Voting is Ownable {
    using LeanIMT for LeanIMTData;

    //////////////////
    /// 错误 //////
    /////////////////

    error Voting__CommitmentAlreadyAdded(uint256 commitment);
    error Voting__NullifierHashAlreadyUsed(bytes32 nullifierHash);
    error Voting__InvalidProof();
    error Voting__NotAllowedToVote();
    error Voting__EmptyTree();
    error Voting__InvalidRoot();

    ///////////////////////
    /// 状态变量 ///
    ///////////////////////

    string private s_question;
    mapping(address => bool) private s_voters;
    uint256 private s_yesVotes;
    uint256 private s_noVotes;

    /// Checkpoint 2 //////

    /// Checkpoint 6 //////

    //////////////
    /// 事件 ///
    //////////////

    event VoterAdded(address indexed voter);
    event NewLeaf(uint256 index, uint256 value);
    event VoteCast(
        bytes32 indexed nullifierHash,
        address indexed voter,
        bool vote,
        uint256 timestamp,
        uint256 totalYes,
        uint256 totalNo
    );

    //////////////////
    ////构造函数///
    //////////////////

    constructor(address _owner, address _verifier, string memory _question) Ownable(_owner) {
        s_question = _question;
        /// Checkpoint 6 //////
    }

    //////////////////
    /// 函数 ///
    //////////////////

    /**
     * @notice 批量更新投票者 EOA 的白名单
     * @dev 只有合约所有者可以调用此函数。每更新一个条目就触发一次 `VoterAdded`。
     * @param voters 要在白名单中更新的地址
     * @param statuses true 表示允许，false 表示撤销
     */
    function addVoters(address[] calldata voters, bool[] calldata statuses) public onlyOwner {
        require(voters.length == statuses.length, "Voters and statuses length mismatch");

        for (uint256 i = 0; i < voters.length; i++) {
            s_voters[voters[i]] = statuses[i];
            emit VoterAdded(voters[i]);
        }
    }

    /**
     * @notice 为白名单中的地址注册一个承诺叶子
     * @dev 每个白名单地址只能注册一次。以下情况会回滚（revert）：
     *      调用者不在白名单中或已经注册过，或者
     *      相同的承诺之前已被插入过。触发 `NewLeaf`。
     * @param _commitment 要插入 IMT 的基于 Poseidon 的承诺
     */
    function register(uint256 _commitment) public {
        /// Checkpoint 2 //////
    }

    /**
     * @notice 使用零知识证明进行投票
     * @dev 通过 `s_nullifierHashes` 保证每个无效化值（nullifier）只能使用一次。公开输入的顺序必须
     *      与电路一致：nullifierHash、root、vote、depth。`_vote`
     *      的值按如下方式解释：1 => 赞成，其他任何值 => 反对。触发 `VoteCast`。
     * @param _proof Ultra Honk 证明的字节数据
     * @param _root 与已注册承诺树对应的默克尔根
     * @param _nullifierHash 用于防止重复投票的唯一无效化值
     * @param _vote 编码后的投票：1 表示赞成，否则计为反对
     * @param _depth 电路使用的树深度
     */
    function vote(bytes memory _proof, bytes32 _nullifierHash, bytes32 _root, bytes32 _vote, bytes32 _depth) public {
        /// Checkpoint 6 //////
    }

    /////////////////////////
    /// Getter 函数 ///
    ////////////////////////

    function getVotingData()
        public
        view
        returns (
            string memory question,
            address contractOwner,
            uint256 yesVotes,
            uint256 noVotes,
            uint256 size,
            uint256 depth,
            uint256 root
        )
    {
        question = s_question;
        contractOwner = owner();
        yesVotes = s_yesVotes;
        noVotes = s_noVotes;
        /// Checkpoint 2 //////
        // size = s_tree.size;
        // depth = s_tree.depth;
        // root = s_tree.root();
    }

    function getVoterData(address _voter) public view returns (bool voter, bool registered) {
        voter = s_voters[_voter];
        // /// Checkpoint 2 //////
        // registered = s_hasRegistered[_voter];
    }
}
