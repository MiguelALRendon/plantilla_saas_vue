<template>
    <div class="Calendar">
        <div class="calendar-header">
            <button class="calendar-nav-btn" @click="prevMonth" type="button">
                <span :class="[GGCLASS]">{{ GGICONS.CHEVRON_LEFT }}</span>
            </button>
            <span class="calendar-title">{{ monthYearLabel }}</span>
            <button class="calendar-nav-btn" @click="nextMonth" type="button">
                <span :class="[GGCLASS]">{{ GGICONS.CHEVRON_RIGHT }}</span>
            </button>
        </div>

        <div class="calendar-grid">
            <span v-for="d in weekDays" :key="d" class="calendar-weekday">{{ d }}</span>

            <button
                v-for="cell in cells"
                :key="cell.key"
                type="button"
                class="calendar-day"
                :class="{
                    'other-month': !cell.currentMonth,
                    'today': cell.isToday,
                    'selected': cell.isSelected
                }"
                @click="selectDay(cell.dateStr)"
            >
                {{ cell.day }}
            </button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { GGICONS, GGCLASS } from '@/constants/ggicons';
import { computed, ref } from 'vue';

interface Props {
    modelValue?: string; // YYYY-MM-DD
}

const props = withDefaults(defineProps<Props>(), {
    modelValue: ''
});

const emit = defineEmits<{
    (e: 'select', dateStr: string): void;
}>();

const weekDays = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá'];

const today = new Date();
today.setHours(0, 0, 0, 0);

const viewYear = ref<number>(today.getFullYear());
const viewMonth = ref<number>(today.getMonth()); // 0-indexed

const monthYearLabel = computed<string>(() => {
    const d = new Date(viewYear.value, viewMonth.value, 1);
    return d.toLocaleDateString('es', { month: 'long', year: 'numeric' });
});

interface CalendarCell {
    key: string;
    day: number;
    dateStr: string;
    currentMonth: boolean;
    isToday: boolean;
    isSelected: boolean;
}

const cells = computed<CalendarCell[]>(() => {
    const year = viewYear.value;
    const month = viewMonth.value;

    const firstDay = new Date(year, month, 1).getDay(); // 0 = Sun
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const result: CalendarCell[] = [];

    // Days from previous month to fill first row
    for (let i = firstDay - 1; i >= 0; i--) {
        const day = daysInPrevMonth - i;
        const prevMonth = month === 0 ? 11 : month - 1;
        const prevYear = month === 0 ? year - 1 : year;
        const dateStr = toDateStr(prevYear, prevMonth, day);
        result.push(makeCell(dateStr, day, false));
    }

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
        const dateStr = toDateStr(year, month, d);
        result.push(makeCell(dateStr, d, true));
    }

    // Fill remaining cells to complete grid rows (max 42 cells)
    const remaining = 42 - result.length;
    const nextMonth = month === 11 ? 0 : month + 1;
    const nextYear = month === 11 ? year + 1 : year;
    for (let d = 1; d <= remaining; d++) {
        const dateStr = toDateStr(nextYear, nextMonth, d);
        result.push(makeCell(dateStr, d, false));
    }

    return result;
});

function toDateStr(year: number, month: number, day: number): string {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function makeCell(dateStr: string, day: number, currentMonth: boolean): CalendarCell {
    const cellDate = new Date(`${dateStr}T00:00:00`);
    return {
        key: dateStr,
        day,
        dateStr,
        currentMonth,
        isToday: cellDate.getTime() === today.getTime(),
        isSelected: props.modelValue === dateStr,
    };
}

function prevMonth(): void {
    if (viewMonth.value === 0) {
        viewMonth.value = 11;
        viewYear.value--;
    } else {
        viewMonth.value--;
    }
}

function nextMonth(): void {
    if (viewMonth.value === 11) {
        viewMonth.value = 0;
        viewYear.value++;
    } else {
        viewMonth.value++;
    }
}

function selectDay(dateStr: string): void {
    emit('select', dateStr);
}
</script>

<style scoped>
.Calendar {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-small);
    padding: var(--padding-medium);
    background: var(--bg-gray);
    border-radius: var(--border-radius);
    min-width: 300px;
    height: 100%;
    min-height: 0;
}

.calendar-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--spacing-small);
}

.calendar-title {
    font-size: var(--font-size-sm);
    font-weight: 600;
    color: var(--gray-medium);
    text-transform: capitalize;
    flex: 1;
    text-align: center;
}

.calendar-nav-btn {
    background: none;
    border: none;
    cursor: pointer;
    padding: var(--spacing-xs);
    border-radius: var(--border-radius);
    display: flex;
    align-items: center;
    color: var(--sky);
    transition: background-color var(--transition-fast) var(--timing-ease);
}

.calendar-nav-btn:hover {
    background-color: var(--gray-lighter);
}

.calendar-nav-btn span {
    font-size: 1.2rem;
}

.calendar-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    grid-auto-rows: 1fr;
    gap: 2px;
    flex: 1;
    min-height: 0;
}

.calendar-weekday {
    text-align: center;
    font-size: var(--font-size-xs);
    font-weight: 600;
    color: var(--gray-light);
    padding: var(--spacing-xs) 0;
}

.calendar-day {
    background: none;
    border: none;
    border-radius: var(--border-radius);
    cursor: pointer;
    font-size: var(--font-size-sm);
    color: var(--gray-medium);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background-color var(--transition-fast) var(--timing-ease),
                color var(--transition-fast) var(--timing-ease);
    width: 100%;
    height: 100%;
}

.calendar-day:hover:not([disabled]) {
    background-color: var(--gray-lighter);
}

.calendar-day.other-month {
    color: var(--gray-lighter);
}

.calendar-day.today {
    border: 1px solid var(--sky);
    color: var(--sky);
    font-weight: 600;
}

.calendar-day.selected {
    background-color: var(--sky);
    color: var(--white);
    font-weight: 600;
}

.calendar-day.selected.today {
    border-color: var(--blue-1);
}
</style>
