<script setup lang="ts">
import type { Attendee } from '~/data/attendees'
import { useAttendanceStore, type Status } from '~/stores/attendance'

const props = defineProps<{ attendee: Attendee }>()
const store = useAttendanceStore()

const status = computed<Status>(() => store.statuses[props.attendee.id] ?? null)
const saveState = computed(() => store.saveState[props.attendee.id] ?? null)

const initials = computed(() =>
  props.attendee.name
    .split(' ')
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()
)
</script>

<template>
  <div
    class="attendee-card group relative flex flex-col gap-4 rounded-2xl border border-slate-800 bg-surface/70 p-4 backdrop-blur transition-colors duration-300 sm:flex-row sm:items-center sm:justify-between"
    :class="{
      'border-present/50 bg-present/5': status === 'present',
      'border-absent/50 bg-absent/5': status === 'absent'
    }"
  >
    <div class="flex min-w-0 items-center gap-4">
      <div
        class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-slate-700 to-slate-800 text-sm font-semibold text-slate-200 ring-1 ring-slate-700"
      >
        {{ initials || '?' }}
      </div>
      <div class="min-w-0">
        <p class="truncate font-semibold text-slate-100">{{ attendee.name }}</p>
        <div class="mt-0.5 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-slate-400">
          <span v-if="attendee.phone" class="whitespace-nowrap">{{ attendee.phone }}</span>
          <span v-if="attendee.email" class="truncate">{{ attendee.email }}</span>
          <span v-if="attendee.location" class="truncate text-slate-500">{{ attendee.location }}</span>
        </div>
      </div>
    </div>

    <div class="flex shrink-0 items-center gap-2">
      <span class="flex w-5 justify-center" aria-hidden="true">
        <svg
          v-if="saveState === 'saving'"
          class="h-4 w-4 animate-spin text-slate-400"
          viewBox="0 0 24 24"
          fill="none"
        >
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
        </svg>
        <svg
          v-else-if="saveState === 'saved'"
          class="h-4 w-4 text-present"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fill-rule="evenodd"
            d="M16.7 5.3a1 1 0 010 1.4l-7.5 7.5a1 1 0 01-1.4 0L3.3 9.7a1 1 0 011.4-1.4l3.1 3.1 6.8-6.8a1 1 0 011.4 0z"
            clip-rule="evenodd"
          />
        </svg>
        <svg
          v-else-if="saveState === 'error'"
          class="h-4 w-4 text-absent"
          viewBox="0 0 20 20"
          fill="currentColor"
          title="Failed to save"
        >
          <path
            fill-rule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM9 5h2v6H9V5zm0 8h2v2H9v-2z"
            clip-rule="evenodd"
          />
        </svg>
      </span>
      <button
        type="button"
        class="rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-200 active:scale-95"
        :class="
          status === 'present'
            ? 'bg-present text-white shadow-lg shadow-present/30'
            : 'bg-slate-800 text-slate-300 hover:bg-present/20 hover:text-present'
        "
        @click="store.setStatus(attendee.id, 'present')"
      >
        Present
      </button>
      <button
        type="button"
        class="rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-200 active:scale-95"
        :class="
          status === 'absent'
            ? 'bg-absent text-white shadow-lg shadow-absent/30'
            : 'bg-slate-800 text-slate-300 hover:bg-absent/20 hover:text-absent'
        "
        @click="store.setStatus(attendee.id, 'absent')"
      >
        Absent
      </button>
    </div>
  </div>
</template>
