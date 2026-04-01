---
name: re-auto-explorer
description: Automates full-cycle reverse engineering with NotebookLM. Use when requesting to 'analyze repository', 'reverse engineer project', or 'generate documentation'.
---

# RE Auto Explorer

## Overview

This skill automates the full cycle of codebase exploration and technical documentation preparation using NotebookLM. Act as a senior reverse engineer and systems architect, guiding users (or running autonomously) through four major stages: initialization, plan refinement, autonomous exploration, and synthesis. Your output is a comprehensive technical documentation package.

# Installation

1. **Check**: Verify `code-tree-rs` is installed and accessible from the command line.
    ```powershell
        .\code-tree-rs.exe --help && node --test tests/test_validator.js
    ```
2. **Node.js dependencies**:
    ```powershell
    cd .agent/skills/re-auto-explorer/scripts; npm install
    ```
3. **External Tools**: Install `code-tree-rs` utilities. 
    ```powershell
    # Option A: Fast install (pre-built binary)
    & ([scriptblock]::Create((irm 'https://raw.githubusercontent.com/nimblemo/code-tree-rs/main/scripts/install.ps1'))) -Local
    ```

## Activation

1.  **Detect Intent**: Check if the user passed `config.yaml`, or find it on user project root directory.
2.  **Load Config**: Read the configuration file from the path provided by the user in the request. If the user did not provide a path, ask them to provide one before proceeding. The configuration may contain a `projects` list for processing multiple projects at once. For each project in the list (or root level if no list), ensure it contains variables.
If not found, **ASK** user to provide it.
    - `{repo_url}` 
    - `{project_name}`      
    - `{project_root}`  
    - `{base_plan}`
    - `{lang_com}` 
    - `{lang_doc}` 
    - `{chanking_type}` - if you cant find? use 'v1'

3.  **Multiple Projects Handling**: If multiple projects are defined in the config under the `projects` key, process them sequentially. For each project, execute the full workflow (from initialization to synthesis) and generate its respective report before moving to the next project in the list. Maintain independent context (`nb_id`, `output_dir`, etc.) for each project, unless the user specified a particular project to run.

## Routing

1. **Init Stage**: If no output report exists on a path `{project_root}/reports/{project_name}/README.md`, then start with `./references/01-initialization.md`.

2. **Resume**: If `{project_root}/reports/{project_name}/README.md` exists, read YAML frontmatter `status` and `inputs` to determine stage. if status is `completed` just miss this project and check next one.

3.  **Forward**:
    - `01-initialization` → `02-refinement` 
    - `02-refinement` → `03-exploration`
    - `03-exploration` → `04-synthesis-documentation`

## Stages

- **01-initialization**: Create NotebookLM project and import repo.
- **02-refinement**: Interactive (or autonomous) planning dialogue.
- **03-exploration**: Continuous research and script execution.
- **04-synthesis-documentation**: Final report drafting and polish.

---

> [!CRITICAL]
> **Language Alignment**: Always use `{lang_doc}` for all research reports and deep investigations. Ensure every query to NotebookLM explicitly requests the output in this language.
> Take a job only from user provided `config.yaml`. Do not process any other projects without configuration.
