import { defineStore } from 'pinia'
import { attendees as attendeeData, type Attendee } from '~/data/attendees'

export type Status = 'present' | 'absent' | null
export type SaveState = 'saving' | 'saved' | 'error' | null

interface Toast {
  ok: boolean
  message: string
}

export const useAttendanceStore = defineStore('attendance', {
  state: () => ({
    attendees: attendeeData as Attendee[],
    statuses: {} as Record<number, Status>,
    saveState: {} as Record<number, SaveState>,
    query: '',
    filter: 'all' as 'all' | 'present' | 'absent' | 'unmarked',
    syncing: 0,
    toast: null as Toast | null
  }),

  getters: {
    presentCount: (state) =>
      Object.values(state.statuses).filter((s) => s === 'present').length,
    absentCount: (state) =>
      Object.values(state.statuses).filter((s) => s === 'absent').length,
    markedCount(): number {
      return this.presentCount + this.absentCount
    },
    total: (state) => state.attendees.length,
    filtered(state): Attendee[] {
      const q = state.query.trim().toLowerCase()
      return state.attendees.filter((a) => {
        const status = state.statuses[a.id] ?? null
        if (state.filter === 'present' && status !== 'present') return false
        if (state.filter === 'absent' && status !== 'absent') return false
        if (state.filter === 'unmarked' && status !== null) return false
        if (!q) return true
        return (
          a.name.toLowerCase().includes(q) ||
          a.email.toLowerCase().includes(q) ||
          a.phone.toLowerCase().includes(q) ||
          a.location.toLowerCase().includes(q)
        )
      })
    }
  },

  actions: {
    /**
     * Mark a person present/absent and immediately push the row to Google
     * Sheets. Tapping the active status again toggles it off locally (no row
     * is sent for "unmarked").
     */
    async setStatus(id: number, status: Exclude<Status, null>) {
      const next = this.statuses[id] === status ? null : status
      this.statuses[id] = next
      if (next === null) return

      const attendee = this.attendees.find((a) => a.id === id)
      if (!attendee) return

      await this.send([{ ...attendee, status: next }], id)
    },

    async markAll(status: Exclude<Status, null>) {
      for (const a of this.attendees) this.statuses[a.id] = status
      const records = this.attendees.map((a) => ({ ...a, status }))
      await this.send(records)
    },

    /** Clears the on-screen marks only. Rows already in the sheet stay. */
    reset() {
      this.statuses = {}
      this.saveState = {}
      this.toast = null
    },

    showToast(toast: Toast) {
      this.toast = toast
      if (import.meta.client) {
        setTimeout(() => {
          if (this.toast === toast) this.toast = null
        }, 3500)
      }
    },

    async send(
      records: Array<Attendee & { status: Exclude<Status, null> }>,
      id?: number
    ) {
      if (!records.length) return
      this.syncing++
      if (id !== undefined) this.saveState[id] = 'saving'

      const payload = {
        takenAt: new Date().toISOString(),
        records: records.map((r) => ({
          name: r.name,
          phone: r.phone,
          email: r.email,
          location: r.location,
          status: r.status
        }))
      }

      try {
        const res = await $fetch<{ ok: boolean; saved?: number; error?: string }>(
          '/api/attendance',
          { method: 'POST', body: payload }
        )
        if (res.ok) {
          if (id !== undefined) this.saveState[id] = 'saved'
          this.showToast({
            ok: true,
            message:
              records.length === 1
                ? `Saved ${records[0].name} (${records[0].status}).`
                : `Saved ${res.saved ?? records.length} records.`
          })
        } else {
          if (id !== undefined) this.saveState[id] = 'error'
          this.showToast({ ok: false, message: res.error || 'Save failed.' })
        }
      } catch (err: any) {
        if (id !== undefined) this.saveState[id] = 'error'
        this.showToast({
          ok: false,
          message:
            err?.data?.error ||
            err?.message ||
            'Could not reach the server. Check your Google Script URL.'
        })
      } finally {
        this.syncing--
      }
    }
  }
})
