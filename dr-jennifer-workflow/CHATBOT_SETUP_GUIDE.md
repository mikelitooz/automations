# Dr. Jennifer's Clinic Chatbot - Setup & Deployment Guide

**Workflow File:** `clinic-chatbot-workflow.json`
**Knowledge Base:** `CLINIC_CHATBOT_KNOWLEDGE_BASE.md`
**Purpose:** AI-powered website chatbot to answer patient questions 24/7

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Prerequisites](#prerequisites)
3. [Setup Instructions](#setup-instructions)
4. [Website Integration](#website-integration)
5. [Testing the Chatbot](#testing-the-chatbot)
6. [Customization Options](#customization-options)
7. [Monitoring & Analytics](#monitoring--analytics)
8. [Troubleshooting](#troubleshooting)
9. [Cost Estimation](#cost-estimation)

---

## System Overview

### What This Chatbot Does

**Primary Functions:**
- ✅ Answers questions about office hours, location, services
- ✅ Provides information about insurance and billing
- ✅ Guides patients on scheduling appointments
- ✅ Explains clinic policies (cancellations, refills, etc.)
- ✅ Directs patients to appropriate resources (phone numbers, portal, booking links)
- ✅ Maintains conversation context (remembers last 10 messages)
- ✅ Provides quick action buttons for common tasks

**Safety Features:**
- ❌ Never provides medical advice or diagnoses
- ❌ Never asks for or stores personal health information
- ✅ Directs emergencies to call 911
- ✅ Suggests calling office for medical questions

### Architecture

```
Website Visitor
     ↓
[Website Chat Widget]
     ↓
HTTP POST → n8n Webhook
     ↓
Parse Message → Validate
     ↓
Load Knowledge Base (12K+ words)
     ↓
RAG (Retrieval-Augmented Generation):
  - Split knowledge base into chunks
  - Create vector embeddings (OpenAI)
  - Store in memory vector database
  - Retrieve top 5 relevant chunks
     ↓
Claude 3.5 Sonnet AI
  - Generates response using context
  - Maintains conversation memory
     ↓
Format Response + Quick Action Buttons
     ↓
Return JSON to website
     ↓
Log conversation to Google Sheets
```

---

## Prerequisites

### Required Accounts & API Keys

**1. Anthropic (Claude AI):**
- Create account: https://console.anthropic.com/
- Generate API key
- Cost: ~$0.003 per conversation (very affordable)

**2. OpenAI (Embeddings):**
- Create account: https://platform.openai.com/
- Generate API key
- Cost: ~$0.0001 per conversation (for embeddings)

**3. Google Sheets:**
- Already configured (using existing Medical_Workflow sheet)
- New tab needed: "Chatbot_Logs"

**4. n8n Instance:**
- Already have: https://izzydev.app.n8n.cloud/

### Required n8n Nodes

This workflow uses **n8n LangChain nodes**. Ensure your n8n instance has:
- ✅ `@n8n/n8n-nodes-langchain` package installed
- ✅ Version 1.8+ of LangChain nodes

**Check Installation:**
1. n8n Dashboard → Settings → Community Nodes
2. Search for "langchain"
3. If not installed, click "Install" and enter: `@n8n/n8n-nodes-langchain`

---

## Setup Instructions

### Part 1: API Keys Configuration

#### Step 1: Add Anthropic API Key

1. **Get API Key:**
   - Go to https://console.anthropic.com/settings/keys
   - Click "Create Key"
   - Copy the key (starts with `sk-ant-...`)

2. **Add to n8n:**
   - n8n Dashboard → Credentials → New Credential
   - Select "Anthropic API"
   - Name: "Anthropic API"
   - Paste API key
   - Save

#### Step 2: Add OpenAI API Key

1. **Get API Key:**
   - Go to https://platform.openai.com/api-keys
   - Click "Create new secret key"
   - Copy the key (starts with `sk-...`)

2. **Add to n8n:**
   - n8n Dashboard → Credentials → New Credential
   - Select "OpenAI API"
   - Name: "OpenAI API"
   - Paste API key
   - Save

---

### Part 2: Google Sheet Setup

#### Create Chatbot Logs Tab

1. **Open Google Sheet:**
   - Go to: https://docs.google.com/spreadsheets/d/1qwRj5vMXyrCiuAohIX-gcOmGK1M9Hc1BMLkK0vBE_3Y

2. **Add New Tab:**
   - Click "+" at bottom
   - Name it: "Chatbot_Logs"

3. **Add Column Headers:**
   ```
   Timestamp | Session_ID | User_Name | User_Message | AI_Response | Message_Length | Response_Length | Quick_Actions_Count
   ```

4. **Note the GID:**
   - Click on "Chatbot_Logs" tab
   - Look at URL: `...gid=XXXXXXX`
   - Note the GID number (e.g., `gid=2`)
   - Update workflow if needed (default is `gid=2`)

---

### Part 3: Import Workflow to n8n

#### Step 1: Import JSON File

1. **Import Workflow:**
   - n8n Dashboard → Workflows → Import from File
   - Select: `clinic-chatbot-workflow.json`
   - Click "Import"

2. **Workflow Opens Automatically**

#### Step 2: Reconnect Credentials

**Claude 3.5 Sonnet Node:**
1. Click on "Claude 3.5 Sonnet" node
2. Credentials dropdown → Select "Anthropic API"
3. Save node

**OpenAI Embeddings Node:**
1. Click on "OpenAI Embeddings" node
2. Credentials dropdown → Select "OpenAI API"
3. Save node

**Google Sheets Node:**
1. Click on "Log to Google Sheet" node
2. Credentials dropdown → Select "Google Sheets account" (already configured)
3. Save node

#### Step 3: Update Knowledge Base Path

**Read Knowledge Base Node:**
1. Click on "Read Knowledge Base" node
2. Update `filePath` to match your system:
   - **Windows:** `c:\Users\DELL\Desktop\projects\automation\dr-jennifer-workflow\CLINIC_CHATBOT_KNOWLEDGE_BASE.md`
   - **Mac/Linux:** `/path/to/dr-jennifer-workflow/CLINIC_CHATBOT_KNOWLEDGE_BASE.md`
   - **n8n Cloud:** Upload knowledge base file to n8n and use relative path
3. Save node

#### Step 4: Activate Workflow

1. **Click "Active" toggle** in top-right corner
2. Workflow is now live!
3. **Copy Webhook URL:**
   - Click on "Webhook: Chat Message" node
   - Copy the production webhook URL
   - Example: `https://izzydev.app.n8n.cloud/webhook/clinic-chatbot`

---

## Website Integration

### Option 1: Simple HTML/JavaScript Widget

Add this code to your clinic website (before closing `</body>` tag):

```html
<!-- Dr. Jennifer's Chatbot Widget -->
<div id="clinic-chatbot-widget">
  <button id="chatbot-toggle" onclick="toggleChat()">💬 Chat with us</button>

  <div id="chatbot-container" style="display:none;">
    <div id="chatbot-header">
      <h3>Dr. Jennifer's Assistant</h3>
      <button onclick="toggleChat()">✕</button>
    </div>

    <div id="chatbot-messages"></div>

    <div id="chatbot-input-container">
      <input
        type="text"
        id="chatbot-input"
        placeholder="Ask me anything about the clinic..."
        onkeypress="if(event.key==='Enter') sendMessage()"
      />
      <button onclick="sendMessage()">Send</button>
    </div>
  </div>
</div>

<script>
// Configuration
const CHATBOT_WEBHOOK_URL = 'https://izzydev.app.n8n.cloud/webhook/clinic-chatbot';
let sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
let conversationHistory = [];

// Toggle chat widget
function toggleChat() {
  const container = document.getElementById('chatbot-container');
  const isVisible = container.style.display !== 'none';
  container.style.display = isVisible ? 'none' : 'flex';

  if (!isVisible && conversationHistory.length === 0) {
    // Initial greeting
    addMessage('bot', 'Hello! I'm Dr. Jennifer's virtual assistant. How can I help you today?');
  }
}

// Send message to chatbot
async function sendMessage() {
  const input = document.getElementById('chatbot-input');
  const message = input.value.trim();

  if (!message) return;

  // Add user message to UI
  addMessage('user', message);
  input.value = '';

  // Show typing indicator
  showTypingIndicator();

  try {
    // Send to n8n webhook
    const response = await fetch(CHATBOT_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: message,
        sessionId: sessionId,
        userName: getUserName() // Optional: Get from form or cookie
      })
    });

    const data = await response.json();

    // Remove typing indicator
    removeTypingIndicator();

    if (data.success) {
      // Add bot response
      addMessage('bot', data.response);

      // Add quick action buttons
      if (data.quickActions && data.quickActions.length > 0) {
        addQuickActions(data.quickActions);
      }
    } else {
      addMessage('bot', 'Sorry, I encountered an error. Please call our office at (555) 123-4567.');
    }

  } catch (error) {
    console.error('Chatbot error:', error);
    removeTypingIndicator();
    addMessage('bot', 'Sorry, I'm having trouble connecting. Please try again or call (555) 123-4567.');
  }
}

// Add message to chat UI
function addMessage(sender, text) {
  const messagesDiv = document.getElementById('chatbot-messages');
  const messageDiv = document.createElement('div');
  messageDiv.className = `chatbot-message chatbot-message-${sender}`;
  messageDiv.textContent = text;
  messagesDiv.appendChild(messageDiv);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;

  conversationHistory.push({ sender, text, timestamp: new Date() });
}

// Add quick action buttons
function addQuickActions(actions) {
  const messagesDiv = document.getElementById('chatbot-messages');
  const actionsDiv = document.createElement('div');
  actionsDiv.className = 'chatbot-quick-actions';

  actions.forEach(action => {
    const button = document.createElement('button');
    button.className = 'chatbot-quick-action-btn';
    button.textContent = action.label;

    if (action.type === 'link') {
      button.onclick = () => window.open(action.url, '_blank');
    } else if (action.type === 'phone') {
      button.onclick = () => window.location.href = action.action;
    }

    actionsDiv.appendChild(button);
  });

  messagesDiv.appendChild(actionsDiv);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// Show typing indicator
function showTypingIndicator() {
  const messagesDiv = document.getElementById('chatbot-messages');
  const typingDiv = document.createElement('div');
  typingDiv.id = 'chatbot-typing';
  typingDiv.className = 'chatbot-message chatbot-message-bot';
  typingDiv.innerHTML = '<span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span>';
  messagesDiv.appendChild(typingDiv);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// Remove typing indicator
function removeTypingIndicator() {
  const typing = document.getElementById('chatbot-typing');
  if (typing) typing.remove();
}

// Get user name (optional - customize based on your website)
function getUserName() {
  // Try to get from cookie, session storage, or form
  return localStorage.getItem('patientName') || 'there';
}
</script>

<style>
/* Chatbot Styles */
#clinic-chatbot-widget {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 9999;
  font-family: Arial, sans-serif;
}

#chatbot-toggle {
  background: #0066cc;
  color: white;
  border: none;
  padding: 15px 25px;
  border-radius: 50px;
  font-size: 16px;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  transition: all 0.3s ease;
}

#chatbot-toggle:hover {
  background: #0052a3;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0,0,0,0.2);
}

#chatbot-container {
  position: fixed;
  bottom: 80px;
  right: 20px;
  width: 380px;
  height: 550px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.15);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

#chatbot-header {
  background: #0066cc;
  color: white;
  padding: 15px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

#chatbot-header h3 {
  margin: 0;
  font-size: 18px;
}

#chatbot-header button {
  background: none;
  border: none;
  color: white;
  font-size: 24px;
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
}

#chatbot-messages {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  background: #f5f5f5;
}

.chatbot-message {
  margin-bottom: 15px;
  padding: 10px 15px;
  border-radius: 12px;
  max-width: 80%;
  word-wrap: break-word;
  line-height: 1.4;
}

.chatbot-message-user {
  background: #0066cc;
  color: white;
  margin-left: auto;
  text-align: right;
}

.chatbot-message-bot {
  background: white;
  color: #333;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.chatbot-quick-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 15px;
}

.chatbot-quick-action-btn {
  background: white;
  border: 2px solid #0066cc;
  color: #0066cc;
  padding: 10px 15px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;
  text-align: left;
}

.chatbot-quick-action-btn:hover {
  background: #0066cc;
  color: white;
}

#chatbot-input-container {
  display: flex;
  padding: 15px;
  background: white;
  border-top: 1px solid #e0e0e0;
}

#chatbot-input {
  flex: 1;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
}

#chatbot-input:focus {
  border-color: #0066cc;
}

#chatbot-input-container button {
  margin-left: 10px;
  background: #0066cc;
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.2s ease;
}

#chatbot-input-container button:hover {
  background: #0052a3;
}

.typing-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #999;
  margin: 0 2px;
  animation: typing 1.4s infinite;
}

.typing-dot:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-dot:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing {
  0%, 60%, 100% {
    opacity: 0.3;
    transform: translateY(0);
  }
  30% {
    opacity: 1;
    transform: translateY(-10px);
  }
}

/* Mobile responsive */
@media (max-width: 768px) {
  #chatbot-container {
    bottom: 0;
    right: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border-radius: 0;
  }
}
</style>
```

---

### Option 2: Integration with Popular Chat Widgets

#### **Tidio Chat:**
1. Go to Tidio Dashboard → Integrations → Webhooks
2. Add webhook URL: `https://izzydev.app.n8n.cloud/webhook/clinic-chatbot`
3. Map fields:
   - `message` → User message
   - `sessionId` → Conversation ID

#### **Intercom:**
1. Go to Intercom → Settings → API & Webhooks
2. Create webhook for `conversation.user.replied`
3. Webhook URL: `https://izzydev.app.n8n.cloud/webhook/clinic-chatbot`

#### **Drift:**
1. Drift Dashboard → Settings → API
2. Create webhook subscription
3. Event: `message.received`
4. URL: `https://izzydev.app.n8n.cloud/webhook/clinic-chatbot`

---

## Testing the Chatbot

### Manual Testing with cURL

```bash
# Test greeting
curl -X POST https://izzydev.app.n8n.cloud/webhook/clinic-chatbot \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Hello",
    "sessionId": "test_session_123",
    "userName": "John"
  }'

# Test office hours question
curl -X POST https://izzydev.app.n8n.cloud/webhook/clinic-chatbot \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What are your office hours?",
    "sessionId": "test_session_123",
    "userName": "John"
  }'

# Test appointment booking question
curl -X POST https://izzydev.app.n8n.cloud/webhook/clinic-chatbot \
  -H "Content-Type: application/json" \
  -d '{
    "message": "How do I schedule an appointment?",
    "sessionId": "test_session_123",
    "userName": "John"
  }'
```

### Expected Response Format

```json
{
  "success": true,
  "response": "We're open Monday-Friday 8 AM - 6 PM, with extended hours on Wednesday until 8 PM. We also offer Saturday urgent care from 9 AM - 1 PM. Would you like to book an appointment?",
  "quickActions": [
    {
      "label": "📅 Book Appointment",
      "url": "https://cal.com/izzydevbuilds/appointment-with-dr.-jennifer",
      "type": "link"
    },
    {
      "label": "📞 Call Office",
      "action": "tel:5551234567",
      "type": "phone"
    }
  ],
  "sessionId": "test_session_123",
  "timestamp": "2025-10-31T12:34:56.789Z"
}
```

### Test Scenarios

**Test these common questions:**

1. **Office Hours:**
   - "What are your hours?"
   - "Are you open on weekends?"
   - "What time do you close?"

2. **Appointments:**
   - "How do I book an appointment?"
   - "Can I cancel my appointment?"
   - "Do you have same-day appointments?"

3. **Insurance:**
   - "Do you accept Blue Cross?"
   - "How much is a visit without insurance?"
   - "What insurance do you take?"

4. **Prescriptions:**
   - "How do I get a refill?"
   - "Can I request prescriptions online?"

5. **Location:**
   - "Where are you located?"
   - "Is there parking?"

6. **Services:**
   - "Do you do COVID testing?"
   - "Can you remove moles?"
   - "Do you see children?"

7. **Emergency (Should escalate):**
   - "I'm having chest pain"
   - "Is this an emergency?"

---

## Customization Options

### Adjust AI Personality

**Edit "RAG QA Chain" node** → Prompt text:

**More Formal:**
```
You are a professional medical office representative for Dr. Jennifer's clinic.
Maintain a formal, respectful tone at all times.
```

**More Casual/Friendly:**
```
You are a friendly, helpful assistant for Dr. Jennifer's clinic.
Use a warm, conversational tone while staying professional.
```

**Add Humor:**
```
You are a warm, friendly assistant with a light sense of humor.
You can use gentle humor when appropriate, but stay professional.
```

### Adjust Response Length

**"Claude 3.5 Sonnet" node** → Options:
- `maxTokens`: 1000 (default) = ~750 words
- Increase to 1500 for longer answers
- Decrease to 500 for very concise answers

### Adjust Context Window (Conversation Memory)

**"Chat Memory (10 messages)" node:**
- `contextWindowLength`: 10 (remembers last 10 messages)
- Increase to 20 for longer memory
- Decrease to 5 for shorter memory (saves costs)

### Add More Quick Actions

**Edit "Format Response with Quick Actions" node:**

Add custom quick action logic:
```javascript
// Add custom quick action
if (messageLower.includes("covid") || messageLower.includes("vaccine")) {
  quickActions.push({
    label: "💉 COVID Info",
    url: "https://www.drjenniferclinic.com/covid",
    type: "link"
  });
}
```

---

## Monitoring & Analytics

### Google Sheets Analytics

**Chatbot_Logs Tab** tracks:
- Timestamp of each conversation
- Session ID (unique per user)
- User name
- User message
- AI response
- Message/response lengths
- Number of quick actions shown

**Useful Metrics to Calculate:**
```
=COUNTIF(Session_ID:Session_ID, Session_ID2) // Conversations per session
=AVERAGE(Response_Length:Response_Length) // Average response length
=COUNTIF(User_Message:User_Message, "*appointment*") // Questions about appointments
```

### n8n Execution Logs

**View Chatbot Usage:**
1. n8n Dashboard → Executions
2. Filter by "Clinic Website Chatbot"
3. Review:
   - Total executions (= total messages)
   - Success rate
   - Error rate
   - Average execution time

### Common Analytics Questions

**Most Asked Questions:**
1. Export `User_Message` column from Chatbot_Logs
2. Use text analysis tool or ChatGPT to categorize
3. Identify top 10 most common questions

**Peak Usage Times:**
1. Use `Timestamp` column
2. Create pivot table by hour/day
3. Identify when to staff live chat support

---

## Troubleshooting

### Issue 1: Chatbot Not Responding

**Symptoms:**
- Website shows "Sorry, I'm having trouble connecting"
- No response from chatbot

**Debug Steps:**
```bash
# Test webhook directly
curl -X POST https://izzydev.app.n8n.cloud/webhook/clinic-chatbot \
  -H "Content-Type: application/json" \
  -d '{"message":"test","sessionId":"test123"}'

# Check:
1. Is workflow active? (Check n8n dashboard)
2. Is webhook URL correct?
3. Are API keys configured?
4. Check n8n execution logs for errors
```

**Common Causes:**
- ❌ Workflow is inactive (toggle "Active" in n8n)
- ❌ API keys expired or invalid
- ❌ Knowledge base file path incorrect
- ❌ Network/firewall blocking webhook

---

### Issue 2: Poor Quality Responses

**Symptoms:**
- AI gives irrelevant answers
- Responses don't match knowledge base

**Solutions:**

**1. Increase Context Retrieval:**
```javascript
// In "Vector Retriever (Top 5)" node
topK: 5  // Increase to 8 or 10 for more context
```

**2. Improve Prompt:**
Edit "RAG QA Chain" node prompt to be more specific:
```
IMPORTANT: Base your answer ONLY on the provided knowledge base context.
If the answer is not in the context, say "I don't have that information,
but you can call our office at (555) 123-4567 for assistance."
```

**3. Update Knowledge Base:**
- Add missing information to `CLINIC_CHATBOT_KNOWLEDGE_BASE.md`
- Save file
- n8n will read updated file on next execution (no need to reimport workflow)

---

### Issue 3: Slow Response Time

**Symptoms:**
- Takes 5-10+ seconds to respond
- Typing indicator shows for too long

**Solutions:**

**1. Reduce Chunk Size:**
```javascript
// "Split into Chunks" node
chunkSize: 2000  // Reduce to 1000
chunkOverlap: 200  // Reduce to 100
```

**2. Use Smaller Embedding Model:**
```javascript
// "OpenAI Embeddings" node
model: "text-embedding-3-small"  // Already using smallest
// Consider caching embeddings (see advanced setup)
```

**3. Reduce Context Window:**
```javascript
// "Chat Memory" node
contextWindowLength: 10  // Reduce to 5
```

---

### Issue 4: High API Costs

**Symptoms:**
- Anthropic/OpenAI bills higher than expected

**Cost Reduction Strategies:**

**1. Use Smaller Model:**
```javascript
// "Claude 3.5 Sonnet" node
model: "claude-3-5-haiku-20241022"  // 5x cheaper than Sonnet
// Trade-off: Slightly lower quality responses
```

**2. Reduce Max Tokens:**
```javascript
// "Claude 3.5 Sonnet" node options
maxTokens: 1000  // Reduce to 500
```

**3. Cache Knowledge Base Embeddings:**
- Instead of creating embeddings every time, create once and store
- Advanced: Use Pinecone or Weaviate for persistent vector storage

---

## Cost Estimation

### Monthly Cost Breakdown

**Assumptions:**
- 1,000 conversations per month
- Average 3 messages per conversation = 3,000 total messages
- Average response length: 200 tokens

**API Costs:**

**Anthropic (Claude 3.5 Sonnet):**
- Input: 3,000 messages × 500 tokens avg × $0.003 per 1K tokens = $4.50
- Output: 3,000 responses × 200 tokens avg × $0.015 per 1K tokens = $9.00
- **Total Claude cost:** $13.50/month

**OpenAI (Embeddings):**
- 3,000 messages × 100 tokens avg × $0.0001 per 1K tokens = $0.03
- **Total OpenAI cost:** $0.03/month

**Google Sheets:**
- Free (within Google Workspace limits)

**n8n:**
- Already have cloud instance: $0 additional cost

**Total Monthly Cost:** ~$13.53 for 1,000 conversations
**Cost per conversation:** ~$0.01

### Cost Optimization

**Use Haiku Model:**
- Claude 3.5 Haiku: ~$2.70/month (vs $13.50)
- **Savings: 80%**
- Trade-off: Slightly lower quality (but still very good)

**Limit to Business Hours:**
- Only activate chatbot 8 AM - 6 PM Monday-Friday
- Reduces usage by ~70%
- Show "Call us" message outside hours

**Add Rate Limiting:**
- Limit to 5 messages per session
- Prevents abuse/spam
- Reduces costs from bots

---

## Advanced Features (Optional)

### 1. Lead Capture

Add to chatbot prompt:
```
If the user wants to book an appointment or request information,
politely ask for their email address so we can follow up.
```

Store in Google Sheets:
```javascript
// New columns: User_Email, Lead_Status, Follow_Up_Date
```

### 2. Multilingual Support

Add language detection:
```javascript
// Detect language in "Parse Chat Message" node
const language = detectLanguage(userMessage);

// Pass to Claude prompt:
"If the user writes in Spanish, respond in Spanish."
```

### 3. Handoff to Live Agent

Add trigger:
```javascript
// If user asks for live chat
if (messageLower.includes("speak to someone") ||
    messageLower.includes("live agent")) {
  // Trigger notification to staff
  // Show: "I'll connect you with a team member shortly"
}
```

### 4. Appointment Booking Integration

Instead of just providing link, actually create appointment:
```javascript
// Call Cal.com API to create booking
// Confirm with user
// Send confirmation email
```

---

## Security & Privacy

### Data Protection

**What We Store:**
- ✅ User messages (for analytics)
- ✅ AI responses (for quality monitoring)
- ✅ Session IDs (anonymous)
- ❌ NO personal health information
- ❌ NO identifiable patient data

**HIPAA Compliance:**
- ⚠️ This chatbot is for general information only
- ⚠️ Not suitable for discussing specific medical conditions
- ⚠️ Does not store PHI (Protected Health Information)
- ✅ Safe for public-facing website

**If you need HIPAA-compliant chat:**
- Use encrypted chat platform (e.g., SimplePractice, Spruce Health)
- Add BAA with Anthropic
- Store logs in HIPAA-compliant database
- Add patient authentication

### Rate Limiting

Add to prevent abuse:
```javascript
// Track requests per IP
// Limit to 20 messages per hour per IP
// Block if exceeded
```

---

## Next Steps

1. ✅ Import workflow to n8n
2. ✅ Configure API keys (Anthropic, OpenAI)
3. ✅ Create Chatbot_Logs tab in Google Sheets
4. ✅ Update knowledge base file path
5. ✅ Test with cURL commands
6. ✅ Add chat widget to website
7. ✅ Test on live website
8. ✅ Monitor analytics for 1 week
9. ✅ Optimize based on common questions
10. ✅ Promote chatbot to patients

---

**Support Resources:**

- **n8n LangChain Docs:** https://docs.n8n.io/integrations/builtin/cluster-nodes/root-nodes/n8n-nodes-langchain/
- **Anthropic API Docs:** https://docs.anthropic.com/
- **OpenAI Embeddings Docs:** https://platform.openai.com/docs/guides/embeddings

---

**Last Updated:** 2025-10-31
**Workflow Version:** 1.0
**Status:** Production Ready ✅
