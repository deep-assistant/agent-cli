#!/bin/bash

echo "Testing: INVALID subcommand vs NO subcommand"
echo "=============================================="
echo ""

test_both() {
    local tool="$1"
    local invalid_cmd="$2"

    echo "Tool: $tool"
    echo "---"

    # Test with no subcommand
    stdout_file=$(mktemp)
    stderr_file=$(mktemp)
    eval "$tool" > "$stdout_file" 2> "$stderr_file" || true
    stdout_size=$(wc -c < "$stdout_file")
    stderr_size=$(wc -c < "$stderr_file")

    echo "  No subcommand:"
    echo "    stdout: $stdout_size bytes, stderr: $stderr_size bytes"
    [ "$stdout_size" -gt "$stderr_size" ] && echo "    → STDOUT" || echo "    → STDERR"

    # Test with invalid subcommand
    eval "$invalid_cmd" > "$stdout_file" 2> "$stderr_file" || true
    stdout_size=$(wc -c < "$stdout_file")
    stderr_size=$(wc -c < "$stderr_file")

    echo "  Invalid subcommand:"
    echo "    stdout: $stdout_size bytes, stderr: $stderr_size bytes"
    [ "$stdout_size" -gt "$stderr_size" ] && echo "    → STDOUT" || echo "    → STDERR"

    rm -f "$stdout_file" "$stderr_file"
    echo ""
}

test_both "git" "git invalidcmd123"
test_both "gh" "gh invalidcmd123"
test_both "npm" "npm invalidcmd123"

echo "=============================================="
echo "Key Finding:"
echo "- Help display (no args): Usually goes to STDOUT"
echo "- Error messages (invalid args): Usually goes to STDERR"
