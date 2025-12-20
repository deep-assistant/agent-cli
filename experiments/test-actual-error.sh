#!/bin/bash
# Test that actual errors still go to stderr

echo "=== Testing that actual errors still go to stderr ==="
echo ""

# Try to run with an invalid option (should produce an error on stderr)
bun run src/index.js --invalid-option 2>&1 | head -5

echo ""
echo "=== Test complete - errors should still appear on stderr ==="
