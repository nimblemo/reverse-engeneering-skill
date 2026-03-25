# 01-initialization

## Prerequisites

- `nlm` CLI is available.
- `re_repo_url` is provided.
- `re_project_name` is provided.
- `re_output_folder` is provided.
- `re_sources_folder` is provided.
- `re_base_plan` is provided.
- `re_max_sources` is provided.

## Actions

1.  **Define Inputs**:
    - `re_repo_url`: URL of the repository to reverse engineer.
    - `re_project_name`: name of the project to reverse engineer.
    - `communication_language`: Language for communication (default: English).
    - `document_output_language`: Language for the output document (default: English).
    - `re_output_folder`: Folder to store the output (default: `{project-root}/reports/{re_project_name}`).
    - `re_sources_folder`: Folder to store the sources (default: `{project-root}/sources/{re_project_name}`).
    - `re_base_plan`: Path to the base research plan (default: `{project-root}/research-plan.md`).
    - `re_max_sources`: Maximum number of sources to import (default: 45).

2.  **Preprocessing**: Run `scripts/preprocess.py` using `uv run --with gitpython` with arguments:

    ```bash
        prep --repo_url {re_repo_url} --json --output_dir {re_sources_folder} --max_sources {re_max_sources}
    ```

3.  **Create Notebook**: Run command `uv run --with gitpython scripts/preprocess.py create "RE: {re_project_name}"`.
    - Note the `nb_id` from the output. Save it in the `re-report.md` file.

4.  **Import Sources**: Run command:
    `uv run --with gitpython scripts/preprocess.py upload {nb_id} {re_sources_folder}`

5.  **Establish Cache**: Create `{re_output_folder}/re-report.md` with the following structure:

```yaml
---
status: "initialization"
context:
  project_name: "{re_project_name}"
  repo_url: "{re_repo_url}"
  nb_id: "{nb_id}"
  output_dir: "{re_output_folder}"
  sources_dir: "{re_sources_folder}"
  base_plan: "{re_base_plan}"
  max_sources: "{re_max_sources}"
  lang_comm: "{communication_language}"
  lang_doc: "{document_output_language}"
created: "{timestamp}"
---
# Reverse Engineering Report: {re_project_name}

### Step 1 Project overview
```

## Progression

Once sources are ingested and report initialized, proceed to `./references/02-refinement.md`.
