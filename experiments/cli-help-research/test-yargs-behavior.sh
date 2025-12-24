#!/bin/bash

echo "Testing yargs demandCommand behavior"
echo "====================================="
echo ""

# Create a simple yargs test script
cat > /tmp/test-yargs-demandcommand.js << 'EOFJS'
#!/usr/bin/env node
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');

yargs(hideBin(process.argv))
  .command('sub1', 'Subcommand 1', {}, () => {
    console.log('Executing sub1');
  })
  .command('sub2', 'Subcommand 2', {}, () => {
    console.log('Executing sub2');
  })
  .demandCommand(1, 'Please specify a subcommand')
  .fail((msg, err, yargs) => {
    console.error('FAIL HANDLER CALLED');
    console.error('msg:', msg);
    console.error('err:', err);
    if (msg) {
      console.error(msg);
      console.error(yargs.help());
    }
    process.exit(1);
  })
  .help()
  .argv;
EOFJS

chmod +x /tmp/test-yargs-demandcommand.js

echo "Test 1: No subcommand (like 'agent auth')"
echo "---"
stdout_file=$(mktemp)
stderr_file=$(mktemp)
node /tmp/test-yargs-demandcommand.js > "$stdout_file" 2> "$stderr_file" || true
echo "stdout ($(wc -c < "$stdout_file") bytes):"
cat "$stdout_file"
echo ""
echo "stderr ($(wc -c < "$stderr_file") bytes):"
cat "$stderr_file"
echo ""
echo ""

echo "Test 2: Invalid subcommand"
echo "---"
node /tmp/test-yargs-demandcommand.js invalid > "$stdout_file" 2> "$stderr_file" || true
echo "stdout ($(wc -c < "$stdout_file") bytes):"
cat "$stdout_file"
echo ""
echo "stderr ($(wc -c < "$stderr_file") bytes):"
cat "$stderr_file"
echo ""

rm -f "$stdout_file" "$stderr_file" /tmp/test-yargs-demandcommand.js

echo "====================================="
echo "Key Finding:"
echo "When demandCommand is used, missing subcommand triggers the fail handler"
echo "This is a VALIDATION ERROR, not a help request"
