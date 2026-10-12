import { Link, useRouter } from "@tanstack/react-router";

function Shell({ emoji, title, body }: { emoji: string; title: string; body: string }) {
  const router = useRouter();
  return (
    <div className="h-full w-full bg-white flex flex-col items-center justify-center px-(--padding-lg) text-center">
      <div className="text-6xl">{emoji}</div>
      <h1 className="mt-(--space-2) text-display text-2xl font-extrabold">{title}</h1>
      <p className="mt-(--space-0-5) text-muted-foreground font-semibold">{body}</p>
      <Link
        to="/journey"
        className="mt-(--space-2) h-12 px-(--padding-lg) rounded-2xl gradient-saffron text-white text-display font-extrabold flex items-center"
      >
        Back to the map
      </Link>
      <button
        onClick={() => router.invalidate()}
        className="mt-(--space-0-5) h-11 px-(--padding-md) rounded-2xl bg-muted text-display font-extrabold text-muted-foreground"
      >
        Try again
      </button>
    </div>
  );
}

export function NotFoundPlace() {
  return (
    <Shell
      emoji="🧭"
      title="Place not found"
      body="We couldn't find that state or union territory on the map."
    />
  );
}

export function PlaceError() {
  return (
    <Shell emoji="🛠️" title="Something went wrong" body="This place couldn't be loaded right now." />
  );
}
