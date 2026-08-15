import AboutShell from '../../component/AboutShell';
import EraTimeline from '../../component/EraTimeline';

export const metadata = {
  title: 'Timelines — Sannad',
  description: 'The narrators and scholars of each era, by year of death.',
};

export default function Page() {
  return (
    <AboutShell>
      <EraTimeline />
    </AboutShell>
  );
}