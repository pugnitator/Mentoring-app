/**
 * One-off: copy all data from SOURCE_DATABASE_URL to TARGET_DATABASE_URL.
 * Run from backend/: SOURCE_DATABASE_URL=... TARGET_DATABASE_URL=... node prisma/migrate-data-to-render.mjs
 * Order respects FK: Specialty, Tag, User, NotificationSettings, Profile, Mentor, Mentee, MentorTag, Favorite, Request, Connection.
 */
import pg from 'pg';
const { Client } = pg;

const SOURCE = process.env.SOURCE_DATABASE_URL;
const TARGET = process.env.TARGET_DATABASE_URL;
if (!SOURCE || !TARGET) {
  console.error('Set SOURCE_DATABASE_URL and TARGET_DATABASE_URL');
  process.exit(1);
}

const TABLE_ORDER = [
  'Specialty',
  'Tag',
  'User',
  'NotificationSettings',
  'Profile',
  'Mentor',
  'Mentee',
  'MentorTag',
  'Favorite',
  'Request',
  'Connection',
];

async function run() {
  const source = new Client({ connectionString: SOURCE });
  const target = new Client({ connectionString: TARGET });
  await source.connect();
  await target.connect();

  try {
    const truncateOrder = [...TABLE_ORDER].reverse();
    const truncateList = truncateOrder.map((t) => `"${t}"`).join(', ');
    await target.query(`TRUNCATE ${truncateList} CASCADE`);
    console.log('Target tables truncated.');

    for (const table of TABLE_ORDER) {
      const { rows } = await source.query(`SELECT * FROM "${table}"`);
      if (rows.length === 0) {
        console.log(table + ': 0 rows');
        continue;
      }
      const cols = Object.keys(rows[0]).map((c) => `"${c}"`).join(', ');
      const placeholders = Object.keys(rows[0]).map((_, i) => `$${i + 1}`).join(', ');
      for (const row of rows) {
        const values = Object.values(row);
        await target.query(`INSERT INTO "${table}" (${cols}) VALUES (${placeholders})`, values);
      }
      console.log(table + ': ' + rows.length + ' rows');
    }
    console.log('Done.');
  } finally {
    await source.end();
    await target.end();
  }
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
