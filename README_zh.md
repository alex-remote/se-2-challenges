# 🚩 挑战：🎲 骰子游戏（Dice Game）

![readme](https://raw.githubusercontent.com/scaffold-eth/se-2-challenges/challenge-dice-game/extension/packages/nextjs/public/hero.png)

> 🎰 在公开且确定性的区块链上，随机性是个棘手的问题。区块哈希是一种易于使用、但非常弱的随机性来源。这个 Speedrun Ethereum 挑战会给你一个使用区块哈希生成随机数的合约示例。这种随机性是可以被利用的。其他更强的随机性方案包括提交/揭示（commit/reveal）机制、预言机，或 Chainlink 的 VRF。

> 💬 Dice Game 是一个允许用户掷骰子来尝试赢取奖金的合约。如果玩家掷出 0、1、2、3、4 或 5，就能赢得当前的奖金。初始奖金是合约余额的 10%，合约初始余额为 .05 Eth。

> 🧤 玩家每次掷骰子都需要支付 .002 Eth。其中 40% 会加入当前奖金，另外 60% 留在合约中，用于支付未来的奖金。一旦奖金被赢走，新的奖金金额会被设为 DiceGame 合约总余额的 10%。

> 🧨 你的任务是攻击 Dice Game 合约！你将创建一个新合约，提前预测随机数，并且只在确定能赢的时候才掷骰子！

> 💬 在[挑战 Telegram 群](https://t.me/+3StA0aBSArFjNjUx)中结识其他正在做这个挑战的开发者，并获得帮助！

---

## Checkpoint 0: 📦 环境 📚

开始之前，你需要安装以下工具：

- [Node (>= v20.18.3)](https://nodejs.org/en/download/)
- Yarn（[v1](https://classic.yarnpkg.com/en/docs/install/) 或 [v2+](https://yarnpkg.com/getting-started/install)）
- [Git](https://git-scm.com/downloads)
- [Foundry](https://book.getfoundry.sh/getting-started/installation)（如果你选择 Foundry 作为 Solidity 框架）

然后把挑战下载到你的电脑上，并运行以下命令安装依赖：

```sh
npx create-eth@2.0.23 -e challenge-dice-game challenge-dice-game
```

> 出现提示时，选择你偏好的 Solidity 框架：**Hardhat** 或 **Foundry**。

```sh
cd challenge-dice-game
```

> 在同一个终端中，启动你的本地网络（运行在你电脑上的区块链模拟器）：

```sh
yarn chain
```

> 在第二个终端窗口中，🛰 部署你的合约（本地）：

```sh
cd challenge-dice-game
yarn deploy
```

> 在第三个终端窗口中，启动你的 📱 前端：

```sh
cd challenge-dice-game
yarn start
```

📱 打开 http://localhost:3000 查看应用。

> _注意：截图中的界面可能与当前版本略有不同。_

> 👩‍💻 每当你想把合约改动部署到前端时，重新运行 `yarn deploy` 即可。运行 `yarn deploy --reset` 可以进行一次全新部署，即使合约没有改动。

---

⚠️ 我们已通过 `.vscode/settings.json` 禁用了 Cursor 的自动建议（Tab 补全和预测），以减少你写代码时的干扰。AI 聊天和 agent 功能仍然可用，并且我们提供了包含项目上下文的 `AGENTS.md` 和 `CLAUDE.md` 文件，帮助 AI 助手理解代码库。

🔒 想禁用 AI、一切都自己动手？（推荐，可以学得更深入）：

- Cursor：在项目根目录的 `.cursorignore` 文件中添加 `*`
- VSCode：在 `.vscode/settings.json` 文件中将 `chat.disableAIFeatures` 设为 `true`

---

## 🤖 AI 引导学习模式（可选）

想要一个在你写代码时为你讲解概念的交互式导师吗？本挑战支持 **AI 引导学习模式**！

1. 在 **Claude Code** 或 **Cursor** 等 AI 编程工具中打开本项目
2. 运行 `/start` 命令
3. AI 导师会讲解每个概念，然后给你布置一个编程任务
4. 你编写代码，说 **"check"**，AI 就会运行测试
5. 需要帮助时说 **"hint"**，如果你想让 AI 直接展示答案，就使用 **`/skip`**
6. 你的进度会被保存——随时使用 `/start` 继续

AI 不会直接把答案给你——它会先讲解，然后让你自己实现代码。测试会验证你的成果，如果有测试没通过，AI 会帮你调试。

---

## Checkpoint 1: 🎲 骰子游戏

🔍 查看合约目录中 `DiceGame.sol` 合约的代码：

<Tabs>
<Tab label="Hardhat">

**Hardhat**

`packages/hardhat/contracts`

</Tab>
<Tab label="Foundry">

**Foundry**

`packages/foundry/contracts`

</Tab>
</Tabs>

🔒 在这个挑战中，你不需要修改 `DiceGame.sol` 合约中的任何代码。你将编写自己的合约来预测结果，然后只在结果有利时才掷骰子。

💸 从水龙头（faucet）领取一些资金，然后掷几次骰子。在 Debug 标签页中观察 DiceGame 合约的余额：掷骰失败时余额会增加，掷骰成功时余额会减少相应的奖金金额。

![Faucet](https://github.com/scaffold-eth/se-2-challenges/assets/55535804/e82e3100-20fb-4886-a6bf-4113c3729f53)

### 🥅 目标

- [ ] 追踪 Solidity 代码，弄清楚 DiceGame 合约是如何生成随机数的。
- [ ] 是否有可能预测任意一次掷骰的随机数？

---

## Checkpoint 2: 🔑 作弊合约

首先在 `RiggedRoll.sol` 合约中创建一个 `receive()` 函数，使其能够接收 ETH。这样我们就可以从水龙头向 `RiggedRoll` 合约注入资金，而这是我们的合约调用 `rollTheDice()` 所必需的。

<details markdown='1'>
<summary>🔎 提示</summary>

你的作弊合约需要能够通过普通转账（不带 calldata）接收 ETH。在 Solidity 中，`receive()` 正是为此而设的。

<details markdown='1'>
<summary>🎯 参考答案</summary>

```solidity
receive() external payable {}
```

</details>
</details>

把这些自定义错误添加到 `RiggedRoll.sol` 的错误（error）区域：

```solidity
error NotEnoughETH(uint256 required, uint256 available);
error NotWinningRoll(uint256 roll);
```

接下来添加一个 `riggedRoll()` 函数。这个函数应当预测一次掷骰的随机结果，如果结果会获胜，就调用 `DiceGame` 合约上的 `rollTheDice()`。如果合约没有所需的 .002 ETH 余额，就以 `NotEnoughETH` 回滚（revert）。如果计算出的点数不是获胜数字，就以 `NotWinningRoll` 回滚。

🃏 用与 DiceGame 合约完全相同的方式生成随机数，以此预测结果。

> 📣 提醒！调用 `rollTheDice()` 时，除非你随调用发送至少 .002 Eth（msg.value），否则调用会失败！[这里有一个在函数调用中附带发送 ETH 的示例。](https://ethereum.stackexchange.com/questions/6665/call-contract-and-send-value-from-solidity)

🎲 请注意，前端的骰子使用的是十六进制字符，但在合约中我们用整数就够了。A,B,C,D,E,F = 10,11,12,13,14,15

❓ 如果你很难得到与 DiceGame 合约完全相同的随机数，可以尝试在两个合约中都加入一些 `console.log()` 语句来帮助你追踪数值。这些信息会显示在本地链的终端中。

<details markdown='1'>
<summary>🔎 提示</summary>

要与 `DiceGame.sol` 保持一致，你需要：

- 从 `DiceGame` 合约读取当前的 `nonce`
- 使用 `blockhash(block.number - 1)` 作为上一个区块的哈希
- 对完全相同的元组进行哈希：`(prevHash, diceGameAddress, nonce)`
- 用 `% 16` 换算成点数
- 只在点数会获胜时才调用 `rollTheDice()`
- 如果不是获胜数字，就以 `NotWinningRoll` 回滚；这样你只有在获胜时才会真正花费 gas
- 如果你的合约没有至少 `0.002 ether` 可用，就以 `NotEnoughETH` 回滚

<details markdown='1'>
<summary>🎯 参考答案</summary>

```solidity
function riggedRoll() external {
    uint256 required = 0.002 ether;
    uint256 available = address(this).balance;
    if (available < required) revert NotEnoughETH(required, available);

    bytes32 prevHash = blockhash(block.number - 1);
    uint256 nonce = diceGame.nonce();
    bytes32 hash = keccak256(abi.encodePacked(prevHash, address(diceGame), nonce));
    uint256 roll = uint256(hash) % 16;

    // 只在确定会赢时才掷骰子（与提供的测试一致）
    if (roll > 5) revert NotWinningRoll(roll);

    diceGame.rollTheDice{value: required}();
}
```

</details>
</details>

🚀 要部署你的 RiggedRoll 合约，请取消部署脚本中相应代码行的注释，然后运行 `yarn deploy --reset`：

<Tabs>
<Tab label="Hardhat">

**Hardhat**

`packages/hardhat/deploy/01_deploy_riggedRoll.ts`

</Tab>
<Tab label="Foundry">

**Foundry**

`packages/foundry/script/DeployDiceGame.s.sol`

</Tab>
</Tabs>

💸 在第一次掷骰之前，你需要向 RiggedRoll 合约发送一些资金，可以使用页面左下角的 Faucet 按钮。

🐞 进入 `Debug Contracts` 标签页，尝试调用 `RiggedRoll` 合约中的 `riggedRoll` 方法。

### ⚔️ 支线任务

- [ ] 取消 `packages/nextjs/app/dice/page.tsx` 中代码的注释，在主界面标签页上显示 riggedRoll 按钮和合约余额。这样你无需切换标签页就能测试你的函数。
- [ ] 你的 riggedRoll 函数是否只在会获胜时才调用 `rollTheDice()`？当它确实调用 `rollTheDice()` 时会发生什么？

![RiggedLosingRoll](https://github.com/scaffold-eth/se-2-challenges/assets/55535804/b6c8d7b4-139b-4f54-a62c-a0c77b3692a3)

### 测试你的进度

🔍 运行以下命令，检查你是否正确实现了作弊掷骰的逻辑：

<Tabs>
<Tab label="Hardhat">

**Hardhat**

```shell
yarn test --grep "Checkpoint2"
```

</Tab>
<Tab label="Foundry">

**Foundry**

```shell
yarn test --match-test "Checkpoint2"
```

</Tab>
</Tabs>

✅ 测试通过了吗？你可以查看测试代码来深入排查任何错误：

<Tabs>
<Tab label="Hardhat">

**Hardhat**

`packages/hardhat/test/RiggedRoll.ts`

</Tab>
<Tab label="Foundry">

**Foundry**

`packages/foundry/test/RiggedRoll.t.sol`

</Tab>
</Tabs>

---

## Checkpoint 3: 💵 我的钱去哪了？！？

你已经打败了这个游戏，可你的钱在哪里？由于调用 `rollTheDice()` 的是 RiggedRoll 合约，奖金就被发送到了那里。

![RiggedRollAddress](https://github.com/scaffold-eth/se-2-challenges/assets/55535804/e9b9d164-2fb1-416a-9c5e-198d15bca0c6)

首先，在 `RiggedRoll.sol` 中再添加一个自定义错误：

```solidity
error InsufficientBalance(uint256 requested, uint256 available);
```

📥 现在创建一个 `withdraw(address _addr, uint256 _amount)` 函数，让你可以把 ETH 从 RiggedRoll 发送到另一个地址。

请确保锁定 withdraw 函数，使其只能由所有者（owner）调用。合约已经继承了 `Ownable` 合约，所以你可以使用 `onlyOwner` 修饰器。

![WithdrawOnlyOwner](https://github.com/scaffold-eth/se-2-challenges/assets/55535804/e8397b1e-a077-4009-b518-30a6d8deb6e7)

> ⚠️ 等等，我可不是所有者！你需要在部署脚本中把你的前端地址设为所有者，这样你的前端地址就可以调用 withdraw 函数了。

<Tabs>
<Tab label="Hardhat">

**Hardhat**

`packages/hardhat/deploy/01_deploy_riggedRoll.ts`

</Tab>
<Tab label="Foundry">

**Foundry**

`packages/foundry/script/DeployDiceGame.s.sol`

</Tab>
</Tabs>

<details markdown='1'>
<summary>🔎 提示</summary>

- 你应该能够提取合约的全部余额。
- 使用 `call` 来转账 ETH。
- 如果 `_amount` 大于 `address(this).balance`，你应该以 `InsufficientBalance(requested, available)` 回滚。

<details markdown='1'>
<summary>🎯 参考答案</summary>

```solidity
function withdraw(address _addr, uint256 _amount) external onlyOwner {
    uint256 available = address(this).balance;
    if (_amount > available) revert InsufficientBalance(_amount, available);
    (bool success, ) = payable(_addr).call{value: _amount}("");
    require(success, "Withdraw failed");
}
```

</details>
</details>

### 🥅 目标

- [ ] 你能从 RiggedRoll 合约向你的前端地址发送 ETH 吗？
- [ ] 是任何人都能调用 withdraw 函数，还是只有所有者可以？

### 测试你的进度

🔍 运行以下命令，检查你是否正确实现了 withdraw 函数：

<Tabs>
<Tab label="Hardhat">

**Hardhat**

```shell
yarn test --grep "Checkpoint3"
```

</Tab>
<Tab label="Foundry">

**Foundry**

```shell
yarn test --match-test "Checkpoint3"
```

</Tab>
</Tabs>

✅ 测试通过了吗？你可以查看测试代码来深入排查任何错误：

<Tabs>
<Tab label="Hardhat">

**Hardhat**

`packages/hardhat/test/RiggedRoll.ts`

</Tab>
<Tab label="Foundry">

**Foundry**

`packages/foundry/test/RiggedRoll.t.sol`

</Tab>
</Tabs>

## Checkpoint 4: 💾 部署你的合约！🛰

🔐 使用 `yarn generate` 生成一个部署者地址。它会创建一个唯一的部署者地址，并把助记词保存在本地。

👩‍🚀 使用 `yarn account` 查看你的部署者账户余额。

⛽️ 你需要用自己的钱包向部署者地址发送 ETH，或者从你所选网络的公共水龙头获取。你也可以在[挑战 Telegram 群](https://t.me/+3StA0aBSArFjNjUx)中发送消息，附上你的新部署者地址和偏好的网络来索取 ETH。大家通常都非常乐意分享。

🚀 使用 `yarn deploy` 部署你的智能合约。

<Tabs>
<Tab label="Hardhat">

**Hardhat**

> 💬 提示：你可以在 `hardhat.config.ts` 中把 `defaultNetwork` 设为 `sepolia` 然后运行 `yarn deploy`，**或者**直接运行 `yarn deploy --network sepolia`。

</Tab>
<Tab label="Foundry">

**Foundry**

> 💬 提示：使用 `yarn deploy --network sepolia`。

</Tab>
</Tabs>

---

## Checkpoint 5: 🚢 发布你的前端！🚁

✏️ 编辑 `packages/nextjs/scaffold.config.ts` 中的前端配置，把 `targetNetwork` 改为 `chains.sepolia`（如果你部署到了 OP Sepolia，则改为 `chains.optimismSepolia`）

💻 在 http://localhost:3000 查看你的前端，确认显示的是正确的网络。

📡 当你准备好发布前端应用时……

📦 运行 `yarn vercel` 打包并部署你的前端。

> 你可能需要先运行 `yarn vercel:login` 登录 Vercel。登录后（通过邮箱、GitHub 等），使用默认选项即可。

> 如果你想重新部署到同一个生产环境 URL，可以运行 `yarn vercel --prod`。如果省略 `--prod` 参数，它会部署到一个预览/测试 URL。

> 按照步骤部署到 Vercel，它会给你一个公开的 URL。

> 🦊 由于我们已经部署到公共测试网，现在你需要使用自己的钱包或 burner wallet（临时钱包）进行连接。默认情况下，🔥 `burner wallets` 只在本地网络（`hardhat`/`foundry`）上可用。你可以在前端配置（`packages/nextjs/` 中的 `scaffold.config.ts`）里设置 `burnerWalletMode: "allNetworks"`，从而在所有链上启用它们

#### 为生产级应用配置第三方服务。

默认情况下，🏗 Scaffold-ETH 2 为 Alchemy 和 Etherscan 等常用服务提供了预设的 API 密钥。这让你可以更轻松地开始开发和测试应用，无需注册这些服务。
这非常适合用来完成你的 **Speedrun Ethereum**。

对于生产级应用，建议你获取自己的 API 密钥（以避免触发速率限制）。你可以在以下位置进行配置：

<Tabs>
<Tab label="Hardhat">

**Hardhat**

- 🔷 `packages/hardhat/.env` 和 `packages/nextjs/.env.local` 中的 `ALCHEMY_API_KEY` 变量。你可以在 [Alchemy 控制台](https://dashboard.alchemy.com/)创建 API 密钥。
- 📃 `packages/hardhat/.env` 中的 `ETHERSCAN_API_KEY` 变量，填入你生成的 API 密钥。你可以在[这里](https://etherscan.io/myapikey)获取密钥。

</Tab>
<Tab label="Foundry">

**Foundry**

- 🔷 `packages/foundry/.env` 和 `packages/nextjs/.env.local` 中的 `ALCHEMY_API_KEY` 变量。你可以在 [Alchemy 控制台](https://dashboard.alchemy.com/)创建 API 密钥。
- 📃 `packages/foundry/.env` 中的 `ETHERSCAN_API_KEY` 变量，填入你生成的 API 密钥。你可以在[这里](https://etherscan.io/myapikey)获取密钥。

</Tab>
</Tabs>

> 💬 提示：对于线上应用，建议把 nextjs 的环境变量存放在 Vercel/系统的环境变量配置中，本地测试时则使用 .env.local。

---

## Checkpoint 6: 📜 合约验证

运行 `yarn verify --network your_network` 命令，在 Etherscan 上验证你的合约 🛰

👉 在 [Sepolia Etherscan](https://sepolia.etherscan.io/)（如果你部署到了 OP Sepolia，则在 [Optimism Sepolia Etherscan](https://sepolia-optimism.etherscan.io/)）上搜索这个地址，获取要提交到 🏃‍♀️[SpeedRunEthereum.com](https://speedrunethereum.com) 的 URL。

---

> 🏃 前往你的下一个挑战：[这里](https://speedrunethereum.com)。

> 💬 对这套技术栈有问题、疑问或意见？请发到 [🏗 scaffold-eth 开发者聊天群](https://t.me/joinchat/F7nCRK3kI93PoCOk)
