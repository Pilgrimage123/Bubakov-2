# Agent Instructions

## Agent skills

### Issue tracker

GitHub Issues via `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

Default canonical labels (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`). See `docs/agents/triage-labels.md`.

### Domain docs

Single-context layout (`GLOSSARY.md` + `docs/adr/` at repo root). See `docs/agents/domain.md`.

### Project export & bundle

Clean code bundle for performance analysis and audits. Excludes binaries, lockfiles, changelogs, dev modals, and generic unit tests, exporting to `Documents/cely_bubakov.txt` via `scripts/export-project-bundle.ps1`. See `docs/agents/project-bundle.md`.

### Asset management & public directory guardrails

Never store temporary raster images, concept art, or Google AI Studio prototyping outputs in `public/assets/` or `public/assets/aistudio/`. All in-game character and boss graphics must be authentic vector SVGs (Smart SVG components or Ladovské canvas procedural routines) or canonical icons in `public/images/`. Any prototype images from external tools must never be committed to `public/` or shipped with Vite builds.

