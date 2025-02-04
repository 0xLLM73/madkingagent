import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function testAPI() {
  try {
    const completion = await openai.chat.completions.create({
      messages: [
        { role: "system", content: "You are a helpful assistant. Respond in one sentence." },
        { role: "user", content: "Say hello!" }
      ],
      model: "gpt-3.5-turbo",
      max_tokens: 30
    });
    console.log("API test successful!");
    console.log("Response:", completion.choices[0].message);
  } catch (error) {
    console.error("API test failed:");
    console.error(error.message);
  }
}

testAPI();
