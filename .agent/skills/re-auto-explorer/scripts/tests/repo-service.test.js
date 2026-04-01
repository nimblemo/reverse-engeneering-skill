const repoService = require('../src/services/repo-service');
const fs = require('fs-extra');
const child_process = require('child_process');

jest.mock('fs-extra');
jest.mock('child_process');

describe('RepoService', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    test('getStandardIgnores() returns an array of ignores', () => {
        const ignores = repoService.getStandardIgnores();
        expect(Array.isArray(ignores)).toBe(true);
        expect(ignores).toContain('.git');
    });

    test('cleanArtefacts() calls fs.remove if artifactDir exists', async () => {
        const repoDir = '/test/repo';
        fs.pathExists.mockResolvedValue(true);
        fs.remove.mockResolvedValue(undefined);

        const result = await repoService.cleanArtefacts(repoDir);
        expect(fs.remove).toHaveBeenCalledWith(expect.stringContaining('.re-ae'));
        expect(result).toBe(true);
    });

    test('removeRepo() calls fs.remove if repoDir exists', async () => {
        const repoDir = '/test/repo';
        fs.pathExists.mockResolvedValueOnce(true).mockResolvedValueOnce(false);
        fs.remove.mockResolvedValue(undefined);

        const result = await repoService.removeRepo(repoDir);
        expect(fs.remove).toHaveBeenCalledWith(repoDir);
        expect(result).toBe(true);
    });

    test('prepareRepo() with git URL should call git clone', async () => {
        const repoUrl = 'https://github.com/test/repo.git';
        fs.pathExists.mockResolvedValue(false);
        fs.ensureDir.mockResolvedValue(undefined);
        child_process.execSync.mockReturnValue(Buffer.from(''));

        const { repoDir, isClone } = await repoService.prepareRepo(repoUrl, '/out');
        expect(child_process.execSync).toHaveBeenCalledWith(expect.stringContaining('git clone'), expect.any(Object));
        expect(isClone).toBe(true);
    });
});
