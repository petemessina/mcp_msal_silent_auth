import { useMsal } from "@azure/msal-react";
import { loginRequest } from "../auth/authConfig";
import { ChatInterface } from "../components/ChatInterface";
import logoDark from "./logo-dark.svg";
import logoLight from "./logo-light.svg";

export function Welcome() {
  const { instance, accounts, inProgress } = useMsal();
  const isAuthenticated = accounts.length > 0;

  // Debug logging
  console.log("MSAL Debug:", { 
    accountsLength: accounts.length, 
    isAuthenticated, 
    inProgress,
    accounts: accounts.map(acc => ({ name: acc.name, username: acc.username }))
  });

  const handleLogin = () => {
    instance.loginRedirect(loginRequest).catch(e => {
      console.error("Login failed: ", e);
    });
  };

  // If authenticated, show the chat interface
  if (isAuthenticated) {
    return <ChatInterface />;
  }

  // Show login screen if not authenticated
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-cyan-600/10 dark:from-blue-400/5 dark:to-cyan-400/5"></div>
        <main className="relative flex items-center justify-center pt-16 pb-8">
          <div className="flex-1 flex flex-col items-center gap-12 min-h-0 max-w-4xl mx-auto px-4">
            {/* Logo */}
            <header className="flex flex-col items-center gap-8 animate-fadeInUp">
              <div className="w-full max-w-md">
                <img
                  src={logoLight}
                  alt="React Router"
                  className="block w-full dark:hidden drop-shadow-lg"
                />
                <img
                  src={logoDark}
                  alt="React Router"
                  className="hidden w-full dark:block drop-shadow-lg"
                />
              </div>
              <div className="text-center space-y-2">
                <h1 className="text-3xl md:text-4xl font-bold text-gradient">
                  AI Chat Interface
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-400">
                  Powered by Microsoft Azure and Weather APIs
                </p>
              </div>
            </header>

            {/* Authentication Section */}
            <div className="w-full max-w-md space-y-6">
              <div className="card text-center animate-slide-up">
                <div className="card-body">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    Welcome
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Sign in with your Microsoft account to access the AI chat interface and weather tools.
                  </p>
                  <button 
                    onClick={handleLogin}
                    className="btn btn-primary w-full"
                    disabled={inProgress === 'login'}
                  >
                    {inProgress === 'login' ? (
                      <>
                        <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Signing in...
                      </>
                    ) : (
                      <>
                        Sign In with Microsoft
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
