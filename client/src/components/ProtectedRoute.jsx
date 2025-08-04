import { Navigate, useLocation } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const ProtectedRoute = ({ children, allowPublic = false }) => {
    const { isAuthenticated, isLoading, hasProfile } = useContext(AuthContext);
    const location = useLocation();

    // Loading
    if (isLoading) {
        return <div>Loading...</div>;
    }

    
    if (allowPublic) {
        // If user is authenticated but doesn't have profile and not on onboarding page, redirect to onboarding
        if (isAuthenticated && !hasProfile && location.pathname !== '/onboarding') {
            return <Navigate to="/onboarding" replace />;
        }
        
        // If user has profile and on onboarding page, redirect to profile
        if (isAuthenticated && hasProfile && location.pathname === '/onboarding') {
            return <Navigate to="/profile" replace />;
        }
        
        // Render children for all cases
        return children;
    }

    // For protected routes (not public)
    // Redirect to login if not authenticated
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // If user doesn't have profile and not on onboarding page, redirect to onboarding
    if (!hasProfile && location.pathname !== '/onboarding') {
        return <Navigate to="/onboarding" replace />;
    }

    // If user has profile and on onboarding page, redirect to profile
    if (hasProfile && location.pathname === '/onboarding') {
        return <Navigate to="/profile" replace />;
    }

    // Render the protected component if authenticated and has profile (or on onboarding)
    return children; 
}

export default ProtectedRoute;