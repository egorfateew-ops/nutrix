import { createClient } from "npm:@supabase/supabase-js@2";

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
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return json({ error: "Войди в NUTRIX, чтобы присоединиться к рациону" }, 401);
    }

    const body = await request.json();
    const token = String(body?.token || "").trim();
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(token)) {
      return json({ error: "Неверная или неполная ссылка" }, 400);
    }

    const baseUrl = Deno.env.get("SUPABASE_URL");
    const secretKeys = JSON.parse(Deno.env.get("SUPABASE_SECRET_KEYS") || "{}");
    const secretKey = secretKeys.default;
    if (!baseUrl || !secretKey) return json({ error: "Backend function is not configured" }, 500);

    const admin = createClient(baseUrl, secretKey, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false }
    });
    const jwt = authHeader.slice(7);
    const { data: authData, error: authError } = await admin.auth.getUser(jwt);
    if (authError || !authData?.user) return json({ error: "Сессия истекла. Войди ещё раз." }, 401);

    const { data: plan, error: planError } = await admin.from("meal_plans")
      .select("id,owner_id,share_enabled")
      .eq("share_token", token).eq("share_enabled", true).maybeSingle();
    if (planError) return json({ error: "Не удалось найти рацион" }, 502);
    if (!plan) return json({ error: "Рацион не найден или приглашение отключено" }, 404);

    if (plan.owner_id !== authData.user.id) {
      const { error: memberError } = await admin.from("plan_members").upsert({
        plan_id: plan.id,
        user_id: authData.user.id,
        role: "editor"
      }, { onConflict: "plan_id,user_id", ignoreDuplicates: true });
      if (memberError) return json({ error: "Не удалось добавить участника" }, 502);
    }

    return json({ ok: true, plan_id: plan.id });
  } catch (_error) {
    return json({ error: "Не удалось присоединиться к рациону" }, 500);
  }
});
