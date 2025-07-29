import { useMsal } from "@azure/msal-react";
import { useEffect, useState } from "react";
import { graphConfig } from "../auth/authConfig";

interface UserProfile {
  displayName?: string;
  mail?: string;
  userPrincipalName?: string;
  jobTitle?: string;
  officeLocation?: string;
}

export function UserProfile() {
  const { instance, accounts } = useMsal();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (accounts.length > 0) {
      fetchUserProfile();
    }
  }, [accounts]);

  const fetchUserProfile = async () => {
    if (accounts.length === 0) return;

    setLoading(true);
    try {
      const response = await instance.acquireTokenSilent({
        scopes: ["User.Read"],
        account: accounts[0]
      });

      const profileResponse = await fetch(graphConfig.graphMeEndpoint, {
        headers: {
          Authorization: `Bearer ${response.accessToken}`
        }
      });

      if (profileResponse.ok) {
        const profile = await profileResponse.json();
        setUserProfile(profile);
      }
    } catch (error) {
      console.error("Failed to fetch user profile:", error);
    } finally {
      setLoading(false);
    }
  };

  if (accounts.length === 0) {
    return null;
  }

  return (
    <div className="card">
      <div className="card-header">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">User Profile</h3>
        </div>
      </div>
      <div className="card-body">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-gray-600 dark:text-gray-400">Loading profile...</span>
            </div>
          </div>
        ) : userProfile ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-3">
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Name</dt>
                <dd className="text-sm text-gray-900 dark:text-gray-100 font-medium">
                  {userProfile.displayName || 'Not available'}
                </dd>
              </div>
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Email</dt>
                <dd className="text-sm text-gray-900 dark:text-gray-100 font-medium">
                  {userProfile.mail || userProfile.userPrincipalName || 'Not available'}
                </dd>
              </div>
              {userProfile.jobTitle && (
                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3">
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Title</dt>
                  <dd className="text-sm text-gray-900 dark:text-gray-100 font-medium">
                    {userProfile.jobTitle}
                  </dd>
                </div>
              )}
              {userProfile.officeLocation && (
                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3">
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Office</dt>
                  <dd className="text-sm text-gray-900 dark:text-gray-100 font-medium">
                    {userProfile.officeLocation}
                  </dd>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-12 h-12 mx-auto mb-4 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <p className="text-gray-600 dark:text-gray-400">Profile information unavailable</p>
          </div>
        )}
      </div>
    </div>
  );
}
