/* Shown while the timelines route renders.
 *
 * Prefetching didn't remove the beat because it wasn't a network wait —
 * this page builds roughly 60 name rows across 8 bands, which takes long
 * enough that React shows nothing until it's done. A loading file gives
 * Next something to paint the moment the tab is clicked.
 *
 * The skeleton mirrors the real layout — nav column on the left, bands on
 * the right — so the transition to actual content doesn't shift anything.
 */
export default function Loading() {
  return (
    <div className="flex-1 px-4 sm:px-8 pb-16 pt-8">
      <div className="md:flex md:gap-8 lg:gap-10">
        <div className="w-full md:w-[190px] lg:w-[220px] flex-shrink-0 mb-6 md:mb-0">
          <div className="flex flex-row flex-wrap gap-2 md:flex-col md:flex-nowrap md:gap-0">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="py-3 ps-4">
                <div className="h-4 w-32 rounded bg-[#EFEAE6]" />
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          {[0, 1, 2].map((band) => (
            <div key={band} className="mb-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-3 w-8 rounded bg-[#EFEAE6]" />
                <span className="flex-1 h-px bg-[#E2DBD6]" />
              </div>
              <div className="ps-1">
                {[0, 1].map((row) => (
                  <div key={row} className="py-1.5">
                    <div className="h-4 w-48 rounded bg-[#EFEAE6]" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}