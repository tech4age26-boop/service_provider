import React, { createContext, useContext, useState, useEffect } from 'react';
import { Permission } from '../types/rbac';

interface RBACContextType {
    // Current session permissions (for UI visibility)
    currentPermissions: Permission[];
    setCurrentPermissions: (permissions: Permission[]) => void;
    hasPermission: (permission: Permission) => boolean;
    initialize: (userData: any) => void;

    // Per-employee storage (for owner view / local cache)
    employeePermissions: Record<string, { roleName: string; permissions: Permission[] }>;
    saveEmployeePermissions: (employeeId: string, roleName: string, permissions: Permission[]) => void;
    getEmployeePermissions: (employeeId: string) => { roleName: string; permissions: Permission[] } | undefined;
}

const RBACContext = createContext<RBACContextType | undefined>(undefined);

export const RBACProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // Default to owner permissions until initialized
    const [currentPermissions, setCurrentPermissions] = useState<Permission[]>(Object.values(Permission));
    const [employeePermissions, setEmployeePermissions] = useState<Record<string, { roleName: string; permissions: Permission[] }>>({});

    const initialize = (userData: any) => {
        if (!userData) return;

        // If it's the workshop owner, keep all permissions
        if (userData.type === 'workshop' || userData.role === 'owner') {
            setCurrentPermissions(Object.values(Permission));
        } else if (userData.permissions) {
            // If it's an employee, load their specific permissions
            setCurrentPermissions(userData.permissions);
        } else {
            // Fallback for types without explicit permissions yet
            setCurrentPermissions([]);
        }
    };

    const saveEmployeePermissions = (employeeId: string, roleName: string, permissions: Permission[]) => {
        setEmployeePermissions(prev => ({
            ...prev,
            [employeeId]: { roleName, permissions }
        }));
    };

    const getEmployeePermissions = (employeeId: string) => {
        return employeePermissions[employeeId];
    };

    const hasPermission = (permission: Permission) => {
        return currentPermissions.includes(permission);
    };

    return (
        <RBACContext.Provider
            value={{
                currentPermissions,
                setCurrentPermissions,
                hasPermission,
                initialize,
                employeePermissions,
                saveEmployeePermissions,
                getEmployeePermissions
            }}
        >
            {children}
        </RBACContext.Provider>
    );
};

export const useRBAC = () => {
    const context = useContext(RBACContext);
    if (!context) {
        throw new Error('useRBAC must be used within an RBACProvider');
    }
    return context;
};
