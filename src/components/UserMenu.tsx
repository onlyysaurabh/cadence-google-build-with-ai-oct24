import { useEffect, useRef } from 'react';
import type { User } from '../types.ts';
import { getInitials } from '../auth.ts';
import { User as UserIcon, LogOut, LogIn, ArrowRightLeft } from 'lucide-react';

interface UserMenuProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onNavigateAccount: () => void;
  onOpenAuth: () => void;
  onSignOut: () => void;
}

// ponytail: native click-outside & keyboard dismiss; minimal dropdown popover.
export function UserMenu({
  user,
  isOpen,
  onClose,
  onNavigateAccount,
  onOpenAuth,
  onSignOut,
}: UserMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={menuRef}
      className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl border border-border shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100"
    >
      {/* User Identity Header */}
      <div className="p-4 bg-canvas border-b border-border">
        {user ? (
          <div className="flex items-center space-x-3">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center font-display font-bold text-[12px] text-white flex-shrink-0"
              style={{ backgroundColor: user.avatarColor || '#4F46E5' }}
            >
              {getInitials(user.name)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-bold text-[14px] text-text-primary truncate">
                {user.name}
              </p>
              <p className="text-[12px] text-muted truncate font-normal">
                {user.email}
              </p>
            </div>
          </div>
        ) : (
          <div>
            <p className="font-bold text-[14px] text-text-primary">
              Guest Session
            </p>
            <p className="text-[12px] text-muted font-normal">
              Sign in to manage and sync pursuits
            </p>
          </div>
        )}
      </div>

      {/* Menu Options */}
      <div className="p-1.5 space-y-0.5">
        {user ? (
          <>
            <button
              type="button"
              onClick={() => {
                onClose();
                onNavigateAccount();
              }}
              className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-[13px] text-text-primary hover:bg-canvas transition-colors text-left font-normal cursor-pointer"
            >
              <UserIcon className="w-4 h-4 text-muted flex-shrink-0" strokeWidth={1.5} />
              <span>Account & Preferences</span>
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenAuth();
              }}
              className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-[13px] text-text-primary hover:bg-canvas transition-colors text-left font-normal cursor-pointer"
            >
              <ArrowRightLeft className="w-4 h-4 text-muted flex-shrink-0" strokeWidth={1.5} />
              <span>Switch / Add Account</span>
            </button>
            <div className="my-1 border-t border-border" />
            <button
              type="button"
              onClick={() => {
                onClose();
                onSignOut();
              }}
              className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-[13px] text-error hover:bg-red-50 transition-colors text-left font-normal cursor-pointer"
            >
              <LogOut className="w-4 h-4 text-error flex-shrink-0" strokeWidth={1.5} />
              <span>Sign Out</span>
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenAuth();
            }}
            className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-[13px] text-primary hover:bg-primary/5 transition-colors text-left font-bold cursor-pointer"
          >
            <LogIn className="w-4 h-4 text-primary flex-shrink-0" strokeWidth={1.5} />
            <span>Sign In / Create Account</span>
          </button>
        )}
      </div>
    </div>
  );
}
