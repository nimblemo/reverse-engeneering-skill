const { Command } = require('commander');
const path = require('path');
const fs = require('fs-extra');
const child_process = require('child_process');
const logger = require('./utils/logger');
const nlmService = require('./services/nlm-service');
const repoService = require('./services/repo-service');
const scannerService = require('./services/scanner-service');
const processorService = require('./services/processor-service');

const program = new Command();

program
    .name('re-auto-explorer')
    .description('BMad RE Auto Explorer Unified Script')
    .version('1.0.0');

program
    .command('prep')
    .description('Preprocess repository for NotebookLM ingestion')
    .requiredOption('--repo_url <url/path>', 'Repository URL or local path')
    .option('--output_dir <path>', 'Output directory')
    .option('--max_sources <int>', 'Maximum number of sources', '50')
    .option('--type <v1|v2>', 'Preprocessing strategy type', 'v1')
    .option('--keep', 'Keep original files if cloning/copying', false)
    .option('--json', 'Output results in JSON format', false)
    .action(async (options) => {
        if (options.json) logger.setJsonOutput(true);

        try {
            const { repoDir, isClone } = await repoService.prepareRepo(options.repo_url, options.output_dir);
            const maxSources = parseInt(options.max_sources, 10);
            
            let codeFiles = new Set();
            let textFiles = new Set();

            if (options.type === 'v2') {
                const exePath = path.join(__dirname, '..', 'code-tree-rs.exe');
                const treeDocsDir = path.join(repoDir, '.tree');
                await fs.ensureDir(treeDocsDir);
                
                const cmd = `"${exePath}" -p "${repoDir}" -o "${treeDocsDir}"`;
                logger.info(`Running strategy v2: ${cmd}`);
                
                try {
                    const treeTomlPath = path.join(repoDir, '.tree.toml');
                    if (await fs.pathExists(treeTomlPath)) {
                        await fs.unlink(treeTomlPath);
                    }
                    child_process.execSync(cmd, { cwd: repoDir, stdio: 'inherit' });
                } catch (e) {
                    throw new Error(`code-tree-rs failed: ${e.message}`);
                }
                
                const gatherFiles = async (dir) => {
                    let files = [];
                    if (await fs.pathExists(dir)) {
                        const items = await fs.readdir(dir, { withFileTypes: true });
                        for (const item of items) {
                            const fullPath = path.join(dir, item.name);
                            if (item.isFile()) files.push(fullPath);
                            else if (item.isDirectory()) files.push(...(await gatherFiles(fullPath)));
                        }
                    }
                    return files;
                };
                
                const insightFiles = await gatherFiles(path.join(repoDir, '.tree','insights'));
                const structFiles = await gatherFiles(path.join(repoDir, '.tree', 'structure'));
                codeFiles = new Set([...insightFiles, ...structFiles]);
            } else {
                const scanResult = await scannerService.scanAndCategorizeFiles(repoDir);
                codeFiles = scanResult.codeFiles;
                textFiles = scanResult.textFiles;
            }

            const { resultFiles, artifacts } = await processorService.createArtifacts(
                repoDir, 
                Array.from(textFiles), 
                Array.from(codeFiles), 
                maxSources, 
                isClone, 
                options.keep
            );

            await repoService.cleanupGit(repoDir);

            const result = {
                repo_path: path.resolve(repoDir),
                is_clone: isClone,
                final_source_count: resultFiles.length,
                files: resultFiles,
                manifest_created: artifacts.length > 0
            };

            if (options.json) {
                logger.json(result);
            } else {
                logger.success(`Final source count: ${resultFiles.length} (within limit of ${maxSources})`);
                logger.info(`Repo path: ${path.resolve(repoDir)}`);
                if (artifacts.length > 0) {
                    logger.info(`Manifest created with ${artifacts.length} tracking entries.`);
                }
            }
        } catch (e) {
            logger.error(e.message);
            process.exit(1);
        }
    });

program
    .command('clean')
    .description('Clean artifacts or remove repo')
    .requiredOption('--target <path>', 'Target directory')
    .option('--clean-artefacts', 'Clean .tree directory')
    .option('--remove-repo', 'Remove the entire repository directory')
    .option('--json', 'Output results in JSON format', false)
    .action(async (options) => {
        if (options.json) logger.setJsonOutput(true);
        const repoDir = path.resolve(options.target);
        if (options.clean_artefacts) await repoService.cleanArtefacts(repoDir);
        if (options.remove_repo) await repoService.removeRepo(repoDir);
    });

program
    .command('create')
    .description('Create a NotebookLM notebook')
    .argument('<title>', 'Notebook title')
    .option('--json', 'Output results in JSON format', false)
    .action(async (title, options) => {
        if (options.json) logger.setJsonOutput(true);
        const nbId = nlmService.createNotebook(title);
        if (options.json) logger.json({ notebook_id: nbId });
    });

program
    .command('add')
    .description('Add a single source to a notebook')
    .argument('<nb_id>', 'Notebook ID')
    .argument('<file_path>', 'File path to add')
    .option('--json', 'Output results in JSON format', false)
    .action(async (nbId, filePath, options) => {
        if (options.json) logger.setJsonOutput(true);
        const success = nlmService.addSource(nbId, filePath);
        if (options.json) logger.json({ success });
    });

program
    .command('upload')
    .description('Upload a directory of sources to a notebook')
    .argument('<nb_id>', 'Notebook ID')
    .argument('<dir_path>', 'Directory path containing .tree')
    .option('--json', 'Output results in JSON format', false)
    .action(async (nbId, dirPath, options) => {
        if (options.json) logger.setJsonOutput(true);
        const success = await nlmService.addSourcesFromDir(nbId, dirPath);
        if (options.json) logger.json({ success });
    });

program
    .command('query')
    .description('Query a notebook')
    .argument('<nb_id>', 'Notebook ID')
    .argument('<question>', 'Question to ask')
    .argument('[output_file]', 'Optional file to save the answer')
    .option('--json', 'Output results in JSON format', false)
    .action(async (nbId, question, outputFile, options) => {
        if (options.json) logger.setJsonOutput(true);
        const answer = nlmService.queryNlm(nbId, question, outputFile);
        if (options.json) logger.json({ answer });
    });

module.exports = program;
