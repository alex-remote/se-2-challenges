# 🔮 预言机挑战

![readme-oracle](https://raw.githubusercontent.com/scaffold-eth/se-2-challenges/challenge-oracles/extension/packages/nextjs/public/hero.png)

🔗 构建你自己的去中心化预言机系统！在这个 Speedrun Ethereum 挑战中，你将探索支撑去中心化网络的三种基本预言机架构：**白名单预言机（Whitelist Oracle）**、**质押预言机（Staking Oracle）**和**乐观预言机（Optimistic Oracle）**。

🧠 你将深入研究把真实世界数据引入区块链的机制，理解安全性、去中心化与效率之间至关重要的权衡。每种预言机设计都代表了解决同一个根本问题的不同思路：我们如何信任来自区块链外部的数据，又如何安全地把它带上链？

<details markdown='1'><summary>❓ 想知道什么是预言机？请阅读这里的概述。</summary>

预言机是区块链与外部世界之间的桥梁。它们解决了一个根本问题：智能合约只能访问存在于区块链上的数据，但大多数真实世界的数据（价格、天气、体育比分等）都存在于链下。

🤔 为什么预言机很重要？

- **DeFi 协议**：借贷、交易和清算都需要准确的喂价（price feed）
- **保险**：需要验证真实世界中的事件（天气、航班延误）
- **游戏**：需要随机数和外部事件的结果
- **供应链**：追踪真实世界中的货物与事件

🔒 为什么预言机很难做？

- **信任**：我们怎么知道预言机说的是真话？
- **中心化**：单点故障可能危及整个协议
- **激励**：如何让预言机的行为与协议的需求保持一致？
- **延迟**：实时数据必须新鲜且准确

👍 现在你已经了解了基础知识，让我们来看看三种不同的预言机系统吧！

</details>

---

🌟 最终交付成果是通过动手实现，全面理解各种预言机架构。你将探索三种预言机系统——白名单预言机、基于质押的预言机和乐观预言机——并逐一实现它们。最后，你将把你的乐观预言机部署到测试网，并演示它如何处理断言、提议、争议和结算。

🔍 首先，让我们理解为什么需要多种预言机设计。每种方案各有不同的优势：

- **白名单预言机**：简单快速，但需要信任一个中心化机构
- **质押预言机**：去中心化且有经济激励，但更复杂
- **乐观预言机**：基于争议机制，安全保障强，但延迟更高

📚 本挑战的灵感来自真实世界中的预言机系统，例如 [Chainlink](https://chain.link/)、[Pyth Network](https://www.pyth.network/) 和 [UMA Protocol](https://uma.xyz/)。

💬 在 [预言机挑战 Telegram 群](https://t.me/+AkmcMB3jC3A0NDcx) 中结识正在进行本挑战的其他开发者并获取帮助

---

## Checkpoint 0: 📦 环境 📚

开始之前，你需要安装以下工具：

- [Node (>= v18.18)](https://nodejs.org/en/download/)
- Yarn（[v1](https://classic.yarnpkg.com/en/docs/install/) 或 [v2+](https://yarnpkg.com/getting-started/install)）
- [Git](https://git-scm.com/downloads)
- [Foundry](https://book.getfoundry.sh/getting-started/installation)（仅在选择 Foundry 作为 Solidity 框架时需要）

> 💻 启动你的本地网络（一个运行在你电脑上的区块链模拟器）：

```sh

npx create-eth@2.0.23 -e challenge-oracles challenge-oracles

cd challenge-oracles

```

> 当提示你选择 Solidity 框架时，你可以选择 **Hardhat** 或 **Foundry**，两者都得到完整支持。本指南中的截图可能展示的是其中任意一种，但概念完全相同。

> 💻 在同一个终端中，启动你的本地网络（一个运行在你电脑上的区块链模拟器）：

```sh

yarn chain

```

> 🛰️ 在第二个终端窗口中，（在本地）部署你的合约：

```sh

yarn deploy

```

> 🚨 你运行时这一步很可能会失败，因为合约还没准备好部署

> 📱 在第三个终端窗口中，启动你的前端：

```sh

yarn start

```

📱 打开 http://localhost:3000 查看应用。

> *注意：截图中的界面可能与当前版本略有不同。*

> 👩‍💻 每当你想把合约的改动部署到前端时，重新运行 `yarn deploy` 即可。运行 `yarn deploy --reset` 可以进行一次全新的部署，即使合约没有改动也会重新部署。

---

## 🤖 AI 引导学习模式（可选）

想要一位在你编码时教你概念的互动导师吗？本挑战支持 **AI 引导学习模式**！

1. 在 **Claude Code** 或 **Cursor** 等 AI 编程工具中打开本项目
2. 运行 `/start` 命令
3. AI 导师会讲解每个概念，然后给你布置一个编码任务
4. 你编写代码后说 **"check"**，AI 就会运行测试
5. 需要帮助时说 **"hint"**；如果想让 AI 直接给出参考答案，可以使用 **`/skip`**
6. 你的进度会被保存——随时使用 `/start` 继续

AI 不会直接把答案告诉你——它会先讲解，再让你自己实现代码。测试会验证你的成果，如果有测试没通过，AI 会帮你调试。

---

## Checkpoint 1: 🏛️ 白名单预言机概览

🔍 让我们从本挑战涉及的三种预言机设计中最简单的一种开始：白名单预言机。这种设计由一个中心化机构来控制哪些数据源可以提供信息，因此简单快速，但需要信任。

💰 我们要研究的实现是一个**价格**预言机。价格预言机是 DeFi 中最常见、也最关键的预言机类型之一，因为它们让智能合约能够基于真实世界的资产价格做出决策。我们的白名单价格预言机会从多个可信来源（`SimpleOracle` 的实例）收集上报的价格，并返回它们的中位数。

🧭 让我们来了解这个预言机系统是如何运作的。我们将同时研究基础构件（SimpleOracle），以及如何把多个简单预言机组合成一个更健壮的系统（WhitelistOracle）。

### 🔗 简单预言机（Simple Oracle）——基础构件

<Tabs>
<Tab label="Hardhat">

🔍 打开 `packages/hardhat/contracts/00_Whitelist/SimpleOracle.sol` 文件，查看基础的预言机功能。

</Tab>
<Tab label="Foundry">

🔍 打开 `packages/foundry/contracts/00_Whitelist/SimpleOracle.sol` 文件，查看基础的预言机功能。

</Tab>
</Tabs>

#### 📖 理解代码：

🧩 `SimpleOracle` 合约是这个预言机系统的基础构件：

1. **构造函数** - 接收一个 `_owner` 地址参数，用于设置谁可以更新预言机价格

2. **`setPrice(uint256 _newPrice)`** - 该函数允许合约所有者更新当前价格

   * 🔄 用新值更新 `price` 状态变量

   * ⏱️ 将 `timestamp` 更新为当前区块的时间戳

   * 📣 触发带有新价格的 `PriceUpdated` 事件

3. **`getPrice()`** - 该函数同时返回当前价格和时间戳

   * ↩️ 以元组形式返回：`(price, timestamp)`

#### 🤔 关键要点：

- **单一数据源**：每个 SimpleOracle 代表一个数据源
- **信任模型**：需要完全信任负责更新价格的人
- **局限性**：没有共识机制，也没有经济激励

### 🏛️ 白名单预言机——聚合多个数据源

🎯 **你的任务**：完成 `WhitelistOracle.sol` 合约中缺失的函数实现。

<Tabs>
<Tab label="Hardhat">

🔍 打开 `packages/hardhat/contracts/00_Whitelist/WhitelistOracle.sol` 文件，实现白名单预言机的功能。

</Tab>
<Tab label="Foundry">

🔍 打开 `packages/foundry/contracts/00_Whitelist/WhitelistOracle.sol` 文件，实现白名单预言机的功能。

</Tab>
</Tabs>

#### 📖 理解两者的关系：

`WhitelistOracle` 合约会**创建并管理多个 SimpleOracle 合约**：

```solidity

SimpleOracle[] public oracles;  // SimpleOracle 合约实例数组

```

🏗️ 这就构成了一个**分层的预言机系统**：

- **个体层**：每个 SimpleOracle 合约由一个可信的数据提供者管理（在创建预言机时设置）
- **聚合层**：WhitelistOracle 负责创建、管理所有列入白名单的 SimpleOracle 合约，并处理它们的数据

### ✏️ 任务：

1. **实现 `addOracle(address _owner)`**

- 🏭 该函数允许合约所有者通过部署一个 SimpleOracle 合约，向白名单中添加一个新的预言机

- 🧩 它应该使用指定的 `_owner` 创建一个新的 `SimpleOracle` 实例

- ➕ 它应该把新创建的 SimpleOracle 添加到 `oracles` 数组中

- 📣 它应该触发 `OracleAdded` 事件，并带上预言机地址及其所有者

<details markdown='1'>

<summary>💡 提示：创建并添加预言机</summary>

你需要做的是：
- 使用 `new SimpleOracle(_owner)` 创建一个新的 SimpleOracle 合约实例
- 使用 `address(newOracle)` 获取新创建的预言机的地址
- 把这个预言机实例推入（push）`oracles` 数组
- 触发 `OracleAdded` 事件，并带上预言机地址和所有者

<details markdown='1'>

<summary>🎯 参考答案</summary>

```solidity
function addOracle(address _owner) public onlyOwner {
    SimpleOracle newOracle = new SimpleOracle(_owner);
    address oracleAddress = address(newOracle);

    oracles.push(newOracle);
    emit OracleAdded(oracleAddress, _owner);
}
```

</details>
</details>

---

2. **实现 `removeOracle(uint256 index)`**

- ✔️ 该函数允许合约所有者按数组索引从白名单中移除一个预言机

- 🔍 它应该校验传入的索引是否在范围内，否则以 `IndexOutOfBounds` 回滚（revert）

- 📝 它应该在移除之前记录该预言机的地址，以便用于事件

- ➖ 它应该使用 swap-and-pop 模式（先与最后一个元素交换，再 pop）高效地移除预言机

- 📣 它应该触发带有预言机地址的 `OracleRemoved` 事件

<details markdown='1'>

<summary>💡 提示：安全地移除数组元素</summary>

swap-and-pop 模式：

- 检查索引是否有效（< oracles.length）
- 保存该预言机的地址，以便用于事件
- 如果不是最后一个元素，就与最后一个元素交换
- 弹出（pop）最后一个元素
- 触发移除事件

这比删除该元素、再把它之后的所有条目都向前挪一位要节省得多的 gas：O(1) 对比 O(n)。

<details markdown='1'>

<summary>🎯 参考答案</summary>

```solidity
function removeOracle(uint256 index) public onlyOwner {
    if (index >= oracles.length) revert IndexOutOfBounds();

    address oracleAddress = address(oracles[index]);

    if (index != oracles.length - 1) {
        oracles[index] = oracles[oracles.length - 1];
    }

    oracles.pop();

    emit OracleRemoved(oracleAddress);
}
```

</details>
</details>

---

3. **实现 `getPrice()`**

- 📊 该函数使用中位数计算来聚合所有活跃预言机的价格

- ⛔️ 如果白名单中没有任何预言机，它应该以 `NoOraclesAvailable` 回滚

- 🔁 它应该遍历每个预言机并调用 `getPrice()`，获取 `(price, timestamp)`

- 🧹 它应该过滤掉过期的价格（距今超过 `STALE_DATA_WINDOW = 24 seconds`）

- 📦 它应该只把新鲜的价格收集到一个大小合适的数组中

- 🧮 它应该使用 StatisticsUtils 库对价格排序并计算中位数

<details markdown='1'>

<summary>💡 提示：带新鲜度检查的价格聚合</summary>

流程如下：

- 检查是否存在任何预言机
- 创建一个临时数组来收集新鲜的价格
- 遍历所有预言机，获取它们的 (price, timestamp)
- 检查时间戳是否处于距当前时间 STALE_DATA_WINDOW 的范围内
- 收集有效价格并计数
- 创建一个只包含有效价格、大小恰好合适的数组
- 使用 StatisticsUtils 排序并取中位数

<details markdown='1'>

<summary>🎯 参考答案</summary>

```solidity
function getPrice() public view returns (uint256) {
    if (oracles.length == 0) revert NoOraclesAvailable();

    // 从所有预言机收集价格和时间戳
    uint256[] memory prices = new uint256[](oracles.length);
    uint256 validCount = 0; // 有效价格的数量
    uint256 currentTime = block.timestamp;

    for (uint256 i = 0; i < oracles.length; i++) {
        (uint256 price, uint256 timestamp) = oracles[i].getPrice();
        // 检查时间戳是否处于最近的 STALE_DATA_WINDOW 之内
        if (currentTime - timestamp < STALE_DATA_WINDOW) {
            prices[validCount] = price;
            validCount++;
        }
    }

    uint256[] memory validPrices = new uint256[](validCount);
    for (uint256 i = 0; i < validCount; i++) {
        validPrices[i] = prices[i];
    }

    validPrices.sort();
    return validPrices.getMedian();
}
```

</details>
</details>

---

4. **实现 `getActiveOracleNodes()`**

- 📊 该函数返回所有在最近 `STALE_DATA_WINDOW` 内更新过价格的预言机的地址

- 🔍 它应该遍历所有预言机，并筛选出时间戳较新的那些

- 📦 它应该先用一个临时数组收集活跃节点，再创建一个大小恰好合适的返回数组，以优化 gas

- 🎯 它应该返回一个地址数组，代表当前处于活跃状态的预言机合约

<details markdown='1'>

<summary>💡 提示：筛选活跃节点</summary>

与 getPrice() 类似，只不过收集的不是价格，而是预言机地址：

- 创建临时数组来存储地址
- 遍历预言机，检查时间戳是否新鲜
- 统计并收集活跃预言机的地址
- 创建大小合适的结果数组
- 返回活跃预言机的地址

<details markdown='1'>

<summary>🎯 参考答案</summary>

```solidity
function getActiveOracleNodes() public view returns (address[] memory) {
    address[] memory tempNodes = new address[](oracles.length);
    uint256 count = 0;

    for (uint256 i = 0; i < oracles.length; i++) {
        (, uint256 timestamp) = oracles[i].getPrice();
        if (block.timestamp - timestamp < STALE_DATA_WINDOW) {
            tempNodes[count] = address(oracles[i]);
            count++;
        }
    }

    address[] memory activeNodes = new address[](count);
    for (uint256 j = 0; j < count; j++) {
        activeNodes[j] = tempNodes[j];
    }

    return activeNodes;
}
```

</details>
</details>

### 🤔 关键要点：

- **工厂模式**：WhitelistOracle 负责创建和管理 SimpleOracle 合约
- **中心化权限**：只有所有者可以添加/移除 SimpleOracle 合约
- **共识机制**：借助 StatisticsUtils 库进行中位数计算，以抵御离群值
- **新鲜度检查**：过滤掉任何 SimpleOracle 提供的过期数据
- **信任模型**：需要信任白名单管理方以及每个 SimpleOracle 提供者
- **适用场景**：适合受控环境——你信任该中心化实体，或者出了问题最终可以诉诸法律（如 RWA，真实世界资产）

### 🔄 它们如何协同工作：

1. **数据流**：

```

SimpleOracle A → setPrice(100) → getPrice() → (100, timestamp)

SimpleOracle B → setPrice(102) → getPrice() → (102, timestamp)

SimpleOracle C → setPrice(98)  → getPrice() → (98, timestamp)

```

2. **聚合**：

```

WhitelistOracle → getPrice() → [100, 102, 98] → sort → [98, 100, 102] → median(100) → 100

```

3. **好处**：

- **冗余**：如果某个 SimpleOracle 出现故障，其他预言机会继续提供数据

- **抗离群值**：中位数计算会忽略极端值

- **新鲜度**：任何 SimpleOracle 的过期数据都会被过滤掉

### 🤔 批判性思考：安全漏洞

- **问题**：这种白名单预言机设计可能会被如何利用或钻空子？主要的攻击向量有哪些？

<details markdown='1'>

<summary>💡 点击查看潜在漏洞</summary>

1. 🔓 **白名单管理权被攻破**：如果所有者的私钥泄露，攻击者可以：

   - 移除所有合法的预言机，并添加恶意预言机

   - 操纵哪些数据源被信任

   - 添加多个由自己控制的预言机来扭曲中位数

2. 👥 **白名单提供者之间合谋**：如果足够多的白名单预言机提供者合谋，他们可以：

   - 协同上报虚假价格来操纵中位数

   - 从依赖该预言机的协议中榨取价值

3. 🔓 **数据提供者被攻破**：单个 SimpleOracle 运营者可能会：

   - 被黑客攻击或被胁迫上报虚假价格

   - 把自己的影响力出售给操纵者

💡 *现实影响*：这些漏洞解释了为什么像 [MakerDAO/Sky](https://github.com/sky-ecosystem/medianizer) 这样的协议，随着涉及的利益越来越大，最终转向了更加去中心化的预言机系统！

</details>

---

### 测试你的进度

🔍 运行以下命令，检查你是否正确实现了这些函数。

<Tabs>
<Tab label="Hardhat">

**Hardhat**

```shell
yarn test --grep "Checkpoint1"
```

✅ 测试通过了吗？你可以查看 `packages/hardhat/test/WhitelistOracle.ts` 中的测试，深入排查任何错误。

</Tab>
<Tab label="Foundry">

**Foundry**

```shell
yarn test --match-test "Checkpoint1"
```

✅ 测试通过了吗？你可以查看 `packages/foundry/test/WhitelistOracle.t.sol` 中的测试，深入排查任何错误。

</Tab>
</Tabs>

### 动手试试！

🔄 运行 `yarn deploy --reset`，然后测试白名单预言机。试着添加和移除预言机，观察聚合价格如何变化。

![WhiteListOracle](https://github.com/user-attachments/assets/1fabc2d8-a1a4-4b0e-b00c-49f3fefec7fc)

👊 注意，onlyOwner 修饰器已被注释掉，好让你拥有完全的控制权。试着手动修改单个 SimpleOracle 合约的价格，并添加新的预言机节点，看看聚合价格如何变化：

1. **修改价格**：使用前端修改单个预言机的价格

2. **添加新节点**：通过白名单预言机创建新的 SimpleOracle 合约

3. **观察聚合**：在你添加/移除预言机时，观察中位数价格如何变化

🧪 **实时模拟**：运行 `yarn simulate:whitelist` 命令，看看这个协议的实时版本在实际运行中可能是什么样子：

```sh

yarn simulate:whitelist

```

🤖 这会启动一些自动化机器人来模拟真实的预言机行为，向你展示在有多个活跃喂价的生产环境中，系统会如何运作。

### 🥅 目标：

- 你可以向白名单中添加新的 SimpleOracle 实例
- 系统使用中位数计算来聚合活跃预言机的价格
- 过期数据会根据时间戳被自动过滤掉
- 你可以查询当前哪些预言机节点处于活跃状态
- 系统能正确处理边界情况和无效状态
- 理解聚合多个数据源的好处
- 看看这些来自早期 DeFi 的“真实世界”示例：[Simple Oracle](https://github.com/dapphub/ds-value)、[Whitelist Oracle](https://github.com/sky-ecosystem/medianizer)

---

## Checkpoint 2: 💰 质押预言机——经济激励

🧭 现在让我们来探索一种利用**经济激励**来鼓励诚实上报的去中心化预言机。在这个设计中：

- 节点通过质押 **ORA**（一种 ERC20 代币）来参与。
- 节点**每个“桶”（bucket）上报一次**价格（默认一个桶跨越 24 个区块）。
- 只有在有人调用 **`recordBucketMedian(bucket)`** 之后，一个桶才被视为“已最终确定”，该函数会存储这个桶的**中位数**（**仅限过去的桶**）。
- 由于预言机数据很有用，任何想要使用这些数据的人都会有动力去执行 `recordBucketMedian` 函数。
- 罚没（slashing）决策会将节点上报的价格与**已记录的中位数**进行比较。

🎯 **你的任务**：补全 `StakingOracle.sol` 合约中缺失的函数实现。合约骨架已经提供了所有必需的结构体、事件和修饰器，但你需要填写其中的逻辑。

<Tabs>
<Tab label="Hardhat">

🔍 打开 `packages/hardhat/contracts/01_Staking/StakingOracle.sol` 文件，实现质押预言机的功能。

</Tab>
<Tab label="Foundry">

🔍 打开 `packages/foundry/contracts/01_Staking/StakingOracle.sol` 文件，实现质押预言机的功能。

</Tab>
</Tabs>

### ✏️ 任务：

1. **实现 `getCurrentBucketNumber()`**

- 🕒 这个 view 函数将当前的 `block.number` 映射为一个桶索引（每 24 个区块为一个窗口）

- 🧮 它应该用区块号除以 `BUCKET_WINDOW` 再加 1（桶的索引从 1 开始，而不是 0）

<details markdown='1'>

<summary>💡 提示：桶编号</summary>

- 每经过 `BUCKET_WINDOW` 个区块，桶编号就前进一位
- 整数除法会自动向下取整
- 记得加 1，这样第一个桶的索引就从 1 开始

<details markdown='1'>

<summary>🎯 参考答案</summary>

```solidity
function getCurrentBucketNumber() public view returns (uint256) {
    return (block.number / BUCKET_WINDOW) + 1;
}
```

</details>
</details>

---

2. **实现 `getNodeAddresses()`**

- 📚 这个 view 函数按顺序返回所有已注册的节点地址（对前端和基于索引的操作很有用）

<details markdown='1'>

<summary>💡 提示：直接返回数组即可</summary>

- 数组 `nodeAddresses` 由 `registerNode` 和 `_removeNode` 维护，我们稍后会实现这两个函数
- 直接返回 `nodeAddresses` 即可

<details markdown='1'>

<summary>🎯 参考答案</summary>

```solidity
function getNodeAddresses() public view returns (address[] memory) {
    return nodeAddresses;
}
```

</details>
</details>

---

3. **实现 `registerNode(uint256 amount)`**

- 🏗️ 这个函数允许任何人通过质押 **ORA 代币**（ERC20）来注册成为预言机节点

- ⚠️ 它应该要求最低质押量为 `MINIMUM_STAKE`，否则以 `InsufficientStake` 错误回滚

- 🧪 它应该检查该节点尚未注册，否则以 `NodeAlreadyRegistered` 错误回滚

- 💸 它应该使用 `transferFrom` 从用户那里拉取 ORA（因此用户必须先调用 `approve`）

- ⚙️ 它应该用正确的值把新的 `OracleNode` 添加到 `nodes` 映射中

- ➕ 它应该把节点地址添加到 `nodeAddresses` 数组中

- 📣 它应该触发 `NodeRegistered` 事件

<details markdown='1'>

<summary>💡 提示：ERC20 质押</summary>

- 使用 `oracleToken.transferFrom(msg.sender, address(this), amount)`
- 如果转账失败，以 `TransferFailed` 错误回滚
- 对于 `OracleNode` 结构体，你应该按如下方式填写：
  - `stakedAmount` 应为他们用于注册的代币数量
  - `lastReportedBucket` 默认应为 0，因为他们还没有上报过
  - `reportCount` 和 `claimedReportCount` 也都应从 0 开始
  - `firstBucket` 应为当前的桶……我们之前不是写过一个获取它的方法吗？🤔
  - `active` 应为 `true`，因为该节点正在注册

<details markdown='1'>

<summary>🎯 参考答案</summary>

```solidity
function registerNode(uint256 amount) public {
    if (amount < MINIMUM_STAKE) revert InsufficientStake();
    if (nodes[msg.sender].active) revert NodeAlreadyRegistered();

    bool success = oracleToken.transferFrom(msg.sender, address(this), amount);
    if (!success) revert TransferFailed();

    nodes[msg.sender] = OracleNode({
        stakedAmount: amount,
        lastReportedBucket: 0,
        reportCount: 0,
        claimedReportCount: 0,
        firstBucket: getCurrentBucketNumber(),
        active: true
    });

    nodeAddresses.push(msg.sender);
    emit NodeRegistered(msg.sender, amount);
}
```

</details>
</details>

---

4. **实现 `addStake(uint256 amount)`**

- 💸 这个函数允许活跃节点通过存入更多 ORA 来增加其质押量

- ⚠️ 如果 `amount == 0`，它应该以 `InsufficientStake` 错误回滚

- 💰 它应该使用 `transferFrom` 拉取 ORA（因此用户必须在调用前先 `approve`）

- 📣 它应该触发 `StakeAdded` 事件

<details markdown='1'>

<summary>💡 提示：与 `registerNode` 的模式类似</summary>

- 校验 `amount > 0`
- 通过 `transferFrom` 把代币转入预言机合约
- 增加 `nodes[msg.sender].stakedAmount`

<details markdown='1'>

<summary>🎯 参考答案</summary>

```solidity
function addStake(uint256 amount) public onlyNode {
    if (amount == 0) revert InsufficientStake();

    bool success = oracleToken.transferFrom(msg.sender, address(this), amount);
    if (!success) revert TransferFailed();

    nodes[msg.sender].stakedAmount += amount;
    emit StakeAdded(msg.sender, amount);
}
```

</details>
</details>

---

5. **实现 `getEffectiveStake(address nodeAddress)`**

- 📉 这个 view 函数返回节点扣除不活跃惩罚之后的质押量

- 🔍 对于不活跃的节点，它应该返回 `0`

- 🧮 它应该根据注册以来已完成的桶数计算预期上报次数

- ✂️ 每错过一次上报，就减去 `INACTIVITY_PENALTY`，最低减到零为止

<details markdown='1'>

<summary>💡 提示：有效质押</summary>

- 预期上报次数应只计算注册以来**完全结束**的桶（不包括当前桶）
- 不要把当前桶中的上报算作“已完成”的上报（它仍在进行中）

<details markdown='1'>

<summary>🎯 参考答案</summary>

```solidity
function getEffectiveStake(address nodeAddress) public view returns (uint256) {
    OracleNode memory n = nodes[nodeAddress];
    if (!n.active) return 0;
    uint256 currentBucket = getCurrentBucketNumber();
    if (currentBucket == n.firstBucket) return n.stakedAmount;
    // 预期上报次数只针对注册以来完全结束的桶（不包括当前桶）
    uint256 expectedReports = currentBucket - n.firstBucket;
    // 不预设未来的上报；只有在一个桶过去之后才进行惩罚
    uint256 actualReportsCompleted = n.reportCount;
    // 将当前桶中的上报从已完成上报中排除，以免减少对过去的惩罚
    if (n.lastReportedBucket == currentBucket && actualReportsCompleted > 0) {
        actualReportsCompleted -= 1;
    }
    if (actualReportsCompleted >= expectedReports) return n.stakedAmount; // 达标则不惩罚
    uint256 missed = expectedReports - actualReportsCompleted;
    uint256 penalty = missed * INACTIVITY_PENALTY;
    if (penalty > n.stakedAmount) return 0;
    return n.stakedAmount - penalty;
}
```

</details>
</details>

---

6. **实现 `reportPrice(uint256 price)`**

- 🧪 这个函数允许已注册的节点上报新价格（使用 `onlyNode` 修饰器）

- 🔍 它应该验证给定的价格不为零，否则以 `InvalidPrice` 错误回滚

- 🔍 它应该（使用 `getEffectiveStake`）验证该节点拥有足够的有效质押，否则以 `InsufficientStake` 错误回滚

- 🚫 它应该防止在同一个桶中重复上报，否则以 `AlreadyReportedInCurrentBucket` 错误回滚

- 📊 它应该把节点的上报记录追加到当前桶的 `reporters[]` 和 `prices[]` 中进行存储

- 🔄 它应该更新节点的 `lastReportedBucket` 并递增 `reportCount`

- 📣 它应该触发 `PriceReported` 事件，参数为发送者、价格和桶编号

<details markdown='1'>

<summary>💡 提示：保持上报索引不变</summary>

- 你必须把 `msg.sender` 推入 `bucket.reporters`、把 `price` 推入 `bucket.prices`，并且两者位于**相同的索引**
- 之后的罚没逻辑依赖于这个 `reportIndex`

<details markdown='1'>

<summary>🎯 参考答案</summary>

```solidity
function reportPrice(uint256 price) public onlyNode {
    if (price == 0) revert InvalidPrice();
    if (getEffectiveStake(msg.sender) < MINIMUM_STAKE) revert InsufficientStake();

    OracleNode storage node = nodes[msg.sender];
    uint256 currentBucket = getCurrentBucketNumber();
    if (node.lastReportedBucket == currentBucket) revert AlreadyReportedInCurrentBucket();

    BlockBucket storage bucket = blockBuckets[currentBucket];
    bucket.reporters.push(msg.sender);
    bucket.prices.push(price);

    node.lastReportedBucket = currentBucket;
    node.reportCount++;

    emit PriceReported(msg.sender, price, currentBucket);
}
```

</details>
</details>

---

7. **实现 `claimReward()`**

- 🪙 这个函数允许节点（无论是否活跃）领取因上报而累积的 ORA 奖励

- 🔍 它应该计算 `delta = reportCount - claimedReportCount`

- 🔒 如果 `delta == 0`，它应该以 `NoRewardsAvailable` 错误回滚

- ✅ 它应该在铸造*之前*更新 `claimedReportCount`（防重入的安全顺序）

- 💰 它应该铸造 `delta * REWARD_PER_REPORT` 个 ORA 代币

- 📣 它应该触发 `NodeRewarded(node, amount)`

<details markdown='1'>

<summary>💡 提示：只领取差额部分</summary>

- 使用 `claimedReportCount` 来避免重复领取

<details markdown='1'>

<summary>🎯 参考答案</summary>

```solidity
function claimReward() public {
    OracleNode storage node = nodes[msg.sender];
    uint256 delta = node.reportCount - node.claimedReportCount;
    if (delta == 0) revert NoRewardsAvailable();

    node.claimedReportCount = node.reportCount;
    oracleToken.mint(msg.sender, delta * REWARD_PER_REPORT);
    emit NodeRewarded(msg.sender, delta * REWARD_PER_REPORT);
}
```

</details>
</details>

---

8. **实现 `recordBucketMedian(uint256 bucketNumber)`**

- 📌 这个函数通过记录某个桶的**中位数**价格来最终确定该桶

- 🚫 如果 `medianPrice` 已经被设置，它应该以 `BucketMedianAlreadyRecorded` 错误回滚

- ⏰ 它应该只允许针对**过去的桶**调用此函数，否则以 `OnlyPastBucketsAllowed` 错误回滚

- 🧠 它应该使用 StatisticsUtils 在 `prices[]` 的**内存副本**上计算中位数（不要对 storage 中的数组重新排序，因为罚没依赖于这个顺序！）

- 📣 它应该触发 `BucketMedianRecorded(bucketNumber, medianPrice)`

<details markdown='1'>

<summary>💡 提示：中位数的最终确定</summary>

- 中位数：对 `bucket.prices` 的**内存副本**执行 `sort`，然后对排好序的数组调用 `getMedian` 方法
- StatisticsUtils 已经被导入并应用到 uint256 数组上，所以你可以直接在数组上调用这些方法（`arr.sort()`、`arr.getMedian()`）

<details markdown='1'>

<summary>🎯 参考答案</summary>

```solidity
function recordBucketMedian(uint256 bucketNumber) public {
    BlockBucket storage bucket = blockBuckets[bucketNumber];
    if (bucket.medianPrice != 0) revert BucketMedianAlreadyRecorded();
    if (bucketNumber >= getCurrentBucketNumber()) revert OnlyPastBucketsAllowed();

    uint256[] memory prices = bucket.prices;
    prices.sort();
    bucket.medianPrice = prices.getMedian();

    emit BucketMedianRecorded(bucketNumber, bucket.medianPrice);
}
```

</details>
</details>

---

9. **实现 `getLatestPrice()`**

- 📦 这个 view 函数返回**最近一个已完成的桶**的最终价格（已记录的中位数）

- ⛔️ 如果该桶尚未最终确定，它应该以 `MedianNotRecorded` 错误回滚

<details markdown='1'>

<summary>💡 提示：哪个桶才是“最新”的</summary>

- 最新价格应从 `getCurrentBucketNumber() - 1` 读取

<details markdown='1'>

<summary>🎯 参考答案</summary>

```solidity
function getLatestPrice() public view returns (uint256) {
    BlockBucket storage bucket = blockBuckets[getCurrentBucketNumber() - 1];
    if (bucket.medianPrice == 0) revert MedianNotRecorded();
    return bucket.medianPrice;
}
```

</details>
</details>

---

10. **实现 `getPastPrice(uint256 bucketNumber)`**

- 🕰️ 这个 view 函数返回**任意历史桶**的最终价格（已记录的中位数）

- ⛔️ 如果该桶尚未最终确定，它应该以 `MedianNotRecorded` 错误回滚

<details markdown='1'>

<summary>💡 提示：这与 `getLatestPrice()` 非常相似</summary>

- 不再使用 `getCurrentBucketNumber() - 1`，而是使用传入的 `bucketNumber`

<details markdown='1'>

<summary>🎯 参考答案</summary>

```solidity
function getPastPrice(uint256 bucketNumber) public view returns (uint256) {
    BlockBucket storage bucket = blockBuckets[bucketNumber];
    if (bucket.medianPrice == 0) revert MedianNotRecorded();
    return bucket.medianPrice;
}
```

</details>
</details>

---

11. **实现 `getSlashedStatus(address nodeAddress, uint256 bucketNumber)`**

- 🔎 这个 view 函数返回某个节点在某个桶中上报的价格，以及它是否在该桶中被罚没

- 🗡️ 这只是一个便捷方法，帮助旁观者检查哪些节点可以被罚没

<details markdown='1'>

<summary>💡 提示：在 `bucket.reporters[]` 中找到该节点</summary>

- 遍历 `blockBuckets[bucketNumber].reporters`
- 找到 `nodeAddress` 时，返回对应的 `prices[i]` 和 `slashedOffenses[nodeAddress]`

<details markdown='1'>

<summary>🎯 参考答案</summary>

```solidity
function getSlashedStatus(address nodeAddress, uint256 bucketNumber) public view returns (uint256 price, bool slashed) {
    BlockBucket storage bucket = blockBuckets[bucketNumber];
    for (uint256 i = 0; i < bucket.reporters.length; i++) {
        if (bucket.reporters[i] == nodeAddress) {
            price = bucket.prices[i];
            slashed = bucket.slashedOffenses[nodeAddress];
        }
    }
}
```

</details>
</details>

---

12. **实现 `_checkPriceDeviated(uint256 reportedPrice, uint256 medianPrice)`**

- 🧮 这个 internal pure 函数判断上报的价格是否偏离超出了允许的阈值

- 📐 只有当偏离值**严格大于** `MAX_DEVIATION_BPS` 时，才应返回 `true`

<details markdown='1'>

<summary>💡 提示：换算成基点（basis points）</summary>

- 计算绝对差值：`abs(reportedPrice - medianPrice)`
- `deviationBps = (deviation * 10_000) / medianPrice`
- 与 `MAX_DEVIATION_BPS` 进行比较

<details markdown='1'>

<summary>🎯 参考答案</summary>

```solidity
function _checkPriceDeviated(uint256 reportedPrice, uint256 medianPrice) internal pure returns (bool) {
    uint256 deviation = reportedPrice > medianPrice ? reportedPrice - medianPrice : medianPrice - reportedPrice;
    uint256 deviationBps = (deviation * 10_000) / medianPrice;
    return deviationBps > MAX_DEVIATION_BPS;
}
```

</details>
</details>

---

13. **实现 `getOutlierNodes(uint256 bucketNumber)`**

- 📊 这个 view 函数找出在指定桶中上报价格的偏离超过最大允许偏离值的节点

- 🔁 这里可以使用循环，因为这只是一个会从链外调用的 view 方法

- ⛔️ 如果该桶尚未最终确定，应以 `MedianNotRecorded` 回滚

- 🚫 应忽略在该桶中已被标记为已罚没的节点

<details markdown='1'>

<summary>💡 提示：离群值就是“偏离了中位数”的上报</summary>

- 使用该桶已存储的 `medianPrice`
- 遍历 `bucket.reporters`，并检查 `_checkPriceDeviated(bucket.prices[i], bucket.medianPrice)`
- 先按最大长度创建一个临时数组，再把它裁剪到实际长度，这样就不会返回空的数组槽位

<details markdown='1'>

<summary>🎯 参考答案</summary>

```solidity
function getOutlierNodes(uint256 bucketNumber) public view returns (address[] memory) {
    BlockBucket storage bucket = blockBuckets[bucketNumber];
    if (bucket.medianPrice == 0) revert MedianNotRecorded();

    address[] memory outliers = new address[](bucket.reporters.length);
    uint256 outlierCount = 0;

    for (uint256 i = 0; i < bucket.reporters.length; i++) {
        address reporter = bucket.reporters[i];
        if (bucket.slashedOffenses[reporter]) continue;
        uint256 reportedPrice = bucket.prices[i];
        if (reportedPrice == 0) continue;

        if (_checkPriceDeviated(reportedPrice, bucket.medianPrice)) {
            outliers[outlierCount] = reporter;
            outlierCount++;
        }
    }

    address[] memory trimmed = new address[](outlierCount);
    for (uint256 j = 0; j < outlierCount; j++) {
        trimmed[j] = outliers[j];
    }
    return trimmed;
}
```

</details>
</details>

---

14. **实现 `_removeNode(address nodeAddress, uint256 index)`**

- 🗂️ 这个 internal 函数从 `nodeAddresses` 数组中移除一个节点，同时保持数组紧凑（中间没有空位）

- 🔍 如果 `index` 无效，应以 `IndexOutOfBounds` 回滚

- ✅ 如果该索引处的地址与 `nodeAddress` 不匹配，应以 `NodeNotAtGivenIndex` 回滚

- 🔁 应使用 swap-and-pop（与末尾元素交换后弹出）方式，然后设置 `nodes[nodeAddress].active = false`

<details markdown='1'>

<summary>💡 提示：Swap-and-pop（交换后弹出）</summary>

- 用 `nodeAddresses[last]` 替换 `nodeAddresses[index]`，然后调用 `pop()`

<details markdown='1'>

<summary>🎯 参考答案</summary>

```solidity
function _removeNode(address nodeAddress, uint256 index) internal {
    if (nodeAddresses.length <= index) revert IndexOutOfBounds();
    if (nodeAddresses[index] != nodeAddress) revert NodeNotAtGivenIndex();

    nodeAddresses[index] = nodeAddresses[nodeAddresses.length - 1];
    nodeAddresses.pop();

    nodes[nodeAddress].active = false;
}
```

</details>
</details>

---

15. **实现 `slashNode(address nodeToSlash, uint256 bucketNumber, uint256 reportIndex, uint256 nodeAddressesIndex)`**

- 🔎 这个函数允许任何人罚没那些上报价格偏离该桶已记录中位数过远的节点

- ⏰ 只允许针对过去的桶（不能是当前桶），否则以 `OnlyPastBucketsAllowed` 回滚

- 🧠 应要求该桶的中位数已被记录，否则以 `MedianNotRecorded` 回滚

- 🧷 应验证传入的索引（上报索引 + 节点索引），否则以 `NodeNotAtGivenIndex` / `IndexOutOfBounds` 回滚

- 🚫 如果偏离值 ≤ `MAX_DEVIATION_BPS`（判断条件是严格的 `>`），应以 `NotDeviated` 回滚

- 💰 最多罚没 `MISREPORT_PENALTY`，并按照 `SLASHER_REWARD_PERCENTAGE` 以 ORA 奖励执行罚没的人

<details markdown='1'>

<summary>💡 提示：为什么索引很重要</summary>

- `reportIndex` 必须满足 `blockBuckets[bucket].reporters[reportIndex] == nodeToSlash`
- `nodeAddressesIndex` 必须满足 `nodeAddresses[nodeAddressesIndex] == nodeToSlash`
- 这样就不需要在链上循环（查找工作我们在链下完成）

<details markdown='1'>

<summary>🎯 参考答案</summary>

```solidity
function slashNode(address nodeToSlash, uint256 bucketNumber, uint256 reportIndex, uint256 nodeAddressesIndex) public {
    if (!nodes[nodeToSlash].active) revert NodeNotRegistered();
    if (getCurrentBucketNumber() == bucketNumber) revert OnlyPastBucketsAllowed();
    BlockBucket storage bucket = blockBuckets[bucketNumber];
    if (bucket.medianPrice == 0) revert MedianNotRecorded();
    if (bucket.slashedOffenses[nodeToSlash]) revert NodeAlreadySlashed();
    if (reportIndex >= bucket.reporters.length) revert IndexOutOfBounds();
    if (nodeToSlash != bucket.reporters[reportIndex]) revert NodeNotAtGivenIndex();
    uint256 reportedPrice = bucket.prices[reportIndex];
    if (reportedPrice == 0) revert NodeDidNotReport();
    if (!_checkPriceDeviated(reportedPrice, bucket.medianPrice)) revert NotDeviated();
    bucket.slashedOffenses[nodeToSlash] = true;
    OracleNode storage node = nodes[nodeToSlash];
    // 罚没该节点
    uint256 actualPenalty = MISREPORT_PENALTY > node.stakedAmount ? node.stakedAmount : MISREPORT_PENALTY;
    node.stakedAmount -= actualPenalty;

    if (node.stakedAmount == 0) {
        _removeNode(nodeToSlash, nodeAddressesIndex);
        emit NodeExited(nodeToSlash, 0);
    }

    uint256 reward = (actualPenalty * SLASHER_REWARD_PERCENTAGE) / 100;

    bool rewardSent = oracleToken.transfer(msg.sender, reward);
    if (!rewardSent) revert TransferFailed();

    emit NodeSlashed(nodeToSlash, actualPenalty);
}
```

</details>
</details>

---

16. **实现 `exitNode(uint256 index)`**

- 🚪 这个函数允许节点在等待期结束后退出并取回其质押

- 🤔 通过强制设置等待期，我们可以确保节点无法在上报一个错误价格后不受罚没就直接退出

- ⏳ 如果 `lastReportedBucket + WAITING_PERIOD > getCurrentBucketNumber()`，应以 `WaitingPeriodNotOver` 回滚

- 💰 应在移除节点**之前**使用 `getEffectiveStake` 计算可取回的质押

- 🗑️ 应使用经过索引校验的 swap-and-pop 模式移除节点，并将其标记为不活跃（可以用 `_removeNode` 方法来完成）

- 🥩 把该节点的 stakedAmount 设为 0

- 🪙 把质押发送给该节点，如果转账失败则以 `TransferFailed` 回滚

- 📣 应触发 `NodeExited(node, amount)` 事件

<details markdown='1'>

<summary>💡 提示：在移除之前计算质押</summary>

- `getEffectiveStake` 对不活跃的节点返回 `0`，所以要在设置 `active = false` 之前计算它

<details markdown='1'>

<summary>🎯 参考答案</summary>

```solidity
function exitNode(uint256 index) public onlyNode {
    OracleNode storage node = nodes[msg.sender];
    if (node.lastReportedBucket + WAITING_PERIOD > getCurrentBucketNumber()) revert WaitingPeriodNotOver();
    // 在移除节点之前获取有效质押（因为 getEffectiveStake 对不活跃的节点返回 0）
    uint256 stake = getEffectiveStake(msg.sender);
    _removeNode(msg.sender, index);
    // 取回质押
    nodes[msg.sender].stakedAmount = 0;
    bool success = oracleToken.transfer(msg.sender, stake);
    if (!success) revert TransferFailed();

    emit NodeExited(msg.sender, stake);
}
```

</details>
</details>

### 🤔 关键要点：

- **基于桶的系统**：价格被组织到一个个离散的桶中，防止在同一个桶内重复上报。
- **代币质押**：参与资格由 **ORA 质押**把关，通过 `approve` + `transferFrom` 实现。
- **中位数最终确定**：通过记录**中位数**来最终确定一个桶，罚没时也是与这个中位数进行比较。
- **有效质押**：节点错过桶会受到不活跃惩罚，如果不能定期上报，其有效质押会随时间减少
- **去中心化**：任何人都可以通过质押参与，不需要中心化机构
- **自我纠正**：罚没机制会惩罚上报价格偏离超过阈值（默认 10%）的节点
- **适用场景**：非常适合经济激励一致性至关重要、且价格按固定间隔更新的 DeFi 应用

### 🤔 批判性思考：安全漏洞

- **相比白名单预言机的稳健性**：白名单预言机依赖单一受信任的机构，而质押预言机的设计把信任分散到所有质押节点上。要操纵输出结果，需要多数节点合谋，而由于存在被罚没的风险，这在经济上得不偿失。因此，除非攻击者控制了全部有效质押中的多数，否则无法肆意操纵上报的价格——这让该系统比简单的白名单控制要稳健得多。

### 🤔 现实世界中的考量

- **单一节点**：我们这样构建，只有一个节点也完全没问题，主要是为了方便测试；但更好的机制应该大力鼓励多个节点参与，因为单个节点没有任何问责约束。
- **谢林点（Schelling Point）**：你可以始终把固定数量的代币分配给所有上报的节点（例如 100 个代币由所有上报的节点平分），这样既能鼓励大量参与者加入（取决于代币的价值），又能抑制参与者过多——参与者过多会让 `recordBucketMedian` 函数的成本过高。
- **代币经济学**：请注意这一点：在这个系统中，ORA 代币几乎一文不值。唯一的需求来源是想通过质押一部分代币来运行预言机节点的人，但我们一直在通过奖励不断增发供应量，而且没有为该代币设计任何其他需求来源。理想情况下，应该让价格的使用方为代币创造需求，从而达到某种均衡，但我们并没有这样设计这个系统。
- **锁定的代币**：在这个设计中，节点被罚没时，没有作为奖励发出的那部分代币会一直锁在合约里。此外，ORA 代币合约接受用 ETH 购买 ORA，但没有任何办法把这些 ETH 取出来。我们代币经济学中的这些漏洞，就请你发挥想象力去补全吧。也许可以把剩余的代币销毁，再把锁定的 ETH 兑换成等值的 ORA 代币。这是一个不错的开始，但代币仍然需要真实的需求，才能成为长期可行的系统。

---

### 测试你的进度

🔍 运行以下命令，检查你是否正确实现了这些函数。

<Tabs>
<Tab label="Hardhat">

**Hardhat**

```shell
yarn test --grep "Checkpoint2"
```

✅ 测试通过了吗？你可以查看 `packages/hardhat/test/StakingOracle.ts` 中的测试，深入排查任何错误。

</Tab>
<Tab label="Foundry">

**Foundry**

```shell
yarn test --match-test "Checkpoint2"
```

✅ 测试通过了吗？你可以查看 `packages/foundry/test/StakingOracle.t.sol` 中的测试，深入排查任何错误。

</Tab>
</Tabs>

### 动手试试！

🔄 运行 `yarn deploy --reset`，然后测试质押预言机。进入 `Staking` 页面，尝试注册你自己的节点并上报价格。

💸 注册节点需要质押 **ORA**。使用 Staking 页面上的 **Buy ORA** 组件来兑换 **0.5 ETH → 100 ORA**（ORA 代币有一个特殊的购买函数，所以你购买时会直接铸造代币）。

![Staking Buttons Panel](https://github.com/user-attachments/assets/c32b9bdc-eb1e-4630-ae9f-e57a34deac45)

> 🗺️ 你可以使用箭头导航到过去的桶。

✏️ 现在你可以点击铅笔图标来上报新价格。输入你的价格，然后点击对勾按钮确认。如果你想在下一个桶中上报相同的价格，只需点击铅笔旁边的刷新图标。

![SelfNodeRow](https://github.com/user-attachments/assets/51f5e8a6-da2e-4bc3-a280-68609fea0789)

> ‼️ 遇到 "Insufficient Stake" 错误？看看你的质押余额 👀。它已经低于最低质押数量，因为你让一些区块过去了却没有上报。（通过 Buy ORA 组件）再购买一些 ORA，然后追加质押。

> 🧠 在你读取某个桶的最终价格或罚没上报离群值的节点之前，必须有人为该桶调用 **Record Bucket Median**。默认有一个按钮可以让你为上一个桶执行这个函数，但你也可以随意向前导航，在过去的桶上点击该按钮来触发中位数函数。

😮‍💨 *呼！* 为了避免受到不活跃惩罚而按下这么多按钮，真是累人！让机器人来做所有工作、你只需旁观，就轻松多了。退出你的节点（如果它让你压力山大的话），我们来找点乐子。

🧪 **实时模拟**：运行 `yarn simulate:staking` 命令，观看多个节点参与的质押预言机行为实时模拟：

```sh

yarn simulate:staking

```

🤖 这会启动自动化机器人，并演示罚没和平均值聚合如何影响上报的价格。目前它们都使用默认设置，所以价格不会偏离，但是……

⚙️ 你可以点击齿轮图标来调整价格偏离程度和跳过概率。动手让一些机器人开始产生剧烈的偏离，然后（使用箭头）查看过去的桶，就会看到 "slash" 按钮被激活。点击它即可罚没任何偏离的节点。

💰 **注意：** 当模拟节点的质押耗尽时（由于罚没或不活跃惩罚），系统会自动为它们补充约 500 ORA 的质押，以保持模拟继续运行。

🥱 如果你厌倦了手动罚没偏离的节点，但仍想看到它们被罚没，可以带上这个环境变量重新运行命令：

```sh
AUTO_SLASH=true yarn simulate:staking
```

### 🥅 目标：

- 你可以通过质押 ORA（ERC20）注册成为预言机节点
- 已注册的节点每个桶可以上报一次价格，并根据上报次数领取 ORA 代币奖励
- 任何人都可以罚没上报价格偏离平均值过远的节点并赚取奖励
- 系统通过记录中位数来最终确定桶，读取价格时使用的是已记录的中位数
- 不活跃惩罚会减少在桶中漏报的节点的有效质押
- 经济激励推动诚实行为和定期参与
- 理解去中心化与延迟之间的权衡
- 看看现实中的例子：[Chainlink](https://chain.link) 和 [PYTH](https://www.pyth.network/)

---

## Checkpoint 3: 🧠 乐观预言机架构

🤿 现在让我们深入了解**乐观预言机**。与前两种关注价格数据的设计不同，这个预言机可以处理任何关于现实世界事件的二元（真/假）问题。

🎯 **它为什么是“乐观”的？** 系统假定提议都是正确的，除非有人对其提出争议。这形成了一种博弈论机制：经济激励鼓励诚实行为，同时通过争议解决提供强有力的安全保证。

💡 **关键创新**：乐观预言机不需要多方持续主动参与（像质押预言机那样），只在出现问题时才需要介入。这使它在处理不需要频繁更新的事件时非常高效。

🔍 **现实世界中的应用**：

- **跨链桥**：“交易 X 是否在链 Y 上发生了？”
- **保险理赔**：“航班 ABC 是否延误超过 2 小时？”
- **预测市场**：“候选人 X 是否赢得了选举？”
- **DeFi 协议**：“代币 X 是否在日期 Z 达到了价格 Y？”

🧭 在编写代码之前，让我们先快速了解一下整体流程。

**角色**：

- **asserter（断言者）**：发布一个断言 + 奖励
- **proposer（提议者）**：提出一个结果 + 保证金
- **disputer（争议者）**：对提议提出质疑 + 保证金
- **decider（裁决者）**：解决争议并确定胜方

**窗口期**：

- 断言窗口：允许提交提议的时间段
- 争议窗口：提议之后允许提出争议的一小段时间

**激励**：

- 奖励 + 退还的保证金归胜方所有；在争议中，败方的保证金归裁决者

![mermaidChart](https://github.com/user-attachments/assets/239e5c8e-6b80-4ebc-b5aa-dcb8a7572e3d)

🧩 这个系统的运作方式是：有人创建一个**断言（assertion）**；

- 一个需要布尔答案（`true` 或 `false`）的问题
- 在某个时间之后
- 在某个截止时间之前
- 附带一笔奖励

🦗 如果在断言窗口结束前没有人回答，断言者可以申请退款。

💡 如果有人在正确的时间内知道答案，他们就会**提议（propose）**这个答案，同时缴纳一笔保证金。这笔保证金对他们来说是一种风险，因为如果其他人认为他们的答案是错的，他们就可能失去这笔保证金。这让人们在经济上对自己提出的**提议**负责。

⏳ 接着，如果在争议窗口结束前没有人对该提议提出**争议（dispute）**，该提议就被视为正确，提议者可以领取奖励并取回保证金。争议窗口应该给任何人留出充足的时间来提交争议。

⚖️ 如果有人确实在争议窗口内提出了**争议**，他们也必须缴纳一笔与提议者保证金相等的保证金。这会把该断言移出原有的时间线，使其进入等待**裁决者**做出裁决的状态。一旦裁决者合约**结算（settle）**了该断言，胜方就可以领取奖励和自己缴纳的保证金。裁决者获得败方的保证金。

🧑‍⚖️ 正如我们前面提到的，这个预言机有一个叫做**裁决者**的角色。在这个示例中，它只是一个任何人都可以调用来结算争议的简单合约。可以想象，在一个真实运行的预言机中，你会需要更稳健的机制，比如由一群人投票来结算争议。

🔗 看看 [UMA](https://uma.xyz/) 是如何通过他们的乐观预言机（Optimistic Oracle，OO）实现这一点的。**这个合约基于 UMA 的 OO 设计**。

## Checkpoint 4: ⚡ 乐观预言机——核心函数

👩‍💻 本节挑战你从零实现乐观预言机系统。你将编写处理断言、提议、争议和结算的核心函数。

🎯 **你的任务**：补全 `OptimisticOracle.sol` 合约中缺失的函数实现。合约骨架已经提供，包含所有必需的结构体、事件和修饰器——你只需要填写逻辑。

🧪 **测试策略**：你实现的每个函数都可以使用提供的测试套件单独测试。每实现一个函数后运行 `yarn test`，验证你的答案是否正确。

<Tabs>
<Tab label="Hardhat">

🔍 打开 `packages/hardhat/contracts/02_Optimistic/OptimisticOracle.sol` 文件，实现乐观预言机的功能。

</Tab>
<Tab label="Foundry">

🔍 打开 `packages/foundry/contracts/02_Optimistic/OptimisticOracle.sol` 文件，实现乐观预言机的功能。

</Tab>
</Tabs>

### ✏️ 任务：

1. **实现 `assertEvent(string memory description, uint256 startTime, uint256 endTime)`**

- 📣 这个函数允许用户断言某个事件将会有一个真/假结果

- 💸 应要求奖励（`msg.value`）大于 0，否则以 `InvalidValue` 回滚

- ⏱️ 应接受 `startTime` 为 0，并将其设为 `block.timestamp`

- ⏳ 应接受 `endTime` 为 0，并默认设为 `startTime + MINIMUM_ASSERTION_WINDOW`

- 🕰️ 应验证 `startTime` 不在过去（即 `startTime` >= `block.timestamp`），否则以 `InvalidTime` 回滚

- 🧭 应验证给定的时间窗口 >= `MINIMUM_ASSERTION_WINDOW`，否则以 `InvalidTime` 回滚

- 🏗️ 应创建一个新的 `EventAssertion` 结构体并设置相关属性——看看你能不能自己搞定

- 🗂️ 该结构体应存储在 `assertions` 映射中。你可以使用 `nextAssertionId`，但别忘了之后把它加一！

- 📣 应触发 `EventAsserted` 事件

<details markdown='1'>

<summary>💡 提示：断言事件</summary>

下面是设置 EventAssertion 结构体的更细致说明：

- asserter 应为 `msg.sender`
- reward 应为 `msg.value`
- bond 应为 reward x 2（当你理解了其中的经济学和博弈论，就会明白为什么）
- startTime = `startTime`
- endTime = `endTime`
- description = `description`
- 其余属性都可以用默认值初始化（`false`、`address(0)` 等）

<details markdown='1'>

<summary>🎯 参考答案</summary>

```solidity
    function assertEvent(string memory description, uint256 startTime, uint256 endTime) external payable returns (uint256) {
        uint256 assertionId = nextAssertionId;
        nextAssertionId++;
        if (msg.value == 0) revert InvalidValue();

        // 如果未提供时间，则设置默认值
        if (startTime == 0) {
            startTime = block.timestamp;
        }
        if (endTime == 0) {
            endTime = startTime + MINIMUM_ASSERTION_WINDOW;
        }

        if (startTime < block.timestamp) revert InvalidTime();
        if (endTime < startTime + MINIMUM_ASSERTION_WINDOW) revert InvalidTime();

        assertions[assertionId] = EventAssertion({
            asserter: msg.sender,
            proposer: address(0),
            disputer: address(0),
            proposedOutcome: false,
            resolvedOutcome: false,
            reward: msg.value,
            bond: msg.value * 2,
            startTime: startTime,
            endTime: endTime,
            claimed: false,
            winner: address(0),
            description: description
        });

        emit EventAsserted(assertionId, msg.sender, description, msg.value);
        return assertionId;
    }
```

</details>
</details>

---

2. **实现 `proposeOutcome(uint256 assertionId, bool outcome)`**

- 🗳️ 这个函数允许用户为已断言的事件提议结果

- 🔍 应检查该断言存在且尚未被提议，否则以 `AssertionNotFound` 或 `AssertionProposed` 回滚

- ⏱️ 应验证时间约束——必须在 `startTime` 之后、`endTime` 之前，否则以 `InvalidTime` 回滚

- 💸 应确保提供了正确的保证金金额，否则以 `InvalidValue` 回滚

- ✍️ 应用该提议更新断言

- ⏳ 应将 `endTime` 设为 `block.timestamp + DISPUTE_WINDOW`

- 📣 应触发 `OutcomeProposed` 事件

<details markdown='1'>

<summary>💡 提示：提议结果</summary>

你需要在断言上设置以下属性：

- proposer 应为 `msg.sender`
- proposedOutcome 应为 `outcome`
- endTime 应更新为 `block.timestamp + DISPUTE_WINDOW`

<details markdown='1'>

<summary>🎯 参考答案</summary>

```solidity
    function proposeOutcome(uint256 assertionId, bool outcome) external payable {
        EventAssertion storage assertion = assertions[assertionId];

        if (assertion.asserter == address(0)) revert AssertionNotFound();
        if (assertion.proposer != address(0)) revert AssertionProposed();
        if (block.timestamp < assertion.startTime) revert InvalidTime();
        if (block.timestamp > assertion.endTime) revert InvalidTime();
        if (msg.value != assertion.bond) revert InvalidValue();

        assertion.proposer = msg.sender;
        assertion.proposedOutcome = outcome;
        assertion.endTime = block.timestamp + DISPUTE_WINDOW;

        emit OutcomeProposed(assertionId, msg.sender, outcome);
    }
```

</details>
</details>

---

3. **实现 `disputeOutcome(uint256 assertionId)`**

- ⚖️ 这个函数允许用户对已提议的结果提出争议

- 🔍 应检查提议存在且尚未被提出争议，否则以 `NotProposedAssertion` 或 `ProposalDisputed` 回滚

- ⏳ 应验证时间约束，确保尚未超过 `endTime`，否则应以 `InvalidTime` 回滚

- 💸 应要求提供正确的保证金金额（即断言上设置的金额）

- 📝 应在断言结构体上记录争议者

<details markdown='1'>

<summary>💡 提示：对结果提出争议</summary>

保证金金额应为断言上设置的 bond，也就是提议者所支付的同一金额。

<details markdown='1'>

<summary>🎯 参考答案</summary>

```solidity
    function disputeOutcome(uint256 assertionId) external payable {
        EventAssertion storage assertion = assertions[assertionId];

        if (assertion.proposer == address(0)) revert NotProposedAssertion();
        if (assertion.disputer != address(0)) revert ProposalDisputed();
        if (block.timestamp > assertion.endTime) revert InvalidTime();
        if (msg.value != assertion.bond) revert InvalidValue();

        assertion.disputer = msg.sender;

        emit OutcomeDisputed(assertionId, msg.sender);
    }
```

</details>
</details>

---

### 测试你的进度

🔍 运行以下命令，检查你是否正确实现了这些函数。

<Tabs>
<Tab label="Hardhat">

**Hardhat**

```shell
yarn test --grep "Checkpoint4"
```

</Tab>
<Tab label="Foundry">

**Foundry**

```shell
yarn test --match-test "Checkpoint4"
```

</Tab>
</Tabs>

### 🥅 目标：

- 你可以创建带有描述和时间窗口的事件断言
- 你可以为已断言的事件提议结果
- 你可以对已提议的结果提出争议
- 系统能正确处理时间约束
- 保证金金额得到正确验证

## Checkpoint 5: 💰 乐观预言机——奖励领取

🎯 **你的任务**：实现奖励领取机制，让参与者能够根据断言、提议和争议的结果领取各自的收益。

💡 **核心概念**：乐观预言机的奖励领取分为三种不同的场景：

- **无争议的提议**：提议者获得奖励并取回保证金
- **有争议的提议**：胜方（由裁决者决定）获得奖励并取回保证金
- **退款**：没有任何提议时，断言者取回奖励

### ✏️ 任务：

1. **实现 `claimUndisputedReward(uint256 assertionId)`**

只要截止时间之前没有人提交争议，提议者就可以在截止时间之后领取奖励。

- 🧩 必须存在提议（否则以 `NotProposedAssertion` 回滚）

- 🚫 必须没有人发起过争议（否则以 `ProposalDisputed` 回滚）

- ⏰ 当前时间必须晚于争议期的 `endTime`（否则以 `InvalidTime` 回滚）

- 🔒 尚未被领取（否则以 `AlreadyClaimed` 回滚）

- 💸 将 `reward + proposer bond`（奖励 + 提议者保证金）转给提议者

- 📣 触发 `RewardClaimed` 事件

<details markdown='1'>

<summary>💡 提示：领取无争议的奖励</summary>

- 验证该断言有提议者且没有争议者
- 检查截止时间已过
- 先标记为已领取
- 将 `resolvedOutcome` 设为提议的结果，将 `winner` 设为提议者
- 计算 `totalReward = reward + bond`
- 使用安全的 ETH 发送方式，失败时回滚

<details markdown='1'>

<summary>🎯 参考答案</summary>

```solidity
    function claimUndisputedReward(uint256 assertionId) external {
        EventAssertion storage assertion = assertions[assertionId];

        if (assertion.proposer == address(0)) revert NotProposedAssertion();
        if (assertion.disputer != address(0)) revert ProposalDisputed();
        if (block.timestamp <= assertion.endTime) revert InvalidTime();
        if (assertion.claimed) revert AlreadyClaimed();

        assertion.claimed = true;
        assertion.resolvedOutcome = assertion.proposedOutcome;
        assertion.winner = assertion.proposer;

        uint256 totalReward = (assertion.reward + assertion.bond);

        (bool winnerSuccess, ) = payable(assertion.proposer).call{value: totalReward}("");
        if (!winnerSuccess) revert TransferFailed();

        emit RewardClaimed(assertionId, assertion.proposer, totalReward);
    }
```

</details>
</details>

---

2. **实现 `claimDisputedReward(uint256 assertionId)`**

这个函数与上一个非常相似，不同之处在于它允许争议的胜方领取奖励，而且*只能在裁决者解决争议之后*领取。

- 🧩 必须存在提议（否则以 `NotProposedAssertion` 回滚）

- ⚖️ 必须存在争议（否则以 `NotDisputedAssertion` 回滚）

- 🧑‍⚖️ 裁决者必须已经设定了胜方（否则以 `AwaitingDecider` 回滚）

- 🔒 尚未被领取（否则以 `AlreadyClaimed` 回滚）

- 📝 将该断言的 `claimed` 属性设为 `true`

- 💸 先把败方的保证金转给裁决者，再把奖励和退还的保证金发送给胜方

- 📣 触发 `RewardClaimed` 事件

<details markdown="1">
<summary>💡 提示：领取有争议的奖励</summary>

- 验证断言状态：已提议、已争议、已设定胜方、尚未领取
- 在付款*之前*标记为已领取，以防止重入
- 将败方的保证金支付给 `decider`
- 胜方获得 `(reward + bond)`
- 使用安全的 ETH 发送模式，失败时回滚（`TransferFailed`）

<details markdown="1">
<summary>🎯 参考答案</summary>

```solidity
    function claimDisputedReward(uint256 assertionId) external {
        EventAssertion storage assertion = assertions[assertionId];

        if (assertion.proposer == address(0)) revert NotProposedAssertion();
        if (assertion.disputer == address(0)) revert NotDisputedAssertion();
        if (assertion.winner == address(0)) revert AwaitingDecider();
        if (assertion.claimed) revert AlreadyClaimed();

        assertion.claimed = true;

        (bool deciderSuccess, ) = payable(decider).call{value: assertion.bond}("");
        if (!deciderSuccess) revert TransferFailed();
        
        uint256 totalReward = assertion.reward + assertion.bond;

        (bool winnerSuccess, ) = payable(assertion.winner).call{value: totalReward}("");
        if (!winnerSuccess) revert TransferFailed();

        emit RewardClaimed(assertionId, assertion.winner, totalReward);
    }
```

</details>
</details>

---

3. **实现 `claimRefund(uint256 assertionId)`**

当截止时间之前没有任何提议时，这个函数让断言者能够取回自己存入的奖励。

- 🚫 不存在提议者（否则以 `AssertionProposed` 回滚）

- ⏰ 已过断言的 endTime（否则以 `InvalidTime` 回滚）

- 🔒 尚未被领取（否则以 `AlreadyClaimed` 回滚）

- 🛡️ 将断言标记为已领取，以防止重入

- 💸 把奖励退还给断言者

- ✅ 检查转账是否成功（否则以 `TransferFailed` 回滚）

- 📣 触发 `RefundClaimed` 事件

<details markdown="1">
<summary>💡 提示：无提议时的退款</summary>

- 验证：没有提议、now > endTime、尚未领取
- 先标记为已领取，再退款
- 触发退款事件

<details markdown="1">
<summary>🎯 参考答案</summary>

```solidity
    function claimRefund(uint256 assertionId) external {
        EventAssertion storage assertion = assertions[assertionId];

        if (assertion.proposer != address(0)) revert AssertionProposed();
        if (block.timestamp <= assertion.endTime) revert InvalidTime();
        if (assertion.claimed) revert AlreadyClaimed();

        assertion.claimed = true;

        (bool refundSuccess, ) = payable(assertion.asserter).call{value: assertion.reward}("");
        if (!refundSuccess) revert TransferFailed();
        emit RefundClaimed(assertionId, assertion.asserter, assertion.reward);
    }
```

</details>
</details>

---

4. **实现 `settleAssertion(uint256 assertionId, bool resolvedOutcome)`**

这是裁决者调用来结算断言的方法，用于判定提议者和争议者谁是正确的。

它应当：

- 🧑‍⚖️ 只能由 `decider` 合约调用

- ⚖️ 该断言必须既有提议又有争议（否则以 `NotProposedAssertion` 或 `NotDisputedAssertion` 回滚）

- 🔒 我们需要确保胜方尚未被设定（否则以 `AlreadySettled` 回滚）

- ✍️ 接下来设置 resolvedOutcome 属性

- 🏁 如果 proposedOutcome == resolvedOutcome，胜方 = 提议者，否则为争议者

- 📣 触发 `AssertionSettled` 事件

<details markdown="1">
<summary>💡 提示：裁决者设定胜方</summary>

我们只需要让裁决者利用剩下那些尚未使用的属性来确定哪一方是正确的，也就是哪一方可以领取奖励。

根据断言的实际真相，将 resolvedOutcome 设为 true 或 false。

然后，如果提议者是对的，就把胜方设为提议者；*或者*如果争议者是对的，就把胜方设为争议者。

<details markdown="1">
<summary>🎯 参考答案</summary>

```solidity
    function settleAssertion(uint256 assertionId, bool resolvedOutcome) external onlyDecider {
        EventAssertion storage assertion = assertions[assertionId];

        if (assertion.proposer == address(0)) revert NotProposedAssertion();
        if (assertion.disputer == address(0)) revert NotDisputedAssertion();
        if (assertion.winner != address(0)) revert AlreadySettled();

        assertion.resolvedOutcome = resolvedOutcome;
        
        assertion.winner = (resolvedOutcome == assertion.proposedOutcome)
            ? assertion.proposer
            : assertion.disputer;

        emit AssertionSettled(assertionId, resolvedOutcome, assertion.winner);
    }
```

</details>
</details>

---

### 测试你的进度

🔍 运行以下命令，检查你是否正确实现了这些函数。

<Tabs>
<Tab label="Hardhat">

**Hardhat**

```shell
yarn test --grep "Checkpoint5"
```

</Tab>
<Tab label="Foundry">

**Foundry**

```shell
yarn test --match-test "Checkpoint5"
```

</Tab>
</Tabs>

### 🥅 目标：

- 提议者可以领取无争议断言的奖励
- 争议结算后，胜方可以领取奖励
- 没有提议时，断言者可以领取退款
- 裁决者可以结算有争议的断言
- 系统能防止重复领取和重入攻击
- 所有转账都得到安全处理，并带有恰当的错误检查

---

## Checkpoint 6: 🧑‍⚖️ 乐观预言机——状态管理

🎯 **你的任务**：实现乐观预言机的最后几个部分：用于查询断言状态和最终结果的工具函数。

### ✏️ 任务：

1. **实现 `getState(uint256 assertionId)`**

这个函数返回一个简单的状态机视图，供界面/测试使用。

这些状态在合约顶部的一个 enum 中定义如下。
**状态**：Invalid、Asserted、Proposed、Disputed、Settled、Expired

仔细想一想，如何通过检查哪些属性已被设置来推导出断言的当前状态。

例如，如果 `asserter` 属性为空，你就应该返回 `Invalid` 状态。

试着在没有任何帮助的情况下推导出其余的状态。

<details markdown="1">
<summary>💡 提示：推导状态</summary>

- 没有断言则为 `Invalid`
- 已设定胜方 => `Settled`
- 已设定争议者 => `Disputed`
- 没有提议者：若已过 endTime => `Expired`，否则为 `Asserted`
- 有提议者：若已过 endTime => `Settled`，否则为 `Proposed`

<details markdown="1">
<summary>🎯 参考答案</summary>

```solidity
    function getState(uint256 assertionId) external view returns (State) {
        EventAssertion storage a = assertions[assertionId];

        if (a.asserter == address(0)) return State.Invalid;
        
        // 如果已有胜方，则为已结算
        if (a.winner != address(0)) return State.Settled;
        
        // 如果有争议，则为争议中
        if (a.disputer != address(0)) return State.Disputed;
        
        // 如果还没有提议，检查截止时间是否已过
        if (a.proposer == address(0)) {
            if (block.timestamp > a.endTime) return State.Expired;
            return State.Asserted;
        }
        
        // 如果没有争议且截止时间已过，则为已结算（可以领取）
        if (block.timestamp > a.endTime) return State.Settled;
        
        // 否则为已提议
        return State.Proposed;
    }
```

</details>
</details>

---

2. **实现 `getResolution(uint256 assertionId)`**

这个函数能让所有人知道该断言的确切结果。

- 🔎 如果断言不存在，应以 `AssertionNotFound` 回滚

- 🚫 如果从未有人提出过提议，应以 `NotProposedAssertion` 回滚（重要：没有提议的过期断言不存在有效的最终结果！）

- ⏳ 接着我们只需检查是否有人发起过争议，以及争议窗口期是否已经结束，这样才能确定可以依赖 `proposedOutcome`（如果时间还没结束，则以 `InvalidTime` 回滚）

- 🧑‍⚖️ 否则，如果已有人发起争议，我们只需确保裁决者已经设定了 `winner`（否则以 `AwaitingDecider` 回滚）

<details markdown="1">
<summary>💡 提示：仔细读取结果</summary>

- 先检查提议是否存在——没有提议的过期断言不存在有效的最终结果
- 分别处理无争议和有争议两条路径
- 用相应的错误来强制执行时间和就绪条件

这里的关键是：如果断言尚未结算就回滚；如果已经结算，就返回正确的结果，无论它是一个无人争议的提议，还是一个被争议后由裁决者结算的提议。

<details markdown="1">
<summary>🎯 参考答案</summary>

```solidity
    function getResolution(uint256 assertionId) external view returns (bool) {
        EventAssertion storage a = assertions[assertionId];
        if (a.asserter == address(0)) revert AssertionNotFound();
        if (a.proposer == address(0)) revert NotProposedAssertion();

        if (a.disputer == address(0)) {
            if (block.timestamp <= a.endTime) revert InvalidTime();
            return a.proposedOutcome;
        } else {
            if (a.winner == address(0)) revert AwaitingDecider();
            return a.resolvedOutcome;
        }
    }
```

</details>
</details>

---

### 测试你的进度

🔍 运行以下命令，检查你是否正确实现了这些函数。

<Tabs>
<Tab label="Hardhat">

**Hardhat**

```shell
yarn test --grep "Checkpoint6"
```

✅ 测试通过了吗？你可以查看 `packages/hardhat/test/OptimisticOracle.ts` 中的测试，深入排查任何错误。

</Tab>
<Tab label="Foundry">

**Foundry**

```shell
yarn test --match-test "Checkpoint6"
```

✅ 测试通过了吗？你可以查看 `packages/foundry/test/OptimisticOracle.t.sol` 中的测试，深入排查任何错误。

</Tab>
</Tabs>

### 动手试试！

🔄 运行 `yarn deploy --reset`，然后测试乐观预言机。试着创建断言、提议结果，并对其发起争议。

🖥️ 前往 Optimistic 页面，与你的新协议交互

![OptimisticOracle](https://github.com/user-attachments/assets/9ed4f066-152b-43a9-a5d4-933221137905)

1. **提交新断言**：  
   前往“Optimistic”页面，填写必填字段以创建一个新断言。

   - 输入断言详情并提交。

2. **提议结果**：  
   断言创建后，使用界面为你的断言提议一个结果。  

3. **对结果发起争议**：  
   如果有人不同意所提议的结果，可以使用待处理断言表格中显示的争议按钮发起争议。

4. **等待争议窗口期结束与结算**：

   - 等待争议窗口期（协议的计时器）到期。  
   - 如果没有人发起争议，断言会自动结算。
   - 如果有争议，裁决者必须选出胜方；请在表格中关注状态更新。

5. **查看结果**：  
   直接在界面中查看每个断言的最终结果和结算状态。  

🧑‍💻 尝试创建、提议和争议断言，在前端观察完整的乐观预言机工作流程。

🧪 **实时模拟**：运行 `yarn simulate:optimistic` 命令，观看完整的乐观预言机生命周期实际运行：

```sh

yarn simulate:optimistic

```

🤖 这会启动自动化机器人，它们会创建断言、提议结果并对提议发起争议，让你可以在逼真的流程中观察奖励、保证金、费用和时间窗口。结算争议就交给你了！

### 🥅 目标：

- 系统为所有断言提供清晰的状态信息
- 用户可以查询有争议和无争议断言的最终结果
- 所有函数都能妥善处理边界情况和无效状态
- 完整的乐观预言机系统可以端到端地运行

---

## Checkpoint 7: 🔍 预言机对比与权衡

🧠 现在让我们来分析每种预言机设计的优缺点。

### 📊 对比表：

| 方面                 | 白名单预言机            | 质押预言机                 | 乐观预言机                        |
| -------------------- | ----------------------- | -------------------------- | --------------------------------- |
| **速度**             | 快                      | 中等                       | 慢                                |
| **安全性**           | 低（依赖受信任的权威方） | 高（经济激励）             | 高（争议解决机制）                |
| **去中心化程度**     | 低                      | 高                         | 取决于裁决者的实现                |
| **成本**             | 低                      | 中等（质押）               | 高（奖励和保证金）                |
| **复杂度**           | 简单                    | 中等                       | 复杂                              |

### 🤔 关键权衡：

1. **白名单预言机：**

- ✅ 简单且快速

- ✅ gas 成本低

- ❌ 需要信任中心化的权威方

- ❌ 存在单点故障

2. **质押预言机：**

- ✅ 去中心化，并有经济激励

- ✅ 通过罚没实现自我纠正

- ❌ 实现起来更复杂

- ❌ gas 成本更高

3. **乐观预言机：**

- ✅ 经济安全性

- ✅ 可用于任何类型的数据（不仅仅是价格）

- ✴️ 裁决者角色是最薄弱的环节，应当谨慎实现；不过，是等待裁决结果，还是重新发布一个断言并寄希望于某个提议能无争议地通过，最终由使用它的应用自行决定

- ❌ 延迟更高

- ❌ 更复杂

### 🎯 理解“为什么”：

每种预言机设计解决的是不同的问题：

- **白名单预言机**：最适合流程中已经存在受信任中介的场景，例如 RWA（现实世界资产），这类场景中速度和准确性比去中心化更重要。
- **质押预言机**：最适合去中心化和安全性至关重要的高价值 DeFi 应用。去中心化程度与延迟同升同降。
- **乐观预言机**：最适合回答复杂问题，以及可以接受较高延迟的场景。它足够灵活，能够解决没有严格二元格式的开放式问题（例如“哪支队伍赢得了比赛？”）。

---

## Checkpoint 8: 💾 部署你的合约！🛰

🎉 干得好，你已经构建好了乐观预言机系统！现在，让我们把它部署到公共测试网上。

🔐 你需要使用 `yarn generate` 生成一个 **部署者地址**。这会创建一个助记词并保存在本地。

👩‍🚀 使用 `yarn account` 查看你的部署者账户余额。

⛽️ 你需要用钱包向你的 **部署者地址** 发送 ETH，或者从所选网络的公共水龙头获取。

<Tabs>
<Tab label="Hardhat">

📡 在 `packages/hardhat/hardhat.config.ts` 中将 `defaultNetwork` 修改为[你选择的公共 EVM 网络](https://ethereum.org/en/developers/docs/networks/)（例如 `sepolia`）。

🚀 运行 `yarn deploy`，将你的乐观预言机合约部署到公共网络（即在 `hardhat.config.ts` 中选定的网络）

> 💬 提示：你可以在 `hardhat.config.ts` 中把 `defaultNetwork` 设置为 `sepolia`，**或者** 直接运行 `yarn deploy --network sepolia`。

</Tab>
<Tab label="Foundry">

🚀 运行 `yarn deploy --network sepolia`，将你的乐观预言机合约部署到 Sepolia 测试网。

</Tab>
</Tabs>

---

## Checkpoint 9: 🚢 发布你的前端！🚁

✏️ 编辑 `packages/nextjs/scaffold.config.ts` 中的前端配置，将 `targetNetwork` 改为 `chains.sepolia`（或你选择部署到的其他网络）。

💻 在 http://localhost:3000 查看你的前端，并确认显示的是正确的网络。

📡 当你准备好发布前端应用时……

📦 运行 `yarn vercel`，打包并部署你的前端。

> 你可能需要先运行 `yarn vercel:login` 登录 Vercel。登录后（通过邮箱、GitHub 等），使用默认选项即可。

> 如果你想重新部署到同一个生产环境 URL，可以运行 `yarn vercel --prod`。如果省略 `--prod` 参数，它会部署到一个预览/测试 URL。

> 按照步骤部署到 Vercel，它会给你一个公开 URL。

> 🦊 由于我们已经部署到公共测试网，你现在需要使用自己拥有的钱包连接，或者使用 burner wallet（临时钱包）。默认情况下，🔥 `burner wallets` 仅在 `localhost` 上可用。你可以在前端配置（`packages/nextjs/` 中的 `scaffold.config.ts`）里设置 `burnerWalletMode: "allNetworks"`，从而在所有链上启用它们。

#### 为生产级应用配置第三方服务。

默认情况下，🏗 Scaffold-ETH 2 为 Alchemy 和 Etherscan 等常用服务提供了预设的 API 密钥。这让你可以更轻松地开始开发和测试应用，而无需注册这些服务。

这对于完成你的 **Speedrun Ethereum** 来说非常合适。

对于生产级应用，建议获取你自己的 API 密钥（以避免速率限制问题）。你可以在以下位置进行配置：

<Tabs>
<Tab label="Hardhat">

- 🔷`packages/hardhat/.env` 和 `packages/nextjs/.env.local` 中的 `ALCHEMY_API_KEY` 变量。你可以在 [Alchemy 控制台](https://dashboard.alchemy.com/)创建 API 密钥。
- 📃`packages/hardhat/.env` 中的 `ETHERSCAN_API_KEY` 变量，填入你生成的 API 密钥。你可以在[这里](https://etherscan.io/myapikey)获取密钥。

</Tab>
<Tab label="Foundry">

- 🔷`packages/foundry/.env` 和 `packages/nextjs/.env.local` 中的 `ALCHEMY_API_KEY` 变量。你可以在 [Alchemy 控制台](https://dashboard.alchemy.com/)创建 API 密钥。
- 📃`packages/foundry/.env` 中的 `ETHERSCAN_API_KEY` 变量，填入你生成的 API 密钥。你可以在[这里](https://etherscan.io/myapikey)获取密钥。

</Tab>
</Tabs>

> 💬 提示：对于线上应用，建议将 nextjs 的环境变量存放在 Vercel/系统环境变量配置中，本地测试则使用 .env.local。

---

## Checkpoint 10: 📜 合约验证

📝 运行 `yarn verify --network your_network` 命令，在 Etherscan 上验证你的乐观预言机合约 🛰。

👉 在 [Sepolia Etherscan](https://sepolia.etherscan.io/) 上搜索你部署的乐观预言机合约地址，获取要提交到 🏃‍♀️[SpeedrunEthereum.com](https://speedrunethereum.com) 的 URL。

---

> 🎉 恭喜你完成了预言机挑战！你已经深入了解了去中心化预言机系统的运作机制，以及它们在区块链生态中的关键作用。你探索了不同的预言机架构，并从零开始构建了一个复杂的乐观预言机系统。

> 🏃 前往[这里](https://speedrunethereum.com)开始你的下一个挑战。

> 💬 对这套技术栈有问题、疑问或意见？请发到 [🏗 scaffold-eth 开发者聊天群](https://t.me/joinchat/F7nCRK3kI93PoCOk)

## Checkpoint 11: 关于预言机的更多内容

预言机是去中心化网络的基础设施。它们让智能合约能够与现实世界的数据交互，使区块链应用在简单的代币转账之外真正发挥作用。

🧭 你实现的这三种预言机设计，代表了生产系统中使用的主要架构模式：

- **白名单预言机** 被那些更看重速度和简单性、而非去中心化的协议所采用
- **质押预言机** 支撑着大多数 DeFi 应用，在这些应用中，经济激励有助于促使参与者诚实行事
- **乐观预言机** 极其灵活，可用于从世界大事到跨链转账验证系统等各种场景

🚀 随着你继续区块链开发之旅，你会遇到这些模式的许多变体和组合。理解其中的基本权衡，将帮助你为具体用例选择合适的预言机设计。

🧠 记住：最好的预言机，是能为你的应用需求在安全性、速度、灵活性和成本之间取得恰当平衡的那一个！
