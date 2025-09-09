import { useState, useEffect, useCallback } from 'react';
import { apiCall, debounce } from '@/lib/api-utils';

export interface Job {
  _id: string;
  title?: string;
  company?: string;
  description?: string;
  keywords?: string[];
  status: string;
  url?: string;
  source: string;
  createdAt: string;
  updatedAt: string;
}

export interface JobFormData {
  title: string;
  company: string;
  description: string;
  url: string;
  emailText: string;
  status: string;
}

interface UseJobsState {
  jobs: Job[];
  loading: boolean;
  error: string | null;
  isSubmitting: boolean;
}

interface UseJobsActions {
  fetchJobs: () => Promise<void>;
  addJob: (formData: JobFormData) => Promise<boolean>;
  updateJob: (id: string, updates: Partial<Job>) => Promise<boolean>;
  deleteJob: (id: string) => Promise<boolean>;
  clearError: () => void;
  retryLastAction: () => Promise<void>;
}

export function useJobs(): UseJobsState & UseJobsActions {
  const [state, setState] = useState<UseJobsState>({
    jobs: [],
    loading: true,
    error: null,
    isSubmitting: false,
  });

  const [lastFailedAction, setLastFailedAction] = useState<(() => Promise<void>) | null>(null);

  const updateState = useCallback((updates: Partial<UseJobsState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const clearError = useCallback(() => {
    updateState({ error: null });
  }, [updateState]);

  const fetchJobs = useCallback(async () => {
    try {
      updateState({ loading: true, error: null });
      
      const response = await apiCall('/api/jobs');
      
      if (response.success) {
        updateState({ 
          jobs: response.data?.data || [], 
          loading: false,
          error: null 
        });
      } else {
        updateState({ 
          loading: false, 
          error: response.error || 'Failed to fetch jobs' 
        });
        setLastFailedAction(() => fetchJobs);
      }
    } catch (error) {
      updateState({ 
        loading: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch jobs' 
      });
      setLastFailedAction(() => fetchJobs);
    }
  }, [updateState]);

  const addJob = useCallback(async (formData: JobFormData): Promise<boolean> => {
    try {
      updateState({ isSubmitting: true, error: null });
      
      const payload: any = { manual: formData };
      if (formData.url) payload.url = formData.url;
      if (formData.emailText) payload.emailText = formData.emailText;

      const response = await apiCall('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.success) {
        await fetchJobs(); // Refresh the list
        updateState({ isSubmitting: false });
        return true;
      } else {
        updateState({ 
          isSubmitting: false, 
          error: response.error || 'Failed to add job' 
        });
        setLastFailedAction(() => addJob(formData).then(() => {}));
        return false;
      }
    } catch (error) {
      updateState({ 
        isSubmitting: false, 
        error: error instanceof Error ? error.message : 'Failed to add job' 
      });
      setLastFailedAction(() => addJob(formData).then(() => {}));
      return false;
    }
  }, [updateState, fetchJobs]);

  const updateJob = useCallback(async (id: string, updates: Partial<Job>): Promise<boolean> => {
    try {
      updateState({ isSubmitting: true, error: null });

      const response = await apiCall('/api/jobs', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, updates }),
      });

      if (response.success) {
        await fetchJobs(); // Refresh the list
        updateState({ isSubmitting: false });
        return true;
      } else {
        updateState({ 
          isSubmitting: false, 
          error: response.error || 'Failed to update job' 
        });
        setLastFailedAction(() => updateJob(id, updates).then(() => {}));
        return false;
      }
    } catch (error) {
      updateState({ 
        isSubmitting: false, 
        error: error instanceof Error ? error.message : 'Failed to update job' 
      });
      setLastFailedAction(() => updateJob(id, updates).then(() => {}));
      return false;
    }
  }, [updateState, fetchJobs]);

  const deleteJob = useCallback(async (id: string): Promise<boolean> => {
    try {
      updateState({ error: null });

      const response = await apiCall('/api/jobs', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });

      if (response.success) {
        await fetchJobs(); // Refresh the list
        return true;
      } else {
        updateState({ error: response.error || 'Failed to delete job' });
        setLastFailedAction(() => deleteJob(id).then(() => {}));
        return false;
      }
    } catch (error) {
      updateState({ 
        error: error instanceof Error ? error.message : 'Failed to delete job' 
      });
      setLastFailedAction(() => deleteJob(id).then(() => {}));
      return false;
    }
  }, [updateState, fetchJobs]);

  const retryLastAction = useCallback(async () => {
    if (lastFailedAction) {
      setLastFailedAction(null);
      await lastFailedAction();
    }
  }, [lastFailedAction]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      setLastFailedAction(null);
    };
  }, []);

  return {
    ...state,
    fetchJobs,
    addJob,
    updateJob,
    deleteJob,
    clearError,
    retryLastAction,
  };
}
