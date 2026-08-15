import { redirect } from 'next/navigation';

// /timeline was the single URL all three views shared. Anything already
// pointing here — menu links, bookmarks, the odd inbound link — lands on
// Grades, which is what /timeline showed by default.
export default function Page() {
  redirect('/grades');
}