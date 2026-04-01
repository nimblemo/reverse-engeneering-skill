#!/usr/bin/env node
/**
 * BMad RE Auto Explorer Unified Script (Modular Version)
 */
const { main } = require('./src/index');

if (require.main === module) {
    main();
}
