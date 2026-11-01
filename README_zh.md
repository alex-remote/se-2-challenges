# 🚩 挑战：🏵 代币售卖机（Token Vendor）🤖

![readme](https://raw.githubusercontent.com/scaffold-eth/se-2-challenges/challenge-token-vendor/extension/packages/nextjs/public/hero.png)

🤖 智能合约有点像**任何人**都能使用的“永远在线”的 _自动售货机_。在这个 Speedrun Ethereum 挑战中，我们来创建一种去中心化的数字货币。然后，我们会构建一台无法被关停的自动售货机，用来买卖这种货币。我们将学习 ERC20 的 “approve”（授权）模式，以及合约与合约之间的交互是如何运作的。

🏵 创建 `YourToken.sol` 智能合约，让它继承 OpenZeppelin 的 **ERC20** 代币标准。让你的代币通过 `_mint()` 向 `msg.sender` 铸造 **1000**（\* 10 \*\* 18）个代币。然后创建一个 `Vendor.sol` 合约，通过一个 payable 的 `buyTokens()` 函数出售你的代币。

🎛 编辑前端，让用户输入想要购买的代币数量。我们会显示所需 ETH 金额的预览，并提供一个确认按钮。

🔍 部署之后，在区块浏览器中验证你的代币源代码非常重要。支持者会想确认它的供应量是固定的，而你无法随意增发。

🌟 最终交付物是一个应用，让用户可以购买你的 ERC20 代币、转账，并把它卖回给 Vendor。把你的合约部署到你选择的公共链上，然后用 `yarn vercel` 把应用部署到公共 Web 服务器。在 [SpeedrunEthereum.com](https://speedrunethereum.com) 上提交网址！

> 💬 在 [挑战 Telegram 群](https://t.me/joinchat/IfARhZFc5bfPwpjq) 中结识正在做这个挑战的其他开发者并获得帮助！

---

## Checkpoint 0: 📦 环境 📚

在开始之前，你需要安装以下工具：

- [Node (>= v20.18.3)](https://nodejs.org/en/download/)
- Yarn（[v1](https://classic.yarnpkg.com/en/docs/install/) 或 [v2+](https://yarnpkg.com/getting-started/install)）
- [Git](https://git-scm.com/downloads)
- [Foundry](https://book.getfoundry.sh/getting-started/installation)（如果你选择 Foundry 作为 Solidity 框架）

然后把挑战下载到你的电脑上，并运行以下命令安装依赖：

```sh
npx create-eth@2.0.23 -e challenge-token-vendor challenge-token-vendor
```

> 出现提示时，选择你偏好的 Solidity 框架：**Hardhat** 或 **Foundry**。

```sh
cd challenge-token-vendor
```

## 🤖 AI 引导学习模式（可选）

想要一个在你写代码时为你讲解概念的互动导师吗？这个挑战支持 **AI 引导学习模式**！

1. 在 **Claude Code** 或 **Cursor** 等 AI 编程工具中打开这个项目
2. 运行 `/start` 命令
3. AI 导师会讲解每个概念，然后给你一个编程任务
4. 你编写代码，说 **"check"**，AI 就会运行测试
5. 需要帮助时说 **"hint"**，如果想让 AI 直接给你展示答案，就用 **`/skip`**
6. 你的进度会被保存——随时使用 `/start` 继续

AI 不会直接把答案给你——它会先讲解，然后让你自己实现代码。测试会验证你的成果，如果有测试没通过，AI 会帮你调试。

---

## 标准学习模式

> **注意：** 下面的截图展示的是 Hardhat 网络。如果你使用 Foundry，网络名称中会显示 “Foundry” 而不是 “Hardhat”，但其他一切都一样。

> 在同一个终端中，启动你的本地网络（在你电脑上运行的区块链模拟器）：

```sh
yarn chain
```

> 在第二个终端窗口中，🛰 部署你的合约（本地）：

```sh
yarn deploy
```

> 在第三个终端窗口中，启动你的 📱 前端：

```sh
yarn start
```

📱 打开 http://localhost:3000 查看应用。

> _注意：截图中的界面可能与当前版本略有不同。_

> 👩‍💻 每当你想把合约改动部署到前端时，重新运行 `yarn deploy`。运行 `yarn deploy --reset` 可以进行一次全新部署，即使合约没有改动也是如此。

---

⚠️ 我们已通过 `.vscode/settings.json` 禁用了 Cursor 的自动建议（Tab 补全和预测），以减少你写代码时的干扰。AI 聊天和 agent 功能仍然可用，并且我们提供了包含项目上下文的 `AGENTS.md` 和 `CLAUDE.md` 文件，帮助 AI 助手理解代码库。

🔒 想禁用 AI，完全自己动手？（推荐，可以学得更深入）：

- Cursor：在项目根目录的 `.cursorignore` 文件中添加 `*`
- VSCode：在 `.vscode/settings.json` 文件中把 `chat.disableAIFeatures` 设为 `true`

---

## Checkpoint 1: 🏵你的代币 💵

> 👩‍💻 打开你的 `YourToken.sol` 合约，看看它是如何继承 OpenZeppelin 的 **ERC20** 代币标准的。这意味着 `YourToken` 合约获得了 **ERC20** 标准中的每一个方法，因此它拥有作为以太坊上的代币所需的全部默认属性。

<Tabs>
<Tab label="Hardhat">

**Hardhat**

`packages/hardhat/contracts/YourToken.sol`

</Tab>
<Tab label="Foundry">

**Foundry**

`packages/foundry/contracts/YourToken.sol`

</Tab>
</Tabs>

> 在 `constructor()` 中，向 `msg.sender`（部署者）铸造固定供应量的 **1000** 个代币（18 位小数）。

### 实现 `YourToken`

- 确定代币的名称/符号（已经为你预设为 "Gold"/"GLD"）。
- 你继承的 OpenZeppelin ERC20 合约提供了一个 `_mint` 函数，你可以用它来创建新代币。
- 更新构造函数，向 `msg.sender`（部署者）铸造**恰好** 1000 个代币。

<details markdown='1'>
<summary>🔎 提示</summary>

ERC20 代币通常使用 18 位小数。Solidity 有一个方便的单位，正好与这种缩放比例相匹配：

- `1000 ether` 即 `1000 * 10**18`

所以铸造 1000 个代币可以简单到只需：

- `_mint(msg.sender, 1000 ether);`

<details markdown='1'>

<summary>🎯 参考答案</summary>

```solidity
constructor() ERC20("Gold", "GLD") {
    _mint(msg.sender, 1000 ether);
}
```

</details>
</details>

### 🥅 目标

- ⚠️ **重要：** 你的初始代币供应被铸造给了**部署者**。如果你在前端使用的钱包是另一个地址，你暂时还不会在那里看到余额。

<Tabs>
<Tab label="Hardhat">

**Hardhat**

  在 `packages/hardhat/deploy/01_deploy_vendor.ts` 中更新 `FRONTEND_ADDRESS`，并保持 `SEND_TOKENS_TO_VENDOR = false`，因为我们还没准备好进行那一步。

</Tab>
<Tab label="Foundry">

**Foundry**

  在 `packages/foundry/script/DeployYourToken.s.sol` 中更新 `FRONTEND_ADDRESS`，并保持 `SEND_TOKENS_TO_VENDOR = false`，因为我们还没准备好进行那一步。

</Tab>
</Tabs>

  然后运行 `yarn deploy --reset`，把代币发送到你的前端钱包，这样你就可以在界面中进行测试了。

- [ ] 你能在 `Debug Contracts` 标签页中查看你前端地址的 `balanceOf()` 吗？（`YourToken` 合约）
- [ ] 你能用 `transfer()` 把你的代币转给另一个账户，并查看 _那个_ 账户的 `balanceOf` 吗？

![debugContractsYourToken](https://github.com/scaffold-eth/se-2-challenges/assets/55535804/5fb4daeb-5d05-4522-96b3-76f052a68418)

> 💬 提示：使用无痕窗口创建一个新地址，然后尝试向这个新地址发送代币。可以使用 `Debug Contracts` 标签页中的 `transfer()` 函数。

### 测试你的进度

🔍 运行：

<Tabs>
<Tab label="Hardhat">

**Hardhat**

```shell
yarn test --grep "Checkpoint1"
```

</Tab>
<Tab label="Foundry">

**Foundry**

```shell
yarn test --match-test "Checkpoint1"
```

</Tab>
</Tabs>

---

## Checkpoint 2: ⚖️ Vendor（售卖机）🤖

> 👩‍💻 编辑 `Vendor.sol`，用一个 **payable** 的 `buyTokens()` 函数构建一台代币自动售货机。

<Tabs>
<Tab label="Hardhat">

**Hardhat**

`packages/hardhat/contracts/Vendor.sol`

</Tab>
<Tab label="Foundry">

**Foundry**

`packages/foundry/contracts/Vendor.sol`

</Tab>
</Tabs>

### 第 1 步：添加价格常量

使用一个名为 `tokensPerEth` 的价格变量，并设为 **100**（表示**每 1 ETH 可换 100 个代币**）：

```solidity
uint256 public constant tokensPerEth = 100;
```

### 第 2 步：添加自定义错误

我们不使用 `require(condition, "message")`，而是使用**自定义错误**（它们在运行时开销更低，也更容易测试）。

在合约的错误（error）区域，为常见的失败情况添加以下错误：

```solidity
error InvalidEthAmount();
error InsufficientVendorTokenBalance(uint256 available, uint256 required);
```

### 第 3 步：添加事件

在合约的事件（event）区域，添加一个事件，供界面（以及区块浏览器）用来追踪购买记录：

```solidity
event BuyTokens(address indexed buyer, uint256 amountOfETH, uint256 amountOfTokens);
```

### 实现 `buyTokens()`

`buyTokens()` 函数应当：

- 拒绝 **0 ETH** 的购买，使用 `InvalidEthAmount` 回滚（revert）
- 使用 `msg.value` 和 `tokensPerEth` 计算买家应获得多少代币
- 确保 Vendor 有足够的代币可供出售，如果不够，则使用 `InsufficientVendorTokenBalance` 回滚
- 把代币转给买家
- 触发 `BuyTokens` 事件

<details markdown='1'>
<summary>🔎 提示</summary>

**小数位陷阱（重要）：**

- ETH 以 wei 为单位计量（18 位小数）
- 本挑战中的 ERC20 代币同样使用 18 位小数

如果 `tokensPerEth = 100`，那么：

- 发送 `1 ether` 应该得到 `100 ether` 个代币单位

一个适用于 18 位小数代币的简单公式：

- `tokensToBuy = msg.value * tokensPerEth`

另外，你可以用下面的方式查看 Vendor 持有多少代币：

- `yourToken.balanceOf(address(this))`

<details markdown='1'>

<summary>🎯 参考答案</summary>

```solidity
function buyTokens() external payable {
    if (msg.value == 0) revert InvalidEthAmount();

    uint256 amountOfTokens = msg.value * tokensPerEth;
    uint256 vendorBalance = yourToken.balanceOf(address(this));
    if (vendorBalance < amountOfTokens) revert InsufficientVendorTokenBalance(vendorBalance, amountOfTokens);

    yourToken.transfer(msg.sender, amountOfTokens);
    emit BuyTokens(msg.sender, msg.value, amountOfTokens);
}
```

</details>
</details>

### 动手试试（前端 + 部署）

更新你的部署脚本，为 Vendor 预存代币：

<Tabs>
<Tab label="Hardhat">

**Hardhat**

编辑 `packages/hardhat/deploy/01_deploy_vendor.ts`，把 `SEND_TOKENS_TO_VENDOR` 设为 `true`。这会部署 Vendor 合约并自动向它预存代币，**而不是**把代币发送到你的 `FRONTEND_ADDRESS`。它还会把你的地址设为 Vendor 合约的所有者（owner），不过这一点我们稍后再深入讨论……

</Tab>
<Tab label="Foundry">

**Foundry**

编辑 `packages/foundry/script/DeployYourToken.s.sol`，把 `SEND_TOKENS_TO_VENDOR` 设为 `true`。这会部署 Vendor 合约并自动向它预存代币，**而不是**把代币发送到你的 `FRONTEND_ADDRESS`。它还会把你的地址设为 Vendor 合约的所有者（owner），不过这一点我们稍后再深入讨论……

</Tab>
</Tabs>

> 🔎 查看 `packages/nextjs/app/token-vendor/page.tsx`，取消 `Vendor Balances` 和 `Buy Tokens` 部分的注释，以显示 Vendor 的 ETH 和代币余额，并启用从前端购买代币的功能。

> 你可以反复运行 `yarn deploy --reset` 来部署合约，直到它正确为止。

![TokenVendorBuy](https://github.com/scaffold-eth/se-2-challenges/assets/55535804/7669cc68-e942-4630-95c8-91cd21af5ba0)

### 🥅 目标

- [ ] 在 `Debug Contracts` 标签页的 `YourToken` 中，`Vendor` 地址的初始 `balanceOf` 是否为 **1000**？
- [ ] 你能用 **0.1** ETH 买到 **10** 个代币吗？
- [ ] 你能把代币转给另一个账户吗？

### 测试你的进度

🔍 运行：

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

---

## Checkpoint 3: 👑 Ownable + 提款 💸

既然你的 Vendor 已经可以通过 `buyTokens()` 接收 ETH，接下来我们来保护它的资金库。

### 第 1 步：继承 `Ownable`（OpenZeppelin v5）

OpenZeppelin 的 Ownable 合约添加了一些特殊的方法、修饰器和状态变量，用来帮助保护特定的方法。值得注意的是，`onlyOwner` 修饰器可以用来守护一个方法，使得只有 `owner` 才能调用它。

- 注意 Vendor 合约已经从 OpenZeppelin 导入了 `Ownable`
- 看看在定义合约的那一行中，它是如何被继承的：

```solidity
contract Vendor is Ownable ...
```

- 最后，看看我们如何在构造函数中通过 `Ownable(msg.sender)` 定义所有权，让合约的部署者成为 `owner`

我们使用 `onlyOwner` 修饰器来保护 `withdraw` 方法，这样只有所有者才能提取合约中的 ETH 余额。

### 第 2 步：为转账失败添加自定义错误

首先添加这个方法中需要用到的错误。

```solidity
error EthTransferFailed(address to, uint256 amount);
```

### 实现 `withdraw()`

你的 `withdraw()` 函数应当：

- 仅限所有者调用（`onlyOwner`）
- 把 Vendor 中的**全部 ETH** 发送给所有者
- 如果 ETH 转账失败，使用 `EthTransferFailed` 回滚

<details markdown='1'>
<summary>🔎 提示</summary>

避免使用 `transfer()`（它可能因 gas 变化而意外失败，并且在最新的 Solidity 版本中已不再受支持）。优先使用 `call`：

- `(bool ok,) = owner().call{value: amount}("");`

如果 `ok` 为 false，就回滚。

<details markdown='1'>

<summary>🎯 参考答案</summary>

```solidity
function withdraw() external onlyOwner {
    uint256 amount = address(this).balance;
    (bool success,) = owner().call{value: amount}("");
    if (!success) revert EthTransferFailed(owner(), amount);
}
```

</details>
</details>

### 动手试试

使用 `yarn deploy --reset` 部署更新后的合约，然后通过存入 ETH 再提取出来进行测试。你可以在 `Debug Contracts` 标签页中完成这些操作。

### 🥅 目标

- [ ] 你的前端地址是 `Vendor` 的 `owner` 吗？
- [ ] 你的地址能成功提取 `Vendor` 中的全部 ETH 吗？

### 测试你的进度

🔍 运行：

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

---

## Checkpoint 4: 🤔 Vendor 回购 🤯

👩‍🏫 这个挑战最难的部分，是让你的 `Vendor` 能够把代币买回来。

🧐 之所以难，是因为 ERC20 中的 `approve()` 模式。

😕 首先，用户必须在 `YourToken` 合约上调用 `approve()`，授权 `Vendor` 合约地址取走一定数量的代币。

🤨 然后，用户向 `Vendor` 合约发起 _第二笔交易_，调用 `sellTokens(uint256 amount)`。

🤓 `Vendor` 应该调用 `yourToken.transferFrom(msg.sender, address(this), theAmount)`，如果用户已正确授权 `Vendor`，代币就会转入 `Vendor`，同时 ETH 会发送给用户。

<details markdown='1'>
<summary>🤔 但是为什么我们需要 <code>approve</code> 方法？</summary>

问题的关键在于：如果智能合约可以把代币从你的钱包中转走，你要如何确保只有你 _想要_ 让它取走代币的那个智能合约才被允许这样做？

下面是一个简单的思维模型：

- **`approve(spender, amount)` = “我允许这个合约最多花费我 X 个代币。”**
  - 它**不会**转移代币。
  - 它会在代币合约中写入一笔**授权额度（allowance）**：`allowance[you][spender] = amount`。

- **`transferFrom(from, to, amount)` = “使用这个许可来拉取代币。”**
  - `Vendor` 合约会在 `sellTokens(...)` 执行期间调用它。
  - 代币合约会检查授权额度，只有额度足够时才允许这笔转账发生。

这带来了什么：**安全的、基于拉取（pull）的代币交互**——合约可以执行某个操作（兑换、回购、市场购买、订阅等），并且只拉取它所需的确切数量的代币，**而无需拥有对你钱包的全面访问权限**。你还可以通过只授权确切的数量来**限制风险**（或者之后通过授权 `0` 来撤销授权）。

幸运的是，钱包的用户体验正在快速改进。随着 **EIP-7702** 等提案现已在以太坊上启用，钱包可以让你只签署**一次**“卖出”操作，由它在单笔交易中原子地执行一小组步骤（例如 `approve` + `sellTokens` / `transferFrom`），而不必让你点击完成两个独立的用户操作。底层的 ERC-20 授权额度模型依然存在；你只是在授权一条更智能的批量执行路径。只需钱包和前端采用这一功能，用户就能享受到这些好处。

</details>

### 第 1 步：添加自定义错误 + 事件

```solidity
error InvalidTokenAmount();
error InsufficientVendorEthBalance(uint256 available, uint256 required);

event SellTokens(address indexed seller, uint256 amountOfTokens, uint256 amountOfETH);
```

### 实现 `sellTokens(uint256 amount)`

你的 `sellTokens(amount)` 应当：

- 拒绝 `amount == 0`，使用 `InvalidTokenAmount` 回滚
- 使用 `transferFrom` 从用户那里拉取代币（需要用户事先调用 `approve`）
- 使用与你的定价相反的换算方式，计算要返还的 ETH
- 确保 Vendor 有足够的 ETH 流动性，如果不够，则使用 `InsufficientVendorEthBalance` 回滚
- 把 ETH 发回给用户
- 触发 `SellTokens` 事件

<details markdown='1'>
<summary>🔎 提示</summary>

如果 `tokensPerEth = 100`，那么反向换算为：

- `ethToReturn = amount / tokensPerEth`

<details markdown='1'>

<summary>🎯 参考答案</summary>

```solidity
function sellTokens(uint256 amount) external {
    if (amount == 0) revert InvalidTokenAmount();

    uint256 amountOfETH = amount / tokensPerEth;
    uint256 vendorEthBalance = address(this).balance;
    if (vendorEthBalance < amountOfETH) revert InsufficientVendorEthBalance(vendorEthBalance, amountOfETH);

    yourToken.transferFrom(msg.sender, address(this), amount);

    (bool success,) = msg.sender.call{value: amountOfETH}("");
    if (!success) revert EthTransferFailed(msg.sender, amountOfETH);

    emit SellTokens(msg.sender, amount, amountOfETH);
}
```

</details>
</details>

### 动手试试

🔁 重新部署（`yarn deploy --reset`），试试你的新函数！

🔨 一开始先用 `Debug Contracts` 标签页来调用 approve 和 sellTokens()，不过之后……

🔍 在 `packages/nextjs/app/token-vendor/page.tsx` 中找到额外的授权/卖出界面并取消注释，然后打开 `packages/nextjs/app/events/page.tsx`，取消 `SellTokens Events` 部分的注释，以更新前端的 `Events` 标签页。

![VendorBuyBack](https://github.com/scaffold-eth/se-2-challenges/assets/55535804/99063aaa-368d-4156-997d-08dff99af11b)

### 🥅 目标

- [ ] 你能把代币卖回给 Vendor 吗？
- [ ] 你卖出代币后收到的 ETH 数量正确吗？
- [ ] 你现在能在 `Events` 标签页中看到 `SellTokens` 事件吗？

![Events](https://github.com/scaffold-eth/se-2-challenges/assets/55535804/662c96b5-d53f-4efa-af4a-d3106bfd47f0)

### ⚔️ 支线任务

- [ ] 我们是否应该禁用 `owner` 的提款功能，以便把流动性保留在 `Vendor` 中？
- [ ] 如果人们知道没有办法抽走支撑代币的 ETH，他们会不会对你的代币更感兴趣？

### 测试你的进度

🔍 运行：

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

---

## Checkpoint 5: 💾 部署你的合约！🛰

📡 部署到公共测试网。我们推荐 `sepolia` 或 `optimismSepolia`。

🔐 你需要使用 `yarn generate` 生成一个**部署者地址**。这会创建一个助记词并保存在本地。

👩‍🚀 使用 `yarn account` 查看你的部署者账户余额。

⛽️ 你需要用你的钱包向部署者地址发送 ETH，或者从你所选网络的公共水龙头获取。你也可以在 [挑战 Telegram 群](https://t.me/joinchat/IfARhZFc5bfPwpjq) 中发送一条附有你新的部署者地址和偏好网络的消息来请求 ETH。大家通常都很乐意分享。

🚀 运行 `yarn deploy`，把你的智能合约部署到公共网络。

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

## Checkpoint 6: 🚢 发布你的前端！🚁

✏️ 编辑 `packages/nextjs/scaffold.config.ts` 中的前端配置，把 `targetNetwork` 改为 `chains.sepolia`（如果你部署到了 OP Sepolia，则改为 `chains.optimismSepolia`）

💻 在 http://localhost:3000 查看你的前端，确认你看到的是正确的网络。

📡 当你准备好发布前端应用时……

📦 运行 `yarn vercel` 打包并部署你的前端。

> 你可能需要先运行 `yarn vercel:login` 登录 Vercel。登录后（通过邮箱、GitHub 等），使用默认选项应该就可以了。

> 如果你想重新部署到同一个生产环境 URL，可以运行 `yarn vercel --prod`。如果省略 `--prod` 参数，它会部署到一个预览/测试 URL。

> 按照步骤部署到 Vercel。它会给你一个公开的 URL。

> 🦊 由于我们已经部署到了公共测试网，现在你需要使用自己拥有的钱包连接，或者使用 burner wallet（临时钱包）。默认情况下，🔥 `burner wallets` 只在本地链上可用。你可以在前端配置（`packages/nextjs/` 中的 `scaffold.config.ts`）里设置 `burnerWalletMode: "allNetworks"`，在所有链上启用它们。

#### 为生产级应用配置第三方服务。

默认情况下，🏗 Scaffold-ETH 2 为 Alchemy 和 Etherscan 等常用服务提供了预设的 API 密钥。这让你可以更轻松地开始开发和测试应用，而无需注册这些服务。
这对于完成你的 **Speedrun Ethereum** 来说非常合适。

对于生产级应用，建议获取你自己的 API 密钥（以避免触发速率限制）。你可以在以下位置进行配置：

<Tabs>
<Tab label="Hardhat">

**Hardhat**

- 🔷 `packages/hardhat/.env` 和 `packages/nextjs/.env.local` 中的 `ALCHEMY_API_KEY` 变量。你可以在 [Alchemy 控制台](https://dashboard.alchemy.com/) 创建 API 密钥。
- 📃 `packages/hardhat/.env` 中的 `ETHERSCAN_API_KEY` 变量，填入你生成的 API 密钥。你可以在[这里](https://etherscan.io/myapikey)获取密钥。

</Tab>
<Tab label="Foundry">

**Foundry**

- 🔷 `packages/foundry/.env` 和 `packages/nextjs/.env.local` 中的 `ALCHEMY_API_KEY` 变量。你可以在 [Alchemy 控制台](https://dashboard.alchemy.com/) 创建 API 密钥。
- 📃 `packages/foundry/.env` 中的 `ETHERSCAN_API_KEY` 变量，填入你生成的 API 密钥。你可以在[这里](https://etherscan.io/myapikey)获取密钥。

</Tab>
</Tabs>

> 💬 提示：对于线上应用，建议把 nextjs 的环境变量存放在 Vercel/系统的环境变量配置中，本地测试则使用 .env.local。

---

## Checkpoint 7: 📜 合约验证

运行 `yarn verify --network your_network` 命令，在 etherscan 上验证你的合约 🛰

👀 你可能会同时看到 YourToken 和 Vendor 的地址。你需要的是 Vendor 的地址。

👉 在 [Sepolia Etherscan](https://sepolia.etherscan.io/)（如果你部署到了 OP Sepolia，则在 [Optimism Sepolia Etherscan](https://sepolia-optimism.etherscan.io/)）上搜索这个地址，获取要提交到 🏃‍♀️[SpeedrunEthereum.com](https://speedrunethereum.com) 的 URL。

---

> 🏃 [点击这里](https://speedrunethereum.com)前往你的下一个挑战。

> 💬 对这套技术栈有问题、疑问或意见？发到 [🏗 scaffold-eth 开发者群聊](https://t.me/joinchat/F7nCRK3kI93PoCOk)
