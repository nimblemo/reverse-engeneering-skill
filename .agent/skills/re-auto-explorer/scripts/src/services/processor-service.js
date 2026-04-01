const fs = require('fs-extra');
const path = require('path');
const logger = require('../utils/logger');

class ProcessorService {
    async mergeFiles(filesToMerge, outputFolder, chunkCount, baseName = "merged_source", deleteOriginal = true) {
        if (!filesToMerge || filesToMerge.length === 0) return [];

        const mergedFiles = [];
        let avg = Math.floor(filesToMerge.length / chunkCount);
        if (avg === 0) avg = 1;

        for (let i = 0; i < chunkCount; i++) {
            const start = i * avg;
            const end = (i < chunkCount - 1) ? (i + 1) * avg : filesToMerge.length;
            const chunk = filesToMerge.slice(start, end);

            if (chunk.length === 0) continue;

            const mergedPath = path.join(outputFolder, `${baseName}_${i + 1}.txt`);
            let content = "";

            for (const fpath of chunk) {
                let relPath = path.relative(outputFolder, fpath);
                if (relPath.startsWith("..")) relPath = path.basename(fpath);

                content += `\n--- FILE: ${relPath} ---\n`;
                try {
                    content += await fs.readFile(fpath, 'utf-8');
                } catch (e) {
                    content += `Error reading file: ${e.message}\n`;
                }
                content += "\n";
            }

            await fs.writeFile(mergedPath, content, 'utf-8');
            mergedFiles.push(path.resolve(mergedPath));

            if (deleteOriginal) {
                for (const fpath of chunk) {
                    if (await fs.pathExists(fpath)) {
                        try {
                            await fs.unlink(fpath);
                        } catch (e) {
                            try {
                                await fs.chmod(fpath, 0o777);
                                await fs.unlink(fpath);
                            } catch (err) {
                                logger.warn(`Warning: Could not delete ${fpath}: ${err.message}`);
                            }
                        }
                    }
                }
            }
        }

        return mergedFiles;
    }

    async createArtifacts(repoDir, safeFiles, otherFiles, maxSources, isClone, keep) {
        const totalCount = safeFiles.length + otherFiles.length;
        const artifactDir = path.join(repoDir, ".re-ae");
        await fs.ensureDir(artifactDir);

        let resultFiles = [...safeFiles];
        const artifacts = [];
        const shouldDelete = isClone && !keep;

        if (totalCount > maxSources) {
            const availableSlots = maxSources - safeFiles.length;
            if (availableSlots <= 0) {
                const allFiles = [...otherFiles, ...safeFiles];
                const merged = await this.mergeFiles(allFiles, artifactDir, maxSources, "merged_source", shouldDelete);
                resultFiles = merged;
                artifacts.push(...merged);
            } else {
                const merged = await this.mergeFiles(otherFiles, artifactDir, availableSlots, "merged_source", shouldDelete);
                resultFiles.push(...merged);
                artifacts.push(...merged);
            }
        } else {
            for (const fpath of otherFiles) {
                const newPath = path.join(artifactDir, path.basename(fpath) + ".txt");
                if (shouldDelete) {
                    await fs.move(fpath, newPath, { overwrite: true });
                } else {
                    await fs.copy(fpath, newPath);
                }
                resultFiles.push(path.resolve(newPath));
                artifacts.push(path.resolve(newPath));
            }
        }

        // Save manifest
        if (artifacts.length > 0) {
            const manifestPath = path.join(artifactDir, ".notebooklm_manifest.json");
            await fs.writeFile(manifestPath, JSON.stringify(artifacts, null, 2), 'utf-8');
        }

        return { resultFiles, artifacts };
    }
}

module.exports = new ProcessorService();
