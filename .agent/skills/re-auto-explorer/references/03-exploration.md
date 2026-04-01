# 03-exploration

## Overview Autonomous dive into the codebase.

## Action Steps

1. **Restore Context (CRITICAL)**:
        Open `{report}`. (eg. `{project_root}/reports/{project_name}/README.md`)
        Extract all variables from the YAML `context` block (e.g., `{nb_id}`, `{lang_doc}`, `{exploration_plan}`).

2. **Scan for Next Task** 
        Open `{exploration_plan}` and search for the **next unchecked item** (`[ ]`) in the **entire file**. If all items are checked (`[x]`), jump to the **Progression** stage.

3. **Process Section Header**: 
        If the next unchecked item belongs to a new section (e.g., `### Step 3: System Architecture`) that hasn't been added to `{report}` yet, append that section heading to `{report}`.    

4. **Execute Deep Query**:
        Define a `{query}` based on the text of the current item, Define an `{output_file_name}` (e.g., `3_logical_architecture`).
        Run command: `node scripts/preprocess.js query {nb_id} "{query}" {output_dir}/{output_file_name}.md`. And Wait the response.

5. **Save Results**:
        `Read the generated `{output_dir}/{output_file_name}.md`.
        Append a reference to this result into `{report}` (e.g., `[x] <item text> - [Link to detailed report](./{output_file_name}.md)`).
        Mark the item as checked (`[x]`) in `{exploration_plan}`.`

6. **Loop Execution**: 
        Immediately repeat from **Step 2. of Action Steps**. 
        **CRITICAL**: Do not terminate the session or wait for user input between items. Continue until the entire `{exploration_plan}` is completed (no more `[ ]` items remain)

7. **Update Cache**: 
        Set `status: "exploration"` in the YAML frontmatter of `{report}` (eg. `{project_root}/reports/{project_name}/README.md`)

8. **Progression**  
        When all sections and items in `{exploration_plan}` are marked as `[x]`, move to `./references/04-synthesis-documentation.md`.
