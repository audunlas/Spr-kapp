import { http, HttpResponse } from "msw";

const BASE = "";

export const handlers = [
  http.post(`${BASE}/auth/register`, () =>
    HttpResponse.json({ id: 1, username: "testuser", email: null, created_at: "2024-01-01T00:00:00" }, { status: 201 })
  ),

  http.post(`${BASE}/auth/login`, () =>
    HttpResponse.json({ access_token: "fake-jwt-token", token_type: "bearer" })
  ),

  http.get(`${BASE}/auth/me`, () =>
    HttpResponse.json({ id: 1, username: "testuser", email: null, created_at: "2024-01-01T00:00:00" })
  ),

  http.get(`${BASE}/documents`, () =>
    HttpResponse.json([
      { id: 1, title: "El Principito", original_filename: "el_principito.pdf", page_count: 5, created_at: "2024-01-01T00:00:00" },
    ])
  ),

  http.post(`${BASE}/documents/upload`, () =>
    HttpResponse.json(
      { id: 2, title: "Don Quijote", original_filename: "don_quijote.pdf", page_count: 10, created_at: "2024-01-01T00:00:00" },
      { status: 201 }
    )
  ),

  http.get(`${BASE}/documents/:id`, ({ params }) =>
    HttpResponse.json({ id: Number(params.id), title: "El Principito", original_filename: "el_principito.pdf", page_count: 5, created_at: "2024-01-01T00:00:00" })
  ),

  http.get(`${BASE}/documents/:id/pages/:page`, () =>
    HttpResponse.json({
      page_number: 1,
      text_content: "El principito venía del planeta B-612. Había rosas y zorros.",
      document_id: 1,
    })
  ),

  http.post(`${BASE}/translate`, async ({ request }) => {
    const body = await request.json() as { text: string };
    return HttpResponse.json({
      source_text: body.text,
      translated_text: `[NO: ${body.text}]`,
      cached: false,
    });
  }),
];
