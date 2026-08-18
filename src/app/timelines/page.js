import { redirect } from 'next/navigation';

// /timelines has no content of its own — it opens on the first era, which
// is what it showed before each era had its own address.
//
// The slug is written out rather than imported: a failed import here
// resolves to undefined and sends the reader to /timelines/undefined.
export default function Page() {
  redirect('/timelines/companions');
}