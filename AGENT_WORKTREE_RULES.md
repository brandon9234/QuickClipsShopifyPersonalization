# Agent Worktree Rules

## Ownership
- This worktree is currently operated through `Codex`.
- Do not assume a separate agent-specific worktree or parallel branch exists for the current repo state.

## Branch Rules
- The current working branch is `main`.
- Treat the existing local changes on `main` as active in-progress work and do not overwrite them blindly.
- If future work needs isolation, create a feature branch from the current state before making unrelated changes.

## Coordination Rules
- Never overwrite coordination files (`AGENT_WORKTREE_RULES.md`, `CODEX_AGENT_NOTES.md`) without first reading their current contents.
- Before major refactors, run `git diff` and inspect working tree state to understand current changes.
- Keep changes scoped and well-labeled in commit messages.
- If a merge conflict occurs, stop and summarize the conflict areas instead of guessing at a resolution.

## Handoff Notes
- Leave concise handoff notes in `CODEX_AGENT_NOTES.md` under the `Handoff Notes` section after significant work.
- Record what was done, what is in progress, and any blockers.
