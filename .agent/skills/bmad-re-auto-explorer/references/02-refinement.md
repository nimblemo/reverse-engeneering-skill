# 02-refinement

## Overview

Based on the initial ingestion, analyze the project structure and refine the research plan.

## Actions

1.  **Restore Context (CRITICAL)**:
    - Open `{re_output_folder}/re-report.md`.
    - Extract all variables from the YAML `context` block (e.g., `nb_id`, `output_dir`).
    - Use these values for all subsequent file paths and command arguments.
    - `re_exploration_plan`: `{output_dir}/exploration-plan.md`
    - `re_report`: `{output_dir}/re-report.md`

2.  **Scan for Next Task**: Open `{re_exploration_plan}` and search for the **next unchecked item** (`- [ ]`) **exclusively in Step 1 (or Section 1)**. If all items in Step 1 are checked (`[x]`), jump to the **Analyze Structure** stage.

3.  **Analyze Purpose**: Run command:
    `uv run --with gitpython scripts/preprocess.py query {nb_id} "Определи основное назначение и предметную область продукта" {output_dir}/project_brief.md`

4.  **Analyze Structure**: Run command:
    `uv run --with gitpython scripts/preprocess.py query {nb_id} "Выведи дерево файлов проекта с глубиной 3 уровня" {output_dir}/project_tree.md`

5.  **Analyze Tech Stack**: Run command:
    `uv run --with gitpython scripts/preprocess.py query {nb_id} "Выведи таблицу структурных пакетов, их предназначение и основные функции" {output_dir}/project_tech_stack.md`

6.  **Analyze Project Type**: Run command:
    `uv run --with gitpython scripts/preprocess.py query {nb_id} "Опиши точку входа, принцип основных сценариев работы" {output_dir}/project_type.md`

7.  **Read and Cache**:
    - Read the `{output_dir}/project_brief.md` file summarize it and update the `re-report.md` file under `Step 1 Project overview with heading#### 1.1 Project Brief`.
8.  **Read and Cache**
    - Read the `{output_dir}/project_tree.md` file and update the `re-report.md` file under Step 1 Project overview with heading `#### 1.2 Project Structure`. With format like example:

    ```text
        project-root/
        ├── docs/               # Documentation
        ├── src/                # Source code
        │   ├── main.py
        │   └── utils.py
        ├── tests/              # Tests
        ├── .gitignore
        ├── README.md
        └── requirements.txt
    ```

9.  **Read and Cache**
    - Read the `{output_dir}/project_tech_stack.md` file and update the `re-report.md` file under Step 1 Project overview with heading `#### 1.3 Technology Stack`. Prefer table format. Short description for each important technology.
    - Read the `{output_dir}/project_type.md` file and update the `re-report.md` file under Step 1 Project overview with heading `#### 1.4 Project Type`.

10. **Create plan**: Copy `{base_plan}` to `{output_dir}/exploration-plan.md`

11. **Dialogue: Subsystems Selection (MANDATORY)**:
    - **Phase 1: Proposal**:
      - Analyze `Step 1 Project overview` in `re-report.md`.
      - Present the checklist below to the user.
      - **Requirement**: For each item marked `[x]`, provide a 1-sentence justification based on your analysis of the `re-report.md`.
      - **Checklist**:
        ```text
        - [ ] **Core / Domain Layer** — business logic, с примерами кода
        - [ ] **API / Interface Layer** — REST / gRPC / GraphQL / CLI, с примерами кода
        - [ ] **Storage / Persistence** — ORM, DB schema, migrations, с примерами кода
        - [ ] **Messaging / Events** — queues, pub-sub, event sourcing, с примерами кода
        - [ ] **Auth / AuthZ** — authentication, authorization, roles, с примерами кода
        - [ ] **Caching** — caching strategy, TTL, invalidation, с примерами кода
        - [ ] **Observability** — logging, metrics, tracing, с примерами кода
        - [ ] **Configuration Management** — config, secrets, environments, с примерами кода
        - [ ] **Background Jobs / Schedulers**, с примерами кода
        - [ ] **External Integrations** — third-party APIs, SDKs, с примерами кода
        ```
    - **Phase 2: Wait & Confirm**:
      - **STOP EXECUTION**. The agent MUST wait for the user to confirm the list or provide modifications.
    - **Phase 3: Implementation**:
      - After confirmation, edit `exploration-plan.md` at the `### Step 4 Subsystems investigation` section.
      - For each selected subsystem, insert the following template (replacing `{Subsystem Name}` with the actual name):

      ```markdown
      ### {Subsystem Name}

      - [ ] {Subsystem Name} Какую бизнес-задачу решает? Внутренняя структура: классы, функции, модули и их взаимосвязи, поведение. Оформи таблицу, диаграммы?
      - [ ] {Subsystem Name} Жизненный цикл, Конфигурация: параметры, переменные окружения, значения по умолчанию. Каналы взаимодействия, основные партнеры, выведи таблицы, диаграммы.
      ```

12. **Dialogue: Core Features Selection (MANDATORY)**:
    - **Phase 1: Proposal**:
      - Analyze `re-report.md` to identify unique core features or innovations.
      - List 3-5 key features for potential deep investigation.
      - **Requirement**: For each feature marked `[x]`, provide a reason why its technical implementation is non-trivial or critical.
      - **Format**:
        ```text
        - [x] {Core Feature 1 Name} - (Reason)
        - [x] {Core Feature 2 Name} - (Reason)
        ```
    - **Phase 2: Wait & Confirm**:
      - **STOP EXECUTION**. Wait for the user to select, add, or remove features from the list.
    - **Phase 3: Implementation**:
      - After confirmation, update `exploration-plan.md` under the `### Step 1 Project overview` section. Do NOT create a duplicate section or sub-section like "Detailed Features".
      - Add an entry for each validated feature using the following format (incrementing the index starting from 1.5):

      ```markdown
      #### 1.X Feature: {Feature Name}

      - [ ] Conduct a deep technical investigation of {Feature Name}. Provide a comprehensive breakdown including its architecture, detailed data flow, and key components. You MUST include relevant Mermaid diagrams (e.g., sequence, state, class, or flowcharts) to visualize the logic, along with step-by-step algorithm descriptions and core data structures used.
      ```

13. **clean up** Run `uv run --with gitpython scripts/preprocess.py clean --target {output_dir} --clean-artefacts`

## Update Cache

Update `re-report.md`:

- Set `status: "refinement"`.

## Progression

When the plan is confirmed (or auto-selected in headless), move to `./references/03-exploration.md`.
