import AboutShell from '../../component/AboutShell';
import ArticlesView from '../../component/ArticlesView';

export const metadata = {
  title: 'Articles — Sannad',
  description: 'Writing on hadith and its transmission.',
};

export default function Page() {
  return (
    <AboutShell>
      <ArticlesView />
    </AboutShell>
  );
}