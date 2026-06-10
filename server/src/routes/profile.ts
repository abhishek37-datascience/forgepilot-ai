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

router.post('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  const branch = req.body.branch || 'Computer Science Engineering (CSE)';
  const specialization = req.body.specialization || 'None';
  const languages = req.body.languages || ['Python', 'JavaScript'];
  const skillLevel = req.body.skillLevel || 'Beginner';
  const academicYear = req.body.academicYear || '1st Year';
  const github = req.body.github || 'https://github.com/abhishek37-datascience';
  const linkedin = req.body.linkedin || 'https://www.linkedin.com/in/kavala-sivaramasaiabhishek-586b623a1';
  const primaryEmail = req.body.primaryEmail || 'kavalaabhishek37@gmail.com';
  const secondaryEmail = req.body.secondaryEmail || 'kavalasivaramasaiabhishek37@gmail.com';

  try {
    const query = `
      INSERT INTO profiles (user_id, branch, specialization, languages, skill_level, academic_year, github, linkedin, primary_email, secondary_email)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      ON CONFLICT (user_id) DO UPDATE
      SET branch = EXCLUDED.branch,
          specialization = EXCLUDED.specialization,
          languages = EXCLUDED.languages,
          skill_level = EXCLUDED.skill_level,
          academic_year = EXCLUDED.academic_year,
          github = EXCLUDED.github,
          linkedin = EXCLUDED.linkedin,
          primary_email = EXCLUDED.primary_email,
          secondary_email = EXCLUDED.secondary_email,
          updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `;

    const result = await pool.query(query, [
      userId,
      branch,
      specialization,
      languages,
      skillLevel,
      academicYear,
      github,
      linkedin,
      primaryEmail,
      secondaryEmail
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
