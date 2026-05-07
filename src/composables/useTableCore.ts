import { computed, ref, watch, type Ref } from 'vue';

import GGICONS from '@/constants/ggicons';
import { BaseEntity } from '@/entities/base_entity';
import { EnumAdapter } from '@/models/enum_adapter';
import Application from '@/models/application';
import ColumnFilterPanelComponent from '@/components/Form/ColumnFilterPanelComponent.vue';

// #region TYPES

/**
 * Optional server-side pagination configuration.
 * When provided, totalCount is driven by `total` and every page change
 * triggers `onPageChange` so the consumer can re-fetch from the API.
 */
interface ServerPagination {
    /** Reactive total record count returned by the server. */
    total: Ref<number>;
    /** Called whenever the page/size changes (navigation, page-size select). */
    onPageChange: () => void;
}

export interface UseTableCoreOptions {
    /**
     * Pre-filtered data rows.
     * For form inputs (ArrayInputComponent) this is the search-filtered modelValue.
     * For list views (DefaultListView) this is the API-loaded page slice.
     */
    sourceData: Ref<BaseEntity[]>;
    /**
     * Reactive map of visible column key → display label.
     * Drives columnOrder initialisation and is used for filter-panel titles.
     */
    visibleProperties: Ref<Record<string, string>>;
    /** i18n helper — called with translation keys like 'common.records_count'. */
    t: (key: string) => string;
    /**
     * Optional server-side pagination.
     * Absent → client-side (in-memory slice).
     * Present → paginatedItems returns sortedItems as-is (already a page from server).
     */
    serverPagination?: ServerPagination;
}

// #endregion

/**
 * Shared table-core composable.
 *
 * Encapsulates all column-management (sort, resize, drag-reorder, column filters)
 * and pagination logic that is identical between ArrayInputComponent (form input)
 * and DefaultListView (list view).
 *
 * Each consumer keeps its own responsibilities:
 *  - ArrayInputComponent: toolbar, selection, v-model, form validation
 *  - DefaultListView: API loading, row-click navigation, boolean/CSS rendering
 */
export function useTableCore(options: UseTableCoreOptions) {
    const { sourceData, visibleProperties, t, serverPagination } = options;

    // #region STATE

    // ── Column resize ─────────────────────────────────────────────────────
    const columnWidths: Ref<Record<string, number>> = ref({});
    const MIN_COL_WIDTH = 50; // px — var(--table-width-very-small)
    let resizeColumn = '';
    let resizeStartX = 0;
    let resizeStartWidth = 0;

    // ── Column filters ────────────────────────────────────────────────────
    const columnFilters: Ref<Record<string, unknown[]>> = ref({});

    // ── Sort ──────────────────────────────────────────────────────────────
    const sortColumn = ref<string>('');
    const sortDirection = ref<'asc' | 'desc' | null>(null);

    // ── Column drag-reorder ───────────────────────────────────────────────
    const columnOrder = ref<string[]>([]);
    const dragSourceKey = ref<string | null>(null);
    const dragOverKey = ref<string | null>(null);

    // ── Pagination ────────────────────────────────────────────────────────
    const pageSizeOptions: (number | 'ALL')[] = [10, 20, 50, 100, 'ALL'];
    const pageSize = ref<number | 'ALL'>(10);
    const currentPage = ref<number>(1);

    // #endregion

    // #region COMPUTED

    /** Apply active column filters to sourceData. */
    const filteredItems = computed<BaseEntity[]>(() => {
        const active = columnFilters.value;
        const keys = Object.keys(active).filter(k => (active[k]?.length ?? 0) > 0);
        if (keys.length === 0) return sourceData.value;
        return sourceData.value.filter(item =>
            keys.every(col => active[col].includes(getCellValue(item, col)))
        );
    });

    /** In-memory sort applied after column filters. */
    const sortedItems = computed<BaseEntity[]>(() => {
        if (!sortColumn.value || !sortDirection.value) return filteredItems.value;
        const col = sortColumn.value;
        const dir = sortDirection.value;
        return [...filteredItems.value].sort((a, b) => {
            const aVal = getCellValue(a, col);
            const bVal = getCellValue(b, col);
            const aNum = Number(aVal);
            const bNum = Number(bVal);
            const cmp = !isNaN(aNum) && !isNaN(bNum)
                ? aNum - bNum
                : String(aVal).localeCompare(String(bVal));
            return dir === 'asc' ? cmp : -cmp;
        });
    });

    /**
     * Total record count.
     * Server mode: driven by serverPagination.total (from API response).
     * Client mode: length of filtered dataset.
     */
    const totalCount = computed<number>(() =>
        serverPagination ? serverPagination.total.value : filteredItems.value.length
    );

    /**
     * Rows to render in the table body.
     * Server mode: the API already returned the correct page slice → return sortedItems as-is.
     * Client mode: slice sortedItems to the current page window.
     */
    const paginatedItems = computed<BaseEntity[]>(() => {
        if (serverPagination) return sortedItems.value;
        if (pageSize.value === 'ALL') return sortedItems.value;
        const size = pageSize.value as number;
        const start = (currentPage.value - 1) * size;
        return sortedItems.value.slice(start, start + size);
    });

    const totalPages = computed<number>(() => {
        if (pageSize.value === 'ALL' || totalCount.value === 0) return 1;
        return Math.ceil(totalCount.value / (pageSize.value as number));
    });

    const visiblePages = computed<number[]>(() => {
        const total = totalPages.value;
        const current = currentPage.value;
        const delta = 2;
        const pages: number[] = [];
        for (let i = Math.max(1, current - delta); i <= Math.min(total, current + delta); i++) {
            pages.push(i);
        }
        return pages;
    });

    const paginationInfo = computed<string>(() => {
        if (pageSize.value === 'ALL') {
            return t('common.records_count').split('{count}').join(String(totalCount.value));
        }
        const size = pageSize.value as number;
        if (totalCount.value === 0) return t('common.zero_records');
        const start = (currentPage.value - 1) * size + 1;
        const end = Math.min(currentPage.value * size, totalCount.value);
        return t('common.pagination_range')
            .split('{start}').join(String(start))
            .split('{end}').join(String(end))
            .split('{total}').join(String(totalCount.value));
    });

    // #endregion

    // #region CELL VALUE

    function getCellValue(item: BaseEntity, column: string): string {
        const value = item[column];

        if (value instanceof BaseEntity) {
            return String(value.getDefaultPropertyValue() ?? '');
        }

        // SC-017 — enum resolution via EnumAdapter duck-typing
        if (item.isEnumProperty(column) && typeof value === 'number') {
            const adapter = item.getPropertyType(column) as EnumAdapter;
            const found = adapter.getKeyValuePairs().find(pair => pair.value === value);
            if (found) return parseEnumValue(found.key);
        }

        return item.getFormattedValue(column);
    }

    function parseEnumValue(key: string): string {
        return key
            .toLowerCase()
            .split('_')
            .map(word => `${word.charAt(0).toUpperCase()}${word.slice(1)}`)
            .join(' ');
    }

    // #endregion

    // #region SORT

    function toggleSort(colKey: string): void {
        if (sortColumn.value !== colKey) {
            sortColumn.value = colKey;
            sortDirection.value = 'asc';
        } else if (sortDirection.value === 'asc') {
            sortDirection.value = 'desc';
        } else {
            sortColumn.value = '';
            sortDirection.value = null;
        }
    }

    function getSortIcon(colKey: string): string {
        if (sortColumn.value !== colKey || sortDirection.value === null) return GGICONS.SORT;
        return sortDirection.value === 'asc' ? GGICONS.ARROW_UPWARD : GGICONS.ARROW_DOWNWARD;
    }

    // #endregion

    // #region COLUMN FILTER

    function getDistinctValues(column: string): unknown[] {
        const seen = new Set<unknown>();
        for (const item of sourceData.value) {
            seen.add(getCellValue(item, column));
        }
        return Array.from(seen);
    }

    function openColumnFilter(event: MouseEvent, column: string): void {
        const buttonEl = event.currentTarget as HTMLElement;
        const columnLabel = visibleProperties.value[column] ?? column;
        Application.ApplicationUIService.openDropdownMenu(
            buttonEl,
            columnLabel,
            ColumnFilterPanelComponent,
            '18rem',
            {
                distinctValues: getDistinctValues(column),
                activeFilters: columnFilters.value[column] ?? [],
                columnLabel,
                onApply: (selected: unknown[]) => {
                    if (selected.length === 0) {
                        const updated = { ...columnFilters.value };
                        delete updated[column];
                        columnFilters.value = updated;
                    } else {
                        columnFilters.value = { ...columnFilters.value, [column]: selected };
                    }
                    Application.ApplicationUIService.closeDropdownMenu();
                },
                onClear: () => {
                    const updated = { ...columnFilters.value };
                    delete updated[column];
                    columnFilters.value = updated;
                    Application.ApplicationUIService.closeDropdownMenu();
                },
            }
        );
    }

    // #endregion

    // #region COLUMN RESIZE

    const DEFAULT_COL_WIDTH = 250; // px — initial cap before user resizes

    function getColumnStyle(column: string): Record<string, string> | undefined {
        const width = columnWidths.value[column];
        if (!width) return undefined;
        // flex: none ensures both th and td in the same flex-row honour the
        // explicit width instead of distributing remaining space independently.
        return { width: `${width}px`, minWidth: `${width}px`, flex: 'none' };
    }

    function startResize(event: MouseEvent, column: string): void {
        const td = (event.target as HTMLElement).parentElement;
        if (!td) return;
        resizeColumn = column;
        resizeStartX = event.clientX;
        resizeStartWidth = td.offsetWidth;
        document.addEventListener('mousemove', onResizeMove);
        document.addEventListener('mouseup', onResizeUp);
    }

    function onResizeMove(event: MouseEvent): void {
        if (!resizeColumn) return;
        const delta = event.clientX - resizeStartX;
        columnWidths.value[resizeColumn] = Math.max(MIN_COL_WIDTH, resizeStartWidth + delta);
    }

    function onResizeUp(): void {
        resizeColumn = '';
        document.removeEventListener('mousemove', onResizeMove);
        document.removeEventListener('mouseup', onResizeUp);
    }

    /**
     * FR-032 — Auto-fits column width to max scrollWidth across header + body cells.
     * Triggered by double-click on a column header.
     */
    function autoFitColumn(event: MouseEvent, column: string): void {
        const th = event.currentTarget as HTMLElement;
        const tableEl = th.closest('table');
        if (!tableEl) return;
        const headers = Array.from(th.parentElement!.children) as HTMLElement[];
        const colIndex = headers.indexOf(th);
        if (colIndex === -1) return;
        const bodyRows = tableEl.querySelectorAll('tbody tr');
        // Seed with th.scrollWidth so header label is always included in the max
        let maxWidth = th.scrollWidth;
        bodyRows.forEach(row => {
            const cell = row.children[colIndex] as HTMLElement | undefined;
            if (cell) maxWidth = Math.max(maxWidth, cell.scrollWidth);
        });
        columnWidths.value[column] = Math.max(MIN_COL_WIDTH, maxWidth);
    }

    // #endregion

    // #region COLUMN DRAG-REORDER

    function onDragStart(colKey: string): void {
        dragSourceKey.value = colKey;
    }

    function onDragOver(colKey: string): void {
        dragOverKey.value = colKey;
    }

    function onDragLeave(colKey: string): void {
        if (dragOverKey.value === colKey) dragOverKey.value = null;
    }

    function onDrop(colKey: string): void {
        const source = dragSourceKey.value;
        if (!source || source === colKey) {
            dragSourceKey.value = null;
            dragOverKey.value = null;
            return;
        }
        const order = [...columnOrder.value];
        const fromIdx = order.indexOf(source);
        const toIdx = order.indexOf(colKey);
        if (fromIdx === -1 || toIdx === -1) return;
        order.splice(fromIdx, 1);
        order.splice(toIdx, 0, source);
        columnOrder.value = order;
        dragSourceKey.value = null;
        dragOverKey.value = null;
    }

    // #endregion

    // #region PAGINATION

    function prevPage(): void {
        if (currentPage.value > 1) {
            currentPage.value--;
            serverPagination?.onPageChange();
        }
    }

    function nextPage(): void {
        if (currentPage.value < totalPages.value) {
            currentPage.value++;
            serverPagination?.onPageChange();
        }
    }

    function goToPage(page: number): void {
        currentPage.value = page;
        serverPagination?.onPageChange();
    }

    function onPageSizeChange(event: Event): void {
        const value = (event.target as HTMLSelectElement).value;
        pageSize.value = value === 'ALL' ? 'ALL' : Number(value);
        currentPage.value = 1;
        serverPagination?.onPageChange();
    }

    // #endregion

    // #region WATCHERS

    // Sync columnOrder when visible properties change (entity class swap or typeValue change).
    // Also seeds columnWidths with DEFAULT_COL_WIDTH for any column not yet explicitly sized,
    // so both th and td always receive the same explicit width from getColumnStyle.
    watch(
        visibleProperties,
        (newProps) => {
            const newKeys = Object.keys(newProps);
            columnOrder.value = newKeys;
            const widths = { ...columnWidths.value };
            let changed = false;
            for (const key of newKeys) {
                if (widths[key] === undefined) {
                    widths[key] = DEFAULT_COL_WIDTH;
                    changed = true;
                }
            }
            if (changed) columnWidths.value = widths;
        },
        { immediate: true }
    );

    // Client-side only: reset to page 1 when filtered count changes
    if (!serverPagination) {
        watch(
            () => filteredItems.value.length,
            () => { currentPage.value = 1; }
        );
    }

    // #endregion

    // #region LIFECYCLE

    /** Call in onBeforeUnmount to clean up global mousemove/mouseup listeners. */
    function cleanup(): void {
        document.removeEventListener('mousemove', onResizeMove);
        document.removeEventListener('mouseup', onResizeUp);
    }

    // #endregion

    return {
        // State
        columnWidths,
        columnFilters,
        sortColumn,
        sortDirection,
        columnOrder,
        dragOverKey,
        pageSize,
        currentPage,
        pageSizeOptions,
        // Computed
        filteredItems,
        sortedItems,
        paginatedItems,
        totalPages,
        visiblePages,
        paginationInfo,
        // Methods
        getCellValue,
        getColumnStyle,
        getSortIcon,
        toggleSort,
        getDistinctValues,
        openColumnFilter,
        startResize,
        autoFitColumn,
        onDragStart,
        onDragOver,
        onDragLeave,
        onDrop,
        prevPage,
        nextPage,
        goToPage,
        onPageSizeChange,
        cleanup,
    };
}
