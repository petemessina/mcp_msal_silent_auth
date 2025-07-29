/**
 * Component for displaying and interacting with MCP tools
 */

import React, { useState } from 'react';
import { useMCP } from '../contexts/MCPContext';

export function MCPToolsPanel() {
  const { isConnected, isConnecting, tools, error, connect, callTool } = useMCP();
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [toolArgs, setToolArgs] = useState<Record<string, any>>({});
  const [toolArgsText, setToolArgsText] = useState<string>('{}');
  const [toolResult, setToolResult] = useState<any>(null);
  const [isCallingTool, setIsCallingTool] = useState(false);
  const [jsonError, setJsonError] = useState<string | null>(null);

  const handleConnect = async () => {
    try {
      await connect();
    } catch (err) {
      console.error('Failed to connect:', err);
    }
  };

  const handleCallTool = async () => {
    if (!selectedTool) return;

    setIsCallingTool(true);
    setToolResult(null);

    try {
      const result = await callTool(selectedTool, toolArgs);
      setToolResult(result);
    } catch (err) {
      console.error('Tool call failed:', err);
      setToolResult({ error: err instanceof Error ? err.message : 'Tool call failed' });
    } finally {
      setIsCallingTool(false);
    }
  };

  const handleArgChange = (key: string, value: string) => {
    setToolArgs(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleArgsTextChange = (text: string) => {
    setToolArgsText(text);
    setJsonError(null);
    
    try {
      const parsed = JSON.parse(text);
      setToolArgs(parsed);
    } catch (error) {
      setJsonError(error instanceof Error ? error.message : 'Invalid JSON');
    }
  };

  if (!isConnected && !isConnecting) {
    return (
      <div className="card border-cyan-200 dark:border-cyan-800">
        <div className="card-body text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Weather Tools
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Connect to the weather API to access real-time weather data and forecasting tools.
          </p>
          <button
            onClick={handleConnect}
            className="btn btn-primary"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
            </svg>
            Connect to Weather API
          </button>
          {error && (
            <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-center gap-2 text-red-700 dark:text-red-300">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm font-medium">Error: {error}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (isConnecting) {
    return (
      <div className="card">
        <div className="card-body">
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-8 h-8 border-4 border-blue-200 dark:border-blue-800 rounded-full"></div>
                <div className="absolute inset-0 w-8 h-8 border-4 border-transparent border-t-blue-600 dark:border-t-blue-400 rounded-full animate-spin"></div>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">Connecting to Weather API</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Establishing secure connection...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">Weather Tools</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{tools.length} tools available</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs font-medium text-green-600 dark:text-green-400">Connected</span>
          </div>
        </div>
      </div>

      <div className="card-body space-y-6">
        {error && (
          <div className="alert alert-danger">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-medium">Error: {error}</span>
            </div>
          </div>
        )}

        {tools.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <p className="text-gray-500 dark:text-gray-400">No tools available</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Tool Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Select Tool
              </label>
              <select
                value={selectedTool || ''}
                onChange={(e) => {
                  setSelectedTool(e.target.value || null);
                  setToolArgs({});
                  setToolArgsText('{}');
                  setToolResult(null);
                  setJsonError(null);
                }}
                className="input w-full"
              >
                <option value="">Choose a tool...</option>
                {tools.map((tool) => (
                  <option key={tool.name} value={tool.name}>
                    {tool.name} - {tool.description}
                  </option>
                ))}
              </select>
            </div>

            {/* Tool Arguments */}
            {selectedTool && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Arguments (JSON)
                </label>
                <textarea
                  value={toolArgsText}
                  onChange={(e) => handleArgsTextChange(e.target.value)}
                  placeholder='{"city": "Seattle"}'
                  className={`input w-full font-mono text-sm resize-none ${
                    jsonError ? 'input-error' : ''
                  }`}
                  rows={4}
                />
                {jsonError && (
                  <div className="mt-2 flex items-center gap-2 text-red-600 dark:text-red-400">
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-xs font-medium">JSON Error: {jsonError}</span>
                  </div>
                )}
              </div>
            )}

            {/* Call Tool Button */}
            {selectedTool && (
              <div className="flex justify-end">
                <button
                  onClick={handleCallTool}
                  disabled={isCallingTool || jsonError !== null}
                  className="btn btn-success disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCallingTool ? (
                    <>
                      <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Calling...
                    </>
                  ) : jsonError ? (
                    'Fix JSON Error'
                  ) : (
                    <>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h8m-6-10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Call Tool
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Tool Result */}
            {toolResult && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Result
                </label>
                <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                  <pre className="p-4 text-sm text-gray-800 dark:text-gray-200 overflow-auto max-h-60 scrollbar-thin">
                    {JSON.stringify(toolResult, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
