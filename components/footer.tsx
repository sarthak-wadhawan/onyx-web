import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-border py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm text-muted">
          <span className="font-bold text-white">♚ Onyx</span>
          <span>·</span>
          <span>Built with C++ · Next.js · Tailwind</span>
        </div>
        <div className="flex items-center gap-6 text-sm text-muted">
          <Link href="#" className="hover:text-white transition">GitHub</Link>
          <Link href="#" className="hover:text-white transition">Docs</Link>
          <Link href="#" className="hover:text-white transition">About</Link>
        </div>
      </div>
    </footer>
  );
}