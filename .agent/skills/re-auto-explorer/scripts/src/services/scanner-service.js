const fs = require('fs-extra');
const path = require('path');
const klaw = require('klaw');
const ignore = require('ignore');
const { ModelOperations } = require('@vscode/vscode-languagedetection');
const mime = require('mime-types');
const repoService = require('./repo-service');
const logger = require('../utils/logger');

class ScannerService {
    async scanAndCategorizeFiles(rootDir) {
        const items = [];
        const gitignores = [];
        const STANDARD_IGNORES = repoService.getStandardIgnores();

        const excludeDirFilter = item => {
            const basename = path.basename(item);
            return !STANDARD_IGNORES.includes(basename);
        };

        await new Promise((resolve, reject) => {
            klaw(rootDir, { filter: excludeDirFilter })
                .on('data', item => {
                    if (item.stats.isFile()) {
                        items.push(item.path);
                        if (path.basename(item.path) === '.gitignore') {
                            gitignores.push(item.path);
                        }
                    }
                })
                .on('end', resolve)
                .on('error', reject);
        });

        const igMap = new Map();
        gitignores.sort((a, b) => a.length - b.length);
        
        for (const giPath of gitignores) {
            const dir = path.dirname(giPath);
            const content = await fs.readFile(giPath, 'utf8');
            const ig = ignore().add(content);
            igMap.set(dir, ig);
        }

        const isIgnored = (filePath) => {
            const relToRoot = path.relative(rootDir, filePath);
            if (ignore().add(STANDARD_IGNORES).ignores(relToRoot)) return true;
            
            let currentDir = path.dirname(filePath);
            while (currentDir.startsWith(rootDir)) {
                if (igMap.has(currentDir)) {
                    const ig = igMap.get(currentDir);
                    const relPath = path.relative(currentDir, filePath);
                    if (relPath && ig.ignores(relPath)) {
                        return true;
                    }
                }
                if (currentDir === rootDir) break;
                currentDir = path.dirname(currentDir);
            }
            return false;
        };

        const codeFiles = new Set();
        const textFiles = new Set();
        
        const modelOperations = new ModelOperations();

        for (const filePath of items) {
            if (isIgnored(filePath) || path.basename(filePath) === '.gitignore') continue;

            const mimeType = mime.lookup(filePath);
            const isMimeText = mimeType && (mimeType.startsWith('text/') || mimeType === 'application/json' || mimeType === 'application/xml');
            
            // If it's a known binary type, skip it
            if (mimeType && !isMimeText && !mimeType.startsWith('application/')) {
                continue;
            }

            try {
                // Read up to 100KB for language detection
                const content = (await fs.readFile(filePath, 'utf8')).substring(0, 100000);
                if (!content.trim()) continue; // Skip empty files

                const result = await modelOperations.runModel(content);
                
                if (result && result.length > 0) {
                    const topLang = result[0];
                    // 'txt', 'md', 'json', 'csv' might be treated as text rather than code
                    const textLangs = new Set(['txt', 'md', 'csv']);
                    
                    if (topLang.confidence > 0.05 && !textLangs.has(topLang.languageId)) {
                        codeFiles.add(filePath);
                    } else {
                        textFiles.add(filePath);
                    }
                } else if (isMimeText) {
                    textFiles.add(filePath);
                }
            } catch (e) {
                // If we fail to read as utf8 or model fails, fallback to mime check
                if (isMimeText) {
                    textFiles.add(filePath);
                }
            }
        }

        return { 
            codeFiles: new Set(Array.from(codeFiles).sort()), 
            textFiles: new Set(Array.from(textFiles).sort()) 
        };
    }
}

module.exports = new ScannerService();
