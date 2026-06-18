import { marketplaceTemplates } from '../data/templates';

const KEYS = {
  GEMS: 'gemforge_gems',
  USER: 'gemforge_user',
  REVIEWS: 'gemforge_reviews',
  PRE_SEEDED: 'gemforge_seeded'
};

const isClient = () => typeof window !== 'undefined';

// Safe JSON parser to protect against corrupted localStorage
const safeJsonParse = (str, fallback) => {
  if (!str) return fallback;
  try {
    const parsed = JSON.parse(str);
    return parsed !== null && parsed !== undefined ? parsed : fallback;
  } catch (e) {
    console.error("Failed to parse JSON:", str, e);
    return fallback;
  }
};

// Mock reviews to seed initially
const initialReviews = {
  "template_kru_math_m2": [
    { id: "rev1", author: "ครูสมชาย", stars: 5, text: "น้องๆ ม.2 เข้ามาใช้ตัวนี้เยอะมาก อธิบายเลขละเอียดดีครับ ไม่บอกเฉลยทันที เด็กๆ ได้ฝึกคิดเอง", date: "2026-06-15" },
    { id: "rev2", author: "Mina_M2", stars: 5, text: "ชอบตรงมีอีโมจิน่ารักและคุณครูใจดีมากค่ะ ทำการบ้านวิชาเลขเข้าใจขึ้นเยอะเลย!", date: "2026-06-17" }
  ],
  "template_master_architect": [
    { id: "rev3", author: "CloudGuru", stars: 5, text: "Very solid ADR generation structure. Pros and cons trade-offs are well analyzed.", date: "2026-06-12" },
    { id: "rev4", author: "DevOps_Steve", stars: 4, text: "Excellent for microservices planning. The CAP theorem considerations are highly professional.", date: "2026-06-14" }
  ],
  "template_antigravity_architect": [
    { id: "rev5", author: "FramerGeek", stars: 5, text: "The HSL palette selections and glassmorphism recommendations are top-notch! Helped design my web dashboard.", date: "2026-06-16" }
  ]
};

export const db = {
  init: () => {
    if (!isClient()) return;
    
    const isSeeded = localStorage.getItem(KEYS.PRE_SEEDED);
    const storedGemsStr = localStorage.getItem(KEYS.GEMS);
    const storedGems = safeJsonParse(storedGemsStr, []);
    
    // Auto-update seed if database is empty or template list grew
    if (!isSeeded || storedGems.length < marketplaceTemplates.length) {
      const currentGems = [...storedGems];
      
      marketplaceTemplates.forEach(template => {
        const exists = currentGems.some(g => g.gem_id === template.gem_id);
        if (!exists) {
          currentGems.push({
            ...template,
            upvotes: template.upvotes || Math.floor(Math.random() * 80) + 20
          });
        }
      });
      
      localStorage.setItem(KEYS.GEMS, JSON.stringify(currentGems));
      
      // Update reviews
      const storedReviewsStr = localStorage.getItem(KEYS.REVIEWS);
      const storedReviews = safeJsonParse(storedReviewsStr, {});
      Object.keys(initialReviews).forEach(key => {
        if (!storedReviews[key]) {
          storedReviews[key] = initialReviews[key];
        }
      });
      localStorage.setItem(KEYS.REVIEWS, JSON.stringify(storedReviews));
      
      // Seed user if not present
      const userStr = localStorage.getItem(KEYS.USER);
      if (!userStr) {
        localStorage.setItem(KEYS.USER, JSON.stringify({
          user_id: 'forge_user_01',
          username: 'ArchitettoAI',
          email: 'developer@gemforge.io',
          created_at: new Date().toISOString()
        }));
      }
      
      localStorage.setItem(KEYS.PRE_SEEDED, 'true');
    }
  },

  getUser: () => {
    if (!isClient()) return null;
    const userStr = localStorage.getItem(KEYS.USER);
    return safeJsonParse(userStr, null);
  },

  updateUser: (username, email) => {
    const updated = {
      user_id: 'forge_user_01',
      username,
      email,
      created_at: new Date().toISOString()
    };
    if (isClient()) {
      localStorage.setItem(KEYS.USER, JSON.stringify(updated));
    }
    return updated;
  },

  getGems: () => {
    if (!isClient()) return [];
    const gemsStr = localStorage.getItem(KEYS.GEMS);
    return safeJsonParse(gemsStr, []);
  },

  saveGem: (gem) => {
    if (!isClient()) return gem;
    const currentGems = db.getGems();
    
    const index = currentGems.findIndex(g => g.gem_id === gem.gem_id);
    if (index >= 0) {
      // Retain upvotes if existing
      const existing = currentGems[index];
      currentGems[index] = { 
        ...gem, 
        upvotes: existing.upvotes || 0,
        copy_count: existing.copy_count || gem.copy_count || 0
      };
    } else {
      currentGems.push({
        ...gem,
        upvotes: 0,
        copy_count: 0
      });
    }
    
    localStorage.setItem(KEYS.GEMS, JSON.stringify(currentGems));
    return gem;
  },

  deleteGem: (gem_id) => {
    if (!isClient()) return;
    const currentGems = db.getGems();
    const updated = currentGems.filter(g => g.gem_id !== gem_id);
    localStorage.setItem(KEYS.GEMS, JSON.stringify(updated));
  },

  incrementCopyCount: (gem_id) => {
    if (!isClient()) return;
    const currentGems = db.getGems();
    const index = currentGems.findIndex(g => g.gem_id === gem_id);
    if (index >= 0) {
      currentGems[index].copy_count = (currentGems[index].copy_count || 0) + 1;
      localStorage.setItem(KEYS.GEMS, JSON.stringify(currentGems));
    }
  },

  upvoteGem: (gem_id) => {
    if (!isClient()) return 0;
    const currentGems = db.getGems();
    const index = currentGems.findIndex(g => g.gem_id === gem_id);
    let newCount = 1;
    if (index >= 0) {
      newCount = (currentGems[index].upvotes || 0) + 1;
      currentGems[index].upvotes = newCount;
      localStorage.setItem(KEYS.GEMS, JSON.stringify(currentGems));
    }
    return newCount;
  },

  // Reviews operations
  getReviews: (gem_id) => {
    if (!isClient()) return [];
    const revStr = localStorage.getItem(KEYS.REVIEWS);
    const allReviews = safeJsonParse(revStr, {});
    return allReviews[gem_id] || [];
  },

  addReview: (gem_id, review) => {
    if (!isClient()) return;
    const revStr = localStorage.getItem(KEYS.REVIEWS);
    const allReviews = safeJsonParse(revStr, {});
    
    if (!allReviews[gem_id]) {
      allReviews[gem_id] = [];
    }
    
    const newReview = {
      id: `rev_${Date.now()}`,
      author: review.author || "Anonymous",
      stars: review.stars || 5,
      text: review.text || "",
      date: new Date().toISOString().split('T')[0]
    };
    
    allReviews[gem_id].push(newReview);
    localStorage.setItem(KEYS.REVIEWS, JSON.stringify(allReviews));
    return newReview;
  },

  getSqlSchema: () => {
    return `
-- 1. Create Users Table
CREATE TABLE users (
  user_id VARCHAR(255) PRIMARY KEY,
  username VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Create Gems Table
CREATE TABLE gems (
  gem_id VARCHAR(255) PRIMARY KEY,
  creator_id VARCHAR(255) REFERENCES users(user_id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  system_instructions TEXT NOT NULL,
  category VARCHAR(100) NOT NULL,
  is_public BOOLEAN DEFAULT TRUE,
  copy_count INTEGER DEFAULT 0,
  upvotes INTEGER DEFAULT 0,
  experience VARCHAR(50),
  tone TEXT,
  goals TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Create Knowledge References Table
CREATE TABLE knowledge_references (
  ref_id VARCHAR(255) PRIMARY KEY,
  gem_id VARCHAR(255) REFERENCES gems(gem_id) ON DELETE CASCADE,
  url_link TEXT NOT NULL,
  title VARCHAR(255) NOT NULL
);

-- 4. Create Reviews/Comments Table
CREATE TABLE reviews (
  review_id VARCHAR(255) PRIMARY KEY,
  gem_id VARCHAR(255) REFERENCES gems(gem_id) ON DELETE CASCADE,
  author_name VARCHAR(255) NOT NULL,
  stars INTEGER CHECK (stars >= 1 AND stars <= 5),
  comment_text TEXT,
  created_at DATE DEFAULT CURRENT_DATE
);
    `.trim();
  },

  getFirebaseSchema: () => {
    return JSON.stringify({
      users: {
        "user_id_01": {
          username: "ArchitettoAI",
          email: "developer@gemforge.io",
          created_at: "2026-06-18T00:00:00Z"
        }
      },
      gems: {
        "gem_id_01": {
          creator_id: "user_id_01",
          name: "Kru Math M2",
          description: "Friendly Math Tutor",
          system_instructions: "...",
          category: "education",
          is_public: true,
          copy_count: 1240,
          upvotes: 85,
          experience: "Master",
          tone: "อบอุ่น...",
          goals: "..."
        }
      },
      reviews: {
        "gem_id_01": {
          "review_id_01": {
            author: "ครูสมชาย",
            stars: 5,
            text: "น้องๆ ม.2 เข้ามาใช้เยอะมาก...",
            date: "2026-06-15"
          }
        }
      }
    }, null, 2);
  }
};
