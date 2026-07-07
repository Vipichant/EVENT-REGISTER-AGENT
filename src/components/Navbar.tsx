import React, { useState } from 'react';
import { GraduationCap, LogIn, Calendar, CheckSquare, Menu, X } from 'lucide-react';

interface NavbarProps {
  currentTab: 'home' | 'register' | 'admin-login' | 'admin-dashboard';
  setCurrentTab: (tab: 'home' | 'register' | 'admin-login' | 'admin-dashboard') => void;
  isAdminLoggedIn: boolean;
  handleLogout: () => void;
}

export default function Navbar({ currentTab, setCurrentTab, isAdminLoggedIn, handleLogout }: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm backdrop-blur-md bg-opacity-95">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
        <div className="flex justify-between h-12">
          {/* Logo Section */}
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => { setCurrentTab('home'); setIsMobileMenuOpen(false); }}>
            <div className="flex h-8 w-8 items-center justify-center rounded bg-blue-700 text-white shadow-sm">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <span className="text-sm font-extrabold tracking-tight text-slate-900 block leading-none">APEX INSTITUTE</span>
              <span className="text-[9px] font-bold text-blue-700 tracking-wider uppercase block mt-0.5">OF TECHNOLOGY</span>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center space-x-3">
            <button
              id="nav-home-btn"
              onClick={() => setCurrentTab('home')}
              className={`px-2.5 py-1 text-xs font-semibold transition-colors cursor-pointer rounded ${
                currentTab === 'home' ? 'text-blue-700 bg-blue-50/80 border border-blue-100' : 'text-slate-600 hover:text-blue-700 hover:bg-slate-50'
              }`}
            >
              Home
            </button>
            <button
              id="nav-register-btn"
              onClick={() => setCurrentTab('register')}
              className={`px-2.5 py-1 text-xs font-semibold transition-colors cursor-pointer rounded ${
                currentTab === 'register' ? 'text-blue-700 bg-blue-50/80 border border-blue-100' : 'text-slate-600 hover:text-blue-700 hover:bg-slate-50'
              }`}
            >
              Register Now
            </button>
            
            {isAdminLoggedIn ? (
              <>
                <button
                  id="nav-dashboard-btn"
                  onClick={() => setCurrentTab('admin-dashboard')}
                  className={`px-2.5 py-1 text-xs font-semibold transition-colors cursor-pointer rounded ${
                    currentTab === 'admin-dashboard' ? 'text-blue-700 bg-blue-50/80 border border-blue-100' : 'text-slate-600 hover:text-blue-700 hover:bg-slate-50'
                  }`}
                >
                  Admin Dashboard
                </button>
                <button
                  id="nav-logout-btn"
                  onClick={handleLogout}
                  className="px-3 py-1 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors rounded shadow-sm cursor-pointer"
                >
                  Admin Logout
                </button>
              </>
            ) : (
              <button
                id="nav-login-btn"
                onClick={() => setCurrentTab('admin-login')}
                className={`flex items-center space-x-1 px-3 py-1 text-xs font-semibold rounded cursor-pointer transition-all ${
                  currentTab === 'admin-login'
                    ? 'bg-blue-700 text-white shadow-sm'
                    : 'text-blue-700 hover:bg-blue-50 border border-blue-200'
                }`}
              >
                <LogIn className="h-3.5 w-3.5" />
                <span>Admin Panel</span>
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-1.5 rounded text-slate-500 hover:text-blue-700 hover:bg-slate-100 focus:outline-none"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-3 pt-1.5 pb-3 space-y-1">
          <button
            id="mob-nav-home-btn"
            onClick={() => { setCurrentTab('home'); setIsMobileMenuOpen(false); }}
            className={`w-full text-left px-3 py-1.5 rounded text-xs font-semibold uppercase tracking-wider ${
              currentTab === 'home' ? 'bg-blue-50 text-blue-700 border border-blue-100' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            Home
          </button>
          <button
            id="mob-nav-register-btn"
            onClick={() => { setCurrentTab('register'); setIsMobileMenuOpen(false); }}
            className={`w-full text-left px-3 py-1.5 rounded text-xs font-semibold uppercase tracking-wider ${
              currentTab === 'register' ? 'bg-blue-50 text-blue-700 border border-blue-100' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            Register Now
          </button>
          
          {isAdminLoggedIn ? (
            <>
              <button
                id="mob-nav-dashboard-btn"
                onClick={() => { setCurrentTab('admin-dashboard'); setIsMobileMenuOpen(false); }}
                className={`w-full text-left px-3 py-1.5 rounded text-xs font-semibold uppercase tracking-wider ${
                  currentTab === 'admin-dashboard' ? 'bg-blue-50 text-blue-700 border border-blue-100' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                Admin Dashboard
              </button>
              <button
                id="mob-nav-logout-btn"
                onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}
                className="w-full text-left px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-red-700 bg-red-50 hover:bg-red-100 rounded border border-red-100"
              >
                Admin Logout
              </button>
            </>
          ) : (
            <button
              id="mob-nav-login-btn"
              onClick={() => { setCurrentTab('admin-login'); setIsMobileMenuOpen(false); }}
              className={`w-full flex items-center space-x-1.5 px-3 py-1.5 rounded text-xs font-semibold uppercase tracking-wider ${
                currentTab === 'admin-login' ? 'bg-blue-700 text-white' : 'text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-100'
              }`}
            >
              <LogIn className="h-4 w-4" />
              <span>Admin Panel</span>
            </button>
          )}
        </div>
      )}
    </nav>
  );
}
