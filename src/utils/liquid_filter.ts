const FILTER_HOST_ID = 'liq-filter-host';

/**
 * Injects the shared `#liq-gooey` SVG filter into the document (idempotent).
 * Every "liquid" surface in the app — buttons (`v-liquid`), input labels,
 * row hover bleed, etc. — references this single filter so they all read
 * as the same material instead of one-off effects.
 */
export function ensureGooFilter(): void {
    if (document.getElementById(FILTER_HOST_ID)) {
        return;
    }

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.id = FILTER_HOST_ID;
    svg.setAttribute('aria-hidden', 'true');
    svg.style.cssText = 'position:fixed;top:0;left:0;width:0;height:0;pointer-events:none;overflow:hidden;';
    svg.innerHTML = `<defs>
        <filter id="liq-gooey" x="-60%" y="-60%" width="220%" height="220%"
                color-interpolation-filters="sRGB">
            <feGaussianBlur in="SourceGraphic" stdDeviation="11" result="blur"/>
            <feColorMatrix in="blur" mode="matrix"
                values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -10"
                result="gooey"/>
        </filter>
        <!-- Lighter weight of the same material — for small chrome (labels, chips) where
             the button-tuned blur above would dissolve the shape entirely. -->
        <filter id="liq-gooey-sm" x="-60%" y="-60%" width="220%" height="220%"
                color-interpolation-filters="sRGB">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur"/>
            <feColorMatrix in="blur" mode="matrix"
                values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 26 -11"
                result="gooey"/>
        </filter>
    </defs>`;
    document.body.prepend(svg);
}
