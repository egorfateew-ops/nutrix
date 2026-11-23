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
    const { data: row, error: planError } = await admin.from("meal_plans")
      .select("id,owner_id,title,plan_data,share_token,share_enabled,created_at")
      .eq("share_token", token).eq("share_enabled", true).maybeSingle();
    if (planError) return json({ error: "Не удалось открыть общий рацион" }, 502);
    if (!row) return json({ error: "Рацион не найден или доступ по ссылке отключён" }, 404);

    const { data: shopping } = await admin.from("shopping_lists")
      .select("checked_items,price_overrides,updated_at")
      .eq("plan_id", row.id).maybeSingle();

    let isOwner = false;
    let isMember = false;
    const authHeader = request.headers.get("Authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const jwt = authHeader.slice(7);
      const { data: authData } = await admin.auth.getUser(jwt);
      const user = authData?.user;
      if (user) {
        isOwner = user.id === row.owner_id;
        if (!isOwner) {
          const { data: membership } = await admin.from("plan_members")
            .select("user_id").eq("plan_id", row.id).eq("user_id", user.id).maybeSingle();
          isMember = !!membership;
        }
      }
    }

    const safePlan = { ...row.plan_data };
    delete safePlan.data;
    delete safePlan.calc;
    delete safePlan.adult;
    delete safePlan.scale;
    delete safePlan.rawScale;
    delete safePlan.baseCalories;

    return json({
      id: row.id,
      title: row.title,
      created_at: row.created_at,
      store: row.plan_data?.data?.store || "average",
      budget: row.plan_data?.data?.budget || 0,
      plan: safePlan,
      shopping: shopping || { checked_items: [], price_overrides: {}, updated_at: null },
      is_owner: isOwner,
      is_member: isMember
    });
  } catch (_error) {
    return json({ error: "Не удалось обработать ссылку. Попробуйте ещё раз." }, 500);
  }
});
