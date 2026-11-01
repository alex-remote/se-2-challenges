# 🚩 挑战：📣 众筹应用

![readme-1](https://raw.githubusercontent.com/scaffold-eth/se-2-challenges/challenge-crowdfunding/extension/packages/nextjs/public/hero.png)

🦸 以太坊的一项超能力在于：它让你这位构建者能够制定一套简单的规则，让一群彼此对立的参与者借此协同合作。在这个 Speedrun Ethereum 挑战中，你将创建一个去中心化应用，让用户可以协调一次集体筹款。如果用户们合作，资金会被汇集到第二个智能合约中；如果有人背叛，最坏的结果也只是每个人都拿回自己的钱。用户只需要信任代码，而不必信任彼此。

🌟 最终交付物是部署一个 dApp：用户可以向合约发送 ETH，并在条件满足时为目标项目提供资金；然后用 `yarn vercel` 把你的应用发布到公共 Web 服务器上。在 [SpeedrunEthereum.com](https://speedrunethereum.com) 提交 URL！

> 💬 在[挑战 Telegram 群](https://t.me/joinchat/E6r91UFt4oMJlt01)中结识其他正在做这个挑战的构建者，并获得帮助！

---

## Checkpoint 0: 📦 环境 📚

开始之前，你需要安装以下工具：

- [Node (>= v20.18.3)](https://nodejs.org/en/download/)
- Yarn（[v1](https://classic.yarnpkg.com/en/docs/install/) 或 [v2+](https://yarnpkg.com/getting-started/install)）
- [Git](https://git-scm.com/downloads)
- [Foundry](https://book.getfoundry.sh/getting-started/installation)（如果你选择 Foundry 作为 Solidity 框架）

然后运行以下命令，把挑战下载到你的电脑并安装依赖：

```sh
npx create-eth@2.0.23 -e challenge-crowdfunding challenge-crowdfunding
```

> 出现提示时，选择你偏好的 Solidity 框架：**Hardhat** 或 **Foundry**。

```sh
cd challenge-crowdfunding
```

> 在同一个终端中，启动你的本地网络（在你电脑上运行的区块链模拟器）：

```sh
yarn chain
```

> 在第二个终端窗口中，🛰 部署你的合约（本地）：

```sh
cd challenge-crowdfunding
yarn deploy
```

> 在第三个终端窗口中，启动你的 📱 前端：

```sh
cd challenge-crowdfunding
yarn start
```

📱 打开 http://localhost:3000 查看应用。

> _注意：截图中的界面可能与当前版本略有不同。_

> 👩‍💻 每当你想把合约的改动部署到前端时，就重新运行 `yarn deploy`。运行 `yarn deploy --reset` 可以进行一次全新的部署，即使合约没有改动也会重新部署。

🔏 现在你可以开始编辑 contracts 目录中的智能合约 `CrowdFund.sol` 了

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

---

⚠️ 我们已通过 `.vscode/settings.json` 禁用了 Cursor 的自动建议（Tab 补全和预测），以减少你写代码时的干扰。AI 聊天和 agent 功能仍然可用，并且我们提供了包含项目上下文的 `AGENTS.md` 和 `CLAUDE.md` 文件，帮助 AI 助手理解代码库。

🔒 想禁用 AI、一切都自己动手？（为了学得更深入，推荐这样做）：

- Cursor：在项目根目录的 `.cursorignore` 文件中添加 `*`
- VSCode：在 `.vscode/settings.json` 文件中将 `chat.disableAIFeatures` 设为 `true`

---

## 🤖 AI 引导学习模式（可选）

想要一位在你写代码时为你讲解概念的交互式导师吗？本挑战支持 **AI 引导学习模式**！

1. 在 **Claude Code** 或 **Cursor** 等 AI 编程工具中打开本项目
2. 运行 `/start` 命令
3. AI 导师会为你讲解每个概念，然后给你布置一个编码任务
4. 你编写代码，然后说 **"check"**，AI 就会运行测试
5. 需要帮助时说 **"hint"**；如果想让 AI 直接展示答案，就使用 **`/skip`**
6. 你的进度会被保存——随时使用 `/start` 即可继续

AI 不会直接把答案给你——它会先讲解，再让你亲自实现代码。测试会验证你的成果，如果有测试没通过，AI 会帮你调试。

---

⚗️ 到这里，你需要了解基本的 Solidity 语法。如果还不熟悉，可以借助 [🏗️ Scaffold-ETH-2](https://scaffoldeth.io) 动手尝试 [📑 Solidity By Example](https://solidity-by-example.org/) 中的概念，很快就能上手。（尤其是：全局单位、基本数据类型、mapping、发送 ether 以及 payable 函数。）

---

> **注意：** 下面的截图显示的是 Hardhat 网络。如果你使用 Foundry，网络名称中会显示“Foundry”而不是“Hardhat”，其他一切都相同。

## 🧑‍🚀 你的任务

🏦 构建一个 `CrowdFund.sol` 合约：通过 payable 的 `contribute()` 函数从众多地址收集 **ETH**，并用 `balances` 记录每个地址的出资额。在某个 `deadline`（截止时间）之后，如果收集到的 ETH 至少达到某个 `threshold`（阈值），就把它发送给 `FundingRecipient` 合约（它代表一群人想要共同资助的任何潜在用例）。具体做法是触发 `complete()` 操作，同时发送全部余额。如果收集到的 **ETH** 不够，则允许用户 `withdraw()`（取回资金）。

🔢 每个步骤都在下面的各个 checkpoint 中列出。尽量不看提示独立完成；如果遇到困难，可以点击每个 checkpoint 中的“🔎 提示”来获得更清晰的思路。

👀 另外，你应该尽量按照合约中现有的规范来组织你的合约。把错误、事件、函数等分别归入各自的区块，有助于保持合约的可读性。

## Checkpoint 1: 🤝 出资 💵

> 我们先来实现一个函数逻辑中需要用到的状态变量。

⚖️ 你需要用一个 mapping 来记录每个人的 `balances`。这样，如果这次筹款没能筹到足够的资金、需要给每个人退款，我们就能知道谁出了多少钱。把它添加在现有的 fundingRecipient 变量下面。

```solidity
mapping(address => uint256) public balances;
```

> 接下来添加一个事件。事件对于那些监听链上特定事情发生的外部服务很有用。在我们的例子中，前端将使用这个事件来得知何时发生了一笔出资。

📣 在合约中添加一个名为 `Contribution` 的事件，它接收出资者的地址和出资金额。

```solidity
event Contribution(address, uint256);
```

> 📝 注意：如果你在事件中使用了具名参数（例如 `event Contribution(address indexed contributor, uint256 amount)`），就需要更新 `/packages/nextjs/app/contributions/page.tsx`，改为通过参数名而不是数字索引来引用事件参数。

### 实现 `contribute()` 函数

> 👩‍💻 现在专心编写你的 `contribute()` 函数。这个 payable 方法已经存在，但函数体是空的。去为它填充逻辑吧！

这个函数的目标是允许任何人向资金池出资。为了有效地做到这一点，它需要完成以下事情：

- 更新 `balances` mapping
- 触发 `Contribute` 事件

<details>
<summary>🔎 提示</summary>

你可以像访问 JavaScript 数组那样设置 mapping 的值。
对于像 `mapping(address => uint256) public map` 这样的 mapping 和 `address addr = 0x1234...5678`，你可以这样访问：`map[addr]`。

你需要使用交易发送者的地址，还需要知道发送了多少金额。有没有简单的方法可以通过交易的 `msg` 获取这些信息呢？🤔

如果需要语法方面的帮助，去看看 https://solidity-by-example.org/ 。

<details>

<summary>🎯 参考答案</summary>

```solidity
function contribute() public payable {
	balances[msg.sender] += msg.value;
	emit Contribution(msg.sender, msg.value);
}
```

</details>
</details>

### 动手试试

👩‍💻 现在重新部署（`yarn deploy`），然后在前端的 `Debug Contracts` 标签页中测试你的函数。

![debugContracts](https://github.com/user-attachments/assets/7d50245b-72f5-433e-b327-0c7e70e83e51)

> 💸 需要从水龙头（faucet）获取更多资金？点击 _"Grab funds from faucet"_，或者使用页面左下角的 Faucet 功能，需要多少就领多少！

![Faucet](https://github.com/scaffold-eth/se-2-challenges/assets/55535804/e82e3100-20fb-4886-a6bf-4113c3729f53)

> ✏ 需要排查代码问题？你可以在 Solidity 代码中使用 `console.log()`，输出会显示在运行 `yarn chain` 的终端中。

---

### 🥅 目标

- [ ] 当你调用 `contribute()` 时，能看到 `CrowdFund` 合约的余额增加吗？
- [ ] 你的 `balance` 被正确记录了吗？
- [ ] 你能在 `Contributions` 标签页中看到这些事件吗？

![allContributions](https://github.com/user-attachments/assets/b50a8687-e2ba-4ba5-aa9d-fd0f100345fc)

### 测试你的进度

🔍 运行以下命令，检查你是否正确实现了这个函数。

<Tabs>
<Tab label="Hardhat">

**Hardhat**

```shell
yarn test --grep "Checkpoint1"
```

✅ 测试通过了吗？你可以查看 `packages/hardhat/test/CrowdFund.ts` 中的测试，深入排查任何错误。

</Tab>
<Tab label="Foundry">

**Foundry**

```shell
yarn test --match-test "Checkpoint1"
```

✅ 测试通过了吗？你可以查看 `packages/foundry/test/CrowdFund.t.sol` 中的测试，深入排查任何错误。

</Tab>
</Tabs>

---

## Checkpoint 2: 📤 取回资金

> 我们来实现 `withdraw` 函数。首先设置一个重要的状态变量，以及一些可能需要用到的错误。

🔘 / ⚪ 创建一个 bool 变量来记录合约是否 `openToWithdraw`（开放取回），以应对在截止时间前没筹够资金、需要给每个人退款的情况。

```solidity
bool public openToWithdraw; // Solidity 变量默认处于空值/false 状态
```

🚫 接下来，把以下自定义错误添加到合约的 `/// Errors` 区块中。

```solidity
error NotOpenToWithdraw();
error WithdrawTransferFailed(address to, uint256 amount);
```

> ❓你知道自定义错误比使用 revert 字符串错误更节省 gas 吗？
>
> ❌ `require(condition, "Condition Not Met")`
>
> ✔️ `if (!condition) { revert ConditionNotMet(); }`

### 实现 `withdraw()` 函数

> 🛠️ 现在你可以实现 `withdraw` 函数内部的逻辑了。

这个函数需要完成以下事情：

- 检查 `openToWithdraw` 是否为 true。如果不是，就抛出 `NotOpenToWithdraw`。
- 把正确的金额发送给正在取回资金的用户。如果发送失败，就抛出 `WithdrawTransferFailed`。

<details>
<summary>🔎 提示</summary>

你需要把用户的余额（`balances[msg.sender]`）发回到他们的地址。
关键在于：你只能向用户发送正确的金额，而且他们只能在 `openToWithdraw` 为 true 时这样做。

<details>

<summary>🎯 参考答案</summary>

```solidity
function withdraw() public {
	if (!openToWithdraw) revert NotOpenToWithdraw();

	uint256 balance = balances[msg.sender];
	balances[msg.sender] = 0;

	(bool success,) = msg.sender.call{value: balance}("");
	if (!success) revert WithdrawTransferFailed(msg.sender, balance);
}
```

</details>
</details>

### 动手试试

⚙️ 先把 `openToWithdraw` 默认改为 true，这样我们就可以通过前端测试这个函数：`bool public openToWithdraw = true;`

👩‍💻 现在重新部署（`yarn deploy`），然后在前端的 `Crowdfund` 或 `Debug Contracts` 标签页中测试你的函数。你应该能够先出资，然后取回 ETH。

> ‼️ 一旦你确认它按预期工作，务必把 `openToWithdraw` 改回 false。

---

### 🥅 目标

- [ ] 出资之后，你能取回你的 ETH 吗？
- [ ] 如果你在已经取回之后再次尝试取回，会发生什么？这样做是否总会失败？
- [ ] 有多个用户时又会怎样？

### 测试你的进度

🔍 运行以下命令，检查你是否正确实现了这个函数。

<Tabs>
<Tab label="Hardhat">

**Hardhat**

```shell
yarn test --grep "Checkpoint2"
```

✅ 测试通过了吗？你可以查看 `packages/hardhat/test/CrowdFund.ts` 中的测试，深入排查任何错误。

</Tab>
<Tab label="Foundry">

**Foundry**

```shell
yarn test --match-test "Checkpoint2"
```

✅ 测试通过了吗？你可以查看 `packages/foundry/test/CrowdFund.t.sol` 中的测试，深入排查任何错误。

</Tab>
</Tabs>

---

## Checkpoint 3: 🔬 状态机 / 计时 ⏱

### 状态机

> ⚙️ 把你的智能合约想象成一个 _状态机_ 。首先是**出资**阶段。然后，如果你已经筹集到一定 `threshold` 数额的 ETH，就进入**成功**状态；否则，我们进入**取回**状态，让用户取回他们的资金。

⌛ 接下来添加一个 `deadline` 变量，并把它设置为当前的 `block.timestamp` 加上 30 秒。我们需要用它来判断时间是否已到。

```solidity
uint256 public deadline = block.timestamp + 30 seconds;
```

📏 再记录一个名为 `threshold` 的常量，设为 `1 ether`。这就是我们认定该项目筹款成功的阈值。低于这个阈值就是失败的情形，人们会取回各自的资金。

```solidity
uint256 public constant threshold = 1 ether;
```

🚫 我们再添加一个自定义错误，用于在这个函数被过早调用时抛出。

```solidity
error TooEarly(uint256 deadline, uint256 currentTimestamp);
```

### 实现 `execute()` 函数

> 🧠 智能合约无法自动执行，你总是需要通过一笔交易来执行并改变状态。因此，你需要一个 `execute()` 函数，让 _任何人_ 都可以在 `deadline` 过期后调用它，并且只能调用一次。

👩‍💻 编写你的 `execute()` 函数。它需要完成以下事情：

- 确保它只能在截止时间过后执行。否则就抛出 `TooEarly`
- 如果达到了阈值，就调用 `fundingRecipient.complete` 方法，同时发送锁定的资金
- 否则将 `openToWithdraw` 设为 true，让人们可以取回他们的资金

> ‼️ 查看 `FundingRecipient.sol`，了解你要调用哪个函数，但千万不要修改 `FundingRecipient.sol`，因为这可能会拖慢自动评分。

<details>
<summary>🔎 提示</summary>

如果到 `deadline` 时合约的 `address(this).balance` 超过了 `threshold`，你需要调用：`fundingRecipient.complete{value: address(this).balance}()`

如果余额少于 `threshold`，你需要把 `openForWithdraw` 这个 bool 设为 `true`，这样用户就可以 `withdraw()` 他们的资金。

<details>

<summary>🎯 参考答案</summary>

```solidity
function execute() public {
	if (block.timestamp <= deadline) revert TooEarly(deadline, block.timestamp);

	if (address(this).balance >= threshold) {
		fundingRecipient.complete{value: address(this).balance}();
	} else {
		openToWithdraw = true;
	}
}
```

</details>
</details>

### 计时

🏃部署后，你有 30 秒的时间直到截止时间到达。如果这样有助于测试，你可以在合约中调整这个时间，把它设得更长一些。

> 👩‍💻 去更新 `timeLeft()` 这个 view 函数，让它返回剩余的时间。

⚠️ 小心！如果 `block.timestamp >= deadline`，你应该 `return 0;`

<details>
<summary>🔎 提示</summary>

如果 `deadline` 大于 `block.timestamp`，就返回两者之差；否则返回 0。

<details>

<summary>🎯 参考答案</summary>

```solidity
function timeLeft() public view returns (uint256) {
	return deadline > block.timestamp ? deadline - block.timestamp : 0;
}
```

</details>
</details>

> 👩‍💻 任何时候你想要一个全新的合约，都可以运行 `yarn deploy --reset`，即使合约没有任何改动，它也会被重新部署。
> 当你想重置测试中的 _"Time Left"_ 时，可能会用到它。

### 动手试试

💪 到这里，你的 `Crowdfund` 标签页应该基本完成并可以正常工作了。测试所有功能，看看 `Execute!` 按钮在每种情况下是否都按预期工作。

![Crowdfund](https://github.com/user-attachments/assets/1ad2365f-1e1a-4688-9f81-4bbef2a989d2)

---

### 🥅 目标

- [ ] 你能在 `Crowdfund` 标签页中看到 `timeLeft` 在倒计时吗？
- [ ] 如果在截止时间前筹到了足够的 ETH，你的 `execute()` 函数是否正确调用了 `complete()` 并转交了这些 ETH？
- [ ] 如果到截止时间仍未达到阈值，你能用 `withdraw()` 取回你的资金吗？

### 测试你的进度

🔍 运行以下命令，检查你是否正确实现了这些函数。

<Tabs>
<Tab label="Hardhat">

**Hardhat**

```shell
yarn test --grep "Checkpoint3"
```

✅ 测试通过了吗？你可以查看 `packages/hardhat/test/CrowdFund.ts` 中的测试，深入排查任何错误。

</Tab>
<Tab label="Foundry">

**Foundry**

```shell
yarn test --match-test "Checkpoint3"
```

✅ 测试通过了吗？你可以查看 `packages/foundry/test/CrowdFund.t.sol` 中的测试，深入排查任何错误。

</Tab>
</Tabs>

---

## Checkpoint 4: 💵 Receive 函数 / 用户体验 🙎

🎀 为了改善用户体验，让你的合约能够接收直接发送给它的 ETH，并调用 `contribute()`。你将使用一个特殊的 `receive()` 函数，当有人向合约发送资金时，它会被默认调用。

> 使用 Solidity 中的 [receive()](https://docs.soliditylang.org/en/v0.8.9/contracts.html?highlight=receive#receive-ether-function) 函数来“捕获” _没有指定具体方法_ 而发送到合约的 ETH，并调用 `contribute()` 来更新 `balances`。

<details>
<summary>🔎 提示</summary>

别想得太复杂。每当有人不指定任何特定方法、直接向你的合约发送资金时，这个 `receive` 方法就会被调用。只要确保这种情况发生时会调用 `contribute()` 方法，从而更新他们的余额即可。

<details>

<summary>🎯 参考答案</summary>

```solidity
receive() external payable {
	contribute();
}
```

</details>
</details>

---

### 🥅 目标

- [ ] 如果你直接向合约地址发送 ETH，它会更新你的 `balance` 以及合约的 `balance` 吗？

---

## ⚔️ 支线任务

- [ ] `execute()` 能被调用不止一次吗？这样可以吗？
- [ ] 在 `deadline` 之后，你还能随意出资和取回吗？这样可以吗？

---

### 🐸 这是个陷阱！

- [ ] 确保资金不会被困在合约里！**试试在执行之后再发送资金！会发生什么？**
- [ ] 更新名为 `notCompleted` 的[修饰器](https://solidity-by-example.org/function-modifier/)。它应该检查 `FundingRecipient` 是否尚未完成。用它来保护你的 `execute`、`contribute` 和 `withdraw` 函数：如果已经完成，就抛出一个新的自定义错误。

<details>
<summary>🔎 提示</summary>

你可以通过 `fundingRecipient` 变量访问资金接收方合约。然后你只需要确保 `.completed()` 不返回 `true`。如果确实返回了，你就需要用一个错误来回滚（revert）；这个错误叫什么由你决定。`AlreadyCompleted`？`RecipientAlreadyFunded`？或者你自己想一个好的错误名。你来选！

<details>

<summary>🎯 参考答案</summary>

```solidity
// 错误
// ...已有的错误
error AlreadyCompleted(); // 或者任何你想要的名字

// 修饰器
modifier notCompleted() {
	if (fundingRecipient.completed()) revert AlreadyCompleted();
	_;
}

// 函数
function contribute() public payable notCompleted {
	// ...已有代码
}

function withdraw() public notCompleted {
	// ...已有代码
}

function execute() public notCompleted {
	// ...已有代码
}
```

</details>
</details>

### ⚠️ 测试一下！

- 现在是运行 `yarn test` 的好时机，它会对你完成的所有内容进行自动化测试，检验你是否完成了各个核心 checkpoint。你期待看到的是全部绿色的对勾和通过的测试！

---

## Checkpoint 5: 💾 部署你的合约！🛰

🔐 你需要使用 `yarn generate` 生成一个**部署者地址**。这会创建一个助记词并保存在本地。

👩‍🚀 使用 `yarn account` 查看你的部署者账户余额。

⛽️ 你需要用你的钱包向部署者地址发送 ETH，或者从你所选网络的公共水龙头获取。你也可以在[挑战 Telegram 群](https://t.me/joinchat/E6r91UFt4oMJlt01)中发送一条包含你的新部署者地址和偏好网络的消息来申请 ETH。大家通常都非常乐意分享。

> 📝 如果你打算在真实网络上测试你的挑战，别忘了把 `deadline` 设置为一个合适的时长，比如 `block.timestamp + 2 hours`

🚀 把你的智能合约部署到公共网络。

<Tabs>
<Tab label="Hardhat">

**Hardhat**

> 💬 提示：你可以把 `hardhat.config.ts` 中的 `defaultNetwork` 设置为 `sepolia`，**或者**直接运行 `yarn deploy --network sepolia` 或 `yarn deploy --network optimismSepolia`。

</Tab>
<Tab label="Foundry">

**Foundry**

> 💬 提示：使用 `yarn deploy --network sepolia` 或 `yarn deploy --network optimismSepolia`。

</Tab>
</Tabs>

![allContributions-blockFrom](https://github.com/user-attachments/assets/e544a9b4-1bb9-4b0a-8729-d57d0b9869cf)

---

## Checkpoint 6: 🚢 发布你的前端！🚁

✏️ 编辑 `packages/nextjs/scaffold.config.ts` 中的前端配置，把 `targetNetwork` 改为 `chains.sepolia`（如果你部署到了 OP Sepolia，则改为 `chains.optimismSepolia`）

💻 在 http://localhost:3000/crowdfund 查看你的前端，并确认显示的是正确的网络。

📡 当你准备好发布前端应用时……

📦 运行 `yarn vercel` 来打包并部署你的前端。

> 你可能需要先运行 `yarn vercel:login` 登录 Vercel。登录（通过邮箱、GitHub 等）之后，使用默认选项应该就可以。

> 如果你想重新部署到同一个生产环境 URL，可以运行 `yarn vercel --prod`。如果省略 `--prod` 参数，它会被部署到一个预览/测试 URL。

> 按照步骤部署到 Vercel。它会给你一个公开的 URL。

> 🦊 由于我们已经部署到公共测试网，现在你需要使用自己拥有的钱包或 burner wallet（临时钱包）来连接。默认情况下，🔥 `burner wallets` 仅在本地网络上可用。你可以在前端配置（`packages/nextjs/` 中的 `scaffold.config.ts`）中设置 `burnerWalletMode: "allNetworks"`，在所有链上启用它们。

#### 为生产级应用配置第三方服务。

默认情况下，🏗 Scaffold-ETH 2 为 Alchemy 和 Etherscan 等常用服务提供了预设的 API key。这让你可以更轻松地开始开发和测试应用，而无需注册这些服务。

这对于完成 **Speedrun Ethereum** 来说非常方便，但是……

对于生产级应用，建议你获取自己的 API key（以避免触发速率限制）。你可以在以下位置进行配置：

<Tabs>
<Tab label="Hardhat">

**Hardhat**

- 在 `packages/hardhat/.env` 和 `packages/nextjs/.env.local` 中设置 `ALCHEMY_API_KEY` 变量。你可以在 [Alchemy 控制台](https://dashboard.alchemy.com/)创建 API key。
- 在 `packages/hardhat/.env` 中把 `ETHERSCAN_API_KEY` 变量设为你生成的 API key。你可以在[这里](https://etherscan.io/myapikey)获取你的 key。

</Tab>
<Tab label="Foundry">

**Foundry**

- 在 `packages/foundry/.env` 和 `packages/nextjs/.env.local` 中设置 `ALCHEMY_API_KEY` 变量。你可以在 [Alchemy 控制台](https://dashboard.alchemy.com/)创建 API key。
- 在 `packages/foundry/.env` 中把 `ETHERSCAN_API_KEY` 变量设为你生成的 API key。你可以在[这里](https://etherscan.io/myapikey)获取你的 key。

</Tab>
</Tabs>

> 💬 提示：对于线上应用，建议将 nextjs 的环境变量存放在 Vercel/系统环境变量配置中，本地测试则使用 .env.local。

---

## Checkpoint 7: 📜 合约验证

运行 `yarn verify --network your_network` 命令，在 Etherscan 上验证你的合约 🛰

👉 在 [Sepolia Etherscan](https://sepolia.etherscan.io/)（如果你部署到了 OP Sepolia，则在 [Optimism Sepolia Etherscan](https://sepolia-optimism.etherscan.io/)）上搜索这个地址，获取你要提交到 [SpeedrunEthereum.com](https://speedrunethereum.com) 的 URL。

---

> 🏃 [点这里](https://speedrunethereum.com)前往你的下一个挑战。

> 💬 对这套技术栈有问题、疑问或意见？发到 [🏗 scaffold-eth 开发者群聊](https://t.me/joinchat/F7nCRK3kI93PoCOk)
