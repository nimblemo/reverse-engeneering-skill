# 04-synthesis-documentation

## Overview

Consolidate findings into a professional technical document.

## Actions

1.  **Restore Context (CRITICAL)**:
    - Open `{re_output_folder}/re-report.md`.
    - Extract all variables from the YAML `context` block (e.g., `nb_id`, `output_dir`).
    - Use these values for all subsequent file paths and command arguments.
    - `re_exploration_plan`: `{output_dir}/exploration-plan.md`
    - `re_report`: `{output_dir}/re-report.md`
    - `re_project_name`: name of the project to reverse engineer.

2.  **Synthesis items**: Read the entire `re_report` (`{output_dir}/re-report.md`). Find all lines that contain a link to a detailed report (e.g., `- [x] <Task> - [Link to detailed report](./<output_file_name>.md)`).
3.  **Process item**: For each found line, read the contents of the referenced `<output_file_name>.md`. Then, **replace** the entire line containing the link in `re_report.md` with the full contents of that file. 
    - **CRITICAL REQUIREMENT**: Do this replacement in-place within the original `{output_dir}/re-report.md` file. Do NOT create a new file (e.g., `re-report-final.md`).

4.  **Polish**: Spawn a 'bmad-party-mode' with subagent to check for consistency, tone, and logical flow.

5.  **Finalize**: Update YAML `status: "complete"`.

## Completion

Present the final path to the user (`{re_output_folder}/re-report.md`).
