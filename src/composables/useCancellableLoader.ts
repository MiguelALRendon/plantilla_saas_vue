import axios from 'axios';

/**
 * Returns true when an error was caused by an intentional AbortController abort.
 * Uses the official axios.isCancel() check — reliable across all axios versions.
 * Import this wherever a catch block needs to distinguish cancellation from real errors.
 */
export function isCanceled(error: unknown): boolean {
    return axios.isCancel(error);
}

/**
 * Manages a single AbortController whose signal is passed to every cancellable
 * fetch (axios getElement / getElementListPaginated).
 *
 * Calling getSignal() aborts the previous in-flight request before creating a
 * new controller, so only one request is ever "live" at a time.
 *
 * This composable has no Vue reactivity — it can be used both inside
 * component setup() and at module level (e.g. router guards).
 */
export function useCancellableLoader() {
    let controller: AbortController | null = null;

    /**
     * Aborts any in-flight request and returns the signal for the next one.
     * Call this immediately before every fetch.
     */
    function getSignal(): AbortSignal {
        controller?.abort();
        controller = new AbortController();
        return controller.signal;
    }

    /** Cancels the current in-flight request without starting a new one. */
    function cancel(): void {
        controller?.abort();
        controller = null;
    }

    return { getSignal, cancel };
}
