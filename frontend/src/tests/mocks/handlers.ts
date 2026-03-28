import { http, HttpResponse } from "msw";

const BASE = "";

export const handlers = [
  http.post(`${BASE}/auth/register`, () =>
    HttpResponse.json({ id: 1, username: "testuser", email: null, native_language: "en", created_at: "2024-01-01T00:00:00" }, { status: 201 })
  ),

  http.post(`${BASE}/auth/login`, () =>
    HttpResponse.json({ access_token: "fake-jwt-token", token_type: "bearer" })
  ),

  http.get(`${BASE}/auth/me`, () =>
    HttpResponse.json({ id: 1, username: "testuser", email: null, native_language: "en", created_at: "2024-01-01T00:00:00" })
  ),

  http.get(`${BASE}/documents`, () =>
    HttpResponse.json([
      { id: 1, title: "El Principito", target_language: "es", original_filename: "el_principito.pdf", page_count: 5, created_at: "2024-01-01T00:00:00" },
    ])
  ),

  http.post(`${BASE}/documents/upload`, () =>
    HttpResponse.json(
      { id: 2, title: "Don Quijote", target_language: "es", original_filename: "don_quijote.pdf", page_count: 10, created_at: "2024-01-01T00:00:00" },
      { status: 201 }
    )
  ),

  http.post(`${BASE}/documents/text`, () =>
    HttpResponse.json(
      { id: 3, title: "My Text", target_language: "es", original_filename: null, page_count: 1, created_at: "2024-01-01T00:00:00" },
      { status: 201 }
    )
  ),

  http.get(`${BASE}/documents/:id`, ({ params }) =>
    HttpResponse.json({ id: Number(params.id), title: "El Principito", target_language: "es", original_filename: "el_principito.pdf", page_count: 5, created_at: "2024-01-01T00:00:00" })
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

  // Vocab handlers
  http.get(`${BASE}/vocab/lists`, () =>
    HttpResponse.json([
      {
        id: 1,
        name: "My Spanish Words",
        target_language: "es",
        entries: [{ id: 1, list_id: 1, native_word: "hello", target_word: "hola" }],
        created_at: "2024-01-01T00:00:00",
      },
    ])
  ),

  http.get(`${BASE}/vocab/lists/1`, () =>
    HttpResponse.json({
      id: 1,
      name: "My Spanish Words",
      target_language: "es",
      entries: [{ id: 1, list_id: 1, native_word: "hello", target_word: "hola" }],
      created_at: "2024-01-01T00:00:00",
    })
  ),

  http.post(`${BASE}/vocab/lists`, async ({ request }) => {
    const body = await request.json() as { name: string; target_language: string };
    return HttpResponse.json(
      { id: 2, name: body.name, target_language: body.target_language, entries: [], created_at: "2024-01-01T00:00:00" },
      { status: 201 }
    );
  }),

  http.patch(`${BASE}/vocab/lists/1`, async ({ request }) => {
    const body = await request.json() as { name: string };
    return HttpResponse.json({
      id: 1,
      name: body.name,
      target_language: "es",
      entries: [],
      created_at: "2024-01-01T00:00:00",
    });
  }),

  http.delete(`${BASE}/vocab/lists/1`, () =>
    new HttpResponse(null, { status: 204 })
  ),

  http.post(`${BASE}/vocab/lists/1/entries`, () =>
    HttpResponse.json({
      id: 1,
      name: "My Spanish Words",
      target_language: "es",
      entries: [
        { id: 1, list_id: 1, native_word: "hello", target_word: "hola" },
        { id: 2, list_id: 1, native_word: "goodbye", target_word: "adiós" },
      ],
      created_at: "2024-01-01T00:00:00",
    })
  ),

  http.delete(`${BASE}/vocab/lists/1/entries/1`, () =>
    new HttpResponse(null, { status: 204 })
  ),
];
