# 💳🌽 超额抵押借贷

![readme-lending](https://raw.githubusercontent.com/scaffold-eth/se-2-challenges/challenge-over-collateralized-lending/extension/packages/nextjs/public/hero.png)

💳 构建你自己的借贷平台。在这个 Speedrun Ethereum 挑战中，我们来编写一个合约：它接收抵押品，并允许你以抵押品的价值为担保借入其他资产。抵押品的价值发生变化时会怎样？如果价值升高，我们就能借更多；如果价值降低，我们还会构建一个用于清算该债务仓位的系统。

<details markdown='1'><summary>❓ 想知道链上借贷是如何运作的吗？在这里阅读概述。</summary>

首先，传统借贷通常是由一方（例如银行）提供资金，另一方同意随时间支付利息以使用这笔资金。这种模式之所以行得通，唯一的原因是出借方有某种办法让借款人承担责任。这需要某种识别借款人身份的方式，以及一套在借款人决定停止支付利息时能帮助解决纠纷的法律体系。在链上世界里，我们（*目前还*）没有可靠的身份识别系统，因此所有借贷都是“超额抵押”的。**借款人必须锁定抵押品才能获得贷款。**“超额抵押”意味着**你借到的价值永远不能超过你存入的价值。**

🤔 我相信你一定在想：“如果借出来的不能比放进去的多，那贷款还有什么好处？”好问题！这种形式的借贷缺少传统借贷中常见的用例——人们可能会用贷款买一套原本负担不起的房子——不过下面是 DeFi 中无需许可的借贷的几个主要用例：

- 💰 保持价格敞口 ~ 你可能有现实世界的账单要付，但你*确信* ETH 从现在开始会升值，为了付账单而卖掉它会让你痛不欲生。你可以用你的 ETH 作抵押借一笔贷款来支付账单。你仍然有锁定的 ETH 可以取回，你要做的只是偿还贷款。
- 📈 杠杆 ~ 你可以存入 ETH 并借入某种资产，但只用它来买更多 ETH，从而增加你对 ETH 价格波动的敞口（无论是上涨 🎢 还是下跌 🔻😰）。
- 💸 税务优势 ~ 在许多司法管辖区，通过贷款获得的资金与通过其他方式获得的资金在税务上的处理方式不同。避免直接卖出资产、转而以它为抵押获得贷款，可能会更有利。

👍 现在你已经了解了链上借贷能做什么、不能做什么的背景知识，让我们开始挑战吧！

</details>

---

💬 Lending 合约接受 ETH 存款，并允许存款人以 CORN 🌽 的形式借款。合约会跟踪每个存款人的地址，并且只有当他们始终保持至少相当于贷款价值 120% 的 ETH 时才允许借款。如果抵押品价值（相对于 CORN）下跌，那么任何人都可以通过偿还贷款来清算该借款人的仓位。清算人有动力这样做，因为他们可以在贷款价值之外再额外获得 10% 的费用。这种激励能“*保证*”贷款在抵押品价值跌破贷款价值的 100% 之前就被平仓，从而避免借贷协议产生坏账（即有人带着价值高于协议中剩余抵押品的借入资产一走了之）。

🌟 最终交付成果是一个应用，它允许任何人以 CORN 的形式借款，同时确保贷款始终有等值的 ETH 作为支撑。
将你的合约部署到测试网，然后构建你的应用并上传到公共 Web 服务器。在 [SpeedRunEthereum.com](https://speedrunethereum.com) 上提交网址！

💬 在 [超额抵押借贷挑战 Telegram 群组](https://t.me/+xQr5d-oVhLMwZmUx) 中结识其他正在做这个挑战的开发者并获得帮助

---

## Checkpoint 0: 📦 环境 📚

🛠️ 开始之前，你需要安装以下工具：

- [Node (v18 LTS)](https://nodejs.org/en/download/)
- Yarn（[v1](https://classic.yarnpkg.com/en/docs/install/) 或 [v2+](https://yarnpkg.com/getting-started/install)）
- [Git](https://git-scm.com/downloads)
- [Foundry](https://book.getfoundry.sh/getting-started/installation)（仅在选择 Foundry 作为框架时需要）

📥 然后把挑战下载到你的电脑上，并运行以下命令安装依赖：

```sh
npx create-eth@2.0.23 -e challenge-over-collateralized-lending challenge-over-collateralized-lending
cd challenge-over-collateralized-lending
```

出现提示时，选择你偏好的框架（Hardhat 或 Foundry）。

> 💻 在同一个终端中，启动你的本地网络（运行在你电脑上的区块链模拟器）：

```sh
yarn chain
```

> 🛰️ 在第二个终端窗口中，🛰 （在本地）部署你的合约：

```sh
cd challenge-over-collateralized-lending
yarn deploy
```

> 📱 在第三个终端窗口中，启动你的 📱 前端：

```sh
cd challenge-over-collateralized-lending
yarn start
```

📱 打开 http://localhost:3000 查看应用。

> _注意：截图中的界面可能与当前版本略有不同。_

> 👩‍💻 每当你想把合约改动部署到前端时，先重启 `yarn chain`，然后重新运行 `yarn deploy`。运行 `yarn deploy --reset` 可以进行一次全新部署，即使合约没有改动也是如此。

---

⚠️ 我们已通过 `.vscode/settings.json` 禁用了 Cursor 的自动建议（Tab 补全和预测），以减少你编码时的干扰。AI 聊天和智能体（agent）功能仍然可用，并且我们提供了包含项目上下文的 `AGENTS.md` 和 `CLAUDE.md` 文件，帮助 AI 助手理解代码库。

🔒 想禁用 AI、一切亲力亲为？（推荐这样做，以便更深入地学习）：

- Cursor：在项目根目录的 `.cursorignore` 文件中添加 `*`
- VSCode：在 `.vscode/settings.json` 文件中将 `chat.disableAIFeatures` 设置为 `true`

---

## 🤖 AI 引导学习模式（可选）

想要一位在你编码时给你讲解概念的交互式导师吗？本挑战支持 **AI 引导学习模式**！

1. 在 **Claude Code** 或 **Cursor** 等 AI 编程工具中打开本项目
2. 运行 `/start` 命令
3. AI 导师会讲解每个概念，然后给你布置一个编码任务
4. 你编写代码，然后说 **"check"**，AI 就会运行测试
5. 说 **"hint"** 获取帮助；如果你想让 AI 直接展示答案，就使用 **`/skip`**
6. 你的进度会被保存——随时可以使用 `/start` 继续

AI 不会直接把答案告诉你——它会先讲解，再让你自己实现代码。测试会验证你的成果，如果有测试没通过，AI 会帮你调试。

---

## Checkpoint 1: 💳🌽 Lending 合约

一个借贷平台需要以下三个主要功能：

1. 出借
2. 借款
3. 清算

在这个挑战中，我们对出借方面的关注不会像另外两个方面那么多。我们假设人们已经向 Lending 合约提供了可供借入的 CORN。在真实系统中，借款人需要为贷款支付利息，这样出借人才有动力存入资产，但在这里我们只关注市场的借款端。

🔍 切换到 `Debug Contracts` 标签页，你应该能看到四个智能合约，分别是 `Corn`、`CornDEX`、`Lending` 和 `MovePrice`。除了 `Lending` 之外，其他的你都不用操心，不过下面是每个合约的简要说明：

- 🌽 Corn ~ 这是可供借入的 ERC20 代币
- 🔄 CornDEX ~ 这是用于在 ETH 和 CORN 之间兑换的 DEX 合约，同时也被用作一个临时凑合的价格预言机
- 💰 Lending ~ 这是负责存入抵押品、创建贷款以及清算处于不良仓位的贷款的合约
- 📊 MovePrice ~ 这个合约仅用于在 DEX 中进行大额兑换以改变资产比例，从而改变 DEX 报告的价格

<Tabs>
<Tab label="Hardhat">

📁 `packages/hardhat/contracts/Lending.sol` 是你将花费大部分时间的地方。

</Tab>
<Tab label="Foundry">

📁 `packages/foundry/contracts/Lending.sol` 是你将花费大部分时间的地方。

</Tab>
</Tabs>

> 🖥️ 下面是你的智能合约中还没有任何实现代码时前端的样子。按钮很可能会出错，因为还没有与之关联的函数！

![DefaultView](https://github.com/user-attachments/assets/58feae80-dbcb-49db-9d7d-4a4bf9cc7766)

> 🔍 查看 `Lending.sol` 中的空函数，了解每个函数的方方面面。如果你能解释各个函数之间将如何协同工作，那就太棒了！😎

---

### 🥅 目标

- [ ] 📝 查看 `Lending.sol` 中的所有函数，设想它们可能如何协同工作。

---

## Checkpoint 2: ➕ 添加和移除抵押品

> 📈 Lending 合约很天真地直接使用一个 CORN/ETH DEX 合约返回的价格。这让你可以很容易地通过大额兑换“推动市场”来改变 CORN 的价格。在此向 [DEX 挑战](https://github.com/scaffold-eth/se-2-challenges/blob/challenge-4-dex/README.md) 致敬！在生产级系统中，把 DEX 作为唯一的价格预言机是绝对行不通的，但它有助于演示影响借贷协议的各种不同市场状况。

👀 我们来看看 `Lending.sol` 中的 `addCollateral` 函数。

⚠️ 如果有人调用它时没有附带任何 value，它应该以 `Lending_InvalidAmount()` 回滚（revert）。

📝 它需要把发送给它的任何 value 记录为发送者存入的抵押品，记到一个已有的名为 `s_userCollateral` 的 mapping 中。

📢 我们还要触发 `CollateralAdded` 事件，参数为存款人地址、存入的金额，以及 `i_cornDEX.currentPrice()`（即当前以 CORN 计价的 ETH 价值）。

> ⚠️ 我们在每个事件中都附带 DEX 返回的价格，仅仅是为了让前端能够正确地进行可视化展示。

<details markdown='1'><summary>🔎 提示</summary>

> 📋 这个方法也非常简单，试着按照描述自己解决，当你觉得完成了，再与下面的参考答案进行对比。

<details markdown='1'><summary>参考答案代码</summary>

```solidity
    function addCollateral() public payable {
        if (msg.value == 0) {
            revert Lending__InvalidAmount(); // 如果没有发送抵押品则回滚
        }
        s_userCollateral[msg.sender] += msg.value; // 更新用户的抵押品余额
        emit CollateralAdded(msg.sender, msg.value, i_cornDEX.currentPrice()); // 触发添加抵押品的事件
    }
```

</details>
</details>

👍 很好！现在我们来看 `withdrawCollateral` 函数。总不能让存进去的资金取不回来吧？！

⚠️ 如果有人在使用该函数时把 `amount` 参数设为 0，就在函数一开始以 `Lending_InvalidAmount()` 回滚。如果发送者没有其所请求的 `amount` 数量的抵押品，我们也要回滚。

💰 现在减少发送者（在 mapping 中）的抵押品，并把它发回发送者的地址。

📢 触发 `CollateralWithdrawn` 事件，参数为发送者的地址、提取的金额以及 DEX 的 `currentPrice`。

<details markdown='1'><summary>🔎 提示</summary>

> 📋 这个方法也非常简单，试着按照描述自己解决，当你觉得完成了，再与下面的参考答案进行对比。

<details markdown='1'><summary>参考答案代码</summary>

```solidity
    function withdrawCollateral(uint256 amount) public {
        if (amount == 0 || s_userCollateral[msg.sender] < amount) {
            revert Lending__InvalidAmount(); // 如果金额无效则回滚
        }

        // 减少用户的抵押品
        uint256 newCollateral = s_userCollateral[msg.sender] - amount;
        s_userCollateral[msg.sender] = newCollateral;

        // 将抵押品转给用户
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        if (!success) {
            revert Lending__TransferFailed();
        }

        emit CollateralWithdrawn(msg.sender, amount, i_cornDEX.currentPrice()); // 触发提取抵押品的事件
    }
```

</details>
</details>

🎉 太棒了！使用 `yarn deploy --reset` 重新部署你的合约。我们希望对所有合约进行一次全新部署，以便它们各自都拿到正确的构造函数参数。现在在前端试试你的方法，看看是否需要做任何修改。

<Tabs>
<Tab label="Hardhat">

> 🧪 运行本 Checkpoint 的测试：`yarn test --grep "Collateral Operations"`

</Tab>
<Tab label="Foundry">

> 🧪 运行本 Checkpoint 的测试：`yarn test --match-test "test_Collateral_"`

</Tab>
</Tabs>

💰 别忘了从水龙头（faucet）给自己领一些 ETH！

![faucet](https://github.com/user-attachments/assets/e8b8ac20-19fa-45d4-bc5a-8049ac04487e)

---

### 🥅 目标

- [ ] 🧪 你能添加抵押品和提取抵押品吗？
- [ ] 🖥️ 每次操作后前端都会更新吗？

---

## Checkpoint 3: 🫶 辅助方法

🧩 现在我们需要添加四个方法，我们会在其他函数中用它们来获取用户债务仓位的各种详细信息。

🔢 我们从 `calculateCollateralValue` 开始。这个函数接收相关用户的地址，并返回一个 uint256，表示以 CORN 计价的 ETH 抵押品价值。

💡 我们知道如何获取用户的抵押品，也知道以 CORN 计的价格由 `i_cornDEX.currentPrice()` 返回。你能想出如何返回以 CORN 计价的抵押品价值吗？

<details markdown='1'><summary>🔎 提示</summary>

> 🧮 这个方法只需要返回用户的抵押品乘以 CORN 的价格（`i_cornDEX.currentPrice()`），再*除以 1e18*（因为 CORN 有这么多位小数）。

<details markdown='1'><summary>参考答案代码</summary>

```solidity
    function calculateCollateralValue(address user) public view returns (uint256) {
        uint256 collateralAmount = s_userCollateral[user]; // 获取用户的抵押品数量
        return (collateralAmount * i_cornDEX.currentPrice()) / 1e18; // 计算以 CORN 计价的抵押品价值
    }
```

</details>
</details>

🔄 让我们把注意力转向内部（internal）view 函数 `_calculatePositionRatio`。

📊 这个函数接收一个用户地址，并返回我们所说的“仓位比率”（position ratio）。它是抵押品相对于借入资产的百分比，但有一点需要注意：返回的是该百分比 \* 1e18。换句话说，如果抵押率百分比是 133，那么返回值就是 133000000000000000000。我们这样做是为了获得更高的精度。试着自己算出其中的数学关系。

<details markdown='1'><summary>🔎 提示</summary>

> 📝 它需要返回抵押品的价值（以 CORN 计价）除以借入的数量。

<details markdown='1'><summary>参考答案代码</summary>

```solidity
    function _calculatePositionRatio(address user) internal view returns (uint256) {
        uint borrowedAmount = s_userBorrowed[user]; // 获取用户的借款数量
        uint collateralValue = calculateCollateralValue(user); // 计算用户的抵押品价值
        if (borrowedAmount == 0) return type(uint256).max; // 如果没有借入 CORN，则返回最大值
        return (collateralValue * 1e18) / borrowedAmount; // 计算仓位比率
    }
```

</details>
</details>

🫗 现在我们来补全 `isLiquidatable` 的细节。这个函数应返回一个 bool，表示仓位比率是否低于 `COLLATERAL_RATIO`。看看你能否不看提示就实现其中的逻辑。

<details markdown='1'><summary>🔎 提示</summary>

> 🎯 我们可以用刚刚编写的 `_calculatePositionRatio` 函数获取当前比率。然后只需将它与 COLLATERAL_RATIO 做一个简单的比较，确保我们没有低于可接受的清算阈值。

<details markdown='1'><summary>参考答案代码</summary>

```solidity
    function isLiquidatable(address user) public view returns (bool) {
        uint256 positionRatio = _calculatePositionRatio(user); // 计算用户的仓位比率
        if (positionRatio == type(uint256).max) return false;
        return (positionRatio * 100) < COLLATERAL_RATIO * 1e18; // 检查仓位是否不安全
    }
```

</details>
</details>

✅ 最后，我们来补全一个名为 `_validatePosition` 的简单函数。这个函数只有一个用途：如果用户的仓位可被清算（`isLiquidatable` 恰好返回我们需要的结果），就以 `Lending_UnsafePositionRatio` 回滚。之后，在更新用户的借入资产余额后，凡是需要验证用户的仓位比率没有变为可清算状态的地方，我们都可以使用这个函数。

<details markdown='1'><summary>参考答案代码</summary>

```solidity
    function _validatePosition(address user) internal view {
        if (isLiquidatable(user)) {
            revert Lending__UnsafePositionRatio();
        }
    }
```

</details>

---

### 🥅 目标

- [ ] 🧠 你明白为什么我们需要把所有数值都乘以/除以 1e18 吗？（搜索关键词：Solidity precision loss）
- [ ] 👀 浏览一下其他方法，试着预测我们可能会在哪里用到这些方法

---

## Checkpoint 4: 🌽 来借一些 CORN 吧！

<Tabs>
<Tab label="Hardhat">

> 💡 由于我们在上一步添加了那些复杂的辅助函数，当你卡住、想知道执行每个函数时发生了什么时，导入 "hardhat/console.sol" 并使用 console.log 可能会很有帮助。

</Tab>
<Tab label="Foundry">

> 💡 由于我们在上一步添加了那些复杂的辅助函数，当你卡住、想知道执行每个函数时发生了什么时，导入 "forge-std/console2.sol" 并使用 console2.log 可能会很有帮助。

</Tab>
</Tabs>

👀 找到 `borrowCorn` 函数。

⚠️ 如果有人调用它时没有提供 `borrowAmount`，它应该以 `Lending_InvalidAmount()` 回滚。

📝 它应该把借入的数量加到 `s_userBorrowed` mapping 中该用户的余额上。

✅ 它应该验证用户的仓位（`_validatePosition`），这样当用户试图借入超过允许的数量时就会回滚。

🪙 然后它应该使用 CORN 代币的 `transferFrom` 函数把代币转到用户的地址。

> ⚠️ 正如上面提到的，我们只关注市场的借款端。我们只是“假装”人们已经怀着获利的目的把 CORN 存入了 Lending 合约，但我们并没有为他们这样做提供任何真正的激励。

📢 你还应该触发 `AssetBorrowed` 事件。

👌 完美！现在我们去补全 `repayCorn` 函数。

⚠️ 如果 repayAmount 为 0，或者超过了用户已借入的数量，就以 `Lending_InvalidAmount` 回滚。

🔄 从 `s_userBorrowed` mapping 中减去该数量。然后使用 CORN 代币的 `transferFrom` 函数把 CORN 从借款人的钱包转回 Lending 合约。

📢 最后，触发 `AssetRepaid` 事件。

🔄 运行 `yarn deploy --reset`，这样你就可以在前端试玩借款和还款了。你可以通过按右上角 CORN 价格下方的 + 和 - 按钮来调整 CORN 的价格。观察你当前持有仓位的抵押品价值如何随价格变动而变化。

<Tabs>
<Tab label="Hardhat">

> 🧪 运行本 Checkpoint 的测试：`yarn test --grep "Borrowing Operations|Repayment Operations"`

</Tab>
<Tab label="Foundry">

> 🧪 运行本 Checkpoint 的测试：`yarn test --match-test "test_(Borrowing|Repayment)_"`

</Tab>
</Tabs>

<details><summary>参考答案代码</summary>

```solidity
    function borrowCorn(uint256 borrowAmount) public {
        if (borrowAmount == 0) {
            revert Lending__InvalidAmount(); // 如果借款数量为零则回滚
        }
        s_userBorrowed[msg.sender] += borrowAmount; // 更新用户借入的 CORN 余额
        _validatePosition(msg.sender); // 借款前验证用户的仓位
        bool success = i_corn.transfer(msg.sender, borrowAmount); // 将借入的 CORN 发送给用户
        if (!success) {
            revert Lending__BorrowingFailed(); // 如果转账失败则回滚
        }
        emit AssetBorrowed(msg.sender, borrowAmount, i_cornDEX.currentPrice()); // 触发借款事件
    }

    function repayCorn(uint256 repayAmount) public {
        if (repayAmount == 0 || repayAmount > s_userBorrowed[msg.sender]) {
            revert Lending__InvalidAmount(); // 如果还款数量无效则回滚
        }
        s_userBorrowed[msg.sender] -= repayAmount; // 减少用户的借款余额
        bool success = i_corn.transferFrom(msg.sender, address(this), repayAmount); // 从用户处收取 CORN
        if (!success) {
            revert Lending__RepayingFailed(); // 如果销毁失败则回滚
        }
        emit AssetRepaid(msg.sender, repayAmount, i_cornDEX.currentPrice()); // 触发还款事件
    }
```

</details>

---

### 🥅 目标

- [ ] 🧪 你能借入和偿还 CORN 吗？在尝试还款之前，别忘了授权 Lending 合约使用你的 CORN。
- [ ] ❓ 如果你在没有足够代币的情况下还款会发生什么？你妥善处理这种情况了吗？（抛出 `Lending__RepayingFailed` 可能是个不错的选择……）
- [ ] 🛑 你能借入超过抵押品价值 120% 的数量吗？如果你这样尝试，交易应该会回滚……

---

## Checkpoint 5: 📉 清算机制

🏦 现在我们有办法存入抵押品并以其为担保借款了。太好了！但如果我们抵押品的价值下跌、越过了清算阈值，会发生什么呢？

🔨 我们需要一个清算机制！这个函数将清算借款人（其地址作为参数传入）的贷款，但调用者必须有足够的 CORN 来偿还这笔贷款。贷款偿还后，调用者会获得价值相当于其所用 CORN + 10% 的 ETH。这些 ETH 来自借款人存入的抵押品。本质上，借款人因让自己的贷款陷入可被清算的状态而被收取了 10% 的费用。清算人出于一种天然的激励而行动：从 DEX 获取一些 CORN（或者自己去借一笔贷款），清算该贷款，并赚取 10% 的利润。

🔍 我们来看 `liquidate` 函数。我们希望当某个仓位可被清算时，任何人都可以调用这个函数。调用者必须有足够的 CORN 来偿还债务。这个函数应当移除借款人的债务，以及覆盖该债务所需数量的抵押品。

⚠️ 首先，确保在用户仓位不可清算时以 `Lending__NotLiquidatable` 回滚。

❕ 另外，还要确保调用者有足够的 CORN 来清算借款人的仓位。如果没有，就以 `Lending__InsufficientLiquidatorCorn` 回滚。

🔄 把 CORN 从清算人那里转到本合约（`transferFrom`）。

🧹 彻底清除借款人的债务。

🧮 计算覆盖已销毁 CORN 的价值所需的抵押品数量，并将其从借款人的抵押品中扣除。

> 💡 请记住，仅仅有清算机制是不够的。我们还需要激励人们去触发它！通过分给清算人可观的一部分资金，并在抵押品价值仍比贷款实际价值高出 20% 时就允许清算，我们提供了基于激励的有力保证，确保协议不会产生坏账。

> ⚠️ 我们做了简化，没有添加任何 APY 激励（以及与之相对的借款费用）。在真实的借贷市场中，这些都是重要的激励机制：它们鼓励人们提供抵押品，或促使借款人偿还那些因抵押品不够安全或接近清算阈值而需要支付高 APR 的贷款，从而帮助保持市场平衡。这些费用也是添加协议创收逻辑的好地方：从借款 APR 中抽取一部分累积给协议的代币，其余部分再转给供应方。这些激励机制与清算系统一起，帮助确保抵押品的价值始终高于借出的价值。

💰 现在把 `LIQUIDATOR_REWARD` 作为一个百分比加到抵押品之上（但绝不能超过借款人的全部抵押品），这样清算人就有充分的动力去清算那个可怜的借款人。

💸 把这部分抵押品转给清算人。

📢 最后触发 `Liquidation` 事件。

<details markdown='1'><summary>参考答案代码</summary>

```solidity
    function liquidate(address user) public {
        if (!isLiquidatable(user)) {
            revert Lending__NotLiquidatable(); // 如果仓位不可清算则回滚
        }

        uint256 userDebt = s_userBorrowed[user]; // 获取用户的借款数量

        if (i_corn.balanceOf(msg.sender) < userDebt) {
            revert Lending__InsufficientLiquidatorCorn();
        }

        uint256 userCollateral = s_userCollateral[user]; // 获取用户的抵押品余额
        uint256 collateralValue = calculateCollateralValue(user); // 计算用户的抵押品价值

        // 将与债务等值的 CORN 转入合约
        i_corn.transferFrom(msg.sender, address(this), userDebt);

        // 清除用户的债务
        s_userBorrowed[user] = 0;

        // 计算要购买的抵押品数量（保持债务与抵押品价值之间的比例）
        uint256 collateralPurchased = (userDebt * userCollateral) / collateralValue;
        uint256 liquidatorReward = (collateralPurchased * LIQUIDATOR_REWARD) / 100;
        uint256 amountForLiquidator = collateralPurchased + liquidatorReward;
        amountForLiquidator = amountForLiquidator > userCollateral ? userCollateral : amountForLiquidator; // 确保不超过用户的抵押品

        s_userCollateral[user] = userCollateral - amountForLiquidator;

        // 将覆盖债务所需抵押品的 110% 转给清算人
        (bool success,) = payable(msg.sender).call{ value: amountForLiquidator }("");
        if (!success) {
            revert Lending__TransferFailed();
        }

        emit Liquidation(user, msg.sender, amountForLiquidator, userDebt, i_cornDEX.currentPrice());
    }
```

</details>

🔄 流程你已经熟悉了。运行 `yarn deploy --reset`，这样你就可以在前端尝试清算了。打开一个浏览器隐私标签页并访问 `localhost:3000` 可能会很有用，这样你就可以模拟多个账户。你也可以先借款，然后切换钱包，使用 CORN 钱包（屏幕右侧）中的兑换（swap）按钮获取一些 CORN。接着使用 CORN 价格模块中的价格控件调整价格，然后清算该借款人。

<Tabs>
<Tab label="Hardhat">

> 🧪 运行本 Checkpoint 的测试：`yarn test --grep "Liquidation"`

</Tab>
<Tab label="Foundry">

> 🧪 运行本 Checkpoint 的测试：`yarn test --match-test "test_Liquidation_"`

</Tab>
</Tabs>

🫴 注意，借款人在被清算后仍然持有他们借入的 CORN。他们可以保留这些 CORN，因为清算人已经代表他们把 CORN 债务偿还给了协议。

---

### 🥅 目标

- [ ] 🤔 只要人们遵循激励机制行事，协议是否会出现贷款支撑不足 100% 的情况？看看 [Aave](https://blockworks.co/news/aave-curve-exposure) 发生过的这种情况
- [ ] ❓ 当清算人没有足够的 CORN 来偿还贷款时会发生什么？它会像预期的那样回滚吗？

---

## Checkpoint 6: 收尾工作与模拟

🔙 回到 `withdrawCollateral` 函数。如果借款人提取的抵押品超出了安全的仓位比率，会发生什么？你应该添加一个 `_validatePosition` 检查，确保这种情况永远不会发生。你应该把它加在 `s_userCollateral` mapping 更新之后，这样它检查的是最终状态，而不是当前状态。如果借款人没有借入任何 CORN，就跳过这项检查。

<Tabs>
<Tab label="Hardhat">

> 🧪 运行本 Checkpoint 的测试：`yarn test --grep "should prevent withdrawing collateral if it makes the position liquidatable"`

</Tab>
<Tab label="Foundry">

> 🧪 运行本 Checkpoint 的测试：`yarn test --match-test "test_Withdraw_"`

</Tab>
</Tabs>

🎉 干得好！你的合约已经具备了帮助人们获得 CORN 贷款所需的全部功能。

🍨 现在你将看到一些非常特别的东西。像往常一样运行 `yarn deploy --reset`，然后运行：

```sh
yarn simulate
```

这个命令会启动多个机器人账户，它们会开始使用你的借贷平台！在它们运行的同时，打开前端看看并与之交互吧！

<Tabs>
<Tab label="Hardhat">

你可以查看 `packages/hardhat/scripts/marketSimulator.ts`，调整默认设置或修改机器人账户的逻辑。

</Tab>
<Tab label="Foundry">

你可以查看 `packages/foundry/scripts-js/simulate/marketSimulator.js`，调整默认设置或修改机器人账户的逻辑。

</Tab>
</Tabs>

> 👇 继续前进，试着挑战这些可选的超硬核支线任务。前端没有专门用于这些支线任务的组件，但你可以通过 Debug 标签页来使用它们

### ⚔️ 支线任务 1：闪电贷（Flash Loans）

🤔 如果你可以借入任意数量的 CORN，只要在交易结束前还回来就行，会怎么样？这正是闪电贷所做的事！闪电贷是一种只有在链上才能实现的全新金融原语。

💡 让我们来实现一个免手续费的闪电贷函数！

🧩 在实现逻辑之前，我们需要创建一个名为 `IFlashLoanRecipient` 的新接口。你可以把它定义在 `Lending` 合约的下方，但放在同一个文件中。它应该有一个名为 `executeOperation` 的函数，接收以下参数：`uint256 amount, address initiator, address extraParam`，并返回一个 bool。

<details markdown='1'><summary>🧩 接口代码</summary>

```solidity
contract Lending is Ownable {
    // ...
    // 现有代码
    // ...
}

// 放在下方，这样就不必从另一个文件导入
interface IFlashLoanRecipient {
    function executeOperation(uint256 amount, address initiator, address extraParam) external returns (bool);
}
```

</details>

📝 `Lending.sol` 中目前没有 `flashLoan` 函数，但我们正需要在那里添加一个。动手定义一个 public 函数吧。它应该接收以下参数：

- 📋 `IFlashLoanRecipient _recipient`：这是因为贷款接收方必须是一个遵循 `IFlashLoanRecipient` 接口的合约——而不是你的 EOA（外部账户）。稍后你就会明白原因
- 💰 `uint256 _amount`：要发送给接收方合约的 CORN 数量
- 🔗 `address _extraParam`：在真实的闪电贷函数中，这很可能是一个包含多个可选属性的结构体，允许人们向接收方合约传递任意数据。可以在[这里](https://github.com/aave-dao/aave-v3-origin/blob/083bd38a137b42b5df04e22ad4c9e72454365d0d/src/contracts/protocol/libraries/logic/FlashLoanLogic.sol#L184)查看 Aave 的实现

🪙 该方法内部的逻辑需要把参数中给定数量的 CORN `transfer` 到接收方地址——也就是遵循 IFlashLoanRecipient 接口的那个合约。

🔄 接着它会调用接收方合约上的 `executeOperation` 函数，并确保其返回 `true`。

⬇️ 然后我们使用 Corn 代币的 `transferFrom` 方法，取回在函数开头发送出去的 CORN：从一开始接收代币的 `_recipient` 合约地址把它们取回。如果对方没有足够的代币，或者没有授权 Lending 合约使用这些代币，那么在我们尝试取回代币时，这个方法就会回滚。一旦回滚，CORN 就相当于从未被发送给接收方——不存在代币被盗的风险。

<details markdown='1'><summary>参考答案代码</summary>

```solidity
    function flashLoan(IFlashLoanRecipient _recipient, uint256 _amount, address _extraParam) public {
        // 把贷款发送给接收方——不需要抵押品，因为它会在同一笔交易中全部偿还
        i_corn.transfer(address(_recipient), _amount);

        // 执行操作
        bool success = _recipient.executeOperation(_amount, msg.sender, _extraParam);
        require(success, "Operation was unsuccessful");

        // 收回贷款——如果对方余额不足，应当回滚
        i_corn.transferFrom(address(_recipient), address(this), _amount);
    }
```

</details>

🏗️ 现在我们需要创建一个合约，用闪电贷借来的 CORN 做点事情。让我们创建一个合约，使你无需持有 CORN 代币也能清算贷款。

> ❕ 请记住，这只是使用 `flashLoan` 函数的一个例子。你还可以用闪电贷构建更多东西！

📝 新建一个合约文件，命名为 `FlashLoanLiquidator.sol`

🧩 看看你能否在一个名为 `executeOperation` 的函数中写出清算贷款的正确逻辑。在清算仓位并收到 ETH 之后，它需要利用 DEX 把 ETH 兑换成 CORN，以偿还 CORN 贷款。别忘了，你需要 `approve` Lending 合约，使其能够 _同时_ 使用清算中用到的 CORN 和偿还闪电贷所需的 CORN。
在清算贷款、并把收到的 ETH 兑换成偿还所需的准确数量的 CORN 之后，合约应把剩余的所有 ETH 发回给 `flashLoan` 函数的最初发起者。

💰 别忘了让合约能够 `receive()` 以太币！

<details markdown='1'><summary>📄 FlashLoanLiquidator 合约代码</summary>

下面是实现它的一个示例：

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { Lending } from "./Lending.sol";
import { CornDEX } from "./CornDEX.sol";
import { Corn } from "./Corn.sol";

/**
 * @notice 仅用于支线任务
 * @notice 该合约用于清算不安全的仓位：先通过闪电贷借入 CORN 来清算该仓位，
 * 然后把返还的 ETH 兑换成 CORN，用于偿还闪电贷
 */
contract FlashLoanLiquidator {
    Lending i_lending;
    CornDEX i_cornDEX;
    Corn i_corn;

    constructor(address _lending, address _cornDEX, address _corn) {
        i_lending = Lending(_lending);
        i_cornDEX = CornDEX(_cornDEX);
        i_corn = Corn(_corn);
        // 授权 Lending 合约花费这些代币
        i_corn.approve(address(i_lending), type(uint256).max);
    }

    function executeOperation(uint256 amount, address initiator, address toLiquidate) public returns (bool) {
        // 先进行清算，以获得抵押品代币
        i_lending.liquidate(toLiquidate);

        // 计算恰好获得 'amount' 数量代币所需输入的 ETH 数量
        uint256 ethReserves = address(i_cornDEX).balance;
        uint256 tokenReserves = i_corn.balanceOf(address(i_cornDEX));
        uint256 requiredETHInput = i_cornDEX.calculateXInput(amount, ethReserves, tokenReserves);

        // 执行兑换，使我们恰好拥有偿还闪电贷所需的数量
        i_cornDEX.swap{value: requiredETHInput}(requiredETHInput); // 用 ETH 兑换代币

        // 把剩余的 ETH 发回给发起者
        if (address(this).balance > 0) {
            (bool success, ) = payable(initiator).call{value: address(this).balance}("");
            require(success, "Failed to send ETH back to initiator");
        }

        return true;
    }

    receive() external payable {}
}

```

</details>

<Tabs>
<Tab label="Hardhat">

📋 现在你需要把新合约添加到部署脚本中。只需把它加在 `packages/hardhat/deploy/00_deploy_contracts.ts` 中所有现有逻辑的下方即可。

<details markdown='1'><summary>🚀 部署代码</summary>

```typescript
const deployContracts: DeployFunction = async function (
  hre: HardhatRuntimeEnvironment,
) {
  // 所有现有逻辑...

  await deploy("FlashLoanLiquidator", {
    from: deployer,
    args: [lending.address, cornDEX.target, cornToken.target],
    log: true,
    autoMine: true,
  });
};
```

</details>

</Tab>
<Tab label="Foundry">

📋 在 `packages/foundry/script/DeployLending.s.sol` 中添加 import 语句和部署代码。

<details markdown='1'><summary>🚀 部署代码</summary>

```solidity
// 添加到 import 部分
import "../contracts/FlashLoanLiquidator.sol";

// 在 run() 函数内部、现有部署代码之后：
FlashLoanLiquidator flashLoanLiquidator = new FlashLoanLiquidator(
    address(lending), address(cornDEX), address(corn)
);
console.logString(string.concat("FlashLoanLiquidator deployed at: ", vm.toString(address(flashLoanLiquidator))));
```

</details>

</Tab>
</Tabs>

🔄 运行 `yarn deploy --reset`。

📊 创建一个接近清算线的债务仓位，然后提高 CORN 的价格，直到该仓位可以被清算。

🚀 然后进入 Debug 标签页，调用 `Lending.flashLoan` 方法：把你的 `FlashLoanLiquidator` 合约地址作为 `recipient`，把清算所需的 CORN 数量作为 `amount`，把借款人的地址作为 `extraParam`。

🎉 很酷吧？你无需持有用于偿还贷款的 CORN 就能清算任何仓位！这不仅意味着你可以在没有 CORN 的情况下进行清算，还意味着即使你 _没有足够的价值（ETH 或 CORN）_ 来覆盖借出的 CORN 总额，也能完成清算。

### ⚔️ 支线任务 2：通过“借款 > 兑换 > 存入”迭代循环实现最大杠杆

🤔 如果你认为 CORN 相对于 ETH 的价格会下跌呢（_你到底为什么会这么想！？_ 🤣）？你可以借入 CORN，然后在 DEX 上用这些 CORN 买入更多 ETH。但是等等！现在你有了更多 ETH，理论上你可以 _再次_ 把它用作抵押品，然后借入更多 CORN、兑换成 ETH，并尽可能多次地重复这个过程。

🔄 你现在已经可以手动完成这些操作了，但如果我们创建一个合约，提供一些让这件事变得简单的方法呢？

🏗️ 我们先在 `Lending.sol` 合约中添加几个辅助方法。

📋 首先，添加一个名为 `getMaxBorrowAmount` 的方法，它接收一个 uint256，表示我们要存入的 ETH 数量，并返回我们预计能借到的 CORN 最大数量。先试着不看下面的参考答案自己写出来，遇到问题再对照参考答案。

<details markdown='1'><summary>参考答案代码</summary>

```solidity
    function getMaxBorrowAmount(uint256 ethCollateralAmount) public view returns (uint256) {
        if (ethCollateralAmount == 0) return 0;

        // 以 CORN 计价计算抵押品价值
        uint256 collateralValue = (ethCollateralAmount * i_cornDEX.currentPrice()) / 1e18;

        // 在维持所需抵押率的前提下计算最大借款数量
        return (collateralValue * 100) / COLLATERAL_RATIO;
    }
```

</details>

📋 接下来再添加一个方法，它会在我们拆解仓位时派上用场。

创建一个名为 `getMaxWithdrawableCollateral` 的函数，它接收一个地址，表示我们要查询的用户。它应返回一个 uint256，表示该账户作为抵押品存入的 ETH 中，在不使仓位进入可清算状态的前提下可以提取的数量。试着自己写出来，不过也可以随时偷看下面的参考答案。

<details markdown='1'><summary>参考答案代码</summary>

```solidity
    function getMaxWithdrawableCollateral(address user) public view returns (uint256) {
        uint256 borrowedAmount = s_userBorrowed[user];
        uint256 userCollateral = s_userCollateral[user];
        if (borrowedAmount == 0) return userCollateral;

        uint256 maxBorrowedAmount = getMaxBorrowAmount(userCollateral);
        if (borrowedAmount == maxBorrowedAmount) return 0;

        uint256 potentialBorrowingAmount = maxBorrowedAmount - borrowedAmount;
        uint256 ethValueOfPotentialBorrowingAmount = (potentialBorrowingAmount * 1e18) / i_cornDEX.currentPrice();

        return (ethValueOfPotentialBorrowingAmount * COLLATERAL_RATIO) / 100;
    }
```

</details>

🔄 现在我们来创建一个新合约，它会利用这些新的 view 函数进行“while 循环”，直到触发停止条件。

📝 在 contracts 目录中新建一个名为 `Leverage.sol` 的文件，并把以下代码复制进去：

<details><summary>参考答案代码</summary>

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import { Lending } from "./Lending.sol";
import { CornDEX } from "./CornDEX.sol";
import { Corn } from "./Corn.sol";

/**
 * @notice 仅用于支线任务
 * @notice 该合约用于给用户的仓位加杠杆：先从 Lending 合约借入 CORN，
 * 然后从 DEX 借入更多 CORN 来偿还最初的借款，如此反复，直到用户借到想要的数量为止
 */
contract Leverage {
    Lending i_lending;
    CornDEX i_cornDEX;
    Corn i_corn;
    address public owner;

    event LeveragedPositionOpened(address user, uint256 loops);
    event LeveragedPositionClosed(address user, uint256 loops);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can call this function");
        _;
    }

    constructor(address _lending, address _cornDEX, address _corn) {
        i_lending = Lending(_lending);
        i_cornDEX = CornDEX(_cornDEX);
        i_corn = Corn(_corn);
        // 授权 DEX 和 Lending 花费用户的 CORN
        i_corn.approve(address(i_cornDEX), type(uint256).max);
        i_corn.approve(address(i_lending), type(uint256).max);
    }

    /**
     * @notice 认领合约的所有权，这样其他人就无法更改你的仓位或提取你的资金
     */
    function claimOwnership() public {
        owner = msg.sender;
    }

    /**
     * @notice 开立杠杆仓位：迭代地借入 CORN、将其兑换成 ETH，并添加为抵押品
     * @param reserve 为防止被清算而作为储备保留在合约中的 ETH 数量
     */
    function openLeveragedPosition(uint256 reserve) public payable onlyOwner {
        uint256 loops = 0;
        while (true) {
            // 在这里编写更多代码
            loops++;
        }
        emit LeveragedPositionOpened(msg.sender, loops);
    }

    /**
     * @notice 关闭杠杆仓位：迭代地提取抵押品、将其兑换成 CORN 并偿还 Lending 合约，直到仓位关闭
     */
    function closeLeveragedPosition() public onlyOwner {
        uint256 loops = 0;
        while (true) {
            // 在这里编写更多代码
            loops++;
        }
        emit LeveragedPositionClosed(msg.sender, loops);
    }

    /**
     * @notice 从合约中提取 ETH
     */
    function withdraw() public onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No balance to withdraw");
        (bool success, ) = payable(msg.sender).call{value: balance}("");
        require(success, "Failed to send Ether");
    }

    receive() external payable {}
}
```

</details>

🧩 试着补全开立和关闭杠杆仓位这两个函数中的“while 循环”。

📝 注意，`openLeveragedPosition` 是 payable 的，它期望接收调用者想要存入的全部 ETH。唯一的参数是一个 uint256，表示调用者希望循环结束后剩余作为抵押品的 ETH 数量。如果不指定，贷款将恰好停在清算阈值上，CORN 价格哪怕最微小的上涨都可能导致你被清算。

🔄 while 循环应该先向 `Lending` 合约添加抵押品，然后借入最大数量的 CORN，再用 DEX 把这些 CORN 兑换成更多 ETH，之后循环就可以再次进行。只要确保添加一个条件，检查 ETH 数量是否小于或等于储备数量，如果是，就跳出循环。

<details><summary>参考答案代码</summary>

```solidity
    function openLeveragedPosition(uint256 reserve) public payable onlyOwner {
        uint256 loops = 0;
        while (true) {
            uint256 balance = address(this).balance;
            i_lending.addCollateral{value: balance}();
            if (balance <= reserve) {
                break;
            }
            uint256 maxBorrowAmount = i_lending.getMaxBorrowAmount(balance);
            i_lending.borrowCorn(maxBorrowAmount);

            i_cornDEX.swap(maxBorrowAmount);
            loops++;
        }
        emit LeveragedPositionOpened(msg.sender, loops);
    }
```

</details>

🔄 `closeLeveragedPosition` 应该与之类似，只是它会提取最大数量的抵押品、兑换成 CORN 并偿还债务，直到不再有可偿还的 CORN 为止。

<details><summary>参考答案代码</summary>

```solidity
    function closeLeveragedPosition() public onlyOwner {
        uint256 loops = 0;
        while (true) {
            uint256 maxWithdrawable = i_lending.getMaxWithdrawableCollateral(address(this));
            i_lending.withdrawCollateral(maxWithdrawable);
            require(maxWithdrawable == address(this).balance, "maxWithdrawable is not equal to balance");
            i_cornDEX.swap{value:maxWithdrawable}(maxWithdrawable);
            uint256 cornBalance = i_corn.balanceOf(address(this));
            uint256 amountToRepay = cornBalance > i_lending.s_userBorrowed(address(this)) ? i_lending.s_userBorrowed(address(this)) : cornBalance;
            if (amountToRepay > 0) {
                i_lending.repayCorn(amountToRepay);
            } else {
                // 把剩余的 CORN 兑换成 ETH，因为我们不想持有 CORN 敞口
                i_cornDEX.swap(i_corn.balanceOf(address(this)));
                break;
            }
            loops++;
        }
        emit LeveragedPositionClosed(msg.sender, loops);
    }
```

</details>

👨‍💼 `Leverage` 合约提供了 `claimOwnership` 和 `withdraw` 函数，这样你可以在开立仓位之前认领合约的所有权，因为该仓位实际上归这个合约所有。

<Tabs>
<Tab label="Hardhat">

📝 最后，把部署逻辑添加到部署脚本中。把它加在 `packages/hardhat/deploy/00_deploy_contracts.ts` 中所有现有逻辑的下方。

<details markdown='1'><summary>🚀 部署代码</summary>

```typescript
const deployContracts: DeployFunction = async function (
  hre: HardhatRuntimeEnvironment,
) {
  // 所有现有逻辑...

  await deploy("Leverage", {
    from: deployer,
    args: [lending.address, cornDEX.target, cornToken.target],
    log: true,
    autoMine: true,
  });
};
```

</details>

</Tab>
<Tab label="Foundry">

📝 在 `packages/foundry/script/DeployLending.s.sol` 中添加 import 语句和部署代码。

<details markdown='1'><summary>🚀 部署代码</summary>

```solidity
// 添加到 import 部分
import "../contracts/Leverage.sol";

// 在 run() 函数内部、现有部署代码之后：
Leverage leverage = new Leverage(
    address(lending), address(cornDEX), address(corn)
);
console.logString(string.concat("Leverage deployed at: ", vm.toString(address(leverage))));
```

</details>

</Tab>
</Tabs>

🔄 运行 `yarn deploy --reset`，使用新的构造函数参数重新部署你的合约及相关合约。

🚀 试着在 Debug 标签页中开立一个杠杆仓位，看看改变储备数量会如何影响你对市场变化的承受能力。杠杆威力强大，如果你不小心，它就会在你面前炸开。

## Checkpoint 7: 💾 部署你的合约！🛰

<Tabs>
<Tab label="Hardhat">

📡 在 `packages/hardhat/hardhat.config.ts` 中将 `defaultNetwork` 修改为[你选择的公共 EVM 网络](https://ethereum.org/en/developers/docs/networks/)

</Tab>
<Tab label="Foundry">

📡 选择[你偏好的公共 EVM 网络](https://ethereum.org/en/developers/docs/networks/)进行部署。

</Tab>
</Tabs>

🔐 你需要使用 `yarn generate` 生成一个 **部署者地址**。这会创建一个助记词并保存在本地。

👩‍🚀 使用 `yarn account` 查看你的部署者账户余额。

⛽️ 你需要用钱包向你的 **部署者地址** 发送 ETH，或者从所选网络的公共水龙头获取。

🚀 运行 `yarn deploy`，将你的智能合约部署到公共网络。

<Tabs>
<Tab label="Hardhat">

> 💬 提示：你可以在 `hardhat.config.ts` 中把 `defaultNetwork` 设置为 `sepolia` 或 `optimismSepolia`，**或者** 直接运行 `yarn deploy --network sepolia` 或 `yarn deploy --network optimismSepolia`。

</Tab>
<Tab label="Foundry">

> 💬 提示：你可以运行 `yarn deploy --network sepolia` 或 `yarn deploy --network optimismSepolia`。

</Tab>
</Tabs>

---

## Checkpoint 8: 🚢 发布你的前端！🚁

✏️ 编辑 `packages/nextjs/scaffold.config.ts` 中的前端配置，将 `targetNetwork` 改为 `chains.sepolia`（如果你部署到了 OP Sepolia，则改为 `chains.optimismSepolia`）

💻 在 http://localhost:3000 查看你的前端，并确认显示的是正确的网络。

📡 当你准备好发布前端应用时……

📦 运行 `yarn vercel`，打包并部署你的前端。

> 🔑 你可能需要先运行 `yarn vercel:login` 登录 Vercel。登录后（通过邮箱、GitHub 等），使用默认选项即可。

> 🚢 如果你想重新部署到同一个生产环境 URL，可以运行 `yarn vercel --prod`。如果省略 `--prod` 参数，它会部署到一个预览/测试 URL。

> 📋 按照步骤部署到 Vercel，它会给你一个公开 URL。

> 🦊 由于我们已经部署到公共测试网，你现在需要使用自己拥有的钱包连接，或者使用 burner wallet（临时钱包）。默认情况下，🔥 `burner wallets` 仅在 `localhost` 上可用。你可以在前端配置（`packages/nextjs/` 中的 `scaffold.config.ts`）里设置 `burnerWalletMode: "allNetworks"`，从而在所有链上启用它们。

#### 为生产级应用配置第三方服务。

🛠️ 默认情况下，🏗 Scaffold-ETH 2 为 Alchemy 和 Etherscan 等常用服务提供了预设的 API 密钥。这让你可以更轻松地开始开发和测试应用，而无需注册这些服务。
这对于完成你的 **Speedrun Ethereum** 来说非常合适。

🔑 对于生产级应用，建议获取你自己的 API 密钥（以避免速率限制问题）。你可以在以下位置进行配置：

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

## Checkpoint 9: 📜 合约验证

✅ 运行 `yarn verify --network your_network` 命令，在 Etherscan 上验证你的合约 🛰

👉 在 [Sepolia Etherscan](https://sepolia.etherscan.io/)（如果你部署到了 OP Sepolia，则在 [Optimism Sepolia Etherscan](https://sepolia-optimism.etherscan.io/)）上搜索这个地址，获取要提交到 🏃‍♀️[SpeedRunEthereum.com](https://speedrunethereum.com) 的 URL。

---

> 🏃 前往[这里](https://speedrunethereum.com)开始你的下一个挑战。

> 🙋‍♂️ 对这套技术栈有问题、疑问或意见？请发到 [🏗 scaffold-eth 开发者聊天群](https://t.me/joinchat/F7nCRK3kI93PoCOk)
