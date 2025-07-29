/**
 * Settings Panel Component
 * Right panel showing MCP connectivity, weather tools, and settings
 */

import React, { useState } from 'react';
import { MCPToolsPanel } from './MCPToolsPanel';
import { UserProfile } from '../auth/UserProfile';

interface SettingsPanelProps {
  onTogglePanel: () => void;
  showPanel: boolean;
}

export function SettingsPanel({ onTogglePanel, showPanel }: SettingsPanelProps) {
  const [activeTab, setActiveTab] = useState<'tools' | 'settings' | 'profile'>('tools');
  const [temperature, setTemperature] = useState(1);
  const [topP, setTopP] = useState(0.95);
  const [maxTokens, setMaxTokens] = useState(4096);
  const [modelName, setModelName] = useState('Meta-Llama-3.1-8B-Instruct.Q4_K_M');
  const [host, setHost] = useState('http://localhost:8000/v1');
  const [apiKey, setApiKey] = useState('');

  const tabs = [
    { id: 'tools', label: 'Tools', icon: '🛠️' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
    { id: 'profile', label: 'Profile', icon: '👤' }
  ];

  return (
    <div className="h-full bg-gray-800 border-l border-gray-700 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <h2 className="text-lg font-semibold text-white">Settings</h2>
        <button
          onClick={onTogglePanel}
          className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors duration-200"
          aria-label="Close settings"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-700">
        <nav className="flex">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'tools' | 'settings' | 'profile')}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors duration-200 ${
                activeTab === tab.id
                  ? 'text-blue-400 border-b-2 border-blue-400 bg-gray-700/50'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {activeTab === 'tools' && (
          <div className="p-4">
            <MCPToolsPanel />
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="p-4 space-y-6">
            {/* Temperature */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Temperature: {temperature}
              </label>
              <input
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0</span>
                <span>2</span>
              </div>
            </div>

            {/* Top P */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Top P: {topP}
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={topP}
                onChange={(e) => setTopP(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0</span>
                <span>1</span>
              </div>
            </div>

            {/* Max Tokens */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Max Tokens
              </label>
              <input
                type="number"
                value={maxTokens}
                onChange={(e) => setMaxTokens(parseInt(e.target.value))}
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="1"
                max="32000"
              />
            </div>

            {/* Host */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Host
              </label>
              <input
                type="text"
                value={host}
                onChange={(e) => setHost(e.target.value)}
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="http://localhost:8000/v1"
              />
            </div>

            {/* Model Name */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Model Name
              </label>
              <select
                value={modelName}
                onChange={(e) => setModelName(e.target.value)}
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="gpt-4.1">GPT-4.1</option>
                <option value="gpt-4-turbo">GPT-4 Turbo</option>
                <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
              </select>
            </div>

            {/* API Key */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                API Key
              </label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter API key"
              />
            </div>

            {/* Save Button */}
            <button className="w-full btn btn-primary">
              Save Settings
            </button>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="p-4">
            <UserProfile />
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-gray-700 p-4">
        <div className="text-center">
          <p className="text-xs text-gray-500">version: 0.0.3</p>
        </div>
      </div>
    </div>
  );
}
