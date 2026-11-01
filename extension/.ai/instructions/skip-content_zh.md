# Speedrun Ethereum 挑战 - 跳过当前任务

通过自动应用参考答案，跳过当前的编码型 checkpoint。

## 步骤

### 第 1 步：读取进度
使用 **progress-tracker** 代理读取 `.challenge-ai/progress.json`。
- 找到 `currentCheckpoint` 的值
- 如果没有任何进度，告诉用户：“未找到进度。请先运行 `/start` 开始挑战！”

### 第 2 步：读取挑战配置
读取 `.ai/CHALLENGE.yaml`，并根据 ID 找到当前 checkpoint。

- 如果当前 checkpoint 没有 `task` 字段，告诉用户：
  “这个 checkpoint 没有可以跳过的编码任务。如果你在当前问题上需要帮助，请说 'hint'。”
- 如果有 `task` 字段，继续执行第 2b 步

### 第 2b 步：解析与框架相关的字段
CHALLENGE.yaml 中的 `file:` 和 `test:` 字段包含与框架相关的值（例如 `hardhat:` 和 `foundry:`）。通过检查哪个目录存在（`packages/hardhat/` 还是 `packages/foundry/`）来判断本项目使用的是哪个框架。在整个跳过流程中，所有 `file:` 和 `test:` 的查找都使用与之匹配的键。

### 第 3 步：展示参考答案
展示 `task.solution` 中的参考答案，并附上讲解：

```
No worries! Here's the solution for this checkpoint:

[Show task.solution code with syntax highlighting]

**Why this works:**
[Explain each key part of the solution, connecting it to the concepts
from the checkpoint's context field. This is still a learning moment!]
```


### 第 4 步：应用参考答案
读取当前的合约文件（`task.file`）并应用参考答案代码：
- 解析参考答案中的注释（例如 "// Add under State Variables:"）来确定代码的放置位置
- 将状态变量、事件、错误添加到合约中各自对应的区域
- 用参考答案代码填充空的函数体
- 注意把代码放到合约中正确的区域

### 第 5 步：运行测试
执行 `task.test` 命令（按检测到的框架解析，例如 Hardhat 使用 `yarn test --grep "Checkpoint1"`，Foundry 使用 `yarn test --match-test "Checkpoint1"`），以验证参考答案有效。
- 如果测试通过：继续执行第 6 步
- 如果测试失败：调试并修复（使用正确的参考答案时不应出现这种情况）

### 第 6 步：更新进度
使用 **progress-tracker** 代理：
```
Mark checkpoint "[checkpoint-id]" as completed with method "skipped". Set next checkpoint "[next-id]" to in_progress.
```

### 第 7 步：继续
- 如果还有剩余的 checkpoint，**一字不差（VERBATIM）**地展示下一个 checkpoint 的 context 内容（遵循 `start-content.md` 中的教学流程）
- 如果所有 checkpoint 都已完成，展示 CHALLENGE.yaml 中的 `completion_message`

## 重要事项

- **务必讲解参考答案** —— 跳过也应当是一次学习机会
- 在进度中**记录这一步是跳过的**（method: "skipped"），方便用户之后回顾
- 所有进度文件操作都**使用 progress-tracker 代理**
- 继续下一个 checkpoint 时，**阅读 `start-content.md`** 以了解完整的教学流程
