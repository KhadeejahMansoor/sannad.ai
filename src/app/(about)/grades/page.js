import { redirect } from 'next/navigation';

// /grades opens on the table in counts, which is what it showed before each
// combination had its own address.
export default function Page() {
  redirect('/grades/table/counts');
}