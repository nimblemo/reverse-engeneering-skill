# 04-synthesis-documentation

## Overview

Consolidate findings into a professional technical document.

## Actions

1. **Restore Context (CRITICAL)**:
        Open `{report}`. (eg. `{project_root}/reports/{project_name}/README.md`)
        Extract all variables from the YAML `context` block (e.g., `{nb_id}`, `{lang_doc}`, `{exploration_plan}`).

2. **Synthesis items**: 
        Read the entire `{report}`. Find all lines that contain a link to a detailed report (e.g., `- [x] <Task> - [Link to detailed report](./<output_file_name>.md)`).

3. **Process item**:
        For each found line, read the contents of the referenced `<output_file_name>.md`. Then, **replace** the entire line containing the link in `{report}` with the full contents of that file. **CRITICAL REQUIREMENT**: Do this replacement in-place within the original `{report}` (eg. `{project_root}/reports/{project_name}/README.md`) file. Do NOT create a new file (e.g., `README-final.md`).

3. **Finalize**: Update YAML `status: "complete"`.

## Completion
    Present the final path to the user (`{report}`).
