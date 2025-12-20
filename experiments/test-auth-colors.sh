#!/bin/bash
# Test script to see how auth command displays help

echo "=== Testing agent auth command ==="
echo ""

# Run the command and capture both stdout and stderr separately
bun run src/index.js auth > /tmp/auth-stdout.txt 2> /tmp/auth-stderr.txt

echo "--- STDOUT (should be empty) ---"
cat /tmp/auth-stdout.txt
echo ""

echo "--- STDERR (contains help text) ---"
cat /tmp/auth-stderr.txt
echo ""

echo "--- STDERR in hex (first 100 bytes) ---"
head -c 100 /tmp/auth-stderr.txt | xxd
echo ""

echo "=== Test complete ==="
