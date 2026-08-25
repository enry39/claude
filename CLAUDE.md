# Claude Configuration — Prompt Master Setup

## 🎯 Purpose

This repository is configured with **prompt-master**, a Claude skill that generates optimized prompts for any AI tool. Use it to:
- Write sharper, more efficient prompts for Claude, ChatGPT, Cursor, Midjourney, etc.
- Fix underperforming prompts by extracting intent and refocusing
- Get prompts ready to paste — zero wasted tokens

## 🚀 Available Skills

### /prompt-master
Invoke the skill explicitly or naturally in conversation:

```
/prompt-master
Write me a prompt for Claude Code to build a REST API
```

Or just ask:
```
I need a prompt for Cursor to refactor my auth module
```

```
Fix this prompt for me: [paste your prompt]
```

```
Generate a Midjourney prompt for a cyberpunk night scene
```

## 📋 How It Works

1. **Detects the target tool** — routes to the right framework (Claude, ChatGPT, Cursor, Midjourney, Stable Diffusion, etc.)
2. **Extracts 9 dimensions of intent** — task, input, output, constraints, context, success criteria, examples
3. **Asks targeted clarifying questions** — max 3 questions if critical info is missing
4. **Applies proven techniques** — role assignment, few-shot examples, XML structure, grounding anchors
5. **Strips waste** — token efficiency audit to keep only load-bearing words
6. **Delivers production-ready prompt** — one copyable block with a one-line strategy

## ⚙️ Configuration

- **Location:** `.claude/skills/prompt-master/`
- **Activation:** Automatic when you ask to write, fix, improve, or adapt a prompt
- **Default:** Enabled globally for all Claude Code and Cowork sessions in this repo
- **No dependencies:** Works with any AI tool

## 📚 Reference Docs

See [`.claude/skills/prompt-master/README.md`](.claude/skills/prompt-master/README.md) for full documentation and examples.

---

## Project Structure

```
/
├── .claude/
│   └── skills/
│       └── prompt-master/          ← Prompt optimization skill
├── fitness-coach/                  ← Main project
└── CLAUDE.md                        ← This file
```

## 🎓 Quick Examples

### Before (vague):
```
Write me a prompt for Claude Code to build an app
```

### After (optimized):
```
I want to build a fitness tracking dashboard with React + Supabase. 
Users should be able to log workouts, see progress charts, and set goals. 
I need the prompt focused on component structure and authentication flow.
```

The skill will then generate:
```
[Optimized prompt ready to paste into Claude Code]

🎯 Target: Claude Code
💡 Extracted focus: UI components + auth flow → reduced scope, clearer success criteria
```

---

**Next steps:** Type `/prompt-master` to get started, or just ask naturally to improve your prompts!
