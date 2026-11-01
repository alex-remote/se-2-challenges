# 英文注释中文翻译 · 任务进度跟踪

> 最后更新：2026-11-01 16:04 UTC　｜　总进度：**458 / 647** 个文本文件　｜　12 个分支，712 个文件（文本 647、二进制 65），文本共 83661 行

## 任务规则

1. 代码 / 配置文件：在英文原文的位置直接替换为中文注释，**文件行数保持不变**；代码、字符串字面量、标识符不改。
2. 保留专有名词、函数名、变量名、合约名等代码内的明确指代；被注释掉的代码、SPDX / eslint 等机器指令保持原样。
3. 英文 `.md` 文件：在同一路径生成 `<原文件名>_zh.md` 译文，逐行对应，行数与原文一致。
4. 二进制文件（图片、视频）不处理，仅计数。
5. 每个分支在独立 worktree 中处理，结果提交到 `<分支名>_zh` 分支。
6. 勾选框：`[ ]` 未处理，`[x]` 已处理（已翻译 / 已确认无需改动）。

## 分支总览

| 分支 | 文件总数 | 文本文件 | 二进制 | 文本总行数 | 已完成 | 目标分支 |
|---|---:|---:|---:|---:|---:|---|
| [`main`](#main) | 3 | 3 | 0 | 188 | 3 / 3 ✅ | `main_zh` |
| [`base-challenge-template`](#base-challenge-template) | 27 | 26 | 1 | 1332 | 26 / 26 ✅ | `base-challenge-template_zh` |
| [`challenge-crowdfunding`](#challenge-crowdfunding) | 49 | 46 | 3 | 4323 | 46 / 46 ✅ | `challenge-crowdfunding_zh` |
| [`challenge-dex`](#challenge-dex) | 46 | 43 | 3 | 5293 | 43 / 43 ✅ | `challenge-dex_zh` |
| [`challenge-dice-game`](#challenge-dice-game) | 66 | 46 | 20 | 3717 | 46 / 46 ✅ | `challenge-dice-game_zh` |
| [`challenge-oracles`](#challenge-oracles) | 126 | 123 | 3 | 19492 | 21 / 123 | `challenge-oracles_zh` |
| [`challenge-over-collateralized-lending`](#challenge-over-collateralized-lending) | 67 | 65 | 2 | 7419 | 65 / 65 ✅ | `challenge-over-collateralized-lending_zh` |
| [`challenge-prediction-markets`](#challenge-prediction-markets) | 78 | 66 | 12 | 12159 | 20 / 66 | `challenge-prediction-markets_zh` |
| [`challenge-stablecoins`](#challenge-stablecoins) | 79 | 77 | 2 | 11803 | 77 / 77 ✅ | `challenge-stablecoins_zh` |
| [`challenge-token-vendor`](#challenge-token-vendor) | 46 | 43 | 3 | 4345 | 43 / 43 ✅ | `challenge-token-vendor_zh` |
| [`challenge-tokenization`](#challenge-tokenization) | 53 | 48 | 5 | 3410 | 48 / 48 ✅ | `challenge-tokenization_zh` |
| [`challenge-zk-voting`](#challenge-zk-voting) | 72 | 61 | 11 | 10180 | 20 / 61 | `challenge-zk-voting_zh` |

## 子代理分组

共享文件（多个分支内容完全相同）只翻译一次，再复制到各分支；大 README 按 Checkpoint 切分为多段并行翻译。

| 分组 | 文件数 | 行数 | 状态 |
|---|---:|---:|---|
| `common-shared` | 24 个（复制到各分支共 215 份） | 6594 | ✅ 已完成 |
| `base-main` | 9 | 521 | ✅ 已完成 |
| `common-start` | 1 个（复制到各分支共 11 份） | 4576 | ✅ 已完成 |
| `crowd-readme` | 1 | 644 | ✅ 已完成 |
| `crowd-code` | 24 | 2656 | ✅ 已完成 |
| `dex-readme` | 1 | 736 | ✅ 已完成 |
| `dex-code` | 22 | 3558 | ✅ 已完成 |
| `dice-readme` | 1 | 468 | ✅ 已完成 |
| `dice-code` | 25 | 2250 | ✅ 已完成 |
| `orc-readme-p1` | 1 | 541 | 🔄 进行中 |
| `orc-readme-p2` | 1 | 456 | 🔄 进行中 |
| `orc-readme-p3` | 1 | 623 | 🔄 进行中 |
| `orc-readme-p4` | 1 | 610 | 🔄 进行中 |
| `orc-sol` | 21 | 5567 | 🔄 进行中 |
| `orc-ftest` | 16 | 3345 | 🔄 进行中 |
| `orc-htest` | 15 | 3065 | 🔄 进行中 |
| `orc-web` | 49 | 4239 | 🔄 进行中 |
| `lend-readme-p1` | 1 | 521 | ✅ 已完成 |
| `lend-readme-p2` | 1 | 567 | ✅ 已完成 |
| `lend-web` | 22 | 3019 | ✅ 已完成 |
| `lend-sol` | 20 | 2248 | ✅ 已完成 |
| `pm-readme-p1` | 1 | 627 | ✅ 已完成 |
| `pm-readme-p2` | 1 | 662 | 🔄 进行中 |
| `pm-readme-p3` | 1 | 482 | 🔄 进行中 |
| `pm-web` | 33 | 6291 | 🔄 进行中 |
| `pm-sol` | 11 | 1590 | 🔄 进行中 |
| `pm-test` | 1 | 1508 | 🔄 进行中 |
| `stab-readme-p1` | 1 | 645 | ✅ 已完成 |
| `stab-readme-p2` | 1 | 570 | ✅ 已完成 |
| `stab-web` | 26 | 4439 | ✅ 已完成 |
| `stab-sol` | 19 | 1556 | ✅ 已完成 |
| `stab-test` | 10 | 3573 | ✅ 已完成 |
| `vendor-readme` | 1 | 682 | ✅ 已完成 |
| `vendor-code` | 21 | 2640 | ✅ 已完成 |
| `nft-readme` | 1 | 366 | ✅ 已完成 |
| `nft-code` | 27 | 2045 | ✅ 已完成 |
| `zk-readme-p1` | 1 | 462 | 🔄 进行中 |
| `zk-readme-p2` | 1 | 556 | 🔄 进行中 |
| `zk-readme-p3` | 1 | 548 | 🔄 进行中 |
| `zk-readme-p4` | 1 | 529 | 🔄 进行中 |
| `zk-sol` | 20 | 4872 | 🔄 进行中 |
| `zk-web` | 20 | 2214 | 🔄 进行中 |

## 文件清单

### main

文本文件 3 个（已完成 3），二进制 0 个 → 目标分支 `main_zh`

- [x] `LICENCE.txt` — 21 行 · `base-main` · ✅ 无需改动（MIT 许可证法律文本，不翻译）
- [x] `README.md` — 162 行 · `base-main` · ✅ 已生成 `README_zh.md`（/home/user/se-2-challenges/.worktrees/main/README_zh.md，162 行）
- [x] `funding.json` — 5 行 · `common-shared` · ✅ 无需改动（funding.json，JSON 无注释）

### base-challenge-template

文本文件 26 个（已完成 26），二进制 1 个 → 目标分支 `base-challenge-template_zh`

- [x] `.cursorignore.example` — 4 行 · `common-shared` · ✅ 已翻译注释（改动 2 行；校验 OK）
- [x] `.github/Revalidation.md` — 75 行 · `common-shared` · ✅ 已生成 `Revalidation_zh.md`（.github/Revalidation_zh.md，75 行；check_md OK，WARN 1（均为标识符/路径，已确认））
- [x] `.github/workflows/grader-update-challenge.yml` — 84 行 · `common-shared` · ✅ 已翻译注释（改动 2 行；校验 CODE-CHANGED(误报,已确认)；run: | 块内 shell 注释，check_inplace 报 CODE-CHANGED 属误报，已人工确认）
- [x] `.github/workflows/revalidate-challenge-readme.yml` — 68 行 · `common-shared` · ✅ 已翻译注释（改动 2 行；校验 CODE-CHANGED(误报,已确认)；run: | 块内 shell 注释，check_inplace 报 CODE-CHANGED 属误报，已人工确认）
- [x] `.gitignore.example` — 26 行 · `common-shared` · ✅ 已翻译注释（改动 3 行；校验 OK；yarn/eslint/IDE/cli 分组标签保留英文）
- [x] `LICENCE.txt` — 21 行 · `common-shared` · ✅ 无需改动（MIT 许可证法律文本，按规范不翻译）
- [x] `README.md` — 6 行 · `base-main` · ✅ 已生成 `README_zh.md`（/home/user/se-2-challenges/.worktrees/base-challenge-template/README_zh.md，6 行）
- [x] `extension/.ai/CHALLENGE.yaml.example` — 183 行 · `base-main` · ✅ 已翻译注释（改动 30 行；块标量（setup.template/code/solution/context/completion_message 等）内的 // 与 ## 内容属于 YAML 字符串值，按规范未翻译；纯分隔线保留）
- [x] `extension/.ai/agents/progress-tracker-content.md` — 94 行 · `common-shared` · ✅ 已生成 `progress-tracker-content_zh.md`（extension/.ai/agents/progress-tracker-content_zh.md，94 行；check_md OK，WARN 0（均为标识符/路径，已确认））
- [x] `extension/.ai/instructions/skip-content.md` — 63 行 · `common-shared` · ✅ 已生成 `skip-content_zh.md`（extension/.ai/instructions/skip-content_zh.md，63 行；check_md OK，WARN 0（均为标识符/路径，已确认））
- [x] `extension/.ai/instructions/start-content.md` — 416 行 · `common-start` · ✅ 已生成 `start-content_zh.md`（/home/user/se-2-challenges/.worktrees/base-challenge-template/extension/.ai/instructions/start-content_zh.md（416 行，check_md OK；WARN 47 条均为代码块内自然语言消息模板的翻译，已人工确认））
- [x] `extension/.claude/agents/progress-tracker.md` — 8 行 · `common-shared` · ✅ 已生成 `progress-tracker_zh.md`（extension/.claude/agents/progress-tracker_zh.md，8 行；check_md OK，WARN 2（均为标识符/路径，已确认））
- [x] `extension/.claude/settings.local.json.template.mjs` — 9 行 · `common-shared` · ✅ 无需改动（无注释（仅 JSON 模板字符串））
- [x] `extension/.claude/skills/skip/SKILL.md` — 10 行 · `common-shared` · ✅ 已生成 `SKILL_zh.md`（extension/.claude/skills/skip/SKILL_zh.md，10 行；check_md OK，WARN 0（均为标识符/路径，已确认））
- [x] `extension/.claude/skills/start/SKILL.md` — 10 行 · `common-shared` · ✅ 已生成 `SKILL_zh.md`（extension/.claude/skills/start/SKILL_zh.md，10 行；check_md OK，WARN 0（均为标识符/路径，已确认））
- [x] `extension/.cursor/agents/progress-tracker.md` — 6 行 · `common-shared` · ✅ 无需改动（MD 仅含 front matter 标识值(name/model)与 @ 引用路径，无可翻译文本，未生成 _zh.md）
- [x] `extension/.cursor/commands/skip.md` — 5 行 · `common-shared` · ✅ 已生成 `skip_zh.md`（extension/.cursor/commands/skip_zh.md，5 行；check_md OK，WARN 0（均为标识符/路径，已确认））
- [x] `extension/.cursor/commands/start.md` — 5 行 · `common-shared` · ✅ 已生成 `start_zh.md`（extension/.cursor/commands/start_zh.md，5 行；check_md OK，WARN 0（均为标识符/路径，已确认））
- [x] `extension/.vscode/settings.json` — 5 行 · `common-shared` · ✅ 无需改动（JSON 配置，无注释）
- [x] `extension/README.md.args.mjs` — 79 行 · `base-main` · ✅ 已翻译注释（改动 6 行；extraContents 模板字符串正文未动；注释中“代码块开始/结束”之间的待粘贴内容（L7-10 命令代码、L12 待复制进英文 README 的 Markdown 句子）保留原文；CHALLENGE-TODO 标记保留英文）
- [x] `extension/packages/nextjs/app/layout.tsx.args.mjs` — 16 行 · `base-main` · ✅ 已翻译注释（改动 1 行）
- [x] `extension/packages/nextjs/app/page.tsx.args.mjs` — 31 行 · `base-main` · ✅ 已翻译注释（改动 3 行；L2 为注释掉的代码，保留）
- [x] `extension/packages/nextjs/components/Header.tsx.args.mjs` — 15 行 · `base-main` · ✅ 已翻译注释（改动 3 行）
- [x] `extension/packages/nextjs/next.config.ts.args.mjs` — 8 行 · `base-main` · ✅ 无需改动（文件中没有注释）
- [x] `extension/packages/nextjs/styles/globals.css.args.mjs` — 83 行 · `common-shared` · ✅ 已翻译注释（改动 4 行；校验 CODE-CHANGED(误报,已确认)；模板字符串内 CSS 注释，check_inplace 报 CODE-CHANGED 属误报，已人工确认）
- [x] `extension/packages/nextjs/utils/scaffold-eth/getMetadata.ts.args.mjs` — 2 行 · `common-shared` · ✅ 无需改动（无注释）

<details><summary>二进制文件 1 个（不处理）</summary>

- `extension/packages/nextjs/public/thumbnail.png`

</details>

### challenge-crowdfunding

文本文件 46 个（已完成 46），二进制 3 个 → 目标分支 `challenge-crowdfunding_zh`

- [x] `.cursorignore.example` — 4 行 · `common-shared` · ✅ 已翻译注释（改动 2 行；校验 OK）
- [x] `.github/Revalidation.md` — 75 行 · `common-shared` · ✅ 已生成 `Revalidation_zh.md`（.github/Revalidation_zh.md，75 行；check_md OK，WARN 1（均为标识符/路径，已确认））
- [x] `.github/workflows/grader-update-challenge.yml` — 84 行 · `common-shared` · ✅ 已翻译注释（改动 2 行；校验 CODE-CHANGED(误报,已确认)；run: | 块内 shell 注释，check_inplace 报 CODE-CHANGED 属误报，已人工确认）
- [x] `.github/workflows/revalidate-challenge-readme.yml` — 68 行 · `common-shared` · ✅ 已翻译注释（改动 2 行；校验 CODE-CHANGED(误报,已确认)；run: | 块内 shell 注释，check_inplace 报 CODE-CHANGED 属误报，已人工确认）
- [x] `.gitignore.example` — 26 行 · `common-shared` · ✅ 已翻译注释（改动 3 行；校验 OK；yarn/eslint/IDE/cli 分组标签保留英文）
- [x] `LICENCE.txt` — 21 行 · `common-shared` · ✅ 无需改动（MIT 许可证法律文本，按规范不翻译）
- [x] `README.md` — 644 行 · `crowd-readme` · ✅ 已生成 `README_zh.md`（/home/user/se-2-challenges/.worktrees/challenge-crowdfunding/README_zh.md，644 行（与原文一致）；check_md [OK]，WARN 11 条已逐条确认：9 条为代码块内注释翻译（L232、L519-L539，代码与缩进未变），2 条为纯行内代码行（L244、L246，无需翻译））
- [x] `extension/.ai/CHALLENGE.yaml` — 619 行 · `crowd-code` · ✅ 已翻译注释（改动 6 行（结构层 # 注释：L7-8 及 4 个 CHECKPOINT 分隔标题）；块标量内的 Markdown 正文未动）
- [x] `extension/.ai/CONCEPTS.yaml` — 91 行 · `crowd-code` · ✅ 无需改动（无注释（全部为 YAML 值/块标量正文））
- [x] `extension/.ai/agents/progress-tracker-content.md` — 94 行 · `common-shared` · ✅ 已生成 `progress-tracker-content_zh.md`（extension/.ai/agents/progress-tracker-content_zh.md，94 行；check_md OK，WARN 0（均为标识符/路径，已确认））
- [x] `extension/.ai/instructions/skip-content.md` — 63 行 · `common-shared` · ✅ 已生成 `skip-content_zh.md`（extension/.ai/instructions/skip-content_zh.md，63 行；check_md OK，WARN 0（均为标识符/路径，已确认））
- [x] `extension/.ai/instructions/start-content.md` — 416 行 · `common-start` · ✅ 已生成 `start-content_zh.md`（/home/user/se-2-challenges/.worktrees/challenge-crowdfunding/extension/.ai/instructions/start-content_zh.md（416 行，check_md OK；WARN 47 条均为代码块内自然语言消息模板的翻译，已人工确认））
- [x] `extension/.claude/agents/progress-tracker.md` — 8 行 · `common-shared` · ✅ 已生成 `progress-tracker_zh.md`（extension/.claude/agents/progress-tracker_zh.md，8 行；check_md OK，WARN 2（均为标识符/路径，已确认））
- [x] `extension/.claude/settings.local.json.template.mjs` — 9 行 · `common-shared` · ✅ 无需改动（无注释（仅 JSON 模板字符串））
- [x] `extension/.claude/skills/skip/SKILL.md` — 10 行 · `common-shared` · ✅ 已生成 `SKILL_zh.md`（extension/.claude/skills/skip/SKILL_zh.md，10 行；check_md OK，WARN 0（均为标识符/路径，已确认））
- [x] `extension/.claude/skills/start/SKILL.md` — 10 行 · `common-shared` · ✅ 已生成 `SKILL_zh.md`（extension/.claude/skills/start/SKILL_zh.md，10 行；check_md OK，WARN 0（均为标识符/路径，已确认））
- [x] `extension/.cursor/agents/progress-tracker.md` — 6 行 · `common-shared` · ✅ 无需改动（MD 仅含 front matter 标识值(name/model)与 @ 引用路径，无可翻译文本，未生成 _zh.md）
- [x] `extension/.cursor/commands/skip.md` — 5 行 · `common-shared` · ✅ 已生成 `skip_zh.md`（extension/.cursor/commands/skip_zh.md，5 行；check_md OK，WARN 0（均为标识符/路径，已确认））
- [x] `extension/.cursor/commands/start.md` — 5 行 · `common-shared` · ✅ 已生成 `start_zh.md`（extension/.cursor/commands/start_zh.md，5 行；check_md OK，WARN 0（均为标识符/路径，已确认））
- [x] `extension/.vscode/settings.json` — 5 行 · `common-shared` · ✅ 无需改动（JSON 配置，无注释）
- [x] `extension/AGENTS.md.args.mjs` — 223 行 · `crowd-code` · ✅ 已翻译注释（改动 1 行（L1 JS 注释）；模板字符串中的 AGENTS.md 正文（含其代码块内的 #/// 注释）按要求视为字符串未译）
- [x] `extension/README.md.args.mjs` — 524 行 · `crowd-code` · ✅ 无需改动（模板字符串外无 JS 注释；README 正文（含代码块内注释）为字符串，不译）
- [x] `extension/packages/foundry/contracts/CrowdFund.sol` — 68 行 · `crowd-code` · ✅ 已翻译注释（改动 10 行（pragma 行尾注释、区块标题横幅、占位注释）；SPDX 保留）
- [x] `extension/packages/foundry/contracts/FundingRecipient.sol` — 10 行 · `crowd-code` · ✅ 已翻译注释（改动 1 行（pragma 行尾注释）；与 hardhat 副本译文完全一致）
- [x] `extension/packages/foundry/contracts/ICrowdFund.sol` — 11 行 · `crowd-code` · ✅ 无需改动（仅有 SPDX 许可证标识）
- [x] `extension/packages/foundry/script/Deploy.s.sol.args.mjs` — 5 行 · `crowd-code` · ✅ 无需改动（无注释）
- [x] `extension/packages/foundry/script/DeployCrowdFund.s.sol` — 16 行 · `crowd-code` · ✅ 无需改动（仅有 SPDX 许可证标识）
- [x] `extension/packages/foundry/test/CrowdFund.t.sol` — 246 行 · `crowd-code` · ✅ 已翻译注释（改动 14 行（含 NatSpec @dev，标签保留）；SPDX 保留）
- [x] `extension/packages/hardhat/contracts/CrowdFund.sol` — 69 行 · `crowd-code` · ✅ 已翻译注释（改动 10 行；与 foundry 版译文一致（行号因多一行 console.sol import 偏移 1））
- [x] `extension/packages/hardhat/contracts/FundingRecipient.sol` — 10 行 · `crowd-code` · ✅ 已翻译注释（改动 1 行（pragma 行尾注释）；与 foundry 副本译文完全一致）
- [x] `extension/packages/hardhat/deploy/00_deploy_funding_recipient.ts` — 17 行 · `crowd-code` · ✅ 已翻译注释（改动 1 行（JSDoc））
- [x] `extension/packages/hardhat/deploy/01_deploy_crowdfund.ts` — 19 行 · `crowd-code` · ✅ 已翻译注释（改动 1 行（JSDoc））
- [x] `extension/packages/hardhat/hardhat.config.ts.args.mjs` — 24 行 · `common-shared` · ✅ 无需改动（仅有一条纯 URL 注释，按规范保留）
- [x] `extension/packages/hardhat/test/CrowdFund.ts` — 375 行 · `crowd-code` · ✅ 已翻译注释（改动 30 行；eslint-disable 指令与空 // 行保留）
- [x] `extension/packages/nextjs/app/contributions/page.tsx` — 63 行 · `crowd-code` · ✅ 无需改动（无注释）
- [x] `extension/packages/nextjs/app/crowdfund/_components/ContributeContractInteraction.tsx` — 143 行 · `crowd-code` · ✅ 无需改动（无注释）
- [x] `extension/packages/nextjs/app/crowdfund/_components/EthToPrice.tsx` — 53 行 · `crowd-code` · ✅ 已翻译注释（改动 1 行（JSDoc））
- [x] `extension/packages/nextjs/app/crowdfund/_components/index.tsx` — 2 行 · `crowd-code` · ✅ 无需改动（无注释）
- [x] `extension/packages/nextjs/app/crowdfund/page.tsx` — 12 行 · `crowd-code` · ✅ 无需改动（无注释）
- [x] `extension/packages/nextjs/app/layout.tsx.args.mjs` — 15 行 · `crowd-code` · ✅ 无需改动（无注释）
- [x] `extension/packages/nextjs/app/page.tsx.args.mjs` — 40 行 · `crowd-code` · ✅ 无需改动（无注释（模板中为 JSX 界面文案，不译））
- [x] `extension/packages/nextjs/components/Header.tsx.args.mjs` — 17 行 · `crowd-code` · ✅ 无需改动（无注释）
- [x] `extension/packages/nextjs/next.config.ts.args.mjs` — 5 行 · `common-shared` · ✅ 无需改动（无注释）
- [x] `extension/packages/nextjs/package.json` — 8 行 · `crowd-code` · ✅ 无需改动（JSON 无注释）
- [x] `extension/packages/nextjs/styles/globals.css.args.mjs` — 83 行 · `common-shared` · ✅ 已翻译注释（改动 4 行；校验 CODE-CHANGED(误报,已确认)；模板字符串内 CSS 注释，check_inplace 报 CODE-CHANGED 属误报，已人工确认）
- [x] `extension/packages/nextjs/utils/scaffold-eth/getMetadata.ts.args.mjs` — 2 行 · `common-shared` · ✅ 无需改动（无注释）

<details><summary>二进制文件 3 个（不处理）</summary>

- `extension/packages/nextjs/public/hero.png`
- `extension/packages/nextjs/public/thumbnail-challenge.png`
- `extension/packages/nextjs/public/thumbnail.png`

</details>

### challenge-dex

文本文件 43 个（已完成 43），二进制 3 个 → 目标分支 `challenge-dex_zh`

- [x] `.cursorignore.example` — 4 行 · `common-shared` · ✅ 已翻译注释（改动 2 行；校验 OK）
- [x] `.github/Revalidation.md` — 75 行 · `common-shared` · ✅ 已生成 `Revalidation_zh.md`（.github/Revalidation_zh.md，75 行；check_md OK，WARN 1（均为标识符/路径，已确认））
- [x] `.github/workflows/grader-update-challenge.yml` — 84 行 · `common-shared` · ✅ 已翻译注释（改动 2 行；校验 CODE-CHANGED(误报,已确认)；run: | 块内 shell 注释，check_inplace 报 CODE-CHANGED 属误报，已人工确认）
- [x] `.github/workflows/revalidate-challenge-readme.yml` — 68 行 · `common-shared` · ✅ 已翻译注释（改动 2 行；校验 CODE-CHANGED(误报,已确认)；run: | 块内 shell 注释，check_inplace 报 CODE-CHANGED 属误报，已人工确认）
- [x] `.gitignore.example` — 26 行 · `common-shared` · ✅ 已翻译注释（改动 3 行；校验 OK；yarn/eslint/IDE/cli 分组标签保留英文）
- [x] `LICENCE.txt` — 21 行 · `common-shared` · ✅ 无需改动（MIT 许可证法律文本，按规范不翻译）
- [x] `README.md` — 736 行 · `dex-readme` · ✅ 已生成 `README_zh.md`（/home/user/se-2-challenges/.worktrees/challenge-dex/README_zh.md；736 行，check_md [OK]，WARN 14 条均已确认：5 处代码块注释翻译（L159/L166 分节标题、L174/L177/L410 行注释）、L272 无语言标识代码块中的说明性伪公式已译为中文、8 条为纯路径/行内代码行（无需翻译））
- [x] `extension/.ai/CHALLENGE.yaml` — 745 行 · `dex-code` · ✅ 已翻译注释（改动 4 行（结构层 # CHECKPOINT 注释）；块标量内 Markdown 正文未动）
- [x] `extension/.ai/CONCEPTS.yaml` — 90 行 · `dex-code` · ✅ 无需改动（无结构层 # 注释，正文均为 YAML 字符串值）
- [x] `extension/.ai/agents/progress-tracker-content.md` — 94 行 · `common-shared` · ✅ 已生成 `progress-tracker-content_zh.md`（extension/.ai/agents/progress-tracker-content_zh.md，94 行；check_md OK，WARN 0（均为标识符/路径，已确认））
- [x] `extension/.ai/instructions/skip-content.md` — 63 行 · `common-shared` · ✅ 已生成 `skip-content_zh.md`（extension/.ai/instructions/skip-content_zh.md，63 行；check_md OK，WARN 0（均为标识符/路径，已确认））
- [x] `extension/.ai/instructions/start-content.md` — 416 行 · `common-start` · ✅ 已生成 `start-content_zh.md`（/home/user/se-2-challenges/.worktrees/challenge-dex/extension/.ai/instructions/start-content_zh.md（416 行，check_md OK；WARN 47 条均为代码块内自然语言消息模板的翻译，已人工确认））
- [x] `extension/.claude/agents/progress-tracker.md` — 8 行 · `common-shared` · ✅ 已生成 `progress-tracker_zh.md`（extension/.claude/agents/progress-tracker_zh.md，8 行；check_md OK，WARN 2（均为标识符/路径，已确认））
- [x] `extension/.claude/settings.local.json.template.mjs` — 9 行 · `common-shared` · ✅ 无需改动（无注释（仅 JSON 模板字符串））
- [x] `extension/.claude/skills/skip/SKILL.md` — 10 行 · `common-shared` · ✅ 已生成 `SKILL_zh.md`（extension/.claude/skills/skip/SKILL_zh.md，10 行；check_md OK，WARN 0（均为标识符/路径，已确认））
- [x] `extension/.claude/skills/start/SKILL.md` — 10 行 · `common-shared` · ✅ 已生成 `SKILL_zh.md`（extension/.claude/skills/start/SKILL_zh.md，10 行；check_md OK，WARN 0（均为标识符/路径，已确认））
- [x] `extension/.cursor/agents/progress-tracker.md` — 6 行 · `common-shared` · ✅ 无需改动（MD 仅含 front matter 标识值(name/model)与 @ 引用路径，无可翻译文本，未生成 _zh.md）
- [x] `extension/.cursor/commands/skip.md` — 5 行 · `common-shared` · ✅ 已生成 `skip_zh.md`（extension/.cursor/commands/skip_zh.md，5 行；check_md OK，WARN 0（均为标识符/路径，已确认））
- [x] `extension/.cursor/commands/start.md` — 5 行 · `common-shared` · ✅ 已生成 `start_zh.md`（extension/.cursor/commands/start_zh.md，5 行；check_md OK，WARN 0（均为标识符/路径，已确认））
- [x] `extension/.vscode/settings.json` — 5 行 · `common-shared` · ✅ 无需改动（JSON 配置，无注释）
- [x] `extension/AGENTS.md.args.mjs` — 240 行 · `dex-code` · ✅ 已翻译注释（改动 1 行（第 1 行 JS 注释）；模板字符串内的 AGENTS.md 正文（含代码块里的 # 注释）按要求未译）
- [x] `extension/README.md.args.mjs` — 573 行 · `dex-code` · ✅ 无需改动（模板字符串外无注释；模板内 README 正文（含代码块）是字符串，未译）
- [x] `extension/packages/foundry/contracts/Balloons.sol` — 10 行 · `dex-code` · ✅ 已翻译注释（改动 1 行；与 hardhat 版译文一致）
- [x] `extension/packages/foundry/contracts/DEX.sol` — 64 行 · `dex-code` · ✅ 已翻译注释（改动 15 行（含分节横幅标题，已按显示宽度补齐斜杠）；与 hardhat 版译文一致）
- [x] `extension/packages/foundry/contracts/IDEX.sol` — 38 行 · `dex-code` · ✅ 已翻译注释（改动 3 行（分节横幅标题，译法同 DEX.sol））
- [x] `extension/packages/foundry/script/Deploy.s.sol.args.mjs` — 5 行 · `dex-code` · ✅ 无需改动（无注释）
- [x] `extension/packages/foundry/script/DeployDEX.s.sol` — 23 行 · `dex-code` · ✅ 已翻译注释（改动 2 行；被注释掉的代码保持原样）
- [x] `extension/packages/foundry/test/DEX.t.sol` — 232 行 · `dex-code` · ✅ 已翻译注释（改动 7 行；L71 "Checkpoint 3: price()" 只有标记和函数名，保持原样）
- [x] `extension/packages/hardhat/contracts/Balloons.sol` — 10 行 · `dex-code` · ✅ 已翻译注释（改动 1 行；与 foundry 版译文一致）
- [x] `extension/packages/hardhat/contracts/DEX.sol` — 65 行 · `dex-code` · ✅ 已翻译注释（改动 15 行；与 foundry 版译文一致）
- [x] `extension/packages/hardhat/deploy/00_deploy_dex.ts` — 46 行 · `dex-code` · ✅ 已翻译注释（改动 12 行；被注释掉的代码保持原样）
- [x] `extension/packages/hardhat/hardhat.config.ts.args.mjs` — 16 行 · `dex-code` · ✅ 无需改动（只有纯 URL 注释）
- [x] `extension/packages/hardhat/test/DEX.ts` — 219 行 · `dex-code` · ✅ 已翻译注释（改动 7 行；L5-8 为 yarn 命令，保持原样）
- [x] `extension/packages/nextjs/app/dex/_components/Curve.tsx` — 543 行 · `dex-code` · ✅ 已翻译注释（改动 34 行）
- [x] `extension/packages/nextjs/app/dex/_components/index.tsx` — 1 行 · `dex-code` · ✅ 无需改动（无注释（仅一行 export））
- [x] `extension/packages/nextjs/app/dex/page.tsx` — 350 行 · `dex-code` · ✅ 已翻译注释（改动 5 行；其中 3 行 @ts-expect-error 指令保留，只译了 "-" 后面的说明文字）
- [x] `extension/packages/nextjs/app/events/page.tsx` — 216 行 · `dex-code` · ✅ 无需改动（无注释）
- [x] `extension/packages/nextjs/app/layout.tsx.args.mjs` — 15 行 · `dex-code` · ✅ 无需改动（无注释）
- [x] `extension/packages/nextjs/app/page.tsx.args.mjs` — 40 行 · `dex-code` · ✅ 无需改动（无注释（模板字符串里是 JSX 界面文案））
- [x] `extension/packages/nextjs/components/Header.tsx.args.mjs` — 17 行 · `dex-code` · ✅ 无需改动（无注释）
- [x] `extension/packages/nextjs/next.config.ts.args.mjs` — 5 行 · `common-shared` · ✅ 无需改动（无注释）
- [x] `extension/packages/nextjs/styles/globals.css.args.mjs` — 83 行 · `common-shared` · ✅ 已翻译注释（改动 4 行；校验 CODE-CHANGED(误报,已确认)；模板字符串内 CSS 注释，check_inplace 报 CODE-CHANGED 属误报，已人工确认）
- [x] `extension/packages/nextjs/utils/scaffold-eth/getMetadata.ts.args.mjs` — 2 行 · `common-shared` · ✅ 无需改动（无注释）

<details><summary>二进制文件 3 个（不处理）</summary>

- `extension/packages/nextjs/public/hero.png`
- `extension/packages/nextjs/public/thumbnail-challenge.png`
- `extension/packages/nextjs/public/thumbnail.png`

</details>

### challenge-dice-game

文本文件 46 个（已完成 46），二进制 20 个 → 目标分支 `challenge-dice-game_zh`

- [x] `.cursorignore.example` — 4 行 · `common-shared` · ✅ 已翻译注释（改动 2 行；校验 OK）
- [x] `.github/Revalidation.md` — 75 行 · `common-shared` · ✅ 已生成 `Revalidation_zh.md`（.github/Revalidation_zh.md，75 行；check_md OK，WARN 1（均为标识符/路径，已确认））
- [x] `.github/workflows/grader-update-challenge.yml` — 84 行 · `common-shared` · ✅ 已翻译注释（改动 2 行；校验 CODE-CHANGED(误报,已确认)；run: | 块内 shell 注释，check_inplace 报 CODE-CHANGED 属误报，已人工确认）
- [x] `.github/workflows/revalidate-challenge-readme.yml` — 68 行 · `common-shared` · ✅ 已翻译注释（改动 2 行；校验 CODE-CHANGED(误报,已确认)；run: | 块内 shell 注释，check_inplace 报 CODE-CHANGED 属误报，已人工确认）
- [x] `.gitignore.example` — 26 行 · `common-shared` · ✅ 已翻译注释（改动 3 行；校验 OK；yarn/eslint/IDE/cli 分组标签保留英文）
- [x] `LICENCE.txt` — 21 行 · `common-shared` · ✅ 无需改动（MIT 许可证法律文本，按规范不翻译）
- [x] `README.md` — 468 行 · `dice-readme` · ✅ 已生成 `README_zh.md`（/home/user/se-2-challenges/.worktrees/challenge-dice-game/README_zh.md，468 行（与原文一致）；check_md [OK]，9 条 WARN 已确认：L187 为代码块内注释翻译，其余 8 条为行内代码文件路径（不译））
- [x] `extension/.ai/CHALLENGE.yaml` — 504 行 · `dice-code` · ✅ 已翻译注释（改动 3 行（结构层 # CHECKPOINT 注释）；块标量内正文/代码未动）
- [x] `extension/.ai/CONCEPTS.yaml` — 86 行 · `dice-code` · ✅ 无需改动（无注释（全部为 YAML 值/块标量内容））
- [x] `extension/.ai/agents/progress-tracker-content.md` — 94 行 · `common-shared` · ✅ 已生成 `progress-tracker-content_zh.md`（extension/.ai/agents/progress-tracker-content_zh.md，94 行；check_md OK，WARN 0（均为标识符/路径，已确认））
- [x] `extension/.ai/instructions/skip-content.md` — 63 行 · `common-shared` · ✅ 已生成 `skip-content_zh.md`（extension/.ai/instructions/skip-content_zh.md，63 行；check_md OK，WARN 0（均为标识符/路径，已确认））
- [x] `extension/.ai/instructions/start-content.md` — 416 行 · `common-start` · ✅ 已生成 `start-content_zh.md`（/home/user/se-2-challenges/.worktrees/challenge-dice-game/extension/.ai/instructions/start-content_zh.md（416 行，check_md OK；WARN 47 条均为代码块内自然语言消息模板的翻译，已人工确认））
- [x] `extension/.claude/agents/progress-tracker.md` — 8 行 · `common-shared` · ✅ 已生成 `progress-tracker_zh.md`（extension/.claude/agents/progress-tracker_zh.md，8 行；check_md OK，WARN 2（均为标识符/路径，已确认））
- [x] `extension/.claude/settings.local.json.template.mjs` — 9 行 · `common-shared` · ✅ 无需改动（无注释（仅 JSON 模板字符串））
- [x] `extension/.claude/skills/skip/SKILL.md` — 10 行 · `common-shared` · ✅ 已生成 `SKILL_zh.md`（extension/.claude/skills/skip/SKILL_zh.md，10 行；check_md OK，WARN 0（均为标识符/路径，已确认））
- [x] `extension/.claude/skills/start/SKILL.md` — 10 行 · `common-shared` · ✅ 已生成 `SKILL_zh.md`（extension/.claude/skills/start/SKILL_zh.md，10 行；check_md OK，WARN 0（均为标识符/路径，已确认））
- [x] `extension/.cursor/agents/progress-tracker.md` — 6 行 · `common-shared` · ✅ 无需改动（MD 仅含 front matter 标识值(name/model)与 @ 引用路径，无可翻译文本，未生成 _zh.md）
- [x] `extension/.cursor/commands/skip.md` — 5 行 · `common-shared` · ✅ 已生成 `skip_zh.md`（extension/.cursor/commands/skip_zh.md，5 行；check_md OK，WARN 0（均为标识符/路径，已确认））
- [x] `extension/.cursor/commands/start.md` — 5 行 · `common-shared` · ✅ 已生成 `start_zh.md`（extension/.cursor/commands/start_zh.md，5 行；check_md OK，WARN 0（均为标识符/路径，已确认））
- [x] `extension/.vscode/settings.json` — 5 行 · `common-shared` · ✅ 无需改动（JSON 配置，无注释）
- [x] `extension/AGENTS.md.args.mjs` — 221 行 · `dice-code` · ✅ 已翻译注释（改动 1 行（L1 文件注释）；模板字符串内容按统一规则不译）
- [x] `extension/README.md.args.mjs` — 307 行 · `dice-code` · ✅ 无需改动（仅模板字符串内容，按统一规则不译）
- [x] `extension/packages/foundry/contracts/DiceGame.sol` — 68 行 · `dice-code` · ✅ 已翻译注释（改动 6 行（与 hardhat 版译法一致））
- [x] `extension/packages/foundry/contracts/IDiceGame.sol` — 13 行 · `dice-code` · ✅ 无需改动（仅 SPDX 行）
- [x] `extension/packages/foundry/contracts/IRiggedRoll.sol` — 14 行 · `dice-code` · ✅ 无需改动（仅 SPDX 行）
- [x] `extension/packages/foundry/contracts/RiggedRoll.sol` — 33 行 · `dice-code` · ✅ 已翻译注释（改动 7 行（与 hardhat 版译法一致））
- [x] `extension/packages/foundry/script/Deploy.s.sol.args.mjs` — 5 行 · `dice-code` · ✅ 无需改动（无注释）
- [x] `extension/packages/foundry/script/DeployDiceGame.s.sol` — 20 行 · `dice-code` · ✅ 已翻译注释（改动 2 行；被注释掉的代码保留原样）
- [x] `extension/packages/foundry/test/RiggedRoll.t.sol` — 163 行 · `dice-code` · ✅ 已翻译注释（改动 7 行）
- [x] `extension/packages/hardhat/contracts/DiceGame.sol` — 72 行 · `dice-code` · ✅ 已翻译注释（改动 6 行）
- [x] `extension/packages/hardhat/contracts/RiggedRoll.sol` — 34 行 · `dice-code` · ✅ 已翻译注释（改动 7 行）
- [x] `extension/packages/hardhat/deploy/00_deploy_diceGame.ts` — 30 行 · `dice-code` · ✅ 已翻译注释（改动 1 行）
- [x] `extension/packages/hardhat/deploy/01_deploy_riggedRoll.ts` — 29 行 · `dice-code` · ✅ 已翻译注释（改动 2 行；被注释掉的代码保留原样）
- [x] `extension/packages/hardhat/hardhat.config.ts.args.mjs` — 10 行 · `dice-code` · ✅ 无需改动（无注释）
- [x] `extension/packages/hardhat/test/RiggedRoll.ts` — 186 行 · `dice-code` · ✅ 无需改动（仅有被注释掉的代码（L3 import））
- [x] `extension/packages/nextjs/app/dice/_components/Amount.tsx` — 68 行 · `dice-code` · ✅ 已翻译注释（改动 1 行）
- [x] `extension/packages/nextjs/app/dice/_components/RollEvents.tsx` — 48 行 · `dice-code` · ✅ 无需改动（无注释）
- [x] `extension/packages/nextjs/app/dice/_components/WinnerEvents.tsx` — 65 行 · `dice-code` · ✅ 无需改动（无注释）
- [x] `extension/packages/nextjs/app/dice/_components/index.ts` — 3 行 · `dice-code` · ✅ 无需改动（无注释）
- [x] `extension/packages/nextjs/app/dice/page.tsx` — 192 行 · `dice-code` · ✅ 已翻译注释（改动 1 行；L152-169 被注释掉的 JSX 按钮代码保留原样）
- [x] `extension/packages/nextjs/app/layout.tsx.args.mjs` — 15 行 · `dice-code` · ✅ 无需改动（无注释）
- [x] `extension/packages/nextjs/app/page.tsx.args.mjs` — 52 行 · `dice-code` · ✅ 无需改动（无注释（模板字符串内为 JSX/UI 文案））
- [x] `extension/packages/nextjs/components/Header.tsx.args.mjs` — 12 行 · `dice-code` · ✅ 无需改动（无注释）
- [x] `extension/packages/nextjs/next.config.ts.args.mjs` — 5 行 · `common-shared` · ✅ 无需改动（无注释）
- [x] `extension/packages/nextjs/styles/globals.css.args.mjs` — 83 行 · `common-shared` · ✅ 已翻译注释（改动 4 行；校验 CODE-CHANGED(误报,已确认)；模板字符串内 CSS 注释，check_inplace 报 CODE-CHANGED 属误报，已人工确认）
- [x] `extension/packages/nextjs/utils/scaffold-eth/getMetadata.ts.args.mjs` — 2 行 · `common-shared` · ✅ 无需改动（无注释）

<details><summary>二进制文件 20 个（不处理）</summary>

- `extension/packages/nextjs/public/hero.png`
- `extension/packages/nextjs/public/rolls/0.webm`
- `extension/packages/nextjs/public/rolls/1.webm`
- `extension/packages/nextjs/public/rolls/2.webm`
- `extension/packages/nextjs/public/rolls/3.webm`
- `extension/packages/nextjs/public/rolls/4.webm`
- `extension/packages/nextjs/public/rolls/5.webm`
- `extension/packages/nextjs/public/rolls/6.webm`
- `extension/packages/nextjs/public/rolls/7.webm`
- `extension/packages/nextjs/public/rolls/8.webm`
- `extension/packages/nextjs/public/rolls/9.webm`
- `extension/packages/nextjs/public/rolls/A.webm`
- `extension/packages/nextjs/public/rolls/B.webm`
- `extension/packages/nextjs/public/rolls/C.webm`
- `extension/packages/nextjs/public/rolls/D.webm`
- `extension/packages/nextjs/public/rolls/E.webm`
- `extension/packages/nextjs/public/rolls/F.webm`
- `extension/packages/nextjs/public/rolls/Spin.webm`
- `extension/packages/nextjs/public/thumbnail-challenge.png`
- `extension/packages/nextjs/public/thumbnail.png`

</details>

### challenge-oracles

文本文件 123 个（已完成 21），二进制 3 个 → 目标分支 `challenge-oracles_zh`

- [x] `.cursorignore.example` — 4 行 · `common-shared` · ✅ 已翻译注释（改动 2 行；校验 OK）
- [x] `.github/Revalidation.md` — 75 行 · `common-shared` · ✅ 已生成 `Revalidation_zh.md`（.github/Revalidation_zh.md，75 行；check_md OK，WARN 1（均为标识符/路径，已确认））
- [x] `.github/workflows/grader-update-challenge.yml` — 84 行 · `common-shared` · ✅ 已翻译注释（改动 2 行；校验 CODE-CHANGED(误报,已确认)；run: | 块内 shell 注释，check_inplace 报 CODE-CHANGED 属误报，已人工确认）
- [x] `.github/workflows/revalidate-challenge-readme.yml` — 68 行 · `common-shared` · ✅ 已翻译注释（改动 2 行；校验 CODE-CHANGED(误报,已确认)；run: | 块内 shell 注释，check_inplace 报 CODE-CHANGED 属误报，已人工确认）
- [x] `.gitignore.example` — 26 行 · `common-shared` · ✅ 已翻译注释（改动 3 行；校验 OK；yarn/eslint/IDE/cli 分组标签保留英文）
- [x] `LICENCE.txt` — 21 行 · `common-shared` · ✅ 无需改动（MIT 许可证法律文本，按规范不翻译）
- [ ] `README.md` — 2230 行 · `orc-readme-p1, orc-readme-p2, orc-readme-p3, orc-readme-p4` · ⏳ 分段翻译进度 0/4
- [ ] `extension/.ai/CHALLENGE.yaml` — 1240 行 · `orc-sol`
- [x] `extension/.ai/agents/progress-tracker-content.md` — 94 行 · `common-shared` · ✅ 已生成 `progress-tracker-content_zh.md`（extension/.ai/agents/progress-tracker-content_zh.md，94 行；check_md OK，WARN 0（均为标识符/路径，已确认））
- [x] `extension/.ai/instructions/skip-content.md` — 63 行 · `common-shared` · ✅ 已生成 `skip-content_zh.md`（extension/.ai/instructions/skip-content_zh.md，63 行；check_md OK，WARN 0（均为标识符/路径，已确认））
- [x] `extension/.ai/instructions/start-content.md` — 416 行 · `common-start` · ✅ 已生成 `start-content_zh.md`（/home/user/se-2-challenges/.worktrees/challenge-oracles/extension/.ai/instructions/start-content_zh.md（416 行，check_md OK；WARN 47 条均为代码块内自然语言消息模板的翻译，已人工确认））
- [x] `extension/.claude/agents/progress-tracker.md` — 8 行 · `common-shared` · ✅ 已生成 `progress-tracker_zh.md`（extension/.claude/agents/progress-tracker_zh.md，8 行；check_md OK，WARN 2（均为标识符/路径，已确认））
- [x] `extension/.claude/settings.local.json.template.mjs` — 9 行 · `common-shared` · ✅ 无需改动（无注释（仅 JSON 模板字符串））
- [x] `extension/.claude/skills/skip/SKILL.md` — 10 行 · `common-shared` · ✅ 已生成 `SKILL_zh.md`（extension/.claude/skills/skip/SKILL_zh.md，10 行；check_md OK，WARN 0（均为标识符/路径，已确认））
- [x] `extension/.claude/skills/start/SKILL.md` — 10 行 · `common-shared` · ✅ 已生成 `SKILL_zh.md`（extension/.claude/skills/start/SKILL_zh.md，10 行；check_md OK，WARN 0（均为标识符/路径，已确认））
- [x] `extension/.cursor/agents/progress-tracker.md` — 6 行 · `common-shared` · ✅ 无需改动（MD 仅含 front matter 标识值(name/model)与 @ 引用路径，无可翻译文本，未生成 _zh.md）
- [x] `extension/.cursor/commands/skip.md` — 5 行 · `common-shared` · ✅ 已生成 `skip_zh.md`（extension/.cursor/commands/skip_zh.md，5 行；check_md OK，WARN 0（均为标识符/路径，已确认））
- [x] `extension/.cursor/commands/start.md` — 5 行 · `common-shared` · ✅ 已生成 `start_zh.md`（extension/.cursor/commands/start_zh.md，5 行；check_md OK，WARN 0（均为标识符/路径，已确认））
- [x] `extension/.vscode/settings.json` — 5 行 · `common-shared` · ✅ 无需改动（JSON 配置，无注释）
- [ ] `extension/AGENTS.md.args.mjs` — 551 行 · `orc-sol`
- [ ] `extension/README.md.args.mjs` — 2075 行 · `orc-sol`
- [ ] `extension/package.json` — 7 行 · `orc-sol`
- [ ] `extension/packages/foundry/contracts/00_Whitelist/IWhitelistOracle.sol` — 24 行 · `orc-sol`
- [ ] `extension/packages/foundry/contracts/00_Whitelist/SimpleOracle.sol` — 73 行 · `orc-sol`
- [ ] `extension/packages/foundry/contracts/00_Whitelist/WhitelistOracle.sol` — 89 行 · `orc-sol`
- [ ] `extension/packages/foundry/contracts/01_Staking/IStakingOracle.sol` — 60 行 · `orc-sol`
- [ ] `extension/packages/foundry/contracts/01_Staking/OracleToken.sol` — 65 行 · `orc-sol`
- [ ] `extension/packages/foundry/contracts/01_Staking/StakingOracle.sol` — 236 行 · `orc-sol`
- [ ] `extension/packages/foundry/contracts/02_Optimistic/Decider.sol` — 42 行 · `orc-sol`
- [ ] `extension/packages/foundry/contracts/02_Optimistic/IOptimisticOracle.sol` — 72 行 · `orc-sol`
- [ ] `extension/packages/foundry/contracts/02_Optimistic/OptimisticOracle.sol` — 211 行 · `orc-sol`
- [ ] `extension/packages/foundry/contracts/utils/StatisticsUtils.sol` — 54 行 · `orc-sol`
- [ ] `extension/packages/foundry/package.json` — 11 行 · `orc-ftest`
- [ ] `extension/packages/foundry/root.package.json` — 7 行 · `orc-ftest`
- [ ] `extension/packages/foundry/script/Deploy.s.sol.args.mjs` — 13 行 · `orc-ftest`
- [ ] `extension/packages/foundry/script/DeployOptimistic.s.sol` — 20 行 · `orc-ftest`
- [ ] `extension/packages/foundry/script/DeployStaking.s.sol` — 22 行 · `orc-ftest`
- [ ] `extension/packages/foundry/script/DeployWhitelist.s.sol` — 46 行 · `orc-ftest`
- [ ] `extension/packages/foundry/scripts-js/oracle-bot/config.json` — 56 行 · `orc-ftest`
- [x] `extension/packages/foundry/scripts-js/simulate/accounts.js` — 44 行 · `common-shared` · ✅ 已翻译注释（改动 2 行；校验 OK）
- [ ] `extension/packages/foundry/scripts-js/simulate/contractHelper.js` — 120 行 · `orc-ftest`
- [ ] `extension/packages/foundry/scripts-js/simulate/fetchPriceFromUniswap.js` — 116 行 · `orc-ftest`
- [ ] `extension/packages/foundry/scripts-js/simulate/runOptimisticBots.js` — 316 行 · `orc-ftest`
- [ ] `extension/packages/foundry/scripts-js/simulate/runStakingOracleBots.js` — 766 行 · `orc-ftest`
- [ ] `extension/packages/foundry/scripts-js/simulate/runWhitelistOracleBots.js` — 121 行 · `orc-ftest`
- [ ] `extension/packages/foundry/scripts-js/simulate/utils.js` — 93 行 · `orc-ftest`
- [ ] `extension/packages/foundry/test/OptimisticOracle.t.sol` — 582 行 · `orc-ftest`
- [ ] `extension/packages/foundry/test/StakingOracle.t.sol` — 832 行 · `orc-ftest`
- [ ] `extension/packages/foundry/test/WhitelistOracle.t.sol` — 224 行 · `orc-ftest`
- [ ] `extension/packages/hardhat/contracts/00_Whitelist/SimpleOracle.sol` — 73 行 · `orc-sol`
- [ ] `extension/packages/hardhat/contracts/00_Whitelist/WhitelistOracle.sol` — 89 行 · `orc-sol`
- [ ] `extension/packages/hardhat/contracts/01_Staking/OracleToken.sol` — 65 行 · `orc-sol`
- [ ] `extension/packages/hardhat/contracts/01_Staking/StakingOracle.sol` — 234 行 · `orc-sol`
- [ ] `extension/packages/hardhat/contracts/02_Optimistic/Decider.sol` — 42 行 · `orc-sol`
- [ ] `extension/packages/hardhat/contracts/02_Optimistic/OptimisticOracle.sol` — 211 行 · `orc-sol`
- [ ] `extension/packages/hardhat/contracts/utils/StatisticsUtils.sol` — 54 行 · `orc-sol`
- [ ] `extension/packages/hardhat/deploy/00_deploy_whitelist.ts` — 67 行 · `orc-htest`
- [ ] `extension/packages/hardhat/deploy/01_deploy_staking.ts` — 42 行 · `orc-htest`
- [ ] `extension/packages/hardhat/deploy/02_deploy_optimistic.ts` — 44 行 · `orc-htest`
- [ ] `extension/packages/hardhat/hardhat.config.ts.args.mjs` — 15 行 · `orc-htest`
- [ ] `extension/packages/hardhat/package.json` — 10 行 · `orc-htest`
- [ ] `extension/packages/hardhat/scripts/fetchPriceFromUniswap.ts` — 88 行 · `orc-htest`
- [ ] `extension/packages/hardhat/scripts/oracle-bot/config.json` — 56 行 · `orc-htest`
- [ ] `extension/packages/hardhat/scripts/oracle-bot/types.ts` — 19 行 · `orc-htest`
- [ ] `extension/packages/hardhat/scripts/runOptimisticBots.ts` — 310 行 · `orc-htest`
- [ ] `extension/packages/hardhat/scripts/runStakingOracleBots.ts` — 695 行 · `orc-htest`
- [ ] `extension/packages/hardhat/scripts/runWhitelistOracleBots.ts` — 134 行 · `orc-htest`
- [ ] `extension/packages/hardhat/scripts/utils.ts` — 106 行 · `orc-htest`
- [ ] `extension/packages/hardhat/test/OptimisticOracle.ts` — 669 行 · `orc-htest`
- [ ] `extension/packages/hardhat/test/StakingOracle.ts` — 574 行 · `orc-htest`
- [ ] `extension/packages/hardhat/test/WhitelistOracle.ts` — 236 行 · `orc-htest`
- [ ] `extension/packages/nextjs/app/api/config/price-variance/route.ts` — 58 行 · `orc-web`
- [ ] `extension/packages/nextjs/app/api/config/skip-probability/route.ts` — 58 行 · `orc-web`
- [ ] `extension/packages/nextjs/app/api/ora-faucet/route.ts` — 88 行 · `orc-web`
- [ ] `extension/packages/nextjs/app/layout.tsx.args.mjs` — 15 行 · `orc-web`
- [ ] `extension/packages/nextjs/app/optimistic/page.tsx` — 117 行 · `orc-web`
- [ ] `extension/packages/nextjs/app/page.tsx.args.mjs` — 41 行 · `orc-web`
- [ ] `extension/packages/nextjs/app/staking/page.tsx` — 42 行 · `orc-web`
- [ ] `extension/packages/nextjs/app/whitelist/page.tsx` — 26 行 · `orc-web`
- [ ] `extension/packages/nextjs/components/Header.tsx.args.mjs` — 18 行 · `orc-web`
- [ ] `extension/packages/nextjs/components/ScaffoldEthAppWithProviders.tsx.args.mjs` — 3 行 · `orc-web`
- [ ] `extension/packages/nextjs/components/TooltipInfo.tsx` — 33 行 · `orc-web`
- [ ] `extension/packages/nextjs/components/oracle/BucketCountdown.tsx` — 86 行 · `orc-web`
- [ ] `extension/packages/nextjs/components/oracle/BuyOraWidget.tsx` — 74 行 · `orc-web`
- [ ] `extension/packages/nextjs/components/oracle/ConfigSlider.tsx` — 84 行 · `orc-web`
- [ ] `extension/packages/nextjs/components/oracle/EditableCell.tsx` — 148 行 · `orc-web`
- [ ] `extension/packages/nextjs/components/oracle/HighlightedCell.tsx` — 41 行 · `orc-web`
- [ ] `extension/packages/nextjs/components/oracle/NodeRow.tsx` — 200 行 · `orc-web`
- [ ] `extension/packages/nextjs/components/oracle/NodesTable.tsx` — 665 行 · `orc-web`
- [ ] `extension/packages/nextjs/components/oracle/PriceWidget.tsx` — 103 行 · `orc-web`
- [ ] `extension/packages/nextjs/components/oracle/SelfNodeReporter.tsx` — 212 行 · `orc-web`
- [ ] `extension/packages/nextjs/components/oracle/SelfNodeRow.tsx` — 278 行 · `orc-web`
- [ ] `extension/packages/nextjs/components/oracle/StakingEditableCell.tsx` — 177 行 · `orc-web`
- [ ] `extension/packages/nextjs/components/oracle/TimeAgo.tsx` — 55 行 · `orc-web`
- [ ] `extension/packages/nextjs/components/oracle/TotalSlashedWidget.tsx` — 36 行 · `orc-web`
- [ ] `extension/packages/nextjs/components/oracle/optimistic/AssertedRow.tsx` — 50 行 · `orc-web`
- [ ] `extension/packages/nextjs/components/oracle/optimistic/AssertedTable.tsx` — 34 行 · `orc-web`
- [ ] `extension/packages/nextjs/components/oracle/optimistic/AssertionModal.tsx` — 260 行 · `orc-web`
- [ ] `extension/packages/nextjs/components/oracle/optimistic/DisputedRow.tsx` — 48 行 · `orc-web`
- [ ] `extension/packages/nextjs/components/oracle/optimistic/DisputedTable.tsx` — 33 行 · `orc-web`
- [ ] `extension/packages/nextjs/components/oracle/optimistic/EmptyRow.tsx` — 15 行 · `orc-web`
- [ ] `extension/packages/nextjs/components/oracle/optimistic/ExpiredRow.tsx` — 62 行 · `orc-web`
- [ ] `extension/packages/nextjs/components/oracle/optimistic/ExpiredTable.tsx` — 31 行 · `orc-web`
- [ ] `extension/packages/nextjs/components/oracle/optimistic/LoadingRow.tsx` — 21 行 · `orc-web`
- [ ] `extension/packages/nextjs/components/oracle/optimistic/ProposedRow.tsx` — 52 行 · `orc-web`
- [ ] `extension/packages/nextjs/components/oracle/optimistic/ProposedTable.tsx` — 32 行 · `orc-web`
- [ ] `extension/packages/nextjs/components/oracle/optimistic/SettledRow.tsx` — 75 行 · `orc-web`
- [ ] `extension/packages/nextjs/components/oracle/optimistic/SettledTable.tsx` — 32 行 · `orc-web`
- [ ] `extension/packages/nextjs/components/oracle/optimistic/SubmitAssertionButton.tsx` — 245 行 · `orc-web`
- [ ] `extension/packages/nextjs/components/oracle/optimistic/TimeLeft.tsx` — 62 行 · `orc-web`
- [ ] `extension/packages/nextjs/components/oracle/types.ts` — 69 行 · `orc-web`
- [ ] `extension/packages/nextjs/components/oracle/whitelist/AddOracleButton.tsx` — 40 行 · `orc-web`
- [ ] `extension/packages/nextjs/components/oracle/whitelist/WhitelistRow.tsx` — 67 行 · `orc-web`
- [ ] `extension/packages/nextjs/components/oracle/whitelist/WhitelistTable.tsx` — 110 行 · `orc-web`
- [ ] `extension/packages/nextjs/next.config.js.args.mjs` — 1 行 · `orc-web`
- [x] `extension/packages/nextjs/next.config.ts.args.mjs` — 5 行 · `common-shared` · ✅ 无需改动（无注释）
- [ ] `extension/packages/nextjs/services/store/challengeStore.ts` — 40 行 · `orc-web`
- [x] `extension/packages/nextjs/styles/globals.css.args.mjs` — 83 行 · `common-shared` · ✅ 已翻译注释（改动 4 行；校验 CODE-CHANGED(误报,已确认)；模板字符串内 CSS 注释，check_inplace 报 CODE-CHANGED 属误报，已人工确认）
- [ ] `extension/packages/nextjs/utils/configUpdater.ts` — 40 行 · `orc-web`
- [ ] `extension/packages/nextjs/utils/constants.ts` — 124 行 · `orc-web`
- [ ] `extension/packages/nextjs/utils/helpers.ts` — 36 行 · `orc-web`
- [ ] `extension/packages/nextjs/utils/scaffold-eth/getMetadata.ts.args.mjs` — 2 行 · `orc-web`
- [x] `funding.json` — 5 行 · `common-shared` · ✅ 无需改动（funding.json，JSON 无注释）

<details><summary>二进制文件 3 个（不处理）</summary>

- `extension/packages/nextjs/public/hero.png`
- `extension/packages/nextjs/public/social-card.png`
- `extension/packages/nextjs/public/thumbnail.png`

</details>

### challenge-over-collateralized-lending

文本文件 65 个（已完成 65），二进制 2 个 → 目标分支 `challenge-over-collateralized-lending_zh`

- [x] `.cursorignore.example` — 4 行 · `common-shared` · ✅ 已翻译注释（改动 2 行；校验 OK）
- [x] `.github/Revalidation.md` — 75 行 · `common-shared` · ✅ 已生成 `Revalidation_zh.md`（.github/Revalidation_zh.md，75 行；check_md OK，WARN 1（均为标识符/路径，已确认））
- [x] `.github/workflows/grader-update-challenge.yml` — 84 行 · `common-shared` · ✅ 已翻译注释（改动 2 行；校验 CODE-CHANGED(误报,已确认)；run: | 块内 shell 注释，check_inplace 报 CODE-CHANGED 属误报，已人工确认）
- [x] `.github/workflows/revalidate-challenge-readme.yml` — 68 行 · `common-shared` · ✅ 已翻译注释（改动 2 行；校验 CODE-CHANGED(误报,已确认)；run: | 块内 shell 注释，check_inplace 报 CODE-CHANGED 属误报，已人工确认）
- [x] `.gitignore.example` — 26 行 · `common-shared` · ✅ 已翻译注释（改动 3 行；校验 OK；yarn/eslint/IDE/cli 分组标签保留英文）
- [x] `LICENCE.txt` — 21 行 · `common-shared` · ✅ 无需改动（MIT 许可证法律文本，按规范不翻译）
- [x] `README.md` — 1088 行 · `lend-readme-p1, lend-readme-p2` · ✅ 已生成 `README_zh.md`（分段拼接，1088 行）
- [x] `extension/.ai/CHALLENGE.yaml` — 617 行 · `lend-web` · ✅ 已翻译注释（改动 4 行：结构层 # CHECKPOINT 1-4 注释（CHECKPOINT 标记保留英文）；块标量内的 Markdown 与代码注释属字符串，未改；check_inplace [OK]）
- [x] `extension/.ai/agents/progress-tracker-content.md` — 94 行 · `common-shared` · ✅ 已生成 `progress-tracker-content_zh.md`（extension/.ai/agents/progress-tracker-content_zh.md，94 行；check_md OK，WARN 0（均为标识符/路径，已确认））
- [x] `extension/.ai/instructions/skip-content.md` — 63 行 · `common-shared` · ✅ 已生成 `skip-content_zh.md`（extension/.ai/instructions/skip-content_zh.md，63 行；check_md OK，WARN 0（均为标识符/路径，已确认））
- [x] `extension/.ai/instructions/start-content.md` — 416 行 · `common-start` · ✅ 已生成 `start-content_zh.md`（/home/user/se-2-challenges/.worktrees/challenge-over-collateralized-lending/extension/.ai/instructions/start-content_zh.md（416 行，check_md OK；WARN 47 条均为代码块内自然语言消息模板的翻译，已人工确认））
- [x] `extension/.claude/agents/progress-tracker.md` — 8 行 · `common-shared` · ✅ 已生成 `progress-tracker_zh.md`（extension/.claude/agents/progress-tracker_zh.md，8 行；check_md OK，WARN 2（均为标识符/路径，已确认））
- [x] `extension/.claude/settings.local.json.template.mjs` — 9 行 · `common-shared` · ✅ 无需改动（无注释（仅 JSON 模板字符串））
- [x] `extension/.claude/skills/skip/SKILL.md` — 10 行 · `common-shared` · ✅ 已生成 `SKILL_zh.md`（extension/.claude/skills/skip/SKILL_zh.md，10 行；check_md OK，WARN 0（均为标识符/路径，已确认））
- [x] `extension/.claude/skills/start/SKILL.md` — 10 行 · `common-shared` · ✅ 已生成 `SKILL_zh.md`（extension/.claude/skills/start/SKILL_zh.md，10 行；check_md OK，WARN 0（均为标识符/路径，已确认））
- [x] `extension/.cursor/agents/progress-tracker.md` — 6 行 · `common-shared` · ✅ 无需改动（MD 仅含 front matter 标识值(name/model)与 @ 引用路径，无可翻译文本，未生成 _zh.md）
- [x] `extension/.cursor/commands/skip.md` — 5 行 · `common-shared` · ✅ 已生成 `skip_zh.md`（extension/.cursor/commands/skip_zh.md，5 行；check_md OK，WARN 0（均为标识符/路径，已确认））
- [x] `extension/.cursor/commands/start.md` — 5 行 · `common-shared` · ✅ 已生成 `start_zh.md`（extension/.cursor/commands/start_zh.md，5 行；check_md OK，WARN 0（均为标识符/路径，已确认））
- [x] `extension/.vscode/settings.json` — 5 行 · `common-shared` · ✅ 无需改动（JSON 配置，无注释）
- [x] `extension/AGENTS.md.args.mjs` — 268 行 · `lend-web` · ✅ 已翻译注释（改动 1 行：L1 文件头 // 注释；模板字符串正文未改；check_inplace [OK]）
- [x] `extension/README.md.args.mjs` — 916 行 · `lend-web` · ✅ 无需改动（仅模板字符串内容，按统一规则不译）
- [x] `extension/package.json` — 5 行 · `lend-web` · ✅ 无需改动（JSON，无注释）
- [x] `extension/packages/foundry/contracts/Corn.sol` — 25 行 · `lend-sol` · ✅ 无需改动（仅有 SPDX 注释，无需翻译）
- [x] `extension/packages/foundry/contracts/CornDEX.sol` — 176 行 · `lend-sol` · ✅ 已翻译注释（改动 25 行；与 hardhat 同名文件译文完全一致）
- [x] `extension/packages/foundry/contracts/ILending.sol` — 38 行 · `lend-sol` · ✅ 已翻译注释（改动 3 行（分节注释））
- [x] `extension/packages/foundry/contracts/Lending.sol` — 103 行 · `lend-sol` · ✅ 已翻译注释（改动 26 行；与 hardhat 同名文件译文完全一致）
- [x] `extension/packages/foundry/contracts/MovePrice.sol` — 30 行 · `lend-sol` · ✅ 已翻译注释（改动 2 行；与 hardhat 同名文件译文完全一致）
- [x] `extension/packages/foundry/package.json` — 9 行 · `lend-sol` · ✅ 无需改动（JSON，无注释）
- [x] `extension/packages/foundry/root.package.json` — 5 行 · `lend-sol` · ✅ 无需改动（JSON，无注释）
- [x] `extension/packages/foundry/script/Deploy.s.sol.args.mjs` — 5 行 · `lend-sol` · ✅ 无需改动（只有模板字符串代码，无注释）
- [x] `extension/packages/foundry/script/DeployLending.s.sol` — 42 行 · `lend-sol` · ✅ 已翻译注释（改动 5 行）
- [x] `extension/packages/foundry/scripts-js/simulate/accounts.js` — 44 行 · `common-shared` · ✅ 已翻译注释（改动 2 行；校验 OK）
- [x] `extension/packages/foundry/scripts-js/simulate/contractHelper.js` — 118 行 · `lend-sol` · ✅ 已翻译注释（改动 7 行）
- [x] `extension/packages/foundry/scripts-js/simulate/marketSimulator.js` — 371 行 · `lend-sol` · ✅ 已翻译注释（改动 18 行；与 hardhat marketSimulator.ts 用语保持一致）
- [x] `extension/packages/foundry/test/Lending.t.sol` — 334 行 · `lend-sol` · ✅ 已翻译注释（改动 11 行（分隔线 // ==== 保留））
- [x] `extension/packages/hardhat/contracts/Corn.sol` — 25 行 · `lend-sol` · ✅ 无需改动（仅有 SPDX 注释，无需翻译）
- [x] `extension/packages/hardhat/contracts/CornDEX.sol` — 176 行 · `lend-sol` · ✅ 已翻译注释（改动 25 行；与 foundry 同名文件逐字节相同）
- [x] `extension/packages/hardhat/contracts/Lending.sol` — 103 行 · `lend-sol` · ✅ 已翻译注释（改动 26 行；与 foundry 同名文件逐字节相同）
- [x] `extension/packages/hardhat/contracts/MovePrice.sol` — 30 行 · `lend-sol` · ✅ 已翻译注释（改动 2 行；与 foundry 同名文件逐字节相同）
- [x] `extension/packages/hardhat/deploy/00_deploy_contracts.ts` — 88 行 · `lend-sol` · ✅ 已翻译注释（改动 12 行）
- [x] `extension/packages/hardhat/package.json` — 5 行 · `lend-sol` · ✅ 无需改动（JSON，无注释）
- [x] `extension/packages/hardhat/scripts/marketSimulator.ts` — 324 行 · `lend-sol` · ✅ 已翻译注释（改动 24 行）
- [x] `extension/packages/hardhat/test/Lending.ts` — 241 行 · `lend-sol` · ✅ 已翻译注释（改动 8 行（eslint-disable 指令保留））
- [x] `extension/packages/nextjs/app/dashboard/_components/BorrowOperations.tsx` — 127 行 · `lend-web` · ✅ 无需改动（无注释）
- [x] `extension/packages/nextjs/app/dashboard/_components/CollateralGraph.tsx` — 172 行 · `lend-web` · ✅ 已翻译注释（改动 1 行（L125）；check_inplace [OK]）
- [x] `extension/packages/nextjs/app/dashboard/_components/CollateralOperations.tsx` — 87 行 · `lend-web` · ✅ 无需改动（无注释）
- [x] `extension/packages/nextjs/app/dashboard/_components/Modals/TokenSwapModal.tsx` — 186 行 · `lend-web` · ✅ 已翻译注释（改动 1 行（L109 JSX {/* */} 注释）；check_inplace [OK]）
- [x] `extension/packages/nextjs/app/dashboard/_components/Modals/TokenTransferModal.tsx` — 91 行 · `lend-web` · ✅ 已翻译注释（改动 1 行（L44 JSX {/* */} 注释）；check_inplace [OK]）
- [x] `extension/packages/nextjs/app/dashboard/_components/PriceActions.tsx` — 70 行 · `lend-web` · ✅ 已翻译注释（改动 2 行（L20 行尾注释、L34）；check_inplace [OK]）
- [x] `extension/packages/nextjs/app/dashboard/_components/RatioChange.tsx` — 58 行 · `lend-web` · ✅ 无需改动（无注释）
- [x] `extension/packages/nextjs/app/dashboard/_components/TokenActions.tsx` — 79 行 · `lend-web` · ✅ 无需改动（无注释）
- [x] `extension/packages/nextjs/app/dashboard/_components/TooltipInfo.tsx` — 21 行 · `common-shared` · ✅ 已翻译注释（改动 1 行；校验 OK）
- [x] `extension/packages/nextjs/app/dashboard/_components/UserPosition.tsx` — 104 行 · `lend-web` · ✅ 无需改动（无注释）
- [x] `extension/packages/nextjs/app/dashboard/_components/UserPositionsTable.tsx` — 98 行 · `lend-web` · ✅ 无需改动（无注释）
- [x] `extension/packages/nextjs/app/dashboard/page.tsx` — 37 行 · `lend-web` · ✅ 无需改动（无注释）
- [x] `extension/packages/nextjs/app/layout.tsx.args.mjs` — 15 行 · `lend-web` · ✅ 无需改动（无注释（只有模板字符串与配置值））
- [x] `extension/packages/nextjs/app/page.tsx.args.mjs` — 35 行 · `lend-web` · ✅ 无需改动（无注释（模板字符串内为 JSX 文案，不翻译））
- [x] `extension/packages/nextjs/components/Header.tsx.args.mjs` — 12 行 · `lend-web` · ✅ 无需改动（无注释）
- [x] `extension/packages/nextjs/hooks/scaffold-eth/useAnimationConfig.ts` — 20 行 · `lend-web` · ✅ 无需改动（无注释）
- [x] `extension/packages/nextjs/next.config.ts.args.mjs` — 5 行 · `common-shared` · ✅ 无需改动（无注释）
- [x] `extension/packages/nextjs/package.json` — 5 行 · `lend-web` · ✅ 无需改动（JSON，无注释）
- [x] `extension/packages/nextjs/styles/globals.css.args.mjs` — 83 行 · `common-shared` · ✅ 已翻译注释（改动 4 行；校验 CODE-CHANGED(误报,已确认)；模板字符串内 CSS 注释，check_inplace 报 CODE-CHANGED 属误报，已人工确认）
- [x] `extension/packages/nextjs/utils/constant.ts` — 3 行 · `lend-web` · ✅ 无需改动（无注释）
- [x] `extension/packages/nextjs/utils/helpers.ts` — 14 行 · `lend-web` · ✅ 已翻译注释（改动 2 行（L12、L13 行尾注释）；check_inplace [OK]）
- [x] `extension/packages/nextjs/utils/scaffold-eth/getMetadata.ts.args.mjs` — 2 行 · `common-shared` · ✅ 无需改动（无注释）

<details><summary>二进制文件 2 个（不处理）</summary>

- `extension/packages/nextjs/public/hero.png`
- `extension/packages/nextjs/public/thumbnail.png`

</details>

### challenge-prediction-markets

文本文件 66 个（已完成 20），二进制 12 个 → 目标分支 `challenge-prediction-markets_zh`

- [x] `.cursorignore.example` — 4 行 · `common-shared` · ✅ 已翻译注释（改动 2 行；校验 OK）
- [x] `.github/Revalidation.md` — 75 行 · `common-shared` · ✅ 已生成 `Revalidation_zh.md`（.github/Revalidation_zh.md，75 行；check_md OK，WARN 1（均为标识符/路径，已确认））
- [x] `.github/workflows/grader-update-challenge.yml` — 84 行 · `common-shared` · ✅ 已翻译注释（改动 2 行；校验 CODE-CHANGED(误报,已确认)；run: | 块内 shell 注释，check_inplace 报 CODE-CHANGED 属误报，已人工确认）
- [x] `.github/workflows/revalidate-challenge-readme.yml` — 68 行 · `common-shared` · ✅ 已翻译注释（改动 2 行；校验 CODE-CHANGED(误报,已确认)；run: | 块内 shell 注释，check_inplace 报 CODE-CHANGED 属误报，已人工确认）
- [x] `.gitignore.example` — 26 行 · `common-shared` · ✅ 已翻译注释（改动 3 行；校验 OK；yarn/eslint/IDE/cli 分组标签保留英文）
- [x] `LICENCE.txt` — 21 行 · `common-shared` · ✅ 无需改动（MIT 许可证法律文本，按规范不翻译）
- [ ] `README.md` — 1771 行 · `pm-readme-p1, pm-readme-p2, pm-readme-p3` · ⏳ 分段翻译进度 1/3
- [ ] `extension/.ai/CHALLENGE.yaml` — 919 行 · `pm-web`
- [x] `extension/.ai/agents/progress-tracker-content.md` — 94 行 · `common-shared` · ✅ 已生成 `progress-tracker-content_zh.md`（extension/.ai/agents/progress-tracker-content_zh.md，94 行；check_md OK，WARN 0（均为标识符/路径，已确认））
- [x] `extension/.ai/instructions/skip-content.md` — 63 行 · `common-shared` · ✅ 已生成 `skip-content_zh.md`（extension/.ai/instructions/skip-content_zh.md，63 行；check_md OK，WARN 0（均为标识符/路径，已确认））
- [x] `extension/.ai/instructions/start-content.md` — 416 行 · `common-start` · ✅ 已生成 `start-content_zh.md`（/home/user/se-2-challenges/.worktrees/challenge-prediction-markets/extension/.ai/instructions/start-content_zh.md（416 行，check_md OK；WARN 47 条均为代码块内自然语言消息模板的翻译，已人工确认））
- [x] `extension/.claude/agents/progress-tracker.md` — 8 行 · `common-shared` · ✅ 已生成 `progress-tracker_zh.md`（extension/.claude/agents/progress-tracker_zh.md，8 行；check_md OK，WARN 2（均为标识符/路径，已确认））
- [x] `extension/.claude/settings.local.json.template.mjs` — 9 行 · `common-shared` · ✅ 无需改动（无注释（仅 JSON 模板字符串））
- [x] `extension/.claude/skills/skip/SKILL.md` — 10 行 · `common-shared` · ✅ 已生成 `SKILL_zh.md`（extension/.claude/skills/skip/SKILL_zh.md，10 行；check_md OK，WARN 0（均为标识符/路径，已确认））
- [x] `extension/.claude/skills/start/SKILL.md` — 10 行 · `common-shared` · ✅ 已生成 `SKILL_zh.md`（extension/.claude/skills/start/SKILL_zh.md，10 行；check_md OK，WARN 0（均为标识符/路径，已确认））
- [x] `extension/.cursor/agents/progress-tracker.md` — 6 行 · `common-shared` · ✅ 无需改动（MD 仅含 front matter 标识值(name/model)与 @ 引用路径，无可翻译文本，未生成 _zh.md）
- [x] `extension/.cursor/commands/skip.md` — 5 行 · `common-shared` · ✅ 已生成 `skip_zh.md`（extension/.cursor/commands/skip_zh.md，5 行；check_md OK，WARN 0（均为标识符/路径，已确认））
- [x] `extension/.cursor/commands/start.md` — 5 行 · `common-shared` · ✅ 已生成 `start_zh.md`（extension/.cursor/commands/start_zh.md，5 行；check_md OK，WARN 0（均为标识符/路径，已确认））
- [x] `extension/.vscode/settings.json` — 5 行 · `common-shared` · ✅ 无需改动（JSON 配置，无注释）
- [ ] `extension/AGENTS.md.args.mjs` — 300 行 · `pm-web`
- [ ] `extension/README.md.args.mjs` — 1594 行 · `pm-web`
- [ ] `extension/packages/foundry/contracts/IPredictionMarket.sol` — 98 行 · `pm-sol`
- [ ] `extension/packages/foundry/contracts/PredictionMarket.sol` — 255 行 · `pm-sol`
- [ ] `extension/packages/foundry/contracts/PredictionMarketToken.sol` — 52 行 · `pm-sol`
- [ ] `extension/packages/foundry/foundry.toml.args.mjs` — 1 行 · `pm-sol`
- [ ] `extension/packages/foundry/script/Deploy.s.sol.args.mjs` — 5 行 · `pm-sol`
- [ ] `extension/packages/foundry/script/DeployPredictionMarket.s.sol` — 31 行 · `pm-sol`
- [ ] `extension/packages/foundry/test/PredictionMarket.t.sol` — 767 行 · `pm-sol`
- [ ] `extension/packages/hardhat/contracts/PredictionMarket.sol` — 255 行 · `pm-sol`
- [ ] `extension/packages/hardhat/contracts/PredictionMarketToken.sol` — 52 行 · `pm-sol`
- [ ] `extension/packages/hardhat/deploy/00_deploy_your_contract.ts` — 57 行 · `pm-sol`
- [ ] `extension/packages/hardhat/hardhat.config.ts.args.mjs` — 17 行 · `pm-sol`
- [ ] `extension/packages/hardhat/test/PredictionMarket.ts` — 1508 行 · `pm-test`
- [ ] `extension/packages/nextjs/app/layout.tsx.args.mjs` — 15 行 · `pm-web`
- [ ] `extension/packages/nextjs/app/liquidity-provider/page.tsx` — 72 行 · `pm-web`
- [ ] `extension/packages/nextjs/app/oracle/page.tsx` — 59 行 · `pm-web`
- [ ] `extension/packages/nextjs/app/page.tsx.args.mjs` — 39 行 · `pm-web`
- [ ] `extension/packages/nextjs/app/user/page.tsx` — 57 行 · `pm-web`
- [ ] `extension/packages/nextjs/components/Header.tsx.args.mjs` — 22 行 · `pm-web`
- [ ] `extension/packages/nextjs/components/assets/race-assets/background-dark.svg` — 184 行 · `pm-web`
- [ ] `extension/packages/nextjs/components/assets/race-assets/background.svg` — 120 行 · `pm-web`
- [ ] `extension/packages/nextjs/components/assets/race-assets/crown.svg` — 28 行 · `pm-web`
- [ ] `extension/packages/nextjs/components/assets/race-assets/green-car.svg` — 492 行 · `pm-web`
- [ ] `extension/packages/nextjs/components/assets/race-assets/red-car.svg` — 492 行 · `pm-web`
- [ ] `extension/packages/nextjs/components/constants.ts` — 16 行 · `pm-web`
- [ ] `extension/packages/nextjs/components/liquidity-provider/AddRemoveLiquidty.tsx` — 154 行 · `pm-web`
- [ ] `extension/packages/nextjs/components/liquidity-provider/LPAddress.tsx` — 38 行 · `pm-web`
- [ ] `extension/packages/nextjs/components/liquidity-provider/LPFinalTokenBalance.tsx` — 64 行 · `pm-web`
- [ ] `extension/packages/nextjs/components/liquidity-provider/PredictionMarketInfoLP.tsx` — 248 行 · `pm-web`
- [ ] `extension/packages/nextjs/components/liquidity-provider/ResolveMarketAndWithdraw.tsx` — 90 行 · `pm-web`
- [ ] `extension/packages/nextjs/components/oracle/OracleAddress.tsx` — 40 行 · `pm-web`
- [ ] `extension/packages/nextjs/components/oracle/ReportPrediction.tsx` — 79 行 · `pm-web`
- [ ] `extension/packages/nextjs/components/race/Car.tsx` — 49 行 · `pm-web`
- [ ] `extension/packages/nextjs/components/race/Race.tsx` — 296 行 · `pm-web`
- [ ] `extension/packages/nextjs/components/race/RaceEffects.tsx` — 78 行 · `pm-web`
- [ ] `extension/packages/nextjs/components/user/GiveAllowance.tsx` — 72 行 · `pm-web`
- [ ] `extension/packages/nextjs/components/user/OverviewBuySellShares.tsx` — 89 行 · `pm-web`
- [ ] `extension/packages/nextjs/components/user/PredictionBuySellShare.tsx` — 244 行 · `pm-web`
- [ ] `extension/packages/nextjs/components/user/PredictionMarketInfo.tsx` — 56 行 · `pm-web`
- [ ] `extension/packages/nextjs/components/user/ProbabilityDisplay.tsx` — 85 行 · `pm-web`
- [ ] `extension/packages/nextjs/components/user/Redeem.tsx` — 76 行 · `pm-web`
- [ ] `extension/packages/nextjs/components/user/TokenBalance.tsx` — 65 行 · `pm-web`
- [x] `extension/packages/nextjs/next.config.ts.args.mjs` — 5 行 · `common-shared` · ✅ 无需改动（无注释）
- [ ] `extension/packages/nextjs/services/store/raceStore.ts` — 59 行 · `pm-web`
- [x] `extension/packages/nextjs/styles/globals.css.args.mjs` — 83 行 · `common-shared` · ✅ 已翻译注释（改动 4 行；校验 CODE-CHANGED(误报,已确认)；模板字符串内 CSS 注释，check_inplace 报 CODE-CHANGED 属误报，已人工确认）
- [x] `extension/packages/nextjs/utils/scaffold-eth/getMetadata.ts.args.mjs` — 2 行 · `common-shared` · ✅ 无需改动（无注释）

<details><summary>二进制文件 12 个（不处理）</summary>

- `extension/packages/nextjs/public/hero-home.png`
- `extension/packages/nextjs/public/hero.png`
- `extension/packages/nextjs/public/lp1.png`
- `extension/packages/nextjs/public/lp2.png`
- `extension/packages/nextjs/public/lp3.png`
- `extension/packages/nextjs/public/oracle1.png`
- `extension/packages/nextjs/public/oracle2.png`
- `extension/packages/nextjs/public/priceTable.png`
- `extension/packages/nextjs/public/thumbnail.png`
- `extension/packages/nextjs/public/user1.png`
- `extension/packages/nextjs/public/user2.png`
- `extension/packages/nextjs/public/user3.png`

</details>

### challenge-stablecoins

文本文件 77 个（已完成 77），二进制 2 个 → 目标分支 `challenge-stablecoins_zh`

- [x] `.cursorignore.example` — 4 行 · `common-shared` · ✅ 已翻译注释（改动 2 行；校验 OK）
- [x] `.github/Revalidation.md` — 75 行 · `common-shared` · ✅ 已生成 `Revalidation_zh.md`（.github/Revalidation_zh.md，75 行；check_md OK，WARN 1（均为标识符/路径，已确认））
- [x] `.github/workflows/grader-update-challenge.yml` — 84 行 · `common-shared` · ✅ 已翻译注释（改动 2 行；校验 CODE-CHANGED(误报,已确认)；run: | 块内 shell 注释，check_inplace 报 CODE-CHANGED 属误报，已人工确认）
- [x] `.github/workflows/revalidate-challenge-readme.yml` — 68 行 · `common-shared` · ✅ 已翻译注释（改动 2 行；校验 CODE-CHANGED(误报,已确认)；run: | 块内 shell 注释，check_inplace 报 CODE-CHANGED 属误报，已人工确认）
- [x] `.gitignore.example` — 26 行 · `common-shared` · ✅ 已翻译注释（改动 3 行；校验 OK；yarn/eslint/IDE/cli 分组标签保留英文）
- [x] `LICENCE.txt` — 21 行 · `common-shared` · ✅ 无需改动（MIT 许可证法律文本，按规范不翻译）
- [x] `README.md` — 1215 行 · `stab-readme-p1, stab-readme-p2` · ✅ 已生成 `README_zh.md`（分段拼接，1215 行）
- [x] `extension/.ai/CHALLENGE.yaml` — 970 行 · `stab-web` · ✅ 已翻译注释（改动 5 行（结构层 # CHECKPOINT 1-5 注释，冒号后译）；纯分隔线保留；块标量内 Markdown 正文及 solution 代码里的 // 函数名注释属于 YAML 字符串值，未译）
- [x] `extension/.ai/agents/progress-tracker-content.md` — 94 行 · `common-shared` · ✅ 已生成 `progress-tracker-content_zh.md`（extension/.ai/agents/progress-tracker-content_zh.md，94 行；check_md OK，WARN 0（均为标识符/路径，已确认））
- [x] `extension/.ai/instructions/skip-content.md` — 63 行 · `common-shared` · ✅ 已生成 `skip-content_zh.md`（extension/.ai/instructions/skip-content_zh.md，63 行；check_md OK，WARN 0（均为标识符/路径，已确认））
- [x] `extension/.ai/instructions/start-content.md` — 416 行 · `common-start` · ✅ 已生成 `start-content_zh.md`（/home/user/se-2-challenges/.worktrees/challenge-stablecoins/extension/.ai/instructions/start-content_zh.md（416 行，check_md OK；WARN 47 条均为代码块内自然语言消息模板的翻译，已人工确认））
- [x] `extension/.claude/agents/progress-tracker.md` — 8 行 · `common-shared` · ✅ 已生成 `progress-tracker_zh.md`（extension/.claude/agents/progress-tracker_zh.md，8 行；check_md OK，WARN 2（均为标识符/路径，已确认））
- [x] `extension/.claude/settings.local.json.template.mjs` — 9 行 · `common-shared` · ✅ 无需改动（无注释（仅 JSON 模板字符串））
- [x] `extension/.claude/skills/skip/SKILL.md` — 10 行 · `common-shared` · ✅ 已生成 `SKILL_zh.md`（extension/.claude/skills/skip/SKILL_zh.md，10 行；check_md OK，WARN 0（均为标识符/路径，已确认））
- [x] `extension/.claude/skills/start/SKILL.md` — 10 行 · `common-shared` · ✅ 已生成 `SKILL_zh.md`（extension/.claude/skills/start/SKILL_zh.md，10 行；check_md OK，WARN 0（均为标识符/路径，已确认））
- [x] `extension/.cursor/agents/progress-tracker.md` — 6 行 · `common-shared` · ✅ 无需改动（MD 仅含 front matter 标识值(name/model)与 @ 引用路径，无可翻译文本，未生成 _zh.md）
- [x] `extension/.cursor/commands/skip.md` — 5 行 · `common-shared` · ✅ 已生成 `skip_zh.md`（extension/.cursor/commands/skip_zh.md，5 行；check_md OK，WARN 0（均为标识符/路径，已确认））
- [x] `extension/.cursor/commands/start.md` — 5 行 · `common-shared` · ✅ 已生成 `start_zh.md`（extension/.cursor/commands/start_zh.md，5 行；check_md OK，WARN 0（均为标识符/路径，已确认））
- [x] `extension/.vscode/settings.json` — 5 行 · `common-shared` · ✅ 无需改动（JSON 配置，无注释）
- [x] `extension/AGENTS.md.args.mjs` — 379 行 · `stab-web` · ✅ 已翻译注释（改动 1 行（L1 JS 注释）；模板字符串中的 AGENTS.md 正文按要求视为字符串未译）
- [x] `extension/README.md.args.mjs` — 1138 行 · `stab-web` · ✅ 无需改动（模板字符串外无 JS 注释；README 正文（含 L648-718 Solidity 代码块内的 // 注释）属于模板字符串，按要求未译）
- [x] `extension/package.json` — 6 行 · `stab-web` · ✅ 无需改动（JSON，无注释）
- [x] `extension/packages/foundry/contracts/DEX.sol` — 177 行 · `stab-sol` · ✅ 已翻译注释（改动 25 行；与 hardhat 同名文件译文一致）
- [x] `extension/packages/foundry/contracts/IMyUSDEngine.sol` — 47 行 · `stab-sol` · ✅ 已翻译注释（改动 4 行）
- [x] `extension/packages/foundry/contracts/MyUSD.sol` — 81 行 · `stab-sol` · ✅ 已翻译注释（改动 7 行；与 hardhat 同名文件译文一致）
- [x] `extension/packages/foundry/contracts/MyUSDEngine.sol` — 133 行 · `stab-sol` · ✅ 已翻译注释（改动 12 行；与 hardhat 同名文件译文一致）
- [x] `extension/packages/foundry/contracts/MyUSDStaking.sol` — 163 行 · `stab-sol` · ✅ 已翻译注释（改动 18 行；与 hardhat 同名文件译文一致）
- [x] `extension/packages/foundry/contracts/Oracle.sol` — 32 行 · `stab-sol` · ✅ 已翻译注释（改动 4 行；与 hardhat 同名文件译文一致）
- [x] `extension/packages/foundry/contracts/RateController.sol` — 35 行 · `stab-sol` · ✅ 已翻译注释（改动 4 行；与 hardhat 版译文一致（两版仅 import/error 声明不同））
- [x] `extension/packages/foundry/package.json` — 12 行 · `stab-sol` · ✅ 无需改动（JSON 文件，无注释）
- [x] `extension/packages/foundry/root.package.json` — 6 行 · `stab-sol` · ✅ 无需改动（JSON 文件，无注释）
- [x] `extension/packages/foundry/script/Deploy.s.sol.args.mjs` — 5 行 · `stab-sol` · ✅ 无需改动（无注释（仅模板字符串代码））
- [x] `extension/packages/foundry/script/DeployMyUSD.s.sol` — 79 行 · `stab-sol` · ✅ 已翻译注释（改动 17 行；SPDX 行保留）
- [x] `extension/packages/foundry/scripts-js/simulate/accounts.js` — 55 行 · `stab-test` · ✅ 已翻译注释（改动 3 行）
- [x] `extension/packages/foundry/scripts-js/simulate/contractHelper.js` — 114 行 · `stab-test` · ✅ 已翻译注释（改动 7 行）
- [x] `extension/packages/foundry/scripts-js/simulate/interestRateController.js` — 284 行 · `stab-test` · ✅ 已翻译注释（改动 15 行；纯数字注释（// 2%、// 30%）保留）
- [x] `extension/packages/foundry/scripts-js/simulate/marketSimulator.js` — 623 行 · `stab-test` · ✅ 已翻译注释（改动 22 行）
- [x] `extension/packages/foundry/test/MyUSDEngine.t.sol` — 657 行 · `stab-test` · ✅ 已翻译注释（改动 31 行；SPDX、分隔线、算式注释（2000 * 1000 = ...）保留）
- [x] `extension/packages/hardhat/contracts/DEX.sol` — 177 行 · `stab-sol` · ✅ 已翻译注释（改动 25 行；与 foundry 同名文件逐字节一致）
- [x] `extension/packages/hardhat/contracts/MyUSD.sol` — 81 行 · `stab-sol` · ✅ 已翻译注释（改动 7 行；与 foundry 同名文件逐字节一致）
- [x] `extension/packages/hardhat/contracts/MyUSDEngine.sol` — 133 行 · `stab-sol` · ✅ 已翻译注释（改动 12 行；与 foundry 同名文件逐字节一致）
- [x] `extension/packages/hardhat/contracts/MyUSDStaking.sol` — 163 行 · `stab-sol` · ✅ 已翻译注释（改动 18 行；与 foundry 同名文件逐字节一致）
- [x] `extension/packages/hardhat/contracts/Oracle.sol` — 32 行 · `stab-sol` · ✅ 已翻译注释（改动 4 行；与 foundry 同名文件逐字节一致）
- [x] `extension/packages/hardhat/contracts/RateController.sol` — 36 行 · `stab-sol` · ✅ 已翻译注释（改动 4 行）
- [x] `extension/packages/hardhat/deploy/00_deploy_contracts.ts` — 153 行 · `stab-sol` · ✅ 已翻译注释（改动 25 行）
- [x] `extension/packages/hardhat/package.json` — 11 行 · `stab-sol` · ✅ 无需改动（JSON 文件，无注释）
- [x] `extension/packages/hardhat/scripts/deployments.ts` — 15 行 · `stab-test` · ✅ 已翻译注释（改动 2 行）
- [x] `extension/packages/hardhat/scripts/fetchPriceFromUniswap.ts` — 86 行 · `stab-test` · ✅ 已翻译注释（改动 2 行）
- [x] `extension/packages/hardhat/scripts/interestRateController.ts` — 291 行 · `stab-test` · ✅ 已翻译注释（改动 26 行；与 foundry 版同句译法一致）
- [x] `extension/packages/hardhat/scripts/marketSimulator.ts` — 790 行 · `stab-test` · ✅ 已翻译注释（改动 108 行；eslint-disable 指令保留）
- [x] `extension/packages/hardhat/test/MyUSDEngine.ts` — 658 行 · `stab-test` · ✅ 已翻译注释（改动 67 行；eslint-disable 指令保留，it()/describe() 字符串未动）
- [x] `extension/packages/nextjs/app/_components/CollateralOperations.tsx` — 87 行 · `stab-web` · ✅ 无需改动（无注释）
- [x] `extension/packages/nextjs/app/_components/MintOperations.tsx` — 152 行 · `stab-web` · ✅ 无需改动（无注释）
- [x] `extension/packages/nextjs/app/_components/Modals/TokenSwapModal.tsx` — 181 行 · `stab-web` · ✅ 已翻译注释（改动 1 行（L110 JSX {/* */} 注释））
- [x] `extension/packages/nextjs/app/_components/Modals/TokenTransferModal.tsx` — 95 行 · `stab-web` · ✅ 已翻译注释（改动 1 行（L45 JSX {/* */} 注释））
- [x] `extension/packages/nextjs/app/_components/PriceGraph.tsx` — 187 行 · `stab-web` · ✅ 无需改动（无注释）
- [x] `extension/packages/nextjs/app/_components/RateControls.tsx` — 163 行 · `stab-web` · ✅ 无需改动（无注释）
- [x] `extension/packages/nextjs/app/_components/RatioChange.tsx` — 58 行 · `stab-web` · ✅ 无需改动（无注释）
- [x] `extension/packages/nextjs/app/_components/SideButtons.tsx` — 127 行 · `stab-web` · ✅ 已翻译注释（改动 2 行（L105、L114 JSX {/* */} 注释））
- [x] `extension/packages/nextjs/app/_components/StakeOperations.tsx` — 98 行 · `stab-web` · ✅ 无需改动（无注释）
- [x] `extension/packages/nextjs/app/_components/StakersTable.tsx` — 90 行 · `stab-web` · ✅ 无需改动（无注释）
- [x] `extension/packages/nextjs/app/_components/SupplyGraph.tsx` — 245 行 · `stab-web` · ✅ 无需改动（无注释）
- [x] `extension/packages/nextjs/app/_components/TokenActions.tsx` — 87 行 · `stab-web` · ✅ 无需改动（无注释）
- [x] `extension/packages/nextjs/app/_components/TooltipInfo.tsx` — 21 行 · `common-shared` · ✅ 已翻译注释（改动 1 行；校验 OK）
- [x] `extension/packages/nextjs/app/_components/UserPosition.tsx` — 124 行 · `stab-web` · ✅ 无需改动（无注释）
- [x] `extension/packages/nextjs/app/_components/UserPositionsTable.tsx` — 99 行 · `stab-web` · ✅ 已翻译注释（改动 1 行（L76 行尾 // 注释））
- [x] `extension/packages/nextjs/app/dashboard/page.tsx` — 41 行 · `stab-web` · ✅ 无需改动（无注释）
- [x] `extension/packages/nextjs/app/layout.tsx.args.mjs` — 14 行 · `stab-web` · ✅ 无需改动（无注释）
- [x] `extension/packages/nextjs/app/page.tsx.args.mjs` — 35 行 · `stab-web` · ✅ 无需改动（无注释（模板字符串内为 JSX/UI 文案，不译））
- [x] `extension/packages/nextjs/components/Header.tsx.args.mjs` — 13 行 · `stab-web` · ✅ 无需改动（无注释）
- [x] `extension/packages/nextjs/hooks/scaffold-eth/useAnimationConfig.ts` — 19 行 · `stab-web` · ✅ 无需改动（无注释）
- [x] `extension/packages/nextjs/next.config.ts.args.mjs` — 5 行 · `common-shared` · ✅ 无需改动（无注释）
- [x] `extension/packages/nextjs/package.json` — 5 行 · `stab-web` · ✅ 无需改动（JSON，无注释）
- [x] `extension/packages/nextjs/styles/globals.css.args.mjs` — 83 行 · `common-shared` · ✅ 已翻译注释（改动 4 行；校验 CODE-CHANGED(误报,已确认)；模板字符串内 CSS 注释，check_inplace 报 CODE-CHANGED 属误报，已人工确认）
- [x] `extension/packages/nextjs/utils/constant.ts` — 2 行 · `stab-web` · ✅ 无需改动（无注释）
- [x] `extension/packages/nextjs/utils/helpers.ts` — 24 行 · `stab-web` · ✅ 已翻译注释（改动 2 行（L12、L13 行尾 // 注释））
- [x] `extension/packages/nextjs/utils/scaffold-eth/getMetadata.ts.args.mjs` — 2 行 · `common-shared` · ✅ 无需改动（无注释）

<details><summary>二进制文件 2 个（不处理）</summary>

- `extension/packages/nextjs/public/hero.png`
- `extension/packages/nextjs/public/thumbnail.png`

</details>

### challenge-token-vendor

文本文件 43 个（已完成 43），二进制 3 个 → 目标分支 `challenge-token-vendor_zh`

- [x] `.cursorignore.example` — 4 行 · `common-shared` · ✅ 已翻译注释（改动 2 行；校验 OK）
- [x] `.github/Revalidation.md` — 75 行 · `common-shared` · ✅ 已生成 `Revalidation_zh.md`（.github/Revalidation_zh.md，75 行；check_md OK，WARN 1（均为标识符/路径，已确认））
- [x] `.github/workflows/grader-update-challenge.yml` — 84 行 · `common-shared` · ✅ 已翻译注释（改动 2 行；校验 CODE-CHANGED(误报,已确认)；run: | 块内 shell 注释，check_inplace 报 CODE-CHANGED 属误报，已人工确认）
- [x] `.github/workflows/revalidate-challenge-readme.yml` — 68 行 · `common-shared` · ✅ 已翻译注释（改动 2 行；校验 CODE-CHANGED(误报,已确认)；run: | 块内 shell 注释，check_inplace 报 CODE-CHANGED 属误报，已人工确认）
- [x] `.gitignore.example` — 26 行 · `common-shared` · ✅ 已翻译注释（改动 3 行；校验 OK；yarn/eslint/IDE/cli 分组标签保留英文）
- [x] `LICENCE.txt` — 21 行 · `common-shared` · ✅ 无需改动（MIT 许可证法律文本，按规范不翻译）
- [x] `README.md` — 682 行 · `vendor-readme` · ✅ 已生成 `README_zh.md`（/home/user/se-2-challenges/.worktrees/challenge-token-vendor/README_zh.md，682 行（与原文一致）；check_md [OK]，8 条 WARN 均为纯行内代码/文件路径行（L103/110/132/213/220/276/280/402），按规范保留原样）
- [x] `extension/.ai/CHALLENGE.yaml` — 661 行 · `vendor-code` · ✅ 已翻译注释（改动6行：顶部说明注释2行+4个 CHECKPOINT 分隔注释；块标量内的 Markdown 标题未动）
- [x] `extension/.ai/CONCEPTS.yaml` — 93 行 · `vendor-code` · ✅ 无需改动（无任何 # 注释，全部为 YAML 值/块标量字符串）
- [x] `extension/.ai/agents/progress-tracker-content.md` — 94 行 · `common-shared` · ✅ 已生成 `progress-tracker-content_zh.md`（extension/.ai/agents/progress-tracker-content_zh.md，94 行；check_md OK，WARN 0（均为标识符/路径，已确认））
- [x] `extension/.ai/instructions/skip-content.md` — 63 行 · `common-shared` · ✅ 已生成 `skip-content_zh.md`（extension/.ai/instructions/skip-content_zh.md，63 行；check_md OK，WARN 0（均为标识符/路径，已确认））
- [x] `extension/.ai/instructions/start-content.md` — 416 行 · `common-start` · ✅ 已生成 `start-content_zh.md`（/home/user/se-2-challenges/.worktrees/challenge-token-vendor/extension/.ai/instructions/start-content_zh.md（416 行，check_md OK；WARN 47 条均为代码块内自然语言消息模板的翻译，已人工确认））
- [x] `extension/.claude/agents/progress-tracker.md` — 8 行 · `common-shared` · ✅ 已生成 `progress-tracker_zh.md`（extension/.claude/agents/progress-tracker_zh.md，8 行；check_md OK，WARN 2（均为标识符/路径，已确认））
- [x] `extension/.claude/settings.local.json.template.mjs` — 9 行 · `common-shared` · ✅ 无需改动（无注释（仅 JSON 模板字符串））
- [x] `extension/.claude/skills/skip/SKILL.md` — 10 行 · `common-shared` · ✅ 已生成 `SKILL_zh.md`（extension/.claude/skills/skip/SKILL_zh.md，10 行；check_md OK，WARN 0（均为标识符/路径，已确认））
- [x] `extension/.claude/skills/start/SKILL.md` — 10 行 · `common-shared` · ✅ 已生成 `SKILL_zh.md`（extension/.claude/skills/start/SKILL_zh.md，10 行；check_md OK，WARN 0（均为标识符/路径，已确认））
- [x] `extension/.cursor/agents/progress-tracker.md` — 6 行 · `common-shared` · ✅ 无需改动（MD 仅含 front matter 标识值(name/model)与 @ 引用路径，无可翻译文本，未生成 _zh.md）
- [x] `extension/.cursor/commands/skip.md` — 5 行 · `common-shared` · ✅ 已生成 `skip_zh.md`（extension/.cursor/commands/skip_zh.md，5 行；check_md OK，WARN 0（均为标识符/路径，已确认））
- [x] `extension/.cursor/commands/start.md` — 5 行 · `common-shared` · ✅ 已生成 `start_zh.md`（extension/.cursor/commands/start_zh.md，5 行；check_md OK，WARN 0（均为标识符/路径，已确认））
- [x] `extension/.vscode/settings.json` — 5 行 · `common-shared` · ✅ 无需改动（JSON 配置，无注释）
- [x] `extension/AGENTS.md.args.mjs` — 248 行 · `vendor-code` · ✅ 已翻译注释（改动1行：首行 JS 注释；模板字符串正文（含 bash 代码块里的 # 行）属 AGENTS.md 字符串内容，按要求不翻译）
- [x] `extension/README.md.args.mjs` — 499 行 · `vendor-code` · ✅ 无需改动（模板字符串外无注释；内嵌代码块中无注释，正文为字符串不翻译）
- [x] `extension/packages/foundry/contracts/IVendor.sol` — 19 行 · `vendor-code` · ✅ 无需改动（仅 SPDX 许可证标识）
- [x] `extension/packages/foundry/contracts/Vendor.sol` — 49 行 · `vendor-code` · ✅ 已翻译注释（改动8行（与 hardhat 版译法一致；分节标题补齐尾部斜杠以保持中文宽度对齐））
- [x] `extension/packages/foundry/contracts/YourToken.sol` — 12 行 · `vendor-code` · ✅ 已翻译注释（改动2行（与 hardhat 版一致））
- [x] `extension/packages/foundry/script/Deploy.s.sol.args.mjs` — 5 行 · `vendor-code` · ✅ 无需改动（无注释，仅模板字符串代码）
- [x] `extension/packages/foundry/script/DeployYourToken.s.sol` — 46 行 · `vendor-code` · ✅ 已翻译注释（改动10行（与 hardhat 01_deploy_vendor.ts 对应注释译法一致））
- [x] `extension/packages/foundry/test/Vendor.t.sol` — 206 行 · `vendor-code` · ✅ 已翻译注释（改动12行；Checkpoint 2/3 标题只含标识符，保留原样）
- [x] `extension/packages/hardhat/contracts/Vendor.sol` — 49 行 · `vendor-code` · ✅ 已翻译注释（改动8行（与 foundry 版一致））
- [x] `extension/packages/hardhat/contracts/YourToken.sol` — 12 行 · `vendor-code` · ✅ 已翻译注释（改动2行（与 foundry 版一致））
- [x] `extension/packages/hardhat/deploy/00_deploy_your_token.ts` — 28 行 · `vendor-code` · ✅ 已翻译注释（改动9行）
- [x] `extension/packages/hardhat/deploy/01_deploy_vendor.ts` — 74 行 · `vendor-code` · ✅ 已翻译注释（改动20行）
- [x] `extension/packages/hardhat/hardhat.config.ts.args.mjs` — 24 行 · `common-shared` · ✅ 无需改动（仅有一条纯 URL 注释，按规范保留）
- [x] `extension/packages/hardhat/test/Vendor.ts` — 246 行 · `vendor-code` · ✅ 已翻译注释（改动16行；yarn test 命令注释行保留原样）
- [x] `extension/packages/nextjs/app/events/page.tsx` — 116 行 · `vendor-code` · ✅ 已翻译注释（改动4行；被注释掉的 JSX/代码保留原样）
- [x] `extension/packages/nextjs/app/layout.tsx.args.mjs` — 15 行 · `vendor-code` · ✅ 无需改动（无注释）
- [x] `extension/packages/nextjs/app/page.tsx.args.mjs` — 40 行 · `vendor-code` · ✅ 无需改动（无注释，模板字符串为 JSX/UI 文案）
- [x] `extension/packages/nextjs/app/token-vendor/page.tsx` — 189 行 · `vendor-code` · ✅ 已翻译注释（改动3行；被注释掉的 JSX/代码保留原样）
- [x] `extension/packages/nextjs/components/Header.tsx.args.mjs` — 17 行 · `vendor-code` · ✅ 无需改动（无注释）
- [x] `extension/packages/nextjs/next.config.ts.args.mjs` — 5 行 · `common-shared` · ✅ 无需改动（无注释）
- [x] `extension/packages/nextjs/styles/globals.css.args.mjs` — 83 行 · `common-shared` · ✅ 已翻译注释（改动 4 行；校验 CODE-CHANGED(误报,已确认)；模板字符串内 CSS 注释，check_inplace 报 CODE-CHANGED 属误报，已人工确认）
- [x] `extension/packages/nextjs/utils/scaffold-eth/getMetadata.ts.args.mjs` — 2 行 · `common-shared` · ✅ 无需改动（无注释）
- [x] `extension/packages/nextjs/utils/scaffold-eth/priceInWei.ts` — 16 行 · `vendor-code` · ✅ 已翻译注释（改动1行）

<details><summary>二进制文件 3 个（不处理）</summary>

- `extension/packages/nextjs/public/hero.png`
- `extension/packages/nextjs/public/thumbnail-challenge.png`
- `extension/packages/nextjs/public/thumbnail.png`

</details>

### challenge-tokenization

文本文件 48 个（已完成 48），二进制 5 个 → 目标分支 `challenge-tokenization_zh`

- [x] `.cursorignore.example` — 4 行 · `common-shared` · ✅ 已翻译注释（改动 2 行；校验 OK）
- [x] `.github/Revalidation.md` — 75 行 · `common-shared` · ✅ 已生成 `Revalidation_zh.md`（.github/Revalidation_zh.md，75 行；check_md OK，WARN 1（均为标识符/路径，已确认））
- [x] `.github/workflows/grader-update-challenge.yml` — 84 行 · `common-shared` · ✅ 已翻译注释（改动 2 行；校验 CODE-CHANGED(误报,已确认)；run: | 块内 shell 注释，check_inplace 报 CODE-CHANGED 属误报，已人工确认）
- [x] `.github/workflows/revalidate-challenge-readme.yml` — 68 行 · `common-shared` · ✅ 已翻译注释（改动 2 行；校验 CODE-CHANGED(误报,已确认)；run: | 块内 shell 注释，check_inplace 报 CODE-CHANGED 属误报，已人工确认）
- [x] `.gitignore.example` — 26 行 · `common-shared` · ✅ 已翻译注释（改动 3 行；校验 OK；yarn/eslint/IDE/cli 分组标签保留英文）
- [x] `LICENCE.txt` — 21 行 · `common-shared` · ✅ 无需改动（MIT 许可证法律文本，按规范不翻译）
- [x] `README.md` — 366 行 · `nft-readme` · ✅ 已生成 `README_zh.md`（/home/user/se-2-challenges/.worktrees/challenge-tokenization/README_zh.md，366 行，check_md [OK] WARN 0；第 137、157 行裸 URL 改为 <http://localhost:3000> 自动链接，避免 GFM 把紧随的中文句号吞进链接）
- [x] `extension/.ai/CHALLENGE.yaml` — 420 行 · `nft-code` · ✅ 已翻译注释（改动 6 行：仅翻译结构层 checkpoint 分隔注释（# 1.~# 6.）；setup.template 块标量里的 Solidity TODO[...] 注释及各块标量 Markdown 正文按规范视为字符串未译）
- [x] `extension/.ai/CONCEPTS.yaml` — 119 行 · `nft-code` · ✅ 无需改动（无结构层 # 注释，全部内容为字符串/块标量）
- [x] `extension/.ai/agents/progress-tracker-content.md` — 94 行 · `common-shared` · ✅ 已生成 `progress-tracker-content_zh.md`（extension/.ai/agents/progress-tracker-content_zh.md，94 行；check_md OK，WARN 0（均为标识符/路径，已确认））
- [x] `extension/.ai/instructions/skip-content.md` — 63 行 · `common-shared` · ✅ 已生成 `skip-content_zh.md`（extension/.ai/instructions/skip-content_zh.md，63 行；check_md OK，WARN 0（均为标识符/路径，已确认））
- [x] `extension/.ai/instructions/start-content.md` — 416 行 · `common-start` · ✅ 已生成 `start-content_zh.md`（/home/user/se-2-challenges/.worktrees/challenge-tokenization/extension/.ai/instructions/start-content_zh.md（416 行，check_md OK；WARN 47 条均为代码块内自然语言消息模板的翻译，已人工确认））
- [x] `extension/.claude/agents/progress-tracker.md` — 8 行 · `common-shared` · ✅ 已生成 `progress-tracker_zh.md`（extension/.claude/agents/progress-tracker_zh.md，8 行；check_md OK，WARN 2（均为标识符/路径，已确认））
- [x] `extension/.claude/settings.local.json.template.mjs` — 9 行 · `common-shared` · ✅ 无需改动（无注释（仅 JSON 模板字符串））
- [x] `extension/.claude/skills/skip/SKILL.md` — 10 行 · `common-shared` · ✅ 已生成 `SKILL_zh.md`（extension/.claude/skills/skip/SKILL_zh.md，10 行；check_md OK，WARN 0（均为标识符/路径，已确认））
- [x] `extension/.claude/skills/start/SKILL.md` — 10 行 · `common-shared` · ✅ 已生成 `SKILL_zh.md`（extension/.claude/skills/start/SKILL_zh.md，10 行；check_md OK，WARN 0（均为标识符/路径，已确认））
- [x] `extension/.cursor/agents/progress-tracker.md` — 6 行 · `common-shared` · ✅ 无需改动（MD 仅含 front matter 标识值(name/model)与 @ 引用路径，无可翻译文本，未生成 _zh.md）
- [x] `extension/.cursor/commands/skip.md` — 5 行 · `common-shared` · ✅ 已生成 `skip_zh.md`（extension/.cursor/commands/skip_zh.md，5 行；check_md OK，WARN 0（均为标识符/路径，已确认））
- [x] `extension/.cursor/commands/start.md` — 5 行 · `common-shared` · ✅ 已生成 `start_zh.md`（extension/.cursor/commands/start_zh.md，5 行；check_md OK，WARN 0（均为标识符/路径，已确认））
- [x] `extension/.vscode/settings.json` — 5 行 · `common-shared` · ✅ 无需改动（JSON 配置，无注释）
- [x] `extension/AGENTS.md.args.mjs` — 181 行 · `nft-code` · ✅ 已翻译注释（改动 1 行（L1 JS 注释）；模板字符串中的 Markdown 正文未译）
- [x] `extension/README.md.args.mjs` — 286 行 · `nft-code` · ✅ 无需改动（无 JS 注释；模板字符串为 Markdown 正文，其中 sh 代码块无注释）
- [x] `extension/packages/foundry/contracts/YourCollectible.sol` — 49 行 · `nft-code` · ✅ 已翻译注释（改动 1 行（L26）；与 hardhat 同名文件译文完全一致；SPDX 保留）
- [x] `extension/packages/foundry/script/Deploy.s.sol.args.mjs` — 5 行 · `nft-code` · ✅ 无需改动（无注释）
- [x] `extension/packages/foundry/script/DeployYourCollectible.s.sol` — 12 行 · `nft-code` · ✅ 无需改动（仅 SPDX 许可标识（保留原样））
- [x] `extension/packages/foundry/test/YourCollectible.t.sol` — 55 行 · `nft-code` · ✅ 无需改动（仅 SPDX 许可标识（保留原样））
- [x] `extension/packages/hardhat/contracts/YourCollectible.sol` — 49 行 · `nft-code` · ✅ 已翻译注释（改动 1 行（L26）；与 foundry 同名文件译文完全一致；SPDX 保留）
- [x] `extension/packages/hardhat/deploy/01_deploy_your_collectible.ts` — 28 行 · `nft-code` · ✅ 已翻译注释（改动 9 行（JSDoc 7 行 + tags 注释 2 行））
- [x] `extension/packages/hardhat/test/YourCollectible.ts` — 63 行 · `nft-code` · ✅ 已翻译注释（改动 2 行（L2、L22））
- [x] `extension/packages/nextjs/app/api/ipfs/add/route.ts` — 15 行 · `nft-code` · ✅ 无需改动（无注释）
- [x] `extension/packages/nextjs/app/api/ipfs/get-metadata/route.ts` — 13 行 · `nft-code` · ✅ 无需改动（无注释）
- [x] `extension/packages/nextjs/app/ipfsDownload/page.tsx` — 82 行 · `nft-code` · ✅ 无需改动（无注释）
- [x] `extension/packages/nextjs/app/ipfsUpload/page.tsx` — 81 行 · `nft-code` · ✅ 无需改动（无注释）
- [x] `extension/packages/nextjs/app/layout.tsx.args.mjs` — 15 行 · `nft-code` · ✅ 无需改动（无注释）
- [x] `extension/packages/nextjs/app/myNFTs/_components/MyHoldings.tsx` — 104 行 · `nft-code` · ✅ 已翻译注释（改动 1 行（L52）；L79 eslint-disable 指令保留）
- [x] `extension/packages/nextjs/app/myNFTs/_components/NFTCard.tsx` — 67 行 · `nft-code` · ✅ 无需改动（仅 JSX eslint-disable 指令注释（保留原样））
- [x] `extension/packages/nextjs/app/myNFTs/_components/index.ts` — 1 行 · `nft-code` · ✅ 无需改动（无注释）
- [x] `extension/packages/nextjs/app/myNFTs/page.tsx` — 84 行 · `nft-code` · ✅ 已翻译注释（改动 2 行（L26、L45））
- [x] `extension/packages/nextjs/app/page.tsx.args.mjs` — 38 行 · `nft-code` · ✅ 无需改动（无注释（模板字符串为 JSX/UI 文案））
- [x] `extension/packages/nextjs/app/transfers/page.tsx` — 69 行 · `nft-code` · ✅ 无需改动（无注释）
- [x] `extension/packages/nextjs/components/Header.tsx.args.mjs` — 29 行 · `nft-code` · ✅ 已翻译注释（改动 2 行（L1、L4），保留 CHALLENGE-TODO: 标记）
- [x] `extension/packages/nextjs/next.config.ts.args.mjs` — 5 行 · `common-shared` · ✅ 无需改动（无注释）
- [x] `extension/packages/nextjs/package.json` — 5 行 · `nft-code` · ✅ 无需改动（JSON 无注释）
- [x] `extension/packages/nextjs/styles/globals.css.args.mjs` — 83 行 · `common-shared` · ✅ 已翻译注释（改动 4 行；校验 CODE-CHANGED(误报,已确认)；模板字符串内 CSS 注释，check_inplace 报 CODE-CHANGED 属误报，已人工确认）
- [x] `extension/packages/nextjs/utils/scaffold-eth/getMetadata.ts.args.mjs` — 2 行 · `common-shared` · ✅ 无需改动（无注释）
- [x] `extension/packages/nextjs/utils/tokenization/ipfs-fetch.ts` — 18 行 · `nft-code` · ✅ 已翻译注释（改动 1 行（L9））
- [x] `extension/packages/nextjs/utils/tokenization/ipfs.ts` — 31 行 · `nft-code` · ✅ 已翻译注释（改动 3 行（L1、L13、L25））
- [x] `extension/packages/nextjs/utils/tokenization/nftsMetadata.ts` — 126 行 · `nft-code` · ✅ 已翻译注释（改动 6 行（6 处相同的行尾注释））

<details><summary>二进制文件 5 个（不处理）</summary>

- `extension/packages/nextjs/public/hero.png`
- `extension/packages/nextjs/public/import-nft.png`
- `extension/packages/nextjs/public/nfts.png`
- `extension/packages/nextjs/public/thumbnail-challenge.png`
- `extension/packages/nextjs/public/thumbnail.png`

</details>

### challenge-zk-voting

文本文件 61 个（已完成 20），二进制 11 个 → 目标分支 `challenge-zk-voting_zh`

- [x] `.cursorignore.example` — 4 行 · `common-shared` · ✅ 已翻译注释（改动 2 行；校验 OK）
- [x] `.github/Revalidation.md` — 75 行 · `common-shared` · ✅ 已生成 `Revalidation_zh.md`（.github/Revalidation_zh.md，75 行；check_md OK，WARN 1（均为标识符/路径，已确认））
- [x] `.github/workflows/grader-update-challenge.yml` — 84 行 · `common-shared` · ✅ 已翻译注释（改动 2 行；校验 CODE-CHANGED(误报,已确认)；run: | 块内 shell 注释，check_inplace 报 CODE-CHANGED 属误报，已人工确认）
- [x] `.github/workflows/revalidate-challenge-readme.yml` — 68 行 · `common-shared` · ✅ 已翻译注释（改动 2 行；校验 CODE-CHANGED(误报,已确认)；run: | 块内 shell 注释，check_inplace 报 CODE-CHANGED 属误报，已人工确认）
- [x] `.gitignore.example` — 26 行 · `common-shared` · ✅ 已翻译注释（改动 3 行；校验 OK；yarn/eslint/IDE/cli 分组标签保留英文）
- [x] `LICENCE.txt` — 21 行 · `common-shared` · ✅ 无需改动（MIT 许可证法律文本，按规范不翻译）
- [ ] `README.md` — 2095 行 · `zk-readme-p1, zk-readme-p2, zk-readme-p3, zk-readme-p4` · ⏳ 分段翻译进度 0/4
- [ ] `extension/.ai/CHALLENGE.yaml` — 1363 行 · `zk-sol`
- [x] `extension/.ai/agents/progress-tracker-content.md` — 94 行 · `common-shared` · ✅ 已生成 `progress-tracker-content_zh.md`（extension/.ai/agents/progress-tracker-content_zh.md，94 行；check_md OK，WARN 0（均为标识符/路径，已确认））
- [x] `extension/.ai/instructions/skip-content.md` — 63 行 · `common-shared` · ✅ 已生成 `skip-content_zh.md`（extension/.ai/instructions/skip-content_zh.md，63 行；check_md OK，WARN 0（均为标识符/路径，已确认））
- [x] `extension/.ai/instructions/start-content.md` — 416 行 · `common-start` · ✅ 已生成 `start-content_zh.md`（/home/user/se-2-challenges/.worktrees/challenge-zk-voting/extension/.ai/instructions/start-content_zh.md（416 行，check_md OK；WARN 47 条均为代码块内自然语言消息模板的翻译，已人工确认））
- [x] `extension/.claude/agents/progress-tracker.md` — 8 行 · `common-shared` · ✅ 已生成 `progress-tracker_zh.md`（extension/.claude/agents/progress-tracker_zh.md，8 行；check_md OK，WARN 2（均为标识符/路径，已确认））
- [x] `extension/.claude/settings.local.json.template.mjs` — 9 行 · `common-shared` · ✅ 无需改动（无注释（仅 JSON 模板字符串））
- [x] `extension/.claude/skills/skip/SKILL.md` — 10 行 · `common-shared` · ✅ 已生成 `SKILL_zh.md`（extension/.claude/skills/skip/SKILL_zh.md，10 行；check_md OK，WARN 0（均为标识符/路径，已确认））
- [x] `extension/.claude/skills/start/SKILL.md` — 10 行 · `common-shared` · ✅ 已生成 `SKILL_zh.md`（extension/.claude/skills/start/SKILL_zh.md，10 行；check_md OK，WARN 0（均为标识符/路径，已确认））
- [x] `extension/.cursor/agents/progress-tracker.md` — 6 行 · `common-shared` · ✅ 无需改动（MD 仅含 front matter 标识值(name/model)与 @ 引用路径，无可翻译文本，未生成 _zh.md）
- [x] `extension/.cursor/commands/skip.md` — 5 行 · `common-shared` · ✅ 已生成 `skip_zh.md`（extension/.cursor/commands/skip_zh.md，5 行；check_md OK，WARN 0（均为标识符/路径，已确认））
- [x] `extension/.cursor/commands/start.md` — 5 行 · `common-shared` · ✅ 已生成 `start_zh.md`（extension/.cursor/commands/start_zh.md，5 行；check_md OK，WARN 0（均为标识符/路径，已确认））
- [x] `extension/.vscode/settings.json` — 5 行 · `common-shared` · ✅ 无需改动（JSON 配置，无注释）
- [ ] `extension/AGENTS.md.args.mjs` — 407 行 · `zk-sol`
- [ ] `extension/README.md.args.mjs` — 1970 行 · `zk-sol`
- [ ] `extension/packages/circuits/Nargo.toml` — 7 行 · `zk-sol`
- [ ] `extension/packages/circuits/src/main.nr` — 25 行 · `zk-sol`
- [ ] `extension/packages/foundry/contracts/IVoting.sol` — 42 行 · `zk-sol`
- [ ] `extension/packages/foundry/contracts/Verifier.sol` — 6 行 · `zk-sol`
- [ ] `extension/packages/foundry/contracts/Voting.sol` — 137 行 · `zk-sol`
- [ ] `extension/packages/foundry/contracts/mocks/VerifierMock.sol` — 51 行 · `zk-sol`
- [ ] `extension/packages/foundry/package.json` — 10 行 · `zk-sol`
- [ ] `extension/packages/foundry/script/Deploy.s.sol.args.mjs` — 6 行 · `zk-sol`
- [ ] `extension/packages/foundry/script/DeployVoting.s.sol` — 30 行 · `zk-sol`
- [ ] `extension/packages/foundry/test/Voting.t.sol` — 267 行 · `zk-sol`
- [ ] `extension/packages/hardhat/contracts/Verifier.sol` — 6 行 · `zk-sol`
- [ ] `extension/packages/hardhat/contracts/Voting.sol` — 137 行 · `zk-sol`
- [ ] `extension/packages/hardhat/contracts/mocks/VerifierMock.sol` — 54 行 · `zk-sol`
- [ ] `extension/packages/hardhat/deploy/00_deploy_your_voting_contract.ts` — 68 行 · `zk-sol`
- [ ] `extension/packages/hardhat/hardhat.config.ts.args.mjs` — 22 行 · `zk-sol`
- [ ] `extension/packages/hardhat/package.json` — 5 行 · `zk-sol`
- [ ] `extension/packages/hardhat/test/Voting.ts` — 259 行 · `zk-sol`
- [ ] `extension/packages/nextjs/.env.example.args.mjs` — 5 行 · `zk-web`
- [ ] `extension/packages/nextjs/app/api/circuit/route.ts` — 24 行 · `zk-web`
- [ ] `extension/packages/nextjs/app/layout.tsx.args.mjs` — 15 行 · `zk-web`
- [ ] `extension/packages/nextjs/app/page.tsx.args.mjs` — 46 行 · `zk-web`
- [ ] `extension/packages/nextjs/app/voting/_challengeComponents/CreateCommitment.tsx` — 157 行 · `zk-web`
- [ ] `extension/packages/nextjs/app/voting/_challengeComponents/GenerateProof.tsx` — 193 行 · `zk-web`
- [ ] `extension/packages/nextjs/app/voting/_challengeComponents/VoteWithBurnerHardhat.tsx` — 210 行 · `zk-web`
- [ ] `extension/packages/nextjs/app/voting/_challengeComponents/VoteWithBurnerSepolia.tsx` — 316 行 · `zk-web`
- [ ] `extension/packages/nextjs/app/voting/_components/AddVotersModal.tsx` — 191 行 · `zk-web`
- [ ] `extension/packages/nextjs/app/voting/_components/ClearStorageButton.tsx` — 80 行 · `zk-web`
- [ ] `extension/packages/nextjs/app/voting/_components/LogStorageButton.tsx` — 99 行 · `zk-web`
- [ ] `extension/packages/nextjs/app/voting/_components/ShowVotersButton.tsx` — 176 行 · `zk-web`
- [ ] `extension/packages/nextjs/app/voting/_components/VoteChoice.tsx` — 28 行 · `zk-web`
- [ ] `extension/packages/nextjs/app/voting/_components/VotingStats.tsx` — 58 行 · `zk-web`
- [ ] `extension/packages/nextjs/app/voting/page.tsx` — 58 行 · `zk-web`
- [ ] `extension/packages/nextjs/components/Header.tsx.args.mjs` — 12 行 · `zk-web`
- [x] `extension/packages/nextjs/next.config.ts.args.mjs` — 5 行 · `common-shared` · ✅ 无需改动（无注释）
- [ ] `extension/packages/nextjs/package.json` — 9 行 · `zk-web`
- [ ] `extension/packages/nextjs/scaffold.config.ts.args.mjs` — 8 行 · `zk-web`
- [ ] `extension/packages/nextjs/services/store/challengeStore.ts` — 48 行 · `zk-web`
- [x] `extension/packages/nextjs/styles/globals.css.args.mjs` — 83 行 · `common-shared` · ✅ 已翻译注释（改动 4 行；校验 CODE-CHANGED(误报,已确认)；模板字符串内 CSS 注释，check_inplace 报 CODE-CHANGED 属误报，已人工确认）
- [ ] `extension/packages/nextjs/utils/proofStorage.ts` — 481 行 · `zk-web`
- [x] `extension/packages/nextjs/utils/scaffold-eth/getMetadata.ts.args.mjs` — 2 行 · `common-shared` · ✅ 无需改动（无注释）

<details><summary>二进制文件 11 个（不处理）</summary>

- `extension/packages/nextjs/public/generateproof-zk.png`
- `extension/packages/nextjs/public/home-zk.png`
- `extension/packages/nextjs/public/loglocalstorage-zk.png`
- `extension/packages/nextjs/public/overview-zk.png`
- `extension/packages/nextjs/public/proofgenerated-zk.png`
- `extension/packages/nextjs/public/readme-zk.png`
- `extension/packages/nextjs/public/registered-zk.png`
- `extension/packages/nextjs/public/sepoliavote-zk.png`
- `extension/packages/nextjs/public/thumbnail.png`
- `extension/packages/nextjs/public/voted-zk.png`
- `extension/packages/nextjs/public/votingstats-zk.png`

</details>
