import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Home from './components/Home';
import Register from './components/Register';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import { EVENTS } from './types';

export default function App() {
  // Navigation State
  const [currentTab, setCurrentTab] = useState<'home' | 'register' | 'admin-login' | 'admin-dashboard'>('home');
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);

  // Dynamic Event Configuration and Countdown
  const [events, setEvents] = useState<any[]>([]);
  const [eventDate, setEventDate] = useState<string>('2026-10-24T09:00:00');

  const fetchConfig = async () => {
    try {
      const res = await fetch('/api/config');
      if (res.ok) {
        const data = await res.json();
        if (data.events) {
          setEvents(data.events);
        }
        if (data.eventDate) {
          setEventDate(data.eventDate);
        }
      }
    } catch (err) {
      console.error('Failed to fetch config:', err);
    }
  };

  // Check login state on mount & fetch configuration
  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (token === 'admin-secret-session-token') {
      setIsAdminLoggedIn(true);
    }
    fetchConfig();
  }, []);

  // Handle successful login
  const handleLoginSuccess = (token: string) => {
    localStorage.setItem('admin_token', token);
    setIsAdminLoggedIn(true);
    setCurrentTab('admin-dashboard');
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    setIsAdminLoggedIn(false);
    setCurrentTab('home');
  };

  // Ensure scroll is at top on tab shifts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentTab]);

  // Fallback list of events to ensure robust UI
  const activeEvents = events && events.length > 0 ? events : EVENTS;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans antialiased text-slate-800">
      
      {/* Dynamic Navigation Bar */}
      <Navbar 
        currentTab={currentTab} 
        setCurrentTab={(tab) => {
          if (tab === 'admin-dashboard' && !isAdminLoggedIn) {
            setCurrentTab('admin-login');
          } else {
            setCurrentTab(tab);
          }
        }} 
        isAdminLoggedIn={isAdminLoggedIn} 
        handleLogout={handleLogout} 
      />

      {/* Main Viewport Content Routing */}
      <main className="flex-grow">
        {currentTab === 'home' && (
          <Home setCurrentTab={setCurrentTab} events={activeEvents} eventDate={eventDate} />
        )}
        {currentTab === 'register' && (
          <Register setCurrentTab={setCurrentTab} events={activeEvents} />
        )}
        {currentTab === 'admin-login' && (
          <AdminLogin 
            onLoginSuccess={handleLoginSuccess} 
            setCurrentTab={setCurrentTab} 
          />
        )}
        {currentTab === 'admin-dashboard' && isAdminLoggedIn && (
          <AdminDashboard 
            setCurrentTab={setCurrentTab} 
            events={activeEvents} 
            eventDate={eventDate} 
            onConfigUpdate={fetchConfig} 
          />
        )}
      </main>

    </div>
  );
}
