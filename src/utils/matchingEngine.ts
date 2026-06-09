import { projectsDatabase } from '../data/projectsDatabase';
import { adaptProject } from './projectAdapter';
import type { AdaptedProject } from './projectAdapter';

interface UserProfile {
  branch: string;
  specialization: string;
  languages: string[];
  skillLevel: string;
  academicYear: string;
}

export function generateRecommendations(profile: UserProfile): AdaptedProject[] {
  // Score and rank all 50 projects
  const scoredProjects = projectsDatabase.map((project) => {
    let score = 0;

    // 1. Branch Match (Core relevance)
    if (project.branch.toLowerCase() === profile.branch.toLowerCase()) {
      score += 120;
    } else {
      // Partial branch match for related disciplines (e.g. CSE and IT)
      const isITorCSE = (project.branch.includes('CSE') || project.branch.includes('IT') || project.branch.includes('Computer Science') || project.branch.includes('Information Technology'));
      const userITorCSE = (profile.branch.includes('CSE') || profile.branch.includes('IT') || profile.branch.includes('Computer Science') || profile.branch.includes('Information Technology'));
      if (isITorCSE && userITorCSE) score += 60;

      // Hardware branch partial match (ECE, EEE, IoT, Robotics)
      const isHardware = (project.branch.includes('ECE') || project.branch.includes('EEE') || project.branch.includes('IoT') || project.branch.includes('Robotics') || project.branch.includes('Electronics'));
      const userHardware = (profile.branch.includes('ECE') || profile.branch.includes('EEE') || profile.branch.includes('IoT') || profile.branch.includes('Robotics') || profile.branch.includes('Electronics'));
      if (isHardware && userHardware) score += 40;
    }

    // 2. Specialization Match
    if (profile.specialization && project.specialization.toLowerCase() === profile.specialization.toLowerCase()) {
      score += 80;
    } else if (profile.specialization && profile.specialization !== 'None') {
      // Check if specialization matches fields of ML/AI
      const isAIField = ['Artificial Intelligence', 'Machine Learning', 'Deep Learning', 'Computer Vision', 'Natural Language Processing'].includes(project.specialization);
      const userAIField = ['Artificial Intelligence', 'Machine Learning', 'Deep Learning', 'Computer Vision', 'Natural Language Processing'].includes(profile.specialization);
      if (isAIField && userAIField) score += 40;
    }

    // 3. Programming Language Overlap
    const languageOverlap = project.languages.filter(lang => 
      profile.languages.map(l => l.toLowerCase()).includes(lang.toLowerCase())
    );
    score += languageOverlap.length * 30;

    // 4. Difficulty Level Preference
    if (project.difficultyLevel.toLowerCase() === profile.skillLevel.toLowerCase()) {
      score += 40;
    } else {
      // Secondary preference based on year of study
      const isFirstOrSecondYear = ['1st Year', '2nd Year'].includes(profile.academicYear);
      const isThirdOrFourthYear = ['3rd Year', '4th Year'].includes(profile.academicYear);
      
      if (isFirstOrSecondYear && project.difficultyLevel === 'Beginner') score += 20;
      if (isThirdOrFourthYear && project.difficultyLevel === 'Advanced') score += 20;
    }

    return {
      project,
      score
    };
  });

  // Sort by score in descending order
  scoredProjects.sort((a, b) => b.score - a.score);

  // Adapt all sorted projects to return personalized blueprints
  return scoredProjects.map(({ project }) => adaptProject(project, profile));
}
