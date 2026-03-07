# Claude Agent Notes

## Branch
`claude-parallel-preview` (created from `master` on 2026-03-07)

## Role
Claude is one of two autonomous coding agents working in parallel on this repository.
- Claude works in this worktree on `claude-parallel-preview`.
- Codex works in a separate worktree on its own branch.
- Neither agent modifies `main` directly. Both periodically sync from `main`.

## Safe Collaboration Checklist
- [ ] Confirm current branch is `claude-parallel-preview` before making changes
- [ ] Read coordination files before overwriting them
- [ ] Scope commits to this branch only
- [ ] Sync from `main` before starting significant work
- [ ] Check `git diff` and `git status` before any major refactor
- [ ] Leave a handoff note after completing significant work

---

## Coordination Rules
- This worktree is Claude-owned. Do not assume Codex's edits are present here.
- Do not merge or cherry-pick from Codex's branch without explicit user instruction.
- Do not push to `main` or force-push anything.
- Commit messages should clearly label scope (e.g., `feat(preview):`, `fix(theme):`).
- If a merge conflict occurs: stop, summarize the conflicting files and areas, and wait for user guidance.

---

## Before Editing
1. Run `git status` to confirm clean state or note outstanding changes.
2. Run `git branch --show-current` to confirm you are on `claude-parallel-preview`.
3. Read the file before editing it — never overwrite blindly.
4. For coordination files specifically, check contents before any update.

---

## Before Merging main
1. Run `git fetch origin` to get latest remote state.
2. Review `git log origin/main..HEAD` to understand divergence.
3. Run `git merge origin/main` (prefer merge over rebase for traceability).
4. If conflicts arise: stop and summarize — do not guess at resolution.
5. After merge, verify the app still works before committing.

---

## Handoff Notes
_Update this section after completing significant work so the next agent session can resume safely._

- **2026-03-07**: Branch `claude-parallel-preview` created from `master` (commit `f703355`).
  Coordination files (`AGENT_WORKTREE_RULES.md`, `CLAUDE_AGENT_NOTES.md`) created.
  No feature work started yet. Ready for task assignment.
