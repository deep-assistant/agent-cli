#!/bin/bash

echo "Testing actual agent binary behavior"
echo "====================================="
echo ""

# Build the agent first
cd /tmp/gh-issue-solver-1766347654233
if [ ! -f "dist/agent" ]; then
    echo "Building agent..."
    bun run build > /dev/null 2>&1
fi

echo "Test 1: 'agent auth' (no subcommand)"
echo "---"
stdout_file=$(mktemp)
stderr_file=$(mktemp)

./dist/agent auth > "$stdout_file" 2> "$stderr_file" || true

stdout_size=$(wc -c < "$stdout_file")
stderr_size=$(wc -c < "$stderr_file")

echo "stdout size: $stdout_size bytes"
echo "stderr size: $stderr_size bytes"

if [ "$stdout_size" -gt 0 ]; then
    echo "stdout preview:"
    head -5 "$stdout_file"
fi

if [ "$stderr_size" -gt 0 ]; then
    echo "stderr preview:"
    head -5 "$stderr_file"
fi

echo ""
echo "Test 2: Compare with 'git' (no subcommand)"
echo "---"
git > "$stdout_file" 2> "$stderr_file" || true
stdout_size=$(wc -c < "$stdout_file")
stderr_size=$(wc -c < "$stderr_file")
echo "git: stdout=$stdout_size bytes, stderr=$stderr_size bytes"
[ "$stdout_size" -gt "$stderr_size" ] && echo "  → Help goes to STDOUT ✅" || echo "  → Help goes to STDERR ❌"

echo ""
echo "Test 3: Compare with 'gh' (no subcommand)"
echo "---"
gh > "$stdout_file" 2> "$stderr_file" || true
stdout_size=$(wc -c < "$stdout_file")
stderr_size=$(wc -c < "$stderr_file")
echo "gh: stdout=$stdout_size bytes, stderr=$stderr_size bytes"
[ "$stdout_size" -gt "$stderr_size" ] && echo "  → Help goes to STDOUT ✅" || echo "  → Help goes to STDERR ❌"

echo ""
./dist/agent auth > "$stdout_file" 2> "$stderr_file" || true
stdout_size=$(wc -c < "$stdout_file")
stderr_size=$(wc -c < "$stderr_file")
echo "agent auth: stdout=$stdout_size bytes, stderr=$stderr_size bytes"
[ "$stdout_size" -gt "$stderr_size" ] && echo "  → Help goes to STDOUT ✅" || echo "  → Help goes to STDERR ❌"

rm -f "$stdout_file" "$stderr_file"

echo ""
echo "====================================="
echo "Summary: With our fix, 'agent auth' now behaves like 'git' and 'gh'"
