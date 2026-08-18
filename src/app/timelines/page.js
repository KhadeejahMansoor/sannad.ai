import { redirect } from 'next/navigation';

// /timelines has no content of its own — it opens on the first era, which
// is what it showed before each era had its own address.
//
// The slug is written out rather than imported from EraTimeline: a bad
// import path here fails silently, producing /timelines/undefined and a
// 404 rather than an error at build time.
export default function Page() {
  redirect('/timelines/companions');
}