import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserRole } from '../types/account';

const WORKSPACE_ROLE_KEY = 'mexo_quiz_selected_workspace_role';

interface RoleContextType {
  activeRole: UserRole;
  availableRoles: UserRole[];
  switchRole: (role: UserRole) => void;
  showRoleSelector: boolean;
  setShowRoleSelector: (show: boolean) => void;
}

const RoleContext = createContext<RoleContextType | null>(null);

export const RoleProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeRole, setActiveRole] = useState<UserRole>(() => {
    const saved = localStorage.getItem(WORKSPACE_ROLE_KEY);
    if (saved === 'student' || saved === 'teacher' || saved === 'admin') return saved as UserRole;
    return 'student';
  });

  const [availableRoles] = useState<UserRole[]>(['student', 'teacher', 'admin']);
  const [showRoleSelector, setShowRoleSelector] = useState(false);

  const switchRole = (role: UserRole) => {
    setActiveRole(role);
    try {
      localStorage.setItem(WORKSPACE_ROLE_KEY, role);
    } catch (e) {}
    setShowRoleSelector(false);
  };

  return (
    <RoleContext.Provider
      value={{
        activeRole,
        availableRoles,
        switchRole,
        showRoleSelector,
        setShowRoleSelector,
      }}
    >
      {children}
    </RoleContext.Provider>
  );
};

export const useRole = () => {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error('useRole must be used within RoleProvider');
  return ctx;
};
