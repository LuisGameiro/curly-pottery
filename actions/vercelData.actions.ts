'use server'

import { list } from '@vercel/blob'
import { kv } from '@vercel/kv'
import { assertAdmin } from '@lib/auth/admin'
import { ActionResponse } from '@lib/types/types'
import { prisma } from 'prisma/prisma'
import * as Sentry from '@sentry/nextjs'
import { toClientMessage } from '@lib/errors'

export interface PlatformDataUsage {
  blob: { usedBytes: number; blobCount: number; truncated: boolean } | null
  database: { usedBytes: number; tableCount: number } | null
  neon: {
    name: string | null
    region: string | null
    pgVersion: number | null
    dataSizeBytes: number | null
    limitBytes: number | null
  } | null
  kv: { keyCount: number } | null
  runtime: {
    environment: string | null
    region: string | null
    projectId: string | null
    appUrl: string | null
  }
}

/** Cap on blobs listed per call — enough for a usage overview without a slow scan. */
const BLOB_LIST_LIMIT = 1000

const getBlobUsage = async () => {
  try {
    const { blobs, hasMore } = await list({ limit: BLOB_LIST_LIMIT })
    return {
      usedBytes: blobs.reduce((acc, blob) => acc + blob.size, 0),
      blobCount: blobs.length,
      truncated: hasMore,
    }
  } catch (error) {
    console.error('getVercelDataUsage_BLOB:', error)
    return null
  }
}

const getDatabaseUsage = async () => {
  try {
    const [sizeRows, tableRows] = await Promise.all([
      prisma.$queryRaw<Array<{ bytes: bigint }>>`
        SELECT pg_database_size(current_database()) AS bytes
      `,
      prisma.$queryRaw<Array<{ count: number }>>`
        SELECT count(*)::int AS count
        FROM information_schema.tables
        WHERE table_schema = 'public'
      `,
    ])
    return {
      usedBytes: Number(sizeRows[0]?.bytes ?? 0),
      tableCount: tableRows[0]?.count ?? 0,
    }
  } catch (error) {
    console.error('getVercelDataUsage_DB:', error)
    return null
  }
}

const getNeonProjectInfo = async () => {
  const projectId = process.env.NEON_PROJECT_ID
  const apiKey = process.env.NEON_API_KEY
  if (!projectId || !apiKey) return null

  try {
    const res = await fetch(`https://api.neon.tech/v2/projects/${projectId}`, {
      headers: { Authorization: `Bearer ${apiKey}` },
      cache: 'no-store',
    })
    if (!res.ok) return null

    const json = (await res.json()) as { project?: Record<string, unknown> }
    const project = json.project
    if (!project) return null

    return {
      name: typeof project.name === 'string' ? project.name : null,
      region: typeof project.region_id === 'string' ? project.region_id : null,
      pgVersion:
        typeof project.pg_version === 'number' ? project.pg_version : null,
      dataSizeBytes:
        typeof project.data_storage_bytes_hourly_average === 'number'
          ? project.data_storage_bytes_hourly_average
          : null,
      limitBytes:
        typeof project.branch_logical_size_limit === 'number'
          ? project.branch_logical_size_limit
          : null,
    }
  } catch (error) {
    console.error('getVercelDataUsage_NEON:', error)
    return null
  }
}

const getKvUsage = async () => {
  try {
    const keyCount = await kv.dbsize()
    return { keyCount }
  } catch (error) {
    console.error('getVercelDataUsage_KV:', error)
    return null
  }
}

export async function getVercelDataUsage(): Promise<
  ActionResponse<PlatformDataUsage>
> {
  try {
    const admin = await assertAdmin()
    if (!admin || 'success' in admin) return admin

    const [blob, database, neon, kvUsage] = await Promise.all([
      getBlobUsage(),
      getDatabaseUsage(),
      getNeonProjectInfo(),
      getKvUsage(),
    ])

    return {
      success: true,
      message: 'Fetched platform data usage successfully',
      data: {
        blob,
        database,
        neon,
        kv: kvUsage,
        runtime: {
          environment:
            process.env.VERCEL_ENV ??
            process.env.NEXT_PUBLIC_VERCEL_ENV ??
            null,
          region: process.env.VERCEL_REGION ?? null,
          projectId: process.env.VERCEL_PROJECT_ID ?? null,
          appUrl: process.env.NEXT_PUBLIC_APP_URL ?? null,
        },
      },
    }
  } catch (error) {
    console.error('getVercelDataUsage_ERROR:', error)
    Sentry.captureException(error)
    return {
      success: false,
      message:
        toClientMessage(error, 'A data fetch error occurred'),
      errors: error,
    }
  }
}
