// netlify/functions/enhance-report.ts

import { Handler } from '@netlify/functions';
import { openai } from './utils/openai';
import { createResponse, createErrorResponse } from './utils/response';

export const handler: Handler = async (event) => {
  if (!process.env.OPENAI_API_KEY) {
    return createErrorResponse(500, 'OpenAI API key is not configured');
  }

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return createErrorResponse(405, 'Method not allowed');
  }

  try {
    const { initialReport, metrics } = JSON.parse(event.body || '{}');

    if (!initialReport || !metrics) {
      return createErrorResponse(400, 'Missing required data');
    }

    const prompt = `As an experienced SaaS CFO and financial analyst, review and enhance the following financial report with strategic insights and actionable recommendations. Focus on identifying key opportunities, risks, and specific action items.

Current Report:
${initialReport.map(section => `
${section.title}:
${section.content}`).join('\n\n')}

Key Metrics:
- MRR: $${metrics.mrr}
- Subscribers: ${metrics.subscribers}
- Churn Rate: ${metrics.churnRate}%
- Growth Rate: ${metrics.growthRate}%

Provide enhanced analysis focusing on:
1. Strategic implications of the current metrics
2. Specific, actionable recommendations
3. Risk mitigation strategies
4. Growth opportunities
5. Operational improvements

For each section, add detailed insights and concrete action items that the business can implement.`;

    const completion = await openai.createChatCompletion({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an expert SaaS CFO providing strategic analysis and recommendations. Focus on actionable insights and specific implementation steps."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 4000
    });

    // Add GPT's strategic insights to the original sections
    const enhancedSections = initialReport.map((section: any) => {
      const gptInsights = extractInsightsForSection(completion.data.choices[0].message?.content || '', section.title);
      return {
        ...section,
        content: section.content + '\n\nStrategic Insights:\n' + gptInsights
      };
    });

    // Add a new "Strategic Recommendations" section
    enhancedSections.push({
      title: "Strategic Recommendations",
      content: extractRecommendations(completion.data.choices[0].message?.content || '')
    });

    return createResponse(200, enhancedSections);
  } catch (error: any) {
    console.error('Error enhancing report:', error);
    return createErrorResponse(500, 'Failed to enhance report', error);
  }
};

function extractInsightsForSection(content: string, sectionTitle: string): string {
  const sectionRegex = new RegExp(`${sectionTitle}[:\\n]([\\s\\S]*?)(?=\\n\\n|$)`, 'i');
  const match = content.match(sectionRegex);
  return match ? match[1].trim() : '';
}

function extractRecommendations(content: string): string {
  const recommendationsRegex = /recommendations?[:\\n]([\s\S]*?)(?=\n\n|$)/i;
  const match = content.match(recommendationsRegex);
  return match ? match[1].trim() : '';
}
