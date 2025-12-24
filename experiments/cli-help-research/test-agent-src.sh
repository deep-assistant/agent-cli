#!/bin/bash

echo "Testing agent source behavior"
echo "====================================="
echo ""

cd /tmp/gh-issue-solver-1766347654233

echo "Test 1: 'agent auth' with current fix"
echo "---"
stdout_file=$(mktemp)
stderr_file=$(mktemp)

bun run src/index.js auth > "$stdout_file" 2> "$stderr_file" || true

stdout_size=$(wc -c < "$stdout_file")
stderr_size=$(wc -c < "$stderr_file")

echo "stdout size: $stdout_size bytes"
echo "stderr size: $stderr_size bytes"

if [ "$stdout_size" -gt 50 ]; then
    echo ""
    echo "First few lines of stdout:"
    head -10 "$stdout_file"
fi

echo ""
echo "Comparison with popular CLI tools:"
echo "---"

# Test git
git > "$stdout_file" 2> "$stderr_file" || true
git_stdout=$(wc -c < "$stdout_file")
git_stderr=$(wc -c < "$stderr_file")

# Test gh
gh > "$stdout_file" 2> "$stderr_file" || true
gh_stdout=$(wc -c < "$stdout_file")
gh_stderr=$(wc -c < "$stderr_file")

# Test npm
npm > "$stdout_file" 2> "$stderr_file" || true
npm_stdout=$(wc -c < "$stdout_file")
npm_stderr=$(wc -c < "$stderr_file")

# Test agent auth again
bun run src/index.js auth > "$stdout_file" 2> "$stderr_file" || true
agent_stdout=$(wc -c < "$stdout_file")
agent_stderr=$(wc -c < "$stderr_file")

echo "git:        stdout=$git_stdout bytes,   stderr=$git_stderr bytes   $([ "$git_stdout" -gt "$git_stderr" ] && echo '✅ STDOUT' || echo '❌ STDERR')"
echo "gh:         stdout=$gh_stdout bytes,   stderr=$gh_stderr bytes   $([ "$gh_stdout" -gt "$gh_stderr" ] && echo '✅ STDOUT' || echo '❌ STDERR')"
echo "npm:        stdout=$npm_stdout bytes,  stderr=$npm_stderr bytes   $([ "$npm_stdout" -gt "$npm_stderr" ] && echo '✅ STDOUT' || echo '❌ STDERR')"
echo "agent auth: stdout=$agent_stdout bytes,  stderr=$agent_stderr bytes   $([ "$agent_stdout" -gt "$agent_stderr" ] && echo '✅ STDOUT' || echo '❌ STDERR')"

rm -f "$stdout_file" "$stderr_file"

echo ""
echo "====================================="
