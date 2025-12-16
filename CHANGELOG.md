# Changelog

## 0.0.13

### Patch Changes

- 4b4c0ea: Fix ESC key handling in CLI commands - pressing ESC now exits gracefully without showing error messages or help text

## 0.0.12

### Patch Changes

- c022218: fix: Replace prompts.autocomplete with prompts.select in auth login command

  The `agent auth login` command was failing with `TypeError: prompts.autocomplete is not a function` because `@clack/prompts@0.11.0` does not have the `autocomplete` function (it was added in v1.0.0-alpha.0).

  This fix replaces `prompts.autocomplete()` with `prompts.select()` which is available in the stable version.

  Fixes #43

## 0.0.11

### Patch Changes

- e8e2d03: Fix system message override to use exclusively without additional context for low-limit models. When --system-message flag is provided, the system now returns only that message without adding environment info, custom instructions, or headers. This reduces token usage from ~9,059 to ~30 tokens, enabling support for models with low TPM limits like groq/qwen/qwen3-32b (6K TPM).

  Also adds --verbose mode to debug API requests with system prompt content and token estimates.

## 0.0.10

### Patch Changes

- 547d73f: Add CI/CD pipeline matching js-ai-driven-development-pipeline-template with changeset support, automated npm publishing, and code quality tools (ESLint, Prettier, Husky)

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).
