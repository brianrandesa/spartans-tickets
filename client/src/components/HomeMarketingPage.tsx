interface HomeMarketingPageProps {
  onOpenSalesPopup: () => void;
}

const GAME_DATE = 'April 11, 2026';
const VENUE = 'Denver Coliseum';

export function HomeMarketingPage({ onOpenSalesPopup }: HomeMarketingPageProps) {
  return (
    <div className="min-h-screen bg-black text-white">
      <header className="border-b border-gray-900">
        <div className="container mx-auto px-4 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/spartans-logo.png" alt="Colorado Spartans" className="w-12 h-12 object-contain" />
            <div>
              <p className="text-cyan-400 text-xl font-black tracking-wide">COLORADO SPARTANS</p>
              <p className="text-sm text-gray-400">{VENUE} • 2026 Season</p>
            </div>
          </div>
          <button
            onClick={onOpenSalesPopup}
            className="bg-cyan-500 hover:bg-cyan-400 text-black font-bold px-5 py-2 rounded-lg transition"
          >
            Secure Your Ticket
          </button>
        </div>
      </header>

      <main>
        <section className="container mx-auto px-4 py-14">
          <div className="max-w-4xl">
            <p className="text-cyan-400 uppercase tracking-[0.2em] font-semibold text-sm">Join Us For The Official Season Opener</p>
            <h1 className="text-4xl md:text-6xl font-black leading-tight mt-4">
              Pro Arena Football Is Back In Denver
            </h1>
            <p className="text-xl text-gray-300 mt-6">
              {GAME_DATE} • {VENUE}
            </p>
            <p className="text-gray-300 mt-5 max-w-3xl">
              Fast, hard-hitting arena football, huge energy, and one simple ticket model: general admission. Buy once,
              sit anywhere in the stadium, and enjoy game day your way.
            </p>
            <div className="flex flex-wrap gap-4 mt-8">
              <button
                onClick={onOpenSalesPopup}
                className="bg-cyan-500 hover:bg-cyan-400 text-black font-bold px-7 py-3 rounded-lg transition"
              >
                Secure Your Ticket Now
              </button>
              <a
                href="https://getspartanstickets.com"
                target="_blank"
                rel="noopener noreferrer"
                className="border border-cyan-500 text-cyan-300 hover:bg-cyan-500 hover:text-black font-semibold px-7 py-3 rounded-lg transition"
              >
                Visit Main Team Site
              </a>
            </div>
          </div>
        </section>

        <section className="bg-gray-950 border-y border-gray-900">
          <div className="container mx-auto px-4 py-12">
            <h2 className="text-3xl font-black mb-8">What Is Waiting For You On Game Day</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="rounded-xl border border-gray-800 p-6 bg-black/30">
                <h3 className="text-cyan-300 font-bold text-lg">Bone-Crushing Arena Football</h3>
                <p className="text-gray-300 mt-3">Full-contact action with explosive drives, big hits, and nonstop intensity.</p>
              </div>
              <div className="rounded-xl border border-gray-800 p-6 bg-black/30">
                <h3 className="text-cyan-300 font-bold text-lg">Special Guest Appearances</h3>
                <p className="text-gray-300 mt-3">Featured appearances and fan experiences throughout the season.</p>
              </div>
              <div className="rounded-xl border border-gray-800 p-6 bg-black/30">
                <h3 className="text-cyan-300 font-bold text-lg">The Greatest Show Indoors</h3>
                <p className="text-gray-300 mt-3">Kickoff-to-final-whistle entertainment built for families, fans, and groups.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 py-14">
          <div className="max-w-4xl">
            <p className="text-cyan-400 uppercase tracking-[0.2em] font-semibold text-sm">Enter The Stadium</p>
            <h2 className="text-3xl md:text-4xl font-black mt-3">Choose The Ticket Option That Fits Your Night</h2>
            <p className="text-gray-300 mt-4">
              We are making entry simple and fast with general admission options built for individuals and families.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6 mt-8">
            <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 p-6">
              <p className="text-cyan-300 uppercase tracking-widest text-xs font-semibold">General Admission</p>
              <h3 className="text-3xl font-black mt-2">$35</h3>
              <p className="text-gray-300 mt-3">Single ticket • Sit anywhere in the stadium • Fast mobile checkout</p>
            </div>
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-6">
              <p className="text-emerald-300 uppercase tracking-widest text-xs font-semibold">Family Four Pack</p>
              <h3 className="text-3xl font-black mt-2">$100</h3>
              <p className="text-gray-300 mt-3">4 tickets together • Best value for families • Same GA access</p>
            </div>
          </div>
          <div className="mt-8">
            <button
              onClick={onOpenSalesPopup}
              className="bg-cyan-500 hover:bg-cyan-400 text-black font-bold px-8 py-4 rounded-lg transition text-lg"
            >
              Continue To Ticket Checkout
            </button>
          </div>
        </section>
      </main>

      <footer className="border-t border-gray-900">
        <div className="container mx-auto px-4 py-8 text-center text-gray-400">
          <p>Colorado Spartans • {VENUE}</p>
          <p className="text-sm mt-1">General Admission Ticketing Experience • 2026</p>
        </div>
      </footer>
    </div>
  );
}
