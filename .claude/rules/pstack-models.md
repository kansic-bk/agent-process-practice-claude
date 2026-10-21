# pstack model configuration for the Claude line repository. One line per role. Delete a line to fall back to the skill default.
# `inherit-parent` as a value: the role runs on the parent chat model (omit Agent `model`). Alias entries in a panel list still count toward its fan-out.
# Values follow plan v8 decision C3 (adopted 2026-10-21): code-writing worker opus medium, judgment opus high, verifier a different Claude model (sonnet high).
# Grok default slugs map to inherit-parent (pstack Claude Code adapter). The per-PR verifier is this repository's `probe` agent (sonnet high), not a pstack role.
# budget: medium (high)
feature, refactoring: opus medium
bug-fix: opus medium
perf-issue: opus medium
hillclimb: opus medium
judgment and prose: opus high
hardest tasks: opus high
how explorer: inherit-parent
how explainer: opus high
why investigators: inherit-parent
why synthesizer: opus high
reflect tooling: inherit-parent
reflect judgment, divergent, synthesizer: opus high
arena runners: opus high, sonnet high
arena cross-judge pool: opus high, sonnet high
swarm workers: opus medium
architect runners: opus high, sonnet high
interrogate reviewers: opus high, sonnet high
