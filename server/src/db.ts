import { Pool } from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';

// Use Docker service host "postgres" when inside container, or "localhost" when running server locally
const connectionString = process.env.DATABASE_URL || 'postgresql://forge_admin:forge_secret_pass@localhost:5432/forgepilot';

let useLocalFallback = false;
const realPool = new Pool({
  connectionString,
  ssl: isProduction ? { rejectUnauthorized: false } : false,
  connectionTimeoutMillis: 2000
});

// Local file database configuration
const DB_DIR = path.join(__dirname, '..', 'data');
const DB_FILE = path.join(DB_DIR, 'database.json');

const initialDb = {
  users: [
    {
      id: '00000000-0000-0000-0000-000000000001',
      name: 'Abhishek Kavala',
      email: 'kavalaabhishek37@gmail.com',
      password_hash: '$2a$10$Hz9JsxJWPFGuXBLsShd8KupnDTMzx4Dvii2fMOWKO3G.rQDtS6cfG',
      created_at: new Date().toISOString()
    }
  ] as any[],
  profiles: [
    {
      user_id: '00000000-0000-0000-0000-000000000001',
      branch: 'Computer Science Engineering (CSE)',
      specialization: 'Artificial Intelligence',
      languages: ['Python', 'JavaScript', 'TypeScript'],
      skill_level: 'Intermediate',
      academic_year: '3rd Year',
      github: 'https://github.com/abhishek37-datascience',
      linkedin: 'https://www.linkedin.com/in/kavala-sivaramasaiabhishek-586b623a1',
      primary_email: 'kavalaabhishek37@gmail.com',
      secondary_email: 'kavalasivaramasaiabhishek37@gmail.com',
      updated_at: new Date().toISOString()
    }
  ] as any[],
  projects: [] as any[],
  saved_projects: [] as any[],
  favorite_projects: [] as any[],
  completed_projects: [] as any[],
  search_history: [] as any[],
  viewed_projects: [] as any[],
  project_progress: [] as any[],
  feedback: [] as any[]
};

function readLocalDb() {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify(initialDb, null, 2));
    return initialDb;
  }
  try {
    const data = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Failed to read database.json:', err);
    return initialDb;
  }
}

function writeLocalDb(db: any) {
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
  } catch (err) {
    console.error('Failed to write database.json:', err);
  }
}

// Automatically create tables / run migrations for real Postgres
async function runMigrations(client: any) {
  try {
    const schemaPath = path.join(__dirname, 'db', 'schema.sql');
    if (fs.existsSync(schemaPath)) {
      const sql = fs.readFileSync(schemaPath, 'utf8');
      await client.query(sql);
      console.log('✅ PostgreSQL migrations executed successfully.');
    } else {
      console.warn('⚠️ schema.sql not found at', schemaPath);
    }
  } catch (err: any) {
    console.error('⚠️ Failed to run migrations:', err.message);
  }
}

// Test connectivity and run migrations on startup
realPool.query('SELECT NOW()')
  .then(async (res) => {
    console.log('✅ PostgreSQL connection verified successfully:', res.rows[0].now);
    const client = await realPool.connect();
    try {
      await runMigrations(client);
    } finally {
      client.release();
    }
  })
  .catch((err) => {
    console.error('⚠️ PostgreSQL connection failed! Falling back to emulated local database.json.', err.message);
    useLocalFallback = true;
    readLocalDb();
  });

// Emulate simple SQL queries using JSON database
async function runLocalQuery(text: string, params: any[]): Promise<{ rows: any[], rowCount: number }> {
  const db = readLocalDb();
  const sql = text.trim().replace(/\s+/g, ' ');

  // 1. SELECT NOW()
  if (sql.toUpperCase().startsWith('SELECT NOW()')) {
    return { rows: [{ now: new Date().toISOString() }], rowCount: 1 };
  }

  // 2. SELECT * FROM users WHERE email = $1
  if (sql.match(/SELECT \* FROM users WHERE email =/i)) {
    const email = params[0].toLowerCase();
    const user = db.users.find((u: any) => u.email === email);
    return { rows: user ? [user] : [], rowCount: user ? 1 : 0 };
  }

  // 3. INSERT INTO users
  if (sql.match(/INSERT INTO users/i)) {
    const id = 'user_' + Math.random().toString(36).substring(2, 11);
    const newUser = {
      id,
      name: params[0],
      email: params[1].toLowerCase(),
      password_hash: params[2],
      created_at: new Date().toISOString()
    };
    db.users.push(newUser);
    writeLocalDb(db);
    return { rows: [{ id: newUser.id, name: newUser.name, email: newUser.email }], rowCount: 1 };
  }

  // 4. UPDATE users SET password_hash = $1 WHERE email = $2
  if (sql.match(/UPDATE users SET password_hash =/i)) {
    const user = db.users.find((u: any) => u.email === params[1].toLowerCase());
    if (user) {
      user.password_hash = params[0];
      writeLocalDb(db);
      return { rows: [], rowCount: 1 };
    }
    return { rows: [], rowCount: 0 };
  }

  // 5. SELECT * FROM profiles WHERE user_id = $1
  if (sql.match(/SELECT \* FROM profiles WHERE user_id =/i)) {
    const profile = db.profiles.find((p: any) => p.user_id === params[0]);
    return { rows: profile ? [profile] : [], rowCount: profile ? 1 : 0 };
  }

  // 6. INSERT INTO profiles (user_id, branch, specialization, languages, skill_level, academic_year, github, linkedin, primary_email, secondary_email) ON CONFLICT
  if (sql.match(/INSERT INTO profiles/i)) {
    let profile = db.profiles.find((p: any) => p.user_id === params[0]);
    if (profile) {
      profile.branch = params[1];
      profile.specialization = params[2];
      profile.languages = params[3];
      profile.skill_level = params[4];
      profile.academic_year = params[5];
      profile.github = params[6] || 'https://github.com/abhishek37-datascience';
      profile.linkedin = params[7] || 'https://www.linkedin.com/in/kavala-sivaramasaiabhishek-586b623a1';
      profile.primary_email = params[8] || 'kavalaabhishek37@gmail.com';
      profile.secondary_email = params[9] || 'kavalasivaramasaiabhishek37@gmail.com';
      profile.updated_at = new Date().toISOString();
    } else {
      profile = {
        user_id: params[0],
        branch: params[1],
        specialization: params[2],
        languages: params[3],
        skill_level: params[4],
        academic_year: params[5],
        github: params[6] || 'https://github.com/abhishek37-datascience',
        linkedin: params[7] || 'https://www.linkedin.com/in/kavala-sivaramasaiabhishek-586b623a1',
        primary_email: params[8] || 'kavalaabhishek37@gmail.com',
        secondary_email: params[9] || 'kavalasivaramasaiabhishek37@gmail.com',
        updated_at: new Date().toISOString()
      };
      db.profiles.push(profile);
    }
    writeLocalDb(db);
    return { rows: [profile], rowCount: 1 };
  }

  // 7. SELECT project_id FROM saved_projects WHERE user_id = $1
  if (sql.match(/SELECT project_id FROM saved_projects WHERE user_id =/i)) {
    const rows = db.saved_projects.filter((sp: any) => sp.user_id === params[0]);
    return { rows, rowCount: rows.length };
  }

  // 8. SELECT project_id FROM favorite_projects WHERE user_id = $1
  if (sql.match(/SELECT project_id FROM favorite_projects WHERE user_id =/i)) {
    const rows = db.favorite_projects.filter((fp: any) => fp.user_id === params[0]);
    return { rows, rowCount: rows.length };
  }

  // 9. SELECT project_id FROM completed_projects WHERE user_id = $1
  if (sql.match(/SELECT project_id FROM completed_projects WHERE user_id =/i)) {
    const rows = db.completed_projects.filter((cp: any) => cp.user_id === params[0]);
    return { rows, rowCount: rows.length };
  }

  // 10. SELECT query FROM search_history WHERE user_id = $1 ORDER BY created_at DESC LIMIT 10
  if (sql.match(/SELECT query FROM search_history/i)) {
    const rows = db.search_history
      .filter((sh: any) => sh.user_id === params[0])
      .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 10);
    return { rows, rowCount: rows.length };
  }

  // 11. SELECT project_id, percent, completed_steps FROM project_progress WHERE user_id = $1
  if (sql.match(/SELECT project_id, percent, completed_steps FROM project_progress WHERE user_id =/i)) {
    const rows = db.project_progress.filter((pp: any) => pp.user_id === params[0]);
    return { rows, rowCount: rows.length };
  }

  // 12. SELECT * FROM saved_projects WHERE user_id = $1 AND project_id = $2
  if (sql.match(/SELECT \* FROM saved_projects WHERE user_id =/i)) {
    const rows = db.saved_projects.filter((sp: any) => sp.user_id === params[0] && sp.project_id === params[1]);
    return { rows, rowCount: rows.length };
  }

  // 13. DELETE FROM saved_projects WHERE user_id = $1 AND project_id = $2
  if (sql.match(/DELETE FROM saved_projects WHERE user_id =/i)) {
    const before = db.saved_projects.length;
    db.saved_projects = db.saved_projects.filter((sp: any) => !(sp.user_id === params[0] && sp.project_id === params[1]));
    writeLocalDb(db);
    return { rows: [], rowCount: before - db.saved_projects.length };
  }

  // 14. INSERT INTO saved_projects (user_id, project_id) VALUES ($1, $2)
  if (sql.match(/INSERT INTO saved_projects/i)) {
    db.saved_projects.push({
      user_id: params[0],
      project_id: params[1],
      created_at: new Date().toISOString()
    });
    writeLocalDb(db);
    return { rows: [], rowCount: 1 };
  }

  // 15. SELECT * FROM favorite_projects WHERE user_id = $1 AND project_id = $2
  if (sql.match(/SELECT \* FROM favorite_projects WHERE user_id =/i)) {
    const rows = db.favorite_projects.filter((fp: any) => fp.user_id === params[0] && fp.project_id === params[1]);
    return { rows, rowCount: rows.length };
  }

  // 16. DELETE FROM favorite_projects WHERE user_id = $1 AND project_id = $2
  if (sql.match(/DELETE FROM favorite_projects/i)) {
    const before = db.favorite_projects.length;
    db.favorite_projects = db.favorite_projects.filter((fp: any) => !(fp.user_id === params[0] && fp.project_id === params[1]));
    writeLocalDb(db);
    return { rows: [], rowCount: before - db.favorite_projects.length };
  }

  // 17. INSERT INTO favorite_projects (user_id, project_id) VALUES ($1, $2)
  if (sql.match(/INSERT INTO favorite_projects/i)) {
    db.favorite_projects.push({
      user_id: params[0],
      project_id: params[1],
      created_at: new Date().toISOString()
    });
    writeLocalDb(db);
    return { rows: [], rowCount: 1 };
  }

  // 18. SELECT * FROM completed_projects WHERE user_id = $1 AND project_id = $2
  if (sql.match(/SELECT \* FROM completed_projects WHERE user_id =/i)) {
    const rows = db.completed_projects.filter((cp: any) => cp.user_id === params[0] && cp.project_id === params[1]);
    return { rows, rowCount: rows.length };
  }

  // 19. DELETE FROM completed_projects WHERE user_id = $1 AND project_id = $2
  if (sql.match(/DELETE FROM completed_projects/i)) {
    const before = db.completed_projects.length;
    db.completed_projects = db.completed_projects.filter((cp: any) => !(cp.user_id === params[0] && cp.project_id === params[1]));
    writeLocalDb(db);
    return { rows: [], rowCount: before - db.completed_projects.length };
  }

  // 20. INSERT INTO completed_projects (user_id, project_id) VALUES ($1, $2)
  if (sql.match(/INSERT INTO completed_projects/i)) {
    db.completed_projects.push({
      user_id: params[0],
      project_id: params[1],
      created_at: new Date().toISOString()
    });
    writeLocalDb(db);
    return { rows: [], rowCount: 1 };
  }

  // 21. SELECT completed_steps FROM project_progress
  if (sql.match(/SELECT completed_steps FROM project_progress/i) || sql.match(/SELECT .* FROM project_progress WHERE user_id = \$1 AND project_id = \$2/i)) {
    const row = db.project_progress.find((pp: any) => pp.user_id === params[0] && pp.project_id === params[1]);
    return { rows: row ? [row] : [], rowCount: row ? 1 : 0 };
  }

  // 22. INSERT INTO project_progress
  if (sql.match(/INSERT INTO project_progress/i)) {
    let pp = db.project_progress.find((p: any) => p.user_id === params[0] && p.project_id === params[1]);
    if (pp) {
      pp.percent = params[2];
      pp.completed_steps = params[3];
      pp.updated_at = new Date().toISOString();
    } else {
      pp = {
        user_id: params[0],
        project_id: params[1],
        percent: params[2],
        completed_steps: params[3],
        updated_at: new Date().toISOString()
      };
      db.project_progress.push(pp);
    }
    writeLocalDb(db);
    return { rows: [pp], rowCount: 1 };
  }

  // 23. DELETE FROM search_history WHERE user_id = $1 AND query = $2
  if (sql.match(/DELETE FROM search_history/i)) {
    const before = db.search_history.length;
    db.search_history = db.search_history.filter((sh: any) => !(sh.user_id === params[0] && sh.query === params[1]));
    writeLocalDb(db);
    return { rows: [], rowCount: before - db.search_history.length };
  }

  // 24. INSERT INTO search_history
  if (sql.match(/INSERT INTO search_history/i)) {
    const row = {
      id: Math.floor(Math.random() * 1000000),
      user_id: params[0],
      query: params[1],
      created_at: new Date().toISOString()
    };
    db.search_history.push(row);
    writeLocalDb(db);
    return { rows: [], rowCount: 1 };
  }

  // 25. INSERT INTO feedback
  if (sql.match(/INSERT INTO feedback/i)) {
    const row = {
      id: Math.floor(Math.random() * 1000000),
      user_id: params[0] || null,
      name: params[1],
      email: params[2],
      feedback_type: params[3],
      details: params[4],
      created_at: new Date().toISOString()
    };
    db.feedback.push(row);
    writeLocalDb(db);
    return { rows: [], rowCount: 1 };
  }

  // 26. INSERT INTO viewed_projects
  if (sql.match(/INSERT INTO viewed_projects/i)) {
    let vp = db.viewed_projects.find((p: any) => p.user_id === params[0] && p.project_id === params[1]);
    if (vp) {
      vp.viewed_at = new Date().toISOString();
    } else {
      vp = {
        user_id: params[0],
        project_id: params[1],
        viewed_at: new Date().toISOString()
      };
      db.viewed_projects.push(vp);
    }
    writeLocalDb(db);
    return { rows: [vp], rowCount: 1 };
  }

  // 27. SELECT * FROM viewed_projects
  if (sql.match(/SELECT \* FROM viewed_projects/i)) {
    const rows = db.viewed_projects.filter((vp: any) => vp.user_id === params[0]);
    return { rows, rowCount: rows.length };
  }

  console.warn('⚠️ Unknown SQL Query executed on Local Emulator:', sql);
  return { rows: [], rowCount: 0 };
}

export const pool = {
  async query(text: string, params?: any[], callback?: (err: any, result?: any) => void): Promise<any> {
    if (!useLocalFallback) {
      try {
        const result = await realPool.query(text, params);
        if (callback) {
          callback(null, result);
        }
        return result;
      } catch (err: any) {
        if (err.code === 'ECONNREFUSED' || err.message.includes('connection') || err.message.includes('timeout')) {
          console.warn('⚠️ Connection to PostgreSQL failed. Falling back to local file database.');
          useLocalFallback = true;
        } else {
          if (callback) {
            callback(err);
          }
          throw err;
        }
      }
    }

    try {
      const result = await runLocalQuery(text, params || []);
      if (callback) {
        callback(null, result);
      }
      return result;
    } catch (err: any) {
      if (callback) {
        callback(err);
      }
      throw err;
    }
  },

  async connect() {
    if (useLocalFallback) {
      return {
        query: (text: string, params?: any[]) => this.query(text, params),
        release: () => {}
      };
    }
    try {
      return await realPool.connect();
    } catch (err: any) {
      console.warn('⚠️ PostgreSQL connect failed. Falling back to emulated database connection.');
      useLocalFallback = true;
      return {
        query: (text: string, params?: any[]) => this.query(text, params),
        release: () => {}
      };
    }
  }
};
