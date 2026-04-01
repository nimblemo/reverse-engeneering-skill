# 02-refinement

## Overview

Based on the initial ingestion, analyze the project structure and refine the research plan.

## Actions

1.  **Restore Context (CRITICAL)**:
        Open `{report}` (eg. `{project_root}/reports/{project_name}/README.md`)
        Extract all variables from the YAML `context` block (e.g., `{nb_id}`, `{lang_doc}`, `{exploration_plan}`).
   
2.  **Scan for Next Task**: 
        Open `{exploration_plan}` and search for the **next unchecked item** (`[ ]`) **exclusively in Step 1 (or Section 1)**. 
        If all items in Step 1 are checked (`[x]`), jump to the **Analyze Structure** stage.

3.  **Analyze Purpose**: 
        Run command: `node scripts/preprocess.js query {nb_id} "Identify the main purpose and domain of the product. Provide the entire report in {lang_doc} language." {output_dir}/project_brief.md`

4.  **Analyze Structure**: 
        Run command: `node scripts/preprocess.js query {nb_id} "Output the project file tree with a depth of 6 levels. Provide the entire report in {lang_doc} language." {output_dir}/project_tree.md`

5.  **Analyze Tech Stack**: 
        Run command: `node scripts/preprocess.js query {nb_id} "Output a table of structural packages, their purpose, and main functions. Provide the entire report in {lang_doc} language." {output_dir}/project_tech_stack.md`

6.  **Analyze Project Type**: 
        Run command: `node scripts/preprocess.js query {nb_id} "Describe the entry point and the principle of main operating scenarios. Provide the entire report in {lang_doc} language." {output_dir}/project_type.md`

7.  **Read and Cache**: 
        Read the `{output_dir}/project_brief.md` file, summarize it, and update the `{report}` file under `Step 1 Project overview` with heading `#### 1.1 Project Brief`.

8.  **Read and Cache**: 
        Read the `{output_dir}/project_tree.md` file and update the `{report}` file under `Step 1 Project overview` with heading `#### 1.2 Project Structure`. Use the following format as an example:
---

                project-root/
                ├── docs/               # Documentation
                ├── src/                # Source code
                │   ├── main.py
                │   └── utils.py
                ├── tests/              # Tests
                ├── .gitignore
                ├── README.md
                └── requirements.txt
---

9.  **Read and Cache**: 
        Read the `{output_dir}/project_tech_stack.md` file and update the `{report}` under `Step 1 Project overview` with heading `#### 1.3 Technology Stack`. Prefer table format. Provide a short description for each important technology.
        Read the `{output_dir}/project_type.md` file and update the `{report}` under `Step 1 Project overview` with heading `#### 1.4 Project Type`.

10. **Dialogue: Subsystems Selection (MANDATORY)**:
**Phase 1**: Proposal Analyze: `Step 1 Project overview` in `{report}` and take **Checklist** of possible subsystems:
---
        [ ] **Core / Domain Layer** — business logic, with code examples
        [ ] **API / Interface Layer** — REST / gRPC / GraphQL / CLI, with code examples
        [ ] **Storage / Persistence** — ORM, DB schema, migrations, with code examples
        [ ] **Messaging / Events** — queues, pub-sub, event sourcing, with code examples
        [ ] **Auth / AuthZ** — authentication, authorization, roles, with code examples
        [ ] **Caching** — caching strategy, TTL, invalidation, with code examples
        [ ] **Observability** — logging, metrics, tracing, with code examples
        [ ] **Configuration Management** — config, secrets, environments, with code examples
        [ ] **Background Jobs / Schedulers**, with code examples
        [ ] **External Integrations** — third-party APIs, SDKs, with code examples
---

**Phase 2**: Wait user Confirmation**: **STOP EXECUTION**.
Present the **Checklist** the user **Requirement**: For each item marked `[x]`, provide a 1-sentence justification based on your analysis of the `{report}`. The agent **MUST** wait for the user to confirm the list or provide **Checklist**.

**Phase 3: Implementation**:
After **USER CONFIRMATION**, edit `{exploration_plan}` at the `### Step 4 Subsystems investigation` section.
For each user selected subsystem, insert the following template (replacing `{Subsystem Name}` with the actual name)

---
        ### {Subsystem Name}

        [ ] {Subsystem Name}: What business problem does it solve? Internal structure: classes, functions, modules and their relationships, behavior. Output as tables, diagrams!
        [ ] {Subsystem Name}: Lifecycle, Configuration, Interconnections, main partners. Output as tables and diagrams.
---

11. **Dialogue: Core Features Selection (MANDATORY)**:
**Phase 1: Proposal**:
        Analyze `{report}` to identify unique core features or innovations. Take List 3-5 key features for potential deep investigation.
        **Requirement**: For each feature marked `[x]`, provide a `{reason}` why its technical implementation is non-trivial or critical.
        **Format** request for user:

---
        [x] {Core Feature 1 Name} - {reason}
        [x] {Core Feature 2 Name} - {reason} 
---

**Phase 2: Wait & Confirm**: **STOP EXECUTION**. 
        Wait for the user to select, add, or remove features from the formatted list of questions.
**Phase 3: Implementation**:
        After confirmation, update `{exploration_plan}` under the `### Step 1 Project overview` section. Do NOT create a duplicate section or sub-section like "Detailed Features".
        Add an entry for each validated feature using the following format (incrementing the index starting from 1.5):

---
        #### 1.X Feature: {Feature Name}

        [ ] Conduct a deep technical investigation of {Feature Name}. Architecture, detailed data flows, entities and it responsibilities. You **MUST** include relevant Mermaid diagrams (e.g., sequence, state, class, or flowcharts) to visualize the logic, along with step-by-step algorithm descriptions and core data structures used.
---

12. **Clean up**: Run script `node scripts/preprocess.js clean --target {sources_dir} --clean-artefacts`

13. **Update Cache**: Update `{report}` (eg. `{project_root}/reports/{project_name}/README.md`) - Set `status: "refinement"`. 

14. **Progression**: When the plan is confirmed (or auto-selected in headless), move to `./references/03-exploration.md`.
