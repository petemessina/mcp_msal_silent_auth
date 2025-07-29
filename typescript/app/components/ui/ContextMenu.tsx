/**
 * Context Menu Component
 * A reusable dropdown menu component with proper positioning and click outside handling
 */

import React, { useEffect, useRef, useState } from 'react';

interface ContextMenuItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  variant?: 'default' | 'danger';
}

interface ContextMenuProps {
  isVisible: boolean;
  onClose: () => void;
  items: ContextMenuItem[];
  anchorEl?: HTMLElement | null;
  position?: {
    x: number;
    y: number;
  };
}

export function ContextMenu({ 
  isVisible, 
  onClose, 
  items, 
  anchorEl, 
  position 
}: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [menuPosition, setMenuPosition] = useState({ left: 0, top: 0 });

  // Calculate position based on anchor element or provided position
  const calculateMenuPosition = () => {
    if (position) {
      return {
        left: position.x,
        top: position.y,
      };
    }

    if (anchorEl && menuRef.current) {
      const anchorRect = anchorEl.getBoundingClientRect();
      const menuRect = menuRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;
      
      // Calculate space available below and above the anchor
      const spaceBelow = viewportHeight - anchorRect.bottom;
      const spaceAbove = anchorRect.top;
      
      // Use actual menu height if available, otherwise estimate
      const menuHeight = menuRect.height > 0 ? menuRect.height : (items.length * 40 + 8);
      
      // Determine vertical position
      let top: number;
      if (spaceBelow >= menuHeight + 4) {
        // Enough space below, position normally
        top = anchorRect.bottom + 4;
      } else if (spaceAbove >= menuHeight + 4) {
        // Not enough space below but enough above, position above
        top = anchorRect.top - menuHeight - 4;
      } else {
        // Not enough space in either direction, position where there's more space
        if (spaceBelow > spaceAbove) {
          top = anchorRect.bottom + 4;
        } else {
          top = Math.max(4, anchorRect.top - menuHeight - 4);
        }
      }
      
      // Determine horizontal position
      let left = anchorRect.left;
      
      // Make sure menu doesn't go off screen horizontally
      const menuWidth = menuRect.width > 0 ? menuRect.width : 192; // min-w-48 = 192px
      if (left + menuWidth > viewportWidth) {
        left = anchorRect.right - menuWidth;
      }
      
      return {
        left: Math.max(4, left), // Ensure minimum 4px from left edge
        top: Math.max(4, top),   // Ensure minimum 4px from top edge
      };
    }

    return { left: 0, top: 0 };
  };

  // Update position when menu becomes visible
  useEffect(() => {
    if (isVisible && anchorEl) {
      // Initial position calculation
      setMenuPosition(calculateMenuPosition());
      
      // Recalculate after a small delay to account for rendering
      const timer = setTimeout(() => {
        setMenuPosition(calculateMenuPosition());
      }, 10);
      
      return () => clearTimeout(timer);
    }
  }, [isVisible, anchorEl, items.length]);

  // Handle click outside to close menu
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    }

    if (isVisible) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isVisible, onClose]);

  // Handle escape key to close menu
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    if (isVisible) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div
      ref={menuRef}
      className="fixed z-50 bg-gray-700 border border-gray-600 rounded-lg shadow-lg min-w-48"
      style={{
        left: menuPosition.left,
        top: menuPosition.top,
      }}
    >
      <div className="py-1">
        {items.map((item, index) => (
          <button
            key={item.id}
            onClick={() => {
              item.onClick();
              onClose();
            }}
            className={`w-full flex items-center gap-3 px-4 py-2 text-sm text-left transition-colors duration-200 ${
              item.variant === 'danger'
                ? 'text-red-300 hover:bg-red-900/20 hover:text-red-200'
                : 'text-gray-300 hover:bg-gray-600 hover:text-white'
            } ${index === 0 ? 'rounded-t-lg' : ''} ${
              index === items.length - 1 ? 'rounded-b-lg' : ''
            }`}
          >
            {item.icon && (
              <span className="flex-shrink-0">
                {item.icon}
              </span>
            )}
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
