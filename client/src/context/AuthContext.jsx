import { createContext, useState, useEffect } from "react";
import axiosInstance from "../api/axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [hasProfile, setHasProfile] = useState(false);

    const checkUserProfile = async (userId) => {
        try {
            const response = await axiosInstance.get(`/profile/check/${userId}`);
            setHasProfile(response.data.hasProfile);
            return response.data.hasProfile;
        } catch (error) {
            console.error('Profile check failed:', error);
            setHasProfile(false);
            return false;
        }
    };

    const checkSession = async () => {
        try {
            const response = await axiosInstance.get('/auth/session');
            setIsAuthenticated(response.data.isAuthenticated);
            
            if (response.data.isAuthenticated) {
                // Check if user has profile
                await checkUserProfile(response.data.userId);
            }
        } catch (error) {
            console.error('Session check failed:', error);
            setIsAuthenticated(false);
            setHasProfile(false);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSetAuthenticated = async (authenticated) => {
        setIsAuthenticated(authenticated);
        
        if (authenticated) {
            // If user just logged in, check session to get user info and profile status
            await checkSession();
        } else {
            setHasProfile(false);
            setIsLoading(false);
        }
    };

    useEffect(() => {
        checkSession();
    }, []);

    const updateProfileStatus = async (userId) => {
        await checkUserProfile(userId);
    };

    return (
        <AuthContext.Provider value={{ 
            isAuthenticated, 
            setIsAuthenticated: handleSetAuthenticated, 
            isLoading,
            hasProfile, 
            setHasProfile,
            updateProfileStatus
        }}>
            {children}
        </AuthContext.Provider>
    );
}