const test = require('node:test');
const assert = require('node:assert');
const child_process = require('node:child_process');
const { checkNlm } = require('../validator.js');

test('test_check_nlm_success', (t) => {
    const originalSpawnSync = child_process.spawnSync;
    t.after(() => { child_process.spawnSync = originalSpawnSync; });
    
    child_process.spawnSync = () => ({ status: 0, stdout: "nlm v1.0.0\n", error: null });
    const result = checkNlm();
    assert.strictEqual(result.available, true);
    assert.strictEqual(result.detail, "nlm v1.0.0");
});

test('test_check_nlm_not_found', (t) => {
    const originalSpawnSync = child_process.spawnSync;
    t.after(() => { child_process.spawnSync = originalSpawnSync; });
    
    child_process.spawnSync = () => ({ error: { code: 'ENOENT' } });
    const result = checkNlm();
    assert.strictEqual(result.available, false);
    assert.strictEqual(result.detail, "nlm command not found");
});

test('test_check_nlm_error', (t) => {
    const originalSpawnSync = child_process.spawnSync;
    t.after(() => { child_process.spawnSync = originalSpawnSync; });
    
    child_process.spawnSync = () => ({ status: 1, error: null });
    const result = checkNlm();
    assert.strictEqual(result.available, false);
    assert.strictEqual(result.detail, "nlm returned non-zero exit code");
});
