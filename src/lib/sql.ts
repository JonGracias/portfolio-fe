import sql from "mssql";

let poolPromise: Promise<sql.ConnectionPool> | null = null;

function getConnStr(): string {
  const cs = process.env.SQL_CONNECTION_STRING;
  if (!cs) throw new Error("Missing SQL_CONNECTION_STRING");
  return cs;
}

// Parse connection string into config object
function parseConnectionString(connStr: string): sql.config {
  const params: Record<string, string> = {};
  
  // Split by semicolons and parse key=value pairs
  connStr.split(';').forEach(pair => {
    const [key, ...valueParts] = pair.split('=');
    if (key && valueParts.length > 0) {
      params[key.trim()] = valueParts.join('=').trim();
    }
  });

  // Extract server and port
  const serverParts = params['Server']?.replace('tcp:', '').split(',');
  const server = serverParts?.[0] || '';
  const port = serverParts?.[1] ? parseInt(serverParts[1]) : 1433;

  return {
    server,
    port,
    database: params['Initial Catalog'] || params['Database'],
    user: params['User ID'],
    password: params['Password'],
    options: {
      encrypt: params['Encrypt'] === 'True',
      trustServerCertificate: params['TrustServerCertificate'] === 'True',
      enableArithAbort: true
    },
    pool: {
      max: 10,
      min: 0,
      idleTimeoutMillis: 30000
    }
  };
}

export async function getPool(): Promise<sql.ConnectionPool> {
  if (!poolPromise) {
    const connStr = getConnStr();
    const config = parseConnectionString(connStr);
    
    // NOTE: connect using the config object
    poolPromise = sql.connect(config);
  }
  
  return poolPromise;
}

// Optional helper for one-off queries
export async function query<T = any>(text: string, params?: Record<string, any>) {
  const pool = await getPool();
  const req = pool.request();
  
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      req.input(k, v as any);
    }
  }
  
  const result = await req.query<T>(text);
  return result;
}