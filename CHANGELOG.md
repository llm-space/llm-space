# Changelog

All notable changes to LLM Space are documented here. This project follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [4.1.0] - 2026-07-16

A maintenance release: no major new features, a handful of bug fixes, and three
new model/search providers.

### Added

- **VolcEngine Agent Plan** model provider, with its models available out of the
  box.
- **Brave Search** as a web-search provider, selectable in Settings → Search.
- A new model for the existing **Coding Plan** provider.

### Fixed

- Merging tabs correctly after a thread is overwritten.
- Renaming a thread no longer overwrites an existing thread with the same name.
- Deleting a prompt variable now asks for confirmation when the variable is
  referenced across multiple threads.
- Image content on assistant messages is ignored instead of causing errors.
- The active-tab ref is synced outside the render body, fixing a stale-reference
  edge case.
- Brave Search API errors are now surfaced to the user.
- Long skill descriptions no longer overflow their container.

## [4.0.1]

Baseline for this changelog. See the
[GitHub releases](https://github.com/deer-flow/llm-space/releases) for earlier
history.

[4.1.0]: https://github.com/deer-flow/llm-space/releases/tag/v4.1.0
[4.0.1]: https://github.com/deer-flow/llm-space/releases/tag/v4.0.1
