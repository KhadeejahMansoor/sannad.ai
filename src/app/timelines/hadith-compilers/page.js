import AboutShell from '../../../component/AboutShell';
import EraTimeline from '../../../component/EraTimeline';

export const metadata = {
  title: 'Hadith compilers — Sannad',
  description: 'Scholars and narrators of the hadith compilers, by year of death.',
};

export default function Page() {
  return (
    <AboutShell>
      <EraTimeline era="Hadith compilers" />
    </AboutShell>
  );
}