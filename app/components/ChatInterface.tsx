/**
 * Modern Chat Interface Component
 * Three-panel layout: Conversations sidebar, Chat area, Settings panel
 */

import React, { useState } from 'react';
import { useMsal } from '@azure/msal-react';
import { ConversationsSidebar } from './ConversationsSidebar';
import { ChatArea } from './ChatArea';
import { SettingsPanel } from './SettingsPanel';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  timestamp: Date;
  isTyping?: boolean;
}

interface Conversation {
  id: string;
  title: string;
  lastMessage?: string;
  timestamp: Date;
  isActive?: boolean;
}

export function ChatInterface() {
  const { accounts } = useMsal();
  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: '1',
      title: 'Weather Assistant',
      lastMessage: 'How can I help you with weather information?',
      timestamp: new Date(),
      isActive: true
    }
  ]);
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'Hello! I\'m your AI assistant. I can help you with weather information and other tasks. How can I assist you today?',
      role: 'assistant',
      timestamp: new Date()
    }
  ]);
  
  const [currentMessage, setCurrentMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [activeConversation, setActiveConversation] = useState('1');
  const [showSettingsPanel, setShowSettingsPanel] = useState(true);
  const [showSidebar, setShowSidebar] = useState(true);

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: content.trim(),
      role: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentMessage('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'I received your message: "' + content + '". This is a demo response. In a real implementation, this would connect to your AI service.',
        role: 'assistant',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      setIsTyping(false);

      // Update conversation last message
      setConversations(prev => 
        prev.map(conv => 
          conv.id === activeConversation 
            ? { ...conv, lastMessage: content, timestamp: new Date() }
            : conv
        )
      );
    }, 1000 + Math.random() * 2000);
  };

  const handleNewConversation = () => {
    const newConv: Conversation = {
      id: Date.now().toString(),
      title: 'New Conversation',
      timestamp: new Date(),
      isActive: false
    };
    
    setConversations(prev => [newConv, ...prev]);
    setActiveConversation(newConv.id);
    setMessages([]);
  };

  const handleSelectConversation = (conversationId: string) => {
    setActiveConversation(conversationId);
    setConversations(prev => 
      prev.map(conv => ({ ...conv, isActive: conv.id === conversationId }))
    );
    
    // In a real app, you'd load messages for this conversation
    if (conversationId !== '1') {
      setMessages([]);
    }
  };

  const isAuthenticated = accounts.length > 0;

  if (!isAuthenticated) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Authentication Required</h2>
          <p className="text-gray-400">Please sign in to access the chat interface.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-900 flex overflow-hidden">
      {/* Conversations Sidebar */}
      <div className={`transition-all duration-300 ${showSidebar ? 'w-80' : 'w-0'} overflow-hidden`}>
        <ConversationsSidebar
          conversations={conversations}
          activeConversation={activeConversation}
          onSelectConversation={handleSelectConversation}
          onNewConversation={handleNewConversation}
          onToggleSidebar={() => setShowSidebar(!showSidebar)}
          showSidebar={showSidebar}
        />
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <ChatArea
          messages={messages}
          currentMessage={currentMessage}
          setCurrentMessage={setCurrentMessage}
          onSendMessage={handleSendMessage}
          isTyping={isTyping}
          onToggleSidebar={() => setShowSidebar(!showSidebar)}
          onToggleSettings={() => setShowSettingsPanel(!showSettingsPanel)}
          showSidebar={showSidebar}
          showSettingsPanel={showSettingsPanel}
        />
      </div>

      {/* Settings Panel */}
      <div className={`transition-all duration-300 ${showSettingsPanel ? 'w-96' : 'w-0'} overflow-hidden`}>
        <SettingsPanel
          onTogglePanel={() => setShowSettingsPanel(!showSettingsPanel)}
          showPanel={showSettingsPanel}
        />
      </div>
    </div>
  );
}
