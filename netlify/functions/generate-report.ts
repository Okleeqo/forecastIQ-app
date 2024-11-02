// netlify/functions/generate-report.ts

import { Handler } from '@netlify/functions';
import { openai, Metrics, generateAnalysis } from './utils/openai';
import { createResponse, createErrorResponse } from './utils/response';

export const handler: Handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return createErrorResponse(405, 'Method Not Allowed');
  }

  try {
    const body = JSON.parse(event.body || '{}');

    const { mrr, subscribers, churnRate, growthRate } = body;

    // Validate inputs
    if (
      typeof mrr !== 'number' ||
      typeof subscribers !== 'number' ||
      typeof churnRate !== 'number' ||
      typeof growthRate !== 'number'
    ) {
      return createErrorResponse(400, 'Invalid input data.');
    }

    const metrics: Metrics = { mrr, subscribers, churnRate, growthRate };

    // Generate analysis
    const analysis = await generateAnalysis(metrics);

    return createResponse(200, { analysis });
  } catch (error: any) {
    console.error('Error in generateReport handler:', error.message);
    return createErrorResponse(500, 'Internal Server Error', error);
  }
};
