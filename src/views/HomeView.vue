<template>
    <div class="HomeView">

        <!-- Info header -->
        <div class="home-header">
            <div class="home-greeting">
                <span class="home-greeting-label">{{ greetingLabel }}</span>
                <span class="home-date-full">{{ fullDateLabel }}</span>
            </div>

            <div ref="statsRef" class="home-stats">
                <div class="home-stat-card">
                    <span class="home-stat-value">{{ dayOfYear }}</span>
                    <span class="home-stat-label">{{ t('custom.home.day_of_year') }}</span>
                </div>
                <div class="home-stat-card">
                    <span class="home-stat-value">{{ weekNumber }}</span>
                    <span class="home-stat-label">{{ t('custom.home.week') }}</span>
                </div>
                <div class="home-stat-card">
                    <span class="home-stat-value">{{ daysUntilYearEnd }}</span>
                    <span class="home-stat-label">{{ t('custom.home.remaining_days') }}</span>
                </div>
            </div>
        </div>

        <!-- Calendar -->
        <CalendarComponent :model-value="todayStr" />

    </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import gsap from 'gsap';
import CalendarComponent from '@/components/Informative/CalendarComponent.vue';
import { GetLanguagedText } from '@/helpers/language_helper';

const statsRef = ref<HTMLElement | null>(null);

function t(path: string): string {
    return GetLanguagedText(path);
}

const today = new Date();
today.setHours(0, 0, 0, 0);

const todayStr = computed<string>(() => {
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
});

const greetingLabel = computed<string>(() => {
    const h = new Date().getHours();
    if (h < 12) return t('custom.home.greeting_morning');
    if (h < 18) return t('custom.home.greeting_afternoon');
    return t('custom.home.greeting_evening');
});

const fullDateLabel = computed<string>(() =>
    today.toLocaleDateString('es', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    })
);

const dayOfYear = computed<number>(() => {
    const start = new Date(today.getFullYear(), 0, 0);
    const diff = today.getTime() - start.getTime();
    return Math.floor(diff / 86_400_000);
});

const weekNumber = computed<number>(() => {
    const d = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil(((d.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7);
});

const daysUntilYearEnd = computed<number>(() => {
    const yearEnd = new Date(today.getFullYear(), 11, 31);
    return Math.round((yearEnd.getTime() - today.getTime()) / 86_400_000);
});

onMounted(() => {
    const cards = statsRef.value?.querySelectorAll('.home-stat-card');
    if (!cards || cards.length === 0) return;
    gsap.fromTo(
        cards,
        { y: 14, opacity: 0, scale: 0.94 },
        { y: 0, opacity: 1, scale: 1, duration: 0.4, stagger: 0.08, ease: 'back.out(1.7)', clearProps: 'transform,opacity' }
    );
});
</script>

<style scoped>
.HomeView {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-large, 1.5rem);
    padding: var(--spacing-large, 1.5rem);
    height: 100%;
}

.HomeView :deep(.Calendar) {
    flex: 1;
    min-height: 0;
}

/* ── Header ── */
.home-header {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-medium, 1rem);
}

.home-greeting {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
}

.home-greeting-label {
    font-size: var(--font-size-large, 1.25rem);
    font-weight: 600;
    color: var(--gray-800);
}

.home-date-full {
    font-size: var(--font-size-small, 0.85rem);
    color: var(--gray-500);
    text-transform: capitalize;
}

/* ── Stat cards ── */
.home-stats {
    display: flex;
    gap: var(--spacing-small, 0.5rem);
}

.home-stat-card {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: var(--spacing-medium, 1rem) var(--spacing-small, 0.5rem);
    background: var(--bg-light);
    border: var(--border-width-thin) solid var(--gray-300);
    border-radius: var(--border-radius);
    gap: 0.2rem;
    transition: transform var(--transition-normal) var(--timing-bounce),
                box-shadow var(--transition-normal) var(--timing-ease);
}

.home-stat-card:hover {
    transform: translateY(-3px) scale(1.03);
    box-shadow: var(--shadow-medium);
}

.home-stat-value {
    font-size: 1.4rem;
    font-weight: 700;
    color: var(--purple-1);
    line-height: 1;
}

.home-stat-label {
    font-size: 0.7rem;
    color: var(--gray-500);
    text-align: center;
    line-height: 1.2;
}


</style>
