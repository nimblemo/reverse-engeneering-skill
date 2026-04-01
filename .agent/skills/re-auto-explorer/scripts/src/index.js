#!/usr/bin/env node
const cli = require('./cli');

async function main() {
    try {
        await cli.parseAsync(process.argv);
    } catch (err) {
        console.error('An unexpected error occurred:', err);
        process.exit(1);
    }
}

module.exports = { main };

if (require.main === module) {
    main();
}
