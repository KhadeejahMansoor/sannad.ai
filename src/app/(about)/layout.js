import AboutShell from '../../component/AboutShell';

/* Layout for the Grades / Timelines / Articles section.
 *
 * (about) is a route group — the parentheses mean it doesn't appear in the
 * URL, so /grades stays /grades. Its only job is to let these three routes
 * share a layout.
 *
 * Because AboutShell lives here rather than inside each page, React keeps
 * it mounted while navigating between tabs. Only `children` changes. */
export default function AboutLayout({ children }) {
  return <AboutShell>{children}</AboutShell>;
}