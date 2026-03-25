---
name: bmad-re-auto-explorer
description: Automates full-cycle reverse engineering with NotebookLM. Use when requesting to 'analyze repository', 'reverse engineer project', or 'generate documentation'.
---

# BMad RE Auto Explorer

## Overview

This skill automates the full cycle of codebase exploration and technical documentation preparation using NotebookLM. Act as a senior reverse engineer and systems architect, guiding users (or running autonomously) through four major stages: initialization, plan refinement, autonomous exploration, and synthesis. Your output is a comprehensive technical documentation package.

## Activation

1.  **Detect Intent**: Check if the user passed `--headless`, `--repo`, `--config`.
2.  **Load Config**: Read the configuration file from the path provided by the user in the request. If the user did not provide a path, ask them to provide one before proceeding. The configuration may contain a `projects` list for processing multiple projects at once. For each project in the list (or root level if no list), ensure it contains:
    - `{re_repo_url}` (fallback: prompt user)
    - `{re_project_name}` (fallback: take it from `re_repo_url` after splitting by '/' and taking the last element without extension)
    - `{communication_language}` (fallback: English, can be defined at root level)
    - `{document_output_language}` (fallback: English, can be defined at root level)
    - `{re_output_folder}` (fallback: `{project-root}/reports/{re_project_name}`)
    - `{re_sources_folder}` (fallback: `{project-root}/sources/{re_project_name}`)
    - `{re_base_plan}` (fallback: `{project-root}/research-plan.md`)
    - `{re_max_sources}` (fallback: 45)
3.  **Multiple Projects Handling**: If multiple projects are defined in the config under the `projects` key, process them sequentially. For each project, execute the full workflow (from initialization to synthesis) and generate its respective report before moving to the next project in the list. Maintain independent context (`nb_id`, `re_output_folder`, etc.) for each project, unless the user specified a particular project to run.

## Routing

1.  **Init Stage**: If no output report exists, start with `./references/01-initialization.md`.
    - **Actions**: Use `preprocess.py` to `create` notebook and `upload` source files.

2.  **Resume**: If report exists, read YAML frontmatter `status` and `inputs` to determine stage.
3.  **Forward**:
    - `01-initialization` → `02-refinement` (Using `preprocess.py query`)
    - `02-refinement` → `03-exploration` (Using `preprocess.py query`)
    - `03-exploration` → `04-synthesis-documentation`

## Stages

- **01-initialization**: Create NotebookLM project and import repo.
- **02-refinement**: Interactive (or autonomous) planning dialogue.
- **03-exploration**: Continuous research and script execution.
- **04-synthesis-documentation**: Final report drafting and polish.

---

> [!NOTE]
> This workflow uses the **Document-as-Cache** pattern. The report at `{re_output_folder}` is the single source of truth for the session state.
