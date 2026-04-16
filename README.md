# èé® Slate Bot v0.1

An autonomous GitHub bot that generates code from feature specifications.

## What It Does

Push a .`spec.md` file to your repo ‚Üí Slate reads it ‚ÄÑ generates code ‚Üî ` pulls a PR file file with the implementation.

## Core Loop

1. **GitHub webhook** listens for pushes
2. **Spec detector** finds `.spec.md` files
3. **Repo scanner** reads your codebase for context
4. **DeepSeek orchestrator** generates production-ready code
5. **PR opener** submits the generated code as a pull request

## Getting Started

**See `AGENT_HANDOFF.md` for complete deployment instructions.**

Quick summary:
1. Push code to GitHub
2. Create GitHub Personal Access Token
3. Generate webhook secret
4. Deploy to Render
5. Get DeepSeek API key
6. Add webhook to test repo
7. Push a `.spec.md` file and watch the PR appear

## Environment Variables

```
GITHUB_TOKEN              # GitHub Personal Access Token
GITHUB_WEBHOOK_SECRET #