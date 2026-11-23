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
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
    if (!baseUrl || !serviceKey || !anonKey) return json({ error: "Backend function is not configured" }, 500);
    const adminHeaders = { apikey: serviceKey, Authorization: "Bearer " + serviceKey, "Content-Type": "application/json" };
    const planResponse = await fetch(
      baseUrl + "/rest/v1/meal_plans?select=id,owner_id,title,plan_data,share_token,share_enabled,created_at&share_token=eq." + token + "&share_enabled=eq.true&limit=1",
      { headers: adminHeaders }
    );
    if (!planResponse.ok) return json({ error: "Не удалось открыть общий рацион" }, 502);
    const plans = await planResponse.json();
    if (!Array.isArray(plans) || plans.length === 0) return json({ error: "Рацион не найден или доступ по ссылке отключён" }, 404);
    const row = plans[0];
    const shoppingResponse = await fetch(
      baseUrl + "/rest/v1/shopping_lists?select=checked_items,price_overrides,updated_at&plan_id=eq." + row.id + "&limit=1",
      { headers: adminHeaders }
    );
    const shoppingRows = shoppingResponse.ok ? await shoppingResponse.json() : [];
    const shopping = Array.isArray(shoppingRows) && shoppingRows[0]
      ? shoppingRows[0] : { checked_items: [], price_overrides: {}, updated_at: null };

    let isOwner = false;
    let isMember = false;
    const authHeader = request.headers.get("Authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const userResponse = await fetch(baseUrl + "/auth/v1/user", {
        headers: { apikey: anonKey, Authorization: authHeader }
      });
      if (userResponse.ok) {
        const user = await userResponse.json();
        isOwner = user.id === row.owner_id;
        if (!isOwner) {
          const memberResponse = await fetch(
            baseUrl + "/rest/v1/plan_members?select=user_id&plan_id=eq." + row.id + "&user_id=eq." + encodeURIComponent(user.id) + "&limit=1",
            { headers: adminHeaders }
          );
          const members = memberResponse.ok ? await memberResponse.json() : [];
          isMember = Array.isArray(members) && members.length > 0;
        }
      }
    }
    const safePlan = { ...row.plan_data };
    delete safePlan.data;
    delete safePlan.calc;
    return json({
      id: row.id, title: row.title, created_at: row.created_at,
      store: row.plan_data?.data?.store || "average",
      budget: row.plan_data?.data?.budget || 0,
      plan: safePlan, shopping, is_owner: isOwner, is_member: isMember
    });
  } catch (_error) {
    return json({ error: "Не удалось обработать ссылку. Попробуйте ещё раз." }, 500);
  }
});
