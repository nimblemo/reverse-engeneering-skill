const nlmService = require('../src/services/nlm-service');
const child_process = require('child_process');

jest.mock('child_process');

describe('NlmService', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    test('runNlm() success case with JSON', () => {
        child_process.spawnSync.mockReturnValue({
            status: 0,
            stdout: JSON.stringify({ key: 'value' }),
            stderr: ''
        });

        const result = nlmService.runNlm(['cmd']);
        expect(result).toEqual({ key: 'value' });
        expect(child_process.spawnSync).toHaveBeenCalledWith('nlm', ['cmd', '--json'], expect.any(Object));
    });

    test('runNlm() failure case', () => {
        child_process.spawnSync.mockReturnValue({
            status: 1,
            stdout: '',
            stderr: 'error msg'
        });

        const result = nlmService.runNlm(['cmd']);
        expect(result).toHaveProperty('error');
        expect(result.error).toContain('Exit code 1');
    });

    test('createNotebook() extracts ID from text output', () => {
        const fakeId = '12345678-1234-1234-1234-123456789012';
        nlmService.runNlm = jest.fn().mockReturnValue({ value: `Notebook created with ID: ${fakeId}` });
        
        const nbId = nlmService.createNotebook('test-nb');
        expect(nbId).toBe(fakeId);
    });
});
