export const skipQuickStart = true;
// CHALLENGE-TODO: 更新 readme 以反映你的挑战。最终你需要在扩展根目录下放一个非模板形式的
// README.md 文件，因此建议先把模板复制到一个 markdown 文件中，在确认模板无误后再
// 更新 extraContents。
// 在 README.md 文件 checkpoint 0 的开头加入以下代码
// *代码块开始*
// \`\`\`sh
// npx create-eth@<version> -e {challengeName} {challengeName}
// cd {challengeName}
// \`\`\`

// > in the same terminal, start your local network (a blockchain emulator in your computer):
// *代码块结束*

export const extraContents = `# {challengeEmoji} {challengeTitle}

A {challengeDescription}.

🌟 The final deliverable is an app that {challengeDeliverable}.
Deploy your contracts to a testnet then build and upload your app to a public web server. Submit the url on [SpeedRunEthereum.com](https://speedrunethereum.com)!

💬 Meet other builders working on this challenge and get help in the {challengeTelegramLink}

---

## Checkpoint 0: 📦 Environment 📚

> Start your local network (a blockchain emulator in your computer):

\`\`\`sh
yarn chain
\`\`\`

> in a second terminal window, 🛰 deploy your contract (locally):

\`\`\`sh
yarn deploy
\`\`\`

> in a third terminal window, start your 📱 frontend:

\`\`\`sh
yarn start
\`\`\`

📱 Open http://localhost:3000 to see the app.

> 👩‍💻 Rerun \`yarn deploy --reset\` whenever you want to deploy new contracts to the frontend, update your current contracts with changes, or re-deploy it to get a fresh contract address.

---

⚠️ We have disabled AI in Cursor and VSCode and highly suggest that you do not enable it so you can focus on the challenge, do everything by yourself, and hence better understand and remember things. If you are using another IDE, please disable AI yourself.

🔧 If you are a vibe-coder and don't care about understanding the syntax of the code used and just want to understand the general takeaways, you can re-enable AI by:
- Cursor: remove \`*\` from \`.cursorignore\` file
- VSCode: set \`chat.disableAIFeatures\` to \`false\` in \`.vscode/settings.json\` file

---

_Other commonly used Checkpoints (check one Challenge and adapt the texts for your own):_

## Checkpoint {num}: 💾 Deploy your contract! 🛰

## Checkpoint {num}: 🚢 Ship your frontend! 🚁

## Checkpoint {num}: 📜 Contract Verification

---

_Create all the required Checkpoints for the Challenge, can also add Side Quests you think may be interesting to complete. Check other Challenges for inspiration._

### ⚔️ Side Quests

_To finish your README, can add these links_

> 🏃 Head to your next challenge [here](https://speedrunethereum.com).

> 💬 Problems, questions, comments on the stack? Post them to the [🏗 scaffold-eth developers chat](https://t.me/joinchat/F7nCRK3kI93PoCOk)
`;
