import HadithGradeTable from '../../../../../component/HadithGradeTable';

export const metadata = {
  title: 'Hadith grades — percent — Sannad',
  description: 'Grades as a share of each collection.',
};

export default function Page() {
  return <HadithGradeTable view="table" mode="percent" />;
}