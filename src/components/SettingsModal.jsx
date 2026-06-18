'use client';

import React, { useState, useEffect } from 'react';
import { X, Key, Database, RefreshCw, Check, Copy } from 'lucide-react';
import { db } from '../utils/db';

export default function SettingsModal({ isOpen, onClose, onSettingsSaved }) {
  const [apiKey, setApiKey] = useState('');
  const [dbMode, setDbMode] = useState('local'); // 'local', 'supabase', 'firebase'
  const [activeTab, setActiveTab] = useState('api'); // 'api', 'db'
  const [copied, setCopied] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedKey = localStorage.getItem('gemforge_api_key') || '';
      const savedMode = localStorage.getItem('gemforge_db_mode') || 'local';
      setApiKey(savedKey);
      setDbMode(savedMode);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('gemforge_api_key', apiKey.trim());
      localStorage.setItem('gemforge_db_mode', dbMode);
      
      setMessage('บันทึกการตั้งค่าเรียบร้อยแล้ว!');
      setTimeout(() => {
        setMessage('');
        onSettingsSaved();
        onClose();
      }, 1500);
    }
  };

  const handleResetDatabase = () => {
    if (confirm('คุณต้องการรีเซ็ตฐานข้อมูลเป็นค่าเริ่มต้น (Marketplace Templates) ใช่หรือไม่? ข้อมูล Gem ที่คุณสร้างใหม่จะหายไป')) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('gemforge_seeded');
        localStorage.removeItem('gemforge_gems');
        db.init();
        setMessage('รีเซ็ตคลังข้อมูล Gems สำเร็จ!');
        setTimeout(() => {
          setMessage('');
          onSettingsSaved();
          onClose();
        }, 1500);
      }
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-2xl bg-zen-bg border border-zen-border-dark rounded-xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-zen-border-dark bg-zen-panel/90">
          <div className="flex items-center gap-2">
            <Key className="w-5 h-5 text-zen-red" />
            <h2 className="text-lg font-bold text-zen-charcoal tracking-wide">Developer settings</h2>
          </div>
          <button 
            onClick={onClose} 
            className="p-1 hover:bg-zen-panel-hover rounded-lg text-zen-charcoal-light hover:text-zen-charcoal transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-zen-border bg-zen-panel/40 px-6">
          <button
            onClick={() => setActiveTab('api')}
            className={`py-3 px-4 text-sm font-bold border-b-2 transition ${
              activeTab === 'api' 
                ? 'border-zen-red text-zen-charcoal' 
                : 'border-transparent text-zen-charcoal-light hover:text-zen-charcoal'
            }`}
          >
            Gemini API Key
          </button>
          <button
            onClick={() => setActiveTab('db')}
            className={`py-3 px-4 text-sm font-bold border-b-2 transition ${
              activeTab === 'db' 
                ? 'border-zen-red text-zen-charcoal' 
                : 'border-transparent text-zen-charcoal-light hover:text-zen-charcoal'
            }`}
          >
            Database Architecture
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {message && (
            <div className="p-3 bg-emerald-50/90 border border-emerald-300 text-emerald-700 rounded-lg text-sm text-center font-bold">
              {message}
            </div>
          )}

          {activeTab === 'api' ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-zen-charcoal-light uppercase tracking-wider">
                  Google Gemini API Key
                </label>
                <div className="relative">
                  <input
                    type="password"
                    placeholder="AIzaSy..."
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="w-full bg-zen-panel border border-zen-border rounded-lg px-4 py-3 text-sm text-zen-charcoal focus:outline-none focus:border-zen-red transition placeholder-zen-charcoal-light/40"
                  />
                </div>
                <p className="text-xs text-zen-charcoal-light leading-relaxed">
                  รหัส API Key จะถูกเก็บบันทึกไว้ในเบราว์เซอร์ของคุณเฉพาะระดับท้องถิ่น (Local Storage) เท่านั้น โดยจะนำไปใช้เรียกโมเดล 
                  <span className="text-zen-charcoal font-semibold"> gemini-1.5-flash </span> เพื่อขยายความ System Instruction และให้บริการในหน้า Chat Simulator แบบสดๆ
                </p>
                <div className="mt-1">
                  <a 
                    href="https://aistudio.google.com/app/apikey" 
                    target="_blank" 
                    rel="noreferrer" 
                    className="text-xs text-zen-indigo hover:text-zen-indigo-hover underline font-semibold"
                  >
                    รับ API Key ฟรีได้ที่ Google AI Studio ↗
                  </a>
                </div>
              </div>

              <div className="h-px bg-zen-border-dark my-4" />

              <div className="space-y-2">
                <h3 className="text-sm font-bold text-zen-charcoal">พื้นที่จัดการระบบจัดเก็บ (Local Storage Area)</h3>
                <p className="text-xs text-zen-charcoal-light">
                  ล้างข้อมูล Gems และประวัติต่างๆ ที่สร้างขึ้นทั้งหมด เพื่อกลับไปใช้ค่าเริ่มต้นจากโรงงาน
                </p>
                <button
                  onClick={handleResetDatabase}
                  className="flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 hover:bg-red-100 text-red-700 text-xs font-semibold rounded-lg transition cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  รีเซ็ตข้อมูลคลัง Gems
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-zen-charcoal-light uppercase tracking-wider">
                  โหมดระบบฐานข้อมูล (Database Mode)
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'local', title: 'Local Storage', desc: 'เก็บในเบราว์เซอร์' },
                    { id: 'supabase', title: 'Supabase DB', desc: 'SQL / Relational' },
                    { id: 'firebase', title: 'Firebase DB', desc: 'NoSQL Realtime' }
                  ].map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setDbMode(m.id)}
                      className={`flex flex-col items-start p-3 border rounded-lg text-left transition cursor-pointer ${
                        dbMode === m.id 
                          ? 'border-zen-red bg-zen-red/10 text-zen-red shadow-sm'
                          : 'border-zen-border hover:border-zen-border-dark bg-zen-panel'
                      }`}
                    >
                      <span className={`text-sm font-bold ${dbMode === m.id ? 'text-zen-red' : 'text-zen-charcoal'}`}>
                        {m.title}
                      </span>
                      <span className="text-[10px] text-zen-charcoal-light mt-1">{m.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {dbMode === 'supabase' && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold text-zen-charcoal-light uppercase tracking-wider">PostgreSQL Schema (Supabase)</span>
                    <button
                      onClick={() => handleCopy(db.getSqlSchema())}
                      className="flex items-center gap-1.5 text-xs text-zen-indigo hover:text-zen-indigo-hover transition font-bold"
                    >
                      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      {copied ? 'คัดลอกแล้ว!' : 'คัดลอก SQL Schema'}
                    </button>
                  </div>
                  <pre className="text-[11px] bg-zen-panel border border-zen-border-dark text-zen-charcoal p-3 rounded-lg overflow-x-auto font-mono max-h-48 scrollbar-thin">
                    {db.getSqlSchema()}
                  </pre>
                  <p className="text-[11px] text-zen-charcoal-light leading-relaxed">
                    💡 **คำแนะนำการเชื่อมต่อ:** สร้างตารางตาม SQL Schema ข้างต้นในแดชบอร์ด Supabase ของคุณ จากนั้นนำ PostgreSQL URL 
                    มาตั้งค่าเชื่อมต่อ Client ของคุณเพื่อทำการเขียนและอ่านแบบเรียลไทม์!
                  </p>
                </div>
              )}

              {dbMode === 'firebase' && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold text-zen-charcoal-light uppercase tracking-wider">Firebase Realtime JSON Mock</span>
                    <button
                      onClick={() => handleCopy(db.getFirebaseSchema())}
                      className="flex items-center gap-1.5 text-xs text-zen-indigo hover:text-zen-indigo-hover transition font-bold"
                    >
                      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      {copied ? 'คัดลอกแล้ว!' : 'คัดลอก JSON'}
                    </button>
                  </div>
                  <pre className="text-[11px] bg-zen-panel border border-zen-border-dark text-zen-charcoal p-3 rounded-lg overflow-x-auto font-mono max-h-48 scrollbar-thin">
                    {db.getFirebaseSchema()}
                  </pre>
                  <p className="text-[11px] text-zen-charcoal-light leading-relaxed">
                    🔥 **คำแนะนำการเชื่อมต่อ:** นำโครงสร้าง NoSQL JSON โครงร่างนี้ไปป้อนใส่ใน Firebase Realtime Database 
                    หรือปรับใช้ใน Cloud Firestore เพื่อรองรับการเก็บโครงสร้างข้อมูล GemForge Studio แบบเอกสาร
                  </p>
                </div>
              )}

              {dbMode === 'local' && (
                <div className="p-4 bg-zen-panel border border-zen-border rounded-lg flex items-start gap-3">
                  <Database className="w-5 h-5 text-zen-charcoal-light flex-shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-zen-charcoal">Local-First Sandbox Mode</h4>
                    <p className="text-[11px] text-zen-charcoal-light leading-relaxed">
                      ไม่ต้องตั้งค่าใดๆ เพิ่มเติม ข้อมูล Gems ทั้งหมดของคุณจะจัดเก็บลงบน Local Storage ของคอมพิวเตอร์เครื่องนี้ 
                      เหมาะอย่างยิ่งสำหรับการออกแบบและทดสอบ Prompt ทันทีอย่างเป็นส่วนตัว
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end items-center gap-3 px-6 py-4 border-t border-zen-border-dark bg-zen-panel/90">
          <button
            onClick={onClose}
            className="px-4 py-2 hover:bg-zen-panel-hover text-zen-charcoal-light hover:text-zen-charcoal rounded-lg text-sm transition cursor-pointer"
          >
            ยกเลิก
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-zen-red hover:bg-zen-red-hover text-white rounded-lg text-sm font-bold transition cursor-pointer"
          >
            บันทึกการตั้งค่า
          </button>
        </div>
      </div>
    </div>
  );
}
