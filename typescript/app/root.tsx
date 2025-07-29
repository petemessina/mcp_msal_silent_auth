import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";
import { MsalProvider } from "@azure/msal-react";
import { PublicClientApplication } from "@azure/msal-browser";
import { useEffect, useState } from "react";

import type { Route } from "./+types/root";
import { msalConfig } from "./auth/authConfig";
import { AuthenticationWrapper } from "./auth/AuthenticationWrapper";
import { MCPProvider } from "./contexts/MCPContext";
import "./app.css";

// Initialize MSAL instance
const msalInstance = new PublicClientApplication(msalConfig);

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  const [msalInitialized, setMsalInitialized] = useState(false);

  useEffect(() => {
    const initializeMsal = async () => {
      try {
        await msalInstance.initialize();
        setMsalInitialized(true);
      } catch (error) {
        console.error("MSAL initialization failed:", error);
      }
    };

    initializeMsal();
  }, []);

  // Show loading while MSAL is initializing
  if (!msalInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center gap-2">
          <div className="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
          <span className="text-gray-700 dark:text-gray-300">Initializing authentication...</span>
        </div>
      </div>
    );
  }

  return (
    <MsalProvider instance={msalInstance}>
      <MCPProvider>
        <AuthenticationWrapper>
          <Outlet />
        </AuthenticationWrapper>
      </MCPProvider>
    </MsalProvider>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-16 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-lg w-full">
        <div className="card animate-fadeInUp">
          <div className="card-body text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">{message}</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">{details}</p>
            {stack && (
              <div className="mt-6">
                <details className="text-left">
                  <summary className="cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 mb-3">
                    Show technical details
                  </summary>
                  <pre className="mt-3 p-4 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-xs text-gray-800 dark:text-gray-200 overflow-auto max-h-60 scrollbar-thin">
                    <code>{stack}</code>
                  </pre>
                </details>
              </div>
            )}
            <div className="mt-8 flex justify-center">
              <button
                onClick={() => window.location.reload()}
                className="btn btn-primary"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
