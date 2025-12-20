#!/bin/bash
# Test script to verify the fix

echo "=== Testing the fix ==="
echo ""

# Run the command and capture both stdout and stderr separately
bun run src/index.js auth > /tmp/auth-stdout-fixed.txt 2> /tmp/auth-stderr-fixed.txt

echo "--- STDOUT (should contain help text now) ---"
cat /tmp/auth-stdout-fixed.txt
echo ""

echo "--- STDERR (should be empty now) ---"
cat /tmp/auth-stderr-fixed.txt
echo ""

if [ -s /tmp/auth-stderr-fixed.txt ]; then
    echo "❌ FAIL: STDERR is not empty"
    exit 1
else
    echo "✅ PASS: STDERR is empty - help text is on STDOUT"
fi

if [ -s /tmp/auth-stdout-fixed.txt ]; then
    echo "✅ PASS: STDOUT contains help text"
else
    echo "❌ FAIL: STDOUT is empty"
    exit 1
fi

echo ""
echo "=== Test passed! ==="
