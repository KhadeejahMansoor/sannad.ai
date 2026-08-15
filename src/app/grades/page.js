import AboutShell from '../../component/AboutShell';
import HadithGradeTable from '../../component/HadithGradeTable';

export const metadata = {
  title: 'Hadith grades — Sannad',
  description: 'Grade breakdown across the primary hadith collections.',
};

export default function Page() {
  return (
    <AboutShell>
      <HadithGradeTable />
    </AboutShell>
  );
}