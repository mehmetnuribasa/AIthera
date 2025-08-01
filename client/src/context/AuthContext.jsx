import { createContext, useState, useEffect } from "react";
import axiosInstance from "../api/axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const checkSession = async () => {
            try {
                const response = await axiosInstance.get('/auth/session');
                setIsAuthenticated(response.data.isAuthenticated);
            } catch (error) {
                console.error('Session check failed:', error);
                setIsAuthenticated(false);
            }
        };

        checkSession();
    }, []);

    return (
        <AuthContext.Provider value={{ isAuthenticated , setIsAuthenticated }}>
            {children}
        </AuthContext.Provider>
    );
}