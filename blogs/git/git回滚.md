---
title: git回滚
date: 2025/06/24
tags:
  - git
categories:
  - git
---

## 🧾 一、常见的 Git 回滚场景

### ✅ 1. **撤销本地未提交的修改（Working Directory）**

如果你只是修改了代码但还没有 `git add` 或 `commit`，可以使用以下方式恢复到上一次提交的状态。

#### 在 IDEA 中操作：

- 打开 **Version Control** 工具窗口（View → Tool Windows → Git）
- 切换到 **Local Changes** 标签
- 右键点击要撤销更改的文件 → **Revert**

或者：

- 打开某个修改过的文件 → 点击菜单栏的 **Git → Revert...**

---

### ✅ 2. **撤销已添加到暂存区（Staging Area）的内容**

如果你已经执行了 `git add`，但还没 `commit`，可以取消暂存。

#### 在 IDEA 中操作：

- 打开 **Local Changes** 窗口
- 在 **Unstaged Changes** 区域中找到你刚加进去的文件
- 右键选择 **Changelist → Move to Another Changelist → Default Changelist**（或者直接取消选中）

也可以右键选择 **Unstage** 来取消暂存。

---

### ✅ 3. **撤销最近一次 commit（但保留修改内容）**

如果你想撤销最近的一次提交，但仍保留代码改动（方便重新提交），可以使用：

```bash
git reset --soft HEAD~1
```

#### IDEA 操作：

- 打开 **Git → Show History**
- 找到你想回退到的那个 commit
- 右键 → **Reset Current Branch to Here**
- 选择 `Soft` 模式

---

### ✅ 4. **彻底删除某次提交（不保留任何修改）**

如果你想完全删除某次提交以及它的所有改动：

```bash
git reset --hard HEAD~1
```

⚠️ 警告：这个操作会**永久删除你的修改**！

#### IDEA 操作：

- 同样在 **History** 中右键 commit
- 选择 `Reset Current Branch to Here`
- 选择 `Hard` 模式

---

### ✅ 5. **回滚远程仓库的提交（慎用！）**

如果你已经 push 到远程仓库，并且想回滚，需要强制推送：

```bash
git reset --hard HEAD~1
git push -f origin main
```

⚠️ 注意：这会影响其他开发者，请务必确认后再操作！

---

## 🔁 总结表格

| 场景                   | 命令                                     | IDEA 操作               |
| ---------------------- | ---------------------------------------- | ----------------------- |
| 撤销未提交的修改       | -                                        | Local Changes → Revert  |
| 撤销已 add 的内容      | `git reset filename`                     | Local Changes → Unstage |
| 撤销 commit 保留修改   | `git reset --soft HEAD~1`                | History → Reset → Soft  |
| 撤销 commit 并删除修改 | `git reset --hard HEAD~1`                | History → Reset → Hard  |
| 推送到远程并回滚       | `git reset --hard HEAD~1 && git push -f` | 同上 + Push with Force  |

---
