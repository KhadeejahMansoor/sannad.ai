import AboutShell from '../../../component/AboutShell';
import EraTimeline from '../../../component/EraTimeline';

export const metadata = {
  title: 'Classical scholars — Sannad',
  description: 'Scholars and narrators of the classical scholars, by year of death.',
};

export default function Page() {
  return (
    <AboutShell>
      <EraTimeline era="Classical scholars" />
    </AboutShell>
  );
}