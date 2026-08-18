import HadithGradeTable from '../../../component/HadithGradeTable';

export const metadata = {
  title: 'Hadith grades — Sannad',
  description: 'Grade breakdown across the primary hadith collections.',
};

// No AboutShell here — the header and tabs come from the (about) layout,
// which stays mounted across tab changes.
export default function Page() {
  return <HadithGradeTable />;
}