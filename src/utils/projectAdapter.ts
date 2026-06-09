import type { Project } from '../data/projectsDatabase';

export interface SystemNode {
  id: string;
  label: string;
  type: 'hardware' | 'software' | 'cloud' | 'database' | 'user';
  description: string;
}

export interface SystemConnection {
  from: string;
  to: string;
  protocol: string;
}

export interface AdaptedProject extends Project {
  // Adapted details
  primaryLanguage: string;
  systemArchitecture: {
    nodes: SystemNode[];
    connections: SystemConnection[];
  };
  databaseDesign: {
    engine: string;
    tables: {
      name: string;
      columns: { name: string; type: string; constraints?: string }[];
    }[];
  };
  folderStructure: string;
  developmentRoadmap: {
    step: number;
    title: string;
    description: string;
    objective: string;
    architecture: string;
    constructionProcess: string;
    internalWorking: string;
    folderStructure: string;
    filesToCreate: string[];
    codeExplanation: string;
    apisRequired: { route: string; method: string; description: string }[];
    databaseTables: string[];
    frontendIntegration: string;
    backendIntegration: string;
    testingProcedure: string;
    commonErrors: string;
    interviewQuestions: string[];
    realWorldUsage: string;
    tasks: { index: number; title: string; description: string }[];
  }[];
  sourceCodeStructureExplanation: { file: string; explanation: string }[];
  apisRequired: { route: string; method: string; description: string }[];
  testingProcedures: { type: string; command: string; details: string }[];
  commonErrors: { error: string; context: string; fix: string }[];
  vivaQuestions: { question: string; answer: string }[];
  resumeDescription: string[];
  githubReadmeTemplate: string;
}

export function adaptProject(project: Project, profile: {
  branch: string;
  specialization: string;
  languages: string[];
  skillLevel: string;
  academicYear: string;
}): AdaptedProject {
  // Determine primary language based on overlap and project capabilities
  let primaryLanguage = project.languages[0];
  const matchedLang = profile.languages.find(l => project.languages.includes(l));
  if (matchedLang) primaryLanguage = matchedLang;

  const isAdvanced = profile.skillLevel === 'Advanced' || profile.academicYear === '4th Year';

  // 1. Generate System Architecture Graph
  const nodes: SystemNode[] = [
    { id: 'usr', label: 'Client / User App', type: 'user', description: 'Web/Mobile front-end representing input triggers and data visualization graphs.' }
  ];
  const connections: SystemConnection[] = [];

  // Add hardware nodes if project has hardware
  if (project.hardware.length > 0) {
    nodes.push({ id: 'mcu', label: project.hardware[0], type: 'hardware', description: 'Core micro-controller processing sensor signals and executing logic loops.' });
    nodes.push({ id: 'sens', label: 'Sensor Array', type: 'hardware', description: 'Transducer elements recording physical properties (voltages, temperatures, motion).' });
    nodes.push({ id: 'act', label: 'Actuators / Relays', type: 'hardware', description: 'Relays, valves, or motor drives reacting to controller logic commands.' });

    connections.push({ from: 'sens', to: 'mcu', protocol: 'I2C / Analog' });
    connections.push({ from: 'mcu', to: 'act', protocol: 'GPIO / PWM Signal' });
    connections.push({ from: 'mcu', to: 'srv', protocol: 'MQTT / HTTP' });
  } else {
    connections.push({ from: 'usr', to: 'srv', protocol: 'HTTPS REST / WebSocket' });
  }

  // Server & Database Nodes
  nodes.push({ id: 'srv', label: 'App server Gateway', type: 'software', description: `Backend processor running on ${primaryLanguage} executing logic and database queries.` });
  const dbEngine = (primaryLanguage === 'Python' || primaryLanguage === 'SQL') ? 'PostgreSQL' : (primaryLanguage === 'JavaScript' || primaryLanguage === 'TypeScript') ? 'MongoDB' : 'SQLite';
  nodes.push({ id: 'db', label: `${dbEngine} Instance`, type: 'database', description: 'Persistent local storage recording telemetry logs, profile setups, and transaction audits.' });
  connections.push({ from: 'srv', to: 'db', protocol: 'TCP/IP connection' });

  if (isAdvanced) {
    nodes.push({ id: 'cld', label: 'Docker Container / Cloud host', type: 'cloud', description: 'Isolated host deploying microservice modules for automated monitoring.' });
    connections.push({ from: 'srv', to: 'cld', protocol: 'Docker Socket' });
  }

  // 2. Database Design Schema
  const tables = [
    {
      name: 'projects_telemetry',
      columns: [
        { name: 'id', type: 'UUID', constraints: 'PRIMARY KEY' },
        { name: 'timestamp', type: 'TIMESTAMP', constraints: 'DEFAULT NOW()' },
        { name: 'metric_name', type: 'VARCHAR(100)', constraints: 'NOT NULL' },
        { name: 'metric_value', type: 'NUMERIC(10,4)', constraints: 'NOT NULL' }
      ]
    },
    {
      name: 'system_configurations',
      columns: [
        { name: 'config_key', type: 'VARCHAR(50)', constraints: 'PRIMARY KEY' },
        { name: 'config_value', type: 'TEXT', constraints: 'NOT NULL' },
        { name: 'updated_at', type: 'TIMESTAMP', constraints: '' }
      ]
    }
  ];

  if (isAdvanced) {
    tables.push({
      name: 'audit_logs',
      columns: [
        { name: 'log_id', type: 'SERIAL', constraints: 'PRIMARY KEY' },
        { name: 'severity', type: 'VARCHAR(10)', constraints: 'NOT NULL' },
        { name: 'message', type: 'TEXT', constraints: 'NOT NULL' }
      ]
    });
  }

  // 3. Dynamic Folder Structure by Language
  let folderStructure = '';
  const fileExps: { file: string; explanation: string }[] = [];
  const apis: { route: string; method: string; description: string }[] = [];
  const testCmds: { type: string; command: string; details: string }[] = [];

  const lowerLang = primaryLanguage.toLowerCase();

  if (lowerLang === 'python') {
    folderStructure = `my-project/
├── requirements.txt         # Package dependencies (FastAPI, PyYAML, psycopg2)
├── README.md                # General system documentation and setup guides
├── config.yaml              # App variables, connection strings, and threshold configurations
├── src/
│   ├── __init__.py          # Marks folder as python package
│   ├── main.py              # Application runner initializing server APIs
│   ├── controller.py        # Logic execution routines and algorithm balancing
│   ├── database.py          # Session engines, DB clients, and SQL model managers
│   └── utils.py             # Helper tools for calculation models
└── tests/
    └── test_controller.py   # Unit testing suite executing Pytest assertions`;

    fileExps.push(
      { file: 'src/main.py', explanation: 'Initializes the FastAPI framework and mounts endpoint routes.' },
      { file: 'src/controller.py', explanation: `Implements the core logic calculations using customized ${primaryLanguage} libraries.` },
      { file: 'src/database.py', explanation: 'Creates connection pools and handles transactions.' }
    );

    apis.push(
      { route: '/api/v1/telemetry', method: 'POST', description: 'Submits new sensor readings or operation logs.' },
      { route: '/api/v1/telemetry/stats', method: 'GET', description: 'Returns rolling average summaries and alert statuses.' }
    );

    testCmds.push(
      { type: 'Unit Testing', command: 'pytest tests/', details: 'Runs validation checks on the logic algorithms.' },
      { type: 'Lint Check', command: 'flake8 src/', details: 'Enforces code style styling and identifies imports errors.' }
    );
  } else if (lowerLang === 'javascript' || lowerLang === 'typescript') {
    const ext = lowerLang === 'typescript' ? 'ts' : 'js';
    folderStructure = `my-project/
├── package.json             # NPM package scripts and module dependencies
├── tsconfig.json            # (TS only) Compiler directives and path configurations
├── src/
│   ├── index.${ext}            # App entry gate binding port listeners
│   ├── server.${ext}           # Express app setup and middleware routing
│   ├── service.${ext}          # Core logic algorithms and calculations
│   ├── model.${ext}            # Mongoose schemas for collections data structure
│   └── db.${ext}               # Client connection helper class
└── tests/
    └── index.test.${ext}       # Testing suite running Jest / Supertest specs`;

    fileExps.push(
      { file: `src/index.${ext}`, explanation: 'Launches the Express framework server on target ports.' },
      { file: `src/service.${ext}`, explanation: 'Executes core mathematics, signal models, or decision arrays.' }
    );

    apis.push(
      { route: '/api/telemetry', method: 'POST', description: 'Appends data frames to storage schemas.' },
      { route: '/api/health', method: 'GET', description: 'Verifies DB socket connection and sensor status.' }
    );

    testCmds.push(
      { type: 'Unit Testing', command: 'npm test', details: 'Executes Jest unit test scripts.' },
      { type: 'Type Verification', command: 'npx tsc --noEmit', details: 'Verifies compilation constraints across types.' }
    );
  } else if (lowerLang === 'c++' || lowerLang === 'c') {
    folderStructure = `my-project/
├── CMakeLists.txt           # Build compiler configurations mapping binaries
├── main.cpp                 # Main program containing MCU setup() and loop() hooks
├── Config.h                 # Preprocessor variables, pin layouts, and wifi keys
├── sensor_handler.cpp       # Handlers measuring I2C and analog data arrays
├── sensor_handler.h        # Interface headers for handlers
├── actuator_controller.cpp  # Output controller mapping relays, solenoids, or motors
└── tests/
    └── test_main.cpp        # GTest code simulating mock sensor inputs`;

    fileExps.push(
      { file: 'main.cpp', explanation: 'Establishes device setups and fires continuous sensor polling loops.' },
      { file: 'sensor_handler.cpp', explanation: 'Addresses hardware addresses to collect values.' }
    );

    apis.push(
      { route: 'MQTT /telemetry', method: 'PUB', description: 'Publishes payload string to active brokers.' },
      { route: 'MQTT /configs', method: 'SUB', description: 'Subscribes to updates containing threshold variables.' }
    );

    testCmds.push(
      { type: 'Build Check', command: 'cmake -B build/ && cmake --build build/', details: 'Compiles binaries and resolves platform libraries.' },
      { type: 'Flash Firmware', command: 'pio run --target upload', details: 'Flashes target executable compiled files to hardware pins.' }
    );
  } else {
    // Fallback template
    folderStructure = `my-project/
├── config.json              # Connection and variable tags
├── main.${primaryLanguage.toLowerCase()} # Core application entry
├── logic.${primaryLanguage.toLowerCase()} # Logic handler functions
└── tests/
    └── test_logic.py        # Verification files`;

    fileExps.push({ file: `main.${primaryLanguage.toLowerCase()}`, explanation: 'Launches the program runtime.' });
    apis.push({ route: '/api/telemetry', method: 'POST', description: 'Accepts telemetry frames.' });
    testCmds.push({ type: 'Verification', command: 'npm run test / pytest', details: 'Performs assertion audits.' });
  }

  // 4. Custom Development Roadmap
  let taskCounter = 0;
  
  const developmentRoadmap: AdaptedProject['developmentRoadmap'] = [
    {
      step: 1,
      title: "Environment & Scaffolding",
      description: `Install software tools (${project.software.join(', ')}) and structure project folders.`,
      objective: `Set up the local workspace, initialize packages, and construct the directory tree for ${project.name}.`,
      architecture: `Modular workspace separating code controllers, routing gateways, database scripts, helper utilities, and test assertions. Config parameters (like package.json, requirements.txt, or CMakeLists.txt) sit at the root to instruct compiler tools.`,
      constructionProcess: `1. Initialize git version control.\n2. Scaffold directories: src/, tests/, and config folders.\n3. Initialize package dependencies files (e.g. npm init or pipenv).\n4. Execute setup install commands.`,
      internalWorking: `The package manager resolves semantic versions of dependencies, fetches packages, compiles binaries, and registers local paths. Execution of a test run validates path bindings.`,
      folderStructure: lowerLang === 'python'
        ? `├── requirements.txt\n├── config.yaml\n└── src/\n    ├── __init__.py\n    └── main.py`
        : lowerLang.includes('js')
        ? `├── package.json\n└── src/\n    ├── index.js\n    └── server.js`
        : `├── CMakeLists.txt\n├── Config.h\n└── main.cpp`,
      filesToCreate: lowerLang === 'python' 
        ? ["requirements.txt", "config.yaml", "src/main.py"] 
        : lowerLang.includes('js') 
        ? ["package.json", "src/index.js", "src/server.js"] 
        : ["CMakeLists.txt", "Config.h", "main.cpp"],
      codeExplanation: `Declare package dependencies and runtimes. For example, package.json lists libraries like express and cors so npm install can resolve and download them locally.`,
      apisRequired: [],
      databaseTables: [],
      frontendIntegration: `Set up dev server runners in package.json (e.g. npm run dev/preview) to link hot-reloads.`,
      backendIntegration: `Configure port binding, dev scripts, and dotenv path checks.`,
      testingProcedure: `Execute check compile instructions: ${lowerLang === 'python' ? 'python -m py_compile src/main.py' : lowerLang.includes('js') ? 'npm run build / node -c src/index.js' : 'cmake --build build'}`,
      commonErrors: `1. Missing dependency files.\n2. Path resolution failure (missing imports).\n3. Runtime environment version mismatch.`,
      interviewQuestions: [
        `Why separate source files from configuration files at the root?\nAnswer: To isolate app logic from environmental settings and pipeline files, complying with clean codebase architecture.`,
        `What is the purpose of lock files (e.g., package-lock.json)?\nAnswer: They lock exact dependency sub-versions, guaranteeing reproducible builds across dev and production.`
      ],
      realWorldUsage: `Professional software development teams use scaffolding templates (Vite, CRA, Cookiecutter) to standardize layouts and speed up scaffolding.`,
      tasks: [
        { index: taskCounter++, title: "Setup Local Directory Tree", description: "Create root folder, src/ folder, and setup environment configurations." },
        { index: taskCounter++, title: "Initialize Dependencies File", description: `Write standard package dependency variables (e.g. package.json, requirements.txt, or CMake config).` },
        { index: taskCounter++, title: "Verify Project compilation", description: "Run build commands to verify compiler pathways compile zero-dependency modules successfully." }
      ]
    },
    {
      step: 2,
      title: "Database Configuration & Models",
      description: `Configure connection parameters for ${dbEngine} and declare database tables.`,
      objective: `Configure connection pools for ${dbEngine} and write schema scripts to model relational columns.`,
      architecture: `Centralized database engine handler using ${dbEngine}. The schema maps telemetry records, configuration keys, and audit details with strict primary and foreign key constraints.`,
      constructionProcess: `1. Boot up ${dbEngine} server/emulator.\n2. Write schema creation SQL scripts (schema.sql).\n3. Write connection pool handlers with automatic retry loops.\n4. Write query validation test runs.`,
      internalWorking: `The server establishes socket connections to the database server. Connection pools preserve pre-warmed sockets to avoid TCP handshake overhead on every query.`,
      folderStructure: lowerLang === 'python'
        ? `src/\n└── db/\n    ├── __init__.py\n    ├── client.py\n    └── models.py`
        : lowerLang.includes('js')
        ? `src/\n└── db/\n    ├── connection.js\n    └── schemas.js`
        : `src/\n└── config/\n    └── DBConfig.h`,
      filesToCreate: lowerLang === 'python'
        ? ["src/db/client.py", "src/db/models.py"]
        : lowerLang.includes('js')
        ? ["src/db/connection.js", "src/db/schemas.js"]
        : ["src/config/DBConfig.h"],
      codeExplanation: `Establishes a pooled connection instance to ${dbEngine}. Pre-compiles models/tables to declare schema bindings so query requests map directly to fields.`,
      apisRequired: [],
      databaseTables: ["projects_telemetry", "system_configurations", "audit_logs"],
      frontendIntegration: `Expose database health statuses to telemetry UI widgets.`,
      backendIntegration: `Connection pool clients are shared as a middleware parameter to let routers execute SQL logs.`,
      testingProcedure: `Run test_db.js/py checks which insert test records and select them to ensure CRUD works correctly.`,
      commonErrors: `1. Unclosed database sockets causing connection leaks.\n2. Credential security flaws (committing passwords).\n3. Table column type mismatches.`,
      interviewQuestions: [
        `What is database connection pooling and why use it?\nAnswer: It maintains a cache of database connections, enabling multiple requests to reuse sockets rather than opening/closing connections repeatedly.`,
        `How do you protect your credentials during local database tests?\nAnswer: Use environmental variables (.env files) loaded at runtime; never commit passwords to version control.`
      ],
      realWorldUsage: `Neon, Supabase, and AWS RDS databases require connection pools (pg-pool, Prisma, Hibernate) to handle thousands of concurrent queries without crashes.`,
      tasks: [
        { index: taskCounter++, title: "Establish Connection Pools", description: `Implement connection engines and verify client handshake with ${dbEngine}.` },
        { index: taskCounter++, title: "Execute Schema Tables Script", description: "Declare table schemas (for logs, alerts, and profiles) and run DDL commands." },
        { index: taskCounter++, title: "Test Read/Write Transactions", description: "Write dummy test code to insert a row and retrieve it to verify CRUD operations." }
      ]
    },
    {
      step: 3,
      title: "Core Logic & Service Algorithms",
      description: `Write the main calculations and control logic representing: "${project.objective}".`,
      objective: `Implement core computational processes and business rules in the service controller.`,
      architecture: `De-coupled service controllers processing metrics. Algorithms analyze telemetry frames, evaluate anomaly rules, and yield system decisions (like load-balancing, alert logs, and thresholds).`,
      constructionProcess: `1. Define service logic interfaces.\n2. Code mathematical models (averages, boundary checks).\n3. Add exception handling.\n4. Write unit tests for logic inputs.`,
      internalWorking: `Raw values pass through verification checks, then math filters average values. An anomaly logic module evaluates thresholds and outputs alert states.`,
      folderStructure: lowerLang === 'python'
        ? `src/\n└── services/\n    ├── __init__.py\n    ├── analyzer.py\n    └── rules.py`
        : lowerLang.includes('js')
        ? `src/\n└── services/\n    ├── analyzer.js\n    └── rules.js`
        : `src/\n└── logic/\n    └── controller.cpp`,
      filesToCreate: lowerLang === 'python'
        ? ["src/services/analyzer.py", "src/services/rules.py"]
        : lowerLang.includes('js')
        ? ["src/services/analyzer.js", "src/services/rules.js"]
        : ["src/logic/controller.cpp"],
      codeExplanation: `Contains processing scripts (e.g. threshold calculations). It analyzes numbers and maps alert flags when variables exceed tolerance levels.`,
      apisRequired: [],
      databaseTables: [],
      frontendIntegration: `None. (This is a pure business logic service layer).`,
      backendIntegration: `Exported functions are imported into API routes to process POST payloads.`,
      testingProcedure: `Run unit test suites verifying math outputs against mock inputs (e.g. pytest or jest).`,
      commonErrors: `1. Division by zero on empty inputs.\n2. Hardcoded configuration values.\n3. Memory leaks in loops.`,
      interviewQuestions: [
        `What is the Single Responsibility Principle (SRP) in service design?\nAnswer: Decoupling algorithms from HTTP handlers to allow isolated testing and reuse of logic classes.`,
        `How do you handle decimal precision errors?\nAnswer: Use dedicated high-precision decimal objects (BigDecimal, decimal in Python) instead of standard floating point numbers.`
      ],
      realWorldUsage: `Data pipelines, machine learning models, and signal processors maintain strict separation of logic from endpoint servers to support horizontal scale.`,
      tasks: [
        { index: taskCounter++, title: "Write Calculation Service Modules", description: "Translate mathematical models and system objectives into structured functions." },
        { index: taskCounter++, title: "Setup Threshold Trigger Alert Rules", description: "Implement threshold limits and alert handlers to detect anomalies." },
        { index: taskCounter++, title: "Validate Algorithm with Dry Runs", description: "Perform console print dry-runs checking output matching calculations." }
      ]
    }
  ];

  if (project.hardware.length > 0) {
    developmentRoadmap.push({
      step: 4,
      title: "Hardware Wiring & MCU Firmware",
      description: `Assemble hardware sensors (${project.hardware.join(', ')}) and upload firmware.`,
      objective: `Wire physical devices to the microcontroller and write GPIO reading loops.`,
      architecture: `Firmware running on microcontrollers. Sensor streams are read via physical register pins (ADC/I2C) and piped over network clients.`,
      constructionProcess: `1. Wire physical circuit on breadboard.\n2. Set up microcontroller sketch files.\n3. Write sensor polling loops.\n4. Configure WiFi/network data clients.`,
      internalWorking: `Continuous polling loops measure electrical voltages, apply formulas to convert voltages into metrics, and publish text strings.`,
      folderStructure: `src/\n└── firmware/\n    ├── firmware.ino\n    └── config.h`,
      filesToCreate: ["src/firmware/firmware.ino", "src/firmware/config.h"],
      codeExplanation: `Initializes physical microcontroller registers and executes loops to poll sensor voltages and publish them via networks.`,
      apisRequired: [
        { route: "MQTT /telemetry", method: "PUB", description: "Publishes telemetry payload string to active brokers." }
      ],
      databaseTables: [],
      frontendIntegration: `Microcontroller connects via wireless sockets to frontend visualization frames.`,
      backendIntegration: `Network brokers (e.g. MQTT) forward published payloads to database queues.`,
      testingProcedure: `Verify MCU serial console prints: WiFi Connected, sensor values OK, telemetry published.`,
      commonErrors: `1. Reversing polarity (VCC/GND), shorting sensors.\n2. Blocking delays halting network loops.`,
      interviewQuestions: [
        `Why avoid blocking delay() functions in networking firmware?\nAnswer: Delays freeze execution, causing the MCU to drop network socket packets and trigger timeouts. Use non-blocking millis() instead.`,
        `How do you handle sensor signal noise?\nAnswer: Apply digital low-pass filters or rolling average window calculations in firmware to smooth readings.`
      ],
      realWorldUsage: `Smart meters and Tesla vehicles use non-blocking C++ telemetry loops to upload real-time sensory data.`,
      tasks: [
        { index: taskCounter++, title: "Connect Jumper Wire Pins", description: "Assemble sensors, ESP32, relays, and actuators on breadboard matching schematics." },
        { index: taskCounter++, title: "Implement Pin Polling Loops", description: "Write firmware to parse sensor voltages into actual unit metrics." },
        { index: taskCounter++, title: "Setup Telemetry MQTT Publisher", description: "Write client commands publishing payload data frames to network brokers." }
      ]
    });
  } else {
    developmentRoadmap.push({
      step: 4,
      title: "Frontend Client UI Components",
      description: `Create web dashboard layouts and query backend routes for telemetry visualizer graphs.`,
      objective: `Develop React interface pages to visualize project logs and trigger control states.`,
      architecture: `React Component structure. Global states track active dashboard panels, query REST endpoints, and render metrics in chart graphs.`,
      constructionProcess: `1. Scaffold UI component files.\n2. Code dashboard layouts and state values.\n3. Implement fetch hooks.\n4. Bind chart widgets to data arrays.`,
      internalWorking: `React updates its virtual DOM when state updates. Fetch hooks call endpoints and set local state arrays, triggering chart re-renders.`,
      folderStructure: `src/\n└── components/\n    ├── Dashboard.tsx\n    └── MetricChart.tsx`,
      filesToCreate: ["src/components/Dashboard.tsx", "src/components/MetricChart.tsx"],
      codeExplanation: `Declares UI components. React hooks fetch metrics from the server and pass data arrays to interactive charts.`,
      apisRequired: [
        { route: "/api/telemetry", method: "GET", description: "Fetches telemetry metrics logs." }
      ],
      databaseTables: [],
      frontendIntegration: `Integrates styled charts, telemetry grid layouts, and active alert banners.`,
      backendIntegration: `Express/FastAPI endpoints serve metrics logs from databases to the client.`,
      testingProcedure: `Inspect web console and verify charts render metrics dynamically without UI crashes.`,
      commonErrors: `1. Fetching APIs inside renders without useEffect, causing infinite loops.\n2. Non-responsive styling.`,
      interviewQuestions: [
        `What is the purpose of useEffect dependency arrays?\nAnswer: They specify state variables that trigger effect runs; empty arrays ensure the effect executes only once on mount.`,
        `How do you handle slow API load states in the UI?\nAnswer: Display placeholder loaders (skeletons) and disable action triggers until fetches complete.`
      ],
      realWorldUsage: `Cloud platforms (Datadog, AWS Console) feature high-performance React charts to visualize server health metrics.`,
      tasks: [
        { index: taskCounter++, title: "Build styled dashboard layout grid", description: "Create responsive page layouts with metrics indicators." },
        { index: taskCounter++, title: "Implement API Fetch Hooks", description: "Connect frontend states to retrieve telemetry JSON data from routes." },
        { index: taskCounter++, title: "Add Interactive Chart Widgets", description: "Integrate visual charts or gauge elements to render live metrics." }
      ]
    });
  }

  developmentRoadmap.push(
    {
      step: developmentRoadmap.length + 1,
      title: "API Endpoint Routing & Service Integration",
      description: "Expose Express/FastAPI endpoints and connect backend queries to the database.",
      objective: "Build API routes to handle incoming requests, query the database, and return JSON models.",
      architecture: `API Gateway layer. Routes intercept HTTP requests, validate body JSON formats, call database models, and respond with sanitized data.`,
      constructionProcess: `1. Declare router routes.\n2. Integrate logic controllers inside endpoints.\n3. Add database queries to routes.\n4. Implement CORS and rate-limit middleware.`,
      internalWorking: `HTTP requests arrive at port interfaces. The router matches paths, executes middleware checks (CORS, auth), calls database handlers, and resolves responses.`,
      folderStructure: lowerLang === 'python'
        ? `src/\n└── routes/\n    ├── __init__.py\n    └── telemetry.py`
        : lowerLang.includes('js')
        ? `src/\n└── routes/\n    └── telemetry.js`
        : `src/\n└── network/\n    └── server.cpp`,
      filesToCreate: lowerLang === 'python'
        ? ["src/routes/telemetry.py"]
        : lowerLang.includes('js')
        ? ["src/routes/telemetry.js"]
        : ["src/network/server.cpp"],
      codeExplanation: `Mounts endpoint routes (e.g. /api/telemetry). Checks parameters and runs DB queries to insert logs and respond with 200 OK.`,
      apisRequired: [
        { route: "/api/telemetry", method: "POST", description: "Stores telemetry metric logs." },
        { route: "/api/telemetry/stats", method: "GET", description: "Returns telemetry metrics summaries." }
      ],
      databaseTables: ["projects_telemetry"],
      frontendIntegration: `Frontend fetch hooks connect to these endpoints to load statistics.`,
      backendIntegration: `Resolves queries by matching route handlers to SQL client connections.`,
      testingProcedure: `Use postman/curl to send POST requests, verifying return statuses are 200/201 and DB records update.`,
      commonErrors: `1. CORS blocks on clients.\n2. Unhandled asynchronous query exceptions causing server crashes.\n3. Missing body parsing middleware.`,
      interviewQuestions: [
        `What is CORS and how do you configure it?\nAnswer: Cross-Origin Resource Sharing is a browser security policy. Configure headers on the backend server to authorize cross-domain client requests.`,
        `Why sanitize client input parameters inside API routes?\nAnswer: To protect against injection exploits (SQL injection, XSS) and prevent database exceptions from corrupting tables.`
      ],
      realWorldUsage: `Uber, Stripe, and Airbnb expose secure JSON REST APIs to connect user apps to database clusters.`,
      tasks: [
        { index: taskCounter++, title: "Define Route Gateway Endpoints", description: "Expose GET/POST routes matching requirements." },
        { index: taskCounter++, title: "Implement Query SQL Integrations", description: "Configure API logic controllers to execute transactions on schemas." },
        { index: taskCounter++, title: "Test Endpoint Handshakes", description: "Verify endpoint returns sanitised JSON structures using REST tools." }
      ]
    },
    {
      step: developmentRoadmap.length + 1,
      title: "Verification Testing & Error Handling",
      description: "Write unit tests and error boundaries checking edge failure states.",
      objective: "Implement automated unit testing assertions and error log capture.",
      architecture: `Automated test runner pipeline. Tests execute isolated controllers, mock network conditions, and check system bounds.`,
      constructionProcess: `1. Configure test runners.\n2. Write logic validation specs.\n3. Write database error mock tests.\n4. Implement global error boundaries.`,
      internalWorking: `The testing suite compiles modules, overrides db clients with memory emulators, asserts outcomes against mock inputs, and prints summaries.`,
      folderStructure: `tests/\n└── test_main.js`,
      filesToCreate: ["tests/test_main.js"],
      codeExplanation: `Declares assertion scripts comparing inputs against outputs. Mocks database connectivity to isolate and test logic.`,
      apisRequired: [],
      databaseTables: [],
      frontendIntegration: `Renders error panels to capture backend timeout issues.`,
      backendIntegration: `Global error handling routes catch exceptions, log traces, and return 500 error responses without crashing services.`,
      testingProcedure: `Run test execution commands (npm run test / pytest / ctest) and verify that all test cases pass.`,
      commonErrors: `1. Hardcoding configurations.\n2. Async tests terminating prematurely.\n3. Mismatched database mocks masking true issues.`,
      interviewQuestions: [
        `What is the difference between unit testing and integration testing?\nAnswer: Unit tests check single code modules in isolation using mocks; integration tests verify communication across database layers.`,
        `What is a test mock and when is it useful?\nAnswer: A mock simulates external services (like databases or third-party APIs) to check code logic without network latency.`
      ],
      realWorldUsage: `Financial checkout flows and medical software undergo strict automated unit checks to ensure zero-error calculation rates.`,
      tasks: [
        { index: taskCounter++, title: "Write Automated Unit Assertions", description: "Configure tests checks comparing logic outputs against expected outcomes." },
        { index: taskCounter++, title: "Test Database Integrity Scenarios", description: "Execute test cases verifying queries fail gracefully on duplicate keys." },
        { index: taskCounter++, title: "Verify Error Boundaries & Logs", description: "Test application recovery behavior during network losses." }
      ]
    }
  );

  if (isAdvanced) {
    developmentRoadmap.push({
      step: developmentRoadmap.length + 1,
      title: "Containerization & Production Deployment",
      description: "Draft Docker configuration files and setup environment scripts for cloud hosting.",
      objective: "Prepare containers and configuration templates to deploy the application to cloud environments.",
      architecture: `Isolated containers packaging the software runtime, file configs, and dependencies. Containers run behind virtual reverse proxies.`,
      constructionProcess: `1. Write .dockerignore and Dockerfile templates.\n2. Configure compose files.\n3. Declare production environments.\n4. Configure CI/CD hooks.`,
      internalWorking: `The container engine builds isolated image layers. Compose manages network sockets, volumes, and service startup sequences.`,
      folderStructure: `├── Dockerfile\n├── docker-compose.yml\n└── .env.production`,
      filesToCreate: ["Dockerfile", "docker-compose.yml", ".env.production"],
      codeExplanation: `Dockerfile packages node/python images and runs install scripts. docker-compose coordinates containers, databases, and network links.`,
      apisRequired: [],
      databaseTables: [],
      frontendIntegration: `Production build scripts generate static client assets compiled for hosting networks.`,
      backendIntegration: `Ensures app server handles port mappings and connection strings dynamically.`,
      testingProcedure: `Run docker compose up, verifying container mounts and accessing ports.`,
      commonErrors: `1. Heavy image sizes due to package caches.\n2. Hardcoded secret variables in code.\n3. Missing non-root user settings.`,
      interviewQuestions: [
        `Why use multi-stage builds in Dockerfiles?\nAnswer: To separate compilation dependencies from final runtimes, reducing image size and enhancing production security.`,
        `What is the purpose of docker-compose?\nAnswer: It coordinates multiple containers (backend, database, caching) with unified network bridges and shared volumes.`
      ],
      realWorldUsage: `Modern cloud networks (Kubernetes, AWS ECS) package applications as containerized Docker pods for rapid horizontal scaling.`,
      tasks: [
        { index: taskCounter++, title: "Draft Dockerfile Config Templates", description: "Create multi-stage Docker build files." },
        { index: taskCounter++, title: "Setup compose orchestration files", description: "Draft compose files bridging containers, volumes, and ports." },
        { index: taskCounter++, title: "Configure Cloud Secrets Settings", description: "Setup production configuration files ready to connect Neon/Render." }
      ]
    });
  }

  // 5. Common Errors and Fixes
  const commonErrors = [
    {
      error: "Connection Refused / Network Timeout",
      context: "Occurs during initial API or database handshakes.",
      fix: "Verify local database service is active. Check firewall rules allowing port traffic."
    },
    {
      error: "Null Pointer Reference / Unresolved Imports",
      context: "Occurs during compiler executions.",
      fix: `Ensure all library files are listed inside dependencies documents (requirements.txt, package.json). Run rebuild checks.`
    }
  ];

  if (project.hardware.length > 0) {
    commonErrors.push({
      error: "Sensor returning NaN / Float Overflow",
      context: "Occurs during reading operations on hardware pins.",
      fix: "Check physical jumper wiring. Verify pull-up resistors are correctly bridged to VCC."
    });
  }

  // 6. Viva Preparation Questions
  const vivaQuestions = [
    {
      question: "What is the primary problem statement addressed by this engineering project?",
      answer: project.problemStatement
    },
    {
      question: `Why was ${primaryLanguage} selected as the development language instead of other options?`,
      answer: `Because of its native support for the project requirements: ${project.languages.join(', ')} provide optimal libraries, fast execution times, and compatibility with the target hardware/software environment.`
    },
    {
      question: "Explain the database architecture and normalization strategy used.",
      answer: `The system uses ${dbEngine} to record transactions and logs. The schema features normalized relational fields or decoupled JSON schemas depending on read/write loads to minimize duplicates.`
    },
    {
      question: "How would you handle scale constraints if database transactions multiply by a factor of 100?",
      answer: "Implement connection pooling, index lookup columns, add a caching layer (like Redis), and segregate high-rate logs write tables from analytics configurations."
    }
  ];

  // 7. Resume bullet descriptions
  const resumeDescription = [
    `Engineered an automated "${project.name}" system utilizing ${primaryLanguage} to target real-world challenges: "${project.problemStatement.slice(0, 100)}..."`,
    `Developed optimized backend controller modules on ${dbEngine} database models, improving calculation thresholds.`,
    `Assembled test validation pipelines resolving system latency and logic errors across multiple staging tests.`
  ];

  if (project.hardware.length > 0) {
    resumeDescription.push(`Designed low-power hardware configurations wiring sensors with ESP32/Arduino microcontrollers, minimizing power draws.`);
  }

  // 8. GitHub README Template
  const githubReadmeTemplate = `# ${project.name}

## Overview
${project.objective}

This project targets the following problem:
> ${project.problemStatement}

## Technologies Used
- **Language**: ${primaryLanguage}
- **Software**: ${project.software.join(', ')}
${project.hardware.length > 0 ? `- **Hardware**: ${project.hardware.join(', ')}` : ''}

## Directory Structure
\`\`\`
${folderStructure}
\`\`\`

## Quick Start
1. Clone the repository.
2. Initialize configurations.
3. Install dependencies:
   \`\`\`bash
   # Execute dependency setups
   ${lowerLang === 'python' ? 'pip install -r requirements.txt' : lowerLang.includes('js') ? 'npm install' : 'cmake -B build'}
   \`\`\`
4. Run the application:
   \`\`\`bash
   ${lowerLang === 'python' ? 'python src/main.py' : lowerLang.includes('js') ? 'npm start' : './build/main'}
   \`\`\`

## Verification
Run tests to check local configurations:
\`\`\`bash
${testCmds[0]?.command || 'npm test'}
\`\`\`

## License
MIT License
`;

  return {
    ...project,
    primaryLanguage,
    systemArchitecture: { nodes, connections },
    databaseDesign: { engine: dbEngine, tables },
    folderStructure,
    developmentRoadmap,
    sourceCodeStructureExplanation: fileExps,
    apisRequired: apis,
    testingProcedures: testCmds,
    commonErrors,
    vivaQuestions,
    resumeDescription,
    githubReadmeTemplate
  };
}
