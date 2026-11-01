# 🚩 挑战：🎟 代币化（Tokenization）

![readme](https://raw.githubusercontent.com/scaffold-eth/se-2-challenges/challenge-tokenization/extension/packages/nextjs/public/hero.png)

📚 本教程面向已经了解[ 🖍️ 基础知识 ](https://www.youtube.com/watch?v=MlJPjJQZtC8)的开发者。

🧑‍🏫 如果你想要一份对开发者更友好的入门介绍，可以观看我们的 15 集视频系列 [🎥 从 Web2 到 Web3](https://www.youtube.com/playlist?list=PLJz1HruEnenAf80uOfDwBPqaliJkjKg69)。

---

🎫 将独一无二的物品代币化：

👷‍♀️ 在这个 Speedrun Ethereum 挑战中，你将编译并部署你的第一批智能合约。然后，你将使用一个包含大量重要以太坊组件和 hooks 的 NextJS 模板应用。最后，你将把一个非同质化代币部署到公共网络上，在那里你可以把它发送给任何人！🚀

🌟 最终交付成果是一个应用，让用户可以铸造和转移 NFT，并理解链上所有权。将你的合约部署到测试网，然后构建你的应用并上传到公共 Web 服务器。在 [SpeedRunEthereum.com](https://speedrunethereum.com) 上提交该 URL！

💬 在[挑战 Telegram 群](https://t.me/+Y2vqXZZ_pEFhMGMx)中结识其他正在做这个挑战的开发者并获得帮助！

<details><summary>❓ 想知道“代币化（tokenization）”是什么意思吗？</summary>
代币化就像给任何东西发一本可以放进钱包随身携带的数字护照。它能证明谁拥有它，让你一键就能把它转交出去，并让应用能够自动识别它。在这个挑战中，你将铸造 ERC-721 代币（NFT）：每个代币都是独一无二的，由单一地址拥有（即 `ownerOf(tokenId)` 返回的地址）。转移是原子性的、即时的、可追溯的，并且由代码执行。

- **现实世界资产（RWA）**：想想股票、债券、黄金和房地产。如果这些资产被代币化，代币就充当一种数字权利凭证或登记条目。要在现实世界中产生效力，必须由发行方/托管方或法律框架将链上转移与链下权利关联起来；没有这座桥梁，它只是一个收藏品，而不是法律意义上的转让。

- 谁有权进行代币化？：合法的所有者或经授权的发行方。如果你并不控制那件东西，你的代币只是非官方的同人作品，而不是可强制执行的权利。

- **区块链原生资产**：有些东西生来就在链上：艺术品、游戏道具、ENS 名称、完全链上的媒体，甚至是专为链上验证而设计的演唱会门票。在这里，代币本身就是那件东西。这使它们可以在全球范围内转移、无需许可且可组合。你可以把它们接入交易市场、拍卖、借贷或游戏。随着世界向链上迁移，我们会看到更多原生体验，比如在门口即可验证的门票、转售时自动分成的版税，以及在不同应用之间解锁的权益。
</details>

---

🚫 **“等等，NFT 不就是猴子 JPEG 图片吗？”** 事实远非如此！虽然有些 NFT 只不过是指向一张图片的元数据，但重要的是要认识到以太坊上的资产是如何解锁可组合性的。

🌐 看看 ENS 是如何改进域名系统（DNS，也就是网站地址）的。它们只是 NFT，却承载着很多用途。不必记住并输入 64.233.180.138 就能访问 Google.com，这种便利同样由 ENS 名称带来，而且它的用途远不止于此。你还可以用这些 ENS 名称作为钱包地址的别名。查看 [vitalik.eth](https://app.ens.domains/vitalik.eth) 的 ENS 记录，你会看到其中有许多条记录——有些是地址，有些是内容。试着访问 [vitalik.eth.limo](https://vitalik.eth.limo)，看看 contentHash 记录是如何解析到他的个人网页的。

🦄 或者看看 Uniswap V3 是如何[使用 NFT](https://uniswapv3book.com/milestone_6/nft-manager.html) 来追踪每个流动性提供者在池中所占份额的。如果你现在还不理解这些术语，不用担心，只需意识到用这种方式表示资产所有权是一件意义重大的事。

♻️ 即使 NFT 本身完全没有任何功能，只反映了对一张“毫无价值”的图片的纯粹投机，你仍然可以在其他智能合约中使用该 NFT 来构建有趣的项目，就像 [PunkStrategy](https://www.punkstrategy.fun/) 所做的那样：你可以购买该协议中的代币，从而获得 CryptoPunk NFT 的部分敞口，同时参与一种策略——它会自动用代币销售的利润买入市场上价格最低的 Punk，然后以 20% 的溢价重新挂单出售——如此循环往复，永不停止！

🔓 可组合性解锁了这一切，乃至更多！

🚀 准备好了吗？你即将铸造一个全互联网都能看到、交易并在其之上进行构建的东西。

<details><summary>等等！“NFT” 到底代表什么？</summary>
NFT 是 Non-Fungible Token（非同质化代币）的缩写。非同质化意味着每个代币都是独一无二的。同质化代币（通常以 ERC-20 表示）都是一样的：每一个看起来、用起来都相同，并且拥有相同的能力。而对于 NFT，每个代币都有其独特之处。这就是为什么它们非常适合用来表示独特的名称、图片（猴子 JPEG）、DEX 流动性头寸，也许将来还有房地产地块。
</details>

## Checkpoint 0: 📦 环境 📚

在开始之前，你需要安装以下工具：

- [Node (>= v20.18.3)](https://nodejs.org/en/download/)
- Yarn（[v1](https://classic.yarnpkg.com/en/docs/install/) 或 [v2+](https://yarnpkg.com/getting-started/install)）
- [Git](https://git-scm.com/downloads)
- [Foundry](https://book.getfoundry.sh/getting-started/installation)（如果你选择 Foundry 作为 Solidity 框架）

然后将挑战下载到你的电脑上，并运行以下命令安装依赖：

```sh
npx create-eth@2.0.23 -e challenge-tokenization challenge-tokenization
```

> 出现提示时，选择你偏好的 Solidity 框架：**Hardhat** 或 **Foundry**。

```sh
cd challenge-tokenization
```

## 🤖 AI 引导学习模式（可选）

想要一个在你学习过程中边讲解概念边带你前进的交互式导师吗？本挑战支持 **AI 引导学习模式**！

1. 在 **Claude Code** 或 **Cursor** 等 AI 编程工具中打开本项目
2. 运行 `/start` 命令
3. AI 会讲解每个概念，然后通过提问来检查你的理解
4. 回答正确后，AI 会把相应的代码添加到你的合约中——一点一点地把它构建起来
5. 遇到困难时随时说 **"hint"**（提示），或使用 **`/skip`** 继续前进
6. 你的进度会被保存——随时使用 `/start` 继续

AI 不会直接把代码交给你——它会先讲解，然后通过提问来检查你的理解。随着你逐一掌握每个概念，合约就会一步步自动组装起来！

---

## 标准学习模式

> **注意：** 下面的截图显示的是 Hardhat 网络。如果你使用 Foundry，网络名称中会显示 "Foundry" 而不是 "Hardhat"，但其他一切都完全相同。

> 在同一个终端中，启动你的本地网络（一个运行在你电脑上的区块链模拟器）：

```sh
yarn chain
```

> 在第二个终端窗口中，🛰 部署你的合约（本地）：

```sh
cd challenge-tokenization
yarn deploy
```

> 在第三个终端窗口中，启动你的 📱 前端：

```sh
cd challenge-tokenization
yarn start
```

📱 打开 [http://localhost:3000](http://localhost:3000) 查看应用。

> _注意：截图中的界面可能与当前版本略有不同。_

---

⚠️ 我们已通过 `.vscode/settings.json` 禁用了 Cursor 的自动建议（Tab 补全和预测），以减少你编码时的干扰。AI 聊天和 agent 功能仍然可用，并且我们提供了包含项目上下文的 `AGENTS.md` 和 `CLAUDE.md` 文件，帮助 AI 助手理解代码库。

🔒 想要禁用 AI、一切都自己动手吗？（推荐，可以学得更深入）：

- Cursor：在项目根目录的 `.cursorignore` 文件中添加 `*`
- VSCode：在 `.vscode/settings.json` 文件中将 `chat.disableAIFeatures` 设置为 `true`

---

## Checkpoint 1: ⛽️ Gas 与钱包 👛

> ⛽️ Gas 是驱动你的交易的一笔小额费用，就像区块链的邮资。从水龙头领取测试资金，这样你就可以在链上进行交互了。

![gas&wallet](https://github.com/scaffold-eth/se-2-challenges/assets/80153681/912d0d4b-db34-49d3-bd7d-7ca0ab18eb66)

> 🦊 一开始，**不要**连接 MetaMask。如果你已经连接了，请点击 **Disconnect**（断开连接）：

<p>
  <img src="https://github.com/scaffold-eth/se-2-challenges/assets/80153681/2c7a1e40-50ad-4c20-ba3e-a56eff4b892b" width="33%" />
  <img src="https://github.com/scaffold-eth/se-2-challenges/assets/80153681/1bcf9752-e8ae-4db6-a0a6-5dc774abe46c" width="33%" />
</p>

> 🔥 我们将在 localhost 上使用 burner wallet（临时钱包）。它们是用完即弃的钱包，会自动签署交易，让你可以持续构建。

> 👛 在 🏗 Scaffold-ETH 2 中探索 burner wallet：打开一个无痕窗口并访问 <http://localhost:3000>。你会在右上角看到一个全新的地址。复制它，然后在你的第一个窗口中使用 **Faucet** 按钮（左下角）向它发送测试资金：

![icognito&webBrowser](https://github.com/user-attachments/assets/bf1cbb3e-b014-44b1-9b19-83d831abcb19)

> 👨🏻‍🚒 当你关闭无痕窗口时，那个账户就永远消失了。burner wallet 非常适合本地开发；在公共网络上你将切换到一个永久钱包。

---

## Checkpoint 2: 🖨 铸造

🦓 在这个挑战中，我们将铸造（或者说创建）水牛（Buffalo）、斑马（Zebra）和犀牛（Rhino）收藏品 NFT。它们的元数据存储在 [IPFS](https://ipfs.tech/) 上。这些 NFT 不会假装具有任何实际价值，但你对复杂的区块链所有权设计的理解，又能用什么价格来衡量呢？面对现实吧，它是**无价的！**

> ✏️ 是时候创造一些新东西了。在 `My NFTs` 标签页中点击 **MINT NFT**，铸造一个 ERC-721 代币——属于你的独一无二的链上收藏品。

![image](https://github.com/scaffold-eth/se-2-challenges/assets/80153681/74cf02f2-4c1b-4278-9841-f19f668e0b1e)

👀 你应该会看到你的 NFT 开始显示出来：

![image](https://github.com/scaffold-eth/se-2-challenges/assets/80153681/63dabceb-ad42-4c09-8e5d-a0139939e32d)

👛 打开一个无痕窗口并访问 <http://localhost:3000>。

🎟 试试转移！使用界面把一个代币发送到无痕窗口中的地址：

![image](https://github.com/scaffold-eth/se-2-challenges/assets/80153681/3b92fb50-d43f-48a8-838c-c45c443b0b71)

👛 尝试在无痕窗口中铸造一个代币

> 这个地址里没有资金，你还能铸造代币吗？你可能需要从水龙头领取资金来支付 gas。

🕵🏻‍♂️ 查看 `Debug Contracts` 标签页，弄清楚 `YourCollectible` 中某个特定代币的所有者是哪个地址（`ownerOf(tokenId)`）。

🔏 你也可以在 contracts 目录中查看你的智能合约 `YourCollectible.sol`

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

💼 快速看一下你的部署脚本：

<Tabs>
<Tab label="Hardhat">

**Hardhat**

`packages/hardhat/deploy`

</Tab>
<Tab label="Foundry">

**Foundry**

`packages/foundry/script`

</Tab>
</Tabs>

### 链上所有权入门

- **什么是所有权？** 某个独特物品的链上所有者，就是 `ownerOf(tokenId)` 返回的地址。
- **谁可以转移？** 只有所有者或经过授权的操作者（operator）才能转移代币。
- **转移时会发生什么？** 所有权会原子性地转移到新地址，并触发一个 `Transfer` 事件。
- **授权是如何工作的？** 对单个代币使用 `approve`，或使用 `setApprovalForAll` 授权某个操作者管理你的所有代币。
- **如何统计持有量？** `balanceOf(address)` 显示一个地址拥有多少个独特的代币。

📝 如果你想编辑前端，请进入 `packages/nextjs/app` 并打开你想修改的具体页面，例如：`/myNFTs/page.tsx`。关于[路由](https://nextjs.org/docs/app/building-your-application/routing/defining-routes)以及配置[页面/布局](https://nextjs.org/docs/app/building-your-application/routing/pages-and-layouts)的指导，请查阅 Next.js 文档。

> ✅ 运行自动化测试，确保你的合约正常工作：

```sh
yarn test
```

---

## Checkpoint 3: 💾 部署你的合约！🛰

🛰 准备好公开发布（到测试网）了吗？让我们把它发布出去。

🔐 使用 `yarn generate` 生成一个部署者地址。这会创建一个全新的部署者账户，并将助记词保存在本地。系统会提示你输入密码，该密码将用于加密你的私钥。**请务必记住这个密码，因为以后部署和查询账户时都需要用到它。**

> 这个本地账户用于部署你的合约（无需粘贴个人私钥）。

![chall-0-yarn-generate](https://github.com/scaffold-eth/se-2-challenges/assets/2486142/133f5701-e575-4cc2-904f-cdc83ae86d94)

👩‍🚀 使用 `yarn account` 快速查看余额和地址。

![chall-0-yarn-account](https://github.com/scaffold-eth/se-2-challenges/assets/2486142/c34df8c9-9793-4a76-849b-170fae7fd0f0)

⛽️ 从水龙头或其他钱包向你的部署者转入测试网 ETH，以便它能支付 gas。

> 一些常用的 Sepolia 水龙头有 [Alchemy Faucet](https://sepoliafaucet.com/)、[Infura Faucet](https://www.infura.io/faucet/sepolia) 和 [Google Cloud Faucet](https://cloud.google.com/application/web3/faucet/ethereum/sepolia)。

> ⚔️ 支线任务：在手机主屏幕上放一个 🧑‍🎤 [punkwallet.io](https://punkwallet.io)，并让里面一直有测试网 ETH。🧙‍♂️ 当你能在几秒钟内用手机为部署者地址充值时，你看起来就像个魔法师。

🚀 使用 `yarn deploy` 部署你的 NFT 智能合约。

<Tabs>
<Tab label="Hardhat">

**Hardhat**

> 💬 提示：你可以在 `hardhat.config.ts` 中将 `defaultNetwork` 设置为 `sepolia`，然后运行 `yarn deploy`；**或者**直接运行 `yarn deploy --network sepolia`。

![chall-0-hardhat-config](https://github.com/scaffold-eth/se-2-challenges/assets/55535804/f94b47d8-aa51-46eb-9c9e-7536559a5d45)

</Tab>
<Tab label="Foundry">

**Foundry**

> 💬 提示：使用 `yarn deploy --network sepolia`。

</Tab>
</Tabs>

---

## Checkpoint 4: 🚢 发布你的前端！🚁

> ✏️ 为前端配置正确的链。在 `packages/nextjs/scaffold.config.ts` 中，将 `targetNetwork` 设置为 `chains.sepolia`：

![chall-0-scaffold-config](https://github.com/scaffold-eth/se-2-challenges/assets/12072395/ff03bda0-66c6-4907-a9ad-bc8587da8036)

> 确认 http://localhost:3000 界面中的网络标识显示为 Sepolia：

![image](https://github.com/scaffold-eth/se-2-challenges/assets/80153681/50eef1f7-e1a3-4b3b-87e2-59c19362c4ff)

> 🦊 由于我们已经部署到公共测试网，你现在需要使用你自己拥有的钱包连接，或者使用 burner wallet。默认情况下，🔥 `burner wallets` 只在 `hardhat` 上可用。你可以在前端配置（`packages/nextjs/` 中的 `scaffold.config.ts`）里设置 `burnerWalletMode: "allNetworks"`，从而在所有链上启用它们

![image](https://github.com/scaffold-eth/se-2-challenges/assets/80153681/f582d311-9b57-4503-8143-bac60346ea33)

🚀 部署你的 NextJS 应用

```sh
yarn vercel
```

> 你可能需要先运行 `yarn vercel:login` 登录 Vercel。登录后（通过邮箱、GitHub 等方式），使用默认选项即可。

> 如果你想重新部署到同一个生产环境 URL，可以运行 `yarn vercel --prod`。如果省略 `--prod` 标志，它会部署到一个预览/测试 URL。

> 按照步骤部署到 Vercel。它会给你一个公开的 URL。

#### 为生产级应用配置第三方服务。

默认情况下，🏗 Scaffold-ETH 2 为 Alchemy 和 Etherscan 等常用服务提供了预定义的 API 密钥。这让你可以更轻松地开始开发和测试应用，而无需注册这些服务。
这非常适合用来完成你的 **Speedrun Ethereum**。

对于生产级应用，建议获取你自己的 API 密钥（以避免速率限制问题）。你可以在以下位置进行配置：

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

> 💬 提示：对于线上应用，建议将 nextjs 的环境变量存储在 Vercel/系统环境变量配置中，本地测试时则使用 .env.local。

---

## Checkpoint 5: 📜 合约验证

你可以通过运行以下命令（`yarn verify --network network_name`）在 Etherscan 上验证你的智能合约：

```sh
yarn verify --network sepolia
```

验证你的合约很重要，它能让其他人查看你的合约，并确认它不是骗局。

> 如果提示你的合约已经验证过了，也没关系。这只是意味着 Etherscan 识别出该合约的字节码与某个已部署并验证过的合约相同。复制 `YourCollectible.sol` 的地址，在 Sepolia Etherscan 上搜索它，获取你要为本挑战提交的 URL。

## Checkpoint 6: 💪 炫耀一下！

👩‍❤️‍👨 把你的公开 URL 分享给朋友，并向他们要一个地址，给他们发送一个收藏品：

![gif](https://github.com/scaffold-eth/se-2-challenges/assets/80153681/547612f6-97b9-4eb3-ab6d-9b6d2c0ac769)

## ⚔️ 支线任务

### 🦊 MetaMask 中的 NFT

> 🎫 想看看你的新 NFT 吗？查看你的 MetaMask 扩展！你铸造的 NFT 应该会出现在 NFTs 部分。

> 🌐 **重要**：在查看 NFT 之前，请确保已在 MetaMask 中切换到 Sepolia 测试网，因为你的合约部署在那里。

> 🔍 确保你已经在你的 Vercel 页面上铸造了一些 NFT，然后打开 MetaMask 扩展并进入 "NFTs" 标签页。

![image](https://raw.githubusercontent.com/scaffold-eth/se-2-challenges/challenge-tokenization/extension/packages/nextjs/public/nfts.png)

> 你可以直接在钱包里看到你那些闪亮的新 NFT 收藏！

（它们可能需要一段时间才会在 MetaMask 中显示，但一旦被检测到，就应该会出现在 NFTs 部分。）

> 🔧 **看不到你的 NFT？** 有时 MetaMask 不会自动检测到新的 NFT。你可以在 NFTs 标签页中点击 "Import NFT"，输入网络、你的合约地址和代币 ID 来手动添加。

![image](https://raw.githubusercontent.com/scaffold-eth/se-2-challenges/challenge-tokenization/extension/packages/nextjs/public/import-nft.png)

---

> 🏃 [点击这里](https://github.com/scaffold-eth/se-2-challenges)前往你的下一个挑战。

> 💬 对这套技术栈有问题、疑问或意见？请发到 [🏗 scaffold-eth 开发者聊天群](https://t.me/joinchat/F7nCRK3kI93PoCOk)
