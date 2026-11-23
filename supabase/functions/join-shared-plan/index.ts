const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status, headers: { ...corsHeaders, "Content-Type": "application/json" }
});

Deno.serve(async (request: Request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) return json({ error: "Войди в NUTRIX, чтобы присоединиться к рациону" }, 401);
    const body = await request.json();
    const token = String(body?.token || "").trim();
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(token)) {
      return json({ error: "Неверная или неполная ссылка" }, 400);
    }
    const baseUrl = Deno.env.get("SUPABASE_URL");
    const secretKeys = JSON.parse(Deno.env.get("SUPABASE_SECRET_KEYS") || "{}");
    const publishableKeys = JSON.parse(Deno.env.get("SUPABASE_PUBLISHABLE_KEYS") || "{}");
    const serviceKey = secretKeys.default;
    const publishableKey = publishableKeys.default;
    if (!baseUrl || !serviceKey || !publishableKey) return json({ error: "Backend function is not configured" }, 500);
    const userResponse = await fetch(baseUrl + "/auth/v1/user", {
      headers: { apikey: publishableKey, Authorization: authHeader }
    });
    if (!userResponse.ok) return json({ error: "Сессия истекла. Войди ещё раз." }, 401);
    const user = await userResponse.json();
    const adminHeaders = { apikey: serviceKey, Authorization: "Bearer " + serviceKey, "Content-Type": "application/json" };
    const planResponse = await fetch(
      baseUrl + "/rest/v1/meal_plans?select=id,owner_id,share_enabled&share_token=eq." + token + "&share_enabled=eq.true&limit=1",
      { headers: adminHeaders }
    );
    if (!planResponse.ok) return json({ error: "Не удалось найти рацион" }, 502);
    const plans = await planResponse.json();
    if (!Array.isArray(plans) || plans.length === 0) return json({ error: "Рацион не найден или приглашение отключено" }, 404);
    const plan = plans[0];
    if (plan.owner_id !== user.id) {
      const insertResponse = await fetch(baseUrl + "/rest/v1/plan_members?on_conflict=plan_id,user_id", {
        method: "POST",
        headers: { ...adminHeaders, Prefer: "resolution=ignore-duplicates,return=minimal" },
        body: JSON.stringify({ plan_id: plan.id, user_id: user.id, role: "editor" })
      });
      if (!insertResponse.ok) return json({ error: "Не удалось добавить участника. Проверь схему базы данных." }, 502);
    }
    return json({ ok: true, plan_id: plan.id });
  } catch (_error) {
    return json({ error: "Не удалось присоединиться к рациону" }, 500);
  }
});
