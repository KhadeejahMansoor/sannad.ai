import AboutShell from '../../../component/AboutShell';
import EraTimeline from '../../../component/EraTimeline';

export const metadata = {
  title: 'Contemporary scholars — Sannad',
  description: 'Scholars and narrators of contemporary scholars, by year of death.',
};

export default function Page() {
  return (
    <AboutShell>
      <EraTimeline era="Contemporary scholars" />
    </AboutShell>
  );
}