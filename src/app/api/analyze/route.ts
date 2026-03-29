/**
 * This route exists solely as a CORS proxy for the Anthropic API.
 * No data is stored or logged. The API key is forwarded directly
 * to Anthropic and never persisted on the server.
 */

import { NextRequest, NextResponse } from 'next/server';

interface ProxyRequestBody {
  apiKey: string;
  model: string;
  systemPrompt: string;
  userPrompt: string;
}

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const MAX_BODY_SIZE = 500_000;

export async function POST(request: NextRequest) {
  try {
    const contentLength = request.headers.get('content-length');
    if (contentLength && parseInt(contentLength, 10) > MAX_BODY_SIZE) {
      return NextResponse.json(
        { error: 'Requisição muito grande.' },
        { status: 413 },
      );
    }

    const body = (await request.json()) as ProxyRequestBody;

    if (!body.apiKey || !body.model || !body.systemPrompt || !body.userPrompt) {
      return NextResponse.json(
        { error: 'Campos obrigatórios: apiKey, model, systemPrompt, userPrompt.' },
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
      return NextResponse.json(
        { error: 'Formato de API key inválido.' },
        { status: 400 },
      );
    }

    const response = await fetch(ANTHROPIC_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': trimmedKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: body.model,
        max_tokens: 4096,
        system: body.systemPrompt,
        messages: [{ role: 'user', content: body.userPrompt }],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage =
        (errorData as { error?: { message?: string } })?.error?.message ||
        `Erro da API Anthropic: ${response.status}`;

      return NextResponse.json(
        { error: errorMessage },
        { status: response.status },
      );
    }

    const data = (await response.json()) as {
      content: Array<{ type: string; text: string }>;
    };

    const textContent = data.content.find((block) => block.type === 'text');
    if (!textContent) {
      return NextResponse.json(
        { error: 'Resposta da API não contém texto.' },
        { status: 502 },
      );
    }

    return NextResponse.json({ content: textContent.text });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Erro interno do servidor.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
