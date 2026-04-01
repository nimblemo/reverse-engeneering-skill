# 01-initialization

## Actions

1. **Define Inputs (Sourced from `config.yaml`)**:

- `{repo_url}`: URL of the repository to reverse engineer.
- `{project_root}`: root directory of the project.
- `{project_name}`: name of the project to reverse engineer.
- `{base_plan}`: path to the base research plan file.
- `{lang_com}`: language of the codebase.
- `{lang_doc}`: language of the documentation.
- `{max_sources}`: Maximum number of sources to import (default: 50).
- `{chanking_type}`: Chanking type (default: 'v1').

2. **Validate**:
**STOP EXECUTION (MANDATORY)**: Прочитай `config.yaml`, извлеки все переменные и выведи их список оператору. 
Используй инструмент `AskUserQuestion`, чтобы представить список и дождаться подтверждения (кнопки "Confirm" / "Edit"). 
**ЗАПРЕЩЕНО** переходить к следующему шагу без явного подтверждения от пользователя. `[ ]`

2. **Create plan**: Read content from `{base_plan}` and write it to the file on a `{lang_doc}` language in the directory `{project_root}/reports/{project_name}/exploration-plan.md`.

3. **Establish Cache**: Create `{project_root}/reports/{project_name}/README.md` with the following structure and markdowwn content should be translated on `{lang_doc}` language (Exept YAML block):

        ```markdown
                
                ```
                status: "initialization"    #never translate this block
                context:
                project_name: "{project_name}"
                repo_url: "{repo_url}"
                nb_id: "{nb_id}"
                output_dir: "{project_root}/reports/{project_name}"
                sources_dir: "{project_root}/sources/{project_name}"
                exploration_plan: "{project_root}/reports/{project_name}/exploration-plan.md"
                report: "{project_root}/reports/{project_name}/README.md"
                max_sources: "{max_sources}"
                lang_com: "{lang_com}"
                lang_doc: "{lang_doc}"
                chanking_type: "{chanking_type}"
                created: "{timestamp}"
                        
                ```
                
                # Reverse Engineering Report: {project_name} //should be translated on {lang_doc} language

                ### Step 1 Project overview // should be translated on {lang_doc} language
        ```

4. **Preprocessing**: Run command: `node scripts/preprocess.js prep --keep --repo_url {repo_url} --json --output_dir {sources_dir} --max_sources {max_sources} --type {chanking_type}`

5. **Create Notebook**: Run command `node scripts/preprocess.js create "RE: {project_name}"`. Note the `{nb_id}` from the output.

6. **Import Sources**: Run command: `node scripts/preprocess.js upload {nb_id} {sources_dir}/.tree/`

7. **Progression**:  Once sources are ingested and report initialized, proceed to `./references/02-refinement.md`.