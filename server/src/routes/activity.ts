import { Response } from 'express';
import { Router } from 'express';
import { pool } from '../db';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

// 1. Get All Activity Data
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;

  try {
    const [saved, favorites, completed, history, progress] = await Promise.all([
      pool.query('SELECT project_id FROM saved_projects WHERE user_id = $1', [userId]),
      pool.query('SELECT project_id FROM favorite_projects WHERE user_id = $1', [userId]),
      pool.query('SELECT project_id FROM completed_projects WHERE user_id = $1', [userId]),
      pool.query('SELECT query FROM search_history WHERE user_id = $1 ORDER BY created_at DESC LIMIT 10', [userId]),
      pool.query('SELECT project_id, percent, completed_steps FROM project_progress WHERE user_id = $1', [userId])
    ]);

    const formattedProgress = progress.rows.reduce((acc: any, row: any) => {
      acc[row.project_id] = {
        percent: row.percent,
        completedSteps: row.completed_steps || []
      };
      return acc;
    }, {} as Record<string, { percent: number; completedSteps: number[] }>);

    res.status(200).json({
      saved: saved.rows.map((r: any) => r.project_id),
      favorites: favorites.rows.map((r: any) => r.project_id),
      completed: completed.rows.map((r: any) => r.project_id),
      history: history.rows.map((r: any) => r.query),
      progress: formattedProgress
    });
  } catch (err: any) {
    console.error('Fetch Activity Error:', err.message);
    res.status(500).json({ error: 'Failed to sync user activities.' });
  }
});

// 2. Toggle Bookmark / Saved
router.post('/save', authenticateToken, async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  const { projectId } = req.body;

  if (!projectId) return res.status(400).json({ error: 'Project ID is required.' });

  try {
    const check = await pool.query('SELECT * FROM saved_projects WHERE user_id = $1 AND project_id = $2', [userId, projectId]);
    let isSaved = false;

    if (check.rows.length > 0) {
      await pool.query('DELETE FROM saved_projects WHERE user_id = $1 AND project_id = $2', [userId, projectId]);
    } else {
      await pool.query('INSERT INTO saved_projects (user_id, project_id) VALUES ($1, $2)', [userId, projectId]);
      isSaved = true;
    }

    res.status(200).json({ isSaved });
  } catch (err: any) {
    console.error('Toggle Save Error:', err.message);
    res.status(500).json({ error: 'Failed to update saved project.' });
  }
});

// 3. Toggle Favorite
router.post('/favorite', authenticateToken, async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  const { projectId } = req.body;

  if (!projectId) return res.status(400).json({ error: 'Project ID is required.' });

  try {
    const check = await pool.query('SELECT * FROM favorite_projects WHERE user_id = $1 AND project_id = $2', [userId, projectId]);
    let isFavorite = false;

    if (check.rows.length > 0) {
      await pool.query('DELETE FROM favorite_projects WHERE user_id = $1 AND project_id = $2', [userId, projectId]);
    } else {
      await pool.query('INSERT INTO favorite_projects (user_id, project_id) VALUES ($1, $2)', [userId, projectId]);
      isFavorite = true;
    }

    res.status(200).json({ isFavorite });
  } catch (err: any) {
    console.error('Toggle Favorite Error:', err.message);
    res.status(500).json({ error: 'Failed to update favorite project.' });
  }
});

// 4. Toggle Complete
router.post('/complete', authenticateToken, async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  const { projectId } = req.body;

  if (!projectId) return res.status(400).json({ error: 'Project ID is required.' });

  try {
    const check = await pool.query('SELECT * FROM completed_projects WHERE user_id = $1 AND project_id = $2', [userId, projectId]);
    let isCompleted = false;

    if (check.rows.length > 0) {
      await pool.query('DELETE FROM completed_projects WHERE user_id = $1 AND project_id = $2', [userId, projectId]);
    } else {
      await pool.query('INSERT INTO completed_projects (user_id, project_id) VALUES ($1, $2)', [userId, projectId]);
      isCompleted = true;
    }

    res.status(200).json({ isCompleted });
  } catch (err: any) {
    console.error('Toggle Complete Error:', err.message);
    res.status(500).json({ error: 'Failed to update completed project.' });
  }
});

// 5. Track Roadmap Step progress
router.post('/progress', authenticateToken, async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  const { projectId, stepIndex, isCompleted, totalSteps } = req.body;

  if (!projectId || stepIndex === undefined || isCompleted === undefined || !totalSteps) {
    return res.status(400).json({ error: 'Missing progress logging parameters.' });
  }

  try {
    // 1. Fetch current progress array
    const result = await pool.query(
      'SELECT completed_steps FROM project_progress WHERE user_id = $1 AND project_id = $2',
      [userId, projectId]
    );

    let completedSteps: number[] = [];
    if (result.rows.length > 0) {
      completedSteps = result.rows[0].completed_steps || [];
    }

    // Add or remove target step
    const idx = completedSteps.indexOf(stepIndex);
    if (isCompleted && idx < 0) {
      completedSteps.push(stepIndex);
    } else if (!isCompleted && idx >= 0) {
      completedSteps.splice(idx, 1);
    }

    // Calculate percent
    const percent = Math.round((completedSteps.length / totalSteps) * 100);

    // Upsert progress
    await pool.query(`
      INSERT INTO project_progress (user_id, project_id, percent, completed_steps)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (user_id, project_id) DO UPDATE
      SET percent = EXCLUDED.percent,
          completed_steps = EXCLUDED.completed_steps,
          updated_at = CURRENT_TIMESTAMP
    `, [userId, projectId, percent, completedSteps]);

    // Handle completed_projects catalog sync
    if (percent === 100) {
      await pool.query(`
        INSERT INTO completed_projects (user_id, project_id)
        VALUES ($1, $2) ON CONFLICT DO NOTHING
      `, [userId, projectId]);
    } else {
      await pool.query('DELETE FROM completed_projects WHERE user_id = $1 AND project_id = $2', [userId, projectId]);
    }

    res.status(200).json({ percent, completedSteps });
  } catch (err: any) {
    console.error('Update Progress Error:', err.message);
    res.status(500).json({ error: 'Failed to update step progress logs.' });
  }
});

// 6. Save Search History Query
router.post('/history', authenticateToken, async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  const { query } = req.body;

  if (!query) return res.status(400).json({ error: 'Query parameter is missing.' });

  try {
    // Clean duplicates of this query
    await pool.query('DELETE FROM search_history WHERE user_id = $1 AND query = $2', [userId, query]);
    
    // Insert new history
    await pool.query('INSERT INTO search_history (user_id, query) VALUES ($1, $2)', [userId, query]);
    
    res.status(200).json({ success: true });
  } catch (err: any) {
    console.error('Save Search Error:', err.message);
    res.status(500).json({ error: 'Failed to save search history.' });
  }
});

// 7. Log Viewed Project
router.post('/view', authenticateToken, async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  const { projectId } = req.body;

  if (!projectId) return res.status(400).json({ error: 'Project ID is required.' });

  try {
    await pool.query(
      'INSERT INTO viewed_projects (user_id, project_id) VALUES ($1, $2) ON CONFLICT (user_id, project_id) DO UPDATE SET viewed_at = CURRENT_TIMESTAMP',
      [userId, projectId]
    );
    res.status(200).json({ success: true });
  } catch (err: any) {
    console.error('Log Viewed Error:', err.message);
    res.status(500).json({ error: 'Failed to log project view.' });
  }
});

// 8. Submit Feedback
router.post('/feedback', async (req: AuthRequest, res: Response) => {
  const { userId, name, email, feedbackType, details } = req.body;

  if (!name || !email || !feedbackType || !details) {
    return res.status(400).json({ error: 'Missing feedback inputs.' });
  }

  try {
    await pool.query(
      'INSERT INTO feedback (user_id, name, email, feedback_type, details) VALUES ($1, $2, $3, $4, $5)',
      [userId || null, name, email, feedbackType, details]
    );
    res.status(251).json({ success: true, message: 'Feedback logged.' });
  } catch (err: any) {
    console.error('Submit Feedback Error:', err.message);
    res.status(500).json({ error: 'Failed to log feedback submission.' });
  }
});

// 9. AI Mentor Chat (Gemini API Integration)
router.post('/mentor-chat', authenticateToken, async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  const { projectId, message, chatHistory = [], project } = req.body;

  if (!projectId || !message || !project) {
    return res.status(400).json({ error: 'Missing chat request parameters (projectId, message, or project context).' });
  }

  try {
    // Retrieve student profile from database
    const profileQuery = await pool.query('SELECT * FROM profiles WHERE user_id = $1', [userId]);
    const profile = profileQuery.rows[0];

    const userProfileText = profile ? `
Student Academic Profile:
- Branch: ${profile.branch}
- Specialization: ${profile.specialization}
- Programming Languages Known: ${profile.languages ? (Array.isArray(profile.languages) ? profile.languages.join(', ') : profile.languages) : 'None'}
- Skill Level: ${profile.skill_level}
- Academic Year: ${profile.academic_year}
` : '';

    const projectText = `
Project Context:
- Name: ${project.name}
- Problem Statement: ${project.problemStatement}
- Objective: ${project.objective}
- Difficulty: ${project.difficultyLevel}
- Primary Language: ${project.primaryLanguage}
- Software Requirements: ${project.software ? (Array.isArray(project.software) ? project.software.join(', ') : project.software) : ''}
- Hardware Requirements: ${project.hardware ? (Array.isArray(project.hardware) ? project.hardware.join(', ') : project.hardware) : 'None'}
- Database Design: Engine: ${project.databaseDesign?.engine || 'None'}. Tables: ${project.databaseDesign?.tables ? JSON.stringify(project.databaseDesign.tables) : 'None'}
- Development Roadmap: ${project.developmentRoadmap ? JSON.stringify(project.developmentRoadmap) : 'None'}
- Common Errors: ${project.commonErrors ? JSON.stringify(project.commonErrors) : 'None'}
- Viva Prep Questions: ${project.vivaQuestions ? JSON.stringify(project.vivaQuestions) : 'None'}
`;

    const systemInstruction = `You are the AI Project Mentor for ForgePilot AI 🚀, a premium engineering educational platform.
Your goal is to guide students step-by-step in building engineering projects.
You have access to the student's academic profile and the specific project details.

${userProfileText}
${projectText}

Instructions for your responses:
1. Speak as an encouraging, expert senior engineer and professor.
2. Tailor your explanations to the student's skill level (${profile?.skill_level || 'Intermediate'}) and branch (${profile?.branch || 'Engineering'}).
3. Answer questions about:
   - Chat Guidance: Provide general clarifications, tips, and guidelines.
   - Step-by-Step Project Guidance: Explain how to execute specific steps.
   - Project Explanation: Detail architectures, folder layouts, and system logic.
   - Debugging Help: Suggest code corrections, analyze log dumps, and resolve errors.
   - Resume Bullet Points: Generate high-impact bullet points (start with strong action verbs like 'Engineered', 'Optimized', 'Designed').
   - Viva Preparation: Ask mock oral questions and explain responses.
   - Future Enhancements: Provide suggestions on how to expand the project.
4. When writing code, provide clean, well-commented, complete code blocks using markdown syntax highlighting. Always target the student's primary language (${project.primaryLanguage}) or preferred language.
5. Keep explanations concise, professional, and practical. Ensure your tone is motivating.`;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('⚠️ GEMINI_API_KEY is not configured. Returning rich local mock response.');
      const reply = generateMockGeminiResponse(message, project, profile);
      return res.status(200).json({ reply });
    }

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    // Map chatHistory to Gemini API contents format
    const contents = chatHistory.map((msg: any) => ({
      role: msg.sender === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }]
    }));

    // Append current message
    contents.push({
      role: 'user',
      parts: [{ text: message }]
    });

    const response = await fetch(geminiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents,
        systemInstruction: {
          parts: [{ text: systemInstruction }]
        },
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048
        }
      })
    });

    if (!response.ok) {
      const errorData: any = await response.json().catch(() => ({}));
      console.error('Gemini API Error:', errorData);
      throw new Error(errorData.error?.message || `Gemini API returned status ${response.status}`);
    }

    const resData = await response.json() as any;
    const reply = resData.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated from AI Mentor.';

    res.status(200).json({ reply });
  } catch (err: any) {
    console.error('AI Mentor Error:', err.message);
    res.status(500).json({ error: 'AI Mentor failed to respond. ' + err.message });
  }
});

// Helper function to generate rich simulated LLM responses for local development
function generateMockGeminiResponse(message: string, project: any, profile: any): string {
  const q = message.toLowerCase();
  const activeStep = project.developmentRoadmap?.[0] || { step: 1, title: 'Initial Config', description: 'Configure starter files.' };
  const lang = project.primaryLanguage || 'Python';

  // 1. Code generation
  if (q.includes('code') || q.includes('write') || q.includes('program') || q.includes('snippet')) {
    if (lang === 'Python') {
      return `Here is a custom **Python** starter snippet for your active step: **${activeStep.title}**:

\`\`\`python
# main.py
import os
import sys

def init_workspace():
    print("🚀 Initializing ForgePilot AI 🚀 workspace for: ${project.name}")
    # Config parameters
    settings = {
        "status": "active",
        "step": ${activeStep.step},
        "description": "${activeStep.title}"
    }
    print(f"Loaded config: {settings}")
    return settings

if __name__ == "__main__":
    init_workspace()
\`\`\`

To run this file locally, execute the following command in your terminal:
\`python main.py\``;
    } else if (lang === 'C++' || lang === 'C') {
      return `Here is the basic firmware template inside **C++** / Arduino IDE for **${activeStep.title}**:

\`\`\`cpp
#include <Arduino.h>

// PIN configurations
const int STATUS_LED = 2; 

void setup() {
  Serial.begin(115200);
  pinMode(STATUS_LED, OUTPUT);
  Serial.println("✅ ${project.name} initializing...");
}

void loop() {
  // Simulate active roadmap step: ${activeStep.title}
  digitalWrite(STATUS_LED, HIGH);
  delay(500);
  digitalWrite(STATUS_LED, LOW);
  delay(500);
}
\`\`\`

Verify pin mapping definitions before flashing the MCU.`;
    } else {
      return `Here is the node server initialization for **${activeStep.title}** in **JavaScript / Node**:

\`\`\`javascript
const express = require('express');
const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

// Main gateway handler
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: "online",
    project: "${project.name}",
    active_step: ${activeStep.step}
  });
});

app.listen(PORT, () => {
  console.log(\`📡 ${project.name} backend listening on port \${PORT}\`);
});
\`\`\`

Install dependencies using: \`npm install express\``;
    }
  }

  // 2. Database schemas
  if (q.includes('database') || q.includes('schema') || q.includes('table') || q.includes('sql')) {
    const engine = project.databaseDesign?.engine || 'SQLite';
    const tables = project.databaseDesign?.tables || [{ name: 'records', columns: [{ name: 'id', type: 'integer' }] }];
    
    let tableMD = tables.map((t: any) => {
      let cols = t.columns.map((c: any) => `| \`${c.name}\` | ${c.type} | ${c.constraints || 'NULL'} |`).join('\n');
      return `\n#### Table: \`${t.name}\`
| Column | Type | Constraints |
| :--- | :--- | :--- |
${cols}`;
    }).join('\n');

    return `### Database Architecture (${engine})

Here is the database schema config design for **${project.name}**:
${tableMD}

#### Recommended DDL Creation Script:
\`\`\`sql
-- Schema initialization script
${tables.map((t: any) => `CREATE TABLE IF NOT EXISTS ${t.name} (
  ${t.columns.map((c: any) => `${c.name} ${c.type} ${c.constraints || ''}`).join(',\n  ')}
);`).join('\n\n')}
\`\`\``;
  }

  // 3. Debugging / Troubleshooting
  if (q.includes('error') || q.includes('bug') || q.includes('crash') || q.includes('fail') || q.includes('debug')) {
    const errorLog = project.commonErrors?.[0] || { error: 'Connection Timeout', context: 'Network overload', fix: 'Add delay limits.' };
    return `### AI Debugger Desk

Regarding the obstacle you are encountering, let's analyze typical failure states:
- **Error Flag**: \`${errorLog.error}\`
- **Context Trigger**: ${errorLog.context}
- **Resolution Path**: ${errorLog.fix}

#### Recommended Diagnostics Check:
1. Double-check your active port configuration settings.
2. Confirm libraries are fully resolved in your dependency files.
3. Add retry middleware to catch connection drops.`;
  }

  // 4. Resume bullets
  if (q.includes('resume') || q.includes('bullet') || q.includes('career') || q.includes('portfolio')) {
    return `### Tailored Resume Descriptions

Here are 3 high-impact bullet points for **${project.name}** formatted using the Action-Task-Result model:

- **Engineered** a fully functional \`${project.name}\` prototype utilizing **${lang}**, improving data synchronization throughput metrics.
- **Architected** database schemas utilizing **${project.databaseDesign?.engine || 'Relational schemas'}** to secure data integrity.
- **Designed** linear roadmap trackers and automated checklists, decreasing debugging latency.`;
  }

  // 5. Viva / Prep Questions
  if (q.includes('viva') || q.includes('exam') || q.includes('mock') || q.includes('oral') || q.includes('question')) {
    const viva = project.vivaQuestions?.[0] || { question: 'Explain the core logic?', answer: 'It is event driven.' };
    return `### Viva Preparation Card

Here is a mock question tailored to **${project.name}** for your oral exam preparation:

**Question**: *${viva.question}*
**Answer**: *${viva.answer}*

**Prof Tip**: When answering, focus on *why* you chose **${lang}** and the database structure you implemented to demonstrate architecture-level understanding.`;
  }

  // 6. Enhancements
  if (q.includes('enhance') || q.includes('expansion') || q.includes('scope') || q.includes('future')) {
    return `### Future Expansion Recommendations

Here are 3 ideas to scale **${project.name}**:
1. **OAuth Security Integration**: Migrate credential authentication from local JWT keys to Google or GitHub OAuth.
2. **Cloud Stream Processing**: Pipe hardware data streams to cloud databases like AWS DynamoDB or Supabase.
3. **PWA Integration**: Package the dashboard layouts as a mobile Progressive Web App for offline access.`;
  }

  // Default Chat response
  return `### AI Project Mentor Workspace

Welcome to your mentoring chat! I am analyzing **${project.name}** configured for **${profile?.branch || 'Computer Engineering'}**.

You are currently working on **Step ${activeStep.step}: ${activeStep.title}** (${activeStep.description}).
I can assist you with:
- 📝 **"Write starter code"**: Generates compile-ready code templates in **${lang}**.
- 📊 **"Show database schema"**: Renders structured tables and SQL scripts.
- 🔧 **"How do I debug errors"**: Suggests diagnostics routines and fixes.
- 📄 **"Generate resume bullets"**: Outputs career-ready profile bullet points.
- 🎓 **"Start mock viva"**: Begins oral preparation drills.
- 🚀 **"Scale future features"**: Recommends advanced additions.

What details can I assist you with today?`;
}

export default router;
