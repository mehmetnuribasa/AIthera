import { Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const PublicRoute = ({ children }) => {
    const { isAuthenticated, isLoading, hasProfile } = useContext(AuthContext);

    // Loading
    if (isLoading) {
        return <div>Loading...</div>;
    }

    
    if (isAuthenticated) {
        if (!hasProfile) {
            // User doesn't have profile, redirect to onboarding
            return <Navigate to="/onboarding" replace />;
        } else {
            // User has profile, redirect to profile
            return <Navigate to="/profile" replace />;
        }
    }

    // Render the public component if not authenticated
    return children;
};

export default PublicRoute; 