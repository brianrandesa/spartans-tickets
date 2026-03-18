interface HomeMarketingPageProps {
  onOpenSalesPopup: () => void;
}

const GAME_DATE = 'April 11, 2026';
const VENUE = 'Denver Coliseum';
const HERO_BACKGROUND_IMAGE = 'https://images.leadconnectorhq.com/image/f_webp/q_80/r_1200/u_https://assets.cdn.filesafe.space/UIgZIZySfnBryLV4WWIh/media/6994af936bac2409e00d08f1.jpeg';
const MIDDLE_BACKGROUND_IMAGE = 'https://images.leadconnectorhq.com/image/f_webp/q_80/r_1200/u_https://assets.cdn.filesafe.space/UIgZIZySfnBryLV4WWIh/media/696829b8cafecf588bc1b1e8.jpg';
const DEFAULT_HERO_VIDEO = 'https://player.vimeo.com/video/1121057331?app_id=122963&autoplay=0&controls=1';

const TOP_LINKS = [
  { label: 'Spartan Club', href: 'https://www.tickettailor.com/events/coloradospartans/1934702' },
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

export function HomeMarketingPage({ onOpenSalesPopup }: HomeMarketingPageProps) {
  const heroStyle = HERO_BACKGROUND_IMAGE
    ? {
        backgroundImage: `linear-gradient(rgba(0,0,0,0.72), rgba(0,0,0,0.82)), url(${HERO_BACKGROUND_IMAGE})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }
    : undefined;

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="border-b border-gray-900">
        <div className="container mx-auto px-4 py-5 flex items-center justify-center gap-4 flex-wrap text-center">
          <div className="flex items-center justify-center gap-3 w-full">
            <img src="/spartans-logo.png" alt="Colorado Spartans" className="w-12 h-12 object-contain" />
            <div>
              <p className="text-cyan-400 text-xl font-black tracking-wide">COLORADO SPARTANS</p>
              <p className="text-sm text-gray-400">{VENUE} • 2026 Season</p>
            </div>
          </div>
          <nav className="flex flex-wrap gap-4 text-sm items-center justify-center w-full">
            <button
              onClick={onOpenSalesPopup}
              className="text-gray-300 hover:text-cyan-300 transition-colors"
            >
              Tickets
            </button>
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
        </div>
      </header>

      <main className="text-center">
        <section className="container mx-auto px-4 py-14 rounded-2xl mt-6 border border-gray-900" style={heroStyle}>
          <div className="max-w-4xl mx-auto">
            <p className="text-cyan-400 uppercase tracking-[0.2em] font-semibold text-sm">Join Us For The Official Season Opener</p>
            <h1 className="text-4xl md:text-6xl font-black leading-tight mt-4">
              Pro Arena Football Is Back In Denver
            </h1>
            <p className="text-xl text-gray-300 mt-6">
              {GAME_DATE} • {VENUE}
            </p>
            <p className="text-gray-300 mt-5 max-w-3xl mx-auto">
              Fast, hard-hitting arena football, huge energy, and one simple ticket model: general admission. Buy once,
              sit anywhere in the stadium, and enjoy game day your way.
            </p>
            <div className="flex flex-wrap gap-4 mt-8 justify-center">
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

        <section className="container mx-auto px-4 py-14">
          <div className="max-w-3xl mb-7 mx-auto">
            <p className="text-cyan-400 uppercase tracking-[0.2em] font-semibold text-sm">Video Highlights</p>
            <h2 className="text-3xl font-black mt-3">Featured Video</h2>
            <p className="text-gray-300 mt-3">Your homepage now shows one featured video only.</p>
          </div>
          <div className="max-w-3xl mx-auto">
            {VIDEO_SLOTS.map((slot) => (
              <div key={slot.id} className="rounded-xl border border-gray-800 bg-gray-950 p-4">
                {slot.embedUrl ? (
                  <iframe
                    src={slot.embedUrl}
                    title={slot.title}
                    className="w-full aspect-video rounded-lg"
                    allowFullScreen
                  />
                ) : null}
              </div>
            ))}
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
              <p className="text-gray-300 mt-3">Single ticket • Sit anywhere in the stadium • Fast mobile checkout</p>
            </div>
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-6">
              <p className="text-emerald-300 uppercase tracking-widest text-xs font-semibold">Family Four Pack</p>
              <h3 className="text-3xl font-black mt-2">$100</h3>
              <p className="text-gray-300 mt-3">4 tickets together • Best value for families • Same GA access</p>
            </div>
          </div>
          <div className="mt-8 flex justify-center">
            <button
              onClick={onOpenSalesPopup}
              className="bg-cyan-500 hover:bg-cyan-400 text-black font-bold px-8 py-4 rounded-lg transition text-lg"
            >
              Continue To Ticket Checkout
            </button>
          </div>
        </section>

        <section className="container mx-auto px-4 py-14">
          <div className="max-w-3xl mb-6 mx-auto">
            <p className="text-cyan-400 uppercase tracking-[0.2em] font-semibold text-sm">Shields Up</p>
            <h2 className="text-3xl font-black mt-3">Bottom Image Gallery Ready</h2>
            <p className="text-gray-300 mt-3">Add your four best game-day photos here to finish out the page like your previous design.</p>
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
    </div>
  );
}
