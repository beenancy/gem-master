'use client';

import React, { useState, useEffect } from 'react';
import { 
  Sparkles, Copy, Check, Save, Play, BookOpen, RotateCcw, Cpu, Download, CodeXml, Settings, Eye
} from 'lucide-react';
import { categories } from '../data/categories';
import { referencesData } from '../data/references';
import { generateLocalInstructions, generateToolSchemas } from '../utils/architect';
import { geminiService } from '../utils/gemini';
import { db } from '../utils/db';
import ChatSimulator from './ChatSimulator';

export default function ArchitectStudio({ loadedGem, onGemSaved }) {
  // Input states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('developer');
  const [experience, setExperience] = useState('Senior');
  const [tone, setTone] = useState('');
  const [goals, setGoals] = useState('');
  const [selectedRefs, setSelectedRefs] = useState([]);
  
  // New States: LLM Provider and Agentic Tools
  const [llmProvider, setLlmProvider] = useState('gemini'); // 'gemini', 'openai', 'claude'
  const [selectedTools, setSelectedTools] = useState([]); // ['fetch_web_content', 'execute_code', 'read_database']

  // Output states
  const [activeTab, setActiveTab] = useState('instructions'); // 'instructions', 'tools', 'simulator'
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [copied, setCopied] = useState(false);
  const [toolCopied, setToolCopied] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');

  // Sync loaded Gem
  useEffect(() => {
    if (loadedGem) {
      setName(loadedGem.name || '');
      setDescription(loadedGem.description || '');
      setCategory(loadedGem.category || 'developer');
      setExperience(loadedGem.experience || 'Senior');
      setTone(loadedGem.tone || '');
      setGoals(loadedGem.goals || '');
      setGeneratedPrompt(loadedGem.system_instructions || '');
      setSelectedRefs(loadedGem.references || []);
      // Reset tools for templates
      setSelectedTools([]);
      setLlmProvider('gemini');
    } else {
      resetForm();
    }
  }, [loadedGem]);

  // Load API key
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setApiKey(localStorage.getItem('gemforge_api_key') || '');
    }
  }, []);

  const resetForm = () => {
    setName('');
    setDescription('');
    setCategory('developer');
    setExperience('Senior');
    setTone('');
    setGoals('');
    setGeneratedPrompt('');
    setSelectedRefs([]);
    setSelectedTools([]);
    setLlmProvider('gemini');
    setActiveTab('instructions');
  };

  const handleRefCheckboxChange = (refItem, isChecked) => {
    if (isChecked) {
      setSelectedRefs(prev => [...prev, refItem]);
    } else {
      setSelectedRefs(prev => prev.filter(r => r.url !== refItem.url));
    }
  };

  const handleToolCheckboxChange = (toolName, isChecked) => {
    if (isChecked) {
      setSelectedTools(prev => [...prev, toolName]);
    } else {
      setSelectedTools(prev => prev.filter(t => t !== toolName));
    }
  };

  // Generate System Instructions
  const handleGenerate = async () => {
    setIsGenerating(true);
    setSaveStatus('');
    
    const params = {
      name: name || 'AI Assistant',
      category,
      experience,
      tone: tone || 'สุภาพ เป็นกันเอง มีตรรกะ',
      goals: goals || 'ตอบคำถามตามความเชี่ยวชาญ',
      references: selectedRefs,
      llmProvider
    };

    try {
      if (apiKey && llmProvider === 'gemini') {
        // Live Gemini API Generation
        const result = await geminiService.generateInstructions(params, apiKey);
        setGeneratedPrompt(result);
      } else {
        // Local Generation
        const result = generateLocalInstructions(params);
        setGeneratedPrompt(result);
      }
    } catch (err) {
      console.error(err);
      const result = generateLocalInstructions(params);
      setGeneratedPrompt(result + `\n\n*(หมายเหตุ: เกิดข้อผิดพลาด Gemini API: ${err.message})*`);
    } finally {
      setIsGenerating(false);
      setActiveTab('instructions');
    }
  };

  // Save Gem
  const handleSaveToLibrary = () => {
    if (!name.trim()) {
      alert('กรุณากรอกชื่อ Gem ก่อนจัดเก็บลงคลัง');
      return;
    }

    const gemData = {
      gem_id: loadedGem?.gem_id || `gem_${Date.now()}`,
      creator_id: 'forge_user_01',
      creator_name: 'คุณ (ผู้ใช้ทั่วไป)',
      name,
      description: description || `AI Persona สำหรับสายงาน ${category}`,
      system_instructions: generatedPrompt || generateLocalInstructions({
        name, category, experience, tone, goals, references: selectedRefs, llmProvider
      }),
      category,
      experience,
      tone,
      goals,
      references: selectedRefs,
      is_public: true,
      copy_count: loadedGem?.copy_count || 0
    };

    db.saveGem(gemData);
    setSaveStatus('บันทึกข้อมูล Gem สำเร็จ!');
    if (onGemSaved) onGemSaved();
    
    setTimeout(() => {
      setSaveStatus('');
    }, 3000);
  };

  // Download Config JSON Package
  const handleDownloadConfig = () => {
    const configBundle = {
      name: name || 'AI Assistant',
      provider: llmProvider,
      experience,
      tone,
      system_instructions: generatedPrompt,
      tools: selectedTools,
      tool_declarations: JSON.parse(generateToolSchemas(llmProvider, selectedTools) || "[]")
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(configBundle, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_gemforge_config.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(generatedPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyTools = () => {
    navigator.clipboard.writeText(generateToolSchemas(llmProvider, selectedTools));
    setToolCopied(true);
    setTimeout(() => setToolCopied(false), 2000);
  };

  const activeReferences = referencesData[category] || [];
  const toolsJsonContent = generateToolSchemas(llmProvider, selectedTools);
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-16">
      
      {/* LEFT PANE: Inputs & Configuration */}
      <section className="bg-zen-panel border border-zen-border rounded-xl p-6 space-y-6 shadow-xl">
        <div className="flex justify-between items-center border-b border-zen-border-dark pb-4">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-zen-charcoal tracking-wide uppercase">Gem Configurator</h3>
            <p className="text-[11px] text-zen-charcoal-light font-bold">ระบุพารามิเตอร์ของระบบคำสั่งบทบาทอัจฉริยะ</p>
          </div>
          <button 
            onClick={resetForm}
            className="flex items-center gap-1 text-xs text-zen-charcoal-light hover:text-zen-charcoal transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            เคลียร์ฟอร์ม
          </button>
        </div>

        <div className="space-y-4">
          {/* Target LLM dropdown */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold text-zen-charcoal-light uppercase tracking-wide">Target AI Engine (ค่ายโมเดล)</label>
            <select
              value={llmProvider}
              onChange={(e) => setLlmProvider(e.target.value)}
              className="w-full bg-zen-bg border border-zen-border rounded-lg px-3 py-2 text-xs text-zen-charcoal focus:outline-none focus:border-zen-red"
            >
              <option value="gemini">Google Gemini (System Instructions & Knowledge)</option>
              <option value="openai">OpenAI GPT (System Prompts & API Assistant)</option>
              <option value="claude">Anthropic Claude (XML Prompt structure)</option>
            </select>
          </div>

          {/* Name & description */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-zen-charcoal-light uppercase tracking-wide">ชื่อ Gem</label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="เช่น Kru Math M2, AJ Che"
                className="w-full bg-zen-bg border border-zen-border rounded-lg px-3 py-2 text-xs text-zen-charcoal focus:outline-none focus:border-zen-red"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-zen-charcoal-light uppercase tracking-wide">คำอธิบายเด่น</label>
              <input 
                type="text" 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="เช่น ผู้ช่วยแนะนำสูตรลดหย่อนภาษี..."
                className="w-full bg-zen-bg border border-zen-border rounded-lg px-3 py-2 text-xs text-zen-charcoal focus:outline-none focus:border-zen-red"
              />
            </div>
          </div>

          {/* Category & Experience */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-zen-charcoal-light uppercase tracking-wide">หมวดหมู่สายงาน</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-zen-bg border border-zen-border rounded-lg px-3 py-2 text-xs text-zen-charcoal focus:outline-none focus:border-zen-red"
              >
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-zen-charcoal-light uppercase tracking-wide">ระดับวิทยฐานะ</label>
              <select
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                className="w-full bg-zen-bg border border-zen-border rounded-lg px-3 py-2 text-xs text-zen-charcoal focus:outline-none focus:border-zen-red"
              >
                <option value="Junior">Junior (แนะนำตามจริง)</option>
                <option value="Senior">Senior (ประเมินตัวเลือกและอภิปราย)</option>
                <option value="Master">Master (เชี่ยวชาญเฉพาะด้าน)</option>
                <option value="Legendary">Legendary (ผู้นำระดับอุตสาหกรรม/สูตรสากล)</option>
              </select>
            </div>
          </div>

          {/* Tone */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold text-zen-charcoal-light uppercase tracking-wide">น้ำเสียงและสไตล์การคุย (Tone)</label>
            <input 
              type="text" 
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              placeholder="เช่น อบอุ่น ใจดี เป็นกันเอง ใช้คำสุภาพทักทาย..."
              className="w-full bg-zen-bg border border-zen-border rounded-lg px-3 py-2 text-xs text-zen-charcoal focus:outline-none focus:border-zen-red"
            />
          </div>

          {/* Goals */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold text-zen-charcoal-light uppercase tracking-wide">ภารกิจหลัก (Core Goals)</label>
            <textarea 
              rows={3}
              value={goals}
              onChange={(e) => setGoals(e.target.value)}
              placeholder="พิมพ์ภารกิจทีละบรรทัด เช่น:&#10;- ช่วยวางแผนแคมเปญโฆษณา Google Ads&#10;- คัดกรองคีย์เวิร์ดลบที่ไม่เกิดยอดซื้อขาย"
              className="w-full bg-zen-bg border border-zen-border rounded-lg px-3 py-2 text-xs text-zen-charcoal focus:outline-none focus:border-zen-red leading-normal"
            />
          </div>

          {/* AGENTIC TOOLS DECLARATION */}
          <div className="space-y-3 p-4 bg-zen-bg/60 border border-zen-border rounded-lg">
            <div className="flex items-center gap-1.5 text-xs font-bold text-zen-charcoal uppercase tracking-wider">
              <Cpu className="w-4 h-4 text-zen-red animate-pulse" />
              <span>Agentic Tools Configuration</span>
            </div>
            <p className="text-[10px] text-zen-charcoal-light leading-relaxed font-medium">
              ติ๊กเลือกเครื่องมือที่จะมอบหมายให้ Agent เรียกใช้งาน ระบบจะสร้างสกีมาฟังก์ชัน (JSON Tool Schema) ของระบบนั้นให้ทันที
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
              {[
                { id: 'fetch_web_content', label: 'Web Search', desc: 'ดึงข้อมูลสดบนเว็บ' },
                { id: 'execute_code', label: 'Code Sandbox', desc: 'รันโค้ด Python' },
                { id: 'read_database', label: 'DB Query API', desc: 'ค้นหา SQL' }
              ].map(t => (
                <label 
                  key={t.id} 
                  className={`flex flex-col p-2.5 rounded-lg border cursor-pointer transition select-none ${
                    selectedTools.includes(t.id) 
                      ? 'border-zen-red bg-zen-red/10 text-zen-red font-bold' 
                      : 'border-zen-border hover:border-zen-border-dark bg-zen-bg'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedTools.includes(t.id)}
                      onChange={(e) => handleToolCheckboxChange(t.id, e.target.checked)}
                      className="rounded border-zen-border-dark bg-zen-bg text-zen-red focus:ring-zen-red"
                    />
                    <span className="text-xs font-bold text-zen-charcoal">{t.label}</span>
                  </div>
                  <span className="text-[9px] text-zen-charcoal-light mt-1 leading-none">{t.desc}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Knowledge Auto-Fetcher */}
          <div className="space-y-2.5 p-4 bg-zen-bg/60 border border-zen-border rounded-lg">
            <div className="flex items-center gap-1.5 text-xs font-bold text-zen-charcoal uppercase tracking-wider">
              <BookOpen className="w-4 h-4 text-zen-red" />
              <span>Knowledge Auto-Fetcher</span>
            </div>
            <div className="space-y-2 max-h-32 overflow-y-auto pr-1">
              {activeReferences.map((ref) => {
                const isChecked = selectedRefs.some(r => r.url === ref.url);
                return (
                  <label 
                    key={ref.id} 
                    className="flex items-start gap-2.5 p-1.5 rounded hover:bg-zen-panel-hover cursor-pointer transition text-xs"
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) => handleRefCheckboxChange(ref, e.target.checked)}
                      className="mt-0.5 rounded border-zen-border-dark bg-zen-bg text-zen-red focus:ring-zen-red"
                    />
                    <div className="space-y-0.5">
                      <span className="font-bold text-zen-charcoal block leading-none">{ref.title}</span>
                      <span className="text-[9px] text-zen-charcoal-light font-mono block overflow-hidden text-ellipsis whitespace-nowrap max-w-xs">{ref.url}</span>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Action Generate */}
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className={`w-full flex items-center justify-center gap-2 py-3 rounded-lg text-xs font-bold text-white transition ${
              isGenerating
                ? 'bg-zen-border border border-zen-border-dark text-zen-charcoal-light/60 cursor-not-allowed'
                : 'bg-gradient-to-r from-zen-indigo via-zen-indigo/85 to-zen-red hover:opacity-95 shadow-lg shadow-zen-indigo/10 cursor-pointer'
            }`}
          >
            {isGenerating ? (
              <>
                <Cpu className="w-4 h-4 animate-spin text-white" />
                <span>AI Prompt Architect กำลังวิเคราะห์...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>{apiKey && llmProvider === 'gemini' ? 'Generate Architecture with Gemini API' : 'Generate Local System Instructions'}</span>
              </>
            )}
          </button>
          
        </div>
      </section>

      {/* RIGHT PANE: Output & Simulation */}
      <section className="bg-zen-panel border border-zen-border rounded-xl p-6 flex flex-col justify-between min-h-[500px] shadow-xl">
        <div className="flex flex-col h-full space-y-4">
          
          {/* Tabs bar */}
          <div className="flex items-center justify-between border-b border-zen-border-dark pb-3">
            <div className="flex bg-zen-bg p-0.5 rounded-lg border border-zen-border">
              <button
                onClick={() => setActiveTab('instructions')}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition ${
                  activeTab === 'instructions'
                    ? 'bg-zen-border-dark text-zen-charcoal shadow-sm'
                    : 'text-zen-charcoal-light hover:text-zen-charcoal'
                }`}
              >
                System Prompt
              </button>
              
              {/* Tool Schema Tab (Only if tools are active) */}
              {selectedTools.length > 0 && (
                <button
                  onClick={() => setActiveTab('tools')}
                  className={`px-3 py-1.5 rounded-md text-xs font-bold transition flex items-center gap-1 ${
                    activeTab === 'tools'
                      ? 'bg-zen-border-dark text-zen-charcoal shadow-sm'
                      : 'text-zen-charcoal-light hover:text-zen-charcoal'
                  }`}
                >
                  <CodeXml className="w-3.5 h-3.5 text-zen-red" />
                  Tool JSON
                </button>
              )}

              <button
                onClick={() => {
                  if (!generatedPrompt) {
                    alert('กรุณาสร้างหรือโหลด System Prompt ก่อน');
                    return;
                  }
                  setActiveTab('simulator');
                }}
                disabled={!generatedPrompt}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition flex items-center gap-1 ${
                  !generatedPrompt 
                    ? 'opacity-40 cursor-not-allowed text-zen-charcoal-light/50'
                    : activeTab === 'simulator'
                    ? 'bg-zen-border-dark text-zen-charcoal shadow-sm'
                    : 'text-zen-charcoal-light hover:text-zen-charcoal'
                }`}
              >
                <Play className="w-3 h-3 text-emerald-600 fill-emerald-600 animate-pulse" />
                Simulator
              </button>
            </div>

            {saveStatus && (
              <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-300 px-2.5 py-0.5 rounded font-bold">
                {saveStatus}
              </span>
            )}
          </div>

          {/* Tab Content Display */}
          <div className="flex-grow flex flex-col min-h-[300px]">
            {activeTab === 'instructions' && (
              <div className="flex-1 flex flex-col justify-between space-y-4">
                <div className="flex-1 relative flex flex-col">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-bold text-zen-charcoal-light uppercase tracking-wider">
                      Compiled system prompt ({llmProvider.toUpperCase()})
                    </span>
                    <button
                      onClick={handleCopyPrompt}
                      disabled={!generatedPrompt}
                      className={`flex items-center gap-1 text-xs transition font-bold ${
                        !generatedPrompt 
                          ? 'text-zen-charcoal-light/30 cursor-not-allowed'
                          : copied 
                          ? 'text-emerald-600' 
                          : 'text-zen-indigo hover:text-zen-indigo-hover'
                      }`}
                    >
                      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      {copied ? 'คัดลอกแล้ว!' : 'Copy to Clipboard'}
                    </button>
                  </div>
                  
                  <textarea
                    readOnly
                    value={generatedPrompt}
                    placeholder="กดปุ่ม 'Generate' ฝั่งซ้ายมือเพื่อเนรมิตสถาปัตยกรรมระบบคำสั่ง..."
                    className="flex-1 w-full bg-zen-bg border border-zen-border text-zen-charcoal p-4 rounded-lg text-xs font-mono focus:outline-none resize-none leading-relaxed min-h-[350px] scrollbar-thin"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    onClick={handleDownloadConfig}
                    disabled={!generatedPrompt}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition ${
                      !generatedPrompt
                        ? 'bg-zen-panel border border-zen-border text-zen-charcoal-light/50 cursor-not-allowed'
                        : 'bg-zen-bg hover:bg-zen-panel-hover border border-zen-border-dark cursor-pointer text-zen-charcoal'
                    }`}
                    title="ดาวน์โหลดคำสั่งพร้อมสกีมาเครื่องมือเป็นไฟล์ JSON"
                  >
                    <Download className="w-3.5 h-3.5 text-zen-red" />
                    Download JSON Config
                  </button>
                  <button
                    onClick={handleSaveToLibrary}
                    disabled={!generatedPrompt}
                    className={`flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-xs font-bold text-white transition ${
                      !generatedPrompt
                        ? 'bg-zen-panel border border-zen-border text-zen-charcoal-light/50 cursor-not-allowed'
                        : 'bg-zen-indigo hover:bg-zen-indigo-hover cursor-pointer'
                    }`}
                  >
                    <Save className="w-3.5 h-3.5" />
                    บันทึกลงคลังของฉัน
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'tools' && (
              <div className="flex-1 flex flex-col justify-between space-y-4">
                <div className="flex-grow flex flex-col">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-bold text-zen-charcoal-light uppercase tracking-wider">
                      Tool declarations JSON schema ({llmProvider.toUpperCase()})
                    </span>
                    <button
                      onClick={handleCopyTools}
                      className="flex items-center gap-1 text-xs text-zen-indigo hover:text-zen-indigo-hover transition font-bold"
                    >
                      {toolCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      {toolCopied ? 'คัดลอกแล้ว!' : 'Copy Schema'}
                    </button>
                  </div>
                  <pre className="flex-1 text-[11px] bg-zen-bg border border-zen-border text-emerald-700 p-4 rounded-lg overflow-x-auto font-mono min-h-[350px] max-h-[400px] scrollbar-thin">
                    {toolsJsonContent}
                  </pre>
                </div>
              </div>
            )}

            {activeTab === 'simulator' && (
              <ChatSimulator 
                systemInstructions={generatedPrompt} 
                apiKey={apiKey}
                personaName={name || 'AI Assistant'}
                selectedTools={selectedTools}
              />
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
