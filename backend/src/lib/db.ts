import { Pool, QueryResult, QueryResultRow  } from 'pg';

const pool: Pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'releafdb3',
  password: 'test@1234',
  port: 5432,
});
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function query<T extends QueryResultRow = any>(text: string, params?: any[]): Promise<QueryResult<T>> {
  return pool.query<T>(text, params);
}

export default pool;
