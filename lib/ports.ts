// Kept free of Node imports so client components can use it too.

/** Ports that should almost never face the internet, with the service usually behind them. */
export const SENSITIVE_PORTS: Record<number, { service: string; tier: 'data' | 'remote' | 'note' }> = {
  21: { service: 'FTP', tier: 'remote' },
  22: { service: 'SSH', tier: 'note' },
  23: { service: 'Telnet', tier: 'remote' },
  445: { service: 'SMB', tier: 'remote' },
  1433: { service: 'SQL Server', tier: 'data' },
  3306: { service: 'MySQL', tier: 'data' },
  3389: { service: 'RDP', tier: 'remote' },
  5432: { service: 'PostgreSQL', tier: 'data' },
  5601: { service: 'Kibana', tier: 'data' },
  5900: { service: 'VNC', tier: 'remote' },
  6379: { service: 'Redis', tier: 'data' },
  8080: { service: 'alternate HTTP', tier: 'note' },
  9200: { service: 'Elasticsearch', tier: 'data' },
  11211: { service: 'Memcached', tier: 'data' },
  27017: { service: 'MongoDB', tier: 'data' },
};
