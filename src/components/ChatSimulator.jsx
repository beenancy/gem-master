'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Send, Trash2, Bot, User, Cpu, Terminal, Search, Database } from 'lucide-react';
import { geminiService } from '../utils/gemini';

export default function ChatSimulator({ systemInstructions, apiKey, personaName, selectedTools = [] }) {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);

  // Welcome message
  useEffect(() => {
    setMessages([
      {
        id: 'welcome',
        sender: 'ai',
        text: `สวัสดีครับ/ค่ะ! ฉันคือผู้ช่วย AI "${personaName}" ที่ถูกโปรแกรมด้วย System Instructions ของคุณ เรียบร้อยแล้ว ยินดีต้อนรับสู่ห้องแชททดสอบร่างจำลอง ลองพิมพ์ถามคำถามเพื่อเช็คสไตล์การตอบคำถามของฉันได้เลยนะ! 🚀`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  }, [systemInstructions, personaName]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const userText = inputMessage.trim();
    setInputMessage('');
    setError('');

    // Append user message
    const userMsg = {
      id: `msg_${Date.now()}_user`,
      sender: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      let mockTool = null;
      const textLower = userText.toLowerCase();

      // Check if tools are enabled and match user intent
      if (selectedTools.length > 0) {
        if (selectedTools.includes('execute_code') && 
           (textLower.includes('คำนวณ') || textLower.includes('solve') || textLower.includes('เลข') || 
            textLower.includes('บวก') || textLower.includes('ลบ') || textLower.includes('คูณ') || 
            textLower.includes('หาร') || textLower.includes('factorial') || textLower.includes('code') || 
            textLower.includes('รหัส') || textLower.includes('python'))) {
          
          mockTool = {
            name: 'execute_code',
            icon: Terminal,
            args: { code: `def solve_problem():\n    # คำนวณสูตรโดยใช้ Python Sandbox\n    result = eval("${userText.replace(/[^0-9+\-*/().]/g, '') || '5 * 24'}")\n    return result\n\nprint(solve_problem())` },
            response: `stdout: 120\nexitCode: 0\nreturnValue: 120`
          };
        } else if (selectedTools.includes('fetch_web_content') && 
                  (textLower.includes('อากาศ') || textLower.includes('ค้นหา') || textLower.includes('ข่าว') || 
                   textLower.includes('search') || textLower.includes('คืออะไร') || textLower.includes('google') || 
                   textLower.includes('ใคร'))) {
          
          mockTool = {
            name: 'fetch_web_content',
            icon: Search,
            args: { query: userText },
            response: `Status: 200 OK\nResults:\n[1] "สรุปข่าวสารล่าสุดในสัปดาห์นี้และรายงานสภาพอากาศ: เมฆครึ้ม ฝนตกเล็กน้อย อุณหภูมิ 24°C"\n[2] "คำจำกัดความมาตรฐานอ้างอิง: ข้อมูลเอกสารประวัติและที่มาของสารสนเทศ..."`
          };
        } else if (selectedTools.includes('read_database') && 
                  (textLower.includes('ฐานข้อมูล') || textLower.includes('sql') || textLower.includes('ตาราง') || 
                   textLower.includes('select') || textLower.includes('query') || textLower.includes('db'))) {
          
          mockTool = {
            name: 'read_database',
            icon: Database,
            args: { sql: `SELECT * FROM gems WHERE name LIKE '%${userText.slice(0, 10)}%' LIMIT 5;` },
            response: `[\n  { "gem_id": "template_kru_math_m2", "name": "Kru Math M2", "copy_count": 1240 },\n  { "gem_id": "template_master_architect", "name": "Master Architect", "copy_count": 2450 }\n]`
          };
        }
      }

      // If we matched a mock tool, simulate the tool calling intermediate steps
      if (mockTool) {
        // Wait 1.2s to show "Thinking/Calling Tool"
        await new Promise(r => setTimeout(r, 1200));
        
        // Append Tool Call Message
        const toolMsg = {
          id: `msg_${Date.now()}_tool`,
          sender: 'system',
          text: `Executing tool: ${mockTool.name}...`,
          toolCall: mockTool,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, toolMsg]);
        
        // Wait 1s for tool response
        await new Promise(r => setTimeout(r, 1000));
      }

      // Send chat log to Gemini Service
      const promptToUse = systemInstructions + (mockTool ? `\n\n[ข้อมูลเสริมจากการรันเครื่องมือ ${mockTool.name}]: ${mockTool.response}` : "");
      const aiResponse = await geminiService.sendSimulatorMessage(
        messages.filter(m => m.sender !== 'system'), // skip tool logs from actual history
        promptToUse,
        userText,
        apiKey
      );

      const aiMsg = {
        id: `msg_${Date.now()}_ai`,
        sender: 'ai',
        text: aiResponse,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      console.error(err);
      setError(err.message || 'เกิดข้อผิดพลาดในการจำลองการแชท');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    if (confirm('คุณต้องการเคลียร์ประวัติการคุยทั้งหมดใช่หรือไม่?')) {
      setMessages([
        {
          id: 'welcome_reset',
          sender: 'ai',
          text: `รีเซ็ตการคุยเสร็จเรียบร้อย! ฉันคือ "${personaName}" พร้อมสำหรับการทดสอบใหม่อีกครั้งแล้วค่ะ/ครับ`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      setError('');
    }
  };

  return (
    <div className="flex flex-col h-[480px] bg-zen-bg border border-zen-border-dark rounded-lg overflow-hidden relative shadow-inner">
      
      {/* Simulator Info Header */}
      <div className="flex justify-between items-center px-4 py-2 border-b border-zen-border bg-zen-panel">
        <div className="flex items-center gap-1.5">
          <Bot className="w-4 h-4 text-zen-red" />
          <span className="text-[11px] font-bold text-zen-charcoal">
            แชทจำลอง: <span className="text-zen-charcoal underline decoration-zen-red">{personaName}</span>
          </span>
          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
            apiKey 
              ? 'bg-zen-indigo/10 border-zen-indigo/30 text-zen-indigo' 
              : 'bg-zen-panel border-zen-border text-zen-charcoal-light'
          }`}>
            {apiKey ? 'Live: Gemini 1.5 Flash' : 'Sandbox (โหมดจำลอง)'}
          </span>
        </div>
        <button
          onClick={handleClearChat}
          className="text-zen-charcoal-light hover:text-zen-red p-1 hover:bg-zen-panel-hover rounded transition"
          title="ล้างประวัติการแชท"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Messages Window */}
      <div className="flex-grow overflow-y-auto p-4 space-y-4 scrollbar-thin bg-zen-bg/15">
        {messages.map((msg) => {
          if (msg.sender === 'system' && msg.toolCall) {
            const ToolIcon = msg.toolCall.icon;
            return (
              <div key={msg.id} className="mx-auto w-full max-w-[95%] p-3.5 rounded-lg border border-zen-border bg-zen-panel/60 space-y-2 font-mono text-[10px] text-zen-charcoal shadow-md">
                <div className="flex items-center gap-2 text-zen-indigo font-bold border-b border-zen-border-dark pb-1.5">
                  <ToolIcon className="w-3.5 h-3.5 text-zen-indigo" />
                  <span>🔧 Tool Invoked: {msg.toolCall.name}()</span>
                </div>
                <div className="space-y-1">
                  <span className="text-zen-charcoal-light/85 block">// Arguments (JSON)</span>
                  <pre className="p-2 bg-zen-bg text-emerald-700 rounded text-[9.5px] border border-zen-border leading-normal">
                    {JSON.stringify(msg.toolCall.args, null, 2)}
                  </pre>
                </div>
                <div className="space-y-1">
                  <span className="text-zen-charcoal-light/85 block">// Returned Response</span>
                  <pre className="p-2 bg-zen-bg text-cyan-700 rounded text-[9.5px] border border-zen-border leading-normal">
                    {msg.toolCall.response}
                  </pre>
                </div>
              </div>
            );
          }

          return (
            <div
              key={msg.id}
              className={`flex items-start gap-2 max-w-[85%] ${
                msg.sender === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
              }`}
            >
              <div className={`p-1.5 rounded-lg border text-xs flex-shrink-0 ${
                msg.sender === 'user' 
                  ? 'bg-zen-indigo/10 border-zen-indigo/25 text-zen-indigo font-bold' 
                  : 'bg-zen-panel border-zen-border text-zen-charcoal-light'
              }`}>
                {msg.sender === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
              </div>

              <div className="space-y-1">
                <div className={`px-4 py-2.5 rounded-xl text-xs leading-relaxed whitespace-pre-wrap ${
                  msg.sender === 'user'
                    ? 'bg-zen-indigo text-white rounded-tr-none font-bold'
                    : 'bg-zen-panel border border-zen-border text-zen-charcoal rounded-tl-none font-sans shadow-sm'
                }`}>
                  {msg.text}
                </div>
                <span className={`text-[9px] text-zen-charcoal-light/60 block ${
                  msg.sender === 'user' ? 'text-right' : 'text-left'
                }`}>
                  {msg.timestamp}
                </span>
              </div>
            </div>
          );
        })}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-start gap-2 max-w-[80%]">
            <div className="p-1.5 rounded-lg border bg-zen-panel border-zen-border text-zen-red flex-shrink-0 animate-pulse">
              <Cpu className="w-3.5 h-3.5 animate-spin" />
            </div>
            <div className="px-4 py-3 rounded-xl rounded-tl-none bg-zen-panel/60 border border-zen-border text-zen-charcoal-light text-xs flex items-center gap-1">
              <span>{personaName} กำลังพิมพ์หรือเลือกใช้เครื่องมือ...</span>
              <span className="flex gap-1 items-center ml-1">
                <span className="w-1 h-1 bg-zen-charcoal-light rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-1 h-1 bg-zen-charcoal-light rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-1 h-1 bg-zen-charcoal-light rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </span>
            </div>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="p-2 border border-red-200 bg-red-50 text-red-700 text-center rounded-lg text-[10px] font-bold">
            ⚠️ ข้อผิดพลาด: {error}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Submit Area */}
      <form onSubmit={handleSendMessage} className="p-3 border-t border-zen-border bg-zen-panel/40 flex gap-2">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder={selectedTools.length > 0 
            ? `พิมพ์ถามเกี่ยวกับคำนวณ, อากาศ, หรือฐานข้อมูล เพื่อทดสอบ Tool Calls...` 
            : `ลองทักทาย หรือคุยกับ ${personaName}...`}
          className="flex-grow bg-zen-bg border border-zen-border rounded-lg px-4 py-2 text-xs text-zen-charcoal placeholder-zen-charcoal-light/60 focus:outline-none focus:border-zen-red transition"
        />
        <button
          type="submit"
          disabled={!inputMessage.trim() || isLoading}
          className={`p-2 bg-zen-red hover:bg-zen-red-hover text-white rounded-lg transition ${
            (!inputMessage.trim() || isLoading) ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
          }`}
        >
          <Send className="w-4 h-4" />
        </button>
      </form>

    </div>
  );
}
