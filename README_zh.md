# 💰 MyUSD 稳定币

![readme-stablecoin](https://raw.githubusercontent.com/scaffold-eth/se-2-challenges/challenge-stablecoins/extension/packages/nextjs/public/hero.png)

🪙 构建你自己的去中心化稳定币！在这个 Speedrun Ethereum 挑战中，你将为 **MyUSD** 构建核心引擎。MyUSD 是一种由加密资产支撑的稳定币，设计目标是维持与 1 美元（$1 USD）的锚定。

你将扮演一个 DeFi 协议的角色：既要维持价格稳定，又要推动你的稳定币产品被更多人采用。你会深入学习**抵押、铸造、销毁、利率**以及**清算**等概念——这些都是一个稳健的稳定币系统的关键组成部分。

<details markdown='1'><summary>❓ 想知道什么是稳定币？请阅读这里的概述。</summary>

稳定币是一种加密货币，旨在相对于某种特定资产（在我们的例子中是 1 美元）保持稳定的价值。在某种程度上，它们充当了传统金融与加密世界之间的桥梁，在原本波动剧烈的市场中提供稳定性。

🤔 它们是如何维持锚定的？有以下几种机制：

- 💎 **抵押**：用户锁定有价值的资产（如 ETH）作为抵押品来铸造稳定币。这确保每一枚稳定币都有真实价值作为支撑。
- 📊 **利率**：通过调整借款利率和储蓄利率，我们可以影响供需关系，从而维持锚定。
- 🚨 **清算**：如果抵押品价值跌得太低，相应的仓位可能会被清算，以保护整个系统。
- 💸 **市场操作**：系统可以激励买入或卖出，以维持锚定。

👍 现在你已经了解了基础知识，让我们来构建自己的稳定币系统吧！

</details>

---

🌟 最终交付成果是一个应用：用户可以铸造和管理以 ETH 作为抵押品的去中心化稳定币（MyUSD），具备存入抵押品、铸造/销毁代币、管理仓位以及参与清算等功能。
将你的合约部署到测试网，然后构建应用并上传到公共 Web 服务器。在 [SpeedRunEthereum.com](https://speedrunethereum.com) 上提交网址！

🔍 首先需要说明，市场上有许多不同类型的稳定币。有些由银行中以美元计价的真实资产 1:1 支撑（USDC、USDT）；另一些则由加密资产支撑，并使用特殊机制来维持锚定（Dai、RAI、LUSD/BOLD）。

📚 本挑战以最早的加密资产支撑型稳定币之一 Dai 为原型——那时支撑它的只有 ETH。后来 Dai 开始支持多种类型的抵押品，设计上也有所改变。我们要构建的版本通常被称为“单一抵押品 Dai”（single collateral Dai）。

⚠️ 强烈建议你在尝试本挑战之前先完成 [超额抵押借贷挑战](https://speedrunethereum.com/challenge/over-collateralized-lending)，因为我们将在同一个基础系统之上进行构建，但不会再详细讨论它。

💬 在 [稳定币挑战 Telegram 群](https://t.me/+y93US5WbP5dkNDFh) 中结识正在进行本挑战的其他开发者并获取帮助

---

## Checkpoint 0: 📦 环境 📚

🛠️ 开始之前，你需要安装以下工具：

- [Node (>=20.18.3)](https://nodejs.org/en/download/)
- Yarn（[v1](https://classic.yarnpkg.com/en/docs/install/) 或 [v2+](https://yarnpkg.com/getting-started/install)）
- [Git](https://git-scm.com/downloads)
- [Foundry](https://book.getfoundry.sh/getting-started/installation)（仅在选择 Foundry 作为框架时需要）

📥 然后运行以下命令，将挑战下载到你的电脑并安装依赖：

```sh
npx create-eth@2.0.23 -e scaffold-eth/se-2-challenges:challenge-stablecoins challenge-stablecoins
cd challenge-stablecoins
```

出现提示时，选择你偏好的框架（Hardhat 或 Foundry）。

> 💻 在同一个终端中，启动你的本地网络（一个运行在你电脑上的区块链模拟器）：

```sh
yarn chain
```

> 🛰️ 在第二个终端窗口中，（在本地）部署你的合约：

```sh
cd challenge-stablecoins
yarn deploy
```

> 📱 在第三个终端窗口中，启动你的前端：

```sh
cd challenge-stablecoins
yarn start
```

📱 打开 http://localhost:3000 查看应用。

> *注意：截图中的界面可能与当前版本略有不同。*

> 👩‍💻 每当你想把合约的改动部署到前端时，重新运行 `yarn deploy` 即可。运行 `yarn deploy --reset` 可以进行一次全新的部署，即使合约没有改动也会重新部署。

---

⚠️ 我们已在 Cursor 和 VSCode 中禁用了 AI，并强烈建议你不要启用它，这样你可以专注于挑战、一切亲力亲为，从而更好地理解和记住所学内容。如果你使用的是其他 IDE，请自行禁用 AI。

🔧 如果你是一名 vibe-coder，不在意理解代码的语法，只想了解总体要点，可以通过以下方式重新启用 AI：

- Cursor：从 `.cursorignore` 文件中删除 `*`
- VSCode：在 `.vscode/settings.json` 文件中将 `chat.disableAIFeatures` 设置为 `false`

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

## Checkpoint 1: 🎯 系统概览

🔍 让我们来了解稳定币系统的关键组件与运行机制。

<Tabs>
<Tab label="Hardhat">

这些合约位于 `packages/hardhat/contracts` 中。去看看它们，并参考下面对每个合约的说明。

</Tab>
<Tab label="Foundry">

这些合约位于 `packages/foundry/contracts` 中。去看看它们，并参考下面对每个合约的说明。

</Tab>
</Tabs>

### 核心组件

1. 💱 **DEX（`DEX.sol`）**
   - 一个用于 ETH/MyUSD 交易对的简单去中心化交易所
   - 为用户在 ETH 与 MyUSD 之间兑换提供流动性
   - 我们做了简化处理，直接用它来确定 MyUSD 的市场价格

2. 💰 **MyUSD 代币（`MyUSD.sol`）**
   - 真正的稳定币代币（ERC20）
   - 只能由引擎铸造和销毁

3. ⚙️ **引擎（`MyUSDEngine.sol`）**
   - 这是*你*将要编辑的合约
   - 管理稳定币系统的核心合约
   - 处理抵押品（ETH）的存入
   - 控制 MyUSD 的铸造/销毁
   - 管理利率与清算
   - 强制执行抵押率要求

4. 🏦 **质押（`MyUSDStaking.sol`）**
   - 允许用户质押 MyUSD
   - 从借款利率中赚取收益
   - 为 MyUSD 制造买压

5. 📊 **预言机（`Oracle.sol`）**
   - 提供 ETH/MyUSD 和 ETH/USD 价格数据源
   - ETH/USD 价格在你部署合约时就被**固定**下来

> ⚠️ 将真实世界的 ETH 价格固定下来，只是我们为了简化对其中运行机制的理解而采取的捷径。如果还要考虑不断变化的 ETH 价格，追踪各种锚定调节手段的影响就会困难得多。

6. 📈 **利率控制器（`RateController.sol`）**
   - 管理借款利率和储蓄利率
   - 维持 1 美元锚定的关键工具

这个系统打造了一种稳定币，我们有两根杠杆可以拉动来维持锚定。

---

## Checkpoint 2: 🧱 存入抵押品与理解价值

首先，用户需要一种向系统存入抵押品（ETH）的方式。我们还需要知道这些抵押品的美元价值。

<Tabs>
<Tab label="Hardhat">

🔍 打开 `packages/hardhat/contracts/MyUSDEngine.sol` 文件，开始为其中现有的（空）方法添加逻辑。

</Tab>
<Tab label="Foundry">

🔍 打开 `packages/foundry/contracts/MyUSDEngine.sol` 文件，开始为其中现有的（空）方法添加逻辑。

</Tab>
</Tabs>

### ✏️ 任务：

1.  **实现 `addCollateral()`**
    - 这个函数是 `payable` 的，因此它会接收 ETH（`msg.value`）。
    - 它应当更新 `s_userCollateral` 映射中 `msg.sender` 对应的值，以反映其向合约发送了多少 ETH。
    - 它应当触发 `CollateralAdded` 事件。
    - 别忘了：如果 `msg.value` 为零，要使用 `Engine__InvalidAmount()` 回滚（revert）。

<details markdown='1'>
<summary>💡 提示：添加抵押品</summary>

这是一个简单的函数，它会：
- 通过 `msg.value` 接收 ETH
- 更新一个映射，以跟踪每个用户存入了多少 ETH
- 触发一个事件以便追踪

记得：
- 检查零值
- 使用现有的映射
- 在事件中包含当前的 ETH 价格（以 MyUSD 计）

<details markdown='1'>
<summary>🎯 参考答案</summary>

```solidity
function addCollateral() public payable {
    if (msg.value == 0) revert Engine__InvalidAmount();

    s_userCollateral[msg.sender] += msg.value;
    emit CollateralAdded(msg.sender, msg.value, i_oracle.getETHMyUSDPrice());
}
```

</details>
</details>

---

2.  **实现 `calculateCollateralValue(address user)`**
    - 这个函数应返回某个 `user` 持有的 ETH 抵押品的美元总价值。
    - 使用 `i_oracle.getETHMyUSDPrice()` 获取以 MyUSD 计价的当前 ETH 价格（返回的价格精度为 1e18）。
    - 抵押品数量 `s_userCollateral[user]` 以 wei 为单位（1e18 wei = 1 ETH）。
    - 计算公式：`(collateralAmount * ethPrice) / PRECISION`。

<details markdown='1'>
<summary>💡 提示：计算抵押品价值</summary>

这个函数将 ETH 换算为美元价值：
- 从映射中获取用户的 ETH 数量
- 从预言机获取当前 ETH 价格
- 将两者相乘，再除以 PRECISION

思考一下：
- 为什么我们需要除以 PRECISION
- 预言机价格使用的是什么单位
- 抵押品数量使用的是什么单位

<details markdown='1'>
<summary>🎯 参考答案</summary>

```solidity
function calculateCollateralValue(address user) public view returns (uint256) {
    uint256 collateralAmount = s_userCollateral[user];
    return (collateralAmount * i_oracle.getETHMyUSDPrice()) / PRECISION;
}
```

</details>
</details>

---

🚀 使用 `yarn deploy --reset` 重新部署你的合约，然后测试前端，看看能否添加抵押品。

在屏幕右侧你会看到一个由三个图标组成的菜单。将鼠标悬停在最上面的图标上，即可显示抵押品菜单。

![CollateralOpsMenu](https://github.com/user-attachments/assets/f5a374a2-4788-4e71-995b-46c1e0961674)

### 🥅 目标：

- [ ] 用户可以通过 `addCollateral` 函数向合约发送 ETH。
- [ ] `s_userCollateral` 能正确跟踪每个用户存入的 ETH 数量。
- [ ] `calculateCollateralValue` 返回用户抵押品的正确美元价值。
- [ ] 在前端，你应该能在左侧表格中看到你的地址。

---

## Checkpoint 3: 💰 利息计算系统

既然用户已经可以存入抵押品，在允许他们铸造 MyUSD 之前，我们需要先建立利息计算系统。该系统采用基于份额（share）的方法来高效地跟踪利息累积。与把利息当作收入的传统系统不同，我们的稳定币把利率当作维持锚定的工具——当价格低于 1 美元时，更高的利率会抑制借款，帮助消除贷款需求，从而推动价格回升。

> ⚠️ 从这里开始复杂度会上升，所以请密切留意。

为了高效地处理利息累积，我们使用一个**基于份额**的系统。我们不会在每次利息累积时更新每个用户的余额，而是使用两个关键变量：

- `debtExchangeRate`：每一份额价值多少 MyUSD
- `lastUpdateTime`：我们上一次更新兑换率的时间

它的工作原理如下：

1. 当 Bob 铸造 100 MyUSD 时，他获得 100 份额（初始时 1 份额 = 1 MyUSD）
2. 以 10% 的利率过了一年之后：
   - Bob 仍然持有 100 份额
   - 但现在每一份额价值 1.1 MyUSD
   - 因此他总共欠 110 MyUSD（100 份额 × 1.1 兑换率）
3. 此时如果 Alice 铸造 100 MyUSD：
   - 她获得 90.91 份额（100 MyUSD ÷ 1.1 兑换率）
   - 按当前兑换率，这些份额价值 100 MyUSD
   - 但她不需要为第一年的债务支付利息

兑换率只会在借款利率变化时更新，我们会根据自上次更新以来经过的时间计算新产生的利息。

<details markdown='1'>
<summary>💡 提示：理解份额与兑换率</summary>

可以把份额想象成一种“债务代币”，它代表整个债务池中的一部分。兑换率告诉我们每一份额价值多少 MyUSD。随着利息累积，兑换率会上升，使每一份额价值更多的 MyUSD。这样一来，我们不需要更新每个用户的余额——只需更新兑换率即可。

</details>

---

请记住，由于没有小数，我们约定借款利率 125 相当于 1.25% 的年利率。这意味着每当我们乘以借款利率之后，都需要再除以 10000（即 100.00%）。

### ✏️ 任务：

1.  **实现 `_getCurrentExchangeRate()`**
    - 计算如果此刻累积利息，`debtExchangeRate` 将会是多少。
    - 如果 `totalDebtShares` 为 0，返回当前的 `debtExchangeRate`。
    - 根据债务总价值和经过的时间计算利息。这需要将债务总额乘以借款利率，再乘以自上次更新以来经过的时间，但你还需要除以 `SECONDS_PER_YEAR` 和 100%（`10000`）
    - 返回当前兑换率，它应等于现有兑换率 + 利息（以份额计，而不是以价值计——*上一步我们算出的是价值*）

<details markdown='1'>
<summary>💡 提示：计算当前兑换率</summary>

你需要计算自上次更新以来累积了多少利息。思考一下：
- 自 `lastUpdateTime` 以来过去了多长时间
- 当前的债务总价值是多少（`totalDebtShares` x `debtExchangeRate`）
- 这笔债务按当前的 `borrowRate` 产生了多少利息

<details markdown='1'>
<summary>🎯 参考答案</summary>

```solidity
function _getCurrentExchangeRate() internal view returns (uint256) {
    if (totalDebtShares == 0) return debtExchangeRate;

    uint256 timeElapsed = block.timestamp - lastUpdateTime;
    if (timeElapsed == 0 || borrowRate == 0) return debtExchangeRate;

    uint256 totalDebtValue = (totalDebtShares * debtExchangeRate) / PRECISION;
    uint256 interest = (totalDebtValue * borrowRate * timeElapsed) / (SECONDS_PER_YEAR * 10000);

    return debtExchangeRate + (interest * PRECISION) / totalDebtShares;
}
```

</details>
</details>

---

2.  **实现 `_accrueInterest()`**
    - 使用 `_getCurrentExchangeRate()` 更新 `debtExchangeRate`。
    - 将 `lastUpdateTime` 更新为当前时间戳。

<details markdown='1'>
<summary>💡 提示：累积利息</summary>

这个函数会更新兑换率，把已累积的利息计入其中：
- 获取新的兑换率
- 更新存储的兑换率
- 更新时间戳

记得：
- 处理没有债务份额的情况
- 同时更新兑换率和时间戳
- 使用我们刚刚创建的辅助函数（`_getCurrentExchangeRate()`）

<details markdown='1'>
<summary>🎯 参考答案</summary>

```solidity
function _accrueInterest() internal {
    if (totalDebtShares == 0) {
        lastUpdateTime = block.timestamp;
        return;
    }

    debtExchangeRate = _getCurrentExchangeRate();
    lastUpdateTime = block.timestamp;
}
```

</details>
</details>

---

3.  **实现 `_getMyUSDToShares(uint256 amount)`**
    - 将 MyUSD 数量 `amount` 转换为等值的 `debtShares` 数量。
    - 使用 `_getCurrentExchangeRate()` 获取当前兑换率。

<details markdown='1'>
<summary>💡 提示：将 MyUSD 转换为份额</summary>

可以把它想象成货币兑换：
- 如果 1 份额 = 1.1 MyUSD（兑换率）
- 那么 100 MyUSD = 100/1.1 份额

你需要：
- 获取当前兑换率
- 用它计算给定数量对应多少份额

<details markdown='1'>
<summary>🎯 参考答案</summary>

```solidity
function _getMyUSDToShares(uint256 amount) internal view returns (uint256) {
    uint256 currentExchangeRate = _getCurrentExchangeRate();
    return (amount * PRECISION) / currentExchangeRate;
}
```

</details>
</details>

---

🔍 前端上暂时没有什么实质性的内容可以测试，但如果之后有什么地方没有按预期工作，你可能需要回头检查刚刚创建的这些辅助方法。

### 🥅 目标：

- [ ] 利息根据经过的时间和借款利率正确累积
- [ ] 利息累积时兑换率正确更新
- [ ] 根据当前兑换率正确计算份额
- [ ] 系统能处理边界情况（没有份额、零利息等）

---

## Checkpoint 4: 💰 铸造 MyUSD 与仓位健康度

🪙 现在利息计算系统已经就位，我们可以实现铸造功能了。用户应该能够以其抵押品为担保铸造 MyUSD，但我们必须确保他们不会铸造过多，以保持系统处于超额抵押状态。这就是 `COLLATERAL_RATIO`（150%）发挥作用的地方。

### ✏️ 任务：

1.  **实现 `getCurrentDebtValue(address user)`**
    - 这个函数计算用户实际欠下多少 MyUSD（包括利息）。
    - 如果用户没有份额（`s_userDebtShares[user] == 0`），返回 0。
    - 使用 `_getCurrentExchangeRate()` 获取当前兑换率。
    - 计算：`(s_userDebtShares[user] * currentExchangeRate) / PRECISION`。
    - 结果表示包含已累积利息在内的债务总价值。

<details markdown='1'>
<summary>💡 提示：计算当前债务价值</summary>

这是 `_getMyUSDToShares` 的逆运算：
- 如果我们知道用户有多少份额
- 并且知道当前兑换率
- 就可以计算出其债务总价值

记得处理用户没有份额的情况！

<details markdown='1'>
<summary>🎯 参考答案</summary>

```solidity
function getCurrentDebtValue(address user) public view returns (uint256) {
    if (s_userDebtShares[user] == 0) return 0;
    uint256 currentExchangeRate = _getCurrentExchangeRate();
    return (s_userDebtShares[user] * currentExchangeRate) / PRECISION;
}
```

</details>
</details>

---

2.  **实现 `calculatePositionRatio(address user)`**
    - 这个函数计算用户的抵押率。
    - 使用 `getCurrentDebtValue(user)` 获取用户当前的债务价值。
    - 使用 `calculateCollateralValue(user)` 获取用户的抵押品价值。
    - 如果债务价值为 0，返回 `type(uint256).max`（无限大的比率）。
    - 计算：`(collateralValue * PRECISION) / debtValue`。
    - 这个比率必须保持在 150% 以上，仓位才是安全的。

<details markdown='1'>
<summary>💡 提示：计算仓位比率</summary>

仓位比率就像用户仓位的健康评分：
- 比率越高 = 仓位越安全
- 比率越低 = 仓位风险越大

思考一下：
- 如果某人没有债务会怎样？
- 如何处理除以零的情况
- 为什么我们需要在除法之前先乘以 `PRECISION`

<details markdown='1'>
<summary>🎯 参考答案</summary>

```solidity
function calculatePositionRatio(address user) public view returns (uint256) {
    uint256 debtValue = getCurrentDebtValue(user);
    if (debtValue == 0) return type(uint256).max;

    uint256 collateralValue = calculateCollateralValue(user);
    return (collateralValue * PRECISION) / debtValue;
}
```

</details>
</details>

---

3.  **实现 `_validatePosition(address user)`**
    - 这个内部 view 函数会用到上一个函数，如果仓位不安全就回滚
    - 使用 `calculatePositionRatio(user)` 获取仓位比率。
    - 当 `(positionRatio * 100) >= (COLLATERAL_RATIO * PRECISION)` 时，仓位是安全的。
    - 如果不安全，使用 `Engine__UnsafePositionRatio()` 回滚。

<details markdown='1'>
<summary>💡 提示：验证仓位安全性</summary>

这是一个使用仓位比率的简单检查：
- 获取比率
- 将其与要求的比率（150%）进行比较
- 如果太低就回滚

比较时记得正确处理精度！

<details markdown='1'>
<summary>🎯 参考答案</summary>

```solidity
function _validatePosition(address user) internal view {
    uint256 positionRatio = calculatePositionRatio(user);
    if ((positionRatio * 100) < COLLATERAL_RATIO * PRECISION) {
        revert Engine__UnsafePositionRatio();
    }
}
```

</details>
</details>

---

4.  **实现 `mintMyUSD(uint256 mintAmount)`**
    - 终于可以用你的抵押品铸造一些稳定币代币了！
    - 如果 `mintAmount` 为 0，使用 `Engine__InvalidAmount()` 回滚。
    - 使用 `_getMyUSDToShares(mintAmount)` 计算这次铸造数量对应多少份额。
    - 更新用户的债务份额：`s_userDebtShares[msg.sender] += shares`。
    - 更新债务总份额：`totalDebtShares += shares`。
    - 使用 `_validatePosition(msg.sender)` 验证仓位是安全的。
    - 向用户铸造 MyUSD 代币。
    - 触发 `DebtSharesMinted` 事件，附带铸造数量和份额。

<details markdown='1'>
<summary>💡 提示：铸造 MyUSD</summary>

这个函数把所有内容串联起来：
- 将铸造数量转换为份额
- 更新用户份额和总份额
- 检查仓位是否仍然安全
- 铸造实际的代币

记得：
- 检查数量是否为零
- 两处份额记录都要更新
- 在铸造之前先验证
- 触发事件

<details markdown='1'>
<summary>🎯 参考答案</summary>

```solidity
function mintMyUSD(uint256 mintAmount) public {
    if (mintAmount == 0) revert Engine__InvalidAmount();

    uint256 shares = _getMyUSDToShares(mintAmount);
    s_userDebtShares[msg.sender] += shares;
    totalDebtShares += shares;

    _validatePosition(msg.sender);
    i_myUSD.mintTo(msg.sender, mintAmount);

    emit DebtSharesMinted(msg.sender, mintAmount, shares);
}
```

</details>
</details>

---

🧪 运行 `yarn deploy --reset`，然后去前端测试铸造功能。存入抵押品后，将鼠标悬停在铸造图标上，输入你想铸造的 MyUSD 数量。

![MintOps](https://github.com/user-attachments/assets/71d0467f-9069-4244-9c7b-1d128eb344fb)

### 🥅 目标：

- [ ] 用户可以在允许的抵押限额（150%）内铸造 MyUSD。
- [ ] 基于份额的系统能正确跟踪包括利息在内的债务。
- [ ] `getCurrentDebtValue` 显示包括利息在内的真实欠款金额。
- [ ] `calculatePositionRatio` 能正确反映仓位健康度。
- [ ] 前端应允许铸造，并显示 MyUSD 余额和仓位比率。

---

## Checkpoint 5: 📈 累积利息与管理借款利率

🛠️ 现在让我们为利率控制器加上修改借款利率的能力。

每当利率发生变化时，我们都需要使用在 Checkpoint 3 中创建的 `_accrueInterest` 方法，把自上次利率变化以来累积的所有利息“锁定”下来。

### ✏️ 任务：

1.  **实现 `setBorrowRate(uint256 newRate)`**
    - 允许 `i_rateController` 修改年化借款利率 `borrowRate`。
    - 运行 `_accrueInterest()` 以更新 `debtExchangeRate` 和 `lastUpdateTime`
    - 更新 `borrowRate` 并触发 `BorrowRateUpdated` 事件。

<details markdown='1'>
<summary>💡 提示：设置借款利率</summary>

这个函数让利率控制器可以调整借款利率：
- 检查调用者是否为利率控制器（由修饰器处理）
- 运行 `_accrueInterest()`
- 更新利率
- 触发事件

记得：
- 使用修饰器进行访问控制
- 触发包含新利率的事件

<details markdown='1'>
<summary>🎯 参考答案</summary>

```solidity
function setBorrowRate(uint256 newRate) external onlyRateController {
    _accrueInterest();
    borrowRate = newRate;
    emit BorrowRateUpdated(newRate);
}
```

</details>
</details>

---

🤡 有趣的是，虽然我们检查了只有利率控制器才能修改利率，但*任何人*都可以调用 `RateController.sol` 合约中的方法！我们这样做是为了让你能方便地从前端修改利率，而不必为某个特定账户授权。

🧪 使用 `yarn deploy --reset` 重新部署后，去前端试试吧。点击借款利率旁边的编辑图标（位于 **Rate Controls** 区域内），设置一个新的利率。

![BorrowRateAdjust](https://github.com/user-attachments/assets/7623ab64-19b8-43fb-adb5-5cf598098be9)

### 🥅 目标：

- [ ] 借款利率可以被更新

---

## Checkpoint 6: 💸 偿还债务与提取抵押品

🔄 用户需要能够偿还他们的 MyUSD 债务，并提取他们的 ETH 抵押品。

🧮 由于债务一直在累积，我们决定使用一个方法（`repayUpTo`），允许用户指定一个*超过*所欠债务的任意数额，这样用户就能彻底清偿债务。如果我们只是让用户指定所欠的精确数额，那么等到他们的交易被打包上链时，债务又会累积更多利息，最终会剩下极少量未偿还的部分。

### ✏️ 任务：

1.  **实现 `repayUpTo(uint256 amount)`**
    - 该函数允许用户偿还最多 `amount` 数额的 MyUSD 债务。
    - 首先，使用 `_getMyUSDToShares(amount)` 将用户想要偿还的 MyUSD 数额 `amount` 转换为 `amountInShares`。
    - 如果 `amountInShares` 大于用户的 `s_userDebtShares[msg.sender]`，说明他们试图偿还的数额超过了所欠的数额。这种情况下，我们通过以下方式把还款额上限设为其实际债务：
      - 将 `amountInShares` 设为 `s_userDebtShares[msg.sender]`
      - 使用 `getCurrentDebtValue(msg.sender)` 重新计算实际要偿还的 MyUSD 数额 `amount`
    - 检查用户是否有足够的 MyUSD 余额：`i_myUSD.balanceOf(msg.sender) < amount`。如果不够，则以 `MyUSD__InsufficientBalance()` 回滚。
    - 检查 MyUSD 引擎合约是否有足够的授权额度来花费用户的 MyUSD：`i_myUSD.allowance(msg.sender, address(this)) < amount`。如果不够，则以 `MyUSD__InsufficientAllowance()` 回滚。
    - 从 `s_userDebtShares[msg.sender]` 和 `totalDebtShares` 中减去 `amountInShares`，完成更新。
    - 销毁用户的 MyUSD：`i_myUSD.burnFrom(msg.sender, amount)`。
    - 触发 `DebtSharesBurned` 事件。

<details markdown='1'>
<summary>💡 提示：偿还债务</summary>

该函数需要处理以下几种情况：
- 用户想要偿还恰好所欠的数额
- 用户想要偿还超过所欠的数额（我们将其上限设为实际债务）
- 用户余额不足
- 用户授权的额度不足

记得：
- 先把 MyUSD 数额转换为份额
- 如果用户试图偿还超过所欠的数额，将其上限设为实际债务
- 同时更新用户的份额和总份额
- 销毁正确数量的 MyUSD

<details markdown='1'>
<summary>🎯 参考答案</summary>

```solidity
function repayUpTo(uint256 amount) public {
    uint256 amountInShares = _getMyUSDToShares(amount);
    // 检查用户是否有足够的债务
    if (amountInShares > s_userDebtShares[msg.sender]) {
        // 只会使用可偿还的最大 MyUSD 数额
        amountInShares = s_userDebtShares[msg.sender];
        amount = getCurrentDebtValue(msg.sender);
    }

    // 检查余额
    if (amount == 0 || i_myUSD.balanceOf(msg.sender) < amount) {
        revert MyUSD__InsufficientBalance();
    }

    // 检查授权额度
    if (i_myUSD.allowance(msg.sender, address(this)) < amount) {
        revert MyUSD__InsufficientAllowance();
    }

    // 更新用户的债务份额和总份额
    s_userDebtShares[msg.sender] -= amountInShares;
    totalDebtShares -= amountInShares;

    i_myUSD.burnFrom(msg.sender, amount);

    emit DebtSharesBurned(msg.sender, amount, amountInShares);
}
```

</details>
</details>

---

2.  **实现 `withdrawCollateral(uint256 amount)`**
    - 如果 `amount` 为 0，则以 `Engine__InvalidAmount()` 回滚。
    - 如果 `s_userCollateral[msg.sender] < amount`，则以 `Engine__InsufficientCollateral()` 回滚。
    - 将 `s_userCollateral[msg.sender]` 减少 `amount`。
    - 如果用户仍有债务（`s_userDebtShares[msg.sender] > 0`），调用 `_validatePosition(msg.sender)` 以确保他们在提取*之后*仍处于安全的抵押状态。如果不安全，`_validatePosition` 会回滚（并且由于你还没有真正转出 ETH，对 `s_userCollateral` 的状态修改也会一并回滚）。
    - 如果仓位仍然有效（或者用户没有债务），就转出 ETH：`payable(msg.sender).transfer(amount);`。用 `Engine__TransferFailed()` 处理可能出现的转账失败。
    - 触发 `CollateralWithdrawn` 事件，并附带当前的 ETH 价格。

<details markdown='1'>
<summary>💡 提示：提取抵押品</summary>

该函数需要谨慎地维护用户仓位的安全：
- 检查他们是否有足够的抵押品
- 减少他们的抵押品，但紧接着用 `_validatePosition` 检查他们是否仍然安全
- 只有在仓位保持安全时才转出 ETH

记得：
- 处理用户没有债务的情况
- 使用现有的仓位验证函数
- 触发事件时附带当前价格（这仅供前端使用）

<details markdown='1'>
<summary>🎯 参考答案</summary>

```solidity
function withdrawCollateral(uint256 amount) external {
    if (amount == 0) revert Engine__InvalidAmount();
    if (s_userCollateral[msg.sender] < amount) revert Engine__InsufficientCollateral();

    // 暂时减少用户的抵押品，以检查其是否仍然安全
    uint256 newCollateral = s_userCollateral[msg.sender] - amount;
    s_userCollateral[msg.sender] = newCollateral;

    // 在提取后验证用户的仓位
    if (s_userDebtShares[msg.sender] > 0) {
        _validatePosition(msg.sender);
    }

    // 将抵押品转给用户
    payable(msg.sender).transfer(amount);

    emit CollateralWithdrawn(msg.sender, amount, i_oracle.getETHMyUSDPrice());
}
```

</details>
</details>

---

🧪 去前端试试吧！用 `yarn deploy --reset` 重新部署，然后尝试完整走一遍存入、铸造/借款、偿还和提取的流程。

### 🥅 目标：

- [ ] 用户可以偿还他们的 MyUSD 债务，其 `s_userDebtShares` 应当减少。
- [ ] 用户可以提取他们的 ETH 抵押品，前提是仓位保持安全（如果有债务，抵押率需高于 150%）。
- [ ] 试图提取过多抵押品、导致仓位不安全时，操作应当失败。
- [ ] 前端应当反映这些变化。

---

## Checkpoint 7: 🚨 清算——维护系统稳定

🛡️ 如果 ETH 价格下跌，或者用户的债务累积了太多利息，导致其仓位的抵押率低于 150%，会发生什么？这时就轮到清算登场了。任何人都可以对不安全的仓位发起清算。

⚖️ 清算对于维持系统的偿付能力至关重要。它确保：

1. 系统始终保持超额抵押
2. 债务在变成“坏账”（抵押不足——抵押率低于 100%）之前就被迅速处理
3. 用户有动力维持安全的仓位

### ✏️ 任务：

1.  **实现 `isLiquidatable(address user)`**
    - 该函数检查用户的仓位是否已变得不安全、可以被清算。
    - 使用 `calculatePositionRatio(user)` 计算用户当前的仓位比率。它会自动使用当前兑换率来获取最新的债务价值。
    - 如果 `(positionRatio * 100) < COLLATERAL_RATIO * PRECISION`，返回 `true`，否则返回 `false`。

<details markdown='1'>
<summary>💡 提示：检查清算状态</summary>

这个函数的逻辑与 `_validatePosition` 非常相似，只不过它只返回一个 bool，而不是回滚。

思考一下：
- 仓位比率与抵押率之间有什么关系
- 为什么我们要乘以 100，并与 COLLATERAL_RATIO \* PRECISION 进行比较

<details markdown='1'>
<summary>🎯 参考答案</summary>

```solidity
function isLiquidatable(address user) public view returns (bool) {
    uint256 positionRatio = calculatePositionRatio(user);
    return (positionRatio * 100) < COLLATERAL_RATIO * PRECISION;
}
```

</details>
</details>

---

2.  **实现 `liquidate(address user)`**
    - 该函数允许任何人通过以下方式清算一个不安全的仓位：
      - 偿还该用户的债务
      - 获得其抵押品（外加一笔奖励）
      - 清除其债务
    - 使用 `if (!isLiquidatable(user)) revert Engine__NotLiquidatable();` 检查该仓位是否确实可被清算。
    - 获取 `userDebtValue = getCurrentDebtValue(user)`。
    - 获取 `userCollateral = s_userCollateral[user]`。
    - 获取 `collateralValue = calculateCollateralValue(user)`。
    - 清算人（`msg.sender`）必须偿还该用户的债务。检查清算人是否有足够的 MyUSD：`i_myUSD.balanceOf(msg.sender) < userDebtValue`。如果不够，则回滚。
    - 检查引擎合约是否有足够的授权额度来销毁清算人的 MyUSD：`i_myUSD.allowance(msg.sender, address(this)) < userDebtValue`。如果不够，则回滚。
    - 从 `msg.sender` 处销毁 `userDebtValue` 数额的 MyUSD：`i_myUSD.burnFrom(msg.sender, userDebtValue)`。
    - 清除被清算用户的债务：`totalDebtShares -= s_userDebtShares[user]; s_userDebtShares[user] = 0;`。
    - 计算清算人能获得多少该用户的抵押品：
      - `collateralToCoverDebt = (userDebtValue * userCollateral) / collateralValue;`（这是与债务美元价值相同的 ETH 抵押品数量）。
      - `rewardAmount = (collateralToCoverDebt * LIQUIDATOR_REWARD) / 100;`
      - `amountForLiquidator = collateralToCoverDebt + rewardAmount;`
    - 确保 `amountForLiquidator` 不超过 `userCollateral`。如果超过，则将其上限设为 `userCollateral`。
    - 减少被清算用户的抵押品：`s_userCollateral[user] -= amountForLiquidator;`。
    - 将 `amountForLiquidator` 数量的 ETH 转给 `msg.sender`。处理可能出现的转账失败。
    - 触发 `Liquidation` 事件。

<details markdown='1'>
<summary>💡 提示：清算仓位</summary>

这是维护系统健康的核心函数：
- 它允许任何人介入并处理不安全的仓位
- 它确保清算人的服务能得到补偿
- 它保护系统免于累积坏账

关键考虑点：
- 始终先累积利息，以获取当前的债务价值
- 仔细计算抵押品数量，以维持系统的偿付能力
- 处理抵押品可能不足以覆盖全部债务的边界情况
- 确保正确触发事件，以便进行链下监控

<details markdown='1'>
<summary>🎯 参考答案</summary>

```solidity
function liquidate(address user) external {
    if (!isLiquidatable(user)) {
        revert Engine__NotLiquidatable();
    }

    uint256 userDebtValue = getCurrentDebtValue(user);
    uint256 userCollateral = s_userCollateral[user];
    uint256 collateralValue = calculateCollateralValue(user);

    if (i_myUSD.balanceOf(msg.sender) < userDebtValue) {
        revert MyUSD__InsufficientBalance();
    }

    if (i_myUSD.allowance(msg.sender, address(this)) < userDebtValue) {
        revert MyUSD__InsufficientAllowance();
    }

    i_myUSD.burnFrom(msg.sender, userDebtValue);

    totalDebtShares -= s_userDebtShares[user];
    s_userDebtShares[user] = 0;

    uint256 collateralToCoverDebt = (userDebtValue * userCollateral) / collateralValue;
    uint256 rewardAmount = (collateralToCoverDebt * LIQUIDATOR_REWARD) / 100;
    uint256 amountForLiquidator = collateralToCoverDebt + rewardAmount;

    if (amountForLiquidator > userCollateral) {
        amountForLiquidator = userCollateral;
    }

    s_userCollateral[user] = userCollateral - amountForLiquidator;

    (bool sent, ) = payable(msg.sender).call{ value: amountForLiquidator }("");
    if (!sent) revert Engine__TransferFailed();

    emit Liquidation(user, msg.sender, amountForLiquidator, userDebtValue, i_oracle.getETHMyUSDPrice());
}
```

</details>
</details>

---

🏆 `LIQUIDATOR_REWARD`（10%）激励*任何人*去监控系统并清算不安全的仓位。这就形成了一个清算人市场，清算人会：

- 监控仓位的安全性
- 在仓位变得不安全时迅速行动
- 帮助维护系统健康
- 从他们提供的服务中获利

💡 这笔奖励经过精心权衡，以便：

- 足够有吸引力，确保清算一定会发生
- 覆盖 gas 成本并提供合理的回报
- 维持系统的偿付能力

🧪 重新部署（`yarn deploy --reset`），然后去前端测试所有功能。

- 把 Borrow Rate（借款利率）调到 1000% 或其他夸张的数值（这能帮我们迅速进入可被清算的仓位状态）
- 存入抵押品
- 铸造最大数额的 MyUSD（对应抵押品价值 150% 的抵押率），连同美分也填上，以尽可能接近上限。
- 在同一页面打开一个浏览器无痕（隐私）标签页。你应该会获得一个新的 burner wallet（临时钱包）。点击水龙头按钮（右上角）给它一些 ETH。
- 使用 **swap** 按钮（位于 MyUSD Wallet 区域）将 ETH 兑换成足够的 MyUSD，用来偿还你第一个账户的债务。确保你换到的 MyUSD 多于第一个账户铸造的数额，因为它的债务已经累积了更多利息。
- 检查第一个账户的仓位是否处于可被清算的状态。此时 **Liquidate** 按钮应该已经可以点击。
- 用你的第二个账户点击该按钮来清算这个仓位。

![LiquidatableState](https://github.com/user-attachments/assets/8d5474ff-74f8-4b1f-8580-9e30bbd075d7)

> ⚠️ 注意，第一个账户的钱包里仍然持有原来的 MyUSD。第二个（清算人）账户替它向协议偿还了债务，并领取了它的抵押品外加奖励。

### 🥅 目标：

- [ ] `isLiquidatable` 应当正确识别低于 `COLLATERAL_RATIO` 的仓位。
- [ ] `liquidate` 函数应当允许第三方偿还高风险用户的债务，并领取其抵押品（外加奖励）。
- [ ] 被清算用户的债务应当被清除，其抵押品应当减少。
- [ ] 清算人应当获得正确数量的抵押品。
- [ ] 测试方法：创建一个仓位并借入可借的最大数额，然后设置较高的借款利率，让利息不断累积。

---

## Checkpoint 8: 🤖 市场模拟

🧪 既然我们已经实现了稳定币系统的全部核心功能，就来看看它在模拟的市场环境中表现如何。`yarn simulate` 脚本会运行若干自动化机器人，模拟不同的市场参与者。

🚀 首先，我们将关注借款这一面。这些机器人账户各自拥有源源不断（但流速缓慢）的无限资金，它们想用这些资金获得 ETH 的杠杆敞口。它们会存入抵押品，然后铸造一些 MyUSD。之后，它们会把新铸造的 MyUSD 兑换成更多的 ETH。由于*唯一*的市场参与者都在抛售 MyUSD 换取 ETH，这会压低 MyUSD 的价格。

### 🚀 运行模拟：

1. 🟢 确保你的本地网络正在运行（`yarn chain`）
2. 🟢 部署你的合约（`yarn deploy --reset`），或者至少把借款利率调回 0
3. 🟢 运行模拟：

```sh
yarn simulate
```

👀 观察控制台输出，可以看到：

- 每个机器人账户偏好的借款利率上限
- 每个机器人的活动

👀 观察前端，可以看到：

- 我们宝贵的 MyUSD 正在脱锚！
- 流通中的 MyUSD 总供应量不断增加

💣 现在把借款利率提高到 30%。

🧠 机器人们不得不跟它们甜蜜的低利率说再见，接受现在被收取的高额利息。

❓ 你注意到了什么？

- 机器人纷纷退出它们的仓位
- 总供应量大幅下降
- 锚定得以恢复

🧩 这只是一个小例子，展示了一小群市场参与者就能对一种资产的价格产生多大的影响。

❓ 我们的稳定币是否注定要么市值很小，要么永久脱锚？下一节揭晓答案……

### 🥅 目标：

- [ ] 成功运行模拟脚本
- [ ] 观察看涨的市场活动对市场的影响
- [ ] 理解系统各组件之间如何交互
- [ ] 了解利率如何影响市场行为

---

## Checkpoint 9: ⚖️ 另一面：储蓄利率与市场动态

🪙 到目前为止，我们关注的都是用户借入 MyUSD（如果他们把 MyUSD 兑换成 ETH，就会产生卖压）。但我们已经看到，这会让稳定币很快脱锚。

🧲 为了维持 $1 的锚定，我们还需要能为 MyUSD 创造*买压*的机制。如果我们能激励市场去买入 MyUSD，而不是一味地卖出，会怎样？这就轮到由 `MyUSDStaking.sol` 合约管理的**储蓄利率**（Savings Rate）登场了。

💡 用户可以把他们的 MyUSD 质押到 `MyUSDStaking.sol` 中来赚取收益。这笔收益（即储蓄利率）让持有 MyUSD 变得有吸引力，并为使用 MyUSD 提供了一个*除 ETH 杠杆敞口之外*的新激励。

<details markdown='1'>
<summary>收益从何而来？</summary>

每一枚存在的 MyUSD 都在支付借款利率，因此<b>只要储蓄利率小于或等于借款利率，这就是可持续的</b>。你也许会想：“那 DEX 里的流动性呢？”其实这些 DEX 流动性也只是来自一个大型借款人：他存入了 ETH 抵押品、借入了大量 MyUSD，然后把这些 MyUSD 全部提供给了 DEX。看看部署文件 <code>packages/hardhat/deploy/00_deploy_contract.ts</code>，就能找到为 DEX 提供流动性的地方。严格来说，所有由借款利率累积产生、但没有分配给质押者的 MyUSD，都应该存在于系统中的<i>某个地方</i>，但我们决定不把这一点加进本已很复杂的系统里。因此，如果所有人（包括 DEX 的流动性提供者）都决定尝试偿还全部债务，他们将无法做到。

</details>

---

🛡️ 既然我们已经了解了收益从何而来，就需要确保系统始终能支付这笔收益。回到 `MyUSDEngine.sol` 中的 `setBorrowRate` 函数，添加一个检查，确保新利率大于或等于储蓄利率。这样可以保证系统始终能向质押者支付收益。如果新利率过低，则以 `Engine__InvalidBorrowRate()` 回滚。

<details markdown='1'>
<summary>💡 提示：设置借款利率</summary>

借款利率必须始终足够高，以覆盖储蓄利率：

- 使用 `i_staking.savingsRate()` 从质押合约获取当前的储蓄利率
- 将其与新的借款利率进行比较
- 如果借款利率过低，则回滚
- 记得在累积利息和更新利率之前进行这项检查

<details markdown='1'>
<summary>🎯 参考答案</summary>

```solidity
function setBorrowRate(uint256 newRate) external onlyRateController {
    if (newRate < i_staking.savingsRate()) revert Engine__InvalidBorrowRate();
    _accrueInterest();
    borrowRate = newRate;
    emit BorrowRateUpdated(newRate);
}
```

</details>
</details>

---

🧠 在本 Checkpoint 余下的部分中，**你不需要编辑任何 Solidity 代码**，但你需要理解其中的交互。

### 📖 概念与关联：

1.  **`MyUSDStaking.sol`：** 这个独立的合约（已提供）有一个 `setSavingsRate(uint256 newRate)` 函数（可由其 owner 调用，在我们的设置中 owner 也就是 `RateController`）以及一个 `savingsRate()` view 函数。用户需要先对该合约 `approve` MyUSD，然后调用它的 `stake(uint256 amount)` 函数。
2.  **`RateController.sol`：** 这个合约（你可以通过界面控制它）可以调用：
    - `MyUSDEngine.setBorrowRate()`
    - `MyUSDStaking.setSavingsRate()`
3.  **`MyUSDEngine.setBorrowRate()` 中的约束：**
    - 还记得这一行：`if (newRate < i_staking.savingsRate()) revert Engine__InvalidBorrowRate();`
    - 这意味着引擎中的 `borrowRate` 通常应当高于或等于 `MyUSDStaking.sol` 提供的 `savingsRate`。这是合理的：系统要想可持续，从借款人那里赚到的必须多于付给储户的。
4.  **维持锚定稳定的调节手段：**
    - **高借款利率：** 抑制 MyUSD 的铸造（减少潜在的卖压）。
    - **有吸引力的储蓄利率：** 鼓励买入/持有 MyUSD 以进行质押（创造买压）。
    - 在这两种利率之间找到恰当的平衡，是让 MyUSD 保持在 $1 附近的关键。如果 MyUSD 的交易价格低于 $1，你可以提高储蓄利率或提高借款利率。如果 MyUSD 高于 $1，你可以降低储蓄利率或降低借款利率。

### 📖 理解：

- 在前端，你可以看到同时设置 **Borrow Rate**（借款利率，用于 `MyUSDEngine`）和 **Savings Rate**（储蓄利率，用于 `MyUSDStaking`）的选项。
- `DEX.sol` 合约提供了一个简单的市场，可以在其中用 ETH 兑换 MyUSD。这个 DEX 上的价格会反映 MyUSD 的供需情况。
- 想一想改变借款利率和储蓄利率会如何影响用户：
  - 如果储蓄利率很高，人们可能会在 DEX 上买入 MyUSD 来质押，从而推高价格。
  - 如果借款利率很高，人们可能不太愿意铸造新的 MyUSD，或者可能会在 DEX 上买入 MyUSD 来偿还现有贷款，从而减少卖压或创造买压。

### 🥅 目标：

- [ ] 理解 `MyUSDEngine` 和 `MyUSDStaking` 协同工作，并受通过 `RateController` 设置的利率影响。
- [ ] 理解储蓄利率会创造持有/买入 MyUSD 的激励。
- [ ] 在前端的 **Price Graph**（价格图表）区域观察 MyUSD 的价格。

---

## Checkpoint 10: 🤖 模拟与寻找均衡

🧪 现在迎来“啊哈！”时刻。让我们看看在模拟的市场活动和自动化利率控制器的作用下，这些机制会如何发挥作用。

### 🚀 运行模拟：

1.  **`yarn simulate` 脚本：**
    - 该脚本会启动若干模拟用户（参与者）。
    - 一些参与者会关注 `borrowRate`。如果它有吸引力，他们就会存入 ETH 并铸造 MyUSD（可能会在 DEX 上卖出以换取更多 ETH，代表加杠杆的交易者）。
    - 另一些参与者会关注 `savingsRate`。如果它有吸引力，他们就会从 DEX 买入 MyUSD 并质押到 `MyUSDStaking.sol` 中。
    - 在你的 `challenge-stablecoins` 目录下运行该脚本：`yarn simulate`。
    - 观察控制台和前端。你应该能看到各种活动：抵押品存入、MyUSD 铸造、质押以及 DEX 兑换。DEX 上的 MyUSD 价格会上下波动。
    - 动手实验：在运行 `yarn simulate` 的同时，用前端控件（它们使用 `RateController.sol`）手动设置非常高或非常低的借款/储蓄利率。MyUSD 价格会如何反应？

2.  **`yarn interest-rate-controller` 脚本：**
    - 该脚本会尝试自动调整 `borrowRate`（在 `MyUSDEngine` 中）和 `savingsRate`（在 `MyUSDStaking` 中），试图让 MyUSD 价格趋近 $1。
    - 它会观察价格，然后做出决策：
      - 如果 MyUSD < $1：尝试提高储蓄利率（让持有 MyUSD 更有吸引力）或提高借款利率（让铸造 MyUSD 不那么有吸引力）。
      - 如果 MyUSD > $1：尝试降低储蓄利率或降低借款利率。
    - 运行该脚本：`yarn interest-rate-controller`。
    - 在控制台观察它的操作，以及 DEX 上的 MyUSD 价格如何响应。它能否把价格稳定在 $1 附近？
    - 它以 **TEMPERED** 模式启动，该模式只会不断提高借款利率，直到锚定稳定下来。一旦实现这一点，它就会切换到 **GROWTH** 模式，在该模式下它会降低借款利率，并开始提高储蓄利率，以吸引用户。
    - 点击价格图表上的 **Show Rates** 按钮，查看利率的变化在历史上如何影响价格。
    - 价格应当找到一个均衡点，在锚定价格附近来回波动

### 🤔 关键要点：

- **需求破坏（Demand Destruction）：** 高借款利率让铸造 MyUSD 变得昂贵，从而减少其供应量和潜在的卖压。这是其中一个调节手段。
- **需求创造（Demand Creation）：** 有吸引力的储蓄利率让持有 MyUSD（进而买入它）变得令人向往，从而增加需求和买压。这是另一个至关重要的调节手段。
- **动态均衡：** “正确”的利率并不是固定的；它们取决于市场状况和市场情绪。这个稳定币系统通过调整这些激励措施，不断地寻求均衡。
- **任意设定的利率：** 利率最终由一个控制器设定（在我们的例子中是 `RateController.sol`，你可以操控它）。其有效性取决于市场的反应。
- **市场的不可预测性：** 我们只模拟了两种不同类型的市场参与者。想象一下，一个拥有成千上万、甚至数百万参与者的真实市场会是什么样子（🤯）。随着买入、卖出或持有 MyUSD 的新激励不断出现，一切都在持续变化。再想一想，这些市场需求在牛市与熊市中会有怎样的不同。

### 🥅 目标：

- [ ] 成功运行 `yarn simulate` 脚本并观察市场行为。
- [ ] 成功运行 `yarn interest-rate-controller` 脚本，并观察它为稳定 MyUSD 价格所做的尝试。
- [ ] 直观地理解：在这类系统中，借款利率和储蓄利率是管理稳定币锚定的主要工具。
- [ ] 认识到维持锚定是一个平衡各种激励的主动过程。

---

## Checkpoint 11: 💾 部署你的合约！🛰

干得好，你已经构建出了一个稳定币引擎！现在，让我们把它部署到公共测试网上。

<Tabs>
<Tab label="Hardhat">

📡 在 `packages/hardhat/hardhat.config.ts` 中把 `defaultNetwork` 修改为[你选择的公共 EVM 网络](https://ethereum.org/en/developers/docs/networks/)（例如 `sepolia`）。

</Tab>
<Tab label="Foundry">

📡 在 `packages/foundry/foundry.toml` 中把 `targetFork` 修改为[你选择的公共 EVM 网络](https://ethereum.org/en/developers/docs/networks/)（例如 `sepolia`）。

</Tab>
</Tabs>

🔐 你需要使用 `yarn generate` 生成一个**部署者地址**。该命令会创建一个助记词并将其保存在本地。

👩‍🚀 使用 `yarn account` 查看你的部署者账户余额。

⛽️ 你需要用你的钱包向**部署者地址**发送 ETH，或者从你所选网络的公共水龙头获取 ETH。

🚀 运行 `yarn deploy`，将你的智能合约部署到公共网络（在 `hardhat.config.ts` 中选择）

<Tabs>
<Tab label="Hardhat">

> 💬 提示：你可以在 `hardhat.config.ts` 中把 `defaultNetwork` 设为 `sepolia`，**或者**直接运行 `yarn deploy --network sepolia`。

</Tab>
<Tab label="Foundry">

> 💬 提示：你可以在 `foundry.toml` 中把 `targetFork` 设为 `sepolia`，**或者**直接运行 `yarn deploy --network sepolia`。

</Tab>
</Tabs>

---

## Checkpoint 12: 🚢 发布你的前端！🚁

✏️ 编辑 `packages/nextjs/scaffold.config.ts` 中的前端配置，把 `targetNetwork` 改为 `chains.sepolia`（或你所部署的网络）。

💻 在 http://localhost:3000 查看你的前端，确认你看到的是正确的网络。

📡 当你准备好发布前端应用时……

📦 运行 `yarn vercel`，打包并部署你的前端。

> 你可能需要先运行 `yarn vercel:login` 登录 Vercel。登录之后（通过邮箱、GitHub 等），使用默认选项即可。

> 如果你想重新部署到同一个生产环境 URL，可以运行 `yarn vercel --prod`。如果省略 `--prod` 参数，它会部署到一个预览/测试 URL。

> 按照步骤部署到 Vercel。它会给你一个公开的 URL。

> 🦊 由于我们已经部署到公共测试网，你现在需要使用自己拥有的钱包连接，或者使用 burner wallet。默认情况下，🔥 `burner wallets` 只在 `localhost` 上可用。你可以在前端配置（`packages/nextjs/` 中的 `scaffold.config.ts`）里设置 `burnerWalletMode: "allNetworks"`，从而在所有链上启用它们。

#### 生产级应用的第三方服务配置。

默认情况下，🏗 Scaffold-ETH 2 为 Alchemy 和 Etherscan 等常用服务提供了预设的 API key。这让你可以更轻松地开始开发和测试应用，而无需注册这些服务。
这对于完成你的 **Speedrun Ethereum** 来说非常合适。

对于生产级应用，建议你获取自己的 API key（以避免触发速率限制）。你可以在以下位置进行配置：

<Tabs>
<Tab label="Hardhat">

- 🔷`ALCHEMY_API_KEY` 变量：位于 `packages/hardhat/.env` 和 `packages/nextjs/.env.local`。你可以在 [Alchemy 控制台](https://dashboard.alchemy.com/)创建 API key。

- 📃`ETHERSCAN_API_KEY` 变量：位于 `packages/hardhat/.env`，填入你生成的 API key。你可以在[这里](https://etherscan.io/myapikey)获取你的 key。

</Tab>
<Tab label="Foundry">

- 🔷`ALCHEMY_API_KEY` 变量：位于 `packages/foundry/.env` 和 `packages/nextjs/.env.local`。你可以在 [Alchemy 控制台](https://dashboard.alchemy.com/)创建 API key。

- 📃`ETHERSCAN_API_KEY` 变量：位于 `packages/foundry/.env`，填入你生成的 API key。你可以在[这里](https://etherscan.io/myapikey)获取你的 key。

</Tab>
</Tabs>

> 💬 提示：对于线上应用，建议把 nextjs 的环境变量存放在 Vercel/系统的环境变量配置中，而 .env.local 仅用于本地测试。

---

## Checkpoint 13: 📜 合约验证

运行 `yarn verify --network your_network` 命令，在 Etherscan 上验证你的合约 🛰。

👉 在 [Sepolia Etherscan](https://sepolia.etherscan.io/) 上搜索你部署的 `MyUSDEngine` 合约地址，获取要提交到 🏃‍♀️[SpeedRunEthereum.com](https://speedrunethereum.com) 的 URL。

---

> 🎉 恭喜你完成了 MyUSD 稳定币引擎挑战！你已经对去中心化稳定币的运作机制有了宝贵的认识。

> 🏃 前往你的下一个挑战：[这里](https://speedrunethereum.com)。

> 💬 对这套技术栈有问题、疑问或意见？请发到 [🏗 scaffold-eth 开发者聊天群](https://t.me/joinchat/F7nCRK3kI93PoCOk)

## Checkpoint 14: 关于稳定币的更多内容

在最初的单一抵押品 Dai 中，MakerDAO 每周投票设定新的利率。后来，他们彻底改造了整个系统，允许使用多种类型的抵押品，认为这能提高采用率。此后不久，他们推出了锚定稳定模块（Peg Stability Module，PSM），允许任何人用 1 Dai 兑换 1 USDC，这带来了一次重大转变。这是一项颇具争议的改动，因为每一枚 Dai 不再由资产的超额抵押债务仓位作为支撑，而是转而依赖一种随时可能被列入黑名单的中心化稳定币。

与我们在这里探讨的设计相符的其他稳定币系统有 LUSD(BOLD) 和 RAI。它们在其他方面各有取舍，但你应该自己研究一下，看看它们与你刚刚构建的系统相比如何！在构建了这个稳定币系统之后，你已经掌握了充分的背景知识。
