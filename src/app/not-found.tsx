import Link from "next/link";
import { EmptyTrail } from "@/components/art";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <EmptyTrail className="h-32 w-52 text-ink" />
      <h1 className="mt-6 text-4xl">That trail ends here.</h1>
      <p className="mt-2 text-lg">Ese camino no lleva a ningún lado.</p>
      <Link href="/" className="mt-6 inline-block rounded-md border-[1.5px] border-ink bg-ruby px-5 py-2.5 font-bold text-on-ruby">
        Home · Inicio
      </Link>
    </div>
  );
}
