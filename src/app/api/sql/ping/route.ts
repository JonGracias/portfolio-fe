import { getPool } from "@/lib/sql";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const pool = await getPool();
  const result = await pool.request().query("SELECT 1 AS ok");
  return Response.json(result.recordset[0]); // { ok: 1 }
}
