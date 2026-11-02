---
description: 1-click git pull, status check, atomic commit, and push to origin/main
---

# 🔄 1-Click Git Synchronization Protocol (/git-sync)

Commit Message / Arguments: $ARGUMENTS

You are operating under the **Autonomous Git Sync Protocol**.
Your goal is to inspect repository state, pull upstream changes safely, stage all modifications, create an atomic semantic commit, and push to `origin/main` with zero merge conflicts.

---

## ⚡ 1. Synchronization Pipeline

Execute the following 5 steps sequentially:

### Step 1: Pre-Sync Status Check
```cmd
git status -s
```
Inspect all modified, untracked, and deleted files.

### Step 2: Safe Upstream Pull
```cmd
git pull --rebase origin main
```
Pull incoming commits from origin/main using rebase to maintain a clean linear commit history.

### Step 3: Atomic Stage
```cmd
git add -A
```
Stage all working tree modifications.

### Step 4: Semantic Commit
If `$ARGUMENTS` provides a commit message, use it. Otherwise, generate a clear, semantic commit message following Conventional Commits format (`feat:`, `fix:`, `refactor:`, `perf:`, `chore:`):
```cmd
git commit -m "<semantic-message>"
```

### Step 5: Push to Origin
```cmd
git push origin main
```
Push commits to `https://github.com/lokeshgamertumpala-sudo/claudecode.git` on branch `main`.

---

## 📋 2. Output Confirmation

Output a clean confirmation report containing:
- Commit SHA and message
- Total files modified / inserted / deleted
- Current branch tracking status (`origin/main`)
