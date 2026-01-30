these are clearly not connected. come on man fix it

```json

{
  "nodes": [
    {
      "parameters": {},
      "type": "@n8n/n8n-nodes-langchain.lmChatAnthropic",
      "typeVersion": 1.8,
      "position": [
        -1072,
        96
      ],
      "id": "ec609fdd-402f-4ad4-a5bb-103cb7bb4719",
      "name": "Claude 3.5 Sonnet",
      "credentials": {}
    },
    {
      "parameters": {},
      "type": "@n8n/n8n-nodes-langchain.memoryBufferWindow",
      "typeVersion": 1.4,
      "position": [
        -1072,
        304
      ],
      "id": "8cfb12cd-f536-4479-b9d2-e47b4bd74745",
      "name": "Chat Memory (10 messages)"
    }
  ],
  "connections": {},
  "pinData": {},
  "meta": {
    "templateCredsSetupCompleted": true,
    "instanceId": "7b3125be3eb2b56ab7606a684daa96104964f42d4c53676367f2a84787aca813"
  }
}
```


and this is also unconnected
```json
{
  "nodes": [
    {
      "parameters": {
        "options": {}
      },
      "type": "@n8n/n8n-nodes-langchain.documentDefaultDataLoader",
      "typeVersion": 1,
      "position": [
        -1072,
        1744
      ],
      "id": "a0ed4655-ab5e-4e1e-9caf-f4120e6d30d1",
      "name": "Load Knowledge Base Document"
    },
    {
      "parameters": {
        "chunkSize": 2000,
        "chunkOverlap": 200,
        "options": {}
      },
      "type": "@n8n/n8n-nodes-langchain.textSplitterRecursiveCharacterTextSplitter",
      "typeVersion": 1,
      "position": [
        -1072,
        1952
      ],
      "id": "3a5af919-8a9a-4186-8029-d0b71456ed5a",
      "name": "Split into Chunks"
    }
  ],
  "connections": {},
  "pinData": {},
  "meta": {
    "templateCredsSetupCompleted": true,
    "instanceId": "7b3125be3eb2b56ab7606a684daa96104964f42d4c53676367f2a84787aca813"
  }
}
```