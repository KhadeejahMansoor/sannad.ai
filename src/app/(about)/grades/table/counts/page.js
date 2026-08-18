import HadithGradeTable from '../../../../../component/HadithGradeTable';

export const metadata = {
  title: 'Hadith grades — Sannad',
  description: 'Grade counts by collection.',
};

export default function Page() {
  return <HadithGradeTable view="table" mode="counts" />;
}