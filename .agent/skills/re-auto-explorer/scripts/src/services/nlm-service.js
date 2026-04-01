const child_process = require('child_process');
const fs = require('fs-extra');
const path = require('path');
const logger = require('../utils/logger');

class NlmService {
    runNlm(args, useJson = true) {
        const cmdArgs = useJson ? [...args, '--json'] : args;
        const env = { ...process.env, PYTHONUTF8: '1', PYTHONIOENCODING: 'utf-8' };

        try {
            const result = child_process.spawnSync('nlm', cmdArgs, {
                encoding: 'utf-8',
                env: env,
                maxBuffer: 1024 * 1024 * 10 // 10MB
            });

            if (result.error) {
                logger.error(`Error executing nlm: ${result.error.message}`);
                return { error: result.error.message, stderr: '' };
            }

            if (result.status !== 0) {
                logger.error(`nlm process exited with code ${result.status}. Stderr: ${result.stderr}`);
                return { error: `Exit code ${result.status}`, stderr: result.stderr };
            }

            if (useJson) {
                try {
                    return JSON.parse(result.stdout);
                } catch (e) {
                    if (result.stdout) {
                        logger.error(`Failed to parse JSON. nlm output: ${result.stdout}`);
                        return { error: "JSON decode error", raw: result.stdout };
                    }
                    return { error: "JSON decode error", raw: "" };
                }
            } else {
                return { value: result.stdout };
            }
        } catch (e) {
            logger.error(`An unexpected error occurred: ${e.message}`);
            return { error: e.message };
        }
    }

    createNotebook(title) {
        logger.info(`Creating notebook: ${title}...`);
        const data = this.runNlm(["notebook", "create", title], false);
        if (data.error) return null;

        const match = data.value.match(/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}|[0-9a-f]{20,})/i);
        if (match) {
            const nbId = match[1];
            logger.success(`Notebook created with ID: ${nbId}`);
            return nbId;
        } else {
            logger.warn(`Could not find notebook ID in output: ${data.value}`);
            const listData = this.runNlm(["notebook", "list"]);
            if (Array.isArray(listData) && listData.length > 0) {
                for (const nb of listData) {
                    if (nb.title === title) {
                        logger.info(`Found existing notebook ID: ${nb.id}`);
                        return nb.id;
                    }
                }
            }
            return null;
        }
    }

    addSource(notebookId, filePath) {
        logger.log(`Adding source: ${filePath}... `);
        const data = this.runNlm(["source", "add", notebookId, "--file", filePath], false);
        if (data.error) {
            logger.error(`Failed to add source ${filePath}`);
            return false;
        }
        logger.success(`Added ${filePath}`);
        return true;
    }

    async addSourcesFromDir(notebookId, sourcesDir) {
        const sourcesPath = path.resolve(sourcesDir);
        const artifactDir = path.join(sourcesPath, ".tree");
        
        if (!fs.existsSync(artifactDir)) {
            logger.error(`Artifact directory not found: ${artifactDir}`);
            return false;
        }

        const files = (await fs.readdir(artifactDir))
            .filter(f => f !== ".notebooklm_manifest.json")
            .map(f => path.join(artifactDir, f))
            .filter(f => fs.statSync(f).isFile());

        logger.info(`Total files to upload from .tree: ${files.length}`);
        let successCount = 0;

        for (let i = 0; i < files.length; i++) {
            logger.log(`[${i + 1}/${files.length}] `);
            if (this.addSource(notebookId, files[i])) {
                successCount++;
            }
        }

        logger.success(`Successfully uploaded ${successCount}/${files.length} files.`);
        return successCount === files.length;
    }

    queryNlm(notebookId, question, outputFile = null) {
        const data = this.runNlm(["notebook", "query", notebookId, question]);
        if (data.error) return null;

        const answer = (data.value && data.value.answer) ? data.value.answer : "Answer not found in JSON";

        if (outputFile) {
            fs.writeFileSync(outputFile, answer, 'utf-8');
            logger.success(`Answer successfully saved to ${outputFile}`);
        } else {
            logger.log(answer);
        }
        return answer;
    }
}

module.exports = new NlmService();
