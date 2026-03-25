# 03-exploration

## Overview

Autonomous dive into the codebase.

## Actions

1.  **Restore Context (CRITICAL)**:
    - Open `{re_output_folder}/re-report.md`.
    - Extract all variables from the YAML `context` block (e.g., `nb_id`, `output_dir`).
    - Use these values for all subsequent file paths and command arguments.
    - `re_exploration_plan`: `{output_dir}/exploration-plan.md`
    - `re_report`: `{output_dir}/re-report.md`
    - `re_project_name`: name of the project to reverse engineer.

2.  **Scan for Next Task**: Open `{exploration-plan}` and search for the **next unchecked item** (`- [ ]`) in the **entire file**. If all items are checked (`[x]`), jump to the **Progression** stage.

3.  **Sync Structure (CRITICAL)**: Ensure that `{re_report}` contains the same hierarchical structure as `{exploration-plan}`. If the current item is under headings (e.g., `###`, `####`, `#####`) that are not yet in `{re_report}`, append those headers to `{re_report}` in the exact order and with the exact numbering and text found in `{exploration-plan}`. This ensures the output maintains a consistent logical skeleton.

4.  **Execute Deep Query**:
    - Define a `query` based on the text of the current item.
    - Define an `output_file_name` (e.g., `step3_logical_architecture`).
    - Run command: `uv run --with gitpython scripts/preprocess.py query {notebook_id} "<query>" {re_output_folder}/{output_file_name}.md`.

5.  **Save Results**:
    - Read the generated `{re_output_folder}/{output_file_name}.md`.
    - Append a reference to this result into `{re_report}` (e.g., `[x] <item text> - [Link to detailed report](./{output_file_name}.md)`).
    - Mark the item as checked (`[x]`) in `{exploration-plan}`.

6.  **Loop Execution**: Immediately repeat from **Step 2**. **CRITICAL**: Do not terminate the session or wait for user input between items. Continue until the entire `exploration-plan.md` is completed (no more `[ ]` items remain).

## Update Cache

- Set `status: "exploration"` in the YAML frontmatter of `re-report.md`.

## Progression

When all sections and items in `exploration-plan.md` are marked as `[x]`, move to `./references/04-synthesis-documentation.md`.
