import { useAuth } from "../../contexts/AuthContext";
import { UnauthorizedPage } from "../../pages/auth/UnauthorizedPage";

interface ProtectedRouteProps {
	children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
	const { isAuthenticated, isLoading } = useAuth();

	if (!isLoading && !isAuthenticated) {
		return <UnauthorizedPage />;
	}

	if (isLoading) {
		return (
			<div className="w-full flex justify-center py-20">
				<div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
			</div>
		);
	}

	if (!isAuthenticated) {
		return <UnauthorizedPage />; // The useEffect will handle the redirection
	}

	return <>{children}</>;
};
