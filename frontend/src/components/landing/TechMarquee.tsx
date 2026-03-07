import { motion } from 'framer-motion';

const TECH_ROW_1 = [
  { id: 'postgres', name: 'PostgreSQL' },
  { id: 'redis', name: 'Redis' },
  { id: 'kafka', name: 'Kafka' },
  { id: 'nginx', name: 'NGINX' },
  { id: 'node', name: 'Node.js' },
  { id: 'python', name: 'Python' },
  { id: 'go', name: 'Go' },
  { id: 'docker', name: 'Docker' },
  { id: 'kubernetes', name: 'Kubernetes' },
  { id: 'aws', name: 'AWS' },
  { id: 'gcp', name: 'GCP' },
  { id: 'mongodb', name: 'MongoDB' },
  { id: 'mysql', name: 'MySQL' },
  { id: 'rabbitmq', name: 'RabbitMQ' },
  { id: 'elasticsearch', name: 'Elasticsearch' },
];

const TECH_ROW_2 = [
  { id: 'graphql', name: 'GraphQL' },
  { id: 'grpc', name: 'gRPC' },
  { id: 'react', name: 'React' },
  { id: 'vue', name: 'Vue.js' },
  { id: 'rust', name: 'Rust' },
  { id: 'java', name: 'Java' },
  { id: 'terraform', name: 'Terraform' },
  { id: 'cloudflare', name: 'Cloudflare' },
  { id: 'datadog', name: 'Datadog' },
  { id: 'prometheus', name: 'Prometheus' },
  { id: 'cassandra', name: 'Cassandra' },
  { id: 'dynamodb', name: 'DynamoDB' },
  { id: 'azure', name: 'Azure' },
  { id: 'vercel', name: 'Vercel' },
  { id: 'supabase', name: 'Supabase' },
];

// Simple emoji/letter icons since we don't have real logos for the landing page
const techEmoji: Record<string, string> = {
  postgres: '🐘',
  redis: '🔴',
  kafka: '📨',
  nginx: '🟩',
  node: '💚',
  python: '🐍',
  go: '🔵',
  docker: '🐳',
  kubernetes: '☸️',
  aws: '☁️',
  gcp: '🌐',
  mongodb: '🍃',
  mysql: '🐬',
  rabbitmq: '🐰',
  elasticsearch: '🔍',
  graphql: '◆',
  grpc: '⚡',
  react: '⚛️',
  vue: '💚',
  rust: '🦀',
  java: '☕',
  terraform: '🏗️',
  cloudflare: '🟠',
  datadog: '🐕',
  prometheus: '🔥',
  cassandra: '👁️',
  dynamodb: '⚡',
  azure: '🔷',
  vercel: '▲',
  supabase: '⚡',
};

function TechPill({ tech }: { tech: { id: string; name: string } }) {
  return (
    <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white border border-gray-100 shrink-0 hover:border-gray-200 hover:shadow-sm transition-all">
      <span className="text-base">{techEmoji[tech.id] || '⬡'}</span>
      <span className="text-sm text-gray-600 whitespace-nowrap font-medium">
        {tech.name}
      </span>
    </div>
  );
}

export function TechMarquee() {
  return (
    <section className="py-20 overflow-hidden">
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.6 }}
      >
        {/* Section label */}
        <div className="text-center mb-10">
          <span className="text-sm font-medium text-blue-600 mb-3 block">
            Ecosystem
          </span>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
            60+ technologies supported
          </h2>
          <p className="text-gray-500 text-sm">
            Arch recognizes and renders icons for all major infrastructure
            components.
          </p>
        </div>

        {/* Row 1: scrolls left */}
        <div className="relative mb-3">
          <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-white to-transparent z-10" />
          <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-white to-transparent z-10" />
          <div className="flex gap-3 animate-marquee-left will-change-transform">
            {[...TECH_ROW_1, ...TECH_ROW_1].map((tech, i) => (
              <TechPill key={`r1-${i}`} tech={tech} />
            ))}
          </div>
        </div>

        {/* Row 2: scrolls right */}
        <div className="relative">
          <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-white to-transparent z-10" />
          <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-white to-transparent z-10" />
          <div className="flex gap-3 animate-marquee-right will-change-transform">
            {[...TECH_ROW_2, ...TECH_ROW_2].map((tech, i) => (
              <TechPill key={`r2-${i}`} tech={tech} />
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
}
