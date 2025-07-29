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
                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M23.498 12.5c0-.827-.077-1.649-.2-2.5H12.5v4.77h6.214c-.267 1.4-1.07 2.576-2.25 3.5v2.96h3.627c2.13-1.96 3.357-4.85 3.357-8.23z" fill="#4285F4"/>
                          <path d="M12.5 24c3.24 0 5.955-1.077 7.94-2.907l-3.627-2.96c-1.08.724-2.46 1.156-4.313 1.156-3.315 0-6.116-2.24-7.12-5.25H1.67v3.09C3.645 21.422 7.742 24 12.5 24z" fill="#34A853"/>
                          <path d="M5.38 14.039c-.27-.8-.422-1.65-.422-2.539s.153-1.74.422-2.539V5.87H1.67C.607 7.997 0 10.197 0 12.5s.607 4.503 1.67 6.63l3.71-3.091z" fill="#FBBC05"/>
                          <path d="M12.5 4.977c1.87 0 3.548.643 4.873 1.907l3.627-3.627C18.455 1.142 15.74 0 12.5 0 7.742 0 3.645 2.578 1.67 6.87l3.71 3.091c1.004-3.01 3.805-5.25 7.12-5.25z" fill="#EA4335"/>
                        </svg>
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
