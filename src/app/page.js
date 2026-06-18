'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Marketplace from '../components/Marketplace';
import ArchitectStudio from '../components/ArchitectStudio';
import SettingsModal from '../components/SettingsModal';
import { db } from '../utils/db';

export default function Home() {
  const [activeView, setActiveView] = useState('marketplace'); // 'marketplace', 'studio'
  const [searchQuery, setSearchQuery] = useState('');
  const [gems, setGems] = useState([]);
  const [selectedGem, setSelectedGem] = useState(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Initialize DB, load list, and handle PWA Service Worker on component mount
  useEffect(() => {
    db.init();
    loadGems();

    if (typeof window !== 'undefined') {
      const isLocalhost = window.location.hostname === 'localhost' || 
                          window.location.hostname === '127.0.0.1' || 
                          window.location.hostname === '::1';

      if (isLocalhost) {
        // Unregister service workers on localhost to prevent caching issues during dev
        if ('serviceWorker' in navigator) {
          navigator.serviceWorker.getRegistrations().then((registrations) => {
            for (let registration of registrations) {
              registration.unregister().then((success) => {
                if (success) console.log('Unregistered active service worker on localhost');
              });
            }
          });
        }
        // Clear caches
        if ('caches' in window) {
          caches.keys().then((names) => {
            for (let name of names) {
              caches.delete(name).then((success) => {
                if (success) console.log('Cleared cache storage:', name);
              });
            }
          });
        }
      } else if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
          navigator.serviceWorker.register('./sw.js').then(
            (reg) => console.log('PWA Service Worker registered:', reg.scope),
            (err) => console.error('PWA Service Worker registration failed:', err)
          );
        });
      }
    }
  }, []);

  const loadGems = () => {
    const allGems = db.getGems();
    setGems(allGems);
  };

  // Switch to studio and load selected template
  const handleCustomizeGem = (gem) => {
    setSelectedGem(gem);
    setActiveView('studio');
  };

  // Switch to studio with clear slate
  const handleNewGem = () => {
    setSelectedGem(null);
    setActiveView('studio');
  };

  const handleSettingsSaved = () => {
    loadGems();
  };

  return (
    <div className="min-h-screen bg-transparent text-zen-charcoal flex flex-col relative overflow-hidden">
      {/* Background visual glowing gradients */}
      <div className="glow-bg top-[10%] left-[5%]" />
      <div className="glow-bg bottom-[15%] right-[5%]" />

      <Navbar 
        activeView={activeView}
        setActiveView={setActiveView}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onSettingsClick={() => setIsSettingsOpen(true)}
        onNewGemClick={handleNewGem}
      />

      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {activeView === 'marketplace' ? (
          <Marketplace 
            gems={gems}
            searchQuery={searchQuery}
            onCustomize={handleCustomizeGem}
          />
        ) : (
          <ArchitectStudio 
            loadedGem={selectedGem}
            onGemSaved={loadGems}
          />
        )}
      </main>

      {/* Settings Modal */}
      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSettingsSaved={handleSettingsSaved}
      />

      {/* Small subtle footer */}
      <footer className="w-full border-t border-zen-border-dark bg-zen-panel/45 py-6 text-center text-xs text-zen-charcoal-light mt-12">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 GemForge Studio. All rights reserved.</p>
          <div className="flex gap-4">
            <span className="text-zen-charcoal-light/85 hover:text-zen-charcoal">Next.js Framework</span>
            <span className="text-zen-indigo font-mono">v16.2.9</span>
            <span className="text-zen-charcoal-light/85 hover:text-zen-charcoal">Tailwind CSS v4</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
