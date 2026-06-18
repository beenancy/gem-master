'use client';

import React, { useState } from 'react';
import { 
  Copy, Check, Sparkles, Code, Palette, TrendingUp, 
  GraduationCap, Heart, Scale, Megaphone, User, HeartHandshake, 
  Layers, MessageSquare, Star, X, Info, HelpCircle
} from 'lucide-react';
import { categories } from '../data/categories';
import { db } from '../utils/db';

const iconMap = {
  developer: Code,
  design: Palette,
  finance: TrendingUp,
  education: GraduationCap,
  medicine: Heart,
  law: Scale,
  marketing: Megaphone
};

export default function Marketplace({ gems, searchQuery, onCustomize }) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [copiedId, setCopiedId] = useState(null);
  
  // Reviews modal state
  const [selectedGemForModal, setSelectedGemForModal] = useState(null);
  const [reviewsList, setReviewsList] = useState([]);
  const [newAuthor, setNewAuthor] = useState('');
  const [newStars, setNewStars] = useState(5);
  const [newText, setNewText] = useState('');

  // Guide language toggle
  const [guideLang, setGuideLang] = useState('th'); // 'th', 'en'
  const [showGuide, setShowGuide] = useState(true);

  // Filter gems based on category & search query
  const filteredGems = gems.filter(gem => {
    const matchesCategory = selectedCategory === 'all' || gem.category === selectedCategory;
    
    const term = searchQuery.toLowerCase().trim();
    if (!term) return matchesCategory;
    
    const matchesSearch = 
      (gem.name || '').toLowerCase().includes(term) ||
      (gem.description || '').toLowerCase().includes(term) ||
      (gem.category || '').toLowerCase().includes(term) ||
      (gem.creator_name || 'Anonymous').toLowerCase().includes(term);
      
    return matchesCategory && matchesSearch;
  });

  const handleCopy = (e, gem) => {
    e.stopPropagation();
    navigator.clipboard.writeText(gem.system_instructions);
    db.incrementCopyCount(gem.gem_id);
    setCopiedId(gem.gem_id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleUpvote = (e, gem_id) => {
    e.stopPropagation();
    db.upvoteGem(gem_id);
    const index = gems.findIndex(g => g.gem_id === gem_id);
    if (index >= 0) {
      gems[index].upvotes = (gems[index].upvotes || 0) + 1;
      setCopiedId(`upvoted_${gem_id}`);
      setTimeout(() => setCopiedId(null), 1000);
    }
  };

  const openReviewsModal = (e, gem) => {
    e.stopPropagation();
    setSelectedGemForModal(gem);
    const revs = db.getReviews(gem.gem_id);
    setReviewsList(revs);
    setNewAuthor('');
    setNewStars(5);
    setNewText('');
  };

  const handlePostReview = (e) => {
    e.preventDefault();
    if (!newText.trim()) return;

    const reviewObj = {
      author: newAuthor.trim() || 'Anonymous Developer',
      stars: newStars,
      text: newText.trim()
    };

    const added = db.addReview(selectedGemForModal.gem_id, reviewObj);
    setReviewsList(prev => [...prev, added]);
    
    setNewAuthor('');
    setNewStars(5);
    setNewText('');
  };

  const calculateAverageRating = (reviews) => {
    if (!reviews || reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, r) => acc + r.stars, 0);
    return (sum / reviews.length).toFixed(1);
  };

  return (
    <div className="space-y-8 pb-16">
      
      {/* Hero Section */}
      <section className="relative rounded-2xl overflow-hidden border border-zen-border bg-zen-panel px-6 py-10 sm:px-12 sm:py-16 shadow-2xl">
        <div className="glow-bg top-[-50px] right-[-50px]" />
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zen-red/10 border border-zen-red/20 text-zen-red text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>The Multi-LLM Prompt & Agentic Tools Studio</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-zen-charcoal leading-tight">
            ออกแบบ สร้าง และแชร์ <br/>
            <span className="bg-gradient-to-r from-zen-indigo via-zen-indigo/80 to-zen-red bg-clip-text text-transparent font-black">
              Multi-LLM Prompt Architectures
            </span>
          </h2>
          <p className="text-zen-charcoal-light text-xs sm:text-sm leading-relaxed">
            สร้างระบบ AI Persona และแปลงรูปแบบคำสั่งให้เข้ากับโมเดลชื่อดัง (Gemini, Claude, GPT) 
            พร้อมด้วยตัวช่วยประกาศสกีมาเครื่องมือ (JSON Tool Schema Builder) และทดสอบแชทจำลองแบบตอบโต้ทันที
          </p>
        </div>
      </section>

      {/* BILINGUAL QUICK START GUIDE */}
      <div className="glass-panel rounded-xl p-5 border border-zen-border relative">
        <div className="flex justify-between items-center border-b border-zen-border pb-3 mb-4">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-zen-red" />
            <h3 className="text-xs font-bold text-zen-charcoal uppercase tracking-wider">
              {guideLang === 'th' ? 'คู่มือแนะนำการใช้งานฉบับย่อ' : 'Quick Start User Guide'}
            </h3>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex bg-zen-panel p-0.5 rounded border border-zen-border text-[10px]">
              <button 
                onClick={() => setGuideLang('th')} 
                className={`px-2 py-0.5 rounded transition font-bold ${guideLang === 'th' ? 'bg-zen-border-dark text-zen-charcoal' : 'text-zen-charcoal-light/70'}`}
              >
                ไทย
              </button>
              <button 
                onClick={() => setGuideLang('en')} 
                className={`px-2 py-0.5 rounded transition font-bold ${guideLang === 'en' ? 'bg-zen-border-dark text-zen-charcoal' : 'text-zen-charcoal-light/70'}`}
              >
                EN
              </button>
            </div>
            <button 
              onClick={() => setShowGuide(!showGuide)} 
              className="text-xs text-zen-charcoal-light hover:text-zen-charcoal transition underline"
            >
              {showGuide ? (guideLang === 'th' ? 'ซ่อน' : 'Hide') : (guideLang === 'th' ? 'แสดง' : 'Show')}
            </button>
          </div>
        </div>

        {showGuide && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-xs">
            {guideLang === 'th' ? (
              <>
                <div className="p-3 bg-zen-panel/40 border border-zen-border rounded-lg space-y-1">
                  <div className="text-[10px] font-bold text-zen-red">ขั้นตอนที่ 1</div>
                  <h4 className="font-bold text-zen-charcoal">เลือกและโหลด</h4>
                  <p className="text-[11px] text-zen-charcoal-light leading-normal">เลือก Gem ที่ชอบจากหน้านี้ แล้วกดปุ่ม <b>"โหลดเข้า Studio"</b> เพื่อนำค่าของ Gem ตัวนั้นเข้าสู่แดชบอร์ดออกแบบ</p>
                </div>
                <div className="p-3 bg-zen-panel/40 border border-zen-border rounded-lg space-y-1">
                  <div className="text-[10px] font-bold text-zen-red">ขั้นตอนที่ 2</div>
                  <h4 className="font-bold text-zen-charcoal">เลือกค่ายโมเดล</h4>
                  <p className="text-[11px] text-zen-charcoal-light leading-normal">ตั้งค่า **Target AI Engine** เพื่อเลือกว่าจะใช้กับ Gemini (Markdown), GPT (System Prompt) หรือ Claude (XML Tags)</p>
                </div>
                <div className="p-3 bg-zen-panel/40 border border-zen-border rounded-lg space-y-1">
                  <div className="text-[10px] font-bold text-zen-red">ขั้นตอนที่ 3</div>
                  <h4 className="font-bold text-zen-charcoal">ติดปีกความรู้ & ทูล</h4>
                  <p className="text-[11px] text-zen-charcoal-light leading-normal">ติ๊กเลือกแหล่งความรู้อ้างอิงมาตรฐานจาก **Knowledge Auto-Fetcher** หรือเปิดใช้ **Agentic Tools** เพื่อจำลองพฤติกรรมบอท</p>
                </div>
                <div className="p-3 bg-zen-panel/40 border border-zen-border rounded-lg space-y-1">
                  <div className="text-[10px] font-bold text-zen-red">ขั้นตอนที่ 4</div>
                  <h4 className="font-bold text-zen-charcoal">ทดสอบบอทจำลอง</h4>
                  <p className="text-[11px] text-zen-charcoal-light leading-normal">คลิก **"Prompt Simulator"** ด้านขวาเพื่อพูดคุยทดสอบ และดูขั้นตอนจำลองการเรียกใช้เครื่องมือ (Mock Tool Call) ทันที</p>
                </div>
                <div className="p-3 bg-zen-panel/40 border border-zen-border rounded-lg space-y-1">
                  <div className="text-[10px] font-bold text-zen-red">ขั้นตอนที่ 5</div>
                  <h4 className="font-bold text-zen-charcoal">คัดลอกหรือดาวน์โหลด</h4>
                  <p className="text-[11px] text-zen-charcoal-light leading-normal">กด **"Copy Prompt"** หรือดาวน์โหลดไฟล์ **JSON Config** เพื่อนำ Prompt และ Tool Schema ไปป้อนใช้งานจริง</p>
                </div>
              </>
            ) : (
              <>
                <div className="p-3 bg-zen-panel/40 border border-zen-border rounded-lg space-y-1">
                  <div className="text-[10px] font-bold text-zen-red">STEP 1</div>
                  <h4 className="font-bold text-zen-charcoal">Browse & Load</h4>
                  <p className="text-[11px] text-zen-charcoal-light leading-normal">Browse through 50+ templates and click <b>"Load into Studio"</b> to sync metadata directly into your workspace.</p>
                </div>
                <div className="p-3 bg-zen-panel/40 border border-zen-border rounded-lg space-y-1">
                  <div className="text-[10px] font-bold text-zen-red">STEP 2</div>
                  <h4 className="font-bold text-zen-charcoal">Target LLM</h4>
                  <p className="text-[11px] text-zen-charcoal-light leading-normal">Choose your target model (Gemini for system instruction, OpenAI for system messages, Claude for XML format).</p>
                </div>
                <div className="p-3 bg-zen-panel/40 border border-zen-border rounded-lg space-y-1">
                  <div className="text-[10px] font-bold text-zen-red">STEP 3</div>
                  <h4 className="font-bold text-zen-charcoal">Fetcher & Tools</h4>
                  <p className="text-[11px] text-zen-charcoal-light leading-normal">Select authoritative web references using **Knowledge Fetcher** or enable **Agentic Tools** to allocate function calls.</p>
                </div>
                <div className="p-3 bg-zen-panel/40 border border-zen-border rounded-lg space-y-1">
                  <div className="text-[10px] font-bold text-zen-red">STEP 4</div>
                  <h4 className="font-bold text-zen-charcoal">Test Sandbox</h4>
                  <p className="text-[11px] text-zen-charcoal-light leading-normal">Navigate to **"Prompt Simulator"** to text chat in sandbox and inspect intermediate `🔧 Tool Calls` dynamically.</p>
                </div>
                <div className="p-3 bg-zen-panel/40 border border-zen-border rounded-lg space-y-1">
                  <div className="text-[10px] font-bold text-zen-red">STEP 5</div>
                  <h4 className="font-bold text-zen-charcoal">Export Prompt</h4>
                  <p className="text-[11px] text-zen-charcoal-light leading-normal">Click **"Copy Prompt"** or **"Download JSON Config"** to export structured system instructions and schemas for production.</p>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Category Tabs */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold text-zen-charcoal-light uppercase tracking-wider">ค้นหาตามหมวดหมู่สายอาชีพ</h3>
        <div className="flex flex-wrap gap-2 pb-2 border-b border-zen-border-dark">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold border transition ${
              selectedCategory === 'all'
                ? 'border-zen-red bg-zen-red/10 text-zen-red shadow-sm'
                : 'border-zen-border bg-zen-panel text-zen-charcoal-light hover:text-zen-charcoal hover:border-zen-border-dark'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            ทั้งหมด
          </button>
          
          {categories.map((cat) => {
            const IconComponent = iconMap[cat.id] || Sparkles;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold border transition ${
                  selectedCategory === cat.id
                    ? 'border-zen-red bg-zen-red/10 text-zen-red shadow-sm'
                    : 'border-zen-border bg-zen-panel text-zen-charcoal-light hover:text-zen-charcoal hover:border-zen-border-dark'
                }`}
              >
                <IconComponent className="w-3.5 h-3.5" />
                {cat.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Gem Grid */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-xs font-bold text-zen-charcoal-light uppercase tracking-wider">
            คลังสถาปัตยกรรม Gems ({filteredGems.length} รายการ)
          </h3>
        </div>

        {filteredGems.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 border border-zen-border rounded-xl bg-zen-panel/20 text-center space-y-3">
            <HeartHandshake className="w-12 h-12 text-zen-charcoal-light" />
            <div className="space-y-1">
              <p className="text-sm font-bold text-zen-charcoal">ไม่พบโมเดล Gems ตามคำค้นหา</p>
              <p className="text-xs text-zen-charcoal-light">ลองป้อนคำอื่น หรือเลือกหมวดหมู่อื่นด้านบน</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGems.map((gem) => {
              const IconComp = iconMap[gem.category] || Sparkles;
              return (
                <div 
                  key={gem.gem_id} 
                  className="glass-card flex flex-col justify-between p-6 rounded-xl border border-zen-border bg-zen-card hover:-translate-y-0.5 relative group"
                >
                  <div className="space-y-3">
                    {/* Header Card */}
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-zen-panel border border-zen-border text-zen-red rounded-lg">
                          <IconComp className="w-4 h-4" />
                        </div>
                        <span className="text-[10px] text-zen-charcoal-light font-semibold uppercase tracking-wider bg-zen-panel border border-zen-border px-2 py-0.5 rounded-full">
                          {gem.experience || 'Senior'}
                        </span>
                      </div>
                      
                      {/* Interactive Upvotes */}
                      <button
                        onClick={(e) => handleUpvote(e, gem.gem_id)}
                        className={`flex items-center gap-1.5 text-[10px] font-semibold px-2 py-1 rounded-md border transition ${
                          copiedId === `upvoted_${gem.gem_id}`
                            ? 'bg-zen-red/15 border-zen-red/40 text-zen-red'
                            : 'bg-zen-panel border border-zen-border text-zen-charcoal-light hover:text-zen-red hover:border-zen-red/40'
                        }`}
                      >
                        <Heart className={`w-3.5 h-3.5 ${copiedId === `upvoted_${gem.gem_id}` ? 'fill-zen-red text-zen-red' : 'text-zen-charcoal-light/70'}`} />
                        <span>{gem.upvotes || 0}</span>
                      </button>
                    </div>

                    {/* Content Card */}
                    <div className="space-y-1">
                      <h4 className="text-base font-bold text-zen-charcoal group-hover:text-zen-red transition">
                        {gem.name}
                      </h4>
                      <p className="text-xs text-zen-charcoal-light leading-relaxed min-h-[40px] line-clamp-2">
                        {gem.description}
                      </p>
                    </div>

                    {/* Metadata Creators */}
                    <div className="flex items-center justify-between text-[10px] text-zen-charcoal-light pt-2 border-t border-zen-border-dark">
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        <span>โดย: {gem.creator_name || 'ForgeMaster'}</span>
                      </div>
                      
                      {/* Reviews count trigger */}
                      <button
                        onClick={(e) => openReviewsModal(e, gem)}
                        className="flex items-center gap-1 text-zen-indigo hover:underline hover:text-zen-indigo-hover transition font-bold"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>รีวิว/ข้อเสนอแนะ</span>
                      </button>
                    </div>
                  </div>

                  {/* Actions buttons */}
                  <div className="flex items-center gap-2 mt-6 pt-4 border-t border-zen-border-dark">
                    <button
                      onClick={(e) => handleCopy(e, gem)}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-bold rounded-lg border transition ${
                        copiedId === gem.gem_id
                          ? 'bg-emerald-50/90 border-emerald-300 text-emerald-700'
                          : 'bg-zen-panel border border-zen-border hover:border-zen-border-dark hover:bg-zen-panel-hover text-zen-charcoal-light hover:text-zen-charcoal'
                      }`}
                    >
                      {copiedId === gem.gem_id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedId === gem.gem_id ? 'คัดลอกแล้ว!' : 'Copy Prompt'}
                    </button>
                    
                    <button
                      onClick={() => onCustomize(gem)}
                      className="px-3.5 py-2 text-xs font-bold bg-zen-red hover:bg-zen-red-hover text-white rounded-lg transition cursor-pointer"
                    >
                      โหลดเข้า Studio
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* REVIEWS & DETAILS MODAL */}
      {selectedGemForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-2xl bg-zen-bg border border-zen-border-dark rounded-xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-zen-border-dark bg-zen-panel/90">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-zen-red" />
                <div>
                  <h3 className="text-sm font-bold text-zen-charcoal tracking-wide">
                    ความคิดเห็นและรีวิว: <span className="text-zen-red">{selectedGemForModal.name}</span>
                  </h3>
                  <p className="text-[10px] text-zen-charcoal-light">แชร์ไอเดีย วิธีปรับปรุงระบบคำสั่งบทบาท หรือปัญหาที่พบการใช้งาน</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedGemForModal(null)} 
                className="p-1 hover:bg-zen-panel-hover rounded-lg text-zen-charcoal-light hover:text-zen-charcoal transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* Avg rating summary */}
              <div className="flex items-center gap-6 p-4 bg-zen-panel/60 border border-zen-border rounded-lg">
                <div className="text-center">
                  <span className="text-3xl font-black text-zen-charcoal">{calculateAverageRating(reviewsList)}</span>
                  <span className="text-xs text-zen-charcoal-light block">จาก 5 ดาว</span>
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star 
                        key={s} 
                        className={`w-4 h-4 ${
                          s <= Math.round(calculateAverageRating(reviewsList)) 
                            ? 'text-amber-400 fill-amber-400' 
                            : 'text-zen-border-dark'
                        }`} 
                      />
                    ))}
                  </div>
                  <p className="text-xs text-zen-charcoal-light leading-relaxed">
                    มีผลประโยชน์โดยรวมดีมาก เหมาะสำหรับนำไปตั้งค่าความเชี่ยวชาญระดับ {selectedGemForModal.experience} 
                    ในสายงาน {selectedGemForModal.category}
                  </p>
                </div>
              </div>

              {/* Reviews Timeline */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-zen-charcoal-light uppercase tracking-wider">ประวัติการรีวิวและคอมเมนต์</h4>
                {reviewsList.length === 0 ? (
                  <p className="text-xs text-zen-charcoal-light/75 italic text-center py-4">ยังไม่มีการรีวิวสำหรับ Gem นี้ ลองมาเป็นคนแรกที่ส่งข้อคิดเห็นสิ!</p>
                ) : (
                  <div className="space-y-3">
                    {reviewsList.map((rev) => (
                      <div key={rev.id} className="p-3.5 rounded-lg border border-zen-border bg-zen-panel/40 space-y-1.5">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-zen-charcoal">{rev.author}</span>
                            <div className="flex gap-0.5">
                              {[1, 2, 3, 4, 5].map((s) => (
                                <Star key={s} className={`w-2.5 h-2.5 ${s <= rev.stars ? 'text-amber-400 fill-amber-400' : 'text-zen-border-dark'}`} />
                              ))}
                            </div>
                          </div>
                          <span className="text-[9px] text-zen-charcoal-light/80">{rev.date}</span>
                        </div>
                        <p className="text-xs text-zen-charcoal-light leading-normal">{rev.text}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Leave a review Form */}
              <div className="border-t border-zen-border-dark pt-6 space-y-3">
                <h4 className="text-xs font-bold text-zen-charcoal-light uppercase tracking-wider">ร่วมแสดงความเห็นและให้คะแนน</h4>
                <form onSubmit={handlePostReview} className="space-y-3.5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-bold text-zen-charcoal-light uppercase tracking-wide">ชื่อผู้คอมเมนต์/นามแฝง</label>
                      <input
                        type="text"
                        placeholder="เช่น DevSteve, ครูสมพร"
                        value={newAuthor}
                        onChange={(e) => setNewAuthor(e.target.value)}
                        className="w-full bg-zen-panel border border-zen-border rounded-lg px-3 py-1.5 text-xs text-zen-charcoal focus:outline-none focus:border-zen-red"
                      />
                    </div>
                    
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-bold text-zen-charcoal-light uppercase tracking-wide">คะแนนระดับดาว</label>
                      <div className="flex gap-1.5 pt-1.5">
                        {[1, 2, 3, 4, 5].map((starsCount) => (
                          <button
                            key={starsCount}
                            type="button"
                            onClick={() => setNewStars(starsCount)}
                            className="text-zen-charcoal-light hover:text-amber-500 transition"
                          >
                            <Star 
                              className={`w-5 h-5 ${
                                starsCount <= newStars 
                                  ? 'text-amber-400 fill-amber-400' 
                                  : 'text-zen-border-dark hover:text-amber-400'
                              }`} 
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold text-zen-charcoal-light uppercase tracking-wide">ข้อความเสนอแนะ / รีวิวการรันโค้ด</label>
                    <textarea
                      rows={3}
                      placeholder="พิมพ์ข้อความรีวิวเพื่อปรับปรุงตัวแปร หรืออธิบายข้อดี..."
                      value={newText}
                      onChange={(e) => setNewText(e.target.value)}
                      className="w-full bg-zen-panel border border-zen-border rounded-lg px-3 py-2 text-xs text-zen-charcoal focus:outline-none focus:border-zen-red"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={!newText.trim()}
                    className={`w-full py-2 bg-zen-red hover:bg-zen-red-hover text-white font-bold rounded-lg text-xs transition ${
                      !newText.trim() ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
                    }`}
                  >
                    ส่งข้อมูลรีวิว
                  </button>
                </form>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-zen-border-dark bg-zen-panel/90 flex justify-end">
              <button
                onClick={() => setSelectedGemForModal(null)}
                className="px-4 py-2 hover:bg-zen-panel-hover border border-zen-border text-zen-charcoal-light hover:text-zen-charcoal rounded-lg text-xs transition cursor-pointer"
              >
                ปิดหน้าต่าง
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
