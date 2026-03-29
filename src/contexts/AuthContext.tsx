import React, { createContext, useContext, useEffect, useState } from "react";
import { getCurrentUser } from "../services/userApi";
import type { User, Role } from "../services/types";
import { storage } from "../services/storage";
import { authURL } from "../services/api";

interface AuthContextType {
	user: User | null;
	role: Role | null;
	permissions: string[];
	isAuthenticated: boolean;
	isLoading: boolean;
	login: () => void;
	logout: () => Promise<void>;
	refreshUser: () => Promise<void>;
	hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const [user, setUser] = useState<User | null>(storage.getUser());
	const [role, setRole] = useState<Role | null>(null);
	const [permissions, setPermissions] = useState<string[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	const refreshUser = async () => {
		try {
			const data = await getCurrentUser();
			setUser(data.user);
			setRole(data.role);
			setPermissions(data.permissions);
		} catch (error) {
			console.error("Failed to fetch user:", error);
			setUser(null);
			setRole(null);
			setPermissions([]);
			storage.removeUser();
		} finally {
			setIsLoading(false);
		}
	};

	const hasPermission = (permission: string) => {
		return permissions.includes(permission);
	};

	useEffect(() => {
		refreshUser();
	}, []);

	const login = () => {
		const currentUrl = window.location.href;
		window.location.href = `${authURL}?redirect_uri=${encodeURIComponent(currentUrl)}`;
	};

	const logout = async () => {
		// Clear local state
		setUser(null);
		setRole(null);
		setPermissions([]);
		storage.removeUser();
		// Redirect to auth app for logout (auth logic is only in auth app)
		const currentUrl = window.location.href;
		window.location.href = `${authURL}?redirect_uri=${encodeURIComponent(currentUrl)}`;
	};

	return (
		<AuthContext.Provider
			value={{
				user,
				role,
				permissions,
				isAuthenticated: !!user,
				isLoading,
				login,
				logout,
				refreshUser,
				hasPermission,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
};

export const useAuth = () => {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
};
