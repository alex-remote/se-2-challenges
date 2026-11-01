# 🚩 挑战：⚖️ 构建一个 DEX

![readme-4](https://raw.githubusercontent.com/scaffold-eth/se-2-challenges/challenge-dex/extension/packages/nextjs/public/hero.png)

💵 在这个 Speedrun Ethereum 挑战中，你将构建一个交易所，可以把 ETH 兑换成代币、把代币兑换成 ETH。💰 之所以能做到这一点，是因为智能合约同时持有两种资产的储备，并有一个基于储备比例的价格函数。流动性提供者会获得一种代币，代表他们在储备和手续费中所占的份额。

🧮 你将实现一个最小化的恒定乘积做市商（类似 Uniswap v2）：DEX 持有两种资产的储备，并使用定价曲线 \(x * y = k\)。你将添加交易和流动性提供功能，然后在前端界面中试用。

🌟 最终交付物是一个应用，让用户可以兑换 **ETH ↔︎ $BAL** 并提供/提取流动性。部署到公共测试网，发布前端，然后在 [SpeedrunEthereum.com](https://speedrunethereum.com) 上提交！

> 💬 在 [挑战 Telegram 群](https://t.me/+_NeUIJ664Tc1MzIx) 中结识同样在做这个挑战的其他开发者，并获取帮助

---

## Checkpoint 0: 📦 环境 📚

🧰 开始之前，你需要安装以下工具：

- [Node (>= v20.18.3)](https://nodejs.org/en/download/)
- Yarn（[v1](https://classic.yarnpkg.com/en/docs/install/) 或 [v2+](https://yarnpkg.com/getting-started/install)）
- [Git](https://git-scm.com/downloads)
- [Foundry](https://book.getfoundry.sh/getting-started/installation)（如果你选择 Foundry 作为 Solidity 框架）

然后运行以下命令，把挑战下载到你的电脑并安装依赖：

```sh
npx create-eth@2.0.23 -e challenge-dex challenge-dex
```

> 出现提示时，选择你偏好的 Solidity 框架：**Hardhat** 或 **Foundry**。

```sh
cd challenge-dex
```

> 在同一个终端中，启动本地网络（运行在你电脑上的区块链模拟器）：

```sh
yarn chain
```

> 在第二个终端窗口中，🛰 部署你的合约（本地）：

```sh
cd challenge-dex
yarn deploy
```

> 在第三个终端窗口中，启动你的 📱 前端：

```sh
cd challenge-dex
yarn start
```

📱 打开 http://localhost:3000 查看应用。

> _注意：截图中的界面可能与当前版本略有不同。_

> 👩‍💻 每当你想把合约改动部署到前端时，重新运行 `yarn deploy`。运行 `yarn deploy --reset` 可以进行一次全新部署，即使合约没有改动也会重新部署。

---

⚠️ 我们已通过 `.vscode/settings.json` 禁用了 Cursor 的自动建议（Tab 补全和预测），以减少你写代码时的干扰。AI 聊天和 agent 功能仍然可用，并且我们附带了包含项目上下文的 `AGENTS.md` 和 `CLAUDE.md` 文件，帮助 AI 助手理解代码库。

🔒 想禁用 AI、一切亲力亲为？（推荐这样做，有助于更深入地学习）：

- Cursor：在项目根目录的 `.cursorignore` 文件中添加 `*`
- VSCode：在 `.vscode/settings.json` 文件中把 `chat.disableAIFeatures` 设为 `true`

---

## 🤖 AI 引导学习模式（可选）

想要一个在你写代码时为你讲解概念的交互式导师吗？本挑战支持 **AI 引导学习模式**！

1. 在 **Claude Code** 或 **Cursor** 等 AI 编程工具中打开本项目
2. 运行 `/start` 命令
3. AI 导师会先讲解每个概念，然后给你布置一个编码任务
4. 你编写代码后说 **"check"**，AI 会运行测试
5. 需要帮助时说 **"hint"**，如果想让 AI 直接展示答案，就用 **`/skip`**
6. 你的进度会被保存——随时使用 `/start` 继续

AI 不会直接把答案告诉你——它会先讲解，再让你自己实现代码。测试会验证你的成果，如果有测试没通过，AI 会帮你调试。

---

## Checkpoint 1: 🔭 项目结构 📺

🧭 切换到 `Debug Contracts` 标签页，你应该能看到两个智能合约，分别叫 `DEX` 和 `Balloons`。

<Tabs>
<Tab label="Hardhat">

**Hardhat**

- `packages/hardhat/contracts/Balloons.sol`：一个简单的 ERC20，会给部署者铸造一些 $BAL
- `packages/hardhat/contracts/DEX.sol`：你将要实现的交易所合约

</Tab>
<Tab label="Foundry">

**Foundry**

- `packages/foundry/contracts/Balloons.sol`：一个简单的 ERC20，会给部署者铸造一些 $BAL
- `packages/foundry/contracts/DEX.sol`：你将要实现的交易所合约

</Tab>
</Tabs>

> 下面是智能合约中还没有实现代码时前端的样子。按钮很可能无法正常工作，因为它们还没有关联任何函数！
![firstLoad](https://github.com/user-attachments/assets/f8b2ec8f-444d-4ec0-969b-3edafcbc36c9)

🗂️ 你可以在这里找到该页面的代码：`packages/nextjs/app/dex/page.tsx`

🔍 你会注意到，前端调用了 DEX 合约中定义的几个函数。

🎯 这些函数内部都还没有任何逻辑。这就是你的任务！让我们在接下来的几个 Checkpoint 中实现它们。

---

## Checkpoint 2: ⚖️ 储备

🏦 要开始交易，DEX 需要同时拥有 ETH 和 $BAL **两种**储备。

💧 这些储备将提供流动性，让任何人都能在这两种资产之间进行兑换。

🧾 让我们先声明 `totalLiquidity` 以及 DEX 每个用户的 `liquidity`！

🌱 然后你将实现 `init(uint256 tokens)`，用于首次为池子注入初始资金。

### 🏗️ 实现储备 + `init()`

- 添加 `totalLiquidity` 和 `liquidity` mapping。
- 在 `DEX.sol` 中定义以下自定义错误：
  - `DexAlreadyInitialized()`
  - `TokenTransferFailed()`
- `init(tokens)` 只能生效一次（当 `totalLiquidity == 0` 时）。如果已经初始化过，则回滚（revert）。
- 它应当把 `totalLiquidity` 设为合约的 ETH 余额（在收到 `msg.value` 之后）。
- 它应当把全部初始流动性分配给初始化者。
- 它应当使用 `transferFrom` 从初始化者那里拉取 `tokens`（需要先调用 ERC20 的 `approve`）。

🧪 还要实现 `getLiquidity(address lp)`，因为前端和测试都会用到它。

<details markdown='1'>
<summary>🔎 提示</summary>

🔑 在 `init()` 能从用户那里拉取代币之前，用户必须先在 Balloons 合约上调用 `approve(spender, amount)`。

ℹ️ 另外值得了解：

- 随交易发送的 ETH 会在函数体执行之前到达合约，所以在 `init()` 内部，`address(this).balance` 已经包含了 `msg.value`。

<details markdown='1'>
<summary>🎯 答案</summary>

```solidity
/////////////////
/// 错误 //////
/////////////////

error DexAlreadyInitialized();
error TokenTransferFailed();

//////////////////////
/// 状态变量 //
//////////////////////
// ...
uint256 public totalLiquidity;
mapping(address => uint256) public liquidity;
// ...

function init(uint256 tokens) public payable returns (uint256 initialLiquidity) {
    // 池子只能初始化一次。
    if (totalLiquidity != 0) revert DexAlreadyInitialized();

    // ETH 在函数执行前就已到账，所以这里的余额已包含 msg.value。
    initialLiquidity = address(this).balance;
    totalLiquidity = initialLiquidity;
    liquidity[msg.sender] = initialLiquidity;

    if (!token.transferFrom(msg.sender, address(this), tokens)) revert TokenTransferFailed();
    return initialLiquidity;
}
// ...
function getLiquidity(address lp) public view returns (uint256 lpLiquidity) {
    return liquidity[lp];
}
```

</details>
</details>

### 🧪 试一试

🧩 去部署脚本中取消注释那一行向你的前端地址发送 10 BAL 的代码（并确保粘贴的是你真实的前端地址）。

<Tabs>
<Tab label="Hardhat">

**Hardhat**

`packages/hardhat/deploy/00_deploy_dex.ts`

</Tab>
<Tab label="Foundry">

**Foundry**

`packages/foundry/script/DeployDEX.s.sol`

</Tab>
</Tabs>

🔁 现在重新部署（`yarn deploy --reset`），访问 `http://localhost:3000/dex`，使用 `Balloons` 合约调用 `approve()`，参数为：
  - spender = DEX 地址
  - amount = 一些 $BAL（例如 5）
![balloons-dex-tab](https://github.com/scaffold-eth/se-2-challenges/assets/55535804/710f5c9a-d898-4012-9014-4c46f1de015f)

🤝 从水龙头（faucet）领取 5 个以上的 ETH，然后在 Debug 标签页（`http://localhost:3000/debug`）中找到 DEX 合约，用等量的 ETH 和 $BAL 调用 `init()`：
  - tokens = 5 (* 10**18)
  - payable value = 5 (* 10**18)
![multiply-wei](https://github.com/scaffold-eth/se-2-challenges/assets/55535804/531cab0b-2b37-4489-88c3-d36c0755d2d1)

✅ 回到 DEX 标签页 `http://localhost:3000/dex`，确认：
  - DEX 显示了 ETH + $BAL 储备
  - 你的流动性数值（`💦💦`）不为零
![CheckLiquAndBalance](https://github.com/user-attachments/assets/a8b14fc4-3626-420a-9b99-a8dc5c67fe6e)

### 🧪 测试你的进度

▶️ 运行：

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

## Checkpoint 3: 🤑 price()

📈 现在我们的合约同时持有 ETH 和 BAL 代币的储备，我们希望用一个简单的公式来确定两者之间的兑换比率。

✨ 从这里开始，我们将领略 AMM 的魔力。它使用的是恒定乘积公式，该公式归功于 Martin Koppelmann，Vitalik 在[这篇文章](https://ipfs.io/ipfs/bafybeidtudmi6qajjcsfwnieepuuu6buz2lo7gip3no2iugut6f75vjmd4/general/2017/06/22/marketmakers.html)中提到过它，后来被 [Uniswap](https://app.uniswap.org/) 采用。

🧮 公式如下：

```
x * y = k
``` 

📦 其中 `x` 和 `y` 是储备，所以：

```
( DEX 中的 ETH 数量 ) * ( DEX 中的代币数量 ) = k
```

🧷 `k` 被称为不变量（invariant），因为它在交易过程中**不会改变**。（`k` 只会在添加流动性时改变。）如果我们把这个公式画出来，会得到一条大致如下的曲线：

![image](https://user-images.githubusercontent.com/12072395/205343533-7e3a2cfe-8329-42af-a35d-6352a12bf61e.png)

> 💡 我们只是在用一种资产兑换另一种资产，所谓“价格”基本上就是：投入一定数量的输入资产后，你能得到多少输出资产。

🤯 这就是关键所在！基于这样一条曲线的市场**始终有流动性**，但要记住，随着比例越来越失衡，同样的交易量能换到的流动性较差的那种资产会越来越少。再说一遍，如果智能合约中 ETH 太多而 $BAL 代币不足，那么用 $BAL 代币兑换 ETH 的价格就应该更划算。

🔄 我们调用 `init()` 时，以 1:1 的比例存入了 ETH 和 $BAL 代币。当一种资产的储备发生变化时，另一种资产也必须反向变化，以维持恒定乘积公式（不变量 `k`）。

### 🛠️ 实现 `price()` 函数

🛠️ 现在，我们来编辑 `DEX.sol` 智能合约，补全 price 函数！

🧠 price 函数应接收 `xReserves`、`yReserves` 和 `xInput` 作为输入，计算出 `yOutput`。

> 别忘了交易手续费！这些手续费对激励流动性提供者很重要。我们把交易手续费设为 0.3%，并且记住 Solidity 中没有浮点数或小数，只有整数！

我们应该对 `xInput` 收取手续费，并把结果存到一个新变量 `xInputWithFee` 中。我们希望输入值立即支付手续费，否则就会不小心对 `yOutput` 或 DEX 的供应量 `k` 征税 😨 想一想如何对 `xInput` 收取 0.3% 的手续费。

> 提示：因为 Solidity 中没有小数，你可以先把输入乘以 **997**（扣除 0.3% 手续费后为 99.7%），再把结果除以 **1000**，达到同样的效果。

✅ 你的 `price(xInput, xReserves, yReserves)` 函数应返回 y 资产的输出数量。

<details markdown='1'>
<summary>🔎 提示</summary>

🧮 带手续费的标准 Uniswap 风格公式如下：

- `xInputWithFee = xInput * 997`
- `numerator = xInputWithFee * yReserves`
- `denominator = (xReserves * 1000) + xInputWithFee`
- `yOutput = numerator / denominator`

<details markdown='1'>
<summary>🎯 答案</summary>

```solidity
function price(uint256 xInput, uint256 xReserves, uint256 yReserves) public pure returns (uint256 yOutput) {
    uint256 xInputWithFee = xInput * 997;
    uint256 numerator = xInputWithFee * yReserves;
    uint256 denominator = (xReserves * 1000) + xInputWithFee;
    return numerator / denominator;
}
```

</details>
</details>

### 🧪 试一试

🧩 取消注释部署脚本中的 init 部分，这样你就不必手动添加流动性了。

<Tabs>
<Tab label="Hardhat">

**Hardhat**

`packages/hardhat/deploy/00_deploy_dex.ts`

</Tab>
<Tab label="Foundry">

**Foundry**

`packages/foundry/script/DeployDEX.s.sol`

</Tab>
</Tabs>

🔁 现在重新部署，前往 `http://localhost:3000/dex`，在兑换输入框中输入数值。曲线预览会随之移动，并显示输出估算值（包含 0.3% 的手续费）。

假设我们有 100 万 ETH 和 100 万个代币，如果把它们代入价格公式，询问 1000 ETH 的价格，结果会几乎是 1:1 的比例。在 Debug 标签页中试试：

![price-example-1](https://github.com/scaffold-eth/se-2-challenges/assets/55535804/e2d725cc-91f3-454d-902f-b39e4b51f5e2)

如果我们投入 1000 ETH，将收到 996 个代币。如果我们支付的是 0.3% 的手续费，在一切完美的情况下应该是 997 个。但是，随着合约偏离原始比例，会产生一点点滑点。让我们深入研究一下，真正理解这里发生了什么。
假设有 500 万 ETH，而只有 100 万个代币。然后，我们想投入 1000 个代币。这意味着我们应该收到大约 5000 ETH：

![price-example-2](https://github.com/scaffold-eth/se-2-challenges/assets/55535804/349db3d8-e39e-4c94-8026-e01da2cefb8e)

最后，假设比例相同，但我们想兑换 100,000 个代币，而不仅仅是 1000 个。我们会注意到滑点要大得多。我们拿回的不是 498,000，而只有 453,305，因为我们对储备造成了很大的冲击。

![price-example-3](https://github.com/scaffold-eth/se-2-challenges/assets/55535804/f479d7cd-0e04-4aa7-aa52-cef30d747af3)

❗️ 当储备比例偏离平衡点时，合约会自动调整价格。这被称为 🤖 _自动做市商（Automated Market Maker，AMM）。_

### 🧪 测试你的进度

▶️ 运行：

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

## Checkpoint 4: 🤝 兑换

🛠️ 现在来实现兑换函数：

- `ethToToken()` 兑换 **ETH → $BAL**
- `tokenToEth(tokenInput)` 兑换 **$BAL → ETH**

🧠 关键思路：你必须在计入本次兑换的输入金额**之前**，从合约中算出储备。

### 🏗️ 实现 `ethToToken()` + `tokenToEth()`

🧾 在 `DEX.sol` 中定义以下事件：

```solidity
event EthToTokenSwap(address swapper, uint256 tokenOutput, uint256 ethInput);
event TokenToEthSwap(address swapper, uint256 tokensInput, uint256 ethOutput);
```

🚫 先在 `DEX.sol` 中定义以下自定义错误：

```solidity
error TokenTransferFailed(); // 应该已经存在
error InvalidEthAmount();
error InvalidTokenAmount();
error InsufficientTokenBalance(uint256 available, uint256 required);
error InsufficientTokenAllowance(uint256 available, uint256 required);
error EthTransferFailed(address to, uint256 amount);
```

✍️ 现在以这些事件和错误为指引，编写 `ethToToken()` 和 `tokenToEth()`。看看你能否不看提示就全部搞定！

<details markdown='1'>
<summary>🔎 提示</summary>

💡 对于 `ethToToken()`，合约的 ETH 余额已经包含了 `msg.value`，所以兑换**之前**的 ETH 储备是：

- `ethReserve = address(this).balance - msg.value`

💡 对于 `tokenToEth(tokenInput)`，你需要检查授权额度，并且应使用 `call` 发送 ETH：

- `(bool sent,) = msg.sender.call{value: ethOutput}("");`

📣 别忘了触发兑换事件。

<details markdown='1'>
<summary>🎯 答案</summary>

```solidity
function ethToToken() public payable returns (uint256 tokenOutput) {
    if (msg.value == 0) revert InvalidEthAmount();
    uint256 ethReserve = address(this).balance - msg.value;
    uint256 tokenReserve = token.balanceOf(address(this));
    tokenOutput = price(msg.value, ethReserve, tokenReserve);

    if (!token.transfer(msg.sender, tokenOutput)) revert TokenTransferFailed();
    emit EthToTokenSwap(msg.sender, tokenOutput, msg.value);
    return tokenOutput;
}

function tokenToEth(uint256 tokenInput) public returns (uint256 ethOutput) {
    if (tokenInput == 0) revert InvalidTokenAmount();
    uint256 bal = token.balanceOf(msg.sender);
    if (bal < tokenInput) revert InsufficientTokenBalance(bal, tokenInput);
    uint256 allow = token.allowance(msg.sender, address(this));
    if (allow < tokenInput) revert InsufficientTokenAllowance(allow, tokenInput);
    uint256 tokenReserve = token.balanceOf(address(this));
    ethOutput = price(tokenInput, tokenReserve, address(this).balance);
    if (!token.transferFrom(msg.sender, address(this), tokenInput)) revert TokenTransferFailed();
    (bool sent, ) = msg.sender.call{ value: ethOutput }("");
    if (!sent) revert EthTransferFailed(msg.sender, ethOutput);
    emit TokenToEthSwap(msg.sender, tokenInput, ethOutput);
    return ethOutput;
}
```

</details>
</details>

### 🧪 试一试

🌐 前往 `http://localhost:3000/dex` 并尝试：

- `ethToToken`：输入一些 ETH，然后点击 Send
- `tokenToETH`：先在 Balloons 区域中授权 DEX，然后把代币兑换回 ETH
- 查看 Events 标签页，确保兑换事件按预期显示

🎉 现在你真的可以在代币和 ETH 之间来回兑换了。太棒了！只需极少的基础设施，借助这个简单的 `x * y = k` 公式，你就能让人们自由地换入、换出任意一组代币！

### 🧪 测试你的进度

▶️ 运行：

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

## Checkpoint 5: 🌊 流动性

🧩 到目前为止，只有 `init()` 函数控制着流动性。为了让它更加去中心化，我们来让任何人都可以按正确的比例向 DEX 同时发送 ETH 和代币，从而向流动性池添加流动性。

🧠 重要的是让任何人都能添加流动性，并允许他们之后移除流动性，同时保持池子的比例一致。

- `deposit()` 接收 ETH（`msg.value`），并从存入者那里拉取相应数量的 $BAL，按正确比例给发送者铸造 LPT
- `withdraw(amount)` 销毁 LPT，并按池子储备的比例返还 ETH + $BAL

### 🏗️ 实现 `deposit()` + `withdraw()`

🧾 首先在 `DEX.sol` 中定义以下事件：

```solidity
event LiquidityProvided(address liquidityProvider, uint256 liquidityMinted, uint256 ethInput, uint256 tokensInput);
event LiquidityRemoved(address liquidityRemover, uint256 liquidityWithdrawn, uint256 tokensOutput, uint256 ethOutput);
```

🚫 然后添加这个自定义错误：

```solidity
error InsufficientLiquidity(uint256 available, uint256 required);
```

✍️ 现在去编写 `deposit()` 和 `withdraw()` 函数的逻辑。

🧠 确保检查他们已授权（并且余额中有）足够的 BAL 代币，以便为两侧都提供流动性，这样即使这次 `k` 在变化，`x * y = k` 依然成立。

🧮 在存入这一侧，计算需要添加多少 BAL 代币时，记得在结果上额外加 1 wei。

> Solidity 执行的是**整数除法**，总是向**下**取整。这意味着 `msg.value * tokenReserve / ethReserve` 可能比“真实”的按比例数量略小一点（因为小数部分被舍弃了）。如果我们使用向下取整后的值，LP 存入的 $BAL 相对于他们添加的 ETH 就会稍微少一点，从而使池子比例发生偏移，并可能导致后续那些假定池子保持充足抵押的检查失败。加上 `+ 1` 是一种低成本的方式，相当于按最小单位“向上取整”，让存入始终偏向保守的一侧（代价是最多多付 1 wei 的代币）。

别忘了把新的流动性（用 💦 代币表示）加到用户的余额上，同时也加到总流动性上（实际上，这就是 `k`）。

<details markdown='1'>
<summary>🔎 提示</summary>

💡 对于 `deposit()`，你可以根据现有储备推导出所需存入的代币数量：

- `tokenDeposit = (msg.value * tokenReserve / ethReserve) + 1`

🧾 以及铸造的流动性：

- `liquidityMinted = msg.value * totalLiquidity / ethReserve`

<details markdown='1'>
<summary>🎯 答案</summary>

```solidity
    function deposit() public payable returns (uint256 tokensDeposited) {
        if (msg.value == 0) revert InvalidEthAmount();
        uint256 ethReserve = address(this).balance - msg.value;
        uint256 tokenReserve = token.balanceOf(address(this));

        uint256 tokenDeposit = (msg.value * tokenReserve / ethReserve) + 1;

        uint256 bal = token.balanceOf(msg.sender);
        if (bal < tokenDeposit) revert InsufficientTokenBalance(bal, tokenDeposit);
        uint256 allow = token.allowance(msg.sender, address(this));
        if (allow < tokenDeposit) revert InsufficientTokenAllowance(allow, tokenDeposit);

        uint256 liquidityMinted = msg.value * totalLiquidity / ethReserve;
        liquidity[msg.sender] += liquidityMinted;
        totalLiquidity += liquidityMinted;

        if (!token.transferFrom(msg.sender, address(this), tokenDeposit)) revert TokenTransferFailed();
        emit LiquidityProvided(msg.sender, liquidityMinted, msg.value, tokenDeposit);
        return tokenDeposit;
    }

function withdraw(uint256 amount) public returns (uint256 ethAmount, uint256 tokenAmount) {
    uint256 availableLp = liquidity[msg.sender];
    if (availableLp < amount) revert InsufficientLiquidity(availableLp, amount);
        uint256 ethReserve = address(this).balance;
        uint256 tokenReserve = token.balanceOf(address(this));

    uint256 ethWithdrawn = amount * ethReserve / totalLiquidity;
    uint256 tokensWithdrawn = amount * tokenReserve / totalLiquidity;

        liquidity[msg.sender] -= amount;
        totalLiquidity -= amount;

        (bool sent, ) = payable(msg.sender).call{ value: ethWithdrawn }("");
    if (!sent) revert EthTransferFailed(msg.sender, ethWithdrawn);
    if (!token.transfer(msg.sender, tokensWithdrawn)) revert TokenTransferFailed();

    emit LiquidityRemoved(msg.sender, amount, tokensWithdrawn, ethWithdrawn);
    return (ethWithdrawn, tokensWithdrawn);
}
```

 </details>
 </details>

### 🧪 试一试

🔁 重新部署，然后前往 `http://localhost:3000/dex` 并尝试：

- 授权 DEX 花费你的 $BAL
- 存入一些 ETH（并观察它同时也会拉取代币）
- 提取一些流动性，并确认你同时收回了 ETH 和 $BAL
- 查看 Events 标签页，确保事件按预期显示

### 🧪 测试你的进度

▶️ 运行：

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

---

## Checkpoint 6: 💾 部署你的合约！🛰

🔐 使用 `yarn generate` 生成一个部署者地址。这会创建一个唯一的部署者地址，并把助记词保存在本地。

👩‍🚀 使用 `yarn account` 查看你的部署者账户余额。

⛽️ 你需要用自己的钱包向部署者地址发送 ETH，或者从你所选网络的公共水龙头获取。你也可以在 [挑战 Telegram 群](https://t.me/+_NeUIJ664Tc1MzIx) 中发送消息，附上你的新部署者地址和偏好的网络来请求 ETH。大家通常都非常乐意分享。

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

## Checkpoint 7: 🚢 发布你的前端！🚁

✏️ 编辑 `packages/nextjs/scaffold.config.ts` 中的前端配置，把 `targetNetwork` 改为 `chains.sepolia`（如果你部署到了 OP Sepolia，则改为 `chains.optimismSepolia`）

💻 在 http://localhost:3000 查看你的前端，确认显示的是正确的网络。

📡 当你准备好发布前端应用时……

📦 运行 `yarn vercel` 打包并部署你的前端。

> 你可能需要先运行 `yarn vercel:login` 登录 Vercel。登录后（通过邮箱、GitHub 等），使用默认选项即可。

> 如果你想重新部署到同一个生产环境 URL，可以运行 `yarn vercel --prod`。如果省略 `--prod` 参数，它会部署到一个预览/测试 URL。

> 按照步骤部署到 Vercel。它会给你一个公开的 URL。

> 🦊 由于我们已经部署到公共测试网，你现在需要使用自己拥有的钱包或 burner wallet（临时钱包）来连接。默认情况下，🔥 `burner wallets` 只在本地网络（`hardhat`/`foundry`）上可用。你可以在前端配置（`packages/nextjs/` 中的 `scaffold.config.ts`）里设置 `burnerWalletMode: "allNetworks"`，在所有链上启用它们

#### ⚙️ 为生产级应用配置第三方服务。

默认情况下，🏗 Scaffold-ETH 2 为 Alchemy 和 Etherscan 等常用服务提供了预设的 API key。这让你可以更轻松地开始开发和测试应用，而无需注册这些服务。
这对于完成你的 **Speedrun Ethereum** 来说已经足够了。

对于生产级应用，建议获取你自己的 API key（以避免触发速率限制）。你可以在以下位置进行配置：

<Tabs>
<Tab label="Hardhat">

**Hardhat**

- 🔷 `packages/hardhat/.env` 和 `packages/nextjs/.env.local` 中的 `ALCHEMY_API_KEY` 变量。你可以在 [Alchemy 控制台](https://dashboard.alchemy.com/) 创建 API key。
- 📃 `packages/hardhat/.env` 中的 `ETHERSCAN_API_KEY` 变量，填入你生成的 API key。你可以在[这里](https://etherscan.io/myapikey)获取 key。

</Tab>
<Tab label="Foundry">

**Foundry**

- 🔷 `packages/foundry/.env` 和 `packages/nextjs/.env.local` 中的 `ALCHEMY_API_KEY` 变量。你可以在 [Alchemy 控制台](https://dashboard.alchemy.com/) 创建 API key。
- 📃 `packages/foundry/.env` 中的 `ETHERSCAN_API_KEY` 变量，填入你生成的 API key。你可以在[这里](https://etherscan.io/myapikey)获取 key。

</Tab>
</Tabs>
> 💬 提示：对于线上应用，建议把 nextjs 的环境变量存放在 Vercel/系统环境变量配置中，本地测试时使用 .env.local。

---

## Checkpoint 8: 📜 合约验证

运行 `yarn verify --network your_network` 命令，在 etherscan 上验证你的合约 🛰

👀 你可能会看到 Balloons 和 DEX 两个合约的地址。你需要的是 DEX 合约地址。

👉 在 [Sepolia Etherscan](https://sepolia.etherscan.io/)（如果你部署到了 OP Sepolia，则用 [Optimism Sepolia Etherscan](https://sepolia-optimism.etherscan.io/)）上搜索这个地址，获取要提交到 🏃‍♀️[SpeedrunEthereum.com](https://speedrunethereum.com) 的 URL。

## Checkpoint 9: 深入理解与后续步骤

🎉 你已经构建出了一个可以正常运行的 DEX。真是了不起的成就！现在你有了很好的背景知识，可以开始理解各种不同的 DEX 设计了。去研究一下最新的 DEX 设计及其改进吧。

🧩 你很快就会遇到的一点是：你自己的 DEX 存在一些局限性。

📖 由于兑换函数并不保证能换出一定数量的“输出”代币，任何在内存池（mempool）中看到你交易的人，都可以抢在你前面发送一笔交易（例如使用更高的 gas 价格），把流动性沿曲线向下推动，使你得到更少的代币。然后在你的交易执行后，他们可以立即用另一笔排好的交易把代币反向兑换回来。结果就是他们带走了这部分“滑点”，也就是你最初拿到的报价与你最终实际得到的代币数量之间的差额。
> 附注：这被称为三明治攻击（sandwich attack），是一种常见的 MEV 形式（去查一查吧！）。

💡 解决办法显而易见：如果报价 != “输出”代币的数量，就直接让函数回滚（revert）。这样可以保护你免受三明治攻击，但会引入另一个问题……

🤼 有两个诚实的人想要进行兑换。数量和方向都无所谓。他们拿到各自的报价，并几乎同时执行（两笔交易会被打包进同一个区块）。但是等等，如果其中一个人先完成了兑换，那么当第二个人尝试兑换时，流动性已经变了，导致他的交易回滚，因为“输出”代币的数量与他拿到的报价不一致。一个区块里只有一个人能执行兑换。这是多么大的瓶颈啊！

🎯 更完善的解决方案是在兑换中允许*一定程度*的“滑点”。这样，只要执行价格在报价的某个百分比范围内，你的交易就会执行。这样你就知道每次兑换*至少*能收到 X 数量的代币，而其他人仍然可以在同一个区块中、在你之前和之后进行任意方向的兑换。搞定！

---

> 🏃 前往你的下一个挑战，[点击这里](https://speedrunethereum.com)。
> 💬 对技术栈有问题、疑问或意见？发到 [🏗 scaffold-eth 开发者群](https://t.me/joinchat/F7nCRK3kI93PoCOk)
