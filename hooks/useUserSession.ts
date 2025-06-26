
import useLocalStorage from './useLocalStorage';
import { User } from '../types';
import { useCallback } from 'react';
// Note: useNavigate cannot be used directly in hooks. Navigation should be handled in components.
// This hook will set the user, and components will react to currentUser change to navigate.

const USERS_STORAGE_KEY = 'biomonitor_users';
const CURRENT_USER_ID_STORAGE_KEY = 'biomonitor_current_user_id';

export const useUserSession = () => {
  const [users, setUsers] = useLocalStorage<User[]>(USERS_STORAGE_KEY, []);
  const [currentUserId, setCurrentUserId] = useLocalStorage<string | null>(CURRENT_USER_ID_STORAGE_KEY, null);

  const addUser = useCallback((user: Omit<User, 'id'>) => {
    const newUser = { ...user, id: Date.now().toString() };
    setUsers(prevUsers => [...prevUsers, newUser]);
    setCurrentUserId(newUser.id); // Set new user as current
    // Navigation to '/welcome' will be handled by RegisterUserPage based on currentUser update
    return newUser;
  }, [setUsers, setCurrentUserId]);

  const updateUser = useCallback((updatedUser: User) => {
    setUsers(prevUsers =>
      prevUsers.map(user => (user.id === updatedUser.id ? updatedUser : user))
    );
  }, [setUsers]);

  const deleteUser = useCallback((userId: string) => {
    setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
    if (currentUserId === userId) {
      setCurrentUserId(null);
    }
  }, [setUsers, currentUserId, setCurrentUserId]);

  const selectUser = useCallback((userId: string) => {
    setCurrentUserId(userId);
    // Navigation to '/welcome' will be handled by HomePage based on currentUser update
  }, [setCurrentUserId]);

  const clearCurrentUser = useCallback(() => {
    setCurrentUserId(null);
  }, [setCurrentUserId]);
  
  const currentUser = users.find(user => user.id === currentUserId) || null;

  return {
    users,
    addUser,
    updateUser,
    deleteUser,
    currentUser,
    selectUser,
    clearCurrentUser,
  };
};