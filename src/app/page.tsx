import { redirect } from 'next/navigation';

export default function Page(): never {
  redirect('/dashboard');
}
// this is not required. delete this page
