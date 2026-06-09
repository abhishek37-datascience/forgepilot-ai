import { Response } from 'express';
import { Router } from 'express';
import { pool } from '../db';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

// Get Profile
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;

  try {
    const result = await pool.query('SELECT * FROM profiles WHERE user_id = $1', [userId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Profile not configured yet.' });
    }
    res.status(200).json(result.rows[0]);
  } catch (err: any) {
    console.error('Fetch Profile Error:', err.message);
    res.status(500).json({ error: 'Failed to retrieve user profile.' });
  }
});

// Update or Create Profile (Upsert)
router.post('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  const branch = req.body.branch || 'Computer Science Engineering (CSE)';
  const specialization = req.body.specialization || 'None';
  const languages = req.body.languages || ['Python', 'JavaScript'];
  const skillLevel = req.body.skillLevel || 'Beginner';
  const academicYear = req.body.academicYear || '1st Year';

  try {
    const query = `
      INSERT INTO profiles (user_id, branch, specialization, languages, skill_level, academic_year)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (user_id) DO UPDATE
      SET branch = EXCLUDED.branch,
          specialization = EXCLUDED.specialization,
          languages = EXCLUDED.languages,
          skill_level = EXCLUDED.skill_level,
          academic_year = EXCLUDED.academic_year,
          updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `;

    const result = await pool.query(query, [
      userId,
      branch,
      specialization,
      languages,
      skillLevel,
      academicYear
    ]);

    res.status(200).json({
      message: 'Profile saved successfully.',
      profile: result.rows[0]
    });
  } catch (err: any) {
    console.error('Save Profile Error:', err.message);
    res.status(500).json({ error: 'Failed to save academic profile in database.' });
  }
});

export default router;
