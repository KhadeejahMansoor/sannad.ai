import EraTimeline from '../../../component/EraTimeline';

export const metadata = {
  title: 'Timelines — Sannad',
  description: 'Scholars and narrators of each era, by year of death.',
};

// No AboutShell here — the header and tabs come from the (about) layout,
// which stays mounted across tab changes.
export default function Page() {
  return <EraTimeline />;
}