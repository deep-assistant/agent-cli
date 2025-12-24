# CLI Help Display Research: stdout vs stderr

## Question

When a CLI tool is called without required subcommands (like `agent auth`), should the help text be displayed on stdout or stderr?

## Research Methodology

1. Tested popular CLI tools to see how they handle help display
2. Compared behavior between "no subcommand" vs "invalid subcommand"
3. Analyzed yargs framework behavior with `demandCommand`
4. Verified our fix matches industry standards

## Findings

### 1. Popular CLI Tools Behavior (No Subcommand)

| Tool   | stdout     | stderr   | Destination | Status |
| ------ | ---------- | -------- | ----------- | ------ |
| git    | 2126 bytes | 0 bytes  | STDOUT      | ✅     |
| gh     | 2442 bytes | 0 bytes  | STDOUT      | ✅     |
| npm    | 1268 bytes | 0 bytes  | STDOUT      | ✅     |
| docker | 0 bytes    | 56 bytes | STDERR      | ❌     |

**Conclusion**: 75% of tested tools (git, gh, npm) send help to stdout when called without arguments.

### 2. Invalid Subcommand vs No Subcommand

| Tool | No Subcommand       | Invalid Subcommand |
| ---- | ------------------- | ------------------ |
| git  | STDOUT (2126 bytes) | STDERR (61 bytes)  |
| gh   | STDOUT (2442 bytes) | STDERR (378 bytes) |
| npm  | STDOUT (1268 bytes) | STDOUT (91 bytes)  |

**Key Insight**: Tools distinguish between:

- **Help display** (no args) → STDOUT (informational)
- **Error messages** (invalid args) → STDERR (actual error)

### 3. Our Implementation

#### Before Fix

```bash
agent auth: stdout=0 bytes, stderr=XXX bytes ❌ STDERR
```

#### After Fix

```bash
agent auth: stdout=2242 bytes, stderr=0 bytes ✅ STDOUT
```

### 4. Technical Context

The `agent auth` command uses yargs with `.demandCommand(1, 'Please specify a subcommand')`.

When called without a subcommand, yargs triggers the fail handler with:

- `msg`: "Please specify a subcommand"
- `err`: undefined

This is a **validation failure**, not a true error. The user hasn't done anything wrong - they're likely exploring the CLI or need help.

## Conclusion

**Our approach is CORRECT** based on the following evidence:

1. **Industry Standard**: Leading CLI tools (git, gh, npm) display help on stdout when called without subcommands
2. **User Intent**: When users type `agent auth`, they're seeking information, not encountering an error
3. **Terminal Behavior**: Many terminals display stderr in red, which is inappropriate for help text
4. **Semantic Correctness**: Help display is informational (stdout), not an error condition (stderr)

## The Fix

Changed `src/index.js` line 640-641 from:

```javascript
console.error(msg);
console.error(yargs.help());
```

To:

```javascript
console.log(stripAnsi(msg));
console.log(`\n${stripAnsi(yargs.help())}`);
```

This ensures:

- Help text goes to stdout (like git, gh, npm)
- No red color in terminals
- Clean, colorless output using `stripAnsi()`

## Recommendation

✅ **Keep the current fix** - it aligns with industry standards and best practices.
