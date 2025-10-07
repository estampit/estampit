import type { Json } from '@/types/database.types'

export type SettingsObject = Record<string, any>

export function isPlainObject(value: unknown): value is Record<string, any> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export function ensureSettingsObject(candidate: unknown): SettingsObject {
  if (isPlainObject(candidate)) {
    return candidate as SettingsObject
  }
  return {}
}

export function normalizeSettingKey(key: string): string {
  return key.replace(/[_\s-]/g, '').toLowerCase()
}

export function resolveSettingKey(obj: Record<string, any>, segment: string): string | null {
  if (Object.prototype.hasOwnProperty.call(obj, segment)) {
    return segment
  }

  const normalizedSegment = normalizeSettingKey(segment)
  for (const candidate of Object.keys(obj)) {
    if (normalizeSettingKey(candidate) === normalizedSegment) {
      return candidate
    }
  }

  return null
}

export function resolveSettingPath(settings: Record<string, any>, path: string): unknown {
  const segments = path.split('.').map((segment) => segment.trim()).filter(Boolean)
  let current: unknown = settings

  for (const segment of segments) {
    if (Array.isArray(current)) {
      const index = Number(segment)
      if (!Number.isInteger(index) || index < 0 || index >= current.length) {
        return undefined
      }
      current = current[index]
      continue
    }

    if (!isPlainObject(current)) {
      return undefined
    }

    const key = resolveSettingKey(current as Record<string, any>, segment)
    if (!key) {
      return undefined
    }

    current = (current as Record<string, any>)[key]
  }

  return current
}

export function createSettingsAccessor(settings: SettingsObject) {
  return (...paths: string[]) => {
    for (const path of paths) {
      if (!path) continue
      const value = resolveSettingPath(settings, path)
      if (value === null || value === undefined) {
        continue
      }
      if (typeof value === 'string') {
        const trimmed = value.trim()
        if (trimmed.length > 0) {
          return trimmed
        }
      } else if (typeof value === 'number' || typeof value === 'boolean') {
        const text = String(value).trim()
        if (text.length > 0) {
          return text
        }
      }
    }
    return null
  }
}

export function deepMergeSettings<T extends Record<string, any>>(target: T | null | undefined, source: Record<string, any>): T {
  const base: Record<string, any> = isPlainObject(target) ? { ...target } : {}

  for (const [key, value] of Object.entries(source)) {
    const existing = base[key]

    if (isPlainObject(value)) {
      base[key] = deepMergeSettings(isPlainObject(existing) ? existing : {}, value)
      continue
    }

    if (Array.isArray(value)) {
      base[key] = [...value]
      continue
    }

    base[key] = value
  }

  return base as T
}

export type SettingsValue = Json | Json[] | undefined
