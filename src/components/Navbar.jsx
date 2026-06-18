'use client';

import React from 'react';
import { Search, Plus, Settings, Sparkles, Layers } from 'lucide-react';

export default function Navbar({ 
  activeView, 
  setActiveView, 
  searchQuery, 
  setSearchQuery, 
  onSettingsClick,
  onNewGemClick 
}) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-zen-border bg-zen-card backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          
          {/* Logo & Slogan */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveView('marketplace')}>
            <div className="relative flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-tr from-zen-indigo via-zen-indigo/60 to-zen-red p-[1.5px] shadow-lg shadow-zen-indigo/10">
              <div className="flex h-full w-full items-center justify-center rounded-[7px] bg-zen-panel">
                <Layers className="h-5 w-5 text-zen-red" />
              </div>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-base font-black tracking-wider text-zen-charcoal">
                GEMFORGE <span className="text-xs font-medium text-zen-charcoal-light tracking-normal">STUDIO</span>
              </h1>
              <p className="text-[10px] text-zen-red/85 font-medium tracking-tight -mt-0.5">
                AI Persona & Prompt Architecture
              </p>
            </div>
          </div>

          {/* Search bar - only shown in Marketplace */}
          <div className="flex-1 max-w-md mx-4">
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="h-4 w-4 text-zen-charcoal-light/75" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ค้นหา Gems, เทมเพลต, หรือบทบาทอาชีพ..."
                className="w-full bg-zen-panel/60 border border-zen-border rounded-lg pl-9 pr-4 py-2 text-sm text-zen-charcoal placeholder-zen-charcoal-light/75 focus:outline-none focus:border-zen-red focus:bg-zen-panel/90 transition"
              />
            </div>
          </div>

          {/* Nav Links, Actions & settings */}
          <div className="flex items-center gap-2 sm:gap-4">
            <nav className="flex items-center bg-zen-panel border border-zen-border p-1 rounded-lg">
              <button
                onClick={() => setActiveView('marketplace')}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition ${
                  activeView === 'marketplace'
                    ? 'bg-zen-border-dark text-zen-charcoal shadow-sm'
                    : 'text-zen-charcoal-light hover:text-zen-charcoal'
                }`}
              >
                Marketplace
              </button>
              <button
                onClick={() => setActiveView('studio')}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition flex items-center gap-1 ${
                  activeView === 'studio'
                    ? 'bg-zen-border-dark text-zen-charcoal shadow-sm'
                    : 'text-zen-charcoal-light hover:text-zen-charcoal'
                }`}
              >
                Studio
                <Sparkles className="w-3 h-3 text-zen-red" />
              </button>
            </nav>

            <button
              onClick={onNewGemClick}
              className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg bg-zen-red hover:bg-zen-red-hover text-white text-xs font-bold transition shadow-lg shadow-zen-red/10 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">สร้าง Gem ใหม่</span>
            </button>

            <button
              onClick={onSettingsClick}
              className="p-2 text-zen-charcoal-light hover:text-zen-charcoal bg-zen-panel hover:bg-zen-panel-hover border border-zen-border rounded-lg transition"
              title="ตั้งค่า API และฐานข้อมูล"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>
    </header>
  );
}
