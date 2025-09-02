import express from 'express';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import path from 'path';
import cors from 'cors';

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const OPENAI_KEY = process.env.OPENAI_API_KEY;
const MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';

if(!OPENAI_KEY) console.warn('WARNING: OPENAI_API_KEY is not set. The API calls will fail until you set it.');

// Serve frontend static files (adjust path if needed)
app.use(express.static(path.resolve('../frontend')));

app.post('/api/chat', async (req, res) => {
  try{
    const userMsg = req.body.message;
    if(!userMsg) return res.json({error:'لا يوجد رسالة'});

    const body = {
      model: MODEL,
      messages: [
        { role: 'system', content: 'أنت مساعد ذكي باللغة العربية والإنجليزية.' },
        { role: 'user', content: userMsg }
      ]
    };

    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method:'POST',
      headers: {
        'Content-Type':'application/json',
        'Authorization': `Bearer ${OPENAI_KEY}`
      },
      body: JSON.stringify(body)
    });

    if(!r.ok){
      const txt = await r.text();
      return res.json({error: 'OpenAI error: '+txt});
    }
    const data = await r.json();
    const reply = data.choices?.[0]?.message?.content || data.choices?.[0]?.text || 'لا يوجد رد.';
    res.json({reply});
  }catch(err){
    console.error(err);
    res.json({error: err.message});
  }
});

app.listen(PORT, ()=> console.log(`Server running on port ${PORT}`));