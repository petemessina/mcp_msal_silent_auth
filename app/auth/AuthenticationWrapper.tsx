import { useEffect, useState } from "react";
import { useMsal } from "@azure/msal-react";

export function AuthenticationWrapper({ children }: { children: React.ReactNode }) {
  const { instance, accounts } = useMsal();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const handleAuth = async () => {
      try {
        const result = await instance.handleRedirectPromise();
        
        if (result) {
          console.log("Login successful:", result.account);
          console.log("All accounts after login:", instance.getAllAccounts());
        } else {
          console.log("No redirect result, checking existing accounts:", instance.getAllAccounts());
        }
      } catch (error) {
        console.error("Login error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    handleAuth();
  }, [instance]);

  // Show loading while processing authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 relative">
            <div className="absolute inset-0 border-4 border-blue-200 dark:border-blue-800 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-transparent border-t-blue-600 dark:border-t-blue-400 rounded-full animate-spin"></div>
          </div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Processing Authentication
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Please wait while we authenticate your session...
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
