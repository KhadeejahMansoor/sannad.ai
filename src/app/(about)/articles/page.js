import ArticlesView from '../../../component/ArticlesView';

export const metadata = {
  title: 'Articles — Sannad',
  description: 'Writing on hadith and its transmission.',
};

// No AboutShell here — the header and tabs come from the (about) layout,
// which stays mounted across tab changes.
export default function Page() {
  return <ArticlesView />;
}