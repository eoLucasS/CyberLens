/**
 * This route exists solely as a CORS proxy for the HuggingFace Inference API.
 * No data is stored or logged. The API key is forwarded directly
 * to HuggingFace and never persisted on the server.
 *
 * HuggingFace's router.huggingface.co does not set CORS headers
 * that allow direct browser requests, so this proxy is required.
 * NOTE: The old api-inference.huggingface.co was deprecated (returns 410).
 * The new endpoint is router.huggingface.co/v1/chat/completions.
 */

import { NextRequest, NextResponse } from 'next/server';

interface ProxyRequestBody {
  apiKey: string;
  model: string;
  messages: Array<{ role: string; content: string }>;
  max_tokens?: number;
  temperature?: number;
}

const MAX_BODY_SIZE = 500_000;

export async function POST(request: NextRequest) {
  try {
    const contentLength = request.headers.get('content-length');
    if (contentLength && parseInt(contentLength, 10) > MAX_BODY_SIZE) {
      return NextResponse.json({ error: 'Requisição muito grande.' }, { status: 413 });
    }

    const body = (await request.json()) as ProxyRequestBody;

    if (!body.apiKey || !body.model || !body.messages) {
      return NextResponse.json(
        { error: 'Campos obrigatórios: apiKey, model, messages.' },
        { status: 400 },
      );
    }

    const trimmedKey = body.apiKey.trim();
    if (
      trimmedKey.length < 8 ||
      trimmedKey.length > 512 ||
      /<script[\s>]/i.test(trimmedKey) ||
      /('|--|;)\s*(DROP|SELECT|INSERT|UPDATE|DELETE|UNION)\b/i.test(trimmedKey)
    ) {
      return NextResponse.json({ error: 'Formato de API key inválido.' }, { status: 400 });
    }

    const url = 'https://router.huggingface.co/v1/chat/completions';

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${trimmedKey}`,
      },
      body: JSON.stringify({
        model: body.model,
        messages: body.messages,
        max_tokens: body.max_tokens ?? 4096,
        temperature: body.temperature ?? 0.3,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text().catch(() => '');
      return NextResponse.json(
        { error: errorData || `Erro da API HuggingFace: ${response.status}` },
        { status: response.status },
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro interno do servidor.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
