import { Container, Text } from '@components/ui'
import { PlatformDataUsage } from '@actions/vercelData.actions'
import { Database, HardDrive, KeyRound, Server } from 'lucide-react'
import type { ReactNode } from 'react'

const formatBytes = (bytes: number | null | undefined): string => {
  if (bytes === null || bytes === undefined || Number.isNaN(bytes) || bytes < 0)
    return '—'
  if (bytes === 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  const index = Math.min(
    units.length - 1,
    Math.floor(Math.log(bytes) / Math.log(1024)),
  )
  const value = bytes / 1024 ** index
  return `${value.toFixed(value >= 100 || index === 0 ? 0 : 1)} ${units[index]}`
}

function InfoRow({
  label,
  value,
}: {
  label: string
  value: string | number | null | undefined
}) {
  return (
    <div className="flex justify-between items-center gap-4 py-1.5 text-sm">
      <span className="text-muted">{label}</span>
      <span className="font-semibold text-right">{value ?? '—'}</span>
    </div>
  )
}

function Section({
  icon,
  title,
  children,
}: {
  icon: ReactNode
  title: string
  children: ReactNode
}) {
  return (
    <div className="rounded-xl border border-border bg-accent-2/40 p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-muted">{icon}</span>
        <Text variant="bold">{title}</Text>
      </div>
      {children}
    </div>
  )
}

export function VercelDataCard({ data }: { data: PlatformDataUsage }) {
  const { blob, database, neon, kv, runtime } = data

  return (
    <Container variant="box" data-testid="vercel-data-card">
      <div className="flex items-center gap-4 mb-4">
        <Server className="text-muted" size={20} />
        <Text variant="bold">Platform Data</Text>
        <span className="ml-auto text-xs text-muted">
          {runtime.environment ? `Env: ${runtime.environment}` : ''}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <Section icon={<HardDrive size={16} />} title="Vercel Blob">
          {blob ? (
            <>
              <InfoRow
                label="Stored data"
                value={formatBytes(blob.usedBytes)}
              />
              <InfoRow label="Files" value={blob.blobCount} />
              {blob.truncated && (
                <p className="text-xs text-muted mt-2">
                  Showing up to 1,000 files — full usage is in the Vercel
                  dashboard.
                </p>
              )}
            </>
          ) : (
            <p className="text-sm text-muted">
              Unavailable — BLOB_READ_WRITE_TOKEN may be missing.
            </p>
          )}
        </Section>

        <Section icon={<Database size={16} />} title="PostgreSQL (Neon)">
          {database ? (
            <>
              <InfoRow
                label="Database size"
                value={formatBytes(database.usedBytes)}
              />
              <InfoRow label="Tables" value={database.tableCount} />
              <InfoRow label="Region" value={neon?.region} />
              <InfoRow label="PG version" value={neon?.pgVersion} />
              <InfoRow
                label="Plan limit"
                value={
                  neon?.limitBytes ? formatBytes(neon.limitBytes) : undefined
                }
              />
            </>
          ) : (
            <p className="text-sm text-muted">
              Unavailable — database query failed.
            </p>
          )}
          {!neon && (
            <p className="text-xs text-muted mt-2">
              Add NEON_API_KEY + NEON_PROJECT_ID for plan limit &amp; region.
            </p>
          )}
        </Section>

        <Section icon={<KeyRound size={16} />} title="Vercel KV">
          {kv ? (
            <InfoRow label="Stored keys" value={kv.keyCount} />
          ) : (
            <p className="text-sm text-muted">
              Unavailable — KV may not be linked.
            </p>
          )}
        </Section>

        <Section icon={<Server size={16} />} title="Runtime">
          <InfoRow label="Environment" value={runtime.environment} />
          <InfoRow label="Region" value={runtime.region} />
          <InfoRow label="Project ID" value={runtime.projectId} />
          <InfoRow label="App URL" value={runtime.appUrl} />
        </Section>
      </div>
    </Container>
  )
}
