## Process: Reverse Engineering

### Step 1 Project overview

### Step 2 System Architecture investigation

- [ ] Define domain boundaries (DDD Bounded Contexts, if applicable)
- [ ] Module / package map: dependencies between them (C4 L3)
- [ ] Build a Domain Language glossary: key entities and their relationships
- [ ] Build **System Context Diagram** (C4 L1): system + external actors
- [ ] Build **Container Diagram** (C4 L2): services, DB, queues, clients

### Step 3 Runtime behavior investigation

- [ ] Find all entry points (main, CLI, API routes, event handlers). Trace the main execution paths (happy path + error path), build **Sequence Diagram** (UML) for 3–5 key use cases - return only diagramms
- [ ] (Data lifecycle): Input data → transformations → output data. Build **Data Flow Diagram** (DFD L0 and L1 flowchart TD, )
- [ ] States and transitions: Identify key entities with state, build **State Machine Diagram** (stateDiagram-v2)  for each

### Step 4 Subsystems investigation

### Step 5 Data model

- [ ] Build **Entity-Relationship Diagram** (ERD) or collection schema
- [ ] Document all entities: fields, types, constraints, indices - table style
- [ ] Identify patterns: CQRS, Event Sourcing, Temporal Tables, etc.
- [ ] Map of all external services / APIs: purpose, protocol, version - table style
- [ ] Integration patterns: synchronous / asynchronous, retry, circuit breaker
- [ ] Build **Integration Map Diagram** (C4 L2)
