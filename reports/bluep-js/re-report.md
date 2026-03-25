---
status: "complete"
context:
  project_name: "bluep-js"
  repo_url: "https://github.com/bluep-js/vm"
  nb_id: "3b0245e9-7e86-442f-870f-92bbf214f922"
  output_dir: "c:\\WORK\\RaD\\reverse-engeneering\\reports\\bluep-js"
  sources_dir: "c:\\WORK\\RaD\\reverse-engeneering\\sources\\bluep-js"
  base_plan: "c:\\WORK\\RaD\\reverse-engeneering\\fast-research.md"
  max_sources: "50"
  lang_comm: "Russian"
  lang_doc: "Russian"
created: "2026-03-25"
---
# Отчет об обратной разработке: bluep-js

### Step 1 Project overview

#### 1.1 Project Brief
Продукт `@bluepjs/vm` представляет собой **виртуальную машину для выполнения блюпринтов** (blueprints) системы `@bluepjs`. Он не является самостоятельным приложением, не хранит библиотеки и состояния автономно, а специально разработан для интеграции в другие проекты. Виртуальная машина выполняет алгоритмы, составленные из «узлов» (Nodes) — базовых блоков операций, и может работать как в серверной среде (Node.js), так и в браузере.

Продукт относится к сфере **визуального (графового/узлового) программирования**. В документации он характеризуется как «псевдо-типизированная» система программирования ("pseudo-typed" programming system). Для создания логики и управления компонентами используется официальная графическая среда разработки (IDE), которой виртуальная машина передает всю информацию о доступных узлах, типах данных, модулях и библиотеках.

На практике виртуальная машина предназначена для управления "акторами" (Actors) — внешними объектами, которые подчиняются её логике. Благодаря своей универсальности, предметная область применения продукта может охватывать различные сферы разработки:
- **Интернет вещей (IoT):** управление и написание логики для IoT-устройств.
- **Сетевое взаимодействие и коммуникация:** координация комнат веб-сокетов (WebSockets) и управление событиями чат-ботов.
- **3D-веб-разработка:** управление поведением 3D-объектов на сценах WebGL в браузере.

#### 1.2 Project Structure
```text
bluep-js/
├── LICENSE.md
├── README.md
├── package-lock.json
├── package.json
└── src/
    ├── context.js          # Управление контекстом выполнения
    ├── graph.js            # Графовая модель выполнения
    ├── index.js            # Точка входа, экспорт Vm и абстракций
    ├── types.js            # Базовые типы данных
    ├── utils.js            # Утилиты (клонирование, комбинирование)
    ├── vm.js               # Основной класс виртуальной машины
    ├── module/
    │   ├── abstract.js     # Базовый интерфейс AbstractModule
    │   ├── actor.js        # Менеджер акторов
    │   ├── core.js         # Обработка базовых событий ядра
    │   ├── cron.js         # Планировщик по cron-выражениям
    │   └── actor/          # Реализации акторов
    └── nodes/
        ├── abstract.js      # Базовый класс AbstractNode
        ├── index.js        # Индекс узлов
        ├── array/          # Операции с массивами
        ├── boolean/        # Логические операции
        ├── branches/       # Ветвления и циклы (If, Switch, For)
        ├── class/          # Работа с классами
        ├── color/          # Операции с цветом
        ├── datetime/       # Время и даты
        ├── enum/           # Перечисления
        ├── execute/        # Управление потоком выполнения
        ├── float/          # Числа с плавающей точкой
        ├── math/           # Математические операции
        ├── number/         # Числовые операции
        ├── string/         # Строковые операции
        ├── struct/         # Структуры
        ├── undefined/      # Неопределенные значения
        └── variable/       # Переменные
```

#### 1.3 Technology Stack
| Компонент | Назначение | Описание |
| :--- | :--- | :--- |
| **Core (Ядро VM)** | Движок выполнения | Инициализация и управление жизненным циклом виртуальной машины (запуск, остановка, управление библиотеками) в классе `Vm`. Выполнение графов и узлов (`graph.js`). Управление контекстом выполнения (`context.js`). |
| **Modules** | Интеграция и расширение | Базовый интерфейс `AbstractModule`. Включает стандартные модули: `core` (события ядра), `cron` (планировщик), `actor` (менеджер акторов). |
| **Actors** | Управление внешними объектами | Интерфейс `AbstractActor` для интеграции внешних объектов (веб-сокеты, IoT, 3D-объекты). Системные узлы: `ActorGet`, `ActorMethod`, `ActorState`. |
| **Nodes** | Блоки операций | Базовый класс `AbstractNode`. Встроенная библиотека узлов для массивов, логики, математики, строк, ветвлений, классов, цветов, дат и переменных. |
| **Graph Engine** | Исполнение алгоритмов | Создание графа узлов, выполнение в цикле `while (next)`, маршрутизация потока по слотам, поддержка ветвлений и циклов. |

#### 1.4 Project Type
Виртуальная машина для визуального (графового) программирования. Основной точкой входа является класс `Vm`, экспортируемый из главного модуля вместе с абстрактными классами `AbstractNode`, `AbstractModule`, `AbstractActor`.

**Жизненный цикл:**
- Асинхронные методы `start()` и `stop()` для управления VM и модулями
- Методы `runLibraryFunction`, `runLibraryConstructor`, `runLibraryMethod` для запуска сценариев

**Принцип работы:**
1. Инициализация графа и создание экземпляра `Graph`
2. Создание изолированного контекста `Context` для хранения данных выполнения
3. Цикл выполнения `while (next)` — выборка и выполнение узлов
4. Подготовка данных через `prepareAndExecute` — сбор входов от родительских узлов
5. Выполнение бизнес-логики узла в методе `execute(inputs)`
6. Маршрутизация потока по возвращаемому слоту (например, `'return'`, `'ifTrue'`)
7. Поддержка ветвлений и циклов через `executeBranch`

### Step 2 System Architecture investigation

#### 2.1 Domain Boundaries
Виртуальная машина `@bluepjs/vm` реализует единственный ограниченный контекст (Bounded Context) — **Blueprint Execution Engine**. Продукт не имеет внешних зависимостей и предназначен для встраивания в хост-приложения.

#### 2.2 Module Structure (C4 L3)

```mermaid
flowchart TD
    VM["Vm - Главный класс"]

    subgraph Core
        VM --> Utils["Utils - клонирование, слияние классов"]
        VM --> Types["Base Types - описание типов для IDE"]
    end

    subgraph Execution_Engine
        VM --> Graph["Graph - Парсер и исполнитель"]
        Graph --> Context["Context - Изолированная память"]
    end

    subgraph Modules_System
        VM --> M_Abstract["AbstractModule"]
        M_Abstract --> M_Core["Core Module - Базовые события"]
        M_Abstract --> M_Cron["Cron Module - Планировщик"]
        M_Abstract --> M_Actor["Actor Module - Менеджер акторов"]
    end

    subgraph Nodes_Library
        VM --> N_Abstract["AbstractNode"]
        N_Abstract --> N_Base["Встроенные ноды - Array, Math, String"]
        N_Abstract --> N_Control["Управление потоком - If, For, Call"]
        N_Abstract --> N_Actor["Узлы акторов - ActorGet, ActorMethod"]
    end
```

#### 2.3 System Context Diagram (C4 L1)

```mermaid
C4Context
    title C4 Level 1: Context Diagram for @bluepjs/vm

    Person(hostApp, "External App / IDE", "Хост-приложение (Node.js или Browser). Хранит библиотеки, управляет конфигурацией.")
    System(vm, "@bluepjs/vm", "Виртуальная машина. Выполняет блюпринты, маршрутизирует логику.")
    System_Ext(actors, "Внешние объекты (Actors)", "IoT-устройства, WebSockets, 3D WebGL объекты.")

    Rel(hostApp, vm, "Предоставляет графы (блюпринты), инициирует запуск", "API / JS")
    Rel(vm, actors, "Отслеживает события, изменяет состояние", "JS / Events")
    Rel(hostApp, actors, "Опционально управляет напрямую")
```

#### 2.4 Container Diagram (C4 L2)

```mermaid
C4Container
    title C4 Level 2: Container Diagram

    Person(hostApp, "External App / IDE", "Инициирует запуск")

    System_Boundary(vm_system, "@bluepjs/vm Architecture") {
        Container(vmCore, "VM Core (vm.js)", "JS Class", "Главный контроллер жизненного цикла, модулей и узлов. Запускает функции.")
        Container(graphMgr, "Graph Engine (graph.js)", "JS Class", "Движок выполнения графа. Отвечает за обход узлов и маршрутизацию.")
        Container(contextMgr, "Context (context.js)", "JS Class", "Изолированное состояние выполнения (входы, выходы, переменные).")
        Container(nodeLib, "Nodes Library", "JS Classes", "Встроенные узлы (Math, String, Logic, Branches и т.д.). Реализуют AbstractNode.")
        Container(moduleMgr, "Modules Library", "JS Classes", "Расширения (Core, Cron, Actor). Слушают внешние события.")
    }

    System_Ext(actors, "Actors", "Внешние объекты")

    Rel(hostApp, vmCore, "Вызывает runLibraryFunction() / start()")
    Rel(vmCore, moduleMgr, "Инициализирует расширения")
    Rel(vmCore, graphMgr, "Создает экземпляр для выполнения блюпринта")
    Rel(graphMgr, contextMgr, "Создает и наполняет контекст")
    Rel(graphMgr, nodeLib, "Инстанцирует и вызывает узлы")
    Rel(nodeLib, contextMgr, "Читает входы, пишет выходы")
    Rel(moduleMgr, actors, "Регистрирует и управляет (через ActorModule)")
```

#### 2.5 Data Flow Diagram (DFD L0)

```mermaid
flowchart TD
    ExtApp(["External Application"])
    VMCore["VM (runLibraryFunction)"]
    GraphInst["Graph Instance"]
    CtxInst[/"Context (State)"/]
    NodeInst["AbstractNode (execute)"]

    ExtApp -- "1. ID библиотеки, ID функции, Входные данные (Inputs)" --> VMCore
    VMCore -- "2. Структура графа (JSON)" --> GraphInst
    GraphInst -- "3. Создание изолированного контекста" --> CtxInst
    GraphInst -- "4. Передача внешних Inputs" --> CtxInst

    subgraph Execution Loop
        GraphInst -- "5. Запрос следующего NodeID" --> NodeInst
        NodeInst -- "6. Чтение выходов предыдущих узлов (getOutput)" --> CtxInst
        CtxInst -- "Возврат значений" --> NodeInst
        NodeInst -- "7. Выполнение логики узла" --> NodeInst
        NodeInst -- "8. Запись результатов узла (setOutput)" --> CtxInst
        NodeInst -- "9. Возврат имени слота (напр. 'result', 'ifTrue')" --> GraphInst
        GraphInst -- "10. Поиск следующего NodeID по связям слота" --> GraphInst
    end

    GraphInst -- "11. Сбор итоговых Outputs из Context" --> VMCore
    VMCore -- "12. Возврат результата" --> ExtApp
```

#### 2.6 Domain Language Glossary

| Термин | Описание |
| :--- | :--- |
| **Blueprint** | JSON-структура, описывающая граф узлов и связи между ними |
| **Node** | Базовый блок операции в графе. Имеет входы (inputs), выходы (outputs) |
| **Slot** | Конкретный вход или выход узла. Типы: `basic/execute` (поток управления), данные |
| **Connection** | Связь между выходным слотом одного узла и входным слотом другого |
| **Actor** | Внешний объект (IoT, WebSocket, 3D), управляемый VM через AbstractActor |
| **Module** | Расширение VM для обработки событий, планирования, управления акторами |
| **Context** | Изолированное хранилище состояния выполнения одного графа |
| **Pseudo-typed** | Система типов для визуального программирования, описываемая в JSON-типах |

### Step 3 Runtime behavior investigation

#### 3.1 Entry Points

| Метод | Описание |
| :--- | :--- |
| `start()` | Асинхронный запуск VM. Инициализирует модули, устанавливает `_run = true` |
| `stop()` | Асинхронная остановка VM. Останавливает модули, устанавливает `_run = false` |
| `runLibraryFunction(lib, fn, inputs)` | Запуск blueprint-функции из библиотеки |
| `runLibraryConstructor(self, lib, cls, fn, inputs)` | Запуск конструктора класса с передачей `self` |
| `runLibraryMethod(self, lib, cls, fn, inputs)` | Запуск метода класса для объекта `self` |

#### 3.2 Execution Loop (while next)

1. Создание объекта `Context` с входящими аргументами и переменными
2. Определение стартового узла через `entry()`
3. Цикл `while (next)`: вызов `executeNode(nodeId, ctx)`
4. Узел возвращает имя слота (`'return'`, `'ifTrue'` и т.д.)
5. Поиск следующего узла по связям возвращённого слота
6. При отсутствии связей — `next = null`, цикл завершается

#### 3.3 Data Preparation (prepareAndExecute)

Каждый узел перед выполнением собирает данные через `prepareAndExecute()`:
- Итерация по входам (кроме `basic/execute`)
- При наличии связи с другим узлом — рекурсивное выполнение родительского узла
- Чтение результата через `context.getOutput(nodeFrom, slotFrom)`
- Вызов `execute(inputs)` только после сбора всех данных

#### 3.4 Slot Routing

| Узел | Возвращаемые слоты |
| :--- | :--- |
| Математические, строковые | `'return'` |
| Условие `If` | `'ifTrue'`, `'ifFalse'` |
| Цикл `For` | `'body'`, `'done'` |
| Конструкция `Switch` | Множественные case-слоты |

#### 3.5 Branches and Cycles (executeBranch)

- Циклы (`For`, `Each`) используют `callOutput('body')` для выполнения тела цикла
- `executeBranch` запускает вложенный цикл `while (next)` для переданной ветки
- При завершении ветки управление возвращается в родительский узел

#### 3.6 Sequence Diagram

```mermaid
sequenceDiagram
    autonumber
    actor App as Host Application
    participant VM as Vm Engine
    participant G as Graph Instance
    participant C as Context
    participant N1 as Execute Node (e.g. CallFunction)
    participant N2 as Modifier Node (e.g. Math/Get)

    App->>VM: runLibraryFunction(lib, fn, inputs)
    VM->>G: new Graph(), load(blueprint structure)
    VM->>G: execute(inputs)
    G->>C: new Context(vm, self)
    C-->>G: (context initialized)

    rect rgb(240, 240, 250)
        Note right of G: Main Execution Loop: while(next)
        G->>N1: executeNode(nodeId, context)
        N1->>N1: prepareAndExecute()

        opt Data dependencies resolution
            Note right of N1: Checks input connections
            N1->>G: executeNode(parentNode, context)
            G->>N2: prepareAndExecute()
            N2->>N2: execute(inputs)
            Note right of N2: Calculates math / reads variables
            N2->>C: setOutput(slot, value)
            N2-->>G: returns undefined (no execute slots)
            G-->>N1: parent node executed
            N1->>C: getOutput(parent, slot)
            C-->>N1: value
        end

        N1->>N1: execute(resolved_inputs)
        Note right of N1: Performs main node logic
        N1->>C: setOutput(node_results)
        N1-->>G: returns "return" (or "ifTrue", etc.)
    end

    G->>G: next = find node connected to nextSlot
    Note right of G: Loop repeats until next is null

    G->>C: collect final graph outputs
    G-->>VM: getResult()
    G-->>App: final return values
  
  ```

#### 3.7 Data Flow Diagram (DFD L1)

```mermaid
  flowchart TD
      Inputs([Входящие параметры / События])
      Outputs([Итоговый результат])

      VMCore("1. Vm.runLibraryFunction")
      GraphInit("2. Graph.execute")
      NodePrep("3. Node.prepareAndExecute")
      NodeExec("4. Node.execute")
      GraphRout("5. Маршрутизация - Graph while loop")

      CtxInputs["(Context: Inputs & Variables)"]
      CtxOutputs["(Context: Node Outputs)"]

      Inputs --> VMCore
      VMCore -->|Структура графа| GraphInit
      GraphInit -->|Инициализация начальных данных| CtxInputs

      GraphInit -->|Запуск entry node| NodePrep

      NodePrep -->|Запрос зависимостей| GraphRout
      NodePrep <-->|Чтение данных getOutput| CtxOutputs
      CtxInputs -->|Чтение переменных| NodePrep

      NodePrep -->|Подготовленные Inputs| NodeExec
      NodeExec -->|Запись промежуточных результатов| CtxOutputs
      NodeExec -->|Возврат выходного слота| GraphRout

      GraphRout -->|Определение следующего Node ID| NodePrep
      GraphRout -->|Если next = null, сбор выходов| Outputs
```

#### 3.8 State Machine Diagrams

**3.8.1 VM State Machine (Жизненный цикл виртуальной машины)**

```mermaid
stateDiagram-v2
    direction LR

    [*] --> created : new Vm()

    created --> running : start()
    note right of running : _run = true<br/>modules.start()

    running --> stopped : stop()
    note right of stopped : _run = false<br/>modules.stop()

    stopped --> running : start()

    stopped --> [*] : Очистка памяти
```

**3.8.2 Graph Execution State (Состояния выполнения графа)**

```mermaid
stateDiagram-v2
    direction TB

    [*] --> idle : new Graph() & load()

    idle --> preparing : execute(inputs)

    state preparing {
        [*] --> check_inputs
        check_inputs --> node_ready : Все данные в Context
    }

    preparing --> waiting_for_data : Требуются данные от родительского узла     
    waiting_for_data --> preparing : Родительский узел вычислен (getOutput)     

    preparing --> executing : execute(inputs)

    executing --> routing : Узел возвращает имя слота (напр. 'return')
    executing --> error : this.error() / Exception

    routing --> preparing : Найден следующий узел (next)
    routing --> completed : next = null (Нет связей)

    completed --> [*] : getResult()
    error --> [*] : Остановка потока
```

**3.8.3 Actor State Machine (Жизненный цикл актора)**

```mermaid
stateDiagram-v2
    direction TB

    [*] --> disconnected : new CustomActor()

    disconnected --> registered : addActor(actor)
    note right of registered : actor.vm(this._vm)<br/>Добавление в _actors      

    registered --> active : updateActorsEventsIndex()
    note right of active : actor.on('event')<br/>Подписка на события

    active --> active : emit() -> runLibraryFunction()

    active --> error : Ошибка интерфейса / Некорректные данные
    error --> disconnected : removeActor(actor)

    active --> disconnected : removeActor(actor)
    registered --> disconnected : removeActor(actor)

    note left of disconnected : actor.vm(null)<br/>removeAllListeners()
```

**3.8.4 CronModule State (Состояния планировщика)**

```mermaid
stateDiagram-v2
    direction LR

    [*] --> idle : Модуль инициализирован

    idle --> scheduling : start()
    note right of scheduling : setInterval(200ms)<br/>Проверка изменений времени

    scheduling --> executing : checkCrons() нашел совпадение
    note right of executing : runLibraryFunction(...)

    executing --> scheduling : Функция отправлена в VM

    scheduling --> idle : stop()
    note left of idle : clearInterval()
```

### 4.1 Core / Domain Layer (Ядро VM)

#### 4.1.1 Бизнес-задача ядра VM
Ядро решает задачу **изолированного выполнения визуальных программ (блюпринтов)**, транслируя графовую модель в последовательные асинхронные вызовы JavaScript.

**Ключевые аспекты:**
- **Встраиваемость:** VM не работает как самостоятельное приложение, встраивается в хост-приложение (Node.js или браузер)
- **Слабая связность (Agnostic):** Ядро не заботится о валидности библиотек — эта задача перекладывается на IDE
- **Масштабируемость:** Можно запустить множество независимых инстансов VM с разными конфигурациями

#### 4.1.2 Классы ядра

| Класс | Назначение |
|:------|:-----------|
| **Vm** (`src/vm.js`) | Оркестратор. Управляет реестрами (модули, типы, узлы), хранит загруженные библиотеки графов |
| **Graph** (`src/graph.js`) | Движок выполнения. Отвечает за обход графа, связывание узлов, разрешение зависимостей |
| **Context** (`src/context.js`) | Состояние (Memory Sandbox). Изолированная "песочница" памяти для выполнения графа |

#### 4.1.3 Ключевые свойства Vm

| Свойство | Описание |
|:--------|:--------|
| `_libraries` | Объект с загруженными библиотеками блюпринтов |
| `_types`, `_nodes`, `_modules` | Реестры базовых типов, классов узлов и активных модулей |
| `_run` | Булевый флаг состояния активности VM |
| `_console` | Объект логгера (по умолчанию `console`) |

#### 4.1.4 Конфигурация VM

| Параметр | Значение по умолчанию | Описание |
|:---------|:--------------------|:---------|
| `debug` | `false` | Флаг включения отладочной информации |
| `_libraries` | `null` | Хранилище для загруженных графов |
| `_run` | `false` | Машина создается остановленной |
| `_modules` | CoreModule, CronModule, ActorModule | Автоматически инициализируются базовые модули |

#### 4.1.5 Жизненный цикл VM

| Состояние | Переход | Описание |
|:---------|:--------|:---------|
| created | `new Vm()` | Машина создана, загружены реестры, запуски блокируются |
| running | `start()` | `_run = true`, модули запускают фоновые процессы |
| running | `stop()` | `_run = false`, модули останавливают фоновые процессы |
| stopped | `start()` | Повторный запуск |
| stopped | `Очистка памяти` | Уничтожение инстанса |

#### 4.1.6 Точки входа (Entry Points)

| Метод | Назначение |
|:------|:-----------|
| `runLibraryFunction(lib, fn, inputs)` | Стандартный запуск функции |
| `runLibraryConstructor(self, lib, cls, fn, inputs)` | Запуск конструктора класса |
| `runLibraryMethod(self, lib, cls, fn, inputs)` | Запуск метода ООП-класса |

#### 4.1.7 Диаграмма взаимодействия Core-компонентов

```mermaid
sequenceDiagram
    autonumber
    participant Host as Host App
    participant VM as Vm (vm.js)
    participant G as Graph (graph.js)
    participant C as Context (context.js)
    participant N1 as Node 1 (Entry)
    participant N2 as Node 2 (Logic)

    Host->>VM: runLibraryFunction(lib, fn, inputs)
    VM->>VM: Check `_run` flag
    VM->>G: new Graph(), load(blueprint)
    VM->>G: execute(inputs)

    G->>C: new Context(vm, self)
    C-->>G: context initialized
    G->>G: let next = entryNode()

    rect rgb(240, 240, 250)
        Note right of G: while (next) loop
        G->>N1: executeNode(next, ctx)
        N1->>C: setOutput(slot, value)
        N1-->>G: returns "return" (nextSlot)

        G->>G: find edge for "return"
        G->>G: next = edge.to.node (Node 2)

        G->>N2: executeNode(next, ctx)
        N2->>C: getOutput(Node1, slot)
        C-->>N2: value
        N2->>C: setOutput(slot, new_value)
        N2-->>G: returns "return"

        G->>G: find edge for "return"
        G->>G: next = null (No connections)
    end

    G-->>VM: getResult() (from _outputs)
    VM-->>Host: return execution result
```

### 4.2 Modules System

#### 4.2.1 Базовый контракт AbstractModule

| Метод | Описание |
|:------|:---------|
| `constructor(vm)` | Принимает и сохраняет ссылку на Vm |
| `static metadata()` / `metadata()` | Возвращает метаданные модуля (code, name) |
| `vm()` | Геттер, возвращает привязанный инстанс VM |
| `async start()` / `async stop()` | Асинхронные методы жизненного цикла |
| `libraryUpdate()` | Хук при обновлении библиотек |

#### 4.2.2 Модули ядра

| Модуль | Назначение |
|:-------|:-----------|
| **CoreModule** | Предоставляет базовые системные события (`start`) и класс EventEmitter для блюпринтов |
| **CronModule** | Планировщик задач по cron-выражениям. Интервал проверки: 200мс |
| **ActorModule** | Менеджер акторов для интеграции с внешними объектами |

#### 4.2.3 Расширяемость модулей

```mermaid
classDiagram
    class EventEmitter {
        <<Node.js External>>
    }

    class AbstractModule {
        #_vm: Vm
        +constructor(vm)
        +static metadata()
        +metadata()
        +vm() Vm
        +start() Promise~void~
        +stop() Promise~void~
        +libraryUpdate() void
    }

    class CoreModule {
        +static metadata()
        +start() void
    }

    class CronModule {
        -_timer: IntervalID
        -_crons: Object
        -_lastCron: Object
        +start() void
        +stop() void
        +checkCrons(now, nobj) void
        +libraryUpdate() void
    }

    class ActorModule {
        -_actors: Object
        -_actorsEvents: Object
        -_subsIndex: Array
        +addActor(actor) void
        +removeActor(actor) void
        +updateActorsEventsIndex(libUpdate) void
    }

    EventEmitter <|-- AbstractModule
    AbstractModule <|-- CoreModule
    AbstractModule <|-- CronModule
    AbstractModule <|-- ActorModule
```

#### 4.2.4 Добавление нового модуля

1. Создать класс, наследующий `AbstractModule`
2. Реализовать статический метод `metadata()`, вернув уникальный `code` и `name`
3. Опционально реализовать `start()`, `stop()` и `libraryUpdate()`
4. Зарегистрировать: **`vm.addModule(ModuleClass)`**

### 4.3 Actors System

#### 4.3.1 Интерфейс AbstractActor

| Метод | Описание |
|:------|:---------|
| `constructor(id)` | Генерирует уникальный `_id`, инициализирует `_state = {}` |
| `static metadata()` / `metadata()` | Возвращает метаданные актора (состояния, методы, события) |
| `vm(next)` | Геттер/сеттер для привязки VM |
| `state(code)` | Возвращает внутреннее состояние или конкретное поле |
| `async method(method, inputs)` | **Обязателен для переопределения** — обработчик команд от VM |

#### 4.3.2 Базовые системные узлы для акторов

| Узел | Код | Назначение |
|:-----|:----|:-----------|
| ActorGet | `actor/get` | Запрос инстанса актора по ID |
| ActorState | `actor/state` | Чтение внутреннего состояния актора |
| ActorMethod | `actor/method` | Асинхронный вызов метода актора |

#### 4.3.3 Примеры реализаций акторов

| Тип актора | Среда | Описание |
|:-----------|:------|:---------|
| WebSocketActor | Node.js | Перехватывает сообщения из сокета, генерирует `emit('message')` |
| IoTActor | Embedded | Читает данные с датчиков, генерирует события `onTempChange` |
| Actor3D | Browser | 3D-модель (Three.js), события кликов, команды движения |

#### 4.3.4 Паттерн использования акторов

```mermaid
sequenceDiagram
    autonumber
    participant Device
    participant CustomActor
    participant Mod
    participant VM
    participant Graph

    Note over CustomActor,Mod: Инициализация
    CustomActor->>Mod: addActor myActor
    Mod->>CustomActor: actor.vm VM
    Mod->>CustomActor: actor.on tempChanged

    Note over Device,Graph: Runtime - Реакция на внешнее событие
    Device->>CustomActor: Изменение температуры 30C
    CustomActor->>CustomActor: Обновление _state.temperature
    CustomActor->>CustomActor: this.emit tempChanged {temp: 30}
    CustomActor-->>Mod: Перехват события модулем
    Mod->>VM: runLibraryFunction fn, inputs

    Note over VM,Graph: Runtime - Выполнение графа
    VM->>Graph: execute inputs
    Note right of Graph: Узел if temp > 25 -> ActorMethod
    Graph->>CustomActor: method turnCoolerOn
    CustomActor->>Device: relayOn
    CustomActor-->>Graph: { success: true }
```

### 4.4 Nodes Library

#### 4.4.1 Базовый класс AbstractNode

| Метод | Описание |
|:------|:---------|
| `static metadata()` | Возвращает объект с описанием узла (имя, код, тип, входы, выходы) |
| `prepareAndExecute()` | Сердце логики: проверяет зависимости, вызывает `execute(inputs)` |
| `execute(inputs)` | Асинхронный метод с бизнес-логикой узла |
| `error(msg, ...objs)` | Вывод сообщения об ошибке через логгер VM |

#### 4.4.2 Категории узлов

| Категория | Узлы |
|:----------|:------|
| **Массивы** | ArrayEach, Push, Pop, Shift, Unshift, Concat, Slice, Includes |
| **Математика** | NumberPlus/Minus/Divide/Multiply, FloatPlus/Minus, MathAbs, MathSin, MathCos, MathPow |
| **Логика** | If, Switch, BooleanAnd/Or/Not/Eq, NumberIsGreater/IsLess |
| **Строки** | StringAppend, Replace, Slice, Length, Includes, ToUpperCase, ToLowerCase |
| **Классы/OOP** | New, ClassMethod, ClassVariableGet, ClassVariableSet, Constructor |
| **Цвета** | ColorToRgb, ColorToHsl, RgbToColor, HlsToColor (библиотека `colord`) |
| **Даты** | Now, DatetimeCreate, DatetimeToString (библиотека `dayjs`) |

#### 4.4.3 Создание кастомного узла

```javascript
class MyCustomNode extends AbstractNode {
  static metadata() {
    return {
      name: 'My Custom Multiply',
      code: 'custom/multiply',
      type: 'modifier',
      inputs: {
        valA: { code: 'valA', name: 'A', type: 'basic/number' },
        valB: { code: 'valB', name: 'B', type: 'basic/number' }
      },
      outputs: {
        result: { code: 'result', name: 'Result', type: 'basic/number' }
      }
    };
  }

  async execute(inputs) {
    const ret = (inputs.valA || 0) * (inputs.valB || 0);
    this.setOutput('result', ret);
  }
}
```

#### 4.4.4 Регистрация узла в VM

```javascript
vm.registerNode(MyCustomNode);
```

#### 4.4.5 Диаграмма механизма prepareAndExecute

```mermaid
sequenceDiagram
    participant Graph as Graph Engine
    participant Node as Target Node (e.g. MathAbs)
    participant Ctx as Context
    participant ParentNode as Parent Node (e.g. VariableGet)

    Graph->>Node: prepareAndExecute()

    rect rgb(240, 240, 250)
        Note over Node: Проверка входных портов (inputs)
        Node->>Node: Has connection to Parent Node?
        Node->>Ctx: hasOutput(ParentNode)

        alt Данных еще нет (Lazy Evaluation)
            Ctx-->>Node: false
            Node->>Graph: executeNode(ParentNode, context)
            Graph->>ParentNode: prepareAndExecute()
            ParentNode->>Ctx: setOutput(result)
            Graph-->>Node: Parent execution finished
        end

        Node->>Ctx: getOutput(ParentNode, slot)
        Ctx-->>Node: value
    end

    Note over Node: Подготовка завершена
    Node->>Node: execute(inputs) (Бизнес-логика)
    Node->>Ctx: setOutput(final_result)
    Node-->>Graph: return (next branch slot)
```

### 4.5 Configuration Management

#### 4.5.1 Реестры VM

| Реестр | Назначение | Как пополняется |
|:-------|:-----------|:----------------|
| `_nodes` | Классы всех доступных узлов, индексированные по `meta.code` | `registerNode(Class)` |
| `_modules` | Инстансы активных модулей | `addModule(ModuleClass)` |
| `_types` | Зарегистрированные типы данных (для IDE) | `BaseTypes` при создании VM |

#### 4.5.2 Управление библиотеками

| Метод | Назначение |
|:------|:-----------|
| `libraries(next)` | Геттер/сеттер `_libraries` |
| `updateLibraries(libs)` | Обновление + оповещение модулей (`libraryUpdate()`) |
| `Graph.load(graph)` | Загрузка и клонирование структуры графа |

#### 4.5.3 Консоль и логирование

| Свойство | Описание |
|:---------|:---------|
| `_console` | Объект логгера (по умолчанию `console.log/error`) |
| `_debug` | Флаг отладки (вывод с префиксом `'DEBUG#'`) |
| `console(next)` | Геттер/сеттер для подмены логгера |

### 4.6 Background Jobs / Schedulers (CronModule)

#### 4.6.1 Архитектура CronModule

| Компонент | Описание |
|:----------|:---------|
| `_crons` | Кэш закэшированных расписаний |
| `_lastCron` | Метка последней проверки (точность до секунд) |
| `_timer` | IntervalID таймера проверки |

#### 4.6.2 Цикл работы планировщика

1. `libraryUpdate()`: Сканирует блюпринты, парсит cron-выражения (`cron-parser`)
2. `start()`: Запускает `setInterval(200ms)`
3. `checkCrons()`: На каждом тике сравнивает время с расписаниями
4. При совпадении: `vm.runLibraryFunction('default', fnCode, {now})`

---

## Step 5 Data Model

### 5.1 Graph JSON Schema

```json
{
  "name": "My Function",
  "type": "function",
  "library": "default",
  "entry": "node-id-1",
  "context": {
    "inputs": {
      "arg1": { "code": "arg1", "type": "basic/string", "value": "default_val" }
    },
    "outputs": {},
    "variables": {
      "localCounter": { "code": "localCounter", "type": "basic/number", "value": 0 }
    }
  },
  "graph": {
    "nodes": {
      "node-id-1": { },
      "node-id-2": { }
    }
  }
}
```

### 5.2 Node Definition

```json
"node-id-1": {
  "code": "float/plusFloat",
  "type": "modifier",
  "data": {},
  "inputs": {
    "valA": { "type": "basic/float", "connections": { }, "value": 10 },
    "valB": { "type": "basic/float", "connections": {} }
  },
  "outputs": {
    "result": { "type": "basic/float", "connections": { } }
  }
}
```

### 5.3 Connections / Cables

```json
// outputs узла-источника
"outputs": {
  "result": {
    "type": "basic/float",
    "connections": {
      "edge-id-xyz": { "to": { "node": "node-id-2", "slot": "valA" } }
    }
  }
}

// inputs узла-приёмника
"inputs": {
  "valA": {
    "type": "basic/float",
    "connections": {
      "edge-id-xyz": { "from": { "node": "node-id-1", "slot": "result" } }
    }
  }
}
```

### 5.4 Blueprint Library Structure

```json
{
  "default": {
    "name": "My Project Library",
    "functions": {
       "func-id-1": { /* Graph JSON */ }
    },
    "classes": {
       "class-id-1": {
          "name": "MyCustomActor",
          "extends": { },
          "schema": { },
          "methods": {
             "method-id-1": { /* Graph JSON */ }
          }
       }
    }
  }
}
```

### 5.5 Pseudo-types System

| Категория | Типы |
|:----------|:-----|
| **Типы потока** | `basic/execute` — белый (#FFF), определяет последовательность обхода |
| **Базовые данные** | `basic/string`, `basic/number`, `basic/float`, `basic/boolean`, `basic/object`, `basic/color`, `basic/datetime` |
| **Шаблонные** | `basic/template` — динамический тип для generic-узлов |
| **Объектные/ООП** | `bluep/class`, `bluep/struct`, `bluep/enum`, `bluep/actor` |

### 5.6 Entity-Relationship Diagram

```mermaid
erDiagram
    GRAPH {
        Object _graph "Parsed JSON Structure"
        Object _outputs "Final Graph Outputs"
        Object _self "Current class context (this)"
    }

    CONTEXT {
        Object _outputs "Dict[nodeId][slot] Memory"
        Object _self "Current class context"
    }

    ABSTRACT_NODE {
        String _node "Reference to node JSON info"
    }

    GRAPH ||--|| CONTEXT : "creates on execute()"
    GRAPH ||--o{ ABSTRACT_NODE : "instantiates on loop"

    ABSTRACT_NODE }o--|| CONTEXT : "reads/writes data (getOutput/setOutput)"
    ABSTRACT_NODE }o--|| GRAPH : "requests lazy eval / branch routing"
```

---

## Step 6 Implementation Recommendations

### 6.1 Сильные стороны архитектуры
- Чёткое разделение на подсистемы с единым контрактом (AbstractModule, AbstractActor, AbstractNode)
- Ленивые вычисления (lazy evaluation) через prepareAndExecute
- Слабая связность: VM не заботится о валидности данных, это задача IDE
- Расширяемость через модульную систему

### 6.2 Потенциальные улучшения
- Отсутствие строгой валидации типов в runtime
- Нет встроенного механизма кэширования результатов
- Ограниченный набор встроенных узлов (нет map/filter для массивов, нет vec2/vec3)
- CronModule использует фиксированный интервал 200ms (может быть избыточно)

### 6.3 Рекомендации по интеграции
1. Для веб-приложений: использовать WebSocketActor для real-time коммуникации
2. Для IoT: создать кастомный актор, наследующий AbstractActor
3. Для игр/3D: использовать Actor3D для интеграции с Three.js
4. Для планировщиков: добавить cron-функции в библиотеку с событием `cron`

---

*Отчёт сгенерирован автоматически с помощью BMAD RE Auto Explorer*
*Дата: 2026-03-25*
