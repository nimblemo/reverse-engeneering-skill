const logger = require('../src/utils/logger');
const chalk = require('chalk');

describe('Logger', () => {
    let logSpy, errorSpy, warnSpy;

    beforeEach(() => {
        logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
        errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
        logger.setJsonOutput(false);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test('log() should output to console.log', () => {
        logger.log('test message');
        expect(logSpy).toHaveBeenCalledWith('test message');
    });

    test('error() should output with chalk red when not in JSON mode', () => {
        logger.error('error message');
        expect(errorSpy).toHaveBeenCalledWith(chalk.red('error:'), 'error message');
    });

    test('error() should output JSON when in JSON mode', () => {
        logger.setJsonOutput(true);
        logger.error('error message');
        expect(errorSpy).toHaveBeenCalledWith(JSON.stringify({ error: 'error message' }));
    });

    test('json() should only output when in JSON mode', () => {
        const data = { foo: 'bar' };
        logger.json(data);
        expect(logSpy).not.toHaveBeenCalled();

        logger.setJsonOutput(true);
        logger.json(data);
        expect(logSpy).toHaveBeenCalledWith(JSON.stringify(data));
    });
});
