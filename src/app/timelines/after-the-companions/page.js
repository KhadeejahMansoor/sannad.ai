import AboutShell from '../../../component/AboutShell';
import EraTimeline from '../../../component/EraTimeline';

export const metadata = {
  title: 'After the Companions — Sannad',
  description: 'Scholars and narrators of the generation after the Companions, by year of death.',
};

export default function Page() {
  return (
    <AboutShell>
      <EraTimeline era="After the Companions" />
    </AboutShell>
  );
}