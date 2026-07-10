#!/usr/bin/env node

/**
 * Transform raw AWS Events API response into sessions.json format.
 *
 * Usage:
 *   node scripts/fetch-sessions.mjs <raw-response.json> [options]
 *
 * Options:
 *   --timezone <tz>     Timezone for sessions (default: "America/Bogota")
 *   --date <YYYY-MM-DD> Override event date (default: from sessionTime.date)
 *   --output <path>     Output file (default: src/data/sessions.json)
 *
 * Supported response shapes:
 *   - { data: { catalogData: { session: [...] } } }       (Bogota 2026 format)
 *   - { data: { listSessions: { results: [...] } } }      (re:Invent format)
 *   - Flat array of session objects
 */

import { readFileSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PROJECT_ROOT = resolve(__dirname, '..')

const SESSION_TYPE_MAP = {
  'sesión grupal': 'Breakout session',
  'charlas relámpago': 'Lightning talk',
  'charla de código': 'Code talk',
  taller: 'Workshop',
  'charlas explicativas': 'Chalk talk',
  'sesión de creadores': 'Session with AWS Creators',
  'charlas de desarrollo': 'Dev chat',
  'charla sobre startups': 'Start-up session',
  keynote: 'Keynote',
}

function parseArgs() {
  const args = process.argv.slice(2)
  const opts = {
    inputFile: null,
    timezone: 'America/Bogota',
    dateOverride: null,
    output: null,
  }

  for (let i = 0; i < args.length; i++) {
    const arg = args[i]
    if (arg === '--timezone' && args[i + 1]) {
      opts.timezone = args[++i]
    } else if (arg === '--date' && args[i + 1]) {
      opts.dateOverride = args[++i]
    } else if (arg === '--output' && args[i + 1]) {
      opts.output = args[++i]
    } else if (arg === '--help' || arg === '-h') {
      console.log(`
Usage: node scripts/fetch-sessions.mjs <raw-response.json> [options]

Options:
  --timezone <tz>      IANA timezone (default: "America/Bogota")
  --date <YYYY-MM-DD>  Override event date for all sessions
  --output <path>      Output file (default: src/data/sessions.json)
  --help               Show this help message

Examples:
  node scripts/fetch-sessions.mjs bogota-sessions.json
  node scripts/fetch-sessions.mjs bogota-sessions.json --date "2026-07-30"
  node scripts/fetch-sessions.mjs bogota-sessions.json --output src/data/sessions.json
`)
      process.exit(0)
    } else if (!arg.startsWith('--')) {
      opts.inputFile = arg
    }
  }

  if (!opts.inputFile) {
    console.error('Error: No input file specified.')
    console.error('Run with --help for usage information.')
    process.exit(1)
  }

  return opts
}

function extractCustomField(customFields, category) {
  if (!customFields || typeof customFields !== 'object') return []
  const group = customFields[category]
  if (!group || typeof group !== 'object') return []
  return Object.keys(group).filter((k) => group[k] === true)
}

function transformSession(raw, opts) {
  const id = raw.sessionID || raw.abbreviation || raw.alias || ''
  const title = raw.title || raw.name || ''
  const type = SESSION_TYPE_MAP[raw.type?.toLowerCase()] || raw.type || ''
  const level = raw['Session-Level'] || raw.level || ''
  const abstract = raw.abstract || raw.description || ''

  const time = raw.sessionTime?.time || ''
  const date = opts.dateOverride || raw.sessionTime?.date || ''
  const room = raw.sessionTime?.room || ''
  const length = parseInt(raw.sessionTime?.length || raw.length || '0', 10) || 0

  const speakers = (raw.speaker || []).map((s) => s.fullName).filter(Boolean)

  const jobRolesRaw = raw['Job-Role'] || ''
  const jobRolesCustom = extractCustomField(raw.customFields, 'Job Role')
  const jobRoles = jobRolesCustom.length > 0
    ? jobRolesCustom
    : jobRolesRaw.split('|').map((s) => s.trim()).filter(Boolean)

  const industries = raw.Industry || extractCustomField(raw.customFields, 'Industry') || []
  const track = raw.Track || extractCustomField(raw.customFields, 'Topic') || []
  const areasOfInterest = extractCustomField(raw.customFields, 'Area of Interest')
  const services = extractCustomField(raw.customFields, 'Services')
  const sessionFeatures = extractCustomField(raw.customFields, 'Session Features')

  return {
    id,
    title,
    type,
    level,
    abstract,
    time,
    date,
    timezone: opts.timezone,
    room,
    length,
    speakers,
    jobRoles,
    industries,
    track,
    areasOfInterest,
    services,
    sessionFeatures,
    status: 'modified',
  }
}

function main() {
  const opts = parseArgs()

  const inputPath = resolve(opts.inputFile)
  let raw

  try {
    raw = JSON.parse(readFileSync(inputPath, 'utf-8'))
  } catch (err) {
    console.error(`Error reading input file: ${err.message}`)
    process.exit(1)
  }

  let sessions = []

  if (Array.isArray(raw)) {
    sessions = raw
  } else if (raw?.data?.catalogData?.session) {
    sessions = raw.data.catalogData.session
  } else if (raw?.data?.listSessions?.results) {
    sessions = raw.data.listSessions.results
  } else if (raw?.data?.listSessions) {
    sessions = Array.isArray(raw.data.listSessions)
      ? raw.data.listSessions
      : [raw.data.listSessions]
  } else if (raw?.results) {
    sessions = raw.results
  } else {
    console.error('Unrecognized response shape. Expected:')
    console.error('  - { data: { catalogData: { session: [...] } } }')
    console.error('  - { data: { listSessions: { results: [...] } } }')
    console.error('  - Flat array of session objects')
    process.exit(1)
  }

  if (sessions.length === 0) {
    console.error('No sessions found in the response.')
    process.exit(1)
  }

  console.log(`Transforming ${sessions.length} sessions...`)

  const transformed = sessions
    .map((s) => transformSession(s, opts))
    .filter((s) => s.id && s.title)

  const missingSpeakers = transformed.filter((s) => s.speakers.length === 0)
  if (missingSpeakers.length > 0) {
    console.log(`Note: ${missingSpeakers.length} sessions have no speaker data.`)
  }

  const outputPath = opts.output
    ? resolve(opts.output)
    : resolve(PROJECT_ROOT, 'src/data/sessions.json')

  writeFileSync(outputPath, JSON.stringify(transformed, null, 2) + '\n', 'utf-8')
  console.log(`Wrote ${transformed.length} sessions to ${outputPath}`)
}

main()
