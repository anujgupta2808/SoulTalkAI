# 🤖 AI Chat App – Database Design (ChatGPT-Style)

## 📌 Overview

This database structure is designed for a **ChatGPT-like conversational AI website** where users can talk naturally and conversations are stored with full history.

---

# 🗄️ Database: `ai_chat_app`

```sql
CREATE DATABASE ai_chat_app;
USE ai_chat_app;
```

---

# 👤 1. Users Table

Stores all users who interact with the AI.

```sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100),
  email VARCHAR(150),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

# 💬 2. Conversations Table

Each chat session is stored here.

```sql
CREATE TABLE conversations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  title VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

---

# 🧠 3. Messages Table

Stores both user and AI messages (main memory system).

```sql
CREATE TABLE messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  conversation_id INT,
  sender ENUM('user','ai') NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
);
```

---

# ❤️ Optional: Emotion Tracking

Useful if your AI is built for people who feel alone.

```sql
ALTER TABLE messages ADD emotion VARCHAR(50);
```

Example values:

* sad
* happy
* lonely
* neutral

---

# 🔄 Conversation Flow

1. Create or load user
2. Create new conversation
3. Save user message
4. Send messages to OpenAI API
5. Save AI reply
6. Display chat history

---

# 📤 Example Query – Get Chat History

```sql
SELECT sender, message
FROM messages
WHERE conversation_id = 1
ORDER BY created_at ASC;
```

Convert results to:

```json
[
  { "role": "user", "content": "Hello" },
  { "role": "assistant", "content": "Hi! How are you feeling today?" }
]
```

---

# ✅ Benefits of This Structure

* ChatGPT-like memory
* Supports multiple chats
* Easy to scale
* Works with PHP, Node.js, Python
* Good for emotional AI conversations

---

⭐ Tip: Always send full message history to the AI API so it responds naturally.
