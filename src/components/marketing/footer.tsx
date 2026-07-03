export function MarketingFooter() {
  return (
    <footer className="border-t border-hairline">
      <div className="mx-auto flex max-w-6xl flex-wrap justify-between gap-3 px-6 py-9 text-sm text-muted-ink">
        <span>&copy; {new Date().getFullYear()} Shipmate. Built and shipped by Shipmate.</span>
        <a href="mailto:hello@shipmate.dev" className="transition-colors hover:text-ink">
          hello@shipmate.dev
        </a>
      </div>
    </footer>
  );
}
