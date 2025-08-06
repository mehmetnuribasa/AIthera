import { createContext, useState, useEffect } from "react";
import axiosInstance from "../api/axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [hasProfile, setHasProfile] = useState(false);
    const [gad7Status, setGad7Status] = useState(false);

    const checkUserProfile = async () => {
        try {
            const response = await axiosInstance.get('/profile/check');
            setHasProfile(response.data.hasProfile);
            return response.data.hasProfile;
        } catch (error) {
            console.error('Profile check failed:', error);
            setHasProfile(false);
            return false;
        }
    };

    const checkGad7Status = async () => {
        try {
            const response = await axiosInstance.get('/gad7/check');
            setGad7Status(response.data.hasGAD7);
            return response.data.hasGAD7;
        } catch (error) {
            console.error('GAD-7 status check failed:', error);
            setGad7Status(false);
            return false;
        }
    }

    const checkAuthStatus = async () => {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            setIsAuthenticated(false);
            setIsLoading(false);
            return;
        }

        try {
            // If we can make these calls successfully, user is authenticated
            setIsAuthenticated(true);
            await checkUserProfile();
            await checkGad7Status();
        } catch (error) {
            if (error.response?.status === 401) {
                // Token is invalid or expired
                localStorage.removeItem('accessToken');
                setIsAuthenticated(false);
                setHasProfile(false);
                setGad7Status(false);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleSetAuthenticated = async (authenticated) => {
        setIsAuthenticated(authenticated);
        
        if (authenticated) {
            await checkUserProfile();
            await checkGad7Status();
        } else {
            setHasProfile(false);
            setGad7Status(false);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        checkAuthStatus();        
    }, []);

    const updateProfileStatus = async () => {
        await checkUserProfile();
    };

    const updateGad7Status = async () => {
        await checkGad7Status();
    }

    return (
        <AuthContext.Provider value={{ 
            isAuthenticated, 
            setIsAuthenticated: handleSetAuthenticated, 
            isLoading,
            hasProfile,
            gad7Status,
            updateProfileStatus,
            updateGad7Status
        }}>
            {children}
        </AuthContext.Provider>
    );
}