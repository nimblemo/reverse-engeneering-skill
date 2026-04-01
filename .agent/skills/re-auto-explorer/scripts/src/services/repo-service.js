const child_process = require('child_process');
const fs = require('fs-extra');
const path = require('path');
const os = require('os');
const logger = require('../utils/logger');

const STANDARD_IGNORES = [".git", "__pycache__", "venv", ".venv", "node_modules", "dist", "build", "target", ".next", ".DS_Store", '.loc'];

class RepoService {
    getStandardIgnores() {
        return STANDARD_IGNORES;
    }

    async cleanArtefacts(repoDir) {
        const artifactDir = path.join(repoDir, ".re-ae");
        
        if (await fs.pathExists(artifactDir)) {
            try {
                await fs.remove(artifactDir);
                logger.success("Artifact directory (.re-ae) cleanup complete.");
                return true;
            } catch (e) {
                logger.error(`Error during cleanup: ${e.message}`);
                return false;
            }
        }

        logger.info(`No artifact directory found at ${artifactDir}`);
        return false;
    }

    async removeRepo(repoDir) {
        try {
            if (await fs.pathExists(repoDir)) {
                await fs.remove(repoDir);
                if (await fs.pathExists(repoDir)) {
                    logger.warn(`Could not completely remove ${repoDir}`);
                } else {
                    logger.success(`Repository ${repoDir} removed.`);
                }
                return true;
            } else {
                logger.info(`Path ${repoDir} does not exist.`);
                return false;
            }
        } catch (e) {
            logger.error(`Error removing repository: ${e.message}`);
            return false;
        }
    }

    async prepareRepo(repoUrl, outputDir) {
        if (repoUrl.match(/^(http:\/\/|https:\/\/|git@)/)) {
            const targetDir = outputDir ? path.resolve(outputDir) : await fs.mkdtemp(path.join(os.tmpdir(), "re_auto_explorer"));
            
            if (await fs.pathExists(targetDir)) {
                logger.info(`Target directory ${targetDir} already exists. Removing it for a fresh clone...`);
                await fs.remove(targetDir);
            }

            await fs.ensureDir(targetDir);

            try {
                logger.info(`Cloning repo ${repoUrl} to ${targetDir}...`);
                child_process.execSync(`git clone "${repoUrl}" "${targetDir}"`, { stdio: 'inherit' });
                return { repoDir: targetDir, isClone: true };
            } catch (e) {
                logger.error(`Error cloning repo: ${e.message}`);
                throw e;
            }
        } else {
            const sourcePath = path.resolve(repoUrl);
            if (!(await fs.pathExists(sourcePath))) {
                throw new Error(`Local path not found: ${sourcePath}`);
            }

            const targetDir = outputDir ? path.resolve(outputDir) : await fs.mkdtemp(path.join(os.tmpdir(), "bmad_re_local_"));
            
            let isSame = false;
            try {
                const sourceStat = await fs.stat(sourcePath);
                const targetStat = await fs.stat(targetDir);
                isSame = sourceStat.ino === targetStat.ino;
            } catch (e) {
                isSame = sourcePath.toLowerCase() === targetDir.toLowerCase();
            }

            if (!isSame) {
                if (await fs.pathExists(targetDir)) {
                    logger.info(`Target directory ${targetDir} already exists. Removing it for a fresh copy...`);
                    await fs.remove(targetDir);
                }
                await fs.ensureDir(targetDir);
                
                logger.info(`Working on a copy of ${sourcePath} in ${targetDir}...`);
                await this.copyDirFiltered(sourcePath, targetDir);
                return { repoDir: targetDir, isClone: true };
            } else {
                logger.warn("Working in-place on original source! Original files will NOT be deleted, but chunks will be created alongside.");
                return { repoDir: targetDir, isClone: false };
            }
        }
    }

    async copyDirFiltered(src, dest) {
        const excludeSet = new Set(STANDARD_IGNORES);
        await fs.copy(src, dest, {
            filter: (itemPath) => {
                const basename = path.basename(itemPath);
                if (excludeSet.has(basename)) return false;
                // Avoid recursive copy if dest is inside src
                if (path.resolve(itemPath) === path.resolve(dest)) return false;
                return true;
            }
        });
    }

    async cleanupGit(repoDir) {
        const gitDir = path.join(repoDir, ".git");
        if (await fs.pathExists(gitDir)) {
            await fs.remove(gitDir);
        }
    }
}

module.exports = new RepoService();
