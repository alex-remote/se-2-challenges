# GitHub Actions 配置

## README 重新验证工作流

本仓库包含一个 GitHub Action：每当挑战的 README 文件有更新时，它会自动让 speedrunethereum.com 对这些 README 进行重新验证（revalidate）。

### 工作原理

该工作流（`revalidate-challenge-readme.yml`）在以下情况下触发：

1. **推送事件**：在挑战分支上修改了 README 文件
2. **已合并的拉取请求**：修改了 README 文件且目标为挑战分支

**监听的文件：**

- `README.md`（根目录下的挑战说明）
- `extension/README.md.args.mjs`（模板文件）

**支持的分支：**

- 任何符合 `challenge-*` 模式的分支（例如 `challenge-tokenization`、`challenge-decentralized-staking`）

### 配置要求

要使用此工作流，你需要配置以下仓库密钥（secret）：

#### 必需的密钥

**`REVALIDATION_TOKEN`**

- 说明：speedrunethereum.com API 的认证令牌
- 用途：调用重新验证 API
- 配置方法：进入仓库的 Settings → Secrets and variables → Actions → Repository secrets

### 工作流如何提取挑战名称

工作流会自动从分支名中提取挑战名称：

- `challenge-tokenization` → `tokenization`
- `challenge-decentralized-staking` → `decentralized-staking`
- `challenge-dex` → `dex`

提取出的名称会用于构造重新验证 URL：

```
https://speedrunethereum.com/api/revalidate?token=${REVALIDATION_TOKEN}&path=/challenge/${challenge_name}
```

### 工作流特性

- ✅ **自动触发**：README 变更时自动运行
- ✅ **分支模式匹配**：仅针对挑战分支
- ✅ **智能提取挑战名称**：从分支名中自动提取
- ✅ **错误处理**：正确检查 HTTP 状态码
- ✅ **详细日志**：记录每次重新验证的尝试
- ✅ **GitHub Actions 摘要**：包含状态与详细信息
- ✅ **同时支持直接推送和已合并的 PR**

### 故障排查

如果工作流运行失败：

1. **检查密钥**：确认 `REVALIDATION_TOKEN` 已正确设置
2. **核对分支名**：确认你位于 `challenge-*` 分支上
3. **检查文件路径**：确认你修改的是 `README.md` 或 `extension/README.md.args.mjs`
4. **查看日志**：在 GitHub Actions 日志中查看详细的错误信息

### 测试工作流

你可以按以下步骤测试该工作流：

1. 在某个挑战分支上对 `README.md` 做一处小改动
2. 提交并推送该改动
3. 打开你的 GitHub 仓库中的 Actions 标签页
4. 查看工作流的运行记录和摘要，确认是成功还是失败
