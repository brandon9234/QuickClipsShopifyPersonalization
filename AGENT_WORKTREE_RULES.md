# Parallel Worktree Rules

## Ownership
- This worktree is owned by **Claude** (claude-parallel-preview branch).
- **Codex** is working in a separate worktree on a separate branch. Do not assume Codex's local edits exist here.

## Branch Rules
- Do not edit `main` directly.
- Commit only to `claude-parallel-preview` (or a feature branch off it).
- Periodically merge or rebase from `main` into this branch to stay current:
  ```
  git fetch origin && git merge origin/main
  ```

## Coordination Rules
- Never overwrite coordination files (`AGENT_WORKTREE_RULES.md`, `CLAUDE_AGENT_NOTES.md`) without first reading their current contents.
- Before major refactors, run `git diff` and inspect working tree state to understand current changes.
- Keep changes scoped and well-labeled in commit messages.
- If a merge conflict occurs, **stop and summarize conflict areas** — do not guess at resolution.

## Handoff Notes
- Leave concise handoff notes in `CLAUDE_AGENT_NOTES.md` under the "Handoff Notes" section after significant work.
- Record what was done, what is in progress, and any blockers.
