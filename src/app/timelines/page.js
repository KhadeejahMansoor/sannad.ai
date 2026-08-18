import { redirect } from 'next/navigation';
import { ERA_SLUGS, DEFAULT_ERA } from '../../component/EraTimeline';

// /timelines has no content of its own — it opens on the first era, which
// is what it showed before each era had its own address.
export default function Page() {
  redirect(`/timelines/${ERA_SLUGS[DEFAULT_ERA]}`);
}