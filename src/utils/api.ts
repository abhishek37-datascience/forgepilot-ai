const API_BASE_URL = 'http://localhost:5000/api';

export function getToken(): string | null {
  return localStorage.getItem('forge_token');
}

export function setToken(token: string) {
  localStorage.setItem('forge_token', token);
}

export function removeToken() {
  localStorage.removeItem('forge_token');
}

async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers || {});
  
  const token = getToken();
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  if (options.body && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Network request failed.');
  }

  return data as T;
}

export const api = {
  auth: {
    signup: (name: string, email: string, password: string) => 
      apiRequest<{ token: string; user: { name: string; email: string } }>('/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ name, email, password })
      }),
      
    login: (email: string, password: string) =>
      apiRequest<{ token: string; user: { name: string; email: string } }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      }),

    forgotPassword: (email: string) =>
      apiRequest<{ message: string; tempPassword?: string }>('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email })
      })
  },

  profile: {
    get: () => 
      apiRequest<{
        branch: string;
        specialization: string;
        languages: string[];
        skill_level: string;
        academic_year: string;
        github?: string;
        linkedin?: string;
        primary_email?: string;
        secondary_email?: string;
      }>('/profile'),

    save: (profileData: {
      branch: string;
      specialization: string;
      languages: string[];
      skillLevel: string;
      academicYear: string;
      github?: string;
      linkedin?: string;
      primaryEmail?: string;
      secondaryEmail?: string;
    }) =>
      apiRequest<{ message: string; profile: any }>('/profile', {
        method: 'POST',
        body: JSON.stringify(profileData)
      })
  },

  activity: {
    get: () =>
      apiRequest<{
        saved: string[];
        favorites: string[];
        completed: string[];
        history: string[];
        progress: Record<string, { percent: number; completedSteps: number[] }>;
      }>('/activity'),

    toggleSave: (projectId: string) =>
      apiRequest<{ isSaved: boolean }>('/activity/save', {
        method: 'POST',
        body: JSON.stringify({ projectId })
      }),

    toggleFavorite: (projectId: string) =>
      apiRequest<{ isFavorite: boolean }>('/activity/favorite', {
        method: 'POST',
        body: JSON.stringify({ projectId })
      }),

    toggleComplete: (projectId: string) =>
      apiRequest<{ isCompleted: boolean }>('/activity/complete', {
        method: 'POST',
        body: JSON.stringify({ projectId })
      }),

    updateProgress: (projectId: string, stepIndex: number, isCompleted: boolean, totalSteps: number) =>
      apiRequest<{ percent: number; completedSteps: number[] }>('/activity/progress', {
        method: 'POST',
        body: JSON.stringify({ projectId, stepIndex, isCompleted, totalSteps })
      }),

    logSearch: (query: string) =>
      apiRequest<{ success: boolean }>('/activity/history', {
        method: 'POST',
        body: JSON.stringify({ query })
      }),

    logView: (projectId: string) =>
      apiRequest<{ success: boolean }>('/activity/view', {
        method: 'POST',
        body: JSON.stringify({ projectId })
      }),

    submitFeedback: (name: string, email: string, feedbackType: string, details: string, userId?: string | null) =>
      apiRequest<{ success: boolean; message: string }>('/activity/feedback', {
        method: 'POST',
        body: JSON.stringify({ name, email, feedbackType, details, userId })
      }),

    mentorChat: (projectId: string, message: string, chatHistory: any[], project: any) =>
      apiRequest<{ reply: string }>('/activity/mentor-chat', {
        method: 'POST',
        body: JSON.stringify({ projectId, message, chatHistory, project })
      })
  }
};
