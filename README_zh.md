# 🚩 挑战：ZK 投票

![readme-zk](https://raw.githubusercontent.com/scaffold-eth/se-2-challenges/challenge-zk-voting/extension/packages/nextjs/public/readme-zk.png)

创建一个私密且抗女巫攻击（Sybil-resistant）的投票系统：任何人都可以证明自己有投票资格，并且只投一次票，**而无需透露自己的身份**。在这个 Speedrun Ethereum 挑战中，你将使用**零知识证明**让选票无法与身份关联起来，同时让投票结果在链上公开可验证。

<details>
<summary><b>❓ 想知道 ZK 投票是如何运作的吗？</b></summary>

在传统投票中，由一个中心化机构核验身份并统计选票。而在链上，我们的目标是在不暴露投票者身份的前提下，实现**去中心化、隐私性和可验证性**。这里仍然有一个中心化机构，它通过把地址加入白名单（allowlist）来决定谁可以投票；但一旦完成注册，投票者就可以私密地投出自己的选票。

通常情况下，链上投票会让每一个选择都公开可见。借助 ZK 证明，用户可以证明自己在投票者名单上且尚未投过票，**而无需透露自己的地址或投票内容**。这是通过切断两个地址之间的所有权关联来实现的。

- **合约所有者**（owner）维护白名单，并决定谁是投票者
- **投票者**通过提交一个**承诺**（commitment），把自己注册到链上的默克尔树中
- 他们使用承诺对应的秘密值（secret）生成一个**成员资格 ZK 证明**，以证明自己已经注册
- **证明**会被发送到验证器合约以检查其有效性。如果验证通过，选票就会被接受
- **无效化值**（nullifier）通过防止重复投票来确保 *一人一票*，同时不会把选票与注册时使用的投票者地址关联起来

</details>

### 🤔 为什么要用 ZK 投票？

传统的链上投票会暴露每个投票者的地址和选择，这破坏了隐私，并可能导致胁迫或报复。
链下投票虽然能隐藏身份，但通常依赖于中心化机构，而你必须信任这些机构会正确地统计选票。

**ZK 投票兼具两者之长：**

- 投票者可以证明自己的资格和唯一性（*一人一票*）
- 没有人能看到他们是**谁**，也看不到他们**如何**投票
- 整个过程依然**可在链上验证**
- 为每一位投票者确保**完整性 + 隐私性**

🌟 **最终交付成果**
一个应用：任何人都可以创建一个**是/否问题**（Yes/No question），已注册的投票者可以匿名投票。投票结果完全透明，并在链上实时可见。

- 将你的合约部署到**测试网**
- 构建你的应用并上传到**公共 Web 服务器**
- 在 [**SpeedRunEthereum.com**](https://speedrunethereum.com/) 上提交网址！🚀

> 💬 在 ZK 投票挑战的 [Telegram 群](https://t.me/+dkPzMUauQpY5N2My) 中结识正在进行本挑战的其他开发者并获取帮助。

## 🚀 Checkpoint 0: 环境

开始之前，你需要安装以下工具：

- [Node (>= v20.18.3)](https://nodejs.org/en/download/)
- [Yarn (v2+)](https://yarnpkg.com/getting-started/install)
- [Git](https://git-scm.com/downloads)
- [Foundry](https://book.getfoundry.sh/getting-started/installation)（如果你选择 Foundry 作为 Solidity 框架）
- [Nargo](https://noir-lang.org/docs/getting_started/quick_start#installation)（v1.0.0-beta.3）
- [bb](https://barretenberg.aztec.network/docs/getting_started/)（v0.82.2）

> 🚨 **Windows 用户**：Windows 并不原生支持 Noir（`nargo`、`bb`）。
> 请在 **WSL**（Windows Subsystem for Linux，适用于 Linux 的 Windows 子系统）中安装并运行 Noir，并使用 **Ubuntu 24.04**。
> 🚨

### 📦 安装 nargo 和 bb

⚡ 本挑战请使用 **`nargo version = 1.0.0-beta.3`**。

安装方法：

```sh
curl -L https://raw.githubusercontent.com/noir-lang/noirup/refs/heads/main/install | bash
noirup -v 1.0.0-beta.3
nargo --version
```

⚡ 使用 bb 版本 = 0.82.2（可与本挑战配合使用）。

安装方法：

```sh
# Mac (Apple Silicon):
mkdir -p ~/.bb && curl -L https://github.com/AztecProtocol/aztec-packages/releases/download/v0.82.2/barretenberg-arm64-darwin.tar.gz | tar -xzC ~/.bb
# Mac (Intel):
# mkdir -p ~/.bb && curl -L https://github.com/AztecProtocol/aztec-packages/releases/download/v0.82.2/barretenberg-amd64-darwin.tar.gz | tar -xzC ~/.bb
# Linux (x86_64):
# mkdir -p ~/.bb && curl -L https://github.com/AztecProtocol/aztec-packages/releases/download/v0.82.2/barretenberg-amd64-linux.tar.gz | tar -xzC ~/.bb

# 添加到 PATH（把这一行加到你的 ~/.zshrc 或 ~/.bashrc 中，使其永久生效）
export PATH="$HOME/.bb:$PATH"
bb --version
```

如果你使用的是 vscode，可以安装 [Noir Language Support](https://marketplace.visualstudio.com/items?itemName=noir-lang.vscode-noir) 扩展。

然后运行以下命令，将挑战下载到你的电脑并安装依赖：

```sh
npx create-eth@2.0.23 -e scaffold-eth/se-2-challenges:challenge-zk-voting challenge-zk-voting
cd challenge-zk-voting
```

> 出现提示时，选择你偏好的 Solidity 框架（Hardhat 或 Foundry）

在同一个终端中，启动你的本地网络（一个运行在你电脑上的区块链模拟器）：

```sh
yarn chain
```

在第二个终端窗口中，🛰 部署你的合约（本地）：

```sh
cd challenge-zk-voting
yarn deploy
```

在第三个终端窗口中，启动你的 📱 前端：

```sh
cd challenge-zk-voting
yarn start
```

> 👩‍💻 每当你想把合约的改动部署到前端时，重新运行 `yarn deploy` 即可。运行 `yarn deploy --reset` 可以进行一次全新的部署，即使合约没有改动也会重新部署。

---

⚠️ 我们已通过 `.vscode/settings.json` 禁用了 Cursor 的自动建议（Tab 补全和预测），以减少你编码时的干扰。AI 聊天和智能体（agent）功能仍然可用，并且我们提供了包含项目上下文的 `AGENTS.md` 和 `CLAUDE.md` 文件，帮助 AI 助手理解代码库。

🔒 想禁用 AI、一切亲力亲为？（推荐这样做，以便更深入地学习）：

- Cursor：在项目根目录的 `.cursorignore` 文件中添加 `*`
- VSCode：在 `.vscode/settings.json` 文件中将 `chat.disableAIFeatures` 设置为 `true`

---

## 🤖 AI 引导学习模式（可选）

想要一位在你编码时教你概念的互动导师吗？本挑战支持 **AI 引导学习模式**！

1. 在 **Claude Code** 或 **Cursor** 等 AI 编程工具中打开本项目
2. 运行 `/start` 命令
3. AI 导师会讲解每个概念，然后给你布置一个编码任务
4. 你编写代码后说 **"check"**，AI 就会运行测试
5. 需要帮助时说 **"hint"**；如果想让 AI 直接给出答案，可以使用 **`/skip`**
6. 你的进度会被保存——随时使用 `/start` 继续

AI 不会直接把答案告诉你——它会先讲解，再让你自己实现代码。测试会验证你的成果，如果有测试没通过，AI 会帮你调试。

---

## Checkpoint 1: 🗳️🔒 挑战结构与投票合约

### **💬 你将构建什么**

一个由 ZK 驱动的投票流程，包含三个阶段：

1. **注册**：用户提交一个承诺，该承诺会被添加到一棵增量默克尔树中（稍后你会了解更多相关内容）。
2. **证明生成**：用户基于自己的秘密值和默克尔树，在本地生成一个 ZK 证明。
3. **投票**：拿到证明后，用户调用投票函数，从一个与其注册地址没有关联的独立地址匿名投出选票。

为了实现这一流程，我们将结合使用：

- [**Noir**](https://noir-lang.org/) → 用于构建 ZK 电路并生成验证器合约
- **Solidity** → 用于扩展投票合约，并将其与验证器连接起来
- **Next.js/TypeScript** → 用于构建前端，让用户可以顺畅地生成证明并投票

### 🛠️ 投票 Dapp 的核心功能

我们的合约将支持三个主要功能：

1. **白名单管理** ✅（已实现）
2. **投票者注册**（将使用默克尔树来构建）
3. **投票**（通过 ZK 证明进行验证）

👉 我们将从注册开始：我们需要一棵默克尔树来证明某个用户已经注册（在树中有一个承诺）并且尚未投票。

### 👀 探索前端

📱 打开 [http://localhost:3000](http://localhost:3000/) 启动你的应用。

> *注意：截图中的界面可能与当前版本略有不同。*

🖥️ 前往 **Voting** 页面，看一看你即将让它“活”起来的前端。

![overview-zk](https://raw.githubusercontent.com/scaffold-eth/se-2-challenges/challenge-zk-voting/extension/packages/nextjs/public/overview-zk.png)

### 🔍 查看合约

🔍 接下来，切换到 **`Debug Contracts`** 页面。目前你应该只能在那里看到一个合约——**`Voting`**。

<Tabs>
<Tab label="Hardhat">

**Hardhat**

📁 合约位于 **`packages/hardhat/contracts/Voting.sol`**

</Tab>
<Tab label="Foundry">

**Foundry**

📁 合约位于 **`packages/foundry/contracts/Voting.sol`**

</Tab>
</Tabs>

🔍 打开它，看看其中的占位函数。每个函数都代表投票逻辑中的一个关键部分。
如果你已经能说清楚它们各自应该做什么，那你已经领先一步了！😎

💡 `Verifier.sol` 合约目前只是一个占位合约，稍后会被替换为真正的实现。

不过这一次，你要做的可不只是智能合约 **🙂**

### **🥅 目标**

- [ ] 📝 阅读 **`Voting.sol`** 中的函数，对整体有一个大致的了解

## Checkpoint 2: 📋🌲 通过智能合约中的默克尔树进行注册

是时候让用户真正注册了！

在这里，我们将实现一个 `register` 函数，它会：

1. 接收调用者提交的一个**承诺**
2. 验证调用者是否在白名单上
3. 检查唯一性
4. 将该承诺插入一棵**精简增量默克尔树**（LeanIMT）

> **💡 LeanIMT 简介：** 这棵树预先用零值填充。新叶子会替换这些零值，并像二进制计数器一样向上合并。索引的奇偶性（偶数 = 左，奇数 = 右）确保了正确的顺序。只有**前沿**（frontier）会被存储，这让 LeanIMT 成本低廉、可扩展，非常适合私密投票这类 ZK 应用。

<details>
<summary><b>🧠 LeanIMT 是什么？为什么要用它？</b></summary>
**LeanIMT**（Lean Incremental Merkle Tree）是一种链上数据结构，能够以低成本、高效率的方式让默克尔根保持最新。

#### 🧱 普通默克尔树

标准的默克尔树会存储每一个节点。随着添加的叶子越来越多，重新计算并存储所有这些哈希值在 gas 和存储上的开销会变得非常高。

#### ✂️ LeanIMT 的优化

LeanIMT 通过以下方式避免了这个问题：

- 从一开始就固定**树的深度**（例如 16 层 → 65,536 个叶子）
- 用**零值**（零的哈希）预先填充所有位置
- 只存储少量被称为**前沿**的值（每层最多一个活跃节点）

新叶子会替换零值，并且只有前沿会更新。其余部分都被假定保持为零，因此始终可以重新计算出根。

#### 🔄 更新树（二进制计数器模式）

添加叶子的过程就像一个**二进制计数器**：

- 如果某个槽位为空 → 把新叶子放在那里。
- 如果某个槽位已满 → 对两个值进行哈希，清空该槽位，并把结果向上进位。
- 如果下一个槽位也已满 → 重复上述过程，直到找到一个空槽位。

> 💡 这就像二进制中的 `0111 + 1 = 1000`：低位清零，进位向上移动。

#### ⚖️ 索引奇偶性（顺序很重要）

由于 `Hash(left, right) ≠ Hash(right, left)`，由**奇偶性**决定位置：

- **偶数索引（0, 2, 4, …）的叶子**放在**左边**
- **奇数索引（1, 3, 5, …）的叶子**放在**右边**，并触发与左侧兄弟节点（sibling）的合并

#### 🌱 4 个叶子的示例

1. **叶子 0（偶数）** → 槽位 0，左子节点
   *（前沿：[L0, 0, 0…]）*

2. **叶子 1（奇数）** → 槽位 0 已满 →
   `H01 = Hash(L0, L1)`（**L0 在左，L1 在右**）→ 进位到槽位 1
   *（前沿：[0, H01, 0…]）*

3. **叶子 2（偶数）** → 槽位 0，左子节点
   *（前沿：[L2, H01, 0…]）*

4. **叶子 3（奇数）** → 槽位 0 已满 →
   `H23 = Hash(L2, L3)`（**L2 在左，L3 在右**）→ 进位到槽位 1
   槽位 1 已满 →
   `H0123 = Hash(H01, H23)`（**H01 在左，H23 在右**）→ 进位到槽位 2
   *（前沿：[0, 0, H0123…]）*

👉 此时，前沿中只有一个值（槽位 2 中的 `H0123`），但它与那些零值一起就确定了完整的根。

#### ⚡ 为什么要用 LeanIMT？

- **低成本且可预测**：只有前沿会更新
- **只追加**（append-only）：叶子只能添加，不能删除
- **对 ZK 友好**：[Poseidon](https://www.poseidon-hash.info/) 哈希得到的根非常适合在零知识证明中使用

想更深入地了解 LeanIMT，可以看看这篇[图解说明](https://hackmd.io/@vplasencia/S1whLBN16)。

</details>

默克尔树并不是 ZK 证明所必需的，但它们是证明某个元素属于一个大集合的**最高效方式**。
在我们的投票应用中，默克尔树让我们能够以低成本、可扩展的方式证明 *“我已经注册”*，而无需透露你是 *谁*。

> 💡 在 Checkpoint 3 中，我们会更深入地探讨承诺是什么以及如何使用它们。
> 目前，你可以把它们看作用户在注册时提交的占位值。

### ✅ 注册规则

当用户注册时，我们会强制执行**两项关键检查**：

1. 该地址此前没有注册过
2. 承诺是唯一的（不能重复）

👉 只要任意一项检查失败 → 回滚（revert）。
👉 如果另一个地址试图重复使用同一个承诺 → 同样拒绝。

> 💡 别忘了实现所需的状态变量。

### 🌱 插入默克尔树

检查通过后：

- 以承诺作为叶子的值，将新叶子插入增量默克尔树（`LeanIMT`）中（该库已在 `Voting.sol` 中导入）。直接在树上调用 `insert()`。
- 将默克尔树存储在状态变量 `s_tree` 中。
- 触发一个包含**叶子索引** + **值**的事件：
  - **索引** = 叶子被插入时所处的位置
  - **值** = 该承诺

> 💡 研究一下 LeanIMT 库本身，看看 `insert()` 内部究竟发生了什么。

<details>
<summary><b>🧠 🦉 引导问题</b></summary>

<details>
<summary>❓ 问题 1</summary>

要让某人能够注册，必须满足哪些条件？
*（提示：白名单 + 此前未注册）*

</details>

<details>
<summary>❓ 问题 2</summary>

你要如何检测并拒绝一个被重复使用的承诺，即使它来自另一个地址？

</details>

<details>
<summary>❓ 问题 3</summary>

你需要哪些**状态变量**来同时跟踪用户和承诺？

</details>

<details>
<summary>❓ 问题 4</summary>

在触发 `NewLeaf` 时，你要如何确定正确的索引？
*（💡 试试 `tree.size()`，但要小心调整）*

</details>

思考完这些引导问题后，再来看看参考答案代码吧！

<details>
<summary>👩🏽‍🏫 参考答案代码</summary>

```solidity
///////////////////////
/// 状态变量 ///
///////////////////////

/// Checkpoint 2 //////
mapping(address => bool) private s_hasRegistered;
mapping(uint256 => bool) private s_commitments;

LeanIMTData private s_tree;

//////////////////
/// 函数 ///
//////////////////

function register(uint256 _commitment) public {
  /// Checkpoint 2 //////
  if (!s_voters[msg.sender] || s_hasRegistered[msg.sender]) {
    revert Voting__NotAllowedToVote();
  }
  if (s_commitments[_commitment]) {
    revert Voting__CommitmentAlreadyAdded(_commitment);
  }
  s_commitments[_commitment] = true;
  s_hasRegistered[msg.sender] = true;
  s_tree.insert(_commitment);
  emit NewLeaf(s_tree.size - 1, _commitment);
}

```

</details>
</details>

### 🔧 测试之前

在你的合约中向下滚动，找到 **`getVotingData()`** 和 **`getVoterData(address _voter)`** 这两个函数。

👉 将 `/// Checkpoint 2 ///` 下方的所有内容取消注释

然后运行：

<Tabs>
<Tab label="Hardhat">

**Hardhat**

```sh
yarn test --grep "Checkpoint2"
```

</Tab>
<Tab label="Foundry">

**Foundry**

```sh
yarn test --match-test "Checkpoint2"
```

</Tab>
</Tabs>

### 🚀 测试通过了？你就快成功了！

干得好！如果你的测试都通过了，那么离部署只差一步了！🚀

部署之前，先做一项重要的修改：

<Tabs>
<Tab label="Hardhat">

**Hardhat**

1. 打开 **`00_deploy_your_voting_contract.ts`**
2. 将你的地址设置为 `ownerAddress`
3. 取消注释 `poseidon3` 和 `leanIMT` 两者的部署代码
4. 在第 62 行设置 LeanIMT 库的地址（`leanIMT.address`）

> 💡 **Poseidon3** 是我们使用的哈希函数。稍后会详细介绍。

</Tab>
<Tab label="Foundry">

**Foundry**

1. 打开 **`DeployVoting.s.sol`**
2. 将你的地址设置为 `ownerAddress`

> 💡 在 Foundry 中，库的链接会在编译时自动处理——无需单独部署 PoseidonT3 或 LeanIMT。

</Tab>
</Tabs>

完成之后，你就可以部署了！🔗

运行 `yarn deploy`，然后去看看前端

### **🥅 目标**

- [ ] 理解精简增量默克尔树的工作原理
- [ ] 在 **`Voting.sol`** 中实现 `register` 函数

## Checkpoint 3: ✍️🔒 编写你的第一个 ZK 电路 – 承诺方案

欢迎来到 Noir 的世界！🎉

在这里，我们将编写我们的第一个 **ZK 电路**，它是生成链上验证器的基础构件。

这里的目标是：让用户在不暴露自己地址的情况下，**证明自己已注册投票（其承诺在默克尔树中）**。

👉 你将使用 **[Noir](https://noir-lang.org/)**（一种用于 ZK 电路的 DSL，即领域特定语言）来生成一个 **Solidity 验证器合约**——如果手工实现，这将极其困难。

<details>
<summary>🧠 什么是零知识电路？</summary>

**电路**本质上是一个表示某个程序的、非常复杂的数学方程。
Noir 让我们可以编写程序，并把它编译成这样的数学方程。

- 👉 Noir 让我们编写“程序”，将其编译成 ZK 数学，并导出一个 **Solidity 验证器合约**。
- 零知识的魔力让我们能够证明并验证自己知道这个解，**而无需透露解本身**。

**为什么这很强大？**

- 🔒 保护隐私
- ⚡ 把繁重的计算从昂贵的地方（以太坊区块链）转移到廉价的地方（你的 CPU/GPU）

</details>

> 💡 ZK 证明让人可以证明某件事为真，而不透露与之相关的任何其他细节。

### 🔑 第 1 步：理解承诺方案

在深入研究默克尔根之前，我们需要先构建**承诺**。

承诺方案允许某人“锁定”一个值而不暴露它，同时保留之后揭示它的选择。

在我们的场景中：

- 我们把一个**无效化值**和一个**秘密值**组合起来（两者都是私有的）。
- 将它们一起哈希 → 这就是**承诺**，在用户注册时作为默克尔叶子存储在链上。

**无效化值**扮演着特殊的角色：

- 它让 Solidity 合约能够追踪某个证明是否已被使用过。
- 如果同一个无效化值再次出现，投票就会被拒绝（防止重复投票）。

> 💡 承诺方案允许用户对选定的一个（或多个）值做出承诺，同时保持其隐藏，并且之后能够揭示该值。

### 🔑 第 2 步：设置你的 Noir 项目

前往 **`packages/circuits`** 文件夹并打开 **`src/main.nr`**。
这是你的 Noir 电路的入口。我们想要证明的一切——因此也包括所有约束——都必须在 `main` 中进行。

- 想在另一个项目中创建相同的结构？
  在新项目中运行 `nargo init`。这会创建完整的文件夹结构以及一个 `main.nr` 文件。

**Nargo** 是 Noir 的命令行工具。它可以让你：

- 创建新项目
- 编译电路
- 运行电路
- 以及直接在终端中进行测试

在文件顶部，你可以看到已经导入了两个 [Poseidon 哈希函数](https://www.poseidon-hash.info/)：

- `hash_1` → 对单个值进行哈希
- `hash_2` → 对两个值进行哈希

> 💡 Poseidon3 是 LeanIMT 二叉默克尔树中用来合并左右子节点对的哈希函数。
> 之所以选择它而不是 SHA256/Keccak256，是因为它在 ZK 电路中要便宜和快速得多，而 Keccak256 在证明系统中实现起来计算开销非常大。

### 🔑 第 3 步：输入

`main` 函数已经列出了三个参数（其他参数已被注释掉，留给后续的 Checkpoint 使用）。

<details>
<summary><b>🔐 私有输入与公开输入</b></summary>

**公开输入**（用 `pub` 关键字标记）对验证器/链上可见，并成为被证明的陈述（statement）的一部分。

**私有输入**又称见证（witness），会保持隐藏。它们永远不会离开证明者的机器，只在本地用于构建证明。

随后，验证器根据公开输入检查这个证明，从而保证隐藏的私有输入确实存在并满足电路的约束——而这一切都无需暴露它们。

📖 在 [Noir 文档](https://noir-lang.org/docs/noir/concepts/data_types#private--public-types)中了解更多关于输入可见性的内容。

</details>

**公开输入（对验证器公开）：**

- `nullifier_hash: pub Field` → 私有无效化值的公开哈希，在链上追踪以确保只能投票一次

> 🧠 我们对无效化值进行哈希，是因为它不会作为公开输入暴露，否则所有人都能看到它。
> 使用哈希后的版本增加了一层额外的隐私保护，并确保无效化值与承诺之间没有直接关联。

**私有输入（隐藏的见证值）：**

- `nullifier: Field` → 私有值，同时用于 `nullifier_hash` 和承诺
- `secret: Field` → 私有值，与 `nullifier` 组合形成承诺

> 💡 `Field` 类型是 Noir 的默认数字类型。它类似于 Solidity 中的 `uint`，但始终被限制在一个有限范围内（一个“域”），因此 ZK 电路内部的数学运算能够保持一致。请参阅[这里](https://noir-lang.org/docs/noir/concepts/data_types)的文档。

### 🔑 第 4 步：断言与重新哈希

在电路内部：

1. 通过对私有的 `nullifier` 进行哈希，重新计算 `nullifier_hash`。
2. 使用 `assert` 检查它是否等于公开的 `nullifier_hash`。

这保证了：

- 证明者确实知道这个秘密的无效化值。
- 无效化值本身保持隐藏（只有哈希是公开的）。

> 💡 `assert` 确保某个条件必须成立，证明才有效。这是我们在电路中进行的主要检查。

### 🔑 第 5 步：构建承诺

现在，把 `nullifier` 和 `secret` 一起进行哈希——这就是**承诺**。
这里我们使用 `hash_2`。

- 承诺就是默克尔树的叶子。
- 在下一个 Checkpoint 中，我们会用它来计算默克尔根。

这样的设置确保了：

- **隐私性**：无效化值本身永远不会公开。
- **安全性**：`nullifier_hash` 防止有人多次提交同一个证明（我们会在智能合约中追踪它们）。

### **✅ 干得好！**

> 🧠 从本质上讲，电路就是一组断言，强制要求某些条件必须始终成立。这就是它的核心所在。

你刚刚编写了你的第一个 **Noir 电路**！🎉

<details>
<summary>🦉 引导问题</summary>

<details>
<summary>❓ 问题 1</summary>

你如何在电路内部重新生成 `nullifier_hash`，以检查它与公开输入是否一致？

</details>

<details>
<summary>❓ 问题 2</summary>

你将如何组合 `nullifier` 和 `secret` 来生成承诺？

</details>

思考完这些引导问题后，再来看看参考答案代码吧！

<details>
<summary>👩🏽‍🏫 参考答案代码</summary>

```rust
use std::hash::poseidon::bn254::hash_1;
use std::hash::poseidon::bn254::hash_2;

fn main(
    // 公开输入
    nullifier_hash: pub Field,
    // 私有输入
    nullifier: Field,
    secret: Field,
) {
    /// Checkpoint 3 //////
    let computed_nullifier_hash: Field = hash_1([nullifier]);
    assert(computed_nullifier_hash == nullifier_hash);

    let commitment: Field = hash_2([nullifier, secret]);
}
```

</details>
</details>

这里我们不会运行任何代码，这会在后面进行。

### **🥅 目标**

- [ ] 理解承诺方案
- [ ] 编写你的第一个 Noir 电路，并理解 `assert` 函数

## Checkpoint 4: 🌳✅ 在 ZK 电路中实现根检查

是时候解锁**我们电路的核心**了——证明用户确实已经注册，并且在默克尔树中拥有一个承诺。

如果你在电路内部计算出的根与链上公开的根一致，你就通过了验证，可以投票！🗳️

### 🔑 这里有什么新内容？

我们扩展电路来处理**默克尔证明**。这意味着：

1. 使用你的**叶子索引**和**兄弟节点**沿树向上遍历
2. 在电路内部重新计算**根**
3. 将其与公开的 `root` 进行比较

如果一致 → ✅ 你就是一名合法的投票者。

### 🧩 第 1 步：导入默克尔辅助函数

在电路顶部，把 `binary_merkle_root` 的**导入语句取消注释**。

> 👉 它来自 **zk-kit**，即你合约中所用的 Solidity 默克尔库在 Noir 中的对应实现。
> 我们将用这个工具在电路内部重新计算根。

### 🧩 第 2 步：扩展输入

现在我们需要更多输入，才能让默克尔证明运作起来。

**公开（可见 / 链上）：**

- `root: pub Field` → 当前时刻树状态的默克尔根。
  - 存储在链上，用作参照点。
  - 电路会重新计算一个根，并检查它是否与这个根一致。
- `vote: pub bool` → 所选的选项：是或否（`0` 或 `1`）。
  - 它把证明与投票者的选择绑定在一起。
  - 即使有人抢跑（front-run）这个证明，结果也依然相同，因为投票已经被固化进电路之中。
- `depth: pub u32` → 默克尔树的深度（层数）。

**私有（隐藏的见证值）：**

- `index: Field` → 叶子在默克尔树中的位置。
  - 必须保持私有，否则证明会暴露哪个叶子属于哪个投票者。
- `siblings: [Field; 16]` → 从叶子向上爬升到根所需的相邻节点哈希数组。
  - 其中只包含兄弟节点；父节点会在电路内部重新计算。
  - 由于 Noir 不允许动态数组，我们使用固定长度 16。
  - 这最多支持 2^16 个叶子（65,536 名投票者）。

> 🧠 Noir 中的数组必须是固定长度的——没有动态数组。

### 🧩 第 3 步：统计兄弟节点数量

`siblings` 数组的长度设为 16，但并非所有条目都会被用到。

- 统计非零条目的数量 → 这就是实际的路径长度 `siblings_num`。
- 添加一个安全边界：断言声明的 `depth` 不能超过数组长度 16（防止越界）。

### 🧩 第 4 步：将索引转换为比特位

使用 `index.to_le_bits()` 将叶子的 `index` 转换为 **16 个小端序比特位**。

这与默克尔树自底向上构建的方式相对应。比特数组必须与固定长度的 `siblings: [Field; 16]` 对齐。

- 每个比特位表示该层节点位于**左侧**（0）还是**右侧**（1），并决定它与 `siblings[i]` 进行哈希时的顺序。

示例：

- 叶子索引 `5` → `[1,0,1,0,…]` = 右、左、右、左。

> 💡 画一画默克尔树的草图，看看索引的比特位是如何引导路径的。

> 🧠 小端序是指从**最右边的比特位**（数字的最低位）开始书写二进制数字。
> 例如，4 的二进制是 `100`，但在小端序中它变成 `[0,0,1,…]`。

### 🧩 第 5 步：计算根

现在计算默克尔树的根。
使用从 zk-kit 库导入的 `binary_merkle_root`。

> 💡 在[这里查看该函数](https://github.com/zk-kit/zk-kit.noir/blob/main/packages/binary-merkle-root/src/lib.nr)，了解它所需的参数。
> 传入默克尔路径深度时，请使用 `siblings_num`（非零兄弟节点哈希的数量）。
> 这样更安全，因为它反映的是实际路径长度，而不是整个数组的大小。

### 🧩 第 6 步：比较根

最后，断言你的 `computed_root` 等于公开输入 `root`。

如果两者相同 → ✅ 你的承诺有效，并且已包含在树中。

### 🧩 第 7 步：绑定投票

在收尾之前，把投票绑定到证明上：

- `vote` 输入被声明为公开的布尔值，因此它已经被限制为 `0` 或 `1`。
- 但如果我们不在某个约束中使用它，编译器会警告它未被使用。

为了解决这个问题：

1. 将 `vote` 转换为 `Field`。
2. 强制满足方程 `x² = x`。

### **✅ 干得好！**

<details>
<summary>🦉 引导问题</summary>

<details>
<summary>❓ 问题 1</summary>

你如何遍历 `siblings` 数组，只统计其中的非零条目，并把这个数量存为 `siblings_num`？

</details>

<details>
<summary>❓ 问题 2</summary>

你可以添加什么断言，来确保给定的 `depth` 永远不会超过 `siblings` 的最大长度（16）？

</details>

<details>
<summary>❓ 问题 3</summary>

你将如何用 `to_le_bits()` 把叶子的 `index` 转换为 16 个小端序比特位，从而知道每一层是左还是右？

</details>

<details>
<summary>❓ 问题 4</summary>

你需要向 `binary_merkle_root` 传入哪些输入，才能沿路径向上重新计算出根？
（提示：第一个输入是哈希函数——你要对 2 个值进行哈希）

</details>

<details>
<summary>❓ 问题 5</summary>

你将如何把你的 `computed_root` 与公开的 `root` 进行比较，以完成成员资格证明？

</details>

<details>
<summary>❓ 问题 6</summary>

你如何对 `vote` 进行类型转换和约束，使其成为电路的一部分，并避免“未使用变量”的警告？

</details>

思考完这些引导问题后，再来看看参考答案代码吧！

<details>
<summary>👩🏽‍🏫 参考答案代码</summary>

```rust
use std::hash::poseidon::bn254::hash_1;
use std::hash::poseidon::bn254::hash_2;
/// Checkpoint 4 //////
use binary_merkle_root::binary_merkle_root;

fn main(
    // 公开输入
    nullifier_hash: pub Field,
    // 私有输入
    nullifier: Field,
    secret: Field,
    /// Checkpoint 4 //////
    // 公开输入
    root: pub Field,
    vote: pub bool,
    depth: pub u32,
    // 私有输入
    index: Field,
    // 最多 2^16 个叶子 --> 65536 个叶子
    siblings: [Field; 16],
) {
    /// Checkpoint 3 //////
    let computed_nullifier_hash: Field = hash_1([nullifier]);
    assert(computed_nullifier_hash == nullifier_hash);

    let commitment: Field = hash_2([nullifier, secret]);

    /// Checkpoint 4 //////
    let mut siblings_num = 0;
    for i in 0..siblings.len() {
        if siblings[i] != 0 {
            siblings_num += 1;
        }
    }
    assert(depth <= siblings.len());

    let index_bits: [u1; 16] = index.to_le_bits();

    let computed_root = binary_merkle_root(hash_2, commitment, siblings_num, index_bits, siblings);

    assert(computed_root == root);

    // 仅用于绑定投票，以避免编译器警告
    let vote_field = vote as Field;
    assert((vote_field * vote_field) == vote_field);
}
```

</details>
</details>

这里我们同样不会运行任何代码，这会在后面进行。

### **🥅 目标**

- [ ] 在电路内部重新生成默克尔根
- [ ] 理解 Noir 中基于小端序的比特位操作

## Checkpoint 5: 📝 创建 Solidity 验证器合约

既然你的电路已经搭建好并能运行，现在是时候让它在链上真正发挥作用了。
本 Checkpoint 的最终目标是**生成 Solidity 验证器合约**——它是让以太坊能够验证你的零知识证明的桥梁。

<details>
<summary> 在 Noir 文件夹中测试你的电路（可选）</summary>

1. 用 `cd` 进入你的 circuits 文件夹。
2. 运行 `nargo check`。这会生成一个 Prover.toml 文件，你可以在其中粘贴希望电路运行时使用的参数。请记住：输入可能相当多，而且在我们的场景中这并不完全简单直接——你需要预先计算好所有必要的哈希，然后才能把它们传进去。
3. 运行 `nargo execute`。这会编译你的电路，并使用 Prover.toml 中的输入在本地执行它。如果一切正常，它会生成一个见证文件。为了调试，你还可以通过调用 `std::println()` 在电路内部打印值。

> 💡 **见证**是满足电路约束的完整变量赋值集合。它包括：

- 所有**公开输入**
- 所有**私有输入**
- 执行过程中计算出的所有**中间值**

见证文件是证明者为构建证明而实际使用的输入。

</details>

<details>
<summary>使用 Barretenberg（bb）创建证明</summary>

在测试完电路并生成见证之后，下一步就是真正创建一个**零知识证明**。

#### 🔹 什么是 Barretenberg（bb）？

Barretenberg 是 Noir 所基于的**零知识证明系统**。

- 可以把 **Noir（`nargo`）** 看作*语言和编译器*：它接收你的高级程序（`main.nr`），并将其编译成一种称为 **ACIR 电路**的数学对象。
- **Barretenberg（`bb`）** 是*引擎*：它执行繁重的密码学运算，根据这些电路生成和验证证明。

没有 `bb`，你的 Noir 代码只是对约束的描述。
有了 `bb`，这些约束就会被转化为他人可以信任的**密码学证明**。

#### 🔹 第 1 步：使用 `bb prove` 生成证明

```sh
bb prove -b <bytecode> -w <witness> -o <output>
```

具体过程如下：

- `-b` → `circuits.json` 中的电路字节码
- `-w` → 你用 `nargo execute` 生成的见证文件
- `-o` → 指定生成的证明要保存到的文件路径

`bb` 接收电路 + 解（见证），并运行 **UltraHonK 证明方案**。

> 💡 **UltraHonK** 是 Barretenberg 默认使用的证明方案，它是 PLONK 类系统的一个现代化、高度优化的继任者。

**输出：** 一个证明文件——一个很小、可验证的对象，它表明：

> “在给定这些公开输入的情况下，我知道满足电路约束的私有输入。”

重要的是，这个证明**不会透露**任何关于你私有输入的信息。

#### 🔹 第 2 步：生成验证密钥（vk）

在你（或其他任何人）能够验证证明之前，需要一个**验证密钥**（vk）。

- vk 是**电路的紧凑摘要**：它以验证器能够理解的形式，编码了你程序的规则和约束。
- 它**每个电路只需生成一次**（根据电路的 ACIR 字节码生成），之后只要电路不变，就可以重复用于验证针对该电路创建的任意数量的证明。

生成方法：

```sh
bb write_vk -b <bytecode> -o <output>
```

- `-b` → 同样是 `nargo compile` 生成的字节码（你可以在 `circuits.json` 文件中找到它）
- `-o` → 验证密钥要保存到的文件路径

> 💡 当你运行 `bb verify` 时，验证器必须知道该证明声称满足的是**哪个电路**。
> vk 就是这个参照。没有 vk，证明文件就毫无意义——就像有了一把锁，却没有可供核对的锁孔。

#### 🔹 第 3 步：验证证明

有了**证明文件**和 **vk**，任何人都可以检查其有效性

```sh
bb verify -k <vk> -p <proof>
```

- `-k` → 验证密钥
- `-p` → 证明文件

✅ 在链下，这一步瞬间就能完成。
🔗 在链上，vk 被嵌入到 Solidity 验证器合约中（见下文）。

</details>

### 🔹 第 1 步：编译你的电路

> 🚨 对于所有 Noir（`nargo` 或 `bb`）命令，请先 `cd` 进入 `packages/circuits` 目录。

确保最近的所有修改都已生效：

```sh
nargo compile
```

### 🔹 第 2 步：生成验证密钥（vk）

生成证明需要一个**验证密钥**（vk）。
它是验证器针对你的电路的一本精简“规则手册”。

**每当你修改电路时**，都需要生成一个新的 vk。

```sh
bb write_vk --oracle_hash keccak -b ./target/circuits.json -o ./target/
```

vk 概括了你电路的约束（也就是你添加的所有那些 `assert`！），并被重复用于验证所有证明
（更多背景请参阅上文的**使用 Barretenberg 创建证明**）。

> ⚠️ 创建验证密钥时请使用 `--oracle_hash keccak`，使哈希方式与以太坊的 Keccak 标准一致。

### 🔹 第 3 步：生成 Solidity 验证器合约

现在来生成合约本身：

```sh
bb write_solidity_verifier -k ./target/vk -o ./target/Verifier.sol
```

这会在 **`packages/circuits/target`** 中创建一个 **`Verifier.sol`** 文件。
vk 被嵌入到这个合约中，使以太坊能够检查为你的电路生成的证明。

🔍 **检查合约**

验证器合约乍一看可能让人望而生畏，但你只需关注以下几点：

- ✅ 检查 `NUMBER_OF_PUBLIC_INPUTS` 之类的值是否与你对证明的预期相符。
- 🚪 主要入口是 `verify` 函数：

```solidity
interface IVerifier {
    function verify(bytes calldata _proof, bytes32[] calldata _publicInputs) external view returns (bool);
}
```

这就是你的应用将调用的函数，用来确认某个证明是否有效。

> 🚨🚨 每当你修改电路或输入时，务必删除 `target` 文件夹中的文件，以确保环境干净。
> **每当电路发生变化时，你还必须在 Solidity 项目中重新生成并替换验证器智能合约。🚨🚨**

### ✅ 验证器合约已创建！

你现在已经成功生成了 Solidity 验证器合约。
这是将链下证明生成与链上证明验证连接起来的关键一环。

接下来，我们会把它集成到你的项目中，让它真正投入使用。

### **🥅 目标**

- [ ] 理解见证、vk 和证明是如何协同工作的
- [ ] 创建 Solidity 验证器合约

## Checkpoint 6: 🗳️ 启用投票——引入验证器合约

你已经构建好了电路，也创建了验证器合约——现在是时候把它接入我们的 **`Voting.sol`**，启用投票功能了！🗳️

### 🔹 第 1 步：引入验证器合约

<Tabs>
<Tab label="Hardhat">

**Hardhat**

1. 用位于 **`packages/circuits/target`** 中新生成的合约，替换 **`packages/hardhat/contracts`** 中的占位验证器合约 **`Verifier.sol`**。
2. 打开 **`00_deploy_your_voting_contract.ts`**，然后：
   - 取消注释验证器的部署代码
   - 注释掉 `verifierAddress`
   - 更新 `args`，使其与你的设置相匹配

</Tab>
<Tab label="Foundry">

**Foundry**

1. 用位于 **`packages/circuits/target`** 中新生成的合约，替换 **`packages/foundry/contracts`** 中的占位验证器合约 **`Verifier.sol`**。
2. 打开 **`DeployVoting.s.sol`**，然后：
   - 取消注释验证器的部署代码
   - 注释掉占位用的 `verifierAddress`
   - 更新构造函数调用，使其与你的设置相匹配

</Tab>
</Tabs>

3. 在 **`Voting.sol`** 中：
   - 在文件顶部导入验证器合约（只需取消注释已有的那一行）
   - 在构造函数中初始化验证器，并把它存储在名为 `i_verifier` 的变量中

### 🔹 第 2 步：编写 `vote` 函数

在 `vote` 函数中，投票者会发送他们的：

- **证明** → 密码学证明（稍后在前端构建）
- **公开输入** → `nullifierHash`、`root`、`vote` 和 `tree depth`

在计票之前，我们会按以下顺序执行一些**规则**：

#### 1. 验证根 🔐

- **检查空树根**：这可以防止在还没有任何人注册时就进行投票。
- **验证根与当前的根状态一致**（`s_tree.root()`）：这确保证明是基于**真实的链上默克尔树**生成的，而不是某棵任意的树。

**为什么这很重要：** 如果没有根验证，攻击者可以：

- 用他们自己控制的承诺**创建一棵伪造的默克尔树**
- 针对这棵伪造的树生成一个数学上有效的 ZK 证明
- 把该证明连同伪造的根一起提交给合约
- 验证器会接受它（对那个根来说，这个证明是有效的！）
- **结果**：他们从未在链上注册就能投票，完全绕过了白名单系统

> 👉 根检查的作用就是**把证明绑定到真实的链上注册树**。没有它，任何人都可以通过创建伪造的树来投票。这是你的**第一道防线**！

#### 2. 验证证明 🔒

- 调用 `i_verifier` 上的 `verify()` 函数，并传入证明 + 公开输入。
- 验证器要求**公开输入是一个 `bytes32[]` 数组**，且顺序与你的电路文件中的**完全相同**。
- 如果验证失败 → 回滚交易。

#### 3. 防止重复投票 🛑

- 检查 `_nullifierHash` 是否已经被使用过。
- 如果是 → 回滚交易。
- 用一个 mapping 记录已使用过的无效化值：`s_nullifierHashes`。

👉 如果没有这道防护，任何人都可以一遍又一遍地重放相同的证明/输入来多次投票。
这就是为什么说**无效化值是隐私保护投票的基石**。

👉 **重要**：这项检查发生在证明验证**之后**。如果证明无效，我们希望尽早失败，而不必在状态变更上浪费 gas。

✅ 两项检查都通过后：

- 相应地递增 `s_yesVotes` 或 `s_noVotes`
- 触发 `VoteCast` 事件

<details>
<summary>🦉 引导问题</summary>

<details>
<summary>❓ 问题 1</summary>

在执行任何其他逻辑**之前**，你必须进行哪两项根验证检查？为什么它们对安全性至关重要？

</details>

<details>
<summary>❓ 问题 2</summary>

在编写投票逻辑之前，你如何阻止 `_nullifierHash` 被重复使用，从而确保没有人能投票两次？
记得使用正确的错误进行回滚。

</details>

<details>
<summary>❓ 问题 3</summary>

向验证器传递输入时，你如何构建 `bytes32[]` 数组？`_nullifierHash`、`_root`、`_vote` 和 `_depth` 应该按什么顺序放置？

</details>

<details>
<summary>❓ 问题 4</summary>

调用 `i_verifier.verify(_proof, publicInputs)` 之后，你应该检查什么条件？如果检查不通过，又该怎么处理？

</details>

<details>
<summary>❓ 问题 5</summary>

证明验证通过后，你如何决定是递增 `s_yesVotes` 还是 `s_noVotes`，然后再触发 `VoteCast` 事件？
*（提示：`_vote` 的值为 0 或 1）*

</details>

思考完这些引导问题后，再来看看参考答案代码：

<details>
<summary>👩🏽‍🏫 参考答案代码</summary>

```solidity
///////////////////////
/// 状态变量 ///
///////////////////////

/// Checkpoint 6 //////
IVerifier public immutable i_verifier;
mapping(bytes32 => bool) private s_nullifierHashes;

//////////////////
/// 构造函数 ///
//////////////////

constructor(address _owner, address _verifier, string memory _question) Ownable(_owner) {
    s_question = _question;
    /// Checkpoint 6 //////
    i_verifier = IVerifier(_verifier);
}

//////////////////
/// 函数 ///
//////////////////

function vote(bytes memory _proof, bytes32 _nullifierHash, bytes32 _root, bytes32 _vote, bytes32 _depth) public {
        /// Checkpoint 6 //////
        if (_root == bytes32(0)) {
            revert Voting__EmptyTree();
        }

        if (_root != bytes32(s_tree.root())) {
            revert Voting__InvalidRoot();
        }

        bytes32[] memory publicInputs = new bytes32[](4);
        publicInputs[0] = _nullifierHash;
        publicInputs[1] = _root;
        publicInputs[2] = _vote;
        publicInputs[3] = _depth;

        if (!i_verifier.verify(_proof, publicInputs)) {
            revert Voting__InvalidProof();
        }

        if (s_nullifierHashes[_nullifierHash]) {
            revert Voting__NullifierHashAlreadyUsed(_nullifierHash);
        }
        s_nullifierHashes[_nullifierHash] = true;

        if (_vote == bytes32(uint256(1))) {
            s_yesVotes++;
        } else {
            s_noVotes++;
        }

        emit VoteCast(_nullifierHash, msg.sender, _vote == bytes32(uint256(1)), block.timestamp, s_yesVotes, s_noVotes);
    }
```

</details>
</details>

实现完成后，运行测试以确保一切正常：

<Tabs>
<Tab label="Hardhat">

**Hardhat**

```sh
yarn test --grep "Checkpoint6"
```

</Tab>
<Tab label="Foundry">

**Foundry**

```sh
yarn test --match-test "Checkpoint6"
```

</Tab>
</Tabs>

### **✅ 测试通过了？你已经离终点很近了！**

如果你的测试全部通过（显示为绿色），恭喜你——你刚刚完成了**核心的 `Voting.sol` 合约！** 🎉

这意味着你现在拥有了一个完全私密的投票系统，在这个系统中：

- ✅ 投票资格通过 ZK 证明来证明
- ✅ 重复投票会被阻止
- ✅ 投票结果被透明地记录

运行 `yarn deploy`，然后我们将继续集成**前端**，让用户能够与你的投票应用交互。

### **🥅 目标**

- [ ] 理解无效化值如何帮助防止重复投票
- [ ] 正确地将证明和公开输入传入证明验证

## Checkpoint 7: 🌱 创建你的承诺——注册的第一步

你的 `Voting.sol` 合约已经就绪，验证器也已经接入。

现在是时候让**真实用户**参与进来，让注册按钮真正发挥作用了。

但关键在于：在任何人投票之前，他们都需要证明自己已经注册。

这一切就从这里开始——**创建一个承诺**。

你可以把它想象成你的投票系统的**秘密握手暗号**：

- 每个用户生成自己的**无效化值**（用于防止重复投票）
- 将它与一个**秘密值**配对（相当于他们的私人门票）
- 然后用这两者计算出一个**承诺**（唯一会上链的东西）

> 🚨 仔细检查你的电路和前端使用的是**相同的 Noir 和 bb 版本。**
> 版本不匹配会导致错误。
> 在我们的 `nextjs/package.json` 中，你会看到：
> `"@aztec/bb.js": "0.82.0"` 和 `"@noir-lang/noir_js": "1.0.0-beta.3"`。
> 确保它们与你运行 `bb --version` 和 `nargo --version` 时显示的版本一致。

### 🛠 编写承诺函数

📁 打开 **`packages/nextjs/app/voting/_challengeComponents/CreateCommitment.tsx`**。

这个组件已经为你写好了。你的任务是：实现 `generateCommitment` 函数。

目前，它为 `commitment`、`nullifier` 和 `secret` 返回的是虚拟值。
这些占位值必须去掉——用真正的逻辑替换它们！

> 💡 `Fr` 是 **BN254 的有限域类型**，它确保所有数字（例如无效化值和秘密值）都处于 ZK 电路所使用的有效标量域之内。

### 实现步骤

1. **取消注释文件顶部的 import 语句**。
2. **生成新的值**：用 `Fr.random()` 创建随机的 `nullifier` 和 `secret`。
   - 先把它们转换为 `string`，再转换为 `BigInt`。
3. **用 Poseidon 进行哈希**：使用 Poseidon（2 输入）计算 `commitment`，输入顺序必须严格为 `[nullifier, secret]`。
   > 这与你在电路中使用的哈希逻辑完全一致。
4. **转换为 Solidity 所需的格式**：把你的 `commitment` 转换为 `bytes32` 十六进制字符串。
   - 提示：使用 viem 中的 `toHex`。
5. **返回全部三个值**：`commitment`、`nullifier` 和 `secret`。

> 🧠 **关键提醒**：
> **承诺**是公开的，但你的**无效化值**和**秘密值**是私密的。
> 它们是证明你拥有投票权的钥匙。
> 我们会在这里把它们存储到 local storage 中，以便你稍后生成证明时复用。
> ⚠️ 如果它们泄露，其他人就可以代替你投票！

<details>
<summary>🦉 引导问题</summary>

<details>
<summary>❓ 问题 1</summary>

你如何使用 `Fr.random()` 生成始终位于 BN254 域内的值，
以及为什么在进一步使用之前需要把它们转换为 `BigInt`？

</details>

<details>
<summary>❓ 问题 2</summary>

如果你交换了 Poseidon 的输入顺序，会发生什么
（例如用 `[secret, nullifier]` 代替 `[nullifier, secret]`）？

</details>

<details>
<summary>❓ 问题 3</summary>

你将如何确保你的 `commitment`、`nullifier` 和 `secret`
都被格式化为 Solidity 能接受的有效 **bytes32 十六进制字符串**？

</details>

思考完这些引导问题后，再来看看参考答案代码：

<details>
<summary>👩🏽‍🏫 参考答案代码</summary>

```ts
const generateCommitment = async (): Promise<CommitmentData> => {
  /// Checkpoint 7 //////
  const nullifier = BigInt(Fr.random().toString());
  const secret = BigInt(Fr.random().toString());
  const commitment = poseidon2([nullifier, secret]);

  const commitmentHex = toHex(commitment, { size: 32 });
  const nullifierHex = toHex(nullifier, { size: 32 });
  const secretHex = toHex(secret, { size: 32 });

  return {
    commitment: commitmentHex,
    nullifier: nullifierHex,
    secret: secretHex,
  };
};
```

</details>
</details>

### **✅ 实现了吗？！干得漂亮！**

前往 [localhost:3000](http://localhost:3000/)，把你自己添加到**白名单**中。
然后继续完成注册。

如果一切顺利，你现在应该会看到：

![registered-zk](https://raw.githubusercontent.com/scaffold-eth/se-2-challenges/challenge-zk-voting/extension/packages/nextjs/public/registered-zk.png)

> 🎉 现在你的秘密值和无效化值已经隐藏在智能合约的默克尔根中。
> 只有你知道它们——更准确地说，是你的浏览器知道 🙂（它们存储在 local storage 中）！

> 🚨 每次你用 `yarn chain` 重启本地链时，都要滚动到 **Voting** 页面底部，点击 **Clear Local Storage**。
> 否则，由于合约会复用相同的地址，前端会误以为你已经为该合约创建过承诺。

> 💡 你可以查看保存在 **localStorage** 中的承诺。
> 只需滚动到页面底部，点击 **Log Local Storage** 即可。

![loglocalstorage-zk](https://raw.githubusercontent.com/scaffold-eth/se-2-challenges/challenge-zk-voting/extension/packages/nextjs/public/loglocalstorage-zk.png)

### **🥅 目标**

- [ ] 学会如何把值格式化为验证器合约所期望的正确类型
- [ ] 理解如何在 TypeScript 中使用 Poseidon 进行哈希

## Checkpoint 8: 🔏 生成你的证明

你已经创建了你的**承诺**，并成功完成了注册。

现在迎来了神奇的时刻：**创建证明**，证明你就在默克尔树中。

这一步的核心是生成一个**零知识证明**，它表明：

> “我已经注册，我知道我的无效化值 + 秘密值，因此我可以证明我是这棵树的成员。”

### 🛠 编写证明生成函数

📁 打开 **`packages/nextjs/app/voting/_challengeComponents/GenerateProof.tsx`**。

> 💡 在这一步中，我们会创建**两个证明**：
>
> 1. **默克尔包含证明**（用于收集我们需要的兄弟节点），
> 2. **ZK 证明**，它会被发送给 Solidity 验证器。
>
> 默克尔证明就像一个小技巧，它提供路径，而 ZK 证明则把这条路径与无效化值、秘密值和投票选项一起封装起来。

🎯 你的目标：完成 `generateProof` 函数。其余部分都已就绪。

1. **取消注释 import 语句**
2. **删除 `void` + return 语句**，然后开始实现
3. **计算 `nullifierHash`**（提示：`poseidon1`）
4. **重建默克尔树**
   - 使用 Poseidon2 哈希初始化一棵新树（提示：`new LeanIMT`）
   - 从事件中提取值 → `_leaves` 是一个合约事件数组。每个事件都包含一个 `value`（链上的承诺）。`map` 只把这些值提取出来，组成一个干净的数组 `leaves`。
   - **反转顺序** → 事件是按“最新的在最后”的顺序触发的，但我们的默克尔树要按**最旧的在前**的顺序构建。反转可以确保树被正确地重建。
   - 插入到 `LeanIMT` 中，以重建出完全一致的树状态（提示：`.insertMany()`）
     > 💡 我们导入的是同一个 `zk-kit/lean-imt` 库，只不过这次用的是 **TypeScript** 版本。

5. **创建默克尔树包含证明**
   - 在 `calculatedTree` 上调用 `.generateProof(_index)`。
   - 从结果中访问 `.siblings`，并把它转换为数组。
   - 添加 `"0"` 占位值，使兄弟节点数组始终具有电路所要求的固定长度（16）。

6. **准备电路输入（`input`）**
   - 确保所有值的顺序都与你的电路中的一致。
   - 把所有值都转换为字符串（兄弟节点应该是一个字符串数组）。

7. **创建见证**
   - 初始化 Noir 电路实例：`const noir = new Noir(_circuitData);`。这会把你编译好的 ZK 电路加载到 JavaScript 中，以便你运行它。
   - 运行：`const witness = await noir.execute(input);`。它会返回**见证**。
   - 如果你想查看它的样子，可以使用 `console.log`。

8. **生成 ZK 证明**
   - 初始化证明后端：`const honk = new UltraHonkBackend(_circuitData.bytecode, { threads: 1 });`
   - 生成证明：`honk.generateProof(witness, {keccak: true});`。它接收来自 Noir 的见证，生成真正的 **ZK 证明**及其**公开输入**，并使用 Keccak 哈希以与验证器保持一致。
   - 为了调试，你可以用 `console.log` 打印你的证明（注意 .`generateProof` 调用前后需要静默日志，即临时覆盖日志函数）

   > 💡 **UltraHonk 后端**是证明引擎，它接收你电路的字节码 + 见证来生成零知识证明。
   > 它生成的格式正是你的 Solidity 验证器所期望的格式。
   > `threads` 选项控制使用多少个 CPU 核心（`1` 就够了，线程越多 = 越快）。

9. **为 Solidity 格式化结果**
   - 使用 viem 中的 `encodeAbiParameters` 对 `[proof, publicInputs]` 进行编码。确保每个值都是十六进制格式。
   - （提示：查看你的 **`Voting.sol`** 合约，了解期望的格式。）

<details>
<summary>🦉 引导问题</summary>

<details>
<summary>❓ 问题 1</summary>

你将如何用 `poseidon1` 计算 `nullifierHash`，
以及 `_nullifier` 必须是什么输入格式？
*（提示：`BigInt`）*

</details>

<details>
<summary>❓ 问题 2</summary>

链上的事件是按“最新的在最后”的顺序触发的。
你将如何转换 `_leaves`，使 IMT 按**最旧的在前**的顺序接收它们？

</details>

<details>
<summary>❓ 问题 3</summary>

你如何确保你的兄弟节点数组长度为 16？

</details>

<details>
<summary>❓ 问题 4</summary>

你的电路是按什么确切的顺序和类型声明输入的？

</details>

思考完这些引导问题后，再来看看参考答案代码：

<details>
<summary>👩🏽‍🏫 参考答案代码</summary>

```ts
const generateProof = async (
  _root: bigint,
  _vote: boolean,
  _depth: number,
  _nullifier: string,
  _secret: string,
  _index: number,
  _leaves: any[],
  _circuitData: any,
) => {
  /// Checkpoint 8 //////
  const nullifierHash = poseidon1([BigInt(_nullifier)]);
  const calculatedTree = new LeanIMT((a: bigint, b: bigint) =>
    poseidon2([a, b]),
  );
  const leaves = _leaves.map((event) => {
    return event?.args.value;
  });
  const leavesReversed = leaves.reverse();
  calculatedTree.insertMany(leavesReversed as bigint[]);
  const calculatedProof = calculatedTree.generateProof(_index);
  const sibs = calculatedProof.siblings.map((sib) => {
    return sib.toString();
  });

  const lengthDiff = 16 - sibs.length;
  for (let i = 0; i < lengthDiff; i++) {
    sibs.push("0");
  }
  const input = {
    nullifier_hash: nullifierHash.toString(),
    nullifier: BigInt(_nullifier).toString(),
    secret: BigInt(_secret).toString(),
    root: _root.toString(),
    vote: _vote,
    depth: _depth.toString(),
    index: _index.toString(),
    siblings: sibs,
  };
  try {
    const noir = new Noir(_circuitData);
    const { witness } = await noir.execute(input);
    console.log("witness", witness);
    const honk = new UltraHonkBackend(_circuitData.bytecode, { threads: 1 });
    const originalLog = console.log;
    console.log = () => {};
    const { proof, publicInputs } = await honk.generateProof(witness, {
      keccak: true,
    });
    console.log = originalLog;
    console.log("proof", proof);
    const proofHex = toHex(proof);
    const inputsHex = publicInputs.map((x) =>
      typeof x === "string"
        ? (x as `0x${string}`)
        : toHex(x as Uint8Array, { size: 32 }),
    );
    const result = encodeAbiParameters(
      [{ type: "bytes" }, { type: "bytes32[]" }],
      [proofHex, inputsHex],
    );
    console.log("result", result);
    return { proof, publicInputs };
  } catch (error) {
    console.log(error);
    throw error;
  }
};
```

</details>
</details>

### **✅ 实现了吗？！干得好！**

打开 [localhost:3000](http://localhost:3000/)，选择你的投票选项，然后点击 **Generate Proof**。

![generateproof-zk](https://raw.githubusercontent.com/scaffold-eth/se-2-challenges/challenge-zk-voting/extension/packages/nextjs/public/generateproof-zk.png)

证明创建完成后，按钮会更新为显示 **Proof already exists**。

![proofgenerated-zk](https://raw.githubusercontent.com/scaffold-eth/se-2-challenges/challenge-zk-voting/extension/packages/nextjs/public/proofgenerated-zk.png)

👉 如果你添加了 `console.log`，可以在开发者控制台中查看原始的证明输出。
👉 或者，滚动到页面底部并点击 **Log Local Storage**，打印出保存在浏览器中的证明数据。

### **🥅 目标**

- [ ] 重建默克尔树并生成兄弟节点证明
- [ ] 为电路正确地格式化输入
- [ ] 使用 Noir + UltraHonk 生成有效的 ZK 证明

## Checkpoint 9: 🔥 在 Hardhat 上创建 burner wallet（临时钱包）来发送你的投票

你的 **ZK 证明**已经准备好了——现在是时候真正**投出你的票**了。

但 ⚠️ 这里有个问题：如果你用注册时的**同一个地址**投票，所有人都能在链上看到是哪个地址投了票、投的是什么。
那样就会让我们刚才在 Noir、默克尔树和证明生成上付出的所有努力付诸东流。

所以，我们改为**从一个全新的 burner wallet 发送投票**，这个地址与你的注册钱包或任何过往交易都**没有关联**。
这样一来，只有证明能把你和你的投票联系起来，除此之外别无其他。

> 🧠💡 核心思想：切断**注册地址**与**投票地址**之间的联系。
> **证明**是唯一的桥梁，而且只有你知道它，从而保护了你的隐私。

### 🛠 设置使用 burner wallet 投票

📁 打开 **`packages/nextjs/app/voting/_components/VoteWithBurnerHardhat.tsx`**

> 💡 删除占位代码，并实现下面的逻辑。

你将在以下两个函数中编写代码：

- `generateBurnerWallet`
- `sendVoteWithBurner`

### 1. **生成一个全新的 burner wallet**

- 在 `generateBurnerWallet` 中创建一个全新的钱包。
- 使用 **viem** 生成这个新的密钥对。

### 2. **为 burner wallet 注资（仅限本地 Hardhat）**

- 在 `sendVoteWithBurner` 内部，在**本地 Hardhat 环境**中为你的钱包注资。
- 从第一个签名者账户发送 ETH，让 burner wallet 有足够的 gas 来投票。

### 3. **调用 vote 函数**

- burner wallet 有了资金后，调用你的 **Voting.sol** 合约上的 `vote` 函数。
- 同时传入**证明**和**公开输入**。
- 直接从 **localStorage** 中的 `proofData` 获取它们。
- 正确格式化证明（提示：`uint8[]`，你可以使用辅助函数 `uint8ArrayToHexString`）。
- 确保**公开输入**按照电路期望的**确切顺序**传入。

<details>
<summary>🦉 引导问题</summary>

<details>
<summary>❓ 问题 1</summary>

如何使用 **viem** 生成一个全新的钱包？

</details>

<details>
<summary>❓ 问题 2</summary>

如何用 **viem** 为生成的钱包注资？

</details>

<details>
<summary>❓ 问题 3</summary>

在 **localStorage** 的什么位置可以找到 `proofData`，你又如何在代码中访问它？

</details>

<details>
<summary>❓ 问题 4</summary>

如何确保**公开输入**按照电路期望的确切顺序传入？
*（提示：没什么需要做的 🙂）*

</details>

思考完这些引导问题后，再来看看参考答案代码：

<details>
<summary>👩🏽‍🏫 参考答案代码</summary>

```ts
const sendVoteWithBurner = async ({
  viemContract,
  publicClient,
  walletAddress,
  proofData,
}: {
  viemContract: any;
  publicClient: ReturnType<typeof createPublicClient>;
  walletAddress: `0x${string}`;
  proofData: LocalProofData;
}): Promise<string> => {
  /// Checkpoint 9 //////
  const needed = parseEther("0.01");
  const bal = await publicClient.getBalance({ address: walletAddress });
  if (bal < needed) {
    const testClient = createTestClient({
      chain: hardhat,
      mode: "hardhat",
      transport: http("http://localhost:8545"),
    });
    await testClient.setBalance({ address: walletAddress, value: needed });
  }

  const hash = await viemContract.write.vote([
    uint8ArrayToHexString(proofData.proof),
    proofData.publicInputs[0],
    proofData.publicInputs[1],
    proofData.publicInputs[2],
    proofData.publicInputs[3],
  ]);
  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  return receipt.transactionHash;
};

const generateBurnerWallet = () => {
  /// Checkpoint 9 //////
  const privateKey = generatePrivateKey();
  const account = privateKeyToAccount(privateKey);
  const wallet = {
    privateKey: privateKey as `0x${string}`,
    address: account.address as `0x${string}`,
  };
  setBurnerWallet(wallet);

  const effectiveContractAddress = contractAddress || contractInfo?.address;
  if (effectiveContractAddress && userAddress) {
    saveBurnerWalletToLocalStorage(
      wallet.privateKey,
      wallet.address,
      effectiveContractAddress,
      userAddress,
    );
  }

  return wallet;
};
```

</details>
</details>

### **🎉 实现了吗？！来投票吧！**

点击 **Vote**，把你的投票发出去。
你的投票选择在创建证明时就已经确定了——它与该证明绑定在一起，所以没有人能抢跑或篡改它。

点击 **Vote**，投出你的选票。

![voted-zk](https://raw.githubusercontent.com/scaffold-eth/se-2-challenges/challenge-zk-voting/extension/packages/nextjs/public/voted-zk.png)

如果一切顺利，你现在应该能看到你的投票已被计入（在这个例子中：**Yes = 1**）。

![votingstats-zk](https://raw.githubusercontent.com/scaffold-eth/se-2-challenges/challenge-zk-voting/extension/packages/nextjs/public/votingstats-zk.png)

🎊 恭喜，你刚刚完成了一次**私密投票**！

### **🥅 目标**

- [ ] 用 viem 创建一个 **burner wallet** 并为其注资
- [ ] 用它携带证明 + 公开输入**提交你的投票**
- [ ] 理解为什么需要 burner wallet

## Checkpoint 10: 🌍 准备在真实网络上投票

你已经证明了自己包含在默克尔树中，并在本地完成了投票。现在让我们把它变成**现实**：
在 **Sepolia 测试网**上发送同样保护隐私的投票。

在这里，要用一个与你没有关联的中立地址为账户注资会更棘手一些。
这就是为什么我们使用 **ERC-4337**（账户抽象，Account Abstraction），并配合一个验证型 paymaster（verifying paymaster）来支付 gas 费用。

> 💡 为了简单起见，我们使用第三方 ERC-4337 服务商 **Pimlico**。
> 它通过 bundler 处理你的 **UserOperations**，并用 paymaster 支付 gas。
> 在 TypeScript 中进行设置非常简单。

> 🚨 首先，在 Pimlico 注册，[获取你的 API 密钥](https://dashboard.pimlico.io/)，
> 并把它放进你的 **.env** 文件中。
> 在 Sepolia 上，你可以免费使用它。

你将在以下两个函数中编写代码：

- `createSmartAccount`
- `voteOnSepolia`

📁 打开 **`packages/nextjs/app/voting/_components/VoteWithBurnerSepolia.tsx`**

### 🛠 创建智能账户钱包

1. 生成一个**新的私钥和钱包**（全新的，从未使用过）。

2. 设置一个连接到 Sepolia 的**公共客户端**（public client）。

3. 使用 **permissionless** 库中的 `toSafeSmartAccount` 创建你的智能账户。

```ts
const account = await toSafeSmartAccount({
  client: publicClient,
  owners: [wallet],
  version: "1.4.1",
});
```

4. 用 createSmartAccountClient 构建一个 smartAccountClient，稍后你将用它来发送你的投票。

```ts
const smartAccountClient = createSmartAccountClient({
  account,
  chain: CHAIN_USED,
  bundlerTransport: http(pimlicoUrl),
  paymaster: pimlicoClient,
  userOperation: {
    estimateFeesPerGas: async () => {
      return (await pimlicoClient.getUserOperationGasPrice()).fast;
    },
  },
});
```

5. 最后返回 `smartAccountClient`、`smartAccount`、`walletOwner`

### 🛠 投出选票

1. 在把交易发送给 bundler 之前，先使用 viem 的 `encodeFunctionData` **构建 calldata**（参数与上一个 Checkpoint 相同）。

2. 接着，使用你的 **smartAccountClient** 通过 `.sendTransaction` 发送交易，并记录返回的 **UserOpHash**。

3. 最后，返回这个哈希。

<details>
<summary>🦉 引导问题</summary>

<details>
<summary>问题 1</summary>
在你的设置中，如何生成一个**全新的私钥和钱包**，使它永远不会与你的注册地址产生关联？
</details>

<details>
<summary>问题 2</summary>
与普通 EOA 相比，**Safe 智能账户**（通过 `toSafeSmartAccount`）起什么作用？
</details>

<details>
<summary>问题 3</summary>
在 Sepolia 上发送交易时，为什么我们需要 **bundler** 和 **paymaster**，而不是直接发送交易？
</details>

<details>
<summary>问题 4</summary>
发送交易后，你可以在哪里查询 **UserOpHash**，以确认你的投票已被打包上链？
</details>

思考完这些引导问题后，再来看看参考答案代码吧！

<details>
<summary>👩🏽‍🏫 参考答案代码</summary>

```ts
const createSmartAccount = async (): Promise<{
  smartAccountClient: any;
  smartAccount: `0x${string}`;
  walletOwner: `0x${string}`;
}> => {
  try {
    /// Checkpoint 10 //////
    const privateKey = generatePrivateKey();
    const wallet = privateKeyToAccount(privateKey);
    const publicClient = createPublicClient({
      chain: CHAIN_USED,
      transport: http(RPC_URL),
    });
    const account = await toSafeSmartAccount({
      client: publicClient,
      owners: [wallet],
      version: "1.4.1",
    });
    const smartAccountClient = createSmartAccountClient({
      account,
      chain: CHAIN_USED,
      bundlerTransport: http(pimlicoUrl),
      paymaster: pimlicoClient,
      userOperation: {
        estimateFeesPerGas: async () => {
          return (await pimlicoClient.getUserOperationGasPrice()).fast;
        },
      },
    });
    return {
      smartAccountClient,
      smartAccount: account.address as `0x${string}`,
      walletOwner: wallet.address as `0x${string}`,
    };
  } catch (error) {
    console.error("Error creating smart account:", error);
    throw error;
  }
};

const voteOnSepolia = async ({
  proofData,
  contractInfo,
  contractAddress,
  smartAccountClient,
}: {
  proofData: any;
  contractInfo: any;
  contractAddress: any;
  smartAccountClient: any;
}): Promise<{ userOpHash: `0x${string}` }> => {
  if (!contractInfo && !contractAddress) throw new Error("Contract not found");
  /// Checkpoint 10 //////
  const callData = encodeFunctionData({
    abi: (contractInfo?.abi as any) || ([] as any),
    functionName: "vote",
    args: [
      toHex(proofData.proof),
      proofData.publicInputs[0], // _nullifierHash
      proofData.publicInputs[1], // _root
      proofData.publicInputs[2], // _vote
      proofData.publicInputs[3], // _depth
    ],
  });

  const userOpHash = await smartAccountClient.sendTransaction({
    to: (contractAddress || contractInfo?.address) as `0x${string}`,
    data: callData,
    value: 0n,
  });

  return { userOpHash };
};
```

</details>

</details>

### 🚀 Checkpoint 完成！

干得好！现在前往**下一个 Checkpoint**，我们将把所有内容部署到 Sepolia，最终**真正在链上**投出你的票。

### **🥅 目标**

- [ ] 学习如何使用 ERC-4337（通过 Pimlico）设置**智能账户**
- [ ] 使用 **bundler + paymaster**（通过 Pimlico）发送一笔赞助交易（sponsored transaction）

## Checkpoint 11: 💾 部署你的合约并在 Sepolia 上投票！🛰

### 为生产级应用配置第三方服务

默认情况下，🏗 Scaffold-ETH 2 为 **Alchemy** 和 **Etherscan** 等常用服务提供了预设的 API 密钥。
这让你无需额外设置，就能轻松开始开发并完成你的 **Speedrun Ethereum**。

对于**生产级应用**，你应该生成自己的 API 密钥，以避免触及速率限制，并确保 Pimlico 等集成能够正常工作。

在这里配置你的密钥：

<Tabs>
<Tab label="Hardhat">

**Hardhat**

- 🔷 **`ALCHEMY_API_KEY`**（位于 `packages/hardhat/.env` 和 `packages/nextjs/.env.local`）→ [从 Alchemy 获取密钥](https://dashboard.alchemy.com/)
- 🔑 **`NEXT_PUBLIC_PIMLICO_API_KEY`**（位于 `packages/nextjs/.env.local`）→ [从 Pimlico 获取密钥](https://dashboard.pimlico.io/)
- 📃 **`ETHERSCAN_API_KEY`**（位于 `packages/hardhat/.env`）→ [从 Etherscan 获取密钥](https://etherscan.io/myapikey)

</Tab>
<Tab label="Foundry">

**Foundry**

- 🔷 **`ALCHEMY_API_KEY`**（位于 `packages/foundry/.env` 和 `packages/nextjs/.env.local`）→ [从 Alchemy 获取密钥](https://dashboard.alchemy.com/)
- 🔑 **`NEXT_PUBLIC_PIMLICO_API_KEY`**（位于 `packages/nextjs/.env.local`）→ [从 Pimlico 获取密钥](https://dashboard.pimlico.io/)
- 📃 **`ETHERSCAN_API_KEY`**（位于 `packages/foundry/.env`）→ [从 Etherscan 获取密钥](https://etherscan.io/myapikey)

</Tab>
</Tabs>

> 💬 提示：对于线上应用，请把 **Next.js** 的环境变量存放在 Vercel/系统的环境变量配置中；本地测试时使用 `.env.local`。

### 部署你的智能合约

🔐 你需要使用 `yarn generate` 生成一个**部署者地址**。这会创建一个助记词并保存在本地。

👩‍🚀 使用 `yarn account` 查看你的部署者账户余额。

⛽️ 你需要用你的钱包向部署者地址发送 ETH，或者从你所选网络的公共水龙头获取 ETH。

<Tabs>
<Tab label="Hardhat">

**Hardhat**

> 🚨 别忘了在 `00_deploy_your_voting_contract.ts` 中设置所有者地址。

🚀 运行 `yarn deploy --network sepolia`，将你的智能合约部署到 Sepolia。

> 💬 提示：你可以在 hardhat.config.ts 中把 defaultNetwork 设置为 sepolia，或者运行 yarn deploy --network sepolia。

</Tab>
<Tab label="Foundry">

**Foundry**

> 🚨 别忘了在 `DeployVoting.s.sol` 中设置所有者地址。

🚀 运行 `yarn deploy --network sepolia`，将你的智能合约部署到 Sepolia。

</Tab>
</Tabs>

💻 在 `scaffold.config.ts` 中把 `targetNetwork` 改为 `chains.sepolia`。在 http://localhost:3000 查看你的前端，并确认显示的是正确的网络 Sepolia。

### 将你的前端部署到 Vercel

> ⚠️ Vercel/静态部署：把电路字节码复制到 Next.js 的 public 文件夹中，这样前端才能在运行时获取它。

部署之前先运行：

```sh
cp packages/circuits/target/circuits.json packages/nextjs/public/circuits.json
```

📦 运行 `yarn vercel` 打包并部署你的前端。

> 你可能需要先登录 Vercel，运行：
> `yarn vercel:login`。登录后（通过邮箱、GitHub 等），使用默认选项即可。
> 如果你想重新部署到同一个生产环境 URL：`yarn vercel --prod`。如果省略 `--prod` 参数，它会部署到一个预览/测试 URL。按照步骤部署到 Vercel——你会得到一个**公开 URL**。

### 🚀 🔥 挑战攻克！

现在去投票吧！注册你自己，创建证明，然后点击 **Vote** 按钮。

![sepoliavote-zk](https://raw.githubusercontent.com/scaffold-eth/se-2-challenges/challenge-zk-voting/extension/packages/nextjs/public/sepoliavote-zk.png)

**🎉 恭喜！** 你成功了——一个完整的、完全运行在链上的**隐私保护投票应用**。

花点时间庆祝一下，这可是件大事！🥳 拍拍自己的肩膀（拍两下也行 👏👏）。

## Checkpoint 12: 📜 合约验证

运行 `yarn verify --network your_network` 命令，在 Etherscan 上验证你的合约 🛰

👉 在 [Sepolia Etherscan](https://sepolia.etherscan.io/) 上搜索这个地址，获取要提交到 🏃‍♀️[SpeedRunEthereum.com](https://speedrunethereum.com/) 的 URL。

## Checkpoint 13: 🧠🍔 最终考量与深入思考

你现在拥有了一个**可运行的 ZK 投票 dApp**，这是一个重要的里程碑！🚀

最后这个 Checkpoint 不是要写更多代码，而是要你**像一个准备把产品发布到生产环境的构建者那样思考**。

### ⚠️ 根的历史很重要

- 只使用**最新的根**在演示中可行，但在生产环境中会导致**过期证明失败**：
  用户生成证明 → 另一个人注册 → 根发生变化 → 该用户的投票被回滚。
- **解决方法**：维护一个**最近根的环形缓冲区**（例如最近 30–100 个）。新的根会覆盖最旧的根。
- 验证时，接受针对**历史中任意一个根**的证明。
- **好处**：更少的失败交易、更流畅的用户体验、在网络拥堵时更有韧性。
- **权衡**：存储/gas 成本略有增加，但为了可靠性是值得的。

### 🔐 隐私取决于参与者

- 在 ZK 系统中，你的隐私来自**匿名集**（anonymity set） → 即所有你有可能是其中之一的参与者组成的群体。
- 如果只有 **1–2 名投票者**，很容易猜出谁投了什么。只有当更多承诺加入这个集合时，真正的隐私才会出现。
- **集合越大 = 隐私越强**。观察者无法判断某张选票是由哪个已注册用户投出的。
- 良好的用户体验：显示**当前匿名集的大小**（例如“12 名已注册投票者”），让参与者了解自己的隐私程度。
- 有些应用甚至会在投票开始前强制要求**最小集合大小**。

### 🗳 注册策略

- 在生产环境中，要定义一个明确的**投票开始前的注册期**。
- 如果用户可以注册后立即投票，观察者可能会把这些操作关联起来，尤其是在参与度较低的时候。
- 专门的注册窗口期能让承诺不断积累 → 匿名集更强。
- 注册结束后再开放投票 → 隐私性提高，因为投票无法再与注册时间关联起来。

### 🛠 索引是关键

- 在演示中，在浏览器内重建默克尔树是可行的，但它又慢又不可靠。
- 在生产环境中，运行一个专门的**索引器**（indexer）：
  - 监听合约事件
  - 在链下重建默克尔树
  - 存储根 + 兄弟节点
- 好处：
  - 无需在浏览器中进行繁重的计算
  - 即使发生链重组（reorg），数据也依然正确
  - 更快、更流畅的用户体验 + 单一可信的数据来源

### ⛽️ Gas 赞助

- 在这个挑战中，**Pimlico** 让免 gas 投票变得很容易。
- 在生产环境中，考虑运行**你自己的验证型 paymaster**：
  - 定义规则 → 每场投票的预算、速率限制或策略
  - 避免依赖第三方
  - 完全掌握成本情况
- 结果：**可定制、可靠、去中心化的 gas 赞助**。

### ⚠️ 局限性：这不是 MACI

这个挑战并没有实现完整的 MACI（Minimal Anti-Collusion Infrastructure，最小反共谋基础设施）框架。
虽然它展示了基于承诺 + 无效化值的隐私保护，但它并不具备抗胁迫性。

在这个版本中，投票者的选择被固化在 calldata 里，通过公开自己的证明，他们事后就可以证明自己是如何投票的。

这意味着出售选票或胁迫投票仍然是可能的。

真正的抗胁迫性（如 MACI 所提供的）需要额外的机制，通常是一个更换密钥的步骤或一个协调者，这样即使投票者想证明自己的真实选择，也无法做到。

如果你想更深入地了解这为什么重要，以及 MACI 和多方计算等系统如何解决这个问题，请阅读 Vitalik [Buterin 的文章](https://vitalik.eth.limo/general/2021/05/25/voting2.html)。

如果你想看一个实现了 MACI 的真实项目，可以看看 [maci.pse.dev](maci.pse.dev)。

### 🌱 投票之外

你现在已经理解了 **ZK 投票的核心机制**：

✔ 承诺与无效化值
✔ 默克尔证明与默克尔树
✔ Noir 电路与约束
✔ Solidity 验证器
✔ 匿名投票

但这仅仅是个开始。驱动你的投票系统的同一套**承诺 + 无效化值**模式，也为许多其他隐私保护应用打开了大门：

- 混币器（切断存款与取款之间的关联）
- 隐私（shielded）ERC-20 转账
- 二次方投票
- 新的治理模型

这个挑战是你进入**一个全新设计空间的入口**。💥

**你会用 Noir 和 ZK 电路构建什么呢？🧪✨**
