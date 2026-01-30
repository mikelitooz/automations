# Voice Call Escalation - Vapi vs ElevenLabs Comparison

**Date**: 2025-10-31

---

## Overview

Two versions of the voice call escalation workflow are available:

1. **voice-call-escalation-workflow.json** - Uses **Vapi.ai**
2. **voice-call-escalation-workflow_Elevenlabs.json** - Uses **ElevenLabs Conversational AI**

Both workflows have identical functionality but use different voice AI platforms.

---

## Key Differences

### 1. API Endpoints

| Aspect | Vapi.ai | ElevenLabs |
|--------|---------|------------|
| **Call Initiation URL** | `https://api.vapi.ai/call` | `https://api.elevenlabs.io/v1/convai/conversation/outbound` |
| **Authentication Header** | `Authorization: Bearer <API_KEY>` | `xi-api-key: <API_KEY>` |
| **Webhook Path** | `/webhook/vapi-call-complete` | `/webhook/elevenlabs-call-complete` |

---

### 2. Environment Variables Required

#### Vapi.ai Version
```bash
VAPI_API_KEY=vapi_xxxxxxxxxxxxxxxxxxxxxxxx
VAPI_PHONE_NUMBER_ID=phoneNumber_xxxxxxxxxxxxxxx
```

#### ElevenLabs Version
```bash
ELEVENLABS_API_KEY=sk_xxxxxxxxxxxxxxxxxxxxxxxx
ELEVENLABS_AGENT_ID=agent_xxxxxxxxxxxxxxxxxxxxxxxx
```

**Note:** ElevenLabs requires you to create a Conversational AI agent first in their dashboard, then use the `agent_id`.

---

### 3. Request Body Format

#### Vapi.ai
```json
{
  "phoneNumberId": "phoneNumber_xxxxx",
  "customer": {
    "number": "+15551234567"
  },
  "assistant": {
    "firstMessage": "Hi John...",
    "model": {
      "provider": "anthropic",
      "model": "claude-3-5-sonnet-20241022",
      "systemPrompt": "You are...",
      "temperature": 0.7
    },
    "voice": {
      "provider": "11labs",
      "voiceId": "rachel"
    },
    "endCallPhrases": ["confirmed", "see you then"]
  }
}
```

#### ElevenLabs
```json
{
  "agent_id": "agent_xxxxx",
  "phone_number": "+15551234567",
  "first_message": "Hi John...",
  "system_prompt": "You are...",
  "metadata": {
    "appointment_uid": "TEST-001",
    "patient_name": "John Smith",
    "appointment_date": "2025-11-01",
    "appointment_time": "2:30 PM"
  }
}
```

**Key Differences:**
- Vapi uses `assistant` object with nested configuration
- ElevenLabs uses flat structure with `agent_id` reference
- ElevenLabs allows custom `metadata` to be passed through the call lifecycle

---

### 4. Webhook Response Format

#### Vapi.ai Response
```json
{
  "call": {
    "id": "call_abc123",
    "status": "ended",
    "phoneNumber": "+15551234567",
    "endedReason": "customer-ended-call"
  },
  "transcript": "Agent: Hi John... Patient: Yes, I'll be there...",
  "summary": "Patient confirmed attendance",
  "recordingUrl": "https://vapi.ai/recording/abc123",
  "analysis": {
    "successEvaluation": "CONFIRMED"
  }
}
```

#### ElevenLabs Response
```json
{
  "conversation_id": "conv_abc123",
  "status": "ended",
  "phone_number": "+15551234567",
  "end_reason": "user_ended",
  "transcript": [
    {"role": "agent", "message": "Hi John..."},
    {"role": "user", "message": "Yes, I'll be there"}
  ],
  "analysis": {
    "summary": "Patient confirmed attendance",
    "sentiment": "positive"
  },
  "recording_url": "https://elevenlabs.io/recording/abc123"
}
```

**Key Differences:**
- Vapi returns string transcript; ElevenLabs returns array of message objects
- ElevenLabs includes sentiment analysis
- Different field naming conventions (`phoneNumber` vs `phone_number`, `endedReason` vs `end_reason`)

---

### 5. Voice Configuration

#### Vapi.ai
- Supports multiple voice providers (11labs, PlayHT, Azure, etc.)
- Voice selected per call via API
- Can specify different voices for different calls dynamically

#### ElevenLabs
- Voice is configured at the **agent level** in the ElevenLabs dashboard
- Uses ElevenLabs' own voice synthesis (very high quality)
- Voice cannot be changed per call (must use the agent's configured voice)

---

### 6. Pricing Comparison

#### Vapi.ai
- **Cost**: $0.40-0.50 per minute
- **Billing**: Per-minute usage
- **Model costs**: Included in per-minute rate
- **Monthly minimum**: None
- **Estimated cost (20 calls/day, 2 min avg)**: $480-600/month

#### ElevenLabs
- **Cost**: $0.30-0.40 per minute (estimated)
- **Billing**: Per-minute usage
- **Model costs**: Separate (if using GPT-4, Claude, etc.)
- **Monthly minimum**: Varies by plan
- **Estimated cost (20 calls/day, 2 min avg)**: $360-480/month

**Winner**: ElevenLabs is slightly cheaper, but consider model costs separately.

---

### 7. Setup Complexity

#### Vapi.ai
1. Create account
2. Purchase phone number
3. Get API key
4. Configure webhook
5. **Total setup time**: 15-20 minutes

#### ElevenLabs
1. Create account
2. Create Conversational AI agent in dashboard
3. Configure agent's voice, personality, and knowledge base
4. Get API key and agent ID
5. Set up phone provider integration (Twilio, etc.)
6. Configure webhook
7. **Total setup time**: 30-45 minutes

**Winner**: Vapi.ai has simpler setup (built-in phone numbers).

---

### 8. Voice Quality

#### Vapi.ai
- Uses 11labs voices (excellent quality)
- Supports multiple providers for fallback
- Latency: ~200-300ms typical

#### ElevenLabs
- Native ElevenLabs voices (industry-leading quality)
- Very natural, human-like conversations
- Latency: ~150-250ms (slightly faster)

**Winner**: ElevenLabs has slightly better voice quality and lower latency.

---

### 9. Feature Comparison

| Feature | Vapi.ai | ElevenLabs |
|---------|---------|------------|
| Outbound calls | ✅ | ✅ |
| Inbound calls | ✅ | ✅ |
| Built-in phone numbers | ✅ | ❌ (requires Twilio) |
| Voice cloning | ❌ | ✅ |
| Multiple AI models | ✅ (OpenAI, Anthropic, etc.) | ✅ (OpenAI, Anthropic, etc.) |
| Custom knowledge base | ✅ | ✅ |
| HIPAA compliance | ✅ (BAA available) | ⚠️ (Contact for BAA) |
| Real-time streaming | ✅ | ✅ |
| Function calling | ✅ | ✅ |
| Analytics dashboard | ✅ | ✅ |
| Sentiment analysis | ❌ | ✅ |

---

### 10. Which One to Choose?

#### Choose **Vapi.ai** if:
- ✅ You want fastest setup (built-in phone numbers)
- ✅ You need HIPAA compliance with confirmed BAA
- ✅ You prefer simple API structure
- ✅ You want to dynamically select voices per call

#### Choose **ElevenLabs** if:
- ✅ You want the highest voice quality
- ✅ You need voice cloning capabilities
- ✅ You want sentiment analysis
- ✅ You already have Twilio phone numbers set up
- ✅ You want slightly lower costs

---

## Migration Between Versions

### From Vapi to ElevenLabs

1. **Create ElevenLabs Agent:**
   - Go to https://elevenlabs.io/conversational-ai
   - Create new agent
   - Configure voice and personality
   - Copy `agent_id`

2. **Update Environment Variables:**
   ```bash
   # Remove Vapi vars
   unset VAPI_API_KEY
   unset VAPI_PHONE_NUMBER_ID

   # Add ElevenLabs vars
   export ELEVENLABS_API_KEY=sk_xxxxx
   export ELEVENLABS_AGENT_ID=agent_xxxxx
   ```

3. **Import ElevenLabs Workflow:**
   - Delete existing Vapi workflow from n8n
   - Import `voice-call-escalation-workflow_Elevenlabs.json`
   - Reconnect Google Sheets credentials

4. **Update Webhook in ElevenLabs Dashboard:**
   - Navigate to agent settings
   - Set webhook URL: `https://your-n8n-instance.com/webhook/elevenlabs-call-complete`

### From ElevenLabs to Vapi

1. **Create Vapi Account:**
   - Go to https://vapi.ai
   - Purchase phone number
   - Copy API key and phone number ID

2. **Update Environment Variables:**
   ```bash
   # Remove ElevenLabs vars
   unset ELEVENLABS_API_KEY
   unset ELEVENLABS_AGENT_ID

   # Add Vapi vars
   export VAPI_API_KEY=vapi_xxxxx
   export VAPI_PHONE_NUMBER_ID=phoneNumber_xxxxx
   ```

3. **Import Vapi Workflow:**
   - Delete existing ElevenLabs workflow from n8n
   - Import `voice-call-escalation-workflow.json`
   - Reconnect Google Sheets credentials

4. **Update Webhook in Vapi Dashboard:**
   - Settings → Webhooks
   - Set URL: `https://your-n8n-instance.com/webhook/vapi-call-complete`

---

## Testing Both Versions

You can test both workflows side-by-side:

1. **Keep both workflows in n8n** (just rename them)
2. **Use different Google Sheet columns** for tracking:
   - Vapi: `Voice_Call_Vapi_Made`, `Vapi_Action_Taken`, `Vapi_Call_Summary`
   - ElevenLabs: `Voice_Call_ElevenLabs_Made`, `ElevenLabs_Action_Taken`, `ElevenLabs_Call_Summary`

3. **Run A/B tests:**
   - Call 50 patients with Vapi
   - Call 50 patients with ElevenLabs
   - Compare: confirmation rate, call quality feedback, costs

---

## Recommendation

**For Dr. Jennifer's medical practice:**

🏆 **Choose Vapi.ai** because:
1. ✅ HIPAA BAA is readily available and confirmed
2. ✅ Faster setup (built-in phone numbers)
3. ✅ Simpler API structure (easier to maintain)
4. ✅ Better documentation for healthcare use cases

**Consider ElevenLabs if** you already have Twilio set up and want the absolute best voice quality for premium patient experience.

---

## Support Resources

**Vapi.ai:**
- Docs: https://docs.vapi.ai
- Dashboard: https://dashboard.vapi.ai
- Support: support@vapi.ai

**ElevenLabs:**
- Docs: https://elevenlabs.io/docs/conversational-ai
- Dashboard: https://elevenlabs.io/app/conversational-ai
- Support: support@elevenlabs.io

---

**Last Updated:** 2025-10-31
**Both workflows tested and production-ready** ✅
