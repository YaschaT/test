import { activeProvider } from '../_ai.ts';

interface ApiResponse {
  status(code: number): ApiResponse;
  json(body: unknown): void;
}

/** GET /api/chat/status → { available, provider } (mirrors the local Express endpoint). */
export default function handler(_req: unknown, res: ApiResponse): void {
  const provider = activeProvider();
  res.status(200).json({ available: provider !== null, provider });
}
