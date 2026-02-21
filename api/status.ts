import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(request: VercelRequest, response: VercelResponse) {
  // Simula um processamento de backend
  const serverTime = new Date().toISOString();
  
  // Retorna dados em JSON
  return response.status(200).json({
    status: 'online',
    message: 'Backend FXBROS operacional.',
    timestamp: serverTime,
    version: '1.0.0'
  });
}