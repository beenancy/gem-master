import { GoogleGenerativeAI } from '@google/generative-ai';
import { buildAiArchitectPrompt } from './architect';

// Helper to clean markdown blocks from API outputs
const cleanMarkdown = (text) => {
  return text
    .replace(/^```markdown\n?/i, '')
    .replace(/^```\n?/i, '')
    .replace(/```$/i, '')
    .trim();
};

export const geminiService = {
  // Call Gemini to generate System Instructions based on user details
  generateInstructions: async (params, apiKey) => {
    if (!apiKey) {
      throw new Error("Missing Gemini API Key. Please add one in Settings.");
    }

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      // Using gemini-1.5-flash as the fast prompt designer
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const prompt = buildAiArchitectPrompt(params);

      const result = await model.generateContent(prompt);
      const response = await result.response;
      return cleanMarkdown(response.text());
    } catch (error) {
      console.error("Gemini API Error:", error);
      throw new Error(error.message || "Failed to call Gemini API. Check your key and connection.");
    }
  },

  // Chat simulator wrapper: sends history + system instructions to Gemini
  sendSimulatorMessage: async (chatHistory, systemInstructions, userMessage, apiKey) => {
    if (!apiKey) {
      // Return simulated persona responses if no API Key is set
      return geminiService.getMockResponse(systemInstructions, userMessage);
    }

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        systemInstruction: systemInstructions
      });

      // Format previous chat messages for SDK
      const contents = chatHistory.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
      }));

      // Append latest user message
      contents.push({
        role: 'user',
        parts: [{ text: userMessage }]
      });

      const result = await model.generateContent({ contents });
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error("Gemini Chat Error:", error);
      throw new Error(error.message || "Failed to get response from Gemini API.");
    }
  },

  // Mock engine based on prompt analysis
  getMockResponse: (systemInstructions, userMessage) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const text = (systemInstructions || "").toLowerCase();
        const input = userMessage.toLowerCase();

        // 1. Math Tutor mock
        if (text.includes("kru math") || text.includes("ครูคณิต") || text.includes("เลข ม.2")) {
          if (input.includes("สวัสดี") || input.includes("hi") || input.includes("hello")) {
            resolve("สวัสดีครับนักเรียน! ยินดีต้อนรับสู่ห้องเรียนคณิตศาสตร์ ม.2 นะครับ 📐✨ วันนี้มีโจทย์เลขข้อไหนค้างใจ หรืออยากให้ครูช่วยแนะนำจุดไหน ถามเข้ามาได้เลยนะ ครูพร้อมช่วยเหลือทีละขั้นตอนครับ! ✏️🧠");
          } else if (input.includes("ยาก") || input.includes("ทำไม่ได้") || input.includes("โจทย์")) {
            resolve("ใจเย็นๆ นะครับนักเรียน โจทย์เลขไม่ได้น่ากลัวอย่างที่คิดนะ ✏️ ลองเขียนโจทย์มาให้ครูดูหน่อยสิครับ หรือบอกครูทีละขั้นตอนว่าติดตรงไหน เดี๋ยวเรามาถอดสมการไปด้วยกันทีละเปลาะนะ! 📐💪");
          } else {
            resolve("เป็นไอเดียที่ดีเลยครับ! 🧠 แต่ครูอยากให้เราลองเริ่มคิดจากจุดนี้ดูก่อนดีไหม... ลองหาค่าของตัวแปรก่อน แล้วค่อยเอาไปแทนค่าดูนะ ได้เท่าไหร่บอกครูได้เลยนะค๊าบ 🌟");
          }
          return;
        }

        // 2. Software Architect mock
        if (text.includes("architect") || text.includes("software") || text.includes("system design")) {
          if (input.includes("scale") || input.includes("throughput") || input.includes("database") || input.includes("db")) {
            resolve(`From a systems architecture perspective, handling high write loads requires decoupling your ingestion layer. 

I propose the following design pattern:
1. **API Gateway / Load Balancer**: Rate-limits requests and routes traffic.
2. **Message Broker (Kafka/RabbitMQ)**: Ingests traffic asynchronously to prevent DB saturation.
3. **Worker Pool**: Consumes queues and updates a read-optimized SQL/NoSQL replica set.

*Trade-offs:*
- **Pros**: Zero data loss, eventual consistency, isolation of DB bottlenecks.
- **Cons**: Added complexity, potential replication lag.

What database technology are you currently using (SQL vs. NoSQL) to support this workload?`);
          } else {
            resolve("Hello. I've reviewed your request. To design a sustainable system architecture, we must analyze the trade-offs (scalability, availability, partition tolerance). Could you define your read/write ratio and throughput requirements (QPS)?");
          }
          return;
        }

        // 3. History Teacher mock
        if (text.includes("ajarn che") || text.includes("อาจารย์ชี") || text.includes("ประวัติศาสตร์")) {
          resolve("โอ้โฮ! ถามประวัติศาสตร์เรื่องนี้มา อาจารย์บอกเลยว่านี่แหละคือจุดเปลี่ยนครั้งสำคัญของโลก! ⚔️🏰 ลองคิดภาพตามนะ ในปีคริสต์ศักราชนั้นน่ะ... มันมีเบื้องหลังที่ดราม่ากว่าที่เราอ่านในหนังสือเรียนเยอะ! อยากให้เจาะจงที่สงครามหรือกบฏครั้งไหนเป็นพิเศษไหมครับ? มันส์ระทึกแน่นอน!");
          return;
        }

        // 4. Antigravity Architect design mock
        if (text.includes("antigravity") || text.includes("design") || text.includes("ui/ux")) {
          resolve("Greetings. Let's elevate this design interface. 🌌 I highly recommend using a dynamic Glassmorphism panel (backdrop-filter: blur(16px)) combined with subtle border accents (#6366f1) and smooth linear gradients (from slate-950 to zinc-900). Let's craft micro-interactions that breathe life into your layout. What section of your UI would you like to polish first?");
          return;
        }

        // 5. Financial Whisperer mock
        if (text.includes("financial") || text.includes("เงิน") || text.includes("หุ้น")) {
          resolve(`เมื่อพิจารณาโครงสร้างงบการเงินและอัตราส่วนทางการเงิน เช่น P/E Ratio และหนี้สินต่อทุน (D/E Ratio) ทางเราแนะนำให้ทำการจำลอง Sensitivity Analysis เพื่อรองรับความผันผวนของอัตราดอกเบี้ยและอัตราแลกเปลี่ยนครับ 

*คำเตือนบังคับ (Disclaimer): การประเมินนี้เป็นเพียงการวิเคราะห์ข้อมูลอดีตและการคำนวณเบื้องต้น ไม่ใช่คำแนะนำซื้อขายหุ้นหรือผลิตภัณฑ์ทางการเงินใดๆ ผู้ลงทุนควรใช้วิจารณญาณตนเองก่อนตัดสินใจลงทุน*`);
          return;
        }

        // Default mock
        resolve(`*(โหมดจำลอง - ไม่ได้ระบุ API Key)* 

สวัสดีค่ะ/ครับ! ฉันคือผู้ช่วย AI ที่คุณกําลังสร้างขึ้นตามระบบ System Instructions:

"ยินดีที่ได้รู้จัก! ฉันพร้อมสวมบทบาทแล้ว แต่หากต้องการคุยกับฉันด้วยพลังของโมเดล Gemini ตัวจริงและรับคำตอบแบบไลฟ์สด สามารถนำ Gemini API Key มาใส่ในรูปฟันเฟือง ⚙️ (Settings) ด้านขวาบนได้ทันทีค่ะ!"`);
      }, 1000);
    });
  }
};
