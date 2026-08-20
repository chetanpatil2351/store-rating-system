import { User } from './types';

const CURRENT_USER_KEY = 'storerater_current_user_v1';

export const getStoredCurrentUser = (): User | null => {
  try {
    const data = localStorage.getItem(CURRENT_USER_KEY);

    if (!data) {
      return null;
    }

    return JSON.parse(data) as User;
  } catch {
    return null;
  }
};

export const saveCurrentUser = (user: User | null): void => {
  try {
    if (!user) {
      localStorage.removeItem(CURRENT_USER_KEY);
      return;
    }

    localStorage.setItem(
      CURRENT_USER_KEY,
      JSON.stringify(user)
    );
  } catch {
    // Ignore localStorage errors.
  }
};