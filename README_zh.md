# 📈📉🏎️ 预测市场挑战

![readme-4](https://raw.githubusercontent.com/scaffold-eth/se-2-challenges/challenge-prediction-markets/extension/packages/nextjs/public/hero.png)

# 简介

🔮 本 Speedrun Ethereum 挑战将引导你构建并理解一个简单的预测市场：用户可以根据某个事件的结果买卖 ERC20 结果份额。你将扮演三个角色：流动性提供者、预言机和用户。那么这个事件是什么？是一场绿车与红车之间的赛车比赛！🏎️🏁

我们会带你实现最基础的 Solidity 函数，并探索一个完全链上的预测市场可以如何构建。

<details markdown='1'><summary>预测市场是如何演变的（点击展开）</summary>

预测市场本身已经存在很长时间了，有记录显示**华尔街的选举投注可以追溯到 1884 年**（参见[这个维基百科页面](https://en.wikipedia.org/wiki/Prediction_market)）。在以太坊上，预测市场早已是人们关注的话题，但它花了一些时间才真正兴起。

Polymarket 是一个预测市场，也是当今加密原生用户和普通用户使用最广泛的区块链应用之一。它在**美国大选**期间获得了尤为显著的关注。

例如，在 **2024 年美国总统大选**期间，**Polymarket** 上押注 **Donald Trump 与 Kamala Harris** 之争的金额超过了 **33 亿美元**（截至 2024 年 11 月 5 日）。（参见[维基百科](https://en.wikipedia.org/wiki/Polymarket)）

从本质上讲，预测市场是一个**投注市场**，用户可以对一个有**固定结束日期**的未来事件的结果下注。它与传统投注平台的关键区别在于：在大多数传统平台上，**一旦下注，你就被锁定了**。而在**预测市场**中，你可以在事件结束前**卖出你的仓位**。此外，你还能享受无需许可（permissionless）等所有链上优势。

押注某个结果的人越多，这一方就变得**越贵**，而另一方则变得**越便宜**。这种**动态定价机制**决定了一个隐含的**概率**，它有时比专家意见、民调或评论员的判断更准确。因为当存在获利空间时，人们有金钱上的激励去“更新”某个数据点；而谎报则会面临经济损失这种反向激励。

 </details>

### 🧠 我们的预测市场如何运作

我们要构建的是一个二元预测市场，也就是说，用户针对一个是非问题下注，比如本例中的：

> ❓ 绿车会赢得比赛吗？

当你购买份额时，你是在两种结果代币之间做选择："Yes" 和 "No"。在市场关闭之前，每份份额都可以随时交易。

- ✅ 如果你持有获胜的代币，它会支付 0.01 ETH

- ❌ 如果你持有失败的代币，它价值 0 ETH

- 🧮 在结果揭晓之前，代币价格在 0 到 0.01 ETH 之间波动，反映每个结果的概率

- 🔄 两种代币的价格之和始终等于 0.01 ETH，就像 Polymarket 上每份份额支付 1 USDC 一样

### 🔄 我们的设计有何不同

与传统投注市场不同，我们不会在你买入后把你锁定。只要市场尚未结算，你就可以随时买入或卖出结果份额。

与 Polymarket 使用的订单簿不同，我们使用自动做市商（AMM）。这意味着：

- 🧪 你可以即时交易——无需寻找交易对手方

- 💸 它更容易实现，在链上也更节省 gas

### 💧 流动性从哪里来

要启动一个市场，必须有人提供初始流动性——锁入抵押品来为结果代币提供支撑。

- 流动性提供者（LP）从交易活动中赚取手续费

- 但他们也要承担风险，因为失败一方的代币会变得一文不值

这就是为什么热门平台会精心挑选市场，以确保有足够的关注度和交易量，[参见 Polymarket 文档](https://learn.polymarket.com/docs/guides/get-started/what-is-polymarket/)。

### 🌐 但谁来决定结果呢？

区块链无法知道一场比赛是赢是输——所以我们使用预言机。

预言机是一种去中心化的方式，用来获取现实世界的数据（比如“哪辆车赢了？”），并以所有人都能信任的方式把它报告到链上。没有预言机，就无法安全地结算预测市场。

让我们开始挑战吧。

> 💬 在 [预测市场挑战 Telegram 群组](https://t.me/+NY00cDZ7PdBmNWEy) 中认识其他正在做这个挑战的开发者，并获得帮助

## Checkpoint 0: 📦 环境 📚

开始之前，你需要安装以下工具：

- [Node (>= v20.18.3)](https://nodejs.org/en/download/)
- Yarn（[v1](https://classic.yarnpkg.com/en/docs/install/) 或 [v2+](https://yarnpkg.com/getting-started/install)）
- [Git](https://git-scm.com/downloads)
- [Foundry](https://book.getfoundry.sh/getting-started/installation)（仅当你选择 Foundry 作为框架时需要）

然后把挑战下载到你的电脑上，并运行以下命令安装依赖：

```sh
npx create-eth@2.0.23 -e challenge-prediction-markets challenge-prediction-markets
cd challenge-prediction-markets
```

出现提示时，选择你偏好的框架（Hardhat 或 Foundry）。

> 启动你的本地网络（运行在你电脑上的区块链模拟器）：

```sh
yarn chain
```

在第二个终端窗口中，🛰 部署你的合约（本地）：

```sh
cd challenge-prediction-markets
yarn deploy
```

在第三个终端窗口中，启动你的 📱 前端：

```sh
cd challenge-prediction-markets
yarn start
```

📱 打开 [http://localhost:3000](http://localhost:3000/) 查看应用。

> *注意：截图中的界面可能与当前版本略有不同。*

> 👩‍💻 每当你想把合约改动部署到前端时，重新运行 `yarn deploy` 即可。运行 `yarn deploy --reset` 可以进行一次全新部署，即使合约没有改动。

前往 **`Debug Contracts`** 标签页，你应该能找到一个名为 **`PredictionMarket`** 的智能合约。这是我们的主合约，也是整个挑战中我们要编写的合约。由于我们还没有实现任何函数，它们目前都无法正常工作，你也看不到所有必要的状态变量。

> 🏎️ 🏁 既然我们要围绕这场赛车比赛构建预测市场，那就去 `User` 标签页看看吧！（比赛本身是完全独立的，对智能合约没有任何影响。）

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
5. 需要帮助时说 **"hint"**，如果你想让 AI 直接展示参考答案，就使用 **`/skip`**
6. 你的进度会被保存——随时使用 `/start` 继续

AI 不会直接把答案给你——它会先讲解，然后让你自己实现代码。测试会验证你的成果，如果有测试没通过，AI 会帮你调试。

---

## Checkpoint 1: 🔭 理解协议 📺

从本质上讲，我们的预测市场有三个核心组成部分：

- 🪙 用来表示结果的代币（比如 ERC20）

- 💧 让用户买卖份额的交易机制（AMM 或订单簿）

- 🔮 用来结算最终结果的预言机

在我们的版本中，当你部署市场时，它会创建两个 ERC20 代币——一个代表 "Yes"，一个代表 "No"。

<Tabs>
<Tab label="Hardhat">

🧱 你可以在 `packages/hardhat/contracts/PredictionMarketToken.sol` 中找到代币逻辑

你将直接在 `packages/hardhat/contracts/PredictionMarket.sol` 中编写代码。

</Tab>
<Tab label="Foundry">

🧱 你可以在 `packages/foundry/contracts/PredictionMarketToken.sol` 中找到代币逻辑

你将直接在 `packages/foundry/contracts/PredictionMarket.sol` 中编写代码。

> **注意：** 本指南中的截图展示的是 Hardhat 版本，但 Foundry 版本的合约代码和功能完全相同。

</Tab>
</Tabs>

这个合约在标准 ERC20 规范的基础上扩展了自定义的铸造和销毁逻辑。此外还有一个转账限制，用来阻止市场所有者转移代币——原因稍后揭晓 👀

### 🛠️ 主合约：PredictionMarket.sol

我们的协议围绕三个角色展开：

1. **👷‍♂️ 市场所有者 & 流动性提供者** – 创建市场并为其注入 ETH

2. **🧙 预言机** – 报告最终结果（yes 或 no）

3. **🙋‍♂️ 用户** – 交易份额，争取赢得 ETH

你猜怎么着？在这个挑战中，这三个角色你都要扮演。

不过我们先从最重要的角色开始：**👉 市场所有者 & 流动性提供者**

### 💦 为什么流动性要先行

在像我们这样基于 AMM 的系统中，没有初始流动性，市场就无法运作。这意味着必须有人预先存入 ETH。

下面是部署一个新市场时会发生的事情：

- ETH 作为抵押品被存入

- 合约创建 "Yes" 和 "No" 两种 ERC20 代币

- 合约铸造代币并将其加入流动性池

- 之后还可以追加或移除流动性

你将在 Checkpoint 2、3、4 和 6 中，在 Liquidity Provider（流动性提供者）标签页下实现这些逻辑。

<details markdown='1'><summary>看看 Liquidity Provider 标签页（点击展开）</summary>
    <img src="https://raw.githubusercontent.com/scaffold-eth/se-2-challenges/challenge-prediction-markets/extension/packages/nextjs/public/lp1.png" alt="pm-lp1" />
</details>

> ❗️目前你的前端已经实现好了，但由于你的智能合约中还没有任何实现代码，各个函数对应的按钮很可能会出错。不过很快就会有了！🙂

### 🔮 成为预言机

市场建立之后，需要有人来决定它如何结束。

在 Checkpoint 5 中，你将成为预言机——负责把事件的最终结果报告到链上的角色（Oracle 标签页）。

> 🧙‍♂️ 预言机就是链下事实（比如“绿车赢了吗？”）进入区块链世界的途径。

<details markdown='1'><summary>看看 Oracle 标签页（点击展开）</summary>
    <img src="https://raw.githubusercontent.com/scaffold-eth/se-2-challenges/challenge-prediction-markets/extension/packages/nextjs/public/oracle1.png" alt="pm-oracle1" />
</details>

### 👥 然后就该交易了！

市场创建好、预言机也准备就绪后，就轮到用户入场了（User 标签页）。

在 Checkpoint 7 到 9 中，你将构建核心的用户操作：

- 🛒 购买结果代币

- 💸 卖出结果代币以退出仓位

- 🎉 结果揭晓后赎回结果代币

你将拥有端到端的完整交易功能——全部由你的智能合约驱动。

<details markdown='1'><summary>看看 User 标签页（点击展开）</summary>
    <img src="https://raw.githubusercontent.com/scaffold-eth/se-2-challenges/challenge-prediction-markets/extension/packages/nextjs/public/user1.png" alt="pm-user1" />
</details>

> 🎉 你已经在 Scaffold-Eth 挑战中走到这一步了 👏🏼 。随着内容越来越复杂，最好先回顾一下挑战的设计要求！看看空的 PredictionMarket.sol 文件，了解每个函数的各方面要点。如果你能解释各个函数之间如何相互配合，那就太棒了！😎

> 🚨 🚨 🦈 引导问题会把你带向正确的方向，但在查看它们之前，先试着思考一下你会如何构建每个函数！

> 🚨 🚨 🦖 引导问题折叠区中的代码片段只是一些你可以参考的示例，但请先尝试自己编写函数的实现代码！

## Checkpoint 2: 🔭 预测市场的初始设置 🏠

在部署预测市场智能合约之前，我们需要先编写构造函数并声明一些关键变量——这是整个市场运行的基础。

可以把这一步看作是在启动你的协议的“大脑” 🧠

### 🧱 构造函数参数

部署市场时，你需要提供：

- **💧 `_liquidityProvider`** - 所有者地址，会被直接传入 Ownable

- **🧙 `_oracle`** – 之后负责报告结果的地址

- **❓ `_question`** – 实际要预测的问题（例如 "Will the green car win?"，即“绿车会赢吗？”）

- **💰 `_initialTokenValue`** – 一枚获胜代币所支付的 ETH 价值（例如 0.01 ETH）

- **📈 `_initialYesProbability`** – 开始时“Yes”发生的可能性（例如 50 表示 50%）

- **🔒 `_percentageToLock`** – 用于概率和定价逻辑（你将在 Checkpoint 3 中深入了解）

### 🧮 其他状态变量

你的合约还需要在市场的整个生命周期中跟踪以下数据：

- **🏆 `s_ethCollateral`**：支撑代币的 ETH 总额——可以把它看作你的奖池
- **💸 `s_lpTradingRevenue`** - 记录从用户买卖代币中赚取的手续费——这是 LP 的收益

<Tabs>
<Tab label="Hardhat">

> ❗️为了便于测试，我们在部署时把预言机地址设为与流动性提供者相同（参见 `00_deploy_your_contract.ts`）。另外，请**仔细检查我们传入构造函数的参数值**，比如 `_question` 等。（提示：把第一个 Hardhat 账户添加到你的钱包，或者添加你自己的账户，以预言机或合约所有者的身份进行交互。你可以在部署脚本中手动设置你的地址，或者运行 `yarn account:import`。）

</Tab>
<Tab label="Foundry">

> ❗️为了便于测试，我们在部署时把预言机地址设为与流动性提供者相同（参见 `DeployPredictionMarket.s.sol`）。另外，请**仔细检查我们传入构造函数的参数值**，比如 `_question` 等。（提示：把第一个 Anvil 账户添加到你的钱包，或者添加你自己的账户，以预言机或合约所有者的身份进行交互。你可以在部署脚本中手动设置你的地址，或者运行 `yarn account:import`。）

</Tab>
</Tabs>

> ⏰ 🚨 在生产环境的预测市场中，你通常会加入基于时间的限制，即一个**固定的结束日期**，以确保只有在所预测的事件发生之后才能报告结果。为了简单和便于测试，我们在本实现中省略了这个时间限制。

> 💡 `i_<variableName>` 表示不可变（immutable）变量，而 `s_<variableName>` 是可以修改的普通状态变量。

好了，让我们进入合约，开始为你的预测市场打基础吧！

<details markdown='1'><summary>🦉 引导问题</summary>

<details markdown='1'><summary>问题 1</summary>

> 我们需要跟踪的最重要的状态变量有哪些（提示：看看构造函数）？如何在构造函数中用正确的值初始化它们？哪些变量可以设为 `immutable`？

</details>

<details markdown='1'><summary>问题 2</summary>

> 在部署合约之前，我们应该在构造函数中加入哪些重要的检查？（提示：参考下面的问题获取更多指导，并确保在适用的地方使用 `errors` 部分中相应的自定义错误）

</details>

<details markdown='1'><summary>问题 3</summary>

> 如何确保在没有任何初始流动性的情况下无法创建预测市场？

</details>

<details markdown='1'><summary>问题 4</summary>

> 如何验证 `_initialYesProbability` 处于 0% 到 100% 的有效范围内？

</details>

<details markdown='1'><summary>问题 5</summary>

> 如何防止 `_percentageToLock` 超过 100%？

</details>

思考完这些引导问题后，再来看看参考答案代码吧！

<details markdown='1'><summary>👩🏽‍🏫 参考答案代码</summary>

```javascript
//////////////////////////
/// 状态变量 //////
//////////////////////////

address public immutable i_oracle;
uint256 public immutable i_initialTokenValue;
uint256 public immutable i_percentageLocked;
uint256 public immutable i_initialYesProbability;

string public s_question;
uint256 public s_ethCollateral;
uint256 public s_lpTradingRevenue;

//////////////////
////构造函数///
//////////////////

constructor(
    address _liquidityProvider,
    address _oracle,
    string memory _question,
    uint256 _initialTokenValue,
    uint8 _initialYesProbability,
    uint8 _percentageToLock
) payable Ownable(_liquidityProvider) {
    /// Checkpoint 2 ////
    if (msg.value == 0) {
        revert PredictionMarket__MustProvideETHForInitialLiquidity();
    }
    if (_initialYesProbability >= 100 || _initialYesProbability == 0) {
        revert PredictionMarket__InvalidProbability();
    }

    if (_percentageToLock >= 100 || _percentageToLock == 0) {
        revert PredictionMarket__InvalidPercentageToLock();
    }

    i_oracle = _oracle;
    s_question = _question;
    i_initialTokenValue = _initialTokenValue;
    i_initialYesProbability = _initialYesProbability;
    i_percentageLocked = _percentageToLock;

    s_ethCollateral = msg.value;

    /// Checkpoint 3 ////

}
```

</details>

</details>

运行以下命令，检查你是否正确实现了所有变量和检查。

<Tabs>
<Tab label="Hardhat">

```sh
yarn test --grep "Checkpoint2"
```

</Tab>
<Tab label="Foundry">

```sh
yarn test --match-test "Checkpoint2"
```

</Tab>
</Tabs>

> 🚨 在部署合约之前，我们还需要在接下来的 Checkpoint 3 中完成构造函数的实现。

## Checkpoint 3: 🔨🪙 铸造代币

是时候赋予你的预测市场交易能力了——铸造 "Yes" 和 "No" 代币！

当你部署 PredictionMarket 合约时，你还会创建两个 ERC20 代币合约，每个结果各一个。这一切都直接在构造函数中完成。

### 🚀 部署代币

部署预测市场合约时，我们还需要部署与之关联的 **"Yes"** 和 **"No"** 代币合约。为确保这一点，我们在构造函数中实例化这两个代币合约。

你的任务是向 PredictionMarketToken 构造函数传入正确的参数，从而部署这两种结果代币。

你需要提供：

- 🏷️ 代币**名称**（"Yes" 或 "No"）

- 🔤 代币**符号**（"Y" 或 "N"）

- 👤 市场所有者的**地址**

- 🔢 **初始代币供应量**（计算方法见下文）

要计算铸造多少代币，你需要用发送到合约中的 ETH 除以 `_initialTokenValue`。这样就得到了市场能够支撑的结果代币数量：

$$initialTokenAmount = \frac{msg.value}{initialTokenValue}$$

你将把部署好的代币合约存储在以下状态变量中：

- `i_yesToken`
- `i_noToken`

### 🎯 设置初始概率

作为市场创建者，你可以设定初始赔率——即 "Yes" 结果的初始概率。

例如，如果你认为绿车很有希望获胜，你可以设置：

$$initialYesProbability = 60$$

但问题来了：此时还没有发生任何交易。那么协议要如何体现这个初始概率呢？

### 🔒 锁定代币来模拟概率

我们使用一种代币锁定机制。通过把一部分代币当作已经被买走一样锁定起来，我们为市场提供了一个稳定的起点。

> 🧠 这就是为什么 PredictionMarketToken.sol 中禁止了市场创建者转移代币——防止这些被锁定的代币进入流通。

### 🧮 来看个实际例子

假设我们铸造了 100 个 "Yes" 代币和 100 个 "No" 代币。

你想模拟 60% 的 "Yes" 概率，并锁定代币总量的 10%。

我们这样计算锁定数量：

$$lockedYes = 100 * 60\% * 10\% * 2 = 12$$

$$lockedNo = 100 * 40\% * 10\% * 2 = 8$$

于是我们得到：

- 12 个锁定的 "Yes" 代币

- 8 个锁定的 "No" 代币

- 88 个 "Yes" + 92 个 "No" 代币可供交易

因此我们的初始概率为：

$$\frac{12}{12 + 8} = 60\%$$

### 🗝️ 为什么锁定很重要

1. 🧘‍♂️ 更平稳的开局 – 防止单笔交易引起剧烈波动
   如果不锁定，单笔 "Yes" 购买就会把概率推到 100%：

$$\frac{1}{1 + 0} = 100\%$$

2. ⚖️ 价格稳定 – 代币价格取决于当前的市场概率：

$$tokenPrice = initialTokenValue * marketProbability$$

这让你的市场拥有一个平衡、公平的开局，从一开始就内置了稳定性。

你不只是在铸造代币——你还在塑造市场的早期行为。

准备好写代码了吗？

> 💡 这个百分比可以任意选择，取决于你想如何设置预测市场。一开始锁定得越多，价格波动就越小，但可供交易的流动性也越少。

<details markdown='1'><summary>🦉 引导问题</summary>

<details markdown='1'><summary>问题 1</summary>

> 如何为每种代币计算正确的 initialTokenAmount？（提示：别忘了使用 PRECISION 常量来正确处理小数，因为 Solidity 不支持浮点运算）

</details>

<details markdown='1'><summary>问题 2</summary>

> 如何为 "Yes" 和 "No" 两种结果创建两个代币合约，并为每个合约铸造正确数量的代币？（提示：参考 PredictionMarketToken.sol 合约。）

</details>

<details markdown='1'><summary>问题 3</summary>

> 铸造出正确数量的代币后，如何确保把适当的部分锁定起来，以反映预测市场设定的初始概率？如何正确地把这些锁定的代币转移到合约所有者的地址？

</details>

思考完这些引导问题后，再来看看参考答案代码吧！

<details markdown='1'><summary>👩🏽‍🏫 参考答案代码</summary>

```javascript
//////////////////////////
/// 状态变量 //////
//////////////////////////

PredictionMarketToken public immutable i_yesToken;
PredictionMarketToken public immutable i_noToken;

//////////////////
////构造函数///
//////////////////

constructor(
    address _liquidityProvider,
    address _oracle,
    string memory _question,
    uint256 _initialTokenValue,
    uint8 _initialYesProbability,
    uint8 _percentageToLock
) payable Ownable(_liquidityProvider) {
    /// Checkpoint 2 ////
    if (msg.value == 0) {
        revert PredictionMarket__MustProvideETHForInitialLiquidity();
    }
    if (_initialYesProbability >= 100 || _initialYesProbability == 0) {
        revert PredictionMarket__InvalidProbability();
    }

    if (_percentageToLock >= 100 || _percentageToLock == 0) {
        revert PredictionMarket__InvalidPercentageToLock();
    }

    i_oracle = _oracle;
    s_question = _question;
    i_initialTokenValue = _initialTokenValue;
    i_initialYesProbability = _initialYesProbability;
    i_percentageLocked = _percentageToLock;

    s_ethCollateral = msg.value;

    /// Checkpoint 3 ////
    uint256 initialTokenAmount = (msg.value * PRECISION) / _initialTokenValue;
    i_yesToken = new PredictionMarketToken("Yes", "Y", msg.sender, initialTokenAmount);
    i_noToken = new PredictionMarketToken("No", "N", msg.sender, initialTokenAmount);

    uint256 initialYesAmountLocked = (initialTokenAmount * _initialYesProbability * _percentageToLock * 2) / 10000;
    uint256 initialNoAmountLocked =
        (initialTokenAmount * (100 - _initialYesProbability) * _percentageToLock * 2) / 10000;

    bool success1 = i_yesToken.transfer(msg.sender, initialYesAmountLocked);
    bool success2 = i_noToken.transfer(msg.sender, initialNoAmountLocked);
    if (!success1 || !success2) {
        revert PredictionMarket__TokenTransferFailed();
    }
}
```

</details>

</details>

运行以下命令，检查你是否正确实现了所有变量和检查。

<Tabs>
<Tab label="Hardhat">

```sh
yarn test --grep "Checkpoint3"
```

</Tab>
<Tab label="Foundry">

```sh
yarn test --match-test "Checkpoint3"
```

</Tab>
</Tabs>

### ✅ 测试通过了？你已经非常接近了！

干得好——如果你的测试全部通过，你距离部署就只差一步了！🚀

在点击部署之前，先做一个简单但重要的修改：

👇 向下滚动到你合约中的 `getPrediction()` 函数，然后……

🧩 将 `/// Checkpoint 3 ///` 下方的所有内容取消注释

这个函数会把我们的这些值提供给前端。

> 💡 你可能会看到类似 "Unused function parameter: isReported" 或 winningToken 的警告——不用担心，现在可以放心忽略它们。

完成之后，你就可以部署了！🔗

> 运行 `yarn deploy` 并查看前端

部署完成后，前往 **Debug** 页面查看已初始化的值。

前端中的 **Liquidity Provider** 标签页现在也应该显示初始问题、初始流动性/概率以及其他相关变量（应有的效果参见下方截图）。

![ch-6-lp2](https://raw.githubusercontent.com/scaffold-eth/se-2-challenges/challenge-prediction-markets/extension/packages/nextjs/public/lp2.png)

## Checkpoint 4: 💦 更多流动性

既然你的市场已经上线，是时候给流动性提供者更多控制权了 💪

在这个 Checkpoint 中，你将实现 `addLiquidity` 和 `removeLiquidity` 函数——允许市场所有者注入更多 ETH 或将其取出，同时自动铸造或销毁结果代币以保持平衡。

为了简单起见，我们只允许最初的市场创建者调用这些函数。这一点已经通过 `onlyOwner` 修饰器强制实现了 🔒

开始动手吧！🧱

> 💡 相关事件已经在 **events** 部分定义好了。

<details markdown='1'><summary>🦉 引导问题</summary>

<details markdown='1'><summary>问题 1</summary>

> 我们如何记录新添加的流动性？又如何为预测市场铸造相应数量的 "YES" 和 "NO" 代币？

</details>

<details markdown='1'><summary>问题 2</summary>

> 在 removeLiquidity 函数中，我们应该实现哪些验证或检查？

</details>

<details markdown='1'><summary>问题 3</summary>

> 我们如何确定要移除的正确代币数量？移除它们的流程是什么？（提示：参考 PredictionMarketToken.sol）

</details>

<details markdown='1'><summary>问题 4</summary>

> 在这个过程中需要更新哪个状态变量？

</details>

<details markdown='1'><summary>问题 5</summary>

> 我们要触发哪些事件？（提示：看看预先定义好的事件）

</details>

思考完这些引导问题后，再来看看参考答案代码吧！

<details markdown='1'><summary>👩🏽‍🏫 参考答案代码</summary>

```javascript
/////////////////
/// 函数 ///
/////////////////

function addLiquidity() external payable onlyOwner {
    //// Checkpoint 4 ////
    s_ethCollateral += msg.value;

    uint256 tokensAmount = (msg.value * PRECISION) / i_initialTokenValue;

    i_yesToken.mint(address(this), tokensAmount);
    i_noToken.mint(address(this), tokensAmount);

    emit LiquidityAdded(msg.sender, msg.value, tokensAmount);
}

function removeLiquidity(uint256 _ethToWithdraw) external onlyOwner {
    //// Checkpoint 4 ////
    uint256 amountTokenToBurn = (_ethToWithdraw / i_initialTokenValue) * PRECISION;

    if (amountTokenToBurn > (i_yesToken.balanceOf(address(this)))) {
        revert PredictionMarket__InsufficientTokenReserve(Outcome.YES, amountTokenToBurn);
    }

    if (amountTokenToBurn > (i_noToken.balanceOf(address(this)))) {
        revert PredictionMarket__InsufficientTokenReserve(Outcome.NO, amountTokenToBurn);
    }

    s_ethCollateral -= _ethToWithdraw;

    i_yesToken.burn(address(this), amountTokenToBurn);
    i_noToken.burn(address(this), amountTokenToBurn);

    (bool success,) = msg.sender.call{value: _ethToWithdraw}("");
    if (!success) {
        revert PredictionMarket__ETHTransferFailed();
    }

    emit LiquidityRemoved(msg.sender, _ethToWithdraw, amountTokenToBurn);
}
```

</details>

</details>

运行以下命令，检查你是否正确实现了这些函数。

<Tabs>
<Tab label="Hardhat">

```sh
yarn test --grep "Checkpoint4"
```

</Tab>
<Tab label="Foundry">

```sh
yarn test --match-test "Checkpoint4"
```

</Tab>
</Tabs>

## Checkpoint 5: 🔮 让预言机报告结果

以太坊是一个封闭的世界——它不知道链下发生了什么。这是有意为之的设计，目的是让数据保持安全、防篡改。
但有时，我们需要打破这道边界。

这正是预言机发挥作用的地方——它们是把链下真相带到链上的信使。

### 🧙 我们的预言机做什么？

在我们的场景中，预言机只有一项任务：

**👉 告诉合约哪辆车赢得了比赛。**

为此，它会调用智能合约的一个写入函数，并传入最终结果——"Yes" 或 "No"。

这个结果需要被合约存储并记住。

### ⚖️ 等等——我们能信任它吗？

任何预言机都面临一个大问题：我们如何信任它提供的数据？

因此，出现了多种预言机方案。乐观预言机（如 UMA，被 Polymarket 等平台使用）会假定数据是正确的，除非有人提出争议。另一种方案是像 Chainlink 这样的去中心化预言机网络，它们聚合来自多个来源的数据来提高可靠性。

但在我们的简化设置中，我们会尽量保持精简：

> 🧑‍🏫 我们假设市场创建者充当预言机，并且被信任会公正地报告结果。

这非常适合在不深入研究预言机的情况下学习其中的机制。

### 🧱 你将实现的内容

- 一个 `report()` 函数，供预言机调用以最终确定结果

- 一个变量 `s_winningToken`，用于存储获胜方（Yes 或 No 代币合约），以及

- `s_isReported`，用于表示市场是否已经结算

为了保证安全……

### 🔐 添加一道护栏

你将创建一个名为 `predictionNotReported` 的自定义修饰器——它将：

- 🔒 在结果已知后，阻止关键函数再被调用

- 🛡️ 确保 `report()` 只能被调用一次

可以把它看作最后的封印——一旦预言机给出结论，市场就会锁定这个结果。

开始写代码吧！💻

> 💡 当使用 **enum 作为参数** 时，无法用 **自定义错误** 来校验它。任何无效值都会导致 **立即回滚**（revert）。

<details markdown='1'><summary>🦉 引导问题</summary>

<details markdown='1'><summary>问题 1</summary>

> 考虑到 s_winningToken 将存储一个代币合约地址，它应该使用什么类型？s_isReported 又适合用什么类型？

</details>

<details markdown='1'><summary>问题 2</summary>

> 我们如何确保只有预言机（而不一定是合约所有者）被授权调用 report 函数？

</details>

<details markdown='1'><summary>问题 3</summary>

> 你如何确保 report 函数只能在预测结果尚未报告时被调用（修饰器）？还有哪些现有函数也应该使用 predictionNotReported 修饰器？

</details>

<details markdown='1'><summary>问题 4</summary>

> 报告预测结果时应该触发什么事件？

</details>

思考完这些引导问题后，再来看看参考答案代码吧！

<details markdown='1'><summary>👩🏽‍🏫 参考答案代码</summary>

```javascript
//////////////////////////
/// 状态变量 //////
//////////////////////////

PredictionMarketToken public s_winningToken;
bool public s_isReported;

/////////////////
/// 修饰器 ///
/////////////////

modifier predictionNotReported() {
    if (s_isReported) {
        revert PredictionMarket__PredictionAlreadyReported();
    }
    _;
}

/////////////////
/// 函数 ///
/////////////////

function report(Outcome _winningOutcome) external predictionNotReported {
    //// Checkpoint 5 ////
    if (msg.sender != i_oracle) {
        revert PredictionMarket__OnlyOracleCanReport();
    }
    s_winningToken = _winningOutcome == Outcome.YES ? i_yesToken : i_noToken;
    s_isReported = true;
    emit MarketReported(msg.sender, _winningOutcome, address(s_winningToken));
}

// 🔒 别忘了给你现有的流动性函数也加上 predictionNotReported 修饰器：
function addLiquidity() external payable onlyOwner predictionNotReported { ... }
function removeLiquidity(uint256 _ethToWithdraw) external onlyOwner predictionNotReported { ... }
```

</details>

</details>

运行以下命令，检查预言机使用的 report 函数是否实现正确。

<Tabs>
<Tab label="Hardhat">

```sh
yarn test --grep "Checkpoint5"
```

</Tab>
<Tab label="Foundry">

```sh
yarn test --match-test "Checkpoint5"
```

</Tab>
</Tabs>

✅ 测试通过了？你就快完成了！

干得漂亮——你的测试都通过了，部署近在眼前！🚀

但在你按下部署按钮之前，还有最后一处小调整要做：

👇 向下滚动到你合约中的 `getPrediction()` 函数，然后……

🧩 将 `/// Checkpoint 5 ///` 下方的所有内容取消注释

现在前往界面中的 Oracle 标签页并报告结果（当然，要在你看完比赛之后 :)）🏎️ 🏁

<Tabs>
<Tab label="Hardhat">

> 💡 确保你连接的是正确的预言机地址——查看 `00_deploy_your_contract.ts` 了解使用的是哪个地址。（提示：把第一个 Hardhat 账户添加到你的钱包，或者添加你自己的账户，以预言机或合约所有者的身份进行交互。你可以在部署脚本中手动设置你的地址，或者运行 `yarn account:import`。）

</Tab>
<Tab label="Foundry">

> 💡 确保你连接的是正确的预言机地址——查看 `DeployPredictionMarket.s.sol` 了解使用的是哪个地址。（提示：把第一个 Anvil 账户添加到你的钱包，或者添加你自己的账户，以预言机或合约所有者的身份进行交互。你可以在部署脚本中手动设置你的地址，或者运行 `yarn account:import`。）

</Tab>
</Tabs>

![ch-6-oracle2](https://raw.githubusercontent.com/scaffold-eth/se-2-challenges/challenge-prediction-markets/extension/packages/nextjs/public/oracle2.png)

## Checkpoint 6: 📉💧 结算市场并提取流动性和交易收益

你已经接好了预言机——干得好！🔌 现在是时候让流动性提供者/市场所有者在结果被报告后能够 **结算市场** 了。

作为预测市场的所有者，你应该能够：

- **💰 提取剩余的抵押品**（与获胜结果挂钩的部分）

- **📊 收取交易手续费**，即累积的交易收益

为此，你将实现 `resolveMarketAndWithdraw` 函数。开始吧！

> 💡 到现在你已经很熟悉这个合约了——所以自己来编写逻辑吧。只是别忘了加上必要的 **条件检查** 🔒

<details markdown='1'><summary>🦉 引导问题</summary>

<details markdown='1'><summary>问题 1</summary>

> 在允许结算之前，你应该检查哪些条件？
>
> - 市场结果是否已被报告？（提示：创建一个修饰器是合理的，因为之后我们还需要再次进行这项检查。）
> - 合约是否持有任何获胜代币？

</details>

<details markdown='1'><summary>问题 2</summary>

> 你会如何计算预测市场所有者通过赎回获胜代币所获得的 ETH 数量？

</details>

<details markdown='1'><summary>问题 3</summary>

> 获胜代币被赎回之后应该如何处理？

</details>

<details markdown='1'><summary>问题 4</summary>

> 我们需要对 s_lpTradingRevenue 做什么处理？重置吗？

</details>

<details markdown='1'><summary>问题 5</summary>

> 应该触发什么事件来表明市场已结算、资金已提取？

</details>

思考完这些引导问题后，再来看看参考答案代码吧！

<details markdown='1'><summary>👩🏽‍🏫 参考答案代码</summary>

```javascript
/////////////////
/// 修饰器 ///
/////////////////

modifier predictionReported() {
    if (!s_isReported) {
        revert PredictionMarket__PredictionNotReported();
    }
    _;
}

/////////////////
/// 函数 ///
/////////////////

function resolveMarketAndWithdraw() external onlyOwner predictionReported returns (uint256 ethRedeemed) {
    /// Checkpoint 6 ////
    uint256 contractWinningTokens = s_winningToken.balanceOf(address(this));
    if (contractWinningTokens > 0) {
        ethRedeemed = (contractWinningTokens * i_initialTokenValue) / PRECISION;

        if (ethRedeemed > s_ethCollateral) {
            ethRedeemed = s_ethCollateral;
        }

        s_ethCollateral -= ethRedeemed;
    }

    uint256 totalEthToSend = ethRedeemed + s_lpTradingRevenue;

    s_lpTradingRevenue = 0;

    s_winningToken.burn(address(this), contractWinningTokens);

    (bool success,) = msg.sender.call{value: totalEthToSend}("");
    if (!success) {
        revert PredictionMarket__ETHTransferFailed();
    }

    emit MarketResolved(msg.sender, totalEthToSend);

    return ethRedeemed;
}
```

</details>

</details>

运行以下命令，检查 `resolveMarketAndWithdraw` 函数是否实现正确。

<Tabs>
<Tab label="Hardhat">

```sh
yarn test --grep "Checkpoint6"
```

</Tab>
<Tab label="Foundry">

```sh
yarn test --match-test "Checkpoint6"
```

</Tab>
</Tabs>

请务必重新部署合约，并使用 Oracle 标签页再次报告结果。

然后切换到 Liquidity Provider 标签页，试试你的新函数 💥

> 🔍 仔细观察代币被销毁、ETH 流回部署者的过程。

![ch-6-lp3](https://raw.githubusercontent.com/scaffold-eth/se-2-challenges/challenge-prediction-markets/extension/packages/nextjs/public/lp3.png)

现在 **流动性提供者** 和 **预言机** 都已完整实现，是时候向用户敞开大门，让他们加入进来 **交易结果代币** 了——下注，并实时塑造市场！🛒📈

准备好了吗？

## Checkpoint 7: 📈📉 实现代币交易的定价与概率计算

你已经搭建好了核心引擎——流动性在流动，预言机在报告结果，现在是时候让用户通过买卖结果代币来下注了。

欢迎来到预测市场中价格与概率交汇的部分，在这里，每一笔交易都会改变赔率。让我们来实现它吧！💥

### 🛠️ 你的目标：启用交易

为了让用户能够买卖 "Yes" 或 "No" 代币，我们需要一个能反映当前市场情绪的定价系统。

你将首先实现三个关键的辅助函数：

- `_calculatePriceInEth`

- `_getCurrentReserves`

- `_calculateProbability`

然后用下面这些 public 定价函数完成整套功能：

- `getBuyPriceInEth`

- `getSellPriceInEth`

### 🔧 核心思路

每当用户买入或卖出时，我们都需要计算这要花费（或能赚取）多少 ETH。这正是 `_calculatePriceInEth` 大显身手的地方。为了简单起见，我们将使用线性定价模型——但请记住，这只是一个起点。之后你可以升级为其他模型。

关键公式如下：

$$
price = initialTokenValue * probabilityAvg * tradingAmount
$$

查看下表，了解价格在不同场景下的表现。注意，两种结果的价格之和始终为 **0.01 ETH**。

![pm-priceTable](https://raw.githubusercontent.com/scaffold-eth/se-2-challenges/challenge-prediction-markets/extension/packages/nextjs/public/priceTable.png)

### 💡 工作原理

我们会根据锁定的代币数量，计算某个结果在交易前和交易后的概率。然后取两者的平均值，再乘以用户想要买入/卖出的数量。

要实现 `_calculatePriceInEth`，我们需要：

1. 使用 `_getCurrentReserves` 获取合约中有多少代币

2. 使用 `_calculateProbability` 算出某个结果获胜的概率

3. 对交易前后的概率取平均值

4. 乘以 initialTokenValue 和交易数量，得到价格

### 📊 价格函数如何工作（以及它的特殊之处）

这个定价模型给用户提供了批量折扣——一次买得越多，价格越划算。这与 DeFi 中的滑点恰好相反，在那里大额交易通常成本更高。😎

让我们看一个具体的例子，了解实际效果如何。

🚗 初始设置：

- totalSupplyYes = 100, totalSupplyNo = 100
- currentReserveYes = 90, currentReserveNo = 90
- tokenLockedYes = 10, tokenLockedNo = 10

1️⃣ **一笔大额交易：一次性买入 60 个 "Yes" 代币**

$$
probabilityYes = \frac{tokenSoldYes + tokenLockedYes}{tokenLockedYes+ tokenLockedNo + tokenSoldYes + tokenSoldNo}
$$

- probabilityBefore = 50%
- probabilityAfter = (60 + 10 ) / (10 + 10 + 60 + 0) = 87.5%
- probAvg = (probBefore + probAfter) / 2 = 68.75%
- price = 0.01 ETH \* 68.75% \* 60 = 0.4125 ETH

**2️⃣ 两笔较小的交易：分两笔、每笔 30 个，共买入 60 个 "Yes" 代币**

**第一笔交易：**

- probBefore = 50%, probAfter = 80%
- probAvg = 65%
- price = 0.01 ETH \* 65% \* 30 = 0.195 ETH

**第二笔交易：**

- probBefore = 80%, probAfter = $87.5%
- probAvg = 83.75%
- price = 0.01 ETH \* 83.75% \* 30 = 0.2515 ETH

**合计** = 0.195 + 0.25125 = **0.44625 ETH** > **0.4125 ETH**

🔺 这比单笔交易更贵！

> 🧠 **那么，为什么两笔较小的交易比一笔大额交易花费更多？**
>
> 这是因为我们使用交易开始与结束之间的 **平均概率** 来计算价格。当你把一笔大额交易拆分成多笔较小的交易时，每一笔都会重新计算各自的起始和结束概率，在上涨的市场中，这会导致 **整体的平均概率更高**。这就是总成本最终 **更高** 的原因。
>
> 这种行为是使用简化的线性近似带来的副作用。如果我们想让定价模型 **更精确**，可以把交易模拟成 **一系列无穷小的步骤**，就像微积分中 **积分** 的原理那样。这样能为大额交易提供一条更平滑、更精确的成本曲线，但代价是复杂度增加。

### 🛠️ 实现要点

编码时请牢记以下关键机制：

- **买入** 代币会推高该结果的概率 📈

- **卖出** 则相反——它会降低该结果的概率 📉

getBuyPriceInEth 和 getSellPriceInEth 都是对外公开的函数，它们只是调用 \_calculatePriceInEth，并传入一个标志来表明这是买入还是卖出操作。

现在去把它们串起来吧！⚡

<details markdown='1'><summary>🦉 引导问题</summary>

<details markdown='1'><summary>问题 1</summary>

> 你如何确保 \_getCurrentReserves 根据 \_outcome 返回正确的值？（提示：想想在获取储备时如何区分所选的结果）

</details>

<details markdown='1'><summary>问题 2</summary>

> 卖出代币时，你应该添加什么检查来避免下溢？（提示：确保用户卖出的代币不超过储备中可用的数量。）

</details>

<details markdown='1'><summary>问题 3</summary>

> 我们如何计算 probabilityBefore、probabilityAfter 和 probabilityAvg？（提示：参见上面的示例。）

</details>

<details markdown='1'><summary>问题 4</summary>

> 计算价格时还需要注意什么？（提示：别忘了小数位数和 PRECISION 常量。）

</details>

<details markdown='1'><summary>问题 5</summary>

> 在 getBuyPriceInEth 和 getSellPriceInEth 中需要调用哪个函数？这两者有什么不同？

</details>

思考完这些引导问题后，再来看看参考答案代码吧！

<details markdown='1'><summary>👩🏽‍🏫 参考答案代码</summary>

```javascript
/////////////////
/// 函数 ///
/////////////////

function getBuyPriceInEth(Outcome _outcome, uint256 _tradingAmount) public view returns (uint256) {
    /// Checkpoint 7 ////
    return _calculatePriceInEth(_outcome, _tradingAmount, false);
}

function getSellPriceInEth(Outcome _outcome, uint256 _tradingAmount) public view returns (uint256) {
    /// Checkpoint 7 ////
    return _calculatePriceInEth(_outcome, _tradingAmount, true);
}

/////////////////////////
/// 辅助函数 ///
////////////////////////

function _calculatePriceInEth(Outcome _outcome, uint256 _tradingAmount, bool _isSelling)
    private
    view
    returns (uint256)
{
    /// Checkpoint 7 ////
    (uint256 currentTokenReserve, uint256 currentOtherTokenReserve) = _getCurrentReserves(_outcome);

    /// 买入时确保流动性充足
    if (!_isSelling) {
        if (currentTokenReserve < _tradingAmount) {
            revert PredictionMarket__InsufficientLiquidity();
        }
    }

    uint256 totalTokenSupply = i_yesToken.totalSupply();

    /// 交易前
    uint256 currentTokenSoldBefore = totalTokenSupply - currentTokenReserve;
    uint256 currentOtherTokenSold = totalTokenSupply - currentOtherTokenReserve;

    uint256 totalTokensSoldBefore = currentTokenSoldBefore + currentOtherTokenSold;
    uint256 probabilityBefore = _calculateProbability(currentTokenSoldBefore, totalTokensSoldBefore);

    /// 交易后
    uint256 currentTokenReserveAfter =
        _isSelling ? currentTokenReserve + _tradingAmount : currentTokenReserve - _tradingAmount;
    uint256 currentTokenSoldAfter = totalTokenSupply - currentTokenReserveAfter;

    uint256 totalTokensSoldAfter =
        _isSelling ? totalTokensSoldBefore - _tradingAmount : totalTokensSoldBefore + _tradingAmount;

    uint256 probabilityAfter = _calculateProbability(currentTokenSoldAfter, totalTokensSoldAfter);

    /// 计算最终价格
    uint256 probabilityAvg = (probabilityBefore + probabilityAfter) / 2;
    return (i_initialTokenValue * probabilityAvg * _tradingAmount) / (PRECISION * PRECISION);
}

function _getCurrentReserves(Outcome _outcome) private view returns (uint256, uint256) {
    /// Checkpoint 7 ////
    if (_outcome == Outcome.YES) {
        return (i_yesToken.balanceOf(address(this)), i_noToken.balanceOf(address(this)));
    } else {
        return (i_noToken.balanceOf(address(this)), i_yesToken.balanceOf(address(this)));
    }
}

function _calculateProbability(uint256 tokensSold, uint256 totalSold) private pure returns (uint256) {
    /// Checkpoint 7 ////
    return (tokensSold * PRECISION) / totalSold;
}
```

</details>

</details>

运行以下命令，检查你是否正确实现了所有函数。

<Tabs>
<Tab label="Hardhat">

```sh
yarn test --grep "Checkpoint7"
```

</Tab>
<Tab label="Foundry">

```sh
yarn test --match-test "Checkpoint7"
```

</Tab>
</Tabs>

## Checkpoint 8: 🔁💰 用 ETH 买卖 "Yes" 或 "No" 代币

现在你已经构建好了定价引擎（`getBuyPriceInEth` / `getSellPriceInEth`），是时候用真实的交易让市场运转起来了！我们来实现两个关键函数：

- `buyTokensWithETH`

- `sellTokensForEth`

### 🛒 买入代币

在用户买入 "Yes" 或 "No" 代币之前，我们需要做几项基本检查：

- ✅ 市场是否仍处于活跃状态？
- ✅ 代币数量是否大于零？（小贴士：可以用修饰器来强制检查！）
- ✅ 合约是否有足够的代币可供出售？
- ✅ 发送的 ETH 是否与 `getBuyPriceInEth` 算出的价格完全一致？
- ✅ 调用者是否不是市场所有者？

所有检查都通过后，更新交易收益（`s_lpTradingRevenue`），并把结果代币发送给买家。轻松搞定！

### 💸 卖出代币

现在来处理想要套现的用户（流程类似，只是方向相反）。

我们还需要额外检查以下几项：

- ✅ 代币数量是否有效？
- ✅ 合约是否有足够的 ETH 用于支付？
- ✅ 用户是否已授权合约转移其代币？

使用 `getSellPriceInEth` 计算应付给用户的 ETH。然后：

1. 从 `s_lpTradingRevenue` 中扣除这笔 ETH

2. 把它转给卖家

3. 别忘了触发事件，让一切在链上保持透明 📢

让我们开启实时交易吧！🔥

<details markdown='1'><summary>🦉 引导问题</summary>

<details markdown='1'><summary>问题 1</summary>

> 如何确保交易数量不为零？（提示：创建一个修饰器，看看有哪些可用的自定义错误）以及如何确保预测市场尚未报告结果？

</details>

<details markdown='1'><summary>问题 2</summary>

> 如何验证发送到合约的 ETH 数量与想要购买的代币数量相符？（提示：想想我们之前实现过的某个函数。）

</details>

<details markdown='1'><summary>问题 3</summary>

> 如何检查合约是否持有足够的代币供购买？

</details>

<details markdown='1'><summary>问题 4</summary>

> 购买时应该给 s_lpTradingRevenue 状态变量加上什么值？

</details>

<details markdown='1'><summary>问题 5</summary>

> 当用户想要卖出时，如何确保合约会检查代币授权额度？（提示：这里只应检查授权额度，而不是设置它。设置授权需要在单独的交易中完成。）

</details>

<details markdown='1'><summary>问题 6</summary>

> 如何计算应退还给用户的正确 ETH 数量？（提示：回想一下我们之前实现的辅助函数。）

</details>

<details markdown='1'><summary>问题 7</summary>

> 卖出时应该从 s_lpTradingRevenue 中减去什么值？

</details>

<details markdown='1'><summary>问题 8</summary>

> 如何确保 \_tradingAmount 被发送给用户？

</details>

<details markdown='1'><summary>问题 9</summary>

> 这些函数中需要触发哪些事件？（查看合约中的 Events 部分，挑选出正确的事件）

</details>

思考完这些引导问题后，再来看看参考答案代码吧！

<details markdown='1'><summary>👩🏽‍🏫 参考答案代码</summary>

```javascript
/////////////////
/// 修饰器 ///
/////////////////

modifier notOwner() {
    if (msg.sender == owner()) {
        revert PredictionMarket__OwnerCannotCall();
    }
    _;
}


modifier amountGreaterThanZero(uint256 _amount) {
    if (_amount == 0) {
        revert PredictionMarket__AmountMustBeGreaterThanZero();
    }
    _;
}

 /////////////////
 /// 函数 ///
 /////////////////

function buyTokensWithETH(Outcome _outcome, uint256 _amountTokenToBuy)
    external
    payable
    amountGreaterThanZero(_amountTokenToBuy)
    predictionNotReported
    notOwner
{
    /// Checkpoint 8 ////
    uint256 ethNeeded = getBuyPriceInEth(_outcome, _amountTokenToBuy);
    if (msg.value != ethNeeded) {
        revert PredictionMarket__MustSendExactETHAmount();
    }

    PredictionMarketToken optionToken = _outcome == Outcome.YES ? i_yesToken : i_noToken;

    if (_amountTokenToBuy > optionToken.balanceOf(address(this))) {
        revert PredictionMarket__InsufficientTokenReserve(_outcome, _amountTokenToBuy);
    }

    s_lpTradingRevenue += msg.value;

    bool success = optionToken.transfer(msg.sender, _amountTokenToBuy);
    if (!success) {
        revert PredictionMarket__TokenTransferFailed();
    }

    emit TokensPurchased(msg.sender, _outcome, _amountTokenToBuy, msg.value);
}

function sellTokensForEth(Outcome _outcome, uint256 _tradingAmount)
    external
    amountGreaterThanZero(_tradingAmount)
    predictionNotReported
    notOwner
{
    /// Checkpoint 8 ////
    PredictionMarketToken optionToken = _outcome == Outcome.YES ? i_yesToken : i_noToken;
    uint256 userBalance = optionToken.balanceOf(msg.sender);
    if (userBalance < _tradingAmount) {
        revert PredictionMarket__InsufficientBalance(_tradingAmount, userBalance);
    }

    uint256 allowance = optionToken.allowance(msg.sender, address(this));
    if (allowance < _tradingAmount) {
        revert PredictionMarket__InsufficientAllowance(_tradingAmount, allowance);
    }

    uint256 ethToReceive = getSellPriceInEth(_outcome, _tradingAmount);

    s_lpTradingRevenue -= ethToReceive;

    (bool sent,) = msg.sender.call{value: ethToReceive}("");
    if (!sent) {
        revert PredictionMarket__ETHTransferFailed();
    }

    bool success = optionToken.transferFrom(msg.sender, address(this), _tradingAmount);
    if (!success) {
        revert PredictionMarket__TokenTransferFailed();
    }

    emit TokensSold(msg.sender, _outcome, _tradingAmount, ethToReceive);
}
```

</details>

</details>

运行以下命令，检查你是否正确实现了所有函数。

<Tabs>
<Tab label="Hardhat">

```sh
yarn test --grep "Checkpoint8"
```

</Tab>
<Tab label="Foundry">

```sh
yarn test --match-test "Checkpoint8"
```

</Tab>
</Tabs>

然后运行 `yarn deploy`，在前端进行测试，看看概率是如何变化的。

> ❗️💡 请确保**使用与流动性提供者不同的另一个账户**，否则你会**被限制而无法卖出代币**

![ch-6-user2](https://raw.githubusercontent.com/scaffold-eth/se-2-challenges/challenge-prediction-markets/extension/packages/nextjs/public/user2.png)

## Checkpoint 9: 以用户身份赎回获胜代币

你已经下注了……比赛结束了……而你猜对了。现在是兑现收益的时候了！🎉
最后一个需要实现的面向用户的函数是 redeemWinningTokens，它让押中正确结果的用户可以**将每个获胜代币赎回为 0.01 ETH**。

### ✅ 赎回检查清单

在发放任何奖励之前，我们需要验证以下几点：

- 🟢 市场是否已经结算？

- 🪙 用户是否持有获胜代币？

- 💰 是否真的有可赎回的数量？

- 🚫 调用者是否不是市场所有者？

### 💸 支付逻辑

如果一切检查通过，我们会：

1. 计算用户应得的 ETH 总额

2. 从 `s_ethCollateral` 中减去这笔金额

3. 销毁获胜代币（它们已经完成了使命）🔥

4. 把 ETH 直接转到用户的钱包

5. 触发一个事件，在链上记录这次赎回

这是用户的最后一步——正确的预测获得回报的时刻。

<details markdown='1'><summary>🦉 引导问题</summary>

<details markdown='1'><summary>问题 1</summary>

> 预测市场是否已经报告了结果（提示：修饰器）？用户是否持有获胜代币？他想要赎回的数量是否大于 0（提示：修饰器）？

</details>

<details markdown='1'><summary>问题 2</summary>

> 如何计算用户能收到多少 ETH？

</details>

<details markdown='1'><summary>问题 3</summary>

> 用户赎回的获胜代币应该如何处理？

</details>

<details markdown='1'><summary>问题 4</summary>

> 需要触发哪些事件？

</details>

思考完这些引导问题后，再来看看参考答案代码吧！

<details markdown='1'><summary>👩🏽‍🏫 参考答案代码</summary>

```javascript
 /////////////////
 /// 函数 ///
 /////////////////

function redeemWinningTokens(uint256 _amount) external amountGreaterThanZero(_amount) predictionReported notOwner {
    /// Checkpoint 9 ////
    if (s_winningToken.balanceOf(msg.sender) < _amount) {
        revert PredictionMarket__InsufficientWinningTokens();
    }

    uint256 ethToReceive = (_amount * i_initialTokenValue) / PRECISION;

    s_ethCollateral -= ethToReceive;

    s_winningToken.burn(msg.sender, _amount);

    (bool success,) = msg.sender.call{value: ethToReceive}("");
    if (!success) {
        revert PredictionMarket__ETHTransferFailed();
    }

    emit WinningTokensRedeemed(msg.sender, _amount, ethToReceive);
}
```

</details>

</details>

运行以下命令，检查你是否正确实现了本挑战的最后一个函数。

<Tabs>
<Tab label="Hardhat">

```sh
yarn test --grep "Checkpoint9"
```

</Tab>
<Tab label="Foundry">

```sh
yarn test --match-test "Checkpoint9"
```

</Tab>
</Tabs>

然后运行 `yarn deploy` 在前端进行测试。记得事先购买一些获胜代币，并报告比赛结果。之后，你应该就能赎回你想要的数量了。

![ch-6-user3](https://raw.githubusercontent.com/scaffold-eth/se-2-challenges/challenge-prediction-markets/extension/packages/nextjs/public/user3.png)

现在你已经构建了完整的闭环：提供流动性、交易份额、结算市场以及领取奖励。

**🎉🎉🎉 干得漂亮——你已经构建出了一个预测市场！🧠💥**

## Checkpoint 10: 💾 部署你的合约！🛰

<Tabs>
<Tab label="Hardhat">

📡 在 `packages/hardhat/hardhat.config.ts` 中把 `defaultNetwork` 修改为你选择的 **Sepolia 或 Optimism Sepolia**

</Tab>
<Tab label="Foundry">

📡 选择你的目标网络（**Sepolia 或 Optimism Sepolia**）

</Tab>
</Tabs>

🔐 你需要使用 `yarn generate` 生成一个**部署者地址**。这会创建一个助记词并将其保存在本地。

👩‍🚀 使用 `yarn account` 查看你的部署者账户余额。

⛽️ 你需要用钱包向你的**部署者地址**发送 ETH，或者从所选网络的公共水龙头获取。

> 🚨🚨 **!!!警告!!!** 部署之前，请务必根据你的需要调整构造函数中的 ETH 数量。默认情况下，合约部署时会投入 **1 ETH**，并把代币价值设为 **0.01 ETH**。根据你愿意投入多少 ETH，你可能想把它们改成例如 **0.1 ETH** 和 **0.001 ETH**。🚨🚨

<Tabs>
<Tab label="Hardhat">

🚀 运行 `yarn deploy`，把你的智能合约部署到公共网络（在 `hardhat.config.ts` 中选择的网络）

> 💬 提示：你可以在 `hardhat.config.ts` 中把 `defaultNetwork` 设置为 `sepolia` 或 `optimismSepolia`，或者直接运行 `yarn deploy --network sepolia` 或 `yarn deploy --network optimismSepolia`。

</Tab>
<Tab label="Foundry">

🚀 运行 `yarn deploy --network sepolia`（或 `yarn deploy --network optimismSepolia`）来部署你的智能合约。

> 💬 提示：Foundry 在底层使用 `forge script`。`yarn deploy` 命令会替你处理这些。

</Tab>
</Tabs>

💻 在 [http://localhost:3000](http://localhost:3000/) 查看你的前端，并确认显示的是正确的网络。

📦 运行 `yarn vercel` 打包并部署你的前端。

> 你可能需要先运行 yarn vercel:login 登录 Vercel。登录之后（通过邮箱、GitHub 等），使用默认选项即可。

> 如果你想重新部署到同一个生产环境 URL，可以运行 yarn vercel --prod。如果省略 `--prod` 参数，它会部署到一个预览/测试 URL。

> 按照步骤部署到 Vercel。它会给你一个公开的 URL。

> 🦊 由于我们已经部署到公共测试网，你现在需要使用自己拥有的钱包连接，或者使用 burner wallet（临时钱包）。默认情况下，🔥 burner wallet 仅在 localhost 上可用。你可以在前端配置（packages/nextjs/ 中的 scaffold.config.ts）里设置 burnerWalletMode: "allNetworks"，从而在所有链上启用它们。

**为生产级应用配置第三方服务。**

默认情况下，🏗 Scaffold-ETH 2 为 Alchemy 和 Etherscan 等常用服务提供了预设的 API 密钥。这让你可以更轻松地开始开发和测试应用，而无需注册这些服务。这非常适合用来完成你的 **Speedrun Ethereum**。

对于生产级应用，建议获取你自己的 API 密钥（以避免触发速率限制）。你可以在以下位置进行配置：

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

## Checkpoint 11: 📜 合约验证

运行 `yarn verify --network your_network` 命令，在 Etherscan 上验证你的合约 🛰

👉 在 [Sepolia Etherscan](https://sepolia.etherscan.io/)（如果你部署到了 OP Sepolia，则在 [Optimism Sepolia Etherscan](https://sepolia-optimism.etherscan.io/)）上搜索这个地址，获取要提交到 🏃‍♀️[SpeedRunEthereum.com](https://speedrunethereum.com/) 的 URL。

## Checkpoint 12: 🧠 🍔 最后的思考与启发

你做到了——一路冲到了终点！🏁💥

到现在为止，你已经从零开始构建了一个功能完整的链上预测市场。这是一项了不起的成就。不过，在你像 Devcon 上的 Vitalik 一样意气风发地离开之前，这里还有几点最后的思考，可以帮助你把作品从一个扎实的原型升级为可用于生产的协议。

**🔐 添加截止时间**
市场需要有最终的结局。引入一个基于时间的条件，在设定日期之后锁定交易或触发结算。

**🔮 升级你的预言机**
目前你很可能使用的是一个简单的中心化预言机。这用于测试没问题，但在现实世界中，信任最小化至关重要。探索一些方法，让你的结果报告更加去中心化，或在密码经济学上更加安全。

**🧱 重新思考代币锁定**
你真的需要预先锁定所有这些代币吗？考虑更聪明的机制，比如虚拟交易、模拟初始仓位，或者创新的流动性引导（bootstrapping）方法。发挥创意吧——这个系统任由你改造。

**💸 奖励 LP**
添加交易手续费（例如每笔交易 3%），并把这部分 ETH 计入 `s_lpTradingRevenue`。这是奖励流动性提供者、构建更可持续市场的一种简单方式。

**🧠 探索其他市场设计**
你使用的线性定价模型只是众多模型之一。你可以完全替换它——尝试构建一个订单簿，甚至探索由 AI 智能体实现的动态定价。发挥空间无限广阔。

### ⚠️ LP 可能会亏钱——我们来看看为什么

有一个重要的风险我们还没有明确提到：作为市场创建者，**你可能会亏钱**。下面是基于当前模型、使用以下初始参数的一个最坏情况示例：

---

### ⛔️ 情况 1：一个用户买入 90 个 "Yes" 代币，且 "Yes" 获胜

- 最终概率 = (90 + 10) / (10 + 10 + 90 + 0) = **90.9%**
- 平均概率 = (50% + 90.9%) / 2 = **70.45%**
- 用户买入 90 个代币 → **0.01 ETH × 70.45% × 90 = 0.637 ETH**
- 用户获胜：**0.01 ETH × 90 = 0.9 ETH → 盈利 41%**
- LP 从 10 个 "Yes" 代币获得 = **0.1 ETH**，外加交易所得 0.637 ETH
- LP 合计：**0.1 + 0.637 - 1 = -0.263 ETH** → **亏损约 26%**

---

### ✅ 情况 2：同样的交易，但 "No" 获胜

- 用户损失：0.637 ETH
- LP 从 100 个 "No" 代币获得 = **1 ETH**，外加交易所得 0.637 ETH
- LP 合计：**1 + 0.637 - 1 = 0.637 ETH** → **盈利约 64%**

---

请记住，如果你一开始就设置了偏斜的概率（例如 10%），情况 1 中的损失可能会更高。设置合适的参数需要经验积累，并且在很大程度上取决于你的目标。

### 🚀 接下来何去何从

现在你已经理解了预测市场的核心机制：

- ✔ 交易
- ✔ 定价
- ✔ 流动性
- ✔ 市场结算
- ✔ 赎回

但这个领域之所以令人兴奋，正是因为不存在“放之四海而皆准”的设计。你现在的挑战是突破极限——探索新的模型，融入新颖的激励设计，甚至把 AI 引入其中。🤖

我们非常期待看到你接下来的作品。分享你的想法、你的 fork、你的实验。这仅仅是个开始。💥

你的预测市场会是什么样子？告诉我们吧！🧪🔮
