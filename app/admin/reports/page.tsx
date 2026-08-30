import { redirect } from 'next/navigation';

/**
 * Панели ҷудогонаи гузоришҳо БАРҲАМ хӯрд.
 *
 * Ҳамаи он чи хонанда мефиристад — баҳо, шикоят ва хатои мазмун — ҳоло дар
 * ЯК ҷо аст: «Фикри хонандагон». Ин ҷо танҳо равона мешавад, то линкҳо ва
 * хатчӯбҳои кӯҳна нашикананд.
 */
export default function ReportsRedirectPage() {
  redirect('/admin/feedback?type=report');
}
