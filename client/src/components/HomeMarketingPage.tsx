import { useEffect, useMemo, useState } from 'react';

interface HomeMarketingPageProps {
  onOpenSalesPopup: () => void;
}

const GAME_DATE = 'Sunday, May 10th at 2:00 PM';
const VENUE = 'Denver Coliseum';
const SEASON_TICKETS_URL = 'https://www.tickettailor.com/events/coloradospartans/1934702';
const HERO_BACKGROUND_IMAGE = 'https://images.leadconnectorhq.com/image/f_webp/q_80/r_1200/u_https://assets.cdn.filesafe.space/UIgZIZySfnBryLV4WWIh/media/6994af936bac2409e00d08f1.jpeg';
const MIDDLE_BACKGROUND_IMAGE = 'https://images.leadconnectorhq.com/image/f_webp/q_80/r_1200/u_https://assets.cdn.filesafe.space/UIgZIZySfnBryLV4WWIh/media/696829b8cafecf588bc1b1e8.jpg';
const DEFAULT_HERO_VIDEO = 'https://player.vimeo.com/video/1121057331?app_id=122963&autoplay=0&controls=1';
const FIRST_HOME_GAME_ISO = '2026-04-11T19:00:00-07:00';

const TOP_LINKS = [
  { label: 'Season Tickets', href: SEASON_TICKETS_URL },
  { label: 'Store', href: 'https://shopcoloradospartans.com/' },
  { label: 'Schedule', href: 'https://www.co-spartans.com/schedule' },
  { label: 'Our Partners', href: 'https://www.co-spartans.com/partners' },
  { label: 'About Us', href: 'https://www.co-spartans.com/about-us' },
];

const VIDEO_SLOTS = [
  { id: 'video-1', title: 'Feature Video', embedUrl: DEFAULT_HERO_VIDEO },
];

const BOTTOM_IMAGE_SLOTS = [
  {
    id: 'img-1',
    title: 'General Admission',
    src: 'https://assets.cdn.filesafe.space/UIgZIZySfnBryLV4WWIh/media/69681c6b8c58e85abbc51806.jpg',
  },
  {
    id: 'img-2',
    title: 'Group Tickets',
    src: 'https://assets.cdn.filesafe.space/UIgZIZySfnBryLV4WWIh/media/69681c6b3a2f0f26d60bbffc.jpg',
  },
  {
    id: 'img-3',
    title: 'Family Four Pack',
    src: 'https://assets.cdn.filesafe.space/UIgZIZySfnBryLV4WWIh/media/69681adf8c58e8f43fc4e4ce.jpg',
  },
  {
    id: 'img-4',
    title: 'Season Tickets',
    src: 'https://assets.cdn.filesafe.space/UIgZIZySfnBryLV4WWIh/media/69681adf8ed9370112025705.jpg',
  },
];

const PARTNER_LOGOS = [
  'https://storage.googleapis.com/msgsndr/UIgZIZySfnBryLV4WWIh/media/e505937a-1009-41cd-9a73-214ff54b2d33.png',
  'https://storage.googleapis.com/msgsndr/UIgZIZySfnBryLV4WWIh/media/690491506bade613f3325a79.png',
  'https://storage.googleapis.com/msgsndr/UIgZIZySfnBryLV4WWIh/media/6903f5cac3f8ca4abea2219c.png',
  'https://storage.googleapis.com/msgsndr/UIgZIZySfnBryLV4WWIh/media/9898ea82-65e1-489c-af7a-fc9d1a38d76e.png',
  'https://storage.googleapis.com/msgsndr/UIgZIZySfnBryLV4WWIh/media/6904bd309faf01f0713e7ba5.png',
  'https://storage.googleapis.com/msgsndr/UIgZIZySfnBryLV4WWIh/media/6904bc2c9faf018d493e5e70.png',
];

function getRemainingSeconds(): number {
  const target = new Date(FIRST_HOME_GAME_ISO).getTime();
  return Math.max(0, Math.floor((target - Date.now()) / 1000));
}

export function HomeMarketingPage({ onOpenSalesPopup }: HomeMarketingPageProps) {
  const [remainingSeconds, setRemainingSeconds] = useState(getRemainingSeconds);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const updateCountdown = () => setRemainingSeconds(getRemainingSeconds());
    const intervalId = window.setInterval(updateCountdown, 1000);
    return () => window.clearInterval(intervalId);
  }, []);

  const countdownLabel = useMemo(() => {
    const days = Math.floor(remainingSeconds / 86400);
    const hours = Math.floor((remainingSeconds % 86400) / 3600);
    const minutes = Math.floor((remainingSeconds % 3600) / 60);
    const seconds = remainingSeconds % 60;

    const pad = (value: number) => value.toString().padStart(2, '0');
    return `${pad(days)}d : ${pad(hours)}h : ${pad(minutes)}m : ${pad(seconds)}s`;
  }, [remainingSeconds]);

  const heroStyle = HERO_BACKGROUND_IMAGE
    ? {
        backgroundImage: `linear-gradient(rgba(0,0,0,0.72), rgba(0,0,0,0.82)), url(${HERO_BACKGROUND_IMAGE})`,
        backgroundSize: '100% 100%',
        backgroundPosition: 'center top',
      }
    : undefined;

  return (
    <div className="min-h-screen bg-black text-white pb-24">
      <header className="border-b border-gray-900 bg-black/70 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center">
            <img src="/spartans-logo.png" alt="Colorado Spartans" className="w-20 h-20 object-contain" />
          </div>
          <nav className="hidden md:flex flex-wrap gap-4 text-sm items-center justify-center">
            {TOP_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-cyan-300 transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>
          <button
            onClick={onOpenSalesPopup}
            className="hidden md:inline-flex bg-cyan-500 hover:bg-cyan-400 text-black font-bold px-5 py-2 rounded-lg transition"
          >
            Secure Your Ticket
          </button>
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg border border-gray-700 text-gray-200"
            aria-label="Toggle menu"
            aria-expanded={mobileMenuOpen}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-800 bg-black/90">
            <div className="container mx-auto px-4 py-4 flex flex-col gap-3">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenSalesPopup();
                }}
                className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-bold px-5 py-2 rounded-lg transition"
              >
                Secure Your Ticket
              </button>
              {TOP_LINKS.map((link) => (
                <a
                  key={`mobile-${link.label}`}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-cyan-300 transition-colors text-sm py-1"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        )}
      </header>

      <main className="text-center">
        <section className="w-full min-h-[62vh] md:min-h-[68vh] py-8 border-b border-gray-900 flex items-center" style={heroStyle}>
          <div className="max-w-4xl mx-auto w-full px-4">
            <h1 className="text-3xl md:text-5xl font-black leading-tight">Pro Arena Football Is Back In Denver</h1>
            <div className="mt-4 max-w-3xl mx-auto">
              <iframe
                src={VIDEO_SLOTS[0].embedUrl}
                title={VIDEO_SLOTS[0].title}
                className="w-full aspect-video rounded-lg"
                allowFullScreen
              />
            </div>
            <p className="text-xl text-gray-300 mt-4">
              {GAME_DATE} • {VENUE}
            </p>
            <p className="text-gray-300 mt-3 max-w-3xl mx-auto">
              Fast, hard-hitting arena football, huge energy, and one simple ticket model: general admission. Buy once,
              sit anywhere in the stadium, and enjoy game day your way.
            </p>
            <div className="flex flex-wrap gap-4 mt-5 justify-center">
              <button
                onClick={onOpenSalesPopup}
                className="bg-cyan-500 hover:bg-cyan-400 text-black font-bold px-7 py-3 rounded-lg transition"
              >
                Secure Your Ticket
              </button>
            </div>
          </div>
        </section>

        <section
          className="bg-gray-950 border-y border-gray-900"
          style={{
            backgroundImage: `linear-gradient(rgba(0,0,0,0.78), rgba(0,0,0,0.9)), url(${MIDDLE_BACKGROUND_IMAGE})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
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

        <section className="container mx-auto px-4 py-10">
          <p className="text-cyan-400 uppercase tracking-[0.2em] font-semibold text-sm text-center mb-5">Partners And Features</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 items-center">
            {PARTNER_LOGOS.map((logo, idx) => (
              <div key={`${logo}-${idx}`} className="rounded-lg border border-gray-800 bg-gray-950 p-3 flex items-center justify-center">
                <img src={logo} alt="Partner logo" className="h-10 object-contain" />
              </div>
            ))}
          </div>
        </section>

        <section className="container mx-auto px-4 py-14">
          <div className="max-w-4xl mx-auto">
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
              <ul className="text-gray-300 mt-3 text-left list-disc list-inside space-y-1">
                <li>Single ticket access</li>
                <li>Sit anywhere in the stadium</li>
                <li>Fast mobile checkout</li>
                <li>Instant confirmation after payment</li>
              </ul>
            </div>
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-6">
              <p className="text-emerald-300 uppercase tracking-widest text-xs font-semibold">Family Four Pack</p>
              <h3 className="text-3xl font-black mt-2">$100</h3>
              <ul className="text-gray-300 mt-3 text-left list-disc list-inside space-y-1">
                <li>Four tickets bundled together</li>
                <li>Best value for families and groups</li>
                <li>Same general admission access</li>
                <li>One quick checkout for the whole pack</li>
              </ul>
            </div>
          </div>
          <div className="mt-8 flex justify-center gap-3 flex-wrap">
            <button
              onClick={onOpenSalesPopup}
              className="bg-cyan-500 hover:bg-cyan-400 text-black font-bold px-8 py-4 rounded-lg transition text-lg"
            >
              Secure Your Ticket
            </button>
            <a
              href={SEASON_TICKETS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="border border-cyan-500 text-cyan-300 hover:bg-cyan-500 hover:text-black font-bold px-8 py-4 rounded-lg transition text-lg"
            >
              Buy Season Tickets
            </a>
          </div>
        </section>

        <section className="container mx-auto px-4 py-14">
          <div className="max-w-3xl mb-6 mx-auto">
            <p className="text-cyan-400 uppercase tracking-[0.2em] font-semibold text-sm">Shields Up</p>
            <h2 className="text-3xl font-black mt-3">Game Day Highlights</h2>
            <p className="text-gray-300 mt-3">Experience the energy, family atmosphere, and nonstop action at Colorado Spartans home games.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {BOTTOM_IMAGE_SLOTS.map((slot) => (
              <div key={slot.id} className="rounded-xl border border-gray-800 bg-gray-950 overflow-hidden">
                {slot.src ? (
                  <img src={slot.src} alt={slot.title} className="w-full h-48 object-cover" />
                ) : (
                  <div className="w-full h-48 flex items-center justify-center text-gray-500 border-b border-dashed border-gray-700">
                    Image placeholder
                  </div>
                )}
                <div className="p-3 text-sm text-gray-300 text-center">{slot.title}</div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-gray-900">
        <div className="container mx-auto px-4 py-8 text-center text-gray-400">
          <p>Colorado Spartans • {VENUE}</p>
          <p className="text-sm mt-1">General Admission Ticketing Experience • 2026</p>
        </div>
      </footer>

      <div className="fixed bottom-0 inset-x-0 z-40 border-t border-cyan-500/30 bg-black/90 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-3 flex flex-col md:flex-row items-center justify-center gap-4">
          <div className="text-center">
            <p className="text-cyan-300 text-sm font-semibold uppercase tracking-[0.18em]">First Home Game</p>
            <p className="text-white text-lg md:text-2xl font-black">{countdownLabel}</p>
          </div>
          <button
            onClick={onOpenSalesPopup}
            className="bg-cyan-500 hover:bg-cyan-400 text-black font-bold px-6 py-2 rounded-lg transition"
          >
            Secure Your Ticket
          </button>
        </div>
      </div>
    </div>
  );
}
