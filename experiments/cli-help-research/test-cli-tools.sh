#!/bin/bash

# Test how popular CLI tools handle help display
# This script checks whether help goes to stdout or stderr

echo "Testing CLI tools for help display behavior..."
echo "=============================================="
echo ""

# Function to test a command
test_command() {
    local cmd="$1"
    local description="$2"
    
    echo "Testing: $description"
    echo "Command: $cmd"
    
    # Run command and capture stdout/stderr separately
    stdout_file=$(mktemp)
    stderr_file=$(mktemp)
    
    eval "$cmd" > "$stdout_file" 2> "$stderr_file" || true
    
    stdout_size=$(wc -c < "$stdout_file")
    stderr_size=$(wc -c < "$stderr_file")
    
    echo "  stdout size: $stdout_size bytes"
    echo "  stderr size: $stderr_size bytes"
    
    if [ "$stdout_size" -gt "$stderr_size" ]; then
        echo "  ✅ Help goes to STDOUT"
    else
        echo "  ❌ Help goes to STDERR"
    fi
    
    rm -f "$stdout_file" "$stderr_file"
    echo ""
}

# Test git (one of the most popular CLI tools)
test_command "git" "git without subcommand"

# Test docker
test_command "docker" "docker without subcommand"

# Test npm
test_command "npm" "npm without subcommand"

# Test gh (GitHub CLI - similar tool to agent)
test_command "gh" "gh without subcommand"

# Test kubectl if available
if command -v kubectl &> /dev/null; then
    test_command "kubectl" "kubectl without subcommand"
fi

# Test aws if available
if command -v aws &> /dev/null; then
    test_command "aws" "aws without subcommand"
fi

echo "=============================================="
echo "Summary: Most modern CLI tools display help on STDOUT when called without arguments"
