import type { NodeType } from '@/types/graph';

type TechEntry = {
  label: string;
  icon: string;
  color: string;
  nodeTypes: NodeType[];
};

/**
 * Single source of truth for all supported technologies.
 * Every other file (types, logos, inspector, backend) derives from this.
 */
export const TECH_CATALOG = {
  // ── DB (SQL) ──────────────────────────────────────
  postgres:    { label: 'PostgreSQL',    icon: 'simple-icons:postgresql',     color: '#4169E1', nodeTypes: ['database'] },
  mysql:       { label: 'MySQL',         icon: 'simple-icons:mysql',          color: '#4479A1', nodeTypes: ['database'] },
  mariadb:     { label: 'MariaDB',       icon: 'simple-icons:mariadb',        color: '#003545', nodeTypes: ['database'] },
  sqlite:      { label: 'SQLite',        icon: 'simple-icons:sqlite',         color: '#003B57', nodeTypes: ['database'] },
  cockroachdb: { label: 'CockroachDB',   icon: 'simple-icons:cockroachlabs',  color: '#6933FF', nodeTypes: ['database'] },
  planetscale: { label: 'PlanetScale',   icon: 'simple-icons:planetscale',    color: '#F0F0F0', nodeTypes: ['database'] },

  // ── DB (NoSQL) ────────────────────────────────────
  mongodb:   { label: 'MongoDB',    icon: 'simple-icons:mongodb',        color: '#47A248', nodeTypes: ['database'] },
  dynamodb:  { label: 'DynamoDB',   icon: 'simple-icons:amazondynamodb', color: '#4053D6', nodeTypes: ['database'] },
  cassandra: { label: 'Cassandra',  icon: 'simple-icons:apachecassandra',color: '#1287B1', nodeTypes: ['database'] },
  couchdb:   { label: 'CouchDB',    icon: 'simple-icons:apachecouchdb',  color: '#E42528', nodeTypes: ['database'] },
  firestore: { label: 'Firestore',  icon: 'simple-icons:firebase',       color: '#DD2C00', nodeTypes: ['database'] },

  // ── DB (Vector) ───────────────────────────────────
  pinecone: { label: 'Pinecone',  icon: 'simple-icons:pinecone',  color: '#000000', nodeTypes: ['database'] },
  weaviate: { label: 'Weaviate',  icon: 'simple-icons:weaviate',  color: '#00D1A0', nodeTypes: ['database'] },
  qdrant:   { label: 'Qdrant',    icon: 'simple-icons:qdrant',    color: '#DC244C', nodeTypes: ['database'] },
  milvus:   { label: 'Milvus',    icon: 'simple-icons:milvus',    color: '#00A1EA', nodeTypes: ['database'] },
  chroma:   { label: 'Chroma',    icon: 'simple-icons:chroma',    color: '#FF6446', nodeTypes: ['database'] },

  // ── DB (Time-series) ─────────────────────────────
  influxdb:    { label: 'InfluxDB',    icon: 'simple-icons:influxdb',    color: '#22ADF6', nodeTypes: ['database'] },
  timescaledb: { label: 'TimescaleDB', icon: 'simple-icons:timescale',   color: '#FDB515', nodeTypes: ['database'] },
  clickhouse:  { label: 'ClickHouse',  icon: 'simple-icons:clickhouse',  color: '#FFCC21', nodeTypes: ['database'] },

  // ── Caches ────────────────────────────────────────
  redis:     { label: 'Redis',     icon: 'simple-icons:redis',     color: '#FF4438', nodeTypes: ['cache'] },
  memcached: { label: 'Memcached', icon: 'simple-icons:memcached', color: '#8BC500', nodeTypes: ['cache'] },
  dragonfly: { label: 'Dragonfly', icon: 'simple-icons:dragonfly', color: '#2ED1A4', nodeTypes: ['cache'] },
  valkey:    { label: 'Valkey',    icon: 'simple-icons:valkey',    color: '#FF4438', nodeTypes: ['cache'] },

  // ── Brokers / Queues ──────────────────────────────
  kafka:    { label: 'Kafka',     icon: 'simple-icons:apachekafka',   color: '#231F20', nodeTypes: ['queue'] },
  rabbitmq: { label: 'RabbitMQ',  icon: 'simple-icons:rabbitmq',      color: '#FF6600', nodeTypes: ['queue'] },
  sqs:      { label: 'SQS',       icon: 'simple-icons:amazonsqs',     color: '#FF4F8B', nodeTypes: ['queue'] },
  nats:     { label: 'NATS',      icon: 'simple-icons:nats',          color: '#27AAE1', nodeTypes: ['queue'] },
  pulsar:   { label: 'Pulsar',    icon: 'simple-icons:apachepulsar',  color: '#188FFF', nodeTypes: ['queue'] },

  // ── Gateways ──────────────────────────────────────
  nginx:   { label: 'NGINX',   icon: 'simple-icons:nginx',      color: '#009639', nodeTypes: ['gateway', 'load_balancer'] },
  envoy:   { label: 'Envoy',   icon: 'simple-icons:envoyproxy', color: '#AC6199', nodeTypes: ['gateway', 'load_balancer'] },
  kong:    { label: 'Kong',    icon: 'simple-icons:kong',        color: '#003459', nodeTypes: ['gateway'] },
  traefik: { label: 'Traefik', icon: 'simple-icons:traefikproxy',color: '#24A1C1', nodeTypes: ['gateway', 'load_balancer'] },
  apisix:  { label: 'APISIX',  icon: 'simple-icons:apache',      color: '#E8433E', nodeTypes: ['gateway'] },

  // ── Load Balancers ────────────────────────────────
  haproxy: { label: 'HAProxy', icon: 'simple-icons:haproxy', color: '#106DA3', nodeTypes: ['load_balancer'] },

  // ── Runtimes / Languages ──────────────────────────
  python: { label: 'Python',  icon: 'simple-icons:python',    color: '#3776AB', nodeTypes: ['service'] },
  go:     { label: 'Go',      icon: 'simple-icons:go',        color: '#00ADD8', nodeTypes: ['service'] },
  node:   { label: 'Node.js', icon: 'simple-icons:nodedotjs', color: '#5FA04E', nodeTypes: ['service'] },
  rust:   { label: 'Rust',    icon: 'simple-icons:rust',      color: '#CE422B', nodeTypes: ['service'] },
  java:   { label: 'Java',    icon: 'simple-icons:openjdk',   color: '#F89820', nodeTypes: ['service'] },
  dotnet: { label: '.NET',    icon: 'simple-icons:dotnet',    color: '#512BD4', nodeTypes: ['service'] },
  elixir: { label: 'Elixir',  icon: 'simple-icons:elixir',    color: '#4B275F', nodeTypes: ['service'] },
  ruby:   { label: 'Ruby',    icon: 'simple-icons:ruby',      color: '#CC342D', nodeTypes: ['service'] },
  php:    { label: 'PHP',     icon: 'simple-icons:php',       color: '#777BB4', nodeTypes: ['service'] },

  // ── Search ────────────────────────────────────────
  elasticsearch: { label: 'Elasticsearch', icon: 'simple-icons:elasticsearch', color: '#005571', nodeTypes: ['database'] },
  opensearch:    { label: 'OpenSearch',    icon: 'simple-icons:opensearch',    color: '#005EB8', nodeTypes: ['database'] },
  meilisearch:   { label: 'Meilisearch',   icon: 'simple-icons:meilisearch',   color: '#FF5CAA', nodeTypes: ['database'] },
  typesense:     { label: 'Typesense',     icon: 'simple-icons:typesense',     color: '#D123AE', nodeTypes: ['database'] },
  algolia:       { label: 'Algolia',       icon: 'simple-icons:algolia',       color: '#003DFF', nodeTypes: ['database'] },

  // ── Object Storage ────────────────────────────────
  s3:    { label: 'S3',    icon: 'simple-icons:amazons3',          color: '#569A31', nodeTypes: ['database'] },
  gcs:   { label: 'GCS',   icon: 'simple-icons:googlecloudstorage',color: '#AECBFA', nodeTypes: ['database'] },
  minio: { label: 'MinIO', icon: 'simple-icons:minio',             color: '#C72E49', nodeTypes: ['database'] },
  r2:    { label: 'R2',    icon: 'simple-icons:cloudflare',        color: '#F38020', nodeTypes: ['database'] },

  // ── Observability ─────────────────────────────────
  prometheus: { label: 'Prometheus', icon: 'simple-icons:prometheus', color: '#E6522C', nodeTypes: ['service'] },
  grafana:    { label: 'Grafana',    icon: 'simple-icons:grafana',    color: '#F46800', nodeTypes: ['service'] },
  datadog:    { label: 'Datadog',    icon: 'simple-icons:datadog',    color: '#632CA6', nodeTypes: ['service'] },
  jaeger:     { label: 'Jaeger',     icon: 'simple-icons:jaeger',     color: '#60D0E4', nodeTypes: ['service'] },
  sentry:     { label: 'Sentry',     icon: 'simple-icons:sentry',     color: '#362D59', nodeTypes: ['service'] },

  // ── Auth ──────────────────────────────────────────
  auth0:          { label: 'Auth0',          icon: 'simple-icons:auth0',    color: '#EB5424', nodeTypes: ['service'] },
  clerk:          { label: 'Clerk',          icon: 'simple-icons:clerk',    color: '#6C47FF', nodeTypes: ['service'] },
  keycloak:       { label: 'Keycloak',       icon: 'simple-icons:keycloak', color: '#4D4D4D', nodeTypes: ['service'] },
  firebase_auth:  { label: 'Firebase Auth',  icon: 'simple-icons:firebase', color: '#DD2C00', nodeTypes: ['service'] },
  supabase_auth:  { label: 'Supabase Auth',  icon: 'simple-icons:supabase', color: '#3FCF8E', nodeTypes: ['service'] },
} as const satisfies Record<string, TechEntry>;

export type TechId = keyof typeof TECH_CATALOG;

// ── Dark-mode overrides ─────────────────────────────
const DARK_COLOR_OVERRIDES: Partial<Record<string, string>> = {
  'simple-icons:apachekafka':   '#ffffff',
  'simple-icons:kong':          '#4BA0C6',
  'simple-icons:rust':          '#F74C00',
  'simple-icons:mariadb':       '#C0978A',
  'simple-icons:sqlite':        '#62B1D0',
  'simple-icons:pinecone':      '#ffffff',
  'simple-icons:clickhouse':    '#FFCC21',
  'simple-icons:elixir':        '#A57EC8',
  'simple-icons:sentry':        '#A89ABF',
  'simple-icons:keycloak':      '#A0A0A0',
  'simple-icons:haproxy':       '#3B9FD9',
  'simple-icons:elasticsearch': '#1BA9F5',
  'simple-icons:opensearch':    '#3B8FD9',
};

// ── Utility functions ───────────────────────────────

export function getTechEntry(id: TechId): TechEntry {
  return TECH_CATALOG[id];
}

export function getTechLabel(id: TechId): string {
  return TECH_CATALOG[id].label;
}

export function getTechIconColor(id: TechId, darkMode = true): string {
  const entry = TECH_CATALOG[id];
  if (darkMode && DARK_COLOR_OVERRIDES[entry.icon]) {
    return DARK_COLOR_OVERRIDES[entry.icon]!;
  }
  return entry.color;
}

export function getTechnologiesForNodeType(nodeType: NodeType): { id: TechId; label: string; icon: string; color: string }[] {
  return (Object.entries(TECH_CATALOG) as [TechId, TechEntry][])
    .filter(([, entry]) => entry.nodeTypes.includes(nodeType))
    .map(([id, entry]) => ({ id, label: entry.label, icon: entry.icon, color: entry.color }));
}

export function isTechValidForNodeType(tech: TechId, nodeType: NodeType): boolean {
  return TECH_CATALOG[tech].nodeTypes.includes(nodeType);
}

/** All valid tech IDs as a set (useful for validation) */
export const ALL_TECH_IDS = new Set(Object.keys(TECH_CATALOG) as TechId[]);
