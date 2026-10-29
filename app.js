/* ===== helpers ===== */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = (s) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const yt = (q) =>
  "https://www.youtube.com/results?search_query=" + encodeURIComponent(q);
const R = (name, url) =>
  `<a href="${url}" target="_blank" rel="noopener">${name} ↗</a>`;
const resRow = (list) =>
  `<div class="res"><b>Free resources:</b>${list.map(([n, u]) => R(n, u)).join("")}</div>`;
const code = (c, lang = "") =>
  `<pre><button class="copy" type="button">Copy</button><code>${esc(c.trim())}</code></pre>`;

/* ===== LESSON DATA ===== */
const TRACKS = {
  pg: {
    cls: "t-pg",
    ico: "🐘",
    title: "PostgreSQL: Fundamentals → Industry",
    intro:
      "The most loved open-source relational database. Learn it in this order. Every lesson: idea → example → free resources. Tick each lesson when you really understand it.",
    lessons: [
      {
        t: "Install, psql and the mental model",
        lv: "Beginner",
        b: "A <b>database</b> holds <b>tables</b> (like spreadsheets). Each <b>row</b> is one record, each <b>column</b> is one property. Postgres is a server: you connect with a client such as <code>psql</code>, pgAdmin or DBeaver. Easiest install: Docker, or a free cloud database (Neon, Supabase).",
        c: `docker run --name pg -e POSTGRES_PASSWORD=secret -p 5432:5432 -d postgres:16
docker exec -it pg psql -U postgres

\\l            -- list databases
\\c mydb       -- connect
\\dt           -- list tables
\\d users      -- describe a table
\\q            -- quit`,
        r: [
          [
            "Official tutorial",
            "https://www.postgresql.org/docs/current/tutorial.html",
          ],
          ["PostgreSQL Tutorial site", "https://www.postgresqltutorial.com/"],
          ["Neon (free cloud PG)", "https://neon.tech"],
          ["Supabase (free)", "https://supabase.com"],
          [
            "Video: Postgres for beginners",
            yt("postgresql full course for beginners"),
          ],
        ],
      },
      {
        t: "Data types, tables and constraints",
        lv: "Beginner",
        b: "Pick the right type: <code>integer</code>, <code>bigint</code>, <code>numeric(10,2)</code> for money (never float), <code>text</code>, <code>boolean</code>, <code>timestamptz</code>, <code>uuid</code>, <code>jsonb</code>. <b>Constraints</b> are rules the database enforces for you: PRIMARY KEY, NOT NULL, UNIQUE, CHECK, FOREIGN KEY. Let the DB protect your data, not only your app code.",
        c: `CREATE TABLE users (
  id         bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  email      text NOT NULL UNIQUE,
  name       text NOT NULL,
  age        int CHECK (age >= 0),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE orders (
  id       bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id  bigint NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  total    numeric(10,2) NOT NULL CHECK (total >= 0),
  status   text NOT NULL DEFAULT 'pending'
);`,
        r: [
          [
            "Data types (docs)",
            "https://www.postgresql.org/docs/current/datatype.html",
          ],
          [
            "Constraints (docs)",
            "https://www.postgresql.org/docs/current/ddl-constraints.html",
          ],
          ["SQLBolt (interactive)", "https://sqlbolt.com/"],
          ["SQLZoo", "https://sqlzoo.net/"],
        ],
      },
      {
        t: "CRUD: INSERT, SELECT, UPDATE, DELETE",
        lv: "Beginner",
        b: "CRUD = Create, Read, Update, Delete. <b>Always</b> put a WHERE on UPDATE/DELETE, and test it with a SELECT first. <code>RETURNING</code> gives you the changed rows back, a Postgres superpower.",
        c: `INSERT INTO users (email, name, age)
VALUES ('ana@mail.com','Ana',22), ('ben@mail.com','Ben',25)
RETURNING id;

SELECT id, name FROM users WHERE age > 21;

UPDATE users SET age = age + 1 WHERE email = 'ana@mail.com';

DELETE FROM users WHERE id = 2;

-- upsert: insert or update if the email already exists
INSERT INTO users (email, name) VALUES ('ana@mail.com','Ana K')
ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name;`,
        r: [
          ["pgexercises.com (practice)", "https://pgexercises.com/"],
          ["Mode SQL tutorial", "https://mode.com/sql-tutorial/"],
          ["SQL Murder Mystery (fun)", "https://mystery.knightlab.com/"],
        ],
      },
      {
        t: "Filtering, sorting, aggregates and GROUP BY",
        lv: "Beginner",
        b: "<code>WHERE</code> filters rows, <code>ORDER BY</code> sorts, <code>LIMIT/OFFSET</code> paginates, <code>GROUP BY</code> makes buckets and aggregates (COUNT, SUM, AVG, MIN, MAX) summarise each bucket. <code>HAVING</code> filters buckets (WHERE filters rows before grouping).",
        c: `SELECT status, COUNT(*) AS orders, SUM(total) AS revenue
FROM orders
WHERE created_at >= now() - interval '30 days'
GROUP BY status
HAVING COUNT(*) > 5
ORDER BY revenue DESC
LIMIT 10;

-- LIKE / ILIKE / IN / BETWEEN / IS NULL
SELECT * FROM users WHERE name ILIKE 'a%' AND age BETWEEN 18 AND 30;`,
        r: [
          [
            "Aggregate functions (docs)",
            "https://www.postgresql.org/docs/current/functions-aggregate.html",
          ],
          ["Video: SQL GROUP BY", yt("sql group by having explained")],
        ],
      },
      {
        t: "Joins: connecting tables",
        lv: "Beginner",
        b: 'Data is split across tables to avoid repetition. A <b>JOIN</b> glues rows back using a key. INNER = only matches; LEFT = everything from the left table plus matches; FULL = everything. Play with the <a href="#join-lab">Join Visualizer</a> above.',
        c: `SELECT u.name, o.id AS order_id, o.total
FROM users u
JOIN orders o ON o.user_id = u.id;          -- INNER

-- users who never ordered
SELECT u.name
FROM users u
LEFT JOIN orders o ON o.user_id = u.id
WHERE o.id IS NULL;

-- many-to-many through a bridge table
SELECT s.name, c.title
FROM students s
JOIN enrollments e ON e.student_id = s.id
JOIN courses c     ON c.id = e.course_id;`,
        r: [
          [
            "Joins (docs)",
            "https://www.postgresql.org/docs/current/tutorial-join.html",
          ],
          [
            "Visual join guide (SQLBolt)",
            "https://sqlbolt.com/lesson/select_queries_with_joins",
          ],
          ["Video: SQL joins", yt("sql joins explained visually")],
        ],
      },
      {
        t: "Schema design and normalization",
        lv: "Intermediate",
        b: "<b>Normalization</b> = store each fact once. 1NF: no lists inside a cell. 2NF: every column depends on the whole key. 3NF: columns depend on the key, nothing else. Relationships: one-to-many (FK on the many side), many-to-many (bridge table). Denormalize <i>only</i> when you measured a real problem.",
        c: `-- BAD: customer data copied into every order
-- orders(id, customer_name, customer_email, product1, product2 ...)

-- GOOD
customers(id PK, name, email UNIQUE)
orders(id PK, customer_id FK -> customers, created_at)
products(id PK, name, price)
order_items(order_id FK, product_id FK, qty, unit_price, PRIMARY KEY(order_id, product_id))
-- unit_price is copied on purpose: the price at purchase time must never change.`,
        r: [
          ["dbdiagram.io (draw ERDs free)", "https://dbdiagram.io/"],
          [
            "Normalization video",
            yt("database normalization 1NF 2NF 3NF explained"),
          ],
          ["Roadmap: PostgreSQL DBA", "https://roadmap.sh/postgresql-dba"],
        ],
      },
      {
        t: "Subqueries, CTEs and window functions",
        lv: "Intermediate",
        b: "A <b>CTE</b> (<code>WITH</code>) names a step so big queries read like a story. <b>Window functions</b> calculate across related rows <i>without</i> collapsing them: ranking, running totals, previous row. Interview favourite.",
        c: `WITH monthly AS (
  SELECT date_trunc('month', created_at) AS month, SUM(total) AS revenue
  FROM orders GROUP BY 1
)
SELECT month, revenue,
       SUM(revenue) OVER (ORDER BY month)                    AS running_total,
       revenue - LAG(revenue) OVER (ORDER BY month)          AS change_vs_prev,
       RANK() OVER (ORDER BY revenue DESC)                   AS rank
FROM monthly;

-- top 3 orders per customer
SELECT * FROM (
  SELECT o.*, ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY total DESC) rn
  FROM orders o
) x WHERE rn <= 3;`,
        r: [
          [
            "Window functions tutorial (docs)",
            "https://www.postgresql.org/docs/current/tutorial-window.html",
          ],
          [
            "Mode: window functions",
            "https://mode.com/sql-tutorial/sql-window-functions/",
          ],
          ["Video: window functions", yt("sql window functions tutorial")],
        ],
      },
      {
        t: "Indexes and EXPLAIN (performance core)",
        lv: "Intermediate",
        b: "An <b>index</b> is the book's index page: jump to the answer instead of reading every page (a <i>sequential scan</i>). Default B-tree handles =, &lt;, &gt;, ORDER BY. Others: GIN (jsonb, arrays, full-text), GiST, BRIN. Index columns you filter, join and sort on; every index slows writes and uses disk. Use <code>EXPLAIN ANALYZE</code> to see the truth.",
        c: `CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_user_created ON orders(user_id, created_at DESC); -- composite: order matters
CREATE INDEX idx_pending ON orders(created_at) WHERE status = 'pending'; -- partial
CREATE INDEX idx_meta ON events USING gin (meta);                        -- jsonb

EXPLAIN (ANALYZE, BUFFERS)
SELECT * FROM orders WHERE user_id = 42 ORDER BY created_at DESC LIMIT 20;
-- look for: Index Scan (good) vs Seq Scan (maybe bad on big tables), actual time, rows`,
        r: [
          [
            "Use The Index, Luke (free book)",
            "https://use-the-index-luke.com/",
          ],
          ["Visualize EXPLAIN plans", "https://explain.dalibo.com/"],
          [
            "Indexes (docs)",
            "https://www.postgresql.org/docs/current/indexes.html",
          ],
          [
            "Video: indexes",
            yt("postgresql indexes explained explain analyze"),
          ],
        ],
      },
      {
        t: "Transactions, ACID, isolation and locking",
        lv: "Advanced",
        b: "A <b>transaction</b> = all-or-nothing (bank transfer: debit AND credit, or neither). <b>ACID</b>: Atomic, Consistent, Isolated, Durable. Isolation levels trade safety for speed: READ COMMITTED (default), REPEATABLE READ, SERIALIZABLE. Use <code>SELECT ... FOR UPDATE</code> to lock a row while you decide, and <code>FOR UPDATE SKIP LOCKED</code> for job queues.",
        c: `BEGIN;
UPDATE accounts SET balance = balance - 100 WHERE id = 1 AND balance >= 100;
UPDATE accounts SET balance = balance + 100 WHERE id = 2;
COMMIT;      -- or ROLLBACK;

-- prevent overselling the last seat
BEGIN;
SELECT seats_left FROM events WHERE id = 7 FOR UPDATE;   -- others wait here
UPDATE events SET seats_left = seats_left - 1 WHERE id = 7 AND seats_left > 0;
COMMIT;

-- job queue worker
SELECT * FROM jobs WHERE status='new' ORDER BY id LIMIT 1 FOR UPDATE SKIP LOCKED;`,
        r: [
          [
            "Concurrency control (docs)",
            "https://www.postgresql.org/docs/current/mvcc.html",
          ],
          [
            "Transaction isolation (docs)",
            "https://www.postgresql.org/docs/current/transaction-iso.html",
          ],
          [
            "CMU Database Systems course (free)",
            "https://15445.courses.cs.cmu.edu/",
          ],
          [
            "Video: ACID & isolation",
            yt("database transactions acid isolation levels explained"),
          ],
        ],
      },
      {
        t: "JSONB, arrays, full-text search",
        lv: "Intermediate",
        b: "Postgres can act a bit like MongoDB: <code>jsonb</code> stores flexible documents <i>with indexes</i>. Arrays and full-text search (<code>tsvector</code>) cover tags and search. Great when only <i>part</i> of your data is flexible.",
        c: `ALTER TABLE products ADD COLUMN attrs jsonb DEFAULT '{}';
UPDATE products SET attrs = '{"color":"red","tags":["new","sale"]}' WHERE id = 1;

SELECT name FROM products WHERE attrs->>'color' = 'red';
SELECT name FROM products WHERE attrs @> '{"tags":["sale"]}';   -- uses GIN index

-- full-text search
ALTER TABLE posts ADD COLUMN tsv tsvector
  GENERATED ALWAYS AS (to_tsvector('english', title || ' ' || body)) STORED;
CREATE INDEX idx_posts_tsv ON posts USING gin(tsv);
SELECT title FROM posts WHERE tsv @@ websearch_to_tsquery('english','database indexing');`,
        r: [
          [
            "JSON types (docs)",
            "https://www.postgresql.org/docs/current/datatype-json.html",
          ],
          [
            "Full text search (docs)",
            "https://www.postgresql.org/docs/current/textsearch.html",
          ],
        ],
      },
      {
        t: "Views, functions, triggers, extensions",
        lv: "Intermediate",
        b: "A <b>view</b> is a saved query. A <b>materialized view</b> stores the result (fast dashboards, refresh when needed). <b>Triggers</b> run code automatically on changes (audit logs, updated_at). Extensions add powers: <code>pgcrypto</code>, <code>pg_trgm</code> (fuzzy search), <code>PostGIS</code> (maps), <code>pgvector</code> (AI embeddings).",
        c: `CREATE VIEW active_users AS SELECT * FROM users WHERE deleted_at IS NULL;
CREATE MATERIALIZED VIEW daily_sales AS
  SELECT date_trunc('day', created_at) d, SUM(total) FROM orders GROUP BY 1;
REFRESH MATERIALIZED VIEW daily_sales;

CREATE FUNCTION set_updated_at() RETURNS trigger AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql;
CREATE TRIGGER trg_users_updated BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE EXTENSION IF NOT EXISTS pg_trgm;`,
        r: [
          [
            "Triggers (docs)",
            "https://www.postgresql.org/docs/current/triggers.html",
          ],
          [
            "PL/pgSQL (docs)",
            "https://www.postgresql.org/docs/current/plpgsql.html",
          ],
          ["pgvector", "https://github.com/pgvector/pgvector"],
        ],
      },
      {
        t: "Security: roles, privileges, Row-Level Security",
        lv: "Advanced",
        b: "Never run your app as the superuser. Create roles with minimum rights. <b>Row-Level Security</b> lets the database itself restrict which rows each user sees, a clean way to build multi-tenant SaaS. Always use parameterized queries (your ORM does) to stop SQL injection.",
        c: `CREATE ROLE app_user LOGIN PASSWORD 'change-me';
GRANT SELECT, INSERT, UPDATE ON orders TO app_user;

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON orders
  USING (tenant_id = current_setting('app.tenant_id')::bigint);

SET app.tenant_id = '5';
SELECT * FROM orders;   -- only tenant 5 rows`,
        r: [
          [
            "Roles & privileges (docs)",
            "https://www.postgresql.org/docs/current/user-manag.html",
          ],
          [
            "Row security (docs)",
            "https://www.postgresql.org/docs/current/ddl-rowsecurity.html",
          ],
          [
            "OWASP SQL Injection",
            "https://owasp.org/www-community/attacks/SQL_Injection",
          ],
        ],
      },
      {
        t: "Industry level: pooling, partitioning, replication, backups, monitoring",
        lv: "Industry",
        b: "<ul><li><b>Connection pooling</b> (PgBouncer): Postgres connections are expensive; poolers let thousands of app requests share few connections.</li><li><b>Partitioning</b>: split huge tables (e.g. by month) so queries touch less data and old data is dropped instantly.</li><li><b>Replication</b>: a primary takes writes, read replicas serve reads and give failover. Replicas can lag slightly.</li><li><b>Backups</b>: base backup + WAL archiving = point-in-time recovery. A backup you never restored is not a backup.</li><li><b>Monitoring</b>: <code>pg_stat_statements</code> (slowest queries), autovacuum health, bloat, locks, replication lag.</li><li><b>Safe migrations</b>: add nullable columns, <code>CREATE INDEX CONCURRENTLY</code>, backfill in batches.</li></ul>",
        c: `CREATE TABLE events (id bigserial, created_at timestamptz NOT NULL, payload jsonb)
PARTITION BY RANGE (created_at);
CREATE TABLE events_2026_10 PARTITION OF events
  FOR VALUES FROM ('2026-10-01') TO ('2026-11-01');

CREATE INDEX CONCURRENTLY idx_big ON big_table(col);   -- no long table lock

SELECT query, calls, mean_exec_time
FROM pg_stat_statements ORDER BY mean_exec_time DESC LIMIT 10;`,
        r: [
          [
            "High availability (docs)",
            "https://www.postgresql.org/docs/current/high-availability.html",
          ],
          [
            "Backup & restore (docs)",
            "https://www.postgresql.org/docs/current/backup.html",
          ],
          [
            "Partitioning (docs)",
            "https://www.postgresql.org/docs/current/ddl-partitioning.html",
          ],
          ["PgBouncer", "https://www.pgbouncer.org/"],
          ["The Internals of PostgreSQL (free)", "https://www.interdb.jp/pg/"],
        ],
      },
    ],
  },
  mongo: {
    cls: "t-mongo",
    ico: "🍃",
    title: "MongoDB: Fundamentals → Industry",
    intro:
      'A document database. Instead of rows in tables you store JSON-like documents in collections. Think in terms of "how will my app read this data?" rather than "how do I avoid repeating data?".',
    lessons: [
      {
        t: "Documents, collections and BSON",
        lv: "Beginner",
        b: "A <b>document</b> is a JSON-like object (stored as BSON). A <b>collection</b> is a group of documents (like a table, but no fixed schema). Every document has a unique <code>_id</code>. Free cloud database: MongoDB Atlas M0. Tools: <code>mongosh</code>, Compass.",
        c: `use shop
db.users.insertOne({
  name: "Ana",
  email: "ana@mail.com",
  address: { city: "Cumilla", country: "BD" },
  tags: ["student", "dev"]
})
db.users.find()`,
        r: [
          ["MongoDB University (free)", "https://learn.mongodb.com/"],
          ["Manual", "https://www.mongodb.com/docs/manual/"],
          ["Atlas free tier", "https://www.mongodb.com/atlas"],
          ["Video: MongoDB crash course", yt("mongodb full course beginners")],
        ],
      },
      {
        t: "CRUD with mongosh",
        lv: "Beginner",
        b: "<code>insertOne/insertMany</code>, <code>find</code>, <code>updateOne/updateMany</code> with operators like <code>$set</code> and <code>$inc</code>, <code>deleteOne/deleteMany</code>. Never update without an operator or you may replace the whole document.",
        c: `db.users.insertMany([{name:"Ben",age:25},{name:"Cy",age:30}])
db.users.find({ age: { $gte: 25 } }, { name: 1, _id: 0 }).sort({ age: -1 }).limit(5)
db.users.updateOne({ name: "Ben" }, { $set: { age: 26 }, $push: { tags: "new" } })
db.users.updateMany({}, { $inc: { logins: 1 } })
db.users.deleteOne({ name: "Cy" })
db.users.updateOne({ email: "x@mail.com" }, { $set: { name: "X" } }, { upsert: true })`,
        r: [
          [
            "CRUD operations (docs)",
            "https://www.mongodb.com/docs/manual/crud/",
          ],
          [
            "Query operators (docs)",
            "https://www.mongodb.com/docs/manual/reference/operator/query/",
          ],
        ],
      },
      {
        t: "Query operators, arrays and projections",
        lv: "Beginner",
        b: 'Compare: <code>$eq $gt $lt $in $ne</code>. Logic: <code>$and $or $not</code>. Arrays: <code>$all $elemMatch $size</code>. Dot notation reaches inside objects: <code>"address.city"</code>.',
        c: `db.products.find({ price: { $gt: 10, $lt: 100 }, category: { $in: ["book","pen"] } })
db.users.find({ "address.city": "Cumilla" })
db.orders.find({ items: { $elemMatch: { sku: "A1", qty: { $gte: 2 } } } })
db.users.find({ $or: [{ age: { $lt: 18 } }, { tags: "vip" }] })`,
        r: [
          [
            "Query documents (docs)",
            "https://www.mongodb.com/docs/manual/tutorial/query-documents/",
          ],
        ],
      },
      {
        t: "Data modeling: embed vs reference",
        lv: "Intermediate",
        b: "The #1 MongoDB skill. <b>Embed</b> data that is read together and belongs to one parent (order + its line items). <b>Reference</b> (store an id) when data is shared, huge or changes independently (user referenced by many posts). Rule of thumb: <i>data that is accessed together should be stored together</i>. Avoid unbounded arrays (a post with 1M comments inside it breaks the 16 MB document limit).",
        c: `// EMBED: one read gets everything
{ _id: 1, customer: "Ana", items: [ {sku:"A1", qty:2, price:9.5}, {sku:"B7", qty:1, price:20} ] }

// REFERENCE: comments live in their own collection
posts:    { _id: 10, title: "Hello", authorId: 3 }
comments: { _id: 99, postId: 10, text: "Nice!", createdAt: ISODate() }

// $lookup is the (slower) join, so design to avoid needing it everywhere`,
        r: [
          [
            "Data modeling (docs)",
            "https://www.mongodb.com/docs/manual/data-modeling/",
          ],
          [
            "Schema design patterns (blog series)",
            "https://www.mongodb.com/blog/post/building-with-patterns-a-summary",
          ],
          [
            "Video: schema design",
            yt("mongodb schema design embed vs reference"),
          ],
        ],
      },
      {
        t: "Aggregation pipeline",
        lv: "Intermediate",
        b: "Data flows through <b>stages</b> like a factory belt: <code>$match</code> (filter) → <code>$group</code> (summarise) → <code>$sort</code> → <code>$project</code> → <code>$lookup</code> (join) → <code>$limit</code>. Put <code>$match</code> first so indexes help.",
        c: `db.orders.aggregate([
  { $match: { status: "paid", createdAt: { $gte: ISODate("2026-01-01") } } },
  { $unwind: "$items" },
  { $group: { _id: "$items.sku", units: { $sum: "$items.qty" },
              revenue: { $sum: { $multiply: ["$items.qty", "$items.price"] } } } },
  { $sort: { revenue: -1 } },
  { $limit: 5 },
  { $lookup: { from: "products", localField: "_id", foreignField: "sku", as: "product" } }
])`,
        r: [
          [
            "Aggregation (docs)",
            "https://www.mongodb.com/docs/manual/core/aggregation-pipeline/",
          ],
          ["Practice on MongoDB University", "https://learn.mongodb.com/"],
        ],
      },
      {
        t: "Indexes (the ESR rule)",
        lv: "Intermediate",
        b: "Without an index MongoDB scans the whole collection. Create indexes for your query shapes. For compound indexes follow <b>ESR</b>: <b>E</b>quality fields first, then <b>S</b>ort fields, then <b>R</b>ange fields. Also: unique, TTL (auto-delete old data), text, geospatial.",
        c: `db.orders.createIndex({ userId: 1, createdAt: -1 })
db.users.createIndex({ email: 1 }, { unique: true })
db.sessions.createIndex({ createdAt: 1 }, { expireAfterSeconds: 3600 })   // TTL
db.orders.find({ userId: 5 }).sort({ createdAt: -1 }).explain("executionStats")
// check: IXSCAN (good) vs COLLSCAN (bad), totalDocsExamined vs nReturned`,
        r: [
          ["Indexes (docs)", "https://www.mongodb.com/docs/manual/indexes/"],
          [
            "ESR guideline",
            "https://www.mongodb.com/docs/manual/tutorial/equality-sort-range-guideline/",
          ],
        ],
      },
      {
        t: "Validation, transactions and consistency",
        lv: "Advanced",
        b: '"Schemaless" does not mean "no rules": use <b>JSON Schema validation</b>. Single-document writes are atomic already. Multi-document <b>transactions</b> exist (replica set needed) but cost performance, so good modeling should make them rare. Choose <i>write concern</i> and <i>read concern</i> for durability vs speed.',
        c: `db.createCollection("accounts", { validator: { $jsonSchema: {
  bsonType: "object", required: ["owner","balance"],
  properties: { owner: { bsonType: "string" }, balance: { bsonType: "decimal", minimum: 0 } }
}}})

const s = db.getMongo().startSession();
s.startTransaction();
s.getDatabase("bank").accounts.updateOne({_id:1},{$inc:{balance:-100}});
s.getDatabase("bank").accounts.updateOne({_id:2},{$inc:{balance:100}});
s.commitTransaction();`,
        r: [
          [
            "Transactions (docs)",
            "https://www.mongodb.com/docs/manual/core/transactions/",
          ],
          [
            "Schema validation (docs)",
            "https://www.mongodb.com/docs/manual/core/schema-validation/",
          ],
        ],
      },
      {
        t: "Industry level: replica sets, sharding, Atlas, backups",
        lv: "Industry",
        b: "<ul><li><b>Replica set</b>: 1 primary + secondaries. Automatic failover = high availability.</li><li><b>Sharding</b>: split data across machines by a <b>shard key</b>. A bad shard key (e.g. increasing timestamp) creates a hot shard, so choose high-cardinality, evenly spread keys.</li><li><b>Atlas</b>: managed service with backups, monitoring, search, vector search.</li><li><b>Change streams</b>: react to data changes in real time.</li><li>Watch for: unbounded arrays, missing indexes, huge documents, too many <code>$lookup</code>.</li></ul>",
        c: `sh.enableSharding("shop")
sh.shardCollection("shop.events", { userId: "hashed" })

const cs = db.orders.watch([{ $match: { operationType: "insert" } }]);
cs.next();   // gets each new order as it happens`,
        r: [
          [
            "Replication (docs)",
            "https://www.mongodb.com/docs/manual/replication/",
          ],
          ["Sharding (docs)", "https://www.mongodb.com/docs/manual/sharding/"],
          [
            "Change streams (docs)",
            "https://www.mongodb.com/docs/manual/changeStreams/",
          ],
        ],
      },
    ],
  },
  redis: {
    cls: "t-redis",
    ico: "⚡",
    title: "Redis: Fundamentals → Industry",
    intro:
      "An in-memory data store: ridiculously fast (microseconds) because data lives in RAM. Used as a cache, session store, rate limiter, leaderboard, queue and message broker. Usually sits <i>next to</i> a main database, not instead of it.",
    lessons: [
      {
        t: "What Redis is and basic commands",
        lv: "Beginner",
        b: "Redis is a giant dictionary: <b>key → value</b>. Keys are strings; values can be strings, hashes, lists, sets, sorted sets and more. Run it with Docker, or use a free cloud instance (Redis Cloud, Upstash).",
        c: `docker run --name r -p 6379:6379 -d redis:7
docker exec -it r redis-cli

SET greeting "hello"
GET greeting
INCR visits            # atomic counter
EXISTS greeting
DEL greeting
KEYS user:*            # fine in dev, NEVER in production (use SCAN)`,
        r: [
          ["Redis docs", "https://redis.io/docs/latest/"],
          ["Redis University (free)", "https://university.redis.io/"],
          ["Redis Learn", "https://redis.io/learn"],
          ["Try free cloud", "https://redis.io/try-free/"],
          ["Upstash (free serverless)", "https://upstash.com/"],
          ["Video: Redis crash course", yt("redis crash course beginners")],
        ],
      },
      {
        t: "Core data structures",
        lv: "Beginner",
        b: "Choose the structure that matches the job. <b>String</b>: cache/counter. <b>Hash</b>: an object (user profile). <b>List</b>: queue/recent items. <b>Set</b>: unique things (tags, online users). <b>Sorted set</b>: leaderboard/ranking. Others: bitmaps, HyperLogLog (approx unique counts), geo, streams.",
        c: `HSET user:1 name "Ana" age 22
HGETALL user:1

LPUSH recent:1 "post:9" ; LRANGE recent:1 0 9
SADD online "u1" "u2" ; SISMEMBER online "u1"

ZADD leaderboard 1500 "ana" 1200 "ben" 1800 "cy"
ZREVRANGE leaderboard 0 2 WITHSCORES      # top 3
ZREVRANK leaderboard "ana"`,
        r: [
          [
            "Data types (docs)",
            "https://redis.io/docs/latest/develop/data-types/",
          ],
          ["Commands reference", "https://redis.io/docs/latest/commands/"],
        ],
      },
      {
        t: "Expiry (TTL) and caching patterns",
        lv: "Intermediate",
        b: 'Cache = keep a copy of slow data somewhere fast. <b>Cache-aside</b> (most common): check Redis → miss? read DB → store in Redis with a TTL → return. Hard parts: <b>invalidation</b> (when data changes, delete the key) and <b>stampede</b> (1000 requests miss at once: use locks or jittered TTLs). Try the <a href="#cache-lab">Cache Lab</a>.',
        c: `SET user:1 "{...json...}" EX 300       # expires in 5 minutes
TTL user:1
SET lock:report "1" NX EX 30           # only set if not exists, a tiny lock

# cache-aside pseudo-code
data = redis.get(key)
if data is None:
    data = db.query(...)
    redis.set(key, data, ex=300)
return data`,
        r: [
          [
            "Caching patterns (docs)",
            "https://redis.io/docs/latest/develop/use/patterns/",
          ],
          [
            "Key eviction (docs)",
            "https://redis.io/docs/latest/develop/reference/eviction/",
          ],
          [
            "Video: caching strategies",
            yt("caching strategies cache aside write through explained"),
          ],
        ],
      },
      {
        t: "Sessions, rate limiting and counters",
        lv: "Intermediate",
        b: "Real jobs Redis does every day. <b>Session store</b>: hash with TTL. <b>Rate limiter</b>: count requests per user per window. Because <code>INCR</code> is atomic, no two servers can miscount.",
        c: `# fixed-window rate limit: 100 requests/minute per user
key = "rl:user42:" + current_minute
n = INCR key
if n == 1: EXPIRE key 60
if n > 100: reject (HTTP 429)

# session
HSET sess:abc123 userId 42 role "admin"
EXPIRE sess:abc123 86400`,
        r: [
          [
            "Rate limiter pattern (docs)",
            "https://redis.io/learn/howtos/ratelimiting",
          ],
          [
            "Video: rate limiting",
            yt("rate limiting algorithms token bucket sliding window"),
          ],
        ],
      },
      {
        t: "Pub/Sub, Streams and queues",
        lv: "Advanced",
        b: "<b>Pub/Sub</b>: fire-and-forget broadcast (chat typing indicators). Messages are lost if nobody listens. <b>Streams</b>: durable log with consumer groups, so workers share work and acknowledge messages (like a mini Kafka). For job queues in Node look at BullMQ (built on Redis).",
        c: `SUBSCRIBE news         # in one terminal
PUBLISH news "hi"      # in another

XADD orders * userId 42 total 99
XGROUP CREATE orders workers $ MKSTREAM
XREADGROUP GROUP workers w1 COUNT 10 STREAMS orders >
XACK orders workers 1700000000000-0`,
        r: [
          [
            "Pub/Sub (docs)",
            "https://redis.io/docs/latest/develop/interact/pubsub/",
          ],
          [
            "Streams (docs)",
            "https://redis.io/docs/latest/develop/data-types/streams/",
          ],
          ["BullMQ", "https://docs.bullmq.io/"],
        ],
      },
      {
        t: "Persistence: RDB and AOF",
        lv: "Advanced",
        b: "RAM is wiped on restart, so Redis can save to disk. <b>RDB</b>: snapshots every N minutes (fast restart, may lose recent data). <b>AOF</b>: log every write (safer, bigger). Many production setups use both. If Redis is <i>only a cache</i>, you can disable persistence.",
        c: `# redis.conf
save 900 1
appendonly yes
appendfsync everysec     # lose at most ~1s of writes`,
        r: [
          [
            "Persistence (docs)",
            "https://redis.io/docs/latest/operate/oss_and_stack/management/persistence/",
          ],
        ],
      },
      {
        t: "Industry level: replication, Sentinel, Cluster, memory policy",
        lv: "Industry",
        b: "<ul><li><b>Replication</b>: replicas copy the primary for read scaling and backup.</li><li><b>Sentinel</b>: watches the primary and auto-promotes a replica if it dies.</li><li><b>Cluster</b>: shards keys across nodes (16384 hash slots) when data is bigger than one machine's RAM.</li><li><b>maxmemory + eviction</b>: when full, evict by policy (<code>allkeys-lru</code> is typical for caches).</li><li><b>Big keys / hot keys</b> and slow commands (<code>KEYS</code>, giant <code>SMEMBERS</code>) block the single main thread. Use <code>SCAN</code>, pipelines, and keep values small.</li><li>Distributed locks: use with care, understand their failure modes.</li></ul>",
        c: `maxmemory 2gb
maxmemory-policy allkeys-lru

redis-cli --bigkeys
SLOWLOG GET 10
INFO memory`,
        r: [
          [
            "Scaling with Cluster (docs)",
            "https://redis.io/docs/latest/operate/oss_and_stack/management/scaling/",
          ],
          [
            "Sentinel (docs)",
            "https://redis.io/docs/latest/operate/oss_and_stack/management/sentinel/",
          ],
          [
            "Distributed locks (docs)",
            "https://redis.io/docs/latest/develop/use/patterns/distributed-locks/",
          ],
        ],
      },
    ],
  },
  prisma: {
    cls: "t-prisma",
    ico: "🔺",
    title: "Prisma ORM with PostgreSQL & MongoDB",
    intro:
      "An ORM maps database tables to objects in your code. Prisma gives you a readable schema file, type-safe queries (autocomplete + compile errors) and migrations. Prisma's setup details change between major versions, so for install and client creation always follow the current Getting Started guide, then use the concepts below.",
    lessons: [
      {
        t: "Setup and the schema file",
        lv: "Beginner",
        b: "<code>schema.prisma</code> is the single source of truth: datasource (which DB), generator (the client), and models (your tables). Workflow: edit schema → migrate → use the generated client.",
        c: `npm init -y
npm install prisma --save-dev
npm install @prisma/client
npx prisma init            # creates prisma/schema.prisma and an env file

// prisma/schema.prisma
datasource db {
  provider = "postgresql"
}
generator client {
  provider = "prisma-client-js"   // newer versions use a new generator: follow the docs
}`,
        r: [
          [
            "Prisma Getting Started (follow this first)",
            "https://www.prisma.io/docs/getting-started",
          ],
          ["Prisma docs", "https://www.prisma.io/docs"],
          [
            "Video: Prisma crash course",
            yt("prisma orm crash course postgresql"),
          ],
        ],
      },
      {
        t: "Models and relations",
        lv: "Beginner",
        b: "A model = a table. Types map to DB columns. <code>@id</code> primary key, <code>@unique</code>, <code>@default</code>. Relations use <code>@relation</code> with a foreign-key field. One-to-many, one-to-one and many-to-many are all supported.",
        c: `model User {
  id      Int      @id @default(autoincrement())
  email   String   @unique
  name    String?
  posts   Post[]
  profile Profile?
  createdAt DateTime @default(now())
}
model Post {
  id        Int      @id @default(autoincrement())
  title     String
  published Boolean  @default(false)
  author    User     @relation(fields: [authorId], references: [id])
  authorId  Int
  tags      Tag[]            // implicit many-to-many
  @@index([authorId])
}
model Tag { id Int @id @default(autoincrement()) name String @unique posts Post[] }
model Profile { id Int @id @default(autoincrement()) bio String user User @relation(fields:[userId], references:[id]) userId Int @unique }`,
        r: [
          ["Schema reference", "https://www.prisma.io/docs/orm/prisma-schema"],
          [
            "Relations",
            "https://www.prisma.io/docs/orm/prisma-schema/data-model/relations",
          ],
        ],
      },
      {
        t: "Migrations",
        lv: "Intermediate",
        b: "<code>migrate dev</code> creates SQL migration files from schema changes and applies them in development (commit them to git!). In production use <code>migrate deploy</code>, which only applies existing migrations and never resets data.",
        c: `npx prisma migrate dev --name init       # dev: create + apply + generate client
npx prisma migrate deploy                # production / CI
npx prisma migrate status
npx prisma studio                        # visual data browser
npx prisma db seed                       # run your seed script`,
        r: [
          ["Prisma Migrate", "https://www.prisma.io/docs/orm/prisma-migrate"],
          [
            "Seeding",
            "https://www.prisma.io/docs/orm/prisma-migrate/workflows/seeding",
          ],
        ],
      },
      {
        t: "CRUD with Prisma Client",
        lv: "Beginner",
        b: "Each model gets methods: <code>create, createMany, findUnique, findFirst, findMany, update, updateMany, upsert, delete, deleteMany, count, aggregate, groupBy</code>.",
        c: `const user = await prisma.user.create({ data: { email: "ana@mail.com", name: "Ana" } });

const users = await prisma.user.findMany({
  where: { name: { contains: "a", mode: "insensitive" } },
  orderBy: { createdAt: "desc" },
  take: 10, skip: 0,                    // pagination
});

await prisma.user.update({ where: { id: 1 }, data: { name: "Ana K" } });
await prisma.user.upsert({ where: { email: "x@m.com" }, update: {}, create: { email: "x@m.com" } });
await prisma.user.delete({ where: { id: 2 } });

const stats = await prisma.post.groupBy({ by: ["authorId"], _count: { _all: true } });`,
        r: [
          [
            "CRUD reference",
            "https://www.prisma.io/docs/orm/prisma-client/queries/crud",
          ],
          [
            "Filtering & sorting",
            "https://www.prisma.io/docs/orm/prisma-client/queries/filtering-and-sorting",
          ],
        ],
      },
      {
        t: "Relation queries: include, select, nested writes",
        lv: "Intermediate",
        b: "<code>include</code> loads related rows; <code>select</code> picks only the fields you need (smaller, faster). Nested writes create related records in one call. Beware the <b>N+1 problem</b>: looping and querying inside the loop. Use <code>include</code> instead.",
        c: `const feed = await prisma.post.findMany({
  where: { published: true },
  select: { id: true, title: true, author: { select: { name: true } }, tags: true },
});

await prisma.user.create({
  data: { email: "b@m.com", posts: { create: [{ title: "Hello" }, { title: "World" }] } },
});

// N+1 (bad):  for (const u of users) await prisma.post.findMany({ where:{authorId:u.id} })
// fix:        prisma.user.findMany({ include: { posts: true } })`,
        r: [
          [
            "Relation queries",
            "https://www.prisma.io/docs/orm/prisma-client/queries/relation-queries",
          ],
          [
            "Query optimization",
            "https://www.prisma.io/docs/orm/prisma-client/queries/query-optimization-performance",
          ],
        ],
      },
      {
        t: "Transactions",
        lv: "Advanced",
        b: "Use the array form for independent operations, or the interactive form when later steps depend on earlier results. Everything rolls back if anything throws. Keep transactions short.",
        c: `// batch
await prisma.$transaction([
  prisma.account.update({ where:{id:1}, data:{ balance:{ decrement:100 } } }),
  prisma.account.update({ where:{id:2}, data:{ balance:{ increment:100 } } }),
]);

// interactive
await prisma.$transaction(async (tx) => {
  const from = await tx.account.findUniqueOrThrow({ where:{ id:1 } });
  if (from.balance < 100) throw new Error("Insufficient funds");
  await tx.account.update({ where:{id:1}, data:{ balance:{ decrement:100 } } });
  await tx.account.update({ where:{id:2}, data:{ balance:{ increment:100 } } });
}, { isolationLevel: "Serializable" });`,
        r: [
          [
            "Transactions",
            "https://www.prisma.io/docs/orm/prisma-client/queries/transactions",
          ],
        ],
      },
      {
        t: "Prisma with MongoDB",
        lv: "Intermediate",
        b: "Same client API, but the datasource is <code>mongodb</code>, ids are <code>ObjectId</code>, and there are no SQL migrations: use <code>prisma db push</code> to sync indexes. MongoDB needs a replica set for transactions (Atlas has one by default). Embedded documents use <code>type</code> blocks.",
        c: `datasource db { provider = "mongodb" }

model Order {
  id       String   @id @default(auto()) @map("_id") @db.ObjectId
  customer String
  items    Item[]               // embedded documents
  createdAt DateTime @default(now())
}
type Item { sku String qty Int price Float }`,
        r: [
          [
            "Prisma + MongoDB",
            "https://www.prisma.io/docs/orm/overview/databases/mongodb",
          ],
          ["Video: Prisma MongoDB", yt("prisma mongodb tutorial")],
        ],
      },
      {
        t: "Industry level: raw SQL, pooling, errors, testing, deploy",
        lv: "Industry",
        b: "<ul><li><b>Create ONE PrismaClient</b> and reuse it (hot-reload in Next.js creates many, so use the global singleton pattern).</li><li><b>Serverless</b>: functions open many connections, so use a pooler (PgBouncer, Neon pooled URL) or Prisma's driver-adapter / Accelerate options.</li><li><b>Raw SQL</b> with <code>$queryRaw</code> tagged templates (still parameterized, so safe) for things the ORM cannot express.</li><li>Handle error codes: <code>P2002</code> unique violation, <code>P2025</code> record not found.</li><li>Index fields you filter on: add <code>@@index</code>.</li><li>CI: run <code>migrate deploy</code> before starting the app; test against a real DB container.</li></ul>",
        c: `// lib/prisma.ts : singleton for Next.js dev
import { PrismaClient } from "@prisma/client";
const g = globalThis as unknown as { prisma?: PrismaClient };
export const prisma = g.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== "production") g.prisma = prisma;

const rows = await prisma.$queryRaw\`SELECT date_trunc('day', "createdAt") d, count(*) FROM "Post" GROUP BY 1\`;

try { await prisma.user.create({ data }) }
catch (e: any) { if (e.code === "P2002") /* email already used */ }`,
        r: [
          [
            "Connection management",
            "https://www.prisma.io/docs/orm/prisma-client/setup-and-configuration/databases-connections",
          ],
          [
            "Error reference",
            "https://www.prisma.io/docs/orm/reference/error-reference",
          ],
          [
            "Raw queries",
            "https://www.prisma.io/docs/orm/prisma-client/using-raw-sql",
          ],
        ],
      },
    ],
  },
};

/* ===== PROJECTS (database-focused) ===== */
const PROJECTS = [
  {
    t: "Library Management System",
    lv: "Beginner",
    db: "PostgreSQL",
    goal: "Practice tables, keys, joins, constraints.",
    skills: ["ERD design", "FK & constraints", "JOIN", "GROUP BY"],
    steps: [
      "Design tables: books, authors, book_authors (many-to-many), members, loans.",
      "Add constraints: unique ISBN, a member cannot borrow if 3 books are overdue (use a query/trigger).",
      "Seed 100+ rows with generate_series or a script.",
      "Write 15 queries: overdue books, most borrowed authors, members who never borrowed (LEFT JOIN).",
      "Add indexes and compare EXPLAIN before/after.",
    ],
    stretch: "Add a fines table and a view that calculates fines.",
  },
  {
    t: "E-commerce Schema and Analytics",
    lv: "Intermediate",
    db: "PostgreSQL + Prisma",
    goal: "Real schema design plus reporting with CTEs and window functions.",
    skills: [
      "Normalization",
      "Transactions",
      "Window functions",
      "Prisma relations",
    ],
    steps: [
      "Model customers, products, categories, orders, order_items, payments, inventory.",
      'Implement "place order" as ONE transaction: check stock, decrement, insert order + items.',
      "Prove no overselling: run 50 parallel purchases of the last item (use FOR UPDATE).",
      "Write analytics: monthly revenue + running total, top 3 products per category, repeat-customer rate.",
      "Rebuild the data layer in Prisma and compare the experience.",
    ],
    stretch: "Materialized view for the daily sales dashboard.",
  },
  {
    t: "Bank Transfer Simulator",
    lv: "Intermediate",
    db: "PostgreSQL",
    goal: "Truly understand ACID, locks and isolation.",
    skills: ["Transactions", "Isolation levels", "Deadlocks", "Idempotency"],
    steps: [
      "Create accounts and a ledger table (double-entry: every transfer = 2 ledger rows).",
      "Write a transfer function inside a transaction.",
      "Reproduce a lost update with two psql sessions, then fix it with FOR UPDATE.",
      "Reproduce a deadlock (A→B and B→A) and fix it by locking in id order.",
      "Add an idempotency_key unique column so a retried request never double-charges.",
    ],
    stretch:
      "Verify invariants: SUM(ledger) = 0 after 10,000 random concurrent transfers.",
  },
  {
    t: "Blog / CMS with Comments",
    lv: "Beginner",
    db: "MongoDB",
    goal: "Document modeling and aggregation.",
    skills: ["Embed vs reference", "Indexes", "Aggregation", "TTL"],
    steps: [
      "Design posts (embed tags, reference author) and comments (separate collection).",
      "Build CRUD with mongosh then with Prisma (MongoDB).",
      "Aggregation: top authors, posts per tag, comments per day.",
      "Add a text index for search and a compound index for the feed (ESR rule).",
      "Add a TTL-indexed drafts collection that auto-deletes after 7 days.",
    ],
    stretch:
      "Show what happens when comments are embedded and a post gets 100k of them.",
  },
  {
    t: "URL Shortener with Cache",
    lv: "Intermediate",
    db: "PostgreSQL + Redis",
    goal: "Your first multi-database system: durable store + fast cache.",
    skills: ["Cache-aside", "TTL", "Unique keys", "Counters"],
    steps: [
      "Postgres table: urls(id, code UNIQUE, long_url, created_at, clicks).",
      "Generate short codes (base62 of the id, or random with collision retry).",
      "Redirect endpoint: Redis first (GET code), on miss read Postgres and SET with TTL.",
      "Count clicks with Redis INCR, flush to Postgres every minute (write-behind).",
      "Benchmark with autocannon/k6: with cache vs without.",
    ],
    stretch: "Add per-IP rate limiting in Redis.",
  },
  {
    t: "Leaderboard and Rate Limiter",
    lv: "Intermediate",
    db: "Redis",
    goal: "Master Redis data structures by building real features.",
    skills: ["Sorted sets", "Atomic ops", "Lua / pipelines", "Expiry"],
    steps: [
      "Game leaderboard with ZADD/ZREVRANGE; show a player's rank and the 5 players around them.",
      "Daily/weekly boards via keys with date suffix + EXPIRE.",
      "Sliding-window rate limiter using a sorted set of timestamps.",
      "Session store with hashes and TTL.",
      'Pub/Sub: broadcast "new high score" to connected clients.',
    ],
    stretch: "Make the rate limiter atomic with a Lua script.",
  },
  {
    t: "Social Feed (Polyglot)",
    lv: "Advanced",
    db: "PostgreSQL + MongoDB + Redis",
    goal: "Use the right database for each job.",
    skills: ["Fan-out", "Denormalization", "Caching", "Pagination"],
    steps: [
      "Postgres: users, follows (source of truth for relationships).",
      "MongoDB: posts with embedded media + reaction counts.",
      "Redis: each user's home feed as a list/sorted set of post ids (fan-out on write).",
      "Cursor pagination (not OFFSET) for infinite scroll.",
      "Handle celebrity users (million followers) with fan-out on read instead.",
    ],
    stretch: "Explain each DB choice in a README with trade-offs.",
  },
  {
    t: "Multi-tenant SaaS with Row-Level Security",
    lv: "Advanced",
    db: "PostgreSQL + Prisma",
    goal: "Industry-grade isolation of customer data.",
    skills: ["RLS", "Roles", "Migrations", "Prisma extensions"],
    steps: [
      "Add tenant_id to every table and indexes that start with tenant_id.",
      "Create RLS policies and a restricted app role.",
      "Set app.tenant_id per request inside a transaction.",
      "Write tests proving tenant A can never read tenant B.",
      "Document your migration strategy (zero-downtime changes).",
    ],
    stretch: "Add audit logging with triggers.",
  },
  {
    t: "Seat / Ticket Booking at High Concurrency",
    lv: "Industry",
    db: "PostgreSQL + Redis",
    goal: "Handle thousands of people grabbing limited seats without overselling.",
    skills: ["Locks", "Queues", "Idempotency", "Load testing"],
    steps: [
      "Schema: events, seats, bookings with UNIQUE(event_id, seat_id).",
      "Approach A: row lock (FOR UPDATE). Approach B: optimistic update WHERE status = available. Approach C: Redis queue + worker.",
      "Load test all three with k6 and chart throughput and errors.",
      "Add seat hold with expiry (Redis TTL) before payment.",
      "Write a short report: which approach wins and why.",
    ],
    stretch: "Virtual waiting room to protect the database during spikes.",
  },
  {
    t: "Capstone: Ride-Sharing Backend",
    lv: "Industry",
    db: "PostgreSQL (PostGIS) + Redis + MongoDB",
    goal: "Put everything together and write a design document.",
    skills: ["Geo queries", "Real-time data", "Partitioning", "Observability"],
    steps: [
      "Postgres/PostGIS: riders, drivers, trips, payments.",
      "Redis GEO: live driver locations (GEOADD / GEOSEARCH).",
      "MongoDB: trip event logs and driver telemetry.",
      "Partition the trips table by month; add pg_stat_statements monitoring.",
      "Write a 2-page design doc: data model, scaling plan, failure scenarios, backups.",
    ],
    stretch:
      "Deploy on free tiers (Neon + Upstash + Atlas) and publish a demo.",
  },
];

/* ===== SYSTEM DESIGN (explained simply) ===== */
const SYSTEMS = [
  {
    t: "URL Shortener (like bit.ly)",
    lv: "Beginner",
    analogy:
      "A coat-check desk: you give a long coat (URL), get a tiny ticket (short code). Show the ticket later, get the coat back.",
    need: "Create short link. Open short link → redirect. Very read-heavy (100 reads per 1 write).",
    db: "PostgreSQL for durable storage (needs a unique key and strong consistency on the code) + Redis cache for hot links. Alternative at huge scale: key-value store (DynamoDB/Cassandra).",
    schema: `urls(id bigint PK, code varchar(8) UNIQUE, long_url text, user_id, created_at, expires_at)`,
    flow: [
      "POST /shorten → insert row → code = base62(id) (7 chars gives 3.5 trillion links).",
      "GET /abc123 → check Redis → on miss read DB → cache it → HTTP 301/302 redirect.",
      "Clicks: INCR in Redis, batch to DB (analytics must not slow the redirect).",
    ],
    scale: [
      "Cache hot codes (Pareto: 20% of links get 80% of traffic).",
      "Read replicas for reads; shard by code hash if the table grows past a few billion rows.",
      "Use a key generator service/ID ranges so many servers never create the same code.",
    ],
    trade:
      "Base62 of an auto-increment id is guessable (code 1000 → 1001). If that matters, use random codes + retry on collision. 301 is cached by browsers (less load but you lose click stats), 302 is not.",
  },
  {
    t: "Rate Limiter",
    lv: "Beginner",
    analogy:
      'A bouncer with a clicker: "only 100 people per minute". Everyone else waits outside.',
    need: "Allow max N requests per user per time window, across many servers, with tiny latency.",
    db: "Redis: in-memory (fast), atomic INCR, built-in expiry. A normal database would be too slow and too heavy.",
    schema: `key = "rl:{userId}:{window}"   value = counter   TTL = window length`,
    flow: [
      "Request arrives → INCR key → if first hit, set EXPIRE.",
      "Count above limit → return 429 Too Many Requests (+ Retry-After header).",
      "Algorithms: fixed window (simple, burst at edges), sliding window log (accurate, more memory), token bucket (smooth, allows bursts).",
    ],
    scale: [
      "Make INCR+EXPIRE atomic with a Lua script.",
      "Redis Cluster: shard by user id.",
      "If Redis is down: fail open (allow) or fail closed (block) is a business decision.",
    ],
    trade:
      "Fixed window is easiest but a user can send 2x the limit around a window boundary. Token bucket fixes that.",
  },
  {
    t: "Chat App (like WhatsApp)",
    lv: "Intermediate",
    analogy:
      "A post office with instant delivery: if you are home the letter is handed over at once; if not, it waits in your mailbox.",
    need: "1-to-1 and group chat, delivered fast, message history, online status, delivered/read ticks.",
    db: "Messages: a write-heavy, time-ordered store such as Cassandra/ScyllaDB or MongoDB, partitioned by conversation_id. Users/groups: PostgreSQL. Presence & routing: Redis.",
    schema: `messages(conversation_id, message_id (time-sortable), sender_id, body, created_at)   -- partition key: conversation_id
users(id, name, ...) in Postgres
Redis: presence:{userId} = "online" (TTL 30s, refreshed by heartbeat)`,
    flow: [
      "Client keeps a WebSocket open to a chat server.",
      "Sender → server stores the message → looks up which server holds the receiver's connection (Redis map) → pushes it.",
      "Receiver offline → message stays stored + push notification; fetched on reconnect.",
      "Ack messages for delivered/read ticks.",
    ],
    scale: [
      "Stateless chat servers behind a load balancer; Redis Pub/Sub or Kafka to route between servers.",
      "Shard messages by conversation; recent messages are hot, old ones go cold.",
      "Large groups: fan-out on read, not write.",
    ],
    trade:
      "Per-conversation ordering is easy; global ordering is impossible and unnecessary.",
  },
  {
    t: "News Feed (like Twitter / Instagram)",
    lv: "Intermediate",
    analogy:
      "Newspaper delivery: either the paperboy drops a copy in every follower's mailbox when you publish (fan-out on write), or followers go and collect from each friend's shelf when they wake up (fan-out on read).",
    need: "Show a personalised, recent-first feed quickly. Users follow many people; some have millions of followers.",
    db: "PostgreSQL/Graph for follow relationships. Posts in a document/wide-column store. Each user's precomputed feed in Redis (sorted set of post ids).",
    schema: `follows(follower_id, followee_id)
posts(id, author_id, body, created_at)
Redis ZSET feed:{userId}  score = timestamp  member = postId`,
    flow: [
      "Publish post → store it → push post id into each follower's Redis feed (fan-out on write).",
      "Read feed → ZREVRANGE feed:me 0 19 → fetch posts by ids → return.",
      "Celebrities: skip fan-out; merge their latest posts at read time (hybrid).",
    ],
    scale: [
      "Cap feed length (keep latest ~800 ids).",
      "Cursor pagination using the last seen id/time (offset gets slow).",
      "Cache post bodies separately from feeds.",
    ],
    trade:
      "Fan-out on write = fast reads, slow writes for celebrities. Hybrid gives the best of both.",
  },
  {
    t: "Flash Sale / Seat Booking (no overselling)",
    lv: "Advanced",
    analogy:
      "1,000 people rush to a ticket counter with 100 tickets. You need one clear line and a rule that the last ticket can only be sold once.",
    need: "Massive spike, limited stock, zero oversell, fair, fast, payment may fail.",
    db: "PostgreSQL as the source of truth (ACID, locks). Redis in front for queueing, stock pre-check and temporary seat holds.",
    schema: `seats(event_id, seat_id, status, held_until, PRIMARY KEY(event_id, seat_id))
bookings(id, user_id, seat_id, idempotency_key UNIQUE, status)`,
    flow: [
      "Optional waiting room: users get a queue position (Redis), admitted in batches.",
      'Hold seat: UPDATE seats SET status="held", held_until=now()+5min WHERE seat_id=? AND status="free" (affected rows = 1 means you won).',
      'Payment success → status="sold". Fail/timeout → hold expires and seat returns.',
      "idempotency_key makes retries safe.",
    ],
    scale: [
      'Redis DECR for a fast "is anything left?" gate that protects the DB.',
      "Queue + workers smooth the spike; autoscale the app layer, not the DB.",
      "Shard by event_id.",
    ],
    trade:
      "Pessimistic locks (FOR UPDATE) are simplest but serialize; the conditional UPDATE is faster. The database must stay the final judge, Redis alone can lose data.",
  },
  {
    t: "Ride Sharing (like Uber): live locations",
    lv: "Advanced",
    analogy:
      "A big map with moving stickers. When someone asks for a ride you look only at stickers near them, not the whole world.",
    need: "Track millions of moving drivers, find nearest ones in ms, match, then store trips reliably.",
    db: "Redis GEO / geohash grid for live locations (very high write rate, short lived). PostgreSQL + PostGIS for trips, users, payments. Kafka/streams for location events.",
    schema: `Redis: GEOADD drivers lon lat driverId       GEOSEARCH drivers FROMLONLAT x y BYRADIUS 3 km
trips(id, rider_id, driver_id, status, pickup, dropoff, fare, created_at)  -- Postgres, partitioned by month`,
    flow: [
      "Drivers send location every ~4 s → update Redis (overwrite; no history needed live).",
      "Ride request → GEOSEARCH nearby free drivers → offer to best one → accept → create trip row (transaction).",
      "Trip events written to a log/stream for analytics and fares.",
    ],
    scale: [
      "Shard the map by city/region (geohash prefix).",
      "Throttle location updates when the driver is stationary.",
      "Keep durable trip data separate from ephemeral location data.",
    ],
    trade:
      "Live location can be slightly stale and lost on restart (acceptable). Payments and trips must never be.",
  },
  {
    t: "Notification System",
    lv: "Intermediate",
    analogy:
      "A mailroom: many departments drop letters in; sorters decide email, SMS or push; retry if the courier fails.",
    need: "Send millions of email/SMS/push messages reliably, respect user preferences, do not spam or duplicate.",
    db: "PostgreSQL for templates, preferences and delivery log. Message queue (Redis Streams/BullMQ/Kafka/SQS) for work.",
    schema: `notifications(id, user_id, channel, payload, status, attempts, idempotency_key UNIQUE, created_at)
preferences(user_id, channel, enabled, quiet_hours)`,
    flow: [
      "Service calls the API → validate → check preferences → enqueue.",
      "Workers per channel pull jobs, call provider (email/SMS), update status.",
      "Failure → retry with exponential backoff → dead-letter queue after N tries.",
    ],
    scale: [
      "Separate queues/priorities (OTP codes first, marketing last).",
      "Rate limit per provider.",
      "Idempotency key stops duplicates when retries happen.",
    ],
    trade:
      "At-least-once delivery (may duplicate, never lose) + idempotency is simpler than exactly-once.",
  },
];

const CONCEPTS = [
  [
    "ACID",
    "Atomic (all or nothing), Consistent (rules always hold), Isolated (transactions do not trip over each other), Durable (committed = survives a crash). What relational databases are famous for.",
    "Like a bank transfer: money leaves A and arrives at B, or nothing happens.",
  ],
  [
    "CAP theorem",
    "When the network splits, a distributed system must choose Consistency (everyone sees the same data) or Availability (always answer). Partition tolerance is not optional in real networks.",
    "Two bank branches lose their phone line: refuse withdrawals (consistent) or allow them and reconcile later (available).",
  ],
  [
    "Indexing",
    "An extra sorted structure that lets the DB jump to rows. Speeds up reads, slows down writes, costs storage.",
    "The index at the back of a textbook.",
  ],
  [
    "Replication",
    "Copying data to other servers. Gives high availability and read scaling. Async replicas can be slightly behind (replication lag).",
    "A teacher's notes photocopied for helpers.",
  ],
  [
    "Sharding",
    "Splitting data across servers by a key (user id, region). Scales writes and storage, but cross-shard queries and transactions get hard. Do it last.",
    "Library split into buildings A-M and N-Z.",
  ],
  [
    "Caching",
    "Keep frequently used data in fast memory. The hard part is knowing when the copy is stale (invalidation).",
    "A water bottle on your desk instead of walking to the kitchen.",
  ],
  [
    "Eventual consistency",
    "Replicas may disagree briefly but converge. Fine for likes/views, not for balances.",
    "A rumour spreading: soon everybody knows.",
  ],
  [
    "Normalization vs denormalization",
    "Normalize = store each fact once (safe writes). Denormalize = duplicate on purpose (fast reads). Start normalized.",
    "One address book vs writing the address on every envelope.",
  ],
  [
    "SQL vs NoSQL isolation / locking",
    "Pessimistic locking blocks others while you work; optimistic locking lets everyone try and checks for conflicts at the end (version column).",
    "Locking the changing room vs checking nobody changed the item before you pay.",
  ],
  [
    "Connection pooling",
    "Opening DB connections is expensive; a pool reuses a few connections for many requests.",
    "A taxi rank instead of building a car per trip.",
  ],
];

const QUIZ = [
  {
    q: "You store bank balances and transfers. Best fit?",
    o: ["Redis only", "PostgreSQL (ACID)", "A cache", "CSV files"],
    a: 1,
    e: "Money needs strong consistency and transactions.",
  },
  {
    q: "Your product catalogue has wildly different attributes per product and changes often. Good fit?",
    o: [
      "A document DB (MongoDB) or Postgres jsonb",
      "Redis lists",
      "Excel",
      "Nothing works",
    ],
    a: 0,
    e: "Flexible documents fit varied attributes; Postgres jsonb is a great alternative.",
  },
  {
    q: "What does a LEFT JOIN return?",
    o: [
      "Only matching rows",
      "All left rows + matches from right",
      "All right rows",
      "Only unmatched rows",
    ],
    a: 1,
    e: "Unmatched left rows appear with NULLs on the right side.",
  },
  {
    q: "Which Redis structure suits a leaderboard?",
    o: ["String", "List", "Sorted set", "Bitmap"],
    a: 2,
    e: "ZADD / ZREVRANGE keeps members ordered by score.",
  },
  {
    q: "In MongoDB, when should you embed a sub-document?",
    o: [
      "When it is read together with its parent and is bounded in size",
      "Always",
      "Never",
      "When it is huge",
    ],
    a: 0,
    e: "Data accessed together should be stored together; avoid unbounded arrays.",
  },
  {
    q: "A query is slow on a 50M-row table. First step?",
    o: [
      "Buy bigger server",
      "EXPLAIN ANALYZE and check indexes",
      "Switch DB",
      "Add LIMIT 1",
    ],
    a: 1,
    e: "Measure first. Usually a missing or unusable index.",
  },
  {
    q: "In Prisma, looping over users and querying posts inside the loop causes…",
    o: ["Nothing", "N+1 queries", "A deadlock", "A migration"],
    a: 1,
    e: "Use include/select to load relations in one go.",
  },
  {
    q: "Which prisma command applies migrations in production?",
    o: ["migrate dev", "migrate reset", "migrate deploy", "db push --force"],
    a: 2,
    e: "migrate deploy only applies committed migrations, no resets.",
  },
];

/* ===== RENDER ===== */
const LS = "dbm-progress-v1";
let done = new Set();
try {
  done = new Set(JSON.parse(localStorage.getItem(LS) || "[]"));
} catch (e) {}
const save = () => {
  try {
    localStorage.setItem(LS, JSON.stringify([...done]));
  } catch (e) {}
};

function lessonHTML(id, n, l, cls) {
  return `<details class="lesson ${cls} ${done.has(id) ? "done" : ""}" data-id="${id}" id="${id}">
  <summary><span class="num">${String(n).padStart(2, "0")}</span><span class="ttl">${l.t}</span><span class="tag ${l.lv}">${l.lv}</span></summary>
  <div class="lbody"><p>${l.b}</p>${l.c ? code(l.c) : ""}${resRow(l.r)}
  <label class="chk"><input type="checkbox" data-done="${id}" ${done.has(id) ? "checked" : ""}> I understand this</label></div></details>`;
}
Object.entries(TRACKS).forEach(([k, t]) => {
  const el = $("#track-" + k);
  if (!el) return;
  el.innerHTML =
    `<div class="trackhead ${t.cls}"><span class="ico">${t.ico}</span><h2>${t.title}</h2></div><p class="lead">${t.intro}</p>` +
    t.lessons
      .map((l, i) => lessonHTML(`${k}-${i + 1}`, i + 1, l, t.cls))
      .join("") +
    (k === "redis" ? '<div id="cache-lab-slot"></div>' : "");
});
$("#projects-list").innerHTML = PROJECTS.map(
  (
    p,
    i,
  ) => `<details class="lesson proj" data-id="proj-${i}" id="proj-${i}" style="--tc:var(--acc2)">
  <summary><span class="num">${String(i + 1).padStart(2, "0")}</span><span class="ttl">${p.t}</span><span class="tag ${p.lv}">${p.lv}</span></summary>
  <div class="lbody"><div class="meta"><span class="tag">${p.db}</span>${p.skills.map((s) => `<span class="tag">${s}</span>`).join("")}</div>
  <p><b>Goal:</b> ${p.goal}</p><ol class="steps">${p.steps.map((s) => `<li>${s}</li>`).join("")}</ol><p><b>Stretch:</b> ${p.stretch}</p>
  <p class="mini">Publish it on GitHub with a README: schema diagram, how to run, sample queries and what you learned. This is portfolio gold.</p>
  <label class="chk"><input type="checkbox" data-done="proj-${i}" ${done.has("proj-" + i) ? "checked" : ""}> Project finished</label></div></details>`,
).join("");
$("#sd-list").innerHTML = SYSTEMS.map(
  (
    s,
    i,
  ) => `<details class="lesson sd" data-id="sd-${i}" id="sd-${i}" style="--tc:var(--warn)">
  <summary><span class="num">${String(i + 1).padStart(2, "0")}</span><span class="ttl">${s.t}</span><span class="tag ${s.lv}">${s.lv}</span></summary>
  <div class="lbody"><div class="kids">🧒 <b>Explain like I\'m new:</b> ${s.analogy}</div>
  <p><b>1. What must it do?</b> ${s.need}</p><p><b>2. Which database and why?</b> ${s.db}</p>
  <p><b>3. Data model</b></p>${code(s.schema)}
  <p><b>4. How it works</b></p><ol class="steps">${s.flow.map((x) => `<li>${x}</li>`).join("")}</ol>
  <p><b>5. How it scales</b></p><ul>${s.scale.map((x) => `<li>${x}</li>`).join("")}</ul>
  <p class="callout warn"><b>Trade-off:</b> ${s.trade}</p>
  <label class="chk"><input type="checkbox" data-done="sd-${i}" ${done.has("sd-" + i) ? "checked" : ""}> I can explain this on a whiteboard</label></div></details>`,
).join("");
$("#concepts-grid").innerHTML = CONCEPTS.map(
  (c) =>
    `<div class="card"><h3>${c[0]}</h3><p>${c[1]}</p><p class="kids">💡 ${c[2]}</p></div>`,
).join("");

/* progress */
function updateProgress() {
  const all = $$("[data-done]");
  const n = all.filter((i) => i.checked).length;
  const pct = all.length ? Math.round((n / all.length) * 100) : 0;
  $("#pbar").style.width = pct + "%";
  $("#ptxt").textContent = `${n}/${all.length} done (${pct}%)`;
}
document.addEventListener("change", (e) => {
  const id = e.target.dataset && e.target.dataset.done;
  if (!id) return;
  e.target.checked ? done.add(id) : done.delete(id);
  save();
  const d = e.target.closest("details");
  if (d) d.classList.toggle("done", e.target.checked);
  updateProgress();
});
$("#resetProgress").onclick = () => {
  if (confirm("Reset all progress?")) {
    done.clear();
    save();
    $$("[data-done]").forEach((i) => (i.checked = false));
    $$("details.done").forEach((d) => d.classList.remove("done"));
    updateProgress();
  }
};

/* copy buttons */
document.addEventListener("click", (e) => {
  if (!e.target.classList.contains("copy")) return;
  const t = e.target.parentElement.querySelector("code").innerText;
  navigator.clipboard.writeText(t).then(() => {
    e.target.textContent = "Copied!";
    setTimeout(() => (e.target.textContent = "Copy"), 1200);
  });
});
/* every static <pre> also gets a copy button */
$$("pre").forEach((p) => {
  if (!p.querySelector(".copy")) {
    const b = document.createElement("button");
    b.className = "copy";
    b.type = "button";
    b.textContent = "Copy";
    p.prepend(b);
    if (!p.querySelector("code")) {
      p.innerHTML =
        '<button class="copy" type="button">Copy</button><code>' +
        p.innerHTML.replace(
          '<button class="copy" type="button">Copy</button>',
          "",
        ) +
        "</code>";
    }
  }
});

/* theme + menu */
const root = document.documentElement;
try {
  const th = localStorage.getItem("dbm-theme");
  if (th) root.dataset.theme = th;
} catch (e) {}
$("#themeBtn").onclick = () => {
  const n = root.dataset.theme === "light" ? "dark" : "light";
  root.dataset.theme = n;
  try {
    localStorage.setItem("dbm-theme", n);
  } catch (e) {}
};
$("#menuBtn").onclick = () => $("#side").classList.toggle("open");
$$("#side a").forEach((a) =>
  a.addEventListener("click", () => $("#side").classList.remove("open")),
);

/* scroll spy */
const links = $$('#side a[href^="#"]');
const spy = new IntersectionObserver(
  (es) =>
    es.forEach((en) => {
      if (en.isIntersecting)
        links.forEach((l) =>
          l.classList.toggle(
            "active",
            l.getAttribute("href") === "#" + en.target.id,
          ),
        );
    }),
  { rootMargin: "-40% 0px -55% 0px" },
);
$$("section.sec").forEach((s) => spy.observe(s));

/* search */
$("#search").addEventListener("input", (e) => {
  const q = e.target.value.trim().toLowerCase();
  $$("details.lesson").forEach((d) => {
    const hit = !q || d.textContent.toLowerCase().includes(q);
    d.classList.toggle("hidden", !hit);
    if (q && hit) d.open = true;
  });
  $("#searchInfo").textContent = q
    ? `${$$("details.lesson:not(.hidden)").length} matching lessons`
    : "";
});
/* open lesson via hash */
if (location.hash) {
  const d = $(location.hash);
  if (d && d.tagName === "DETAILS") d.open = true;
}

/* tabs */
$$(".tabs[data-tabs]").forEach((tb) => {
  const target = $(tb.dataset.tabs);
  tb.addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (!b) return;
    $$("button", tb).forEach((x) => x.classList.toggle("on", x === b));
    $$("[data-pane]", target).forEach((p) =>
      p.classList.toggle("hidden", p.dataset.pane !== b.dataset.t),
    );
  });
});

/* ===== decision helper ===== */
const QS = [
  ["My data has clear relationships and I need JOINs / reports", { sql: 3 }],
  ["Money, inventory or bookings: correctness is critical", { sql: 3 }],
  ["Document shape changes a lot / varied attributes per item", { doc: 3 }],
  ["I read the same data thousands of times per second", { cache: 3 }],
  ["I need temporary data: sessions, counters, rate limits", { cache: 3 }],
  ["Massive write volume that must spread over many servers", { doc: 2 }],
  ["I am a beginner building a normal web app", { sql: 2 }],
  ["I need to search/aggregate by many different fields", { sql: 2 }],
];
$("#dh").innerHTML =
  QS.map(
    (q, i) =>
      `<label class="opt"><input type="checkbox" data-q="${i}"><span>${q[0]}</span></label>`,
  ).join("") +
  '<div class="result" id="dhRes">Tick what matches your project…</div>';
$("#dh").addEventListener("change", () => {
  const s = { sql: 0, doc: 0, cache: 0 };
  $$("#dh input:checked").forEach((i) =>
    Object.entries(QS[i.dataset.q][1]).forEach(([k, v]) => (s[k] += v)),
  );
  const tot = s.sql + s.doc + s.cache;
  if (!tot) {
    $("#dhRes").textContent = "Tick what matches your project…";
    return;
  }
  let r = "<b>Suggestion:</b> ";
  if (s.sql >= s.doc && s.sql >= s.cache)
    r += "start with <b>PostgreSQL</b> (relational, ACID). ";
  else if (s.doc > s.cache)
    r += "consider <b>MongoDB</b> (or PostgreSQL + jsonb). ";
  else r += "<b>Redis</b> as a cache/session layer ";
  if (s.cache > 0 && !(s.cache > s.sql && s.cache > s.doc))
    r += "Add <b>Redis</b> in front for the hot reads / temporary data. ";
  if (s.doc > 0 && s.sql >= s.doc)
    r += "Need flexibility? Try a <code>jsonb</code> column first. ";
  r +=
    "<br><small>Rule of thumb: Postgres by default, add Redis when speed matters, MongoDB when documents are truly your shape. Most real systems use 2 or 3 together.</small>";
  $("#dhRes").innerHTML = r;
});

/* ===== join visualizer ===== */
const U = [
    [1, "Ana"],
    [2, "Ben"],
    [3, "Cy"],
  ],
  O = [
    [10, 1, "Book"],
    [11, 1, "Pen"],
    [12, 3, "Lamp"],
    [13, 4, "Mug"],
  ];
function joinRows(type) {
  const out = [];
  U.forEach((u) => {
    const m = O.filter((o) => o[1] === u[0]);
    if (m.length) m.forEach((o) => out.push({ u, o }));
    else if (type === "LEFT" || type === "FULL") out.push({ u, o: null });
  });
  if (type === "RIGHT" || type === "FULL")
    O.forEach((o) => {
      if (!U.some((u) => u[0] === o[1])) out.push({ u: null, o });
    });
  return out;
}
function drawJoin(type) {
  const rows = joinRows(type);
  const matched = new Set(rows.filter((r) => r.u && r.o).map((r) => r.u[0]));
  const usedO = new Set(rows.filter((r) => r.o).map((r) => r.o[0]));
  $("#jvU").innerHTML = U.map(
    (u) =>
      `<tr class="${matched.has(u[0]) || rows.some((r) => r.u && r.u[0] === u[0]) ? "hl" : ""}"><td>${u[0]}</td><td>${u[1]}</td></tr>`,
  ).join("");
  $("#jvO").innerHTML = O.map(
    (o) =>
      `<tr class="${usedO.has(o[0]) ? "hl" : ""}"><td>${o[0]}</td><td>${o[1]}</td><td>${o[2]}</td></tr>`,
  ).join("");
  $("#jvR").innerHTML = rows
    .map(
      (r) =>
        `<tr class="${!r.u || !r.o ? "nul" : ""}"><td>${r.u ? r.u[1] : "NULL"}</td><td>${r.o ? r.o[0] : "NULL"}</td><td>${r.o ? r.o[2] : "NULL"}</td></tr>`,
    )
    .join("");
  $("#jvSQL").textContent =
    `SELECT u.name, o.id, o.item\nFROM users u\n${type} JOIN orders o ON o.user_id = u.id;`;
  $("#jvNote").textContent = {
    INNER:
      "Only rows that match on both sides. Ben (no orders) and Mug (user 4 does not exist) disappear.",
    LEFT: "Every user is kept. Ben appears with NULLs because he has no orders.",
    RIGHT: "Every order is kept. The Mug order shows NULL for the user.",
    FULL: "Everything from both sides, matched where possible.",
  }[type];
}
$("#joinTabs").addEventListener("click", (e) => {
  const b = e.target.closest("button");
  if (!b) return;
  $$("#joinTabs button").forEach((x) => x.classList.toggle("on", x === b));
  drawJoin(b.dataset.t);
});
drawJoin("INNER");

/* ===== cache lab ===== */
(function () {
  const slot = $("#cache-lab-slot");
  if (!slot) return;
  slot.innerHTML = `<div class="card" id="cache-lab" style="margin-top:18px"><h3>🧪 Cache Lab: cache-aside in action</h3>
  <p class="mini">Click “GET user:1”. First request misses and hits the slow database; then Redis serves it fast until the 10 s TTL expires.</p>
  <button class="btn primary" id="cGet">GET user:1</button> <button class="btn" id="cDel">DEL user:1 (invalidate)</button>
  <div class="result"><div>Redis key: <b id="cState">empty</b> <span id="cTtl"></span></div><div id="cLog" class="mini" style="margin-top:8px"></div></div></div>`;
  let exp = 0,
    timer;
  const log = (h) => {
    const d = $("#cLog");
    d.innerHTML =
      h + "<br>" + d.innerHTML.split("<br>").slice(0, 5).join("<br>");
  };
  const tick = () => {
    const left = Math.ceil((exp - Date.now()) / 1000);
    if (left > 0) {
      $("#cState").textContent = "cached";
      $("#cTtl").textContent = `(TTL ${left}s)`;
    } else {
      $("#cState").textContent = "empty";
      $("#cTtl").textContent = "";
      clearInterval(timer);
    }
  };
  $("#cGet").onclick = () => {
    if (exp > Date.now())
      log('<span class="pill hit">HIT</span> served from Redis in ~2 ms');
    else {
      log(
        '<span class="pill miss">MISS</span> query PostgreSQL… ~120 ms → store in Redis with TTL 10s',
      );
      exp = Date.now() + 10000;
      clearInterval(timer);
      timer = setInterval(tick, 500);
      tick();
    }
  };
  $("#cDel").onclick = () => {
    exp = 0;
    tick();
    log(
      "Key deleted: next read will be a MISS (this is how you invalidate after an update).",
    );
  };
})();

/* ===== quiz ===== */
let score = 0,
  answered = 0;
$("#quizbox").innerHTML =
  QUIZ.map(
    (q, i) =>
      `<div class="qq card"><b>${i + 1}. ${q.q}</b>${q.o.map((o, j) => `<span class="o" data-q="${i}" data-j="${j}">${o}</span>`).join("")}<div class="mini" id="qe${i}"></div></div>`,
  ).join("") +
  '<div class="result" id="qScore">Answer all questions to see your score.</div>';
$("#quizbox").addEventListener("click", (e) => {
  const o = e.target.closest(".o");
  if (!o || o.parentElement.dataset.locked) return;
  const q = QUIZ[o.dataset.q];
  o.parentElement.dataset.locked = 1;
  answered++;
  const right = +o.dataset.j === q.a;
  if (right) score++;
  o.classList.add(right ? "ok" : "bad");
  if (!right) $$(".o", o.parentElement)[q.a].classList.add("ok");
  $("#qe" + o.dataset.q).textContent = q.e;
  if (answered === QUIZ.length)
    $("#qScore").innerHTML =
      `<b>Score: ${score}/${QUIZ.length}</b> ${score >= 7 ? "🔥 Excellent!" : score >= 5 ? "👍 Good, revisit the missed topics." : "📚 Keep going, review the lessons above."}`;
});

updateProgress();
