export async function onRequest(context) {
    const { request, env } = context;
    const db = env.DB; // Cloudflareでバインドするデータベース名

    // 1. 投稿一覧を取得する (GET)
    if (request.method === "GET") {
        try {
            const { results } = await db.prepare("SELECT * FROM posts ORDER BY timestamp DESC").all();
            return new Response(JSON.stringify(results), {
                headers: { "Content-Type": "application/json" }
            });
        } catch (e) {
            return new Response(JSON.stringify({ error: e.message }), { status: 500 });
        }
    }

    // 2. 新しい投稿を保存する (POST)
    if (request.method === "POST") {
        try {
            const data = await request.json();
            await db.prepare(
                "INSERT INTO posts (id, lat, lng, username, message, timestamp) VALUES (?, ?, ?, ?, ?, ?)"
            ).bind(data.id, data.lat, data.lng, data.username, data.message, data.timestamp).run();

            return new Response(JSON.stringify({ success: true }), {
                headers: { "Content-Type": "application/json" }
            });
        } catch (e) {
            return new Response(JSON.stringify({ error: e.message }), { status: 500 });
        }
    }

    // 3. 投稿を削除する (DELETE) - 管理者用
    if (request.method === "DELETE") {
        try {
            const url = new URL(request.url);
            const id = url.searchParams.get("id");
            await db.prepare("DELETE FROM posts WHERE id = ?").bind(id).run();

            return new Response(JSON.stringify({ success: true }), {
                headers: { "Content-Type": "application/json" }
            });
        } catch (e) {
            return new Response(JSON.stringify({ error: e.message }), { status: 500 });
        }
    }

    return new Response("Method not allowed", { status: 405 });
}