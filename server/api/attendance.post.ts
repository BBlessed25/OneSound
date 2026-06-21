interface AttendanceRecord {
  name: string
  phone: string
  email: string
  location: string
  status: 'present' | 'absent'
}

interface AttendancePayload {
  takenAt: string
  records: AttendanceRecord[]
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const scriptUrl = config.googleScriptUrl as string

  const body = await readBody<AttendancePayload>(event)

  if (!body?.records?.length) {
    setResponseStatus(event, 400)
    return { ok: false, error: 'No attendance records were provided.' }
  }

  if (!scriptUrl) {
    setResponseStatus(event, 500)
    return {
      ok: false,
      error:
        'Google Sheets is not configured. Set NUXT_GOOGLE_SCRIPT_URL in your .env (see README).'
    }
  }

  try {
    // Apps Script Web Apps require following the redirect it issues.
    const result = await $fetch<{ ok?: boolean; saved?: number; error?: string }>(
      scriptUrl,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: {
          secret: config.googleScriptSecret || undefined,
          takenAt: body.takenAt,
          records: body.records
        }
      }
    )

    if (result && result.ok === false) {
      setResponseStatus(event, 502)
      return { ok: false, error: result.error || 'Google Script rejected the request.' }
    }

    return { ok: true, saved: result?.saved ?? body.records.length }
  } catch (err: any) {
    setResponseStatus(event, 502)
    return {
      ok: false,
      error:
        err?.message ||
        'Failed to forward the records to Google Sheets. Check the script URL and deployment access.'
    }
  }
})
