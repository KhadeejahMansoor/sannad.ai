import HadithGradeTable from '../../../../../component/HadithGradeTable';

export const metadata = {
  title: 'Hadith grades — distribution — Sannad',
  description: 'Grade distribution by collection size.',
};

export default function Page() {
  return <HadithGradeTable view="distribution" mode="counts" />;
}