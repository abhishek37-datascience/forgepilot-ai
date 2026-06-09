export interface UserActivity {
  saved: string[];      // Project IDs
  favorites: string[];  // Project IDs
  completed: string[];  // Project IDs
  viewed: { id: string; timestamp: number }[]; // Viewed project logs
  history: string[];    // Search queries history
  progress: Record<string, { percent: number; completedSteps: number[] }>; // Project ID -> progress tracking
}

const STORAGE_KEY = "forge_user_activity";

const defaultActivity: UserActivity = {
  saved: [],
  favorites: [],
  completed: [],
  viewed: [],
  history: [],
  progress: {}
};

export function getActivity(): UserActivity {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return defaultActivity;
  try {
    return { ...defaultActivity, ...JSON.parse(data) };
  } catch {
    return defaultActivity;
  }
}

function saveActivity(activity: UserActivity) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(activity));
}

// Toggle Bookmarked / Saved Project
export function toggleSaveProject(projectId: string): boolean {
  const act = getActivity();
  const index = act.saved.indexOf(projectId);
  let isSaved = false;
  if (index >= 0) {
    act.saved.splice(index, 1);
  } else {
    act.saved.push(projectId);
    isSaved = true;
  }
  saveActivity(act);
  return isSaved;
}

// Toggle Favorite Project
export function toggleFavoriteProject(projectId: string): boolean {
  const act = getActivity();
  const index = act.favorites.indexOf(projectId);
  let isFav = false;
  if (index >= 0) {
    act.favorites.splice(index, 1);
  } else {
    act.favorites.push(projectId);
    isFav = true;
  }
  saveActivity(act);
  return isFav;
}

// Toggle Completed Project
export function toggleCompleteProject(projectId: string): boolean {
  const act = getActivity();
  const index = act.completed.indexOf(projectId);
  let isComp = false;
  if (index >= 0) {
    act.completed.splice(index, 1);
  } else {
    act.completed.push(projectId);
    isComp = true;
  }
  saveActivity(act);
  return isComp;
}

// Log a project view (Recently Viewed)
export function logProjectView(projectId: string) {
  const act = getActivity();
  // Filter out existing view of this project to put it at the top
  act.viewed = act.viewed.filter(v => v.id !== projectId);
  act.viewed.unshift({ id: projectId, timestamp: Date.now() });
  // Limit view history to 30 items
  if (act.viewed.length > 30) {
    act.viewed.pop();
  }
  saveActivity(act);
}

// Save a search query in history
export function saveSearchQuery(query: string) {
  if (!query.trim()) return;
  const act = getActivity();
  act.history = act.history.filter(q => q.toLowerCase() !== query.toLowerCase());
  act.history.unshift(query);
  if (act.history.length > 10) {
    act.history.pop();
  }
  saveActivity(act);
}

// Track roadmap step completion
export function updateStepProgress(projectId: string, stepIndex: number, isCompleted: boolean, totalSteps: number) {
  const act = getActivity();
  if (!act.progress[projectId]) {
    act.progress[projectId] = { percent: 0, completedSteps: [] };
  }

  const projProgress = act.progress[projectId];
  const steps = projProgress.completedSteps;
  const stepIdx = steps.indexOf(stepIndex);

  if (isCompleted && stepIdx < 0) {
    steps.push(stepIndex);
  } else if (!isCompleted && stepIdx >= 0) {
    steps.splice(stepIdx, 1);
  }

  // Calculate percentage
  projProgress.percent = totalSteps > 0 ? Math.round((steps.length / totalSteps) * 100) : 0;
  
  // Auto-mark as completed project if 100%
  const completedIdx = act.completed.indexOf(projectId);
  if (projProgress.percent === 100 && completedIdx < 0) {
    act.completed.push(projectId);
  } else if (projProgress.percent < 100 && completedIdx >= 0) {
    act.completed.splice(completedIdx, 1);
  }

  saveActivity(act);
}

export function clearActivity() {
  saveActivity(defaultActivity);
}
