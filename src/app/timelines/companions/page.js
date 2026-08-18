import AboutShell from '../../../component/AboutShell';
import EraTimeline from '../../../component/EraTimeline';

export const metadata = {
  title: 'Companions — Sannad',
  description: 'Scholars and narrators of the Companions, by year of death.',
};

export default function Page() {
  return (
    <AboutShell>
      <EraTimeline era="Companions" />
    </AboutShell>
  );
}