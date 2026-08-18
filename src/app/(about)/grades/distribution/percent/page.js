import HadithGradeTable from '../../../../../component/HadithGradeTable';

export const metadata = {
  title: 'Hadith grades — composition — Sannad',
  description: 'Grade composition of each collection.',
};

export default function Page() {
  return <HadithGradeTable view="distribution" mode="percent" />;
}