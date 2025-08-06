import { Navigate, useLocation } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const ProtectedRoute = ({ children, allowPublic = false }) => {
    const { isAuthenticated, isLoading, hasProfile, gad7Status } = useContext(AuthContext);
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

        if( isAuthenticated && !gad7Status && hasProfile && location.pathname !== '/gad7') {
            return <Navigate to="/gad7" replace />;
        }

        // If user has profile and on onboarding page, redirect to profile
        if (isAuthenticated && hasProfile && gad7Status && (location.pathname === '/onboarding' || location.pathname === '/gad7')) {
            return <Navigate to="/profile" replace />;
        }
        
        // Render children for all other cases
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

    if(hasProfile && !gad7Status && location.pathname !== '/gad7') {
        return <Navigate to="/gad7" replace />;
    }

    // If user has profile and on onboarding page, redirect to profile
    if (hasProfile && gad7Status && (location.pathname === '/onboarding' || location.pathname === '/gad7')) {
        return <Navigate to="/profile" replace />;
    }

   // Render children for all other cases
    return children; 
}

export default ProtectedRoute;