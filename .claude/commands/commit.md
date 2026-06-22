---
description: Stage, write a Conventional Commits message from the real diff, commit (runs the pre-commit hook), then offer to push.
disable-model-invocation: true
allowed-tools: Bash(git status:*), Bash(git diff:*), Bash(git add:*), Bash(git commit:*), Bash(git push:*), Bash(git log:*), Bash(git branch:*)
---

You are running the `/commit` workflow. Do **only** this — do not start or resume any other task. Follow these steps in order:

## 1. Inspect the working tree

Run `git status` and `git diff` (and `git diff --staged` for already-staged changes) to see exactly what changed, both staged and unstaged. Read the actual diff — the commit message must describe what really changed, not a guess.

## 2. Stop if there is nothing to commit

If there are no staged or unstaged changes, tell the user there is nothing to commit and **stop**. Do not create an empty commit.

## 3. Stage the relevant changes

- If the relevant changes are already staged, leave them as-is.
- If there are unstaged changes that clearly belong together as one logical unit, `git add` them.
- **If the changed files look unrelated to each other** (e.g. a feature change plus an unrelated config tweak plus a docs edit), do **not** `git add .` blindly. List the groups you see and ask the user which files to include in this commit — or whether to split into several commits. Respect their answer.

## 4. Write a Conventional Commits message from the real diff

Compose a commit message that follows Conventional Commits, choosing the type from what the diff actually does:

- `feat:` — a new feature or user-facing capability
- `fix:` — a bug fix
- `chore:` — tooling, config, deps, scaffolding (no src behavior change)
- `docs:` — documentation only
- `style:` — formatting/whitespace/Prettier-only, no logic change
- `refactor:` — internal restructuring with no behavior change
- `test:` — adding or adjusting tests

Rules:

- Subject line in the imperative mood, lower-case after the type, no trailing period, ≤ ~72 chars.
- Add a scope when it sharpens meaning (e.g. `feat(salary-calculator): ...`).
- Add a body (blank line, then bullets) when the change is non-trivial and the "why" isn't obvious from the subject.
- Base the message on the **real** diff. Never use a generic placeholder like "update files" or "various changes".
- This repo's product language is English — write the message in English.

## 5. Commit (the pre-commit hook will gate it)

Run `git commit` with your message.

A `PreToolUse` hook (`.claude/hooks/check-before-commit.js`) runs automatically on every `git commit`. It:

- runs `prettier --check .`, and on a mismatch **auto-fixes** with `prettier --write .`, re-stages the affected files, and lets the commit proceed;
- runs `tsc --noEmit` and `eslint . --max-warnings=0`, which **block** the commit (exit code 2) if there are type or lint errors.

If the commit is **blocked** by tsc/eslint, surface the hook's error output to the user, fix the reported errors (or ask the user how to proceed if the fix isn't obvious), and only then retry the commit. Do not try to bypass the hook (no `--no-verify`).

After a successful commit, run `git log --oneline -1` to confirm and show the user the commit that landed.

## 6. Ask before pushing

Do **not** push automatically. After a successful commit, ask the user whether they want to `git push`.

## 7. Push only if confirmed

If the user confirms, run `git push` (use `git push -u origin HEAD` if the current branch has no upstream) and report the result. If they decline, stop — the commit stays local, which is fine.

---

**Important:** This command exists so committing is an explicit, user-initiated action. Never run this workflow on your own initiative in the middle of another task — only when the user explicitly invokes `/commit`.
