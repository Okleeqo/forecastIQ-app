// netlify/functions/utils/openai.ts

import { Configuration, OpenAIApi } from 'openai';

if (!process.env.OPENAI_API_KEY) {
  throw new Error('OpenAI API key is not configured');
}

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

export const openai = new OpenAIApi(configuration);

export interface Metrics {
  mrr: number;
  subscribers: number;
  churnRate: number;
  growthRate: number;
}

export async function generateAnalysis(metrics: Metrics): Promise<string> {
  const completion = await openai.createChatCompletion({
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content: "You are an expert SaaS CFO providing strategic analysis and recommendations."
      },
      {
        role: "user",
        content: `Analyze these SaaS metrics and provide strategic insights:
          
          Current Metrics:
          - MRR: $${metrics.mrr}
          - Subscribers: ${metrics.subscribers}
          - Churn Rate: ${metrics.churnRate}%
          - Growth Rate: ${metrics.growthRate}%
          
          Please provide:
          1. Executive Summary
          2. Key Performance Analysis
          3. Risk Factors
          4. Growth Opportunities
          5. Strategic Recommendations
          
          Format the response in clear sections with actionable insights.`
      }
    ],
    temperature: 0.7,
    max_tokens: 2000
  });

  return completion.data.choices[0].message?.content || '';
}
