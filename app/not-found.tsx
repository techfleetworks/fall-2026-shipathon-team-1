import Link from "next/link";
import { Logo } from "@/components/Logo";

export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
      <Logo />
      <div>
        <h1 className="text-heading-1 text-ink">We couldn&apos;t find that page</h1>
        <p className="text-body text-ink-muted mt-1">
          The link may be old, or the item has been given away.
        </p>
      </div>
      <Link
        href="/"
        className="text-button rounded-lg bg-brand px-5 py-3 text-ink-on-brand hover:bg-brand-hover"
      >
        Back to home
      </Link>
    </main>
  );
}
