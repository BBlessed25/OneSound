<script setup lang="ts">
import { useAttendanceStore } from '~/stores/attendance'
import logoUrl from '~/assets/onesoundlogo.jpg'

const store = useAttendanceStore()
const { $gsap } = useNuxtApp()

const headerRef = ref<HTMLElement | null>(null)
const listRef = ref<HTMLElement | null>(null)

const progress = computed(() =>
  store.total ? Math.round((store.markedCount / store.total) * 100) : 0
)

onMounted(() => {
  $gsap.from(headerRef.value?.children ?? [], {
    y: 24,
    opacity: 0,
    duration: 0.7,
    stagger: 0.08,
    ease: 'power3.out'
  })
})

// Re-run a subtle stagger whenever the filtered list changes.
watch(
  () => store.filtered.map((a) => a.id).join(','),
  async () => {
    await nextTick()
    const cards = listRef.value?.querySelectorAll('.attendee-card')
    if (cards?.length) {
      $gsap.from(cards, {
        y: 16,
        opacity: 0,
        duration: 0.4,
        stagger: 0.02,
        ease: 'power2.out',
        overwrite: true
      })
    }
  }
)

const filters = [
  { key: 'all', label: 'All' },
  { key: 'present', label: 'Present' },
  { key: 'absent', label: 'Absent' },
  { key: 'unmarked', label: 'Unmarked' }
] as const
</script>

<template>
  <div class="min-h-screen">
    <!-- Ambient background -->
    <div class="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div class="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" />
      <div class="absolute top-1/3 -right-32 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl" />
    </div>

    <!-- Top nav -->
    <nav class="sticky top-0 z-20 border-b border-slate-800 bg-ink/80 backdrop-blur">
      <div class="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3">
        <img
          :src="logoUrl"
          alt="One Sound Charity logo"
          class="h-10 w-auto rounded-md"
        />
        <span class="text-sm font-semibold tracking-wide text-slate-200">
          One Sound Charity
        </span>
      </div>
    </nav>

    <div class="mx-auto max-w-3xl px-4 py-10 sm:py-16">
      <header ref="headerRef" class="mb-8">
        <span
          class="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-surface/60 px-3 py-1 text-xs font-medium text-slate-400"
        >
          <span class="h-1.5 w-1.5 rounded-full bg-present" /> Live attendance
        </span>
        <h1 class="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl">
          ONESOUND CHARITY - OPEN PANTRY
        </h1>
        <p class="mt-2 text-lg font-semibold tracking-wide text-slate-300 sm:text-xl">
          ATTENDANCE LIST
        </p>
      </header>

      <!-- Stats -->
      <section class="mb-6 grid grid-cols-3 gap-3">
        <div class="rounded-2xl border border-slate-800 bg-surface/60 p-4">
          <p class="text-2xl font-bold text-present">{{ store.presentCount }}</p>
          <p class="text-xs uppercase tracking-wide text-slate-500">Present</p>
        </div>
        <div class="rounded-2xl border border-slate-800 bg-surface/60 p-4">
          <p class="text-2xl font-bold text-absent">{{ store.absentCount }}</p>
          <p class="text-xs uppercase tracking-wide text-slate-500">Absent</p>
        </div>
        <div class="rounded-2xl border border-slate-800 bg-surface/60 p-4">
          <p class="text-2xl font-bold text-slate-200">{{ store.markedCount }}/{{ store.total }}</p>
          <p class="text-xs uppercase tracking-wide text-slate-500">Marked</p>
        </div>
      </section>

      <!-- Progress bar -->
      <div class="mb-6 h-2 w-full overflow-hidden rounded-full bg-slate-800">
        <div
          class="h-full rounded-full bg-gradient-to-r from-emerald-500 to-indigo-500 transition-all duration-500"
          :style="{ width: progress + '%' }"
        />
      </div>

      <!-- Controls -->
      <div class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          v-model="store.query"
          type="search"
          placeholder="Search name, email, phone, location..."
          class="w-full rounded-xl border border-slate-800 bg-surface/60 px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 outline-none transition focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/20"
        />
        <div class="flex gap-2">
          <button
            type="button"
            class="whitespace-nowrap rounded-xl border border-slate-800 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:border-present/50 hover:text-present"
            @click="store.markAll('present')"
          >
            All present
          </button>
          <button
            type="button"
            class="whitespace-nowrap rounded-xl border border-slate-800 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:border-slate-600"
            @click="store.reset()"
          >
            Reset
          </button>
        </div>
      </div>

      <!-- Filter tabs -->
      <div class="mb-6 flex flex-wrap gap-2">
        <button
          v-for="f in filters"
          :key="f.key"
          type="button"
          class="rounded-full px-3 py-1.5 text-xs font-semibold transition"
          :class="
            store.filter === f.key
              ? 'bg-slate-100 text-slate-900'
              : 'bg-surface/60 text-slate-400 hover:text-slate-200'
          "
          @click="store.filter = f.key"
        >
          {{ f.label }}
        </button>
      </div>

      <!-- List -->
      <div ref="listRef" class="flex flex-col gap-3">
        <AttendeeCard v-for="a in store.filtered" :key="a.id" :attendee="a" />
        <p
          v-if="store.filtered.length === 0"
          class="rounded-2xl border border-dashed border-slate-800 py-10 text-center text-sm text-slate-500"
        >
          No attendees match your search.
        </p>
      </div>

      <!-- Footer -->
      <footer class="mt-12 text-center text-sm text-slate-500">
        <p>One Sound Charity &copy; 2026</p>
        <p class="mt-1">Gospel Pillars Canada</p>
      </footer>
    </div>

    <!-- Toast -->
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0 translate-y-2"
      leave-active-class="transition duration-200 ease-in"
      leave-to-class="opacity-0 translate-y-2"
    >
      <div
        v-if="store.toast"
        class="fixed bottom-6 left-1/2 z-30 -translate-x-1/2 rounded-xl border px-4 py-2.5 text-sm font-medium shadow-lg backdrop-blur"
        :class="
          store.toast.ok
            ? 'border-present/40 bg-present/10 text-present'
            : 'border-absent/40 bg-absent/10 text-absent'
        "
      >
        {{ store.toast.message }}
      </div>
    </Transition>
  </div>
</template>
