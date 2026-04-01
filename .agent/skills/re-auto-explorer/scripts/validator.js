#!/usr/bin/env node
/**
 * Validate NLM CLI Connection.
 */
const child_process = require('child_process');

function checkNlm() {
    try {
        const result = child_process.spawnSync('nlm', ['--version'], {
            encoding: 'utf-8',
            env: { ...process.env, PYTHONUTF8: '1', PYTHONIOENCODING: 'utf-8' }
        });

        if (result.error) {
            if (result.error.code === 'ENOENT') {
                return { available: false, detail: 'nlm command not found' };
            }
            return { available: false, detail: result.error.message };
        }

        if (result.status !== 0) {
            return { available: false, detail: 'nlm returned non-zero exit code' };
        }

        return { available: true, detail: result.stdout ? result.stdout.trim() : 'nlm available' };
    } catch (e) {
        return { available: false, detail: e.message };
    }
}

function main() {
    const args = process.argv.slice(2);
    const jsonOutput = args.includes('--json');

    const result = checkNlm();

    if (jsonOutput) {
        console.log(JSON.stringify({
            mcp_active: result.available,
            detail: result.detail
        }));
    } else {
        if (result.available) {
            console.log(`MCP Context: Active (${result.detail})`);
            process.exit(0);
        } else {
            console.log(`MCP Context: Inactive (${result.detail})`);
            process.exit(1);
        }
    }
}

if (require.main === module) {
    main();
}

module.exports = { checkNlm };
