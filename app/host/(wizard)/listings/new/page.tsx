import { redirect } from 'next/navigation'

/** @deprecated Prefer /host/listings/wizard — kept so old links still work. */
export default function NewListingRedirectPage() {
  redirect('/host/listings/wizard')
}
