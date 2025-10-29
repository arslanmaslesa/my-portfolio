// data/projects.js
export const PROJECTS = [
  {
    id: 1,
    image: '/universe/thumb.png',
    image2: '/universe/universe.mp4',
    video: '/universe/universe.mp4',
    showSoundButton: false,
    title: 'Universe',
    featured: false,
    skills: ['Figma', 'UI/UX', 'Next.js', 'Product Design'],
    summary: `Universe is a demo concept for a unified AI-driven assistant that connects digital and physical services—deliveries, bookings, transport, scheduling and payments—into a single, context-aware app that orchestrates everyday tasks through natural language and intelligent automation.`,
    role: 'Product Designer',
    timeline: '4 weeks (demo concept)',
    client: 'Universe (internal concept / investor demo)',
    deliverables: 'High-fidelity screens, interactive prototype, component library, chat interface screens, voice/UI interaction spec, motion guidelines',
    tools: ['Figma', 'FigJam', 'Framer', 'Miro'],
    info: [
      { title: 'Role', info: 'Product Designer' },
      { title: 'Duration', info: '4 weeks (demo concept)' },
      { title: 'Client', info: 'Universe (internal concept / investor demo)' },
      { title: 'Deliverables', info: 'Prototype, component library, chat & voice specs' },
      { title: 'Tools', info: 'Figma, FigJam, Framer, Miro' },
    ],
    challenge: `The core challenge was transforming a broad technical vision into a single, trustworthy experience: users needed to grasp at a glance what the assistant knew and what it would do on their behalf, while still having clear control over diverse, real-world transactions. The demo had to communicate the product’s ambition without overwhelming people, proving that an integrated assistant could reduce friction across many domains rather than create confusion.`,
    research: `Rapid discovery sessions and competitor benchmarking revealed two consistent user needs: a single, scannable “state of the day” that reduces decision friction, and visible, reversible transactional steps that build trust. Mapping mental models around scheduling, orders and payments showed that progressive disclosure and clear status indicators were essential; users tolerate automation when they can easily understand, pause or revert actions. Additionally, users expressed a strong preference for conversational fallbacks—a reliable chat channel where they could ask questions or correct the assistant in natural language.`,
    solution: `The concept is anchored by a “Today” home card that pairs an AI-generated illustration representing the user’s day with a single-line summary and an optional audio briefing for quick catch-ups. A unified dashboard surfaces time-sensitive events—orders, bookings, deliveries and transport—as actionable cards with primary contextual actions and safe fallbacks, while a dedicated chat page provides a lightweight conversational interface for freeform queries, clarifications and follow-ups. Complex flows are decomposed into minimal decision points with inline status, undo affordances and sensible defaults, supported by a scalable component library and motion system that communicates progress and reliability.`,
    impact: `The prototype turned an abstract pitch into an experience stakeholders could explore and critique, clarifying integration priorities, surfacing edge cases for backend planning, and establishing reusable interaction patterns for future development. The addition of a chat-first interaction path increased stakeholder confidence in the product’s ability to handle exceptions and human preferences, reframing Universe from a theoretical aggregator into a human-centred assistant focused on clarity, control and trust—making a strong case for hiring a dedicated product designer to carry the concept forward.`,
    gallery: [
      '/universe/flow.png',
      '/universe/app.png',
      '/universe/bubble.mp4',
      '/universe/three.png',
      '/universe/universe_two.png',
      '/universe/notif.png',
    ],
  },
  {
    id: 2,
    locked: true,
    image: '/transport/truck.png',
    title: 'Transport & Logistics Website',
    video: '/transport/road.mp4',
    showSoundButton: false,
    skills: ['Figma', 'Flutter', 'Prototyping'],
    summary: 'Mobile app prototype to validate onboarding flow.',
    role: 'UX Designer',
    timeline: '6 weeks',
    tools: ['Figma', 'Flutter'],
    gallery: ['/proj2-1.png'],
  },
  {
    id: 3,
    image: '/proj3.png',
    image2: '/appo/water.png',
    title: 'Appo',
    featured: true,
    video: '/appoproductdemo.mp4',
    //subtitles: '/appoproductdemo.vtt',
    showSoundButton: false,
    skills: ['Figma', 'Product Design', 'Branding', 'UI/UX', 'Motion'],
    summary:
      'For Appo, I led product design across the consumer app, the Appo for Business merchant app, the marketing website, and the brand ecosystem including social media and a product demo video — four tightly integrated solutions that solved one challenge: making appointment booking simple, reliable, and scalable.',
    role: 'Product Designer',
    timeline: '9 months',
    client: 'Appo (startup)',
    deliverables:
      'Consumer & Business mobile app, Website, Brand system, Social templates, Product demo video, Design system',
    tools: ['Figma', 'Photoshop', 'Illustrator', 'Keynote'],

    // Story-driven case study copy
    challenge:
      'The appointment market is fragmented and slow: consumers abandon long, confusing booking flows and merchants juggle multiple disconnected tools. Appo needed a scalable product that felt trustworthy to customers and fit naturally into salons’ existing routines. The challenge was to design an ecosystem that reduced decision friction for users while automating predictable operational work for businesses, all wrapped in a clear brand that communicated reliability and warmth.',

    research:
      'I ran interviews with frequent bookers, occasional users, and salon owners, and audited competing products. Bookers wanted speed, clarity, and trustworthy signals (price, exact duration, stylist). Salon owners prioritized predictable revenue, simple schedule controls, and minimal onboarding effort. Usability tests showed that even small cognitive loads during booking — unclear durations, multiple screens, or missing price info — caused abandonment. From this I defined two rules: show only the essential choices up front, and automate or simplify everything the business does repeatedly.',

    solutions: [
      {
        title: 'Solution 1 - Appo',
        description:
          'I redesigned booking into a single, scannable card-per-service pattern that surfaces time, price, duration and stylist at a glance, reducing comparison time. Progressive disclosure hides advanced options until needed, and microcopy clarifies cancellation and confirmation policies to build trust. The UI kit includes accessible components and subtle micro-interactions so flows feel smooth from search to confirmation. The end result is a booking flow that feels instant and reliable for first-time and returning users alike.',
      },
      {
        title: 'Solution 2 - Appo for Business',
        description:
          'Instead of a heavy desktop tool, I designed a mobile-first companion app for merchants focused on three core tasks: manage availability, accept and confirm bookings, and handle payments on the go. The app provides role-based access (manager, receptionist, stylist), quick check-in and walk-in handling, push notifications for new bookings, and an offline-friendly mode so salons can use it reliably on the floor. Bulk-edit schedule paths and conflict-resolution suggestions reduce admin overhead, and onboarding flows were tailored to mirror salons’ current practices so adoption felt natural rather than disruptive.',
      },
      {
        title: 'Solution 3 - Appo Website',
        description:
          'The marketing site was designed as a clear conversion funnel that mirrors the app’s value: headline → proof → action. Hero messaging explains the core benefit quickly, example use-cases and social proof reduce hesitation, and short how-it-works animations demonstrate booking in under a minute. CTAs route users to download or book immediately and content addresses both customers and merchant partners with tailored value propositions. The result is higher first-time conversion and fewer questions for the support team.',
      },
      {
        title: 'Solution 4 - Branding & Video',
        description:
          'To unify the ecosystem we crafted a compact brand system: friendly logotype, warm accent palette, photographic treatments, and modular templates for social and in-app marketing. The 60-second product demo compresses the booking narrative into a single, emotive flow and produced motion assets (Lottie) reused across onboarding and ads. Social templates and short clips translated product benefits into bite-sized stories that supported acquisition and merchant outreach. This cohesive visual and motion language made Appo instantly recognisable across channels.',
      },
    ],

    impact:
      'The integrated approach improved both business and user outcomes: merchants onboarded faster with fewer support tickets, users completed bookings with less friction, and marketing saw clearer messaging across touchpoints. Partner salons reported the merchant app respected their workflow and reduced front-desk chaos, while users described the consumer app as “simple and trustworthy.” The brand and demo video raised click-through to downloads, and the design system and documentation accelerated new feature work without fragmenting the experience. Overall, Appo became an easier product to sell and a more reliable service for customers — the exact outcome the design set out to achieve.',

    outcome:
      'Merchants onboarded faster with fewer tickets, users described the app as “simple and trustworthy,” and the product demo plus social campaigns boosted downloads and partner acquisition.',
    gallery: [
      '/appo/wire.png',
      '/appo/icon.png',
      '/appo/salon.png',
      '/appo/booking.png',
      '/appo/appo1.png',
      '/appo/biz.png',
      '/appo/mac.png',
      '/appo/socials.png',
      '/appo/bill.png',
    ],
    demoVideo: '/appoproductdemo.mp4',
  },
  {
    id: 4,
    image: '/books/book_triangle.png',
    title: 'Book Covers',
    video: '/books/books.mp4',
    showSoundButton: false,
    image2: '/books/red2.png',
    skills: ['Illustration', 'Cover Design', 'Amazon Kindle'],
    summary: `For a series of freelance projects I designed book covers that balance commercial clarity with illustrated personality, tailored to genres from literary fiction to cozy fantasy and practical nonfiction. Each cover was crafted to perform on Amazon/Kindle thumbnails and in print, with the same goal across projects: stop the scroll, read clearly at small sizes, and feel like a faithful extension of the author’s voice.`,

    role: 'Product Designer & Illustrator',
    timeline: 'Varied — typically 1–3 weeks per cover; projects ran concurrently over two months.',
    client: 'Multiple freelance authors and independent publishers',
    deliverables:
      'Print-ready front/back/bleed files, Kindle/eBook-optimized covers, spine layouts, title/subtitle treatments, marketing mockups, optional branding assets like author sigils or chapter opener illustrations',
    tools: ['Figma', 'Illustrator', 'Photoshop', 'Procreate'],
    info: [
      { title: 'Role', info: 'Product Designer & Illustrator' },
      { title: 'Duration', info: '1–3 weeks per cover (varied)' },
      { title: 'Clients', info: 'Independent authors & small publishers' },
      { title: 'Deliverables', info: 'Print + eBook covers, spine, mockups, branding assets' },
      { title: 'Tools', info: 'Figma, Illustrator, Photoshop, Procreate' },
    ],

    // Story-driven case study copy (paragraph-style)
    challenge: `Clients arrived with very different starting points: some supplied detailed briefs and reference boards, while others wanted a fully conceptualized package with almost no direction. The constraints were consistent — covers needed to read at thumbnail scale, meet genre expectations without being derivative, and be delivered as files that work for both print-on-demand and Kindle. Several authors also required a system that would scale into a series without losing identity.`,

    research: `I began each project with a short discovery sprint: quick reader profiling, competitor thumbnails research, and a shared moodboard with the author. Patterns emerged quickly — thumbnails demand strong contrast and a single focal silhouette, genre signals must be respected, and small original details are what make a cover memorable. Authors repeatedly valued a balance of market-aware design plus room for a distinct illustrative or typographic flourish.`,

    solution: `My process centered on one clear idea per cover and testing it at thumbnail size early. I produced thumbnail-first sketches, presented two concept directions (a market-safe option and a more illustrative/unique option), then iterated on color, contrast, and typographic scale until the cover worked below 100 px wide. Finalization included exact spine calculations, bleed and export presets for Kindle, and polished mockups for marketing use.`,

    impact: `The new covers improved discoverability and author confidence in marketing materials: several authors reported higher click-throughs on pre-order and listing pages after switching to the redesigned covers, two authors commissioned paperback interiors and promotional assets using the same visual language, and many noted that the covers felt "modern" and "distinct" without sacrificing genre clarity. The template systems I provided also made producing future sequels faster and kept visual consistency across series work.`,

    outcome:
      'Higher click-throughs and follow-up commissions; repeat clients and reusable cover systems for series work.',
    gallery: [
      '/books/book_triangle.png',
      '/books/red3.png',
      '/books/book_bw.png',
      '/books/book_blue.png',
      '/books/red.png',
      '/books/books.mp4',
    ],
  },
  {
    id: 5,
    image: '/kapetanovina/tower.png',
    title: 'Hotel Kapetanovina',
    video: '/kapetanovina/most.mp4',
    showSoundButton: false,
    skills: ['Branding', 'Print', 'Illustrator'],
    summary:
      'For Hotel Kapetanovina, I designed a visit card that conveys freshness and comfort in the city’s hot climate. With a clean layout, light tones, and refined branding, it serves as both a functional tool and a subtle extension of the hotel’s welcoming identity.',
    image2: '/kapetanovina/kapetanovina.png',
    role: 'Product Designer',
    timeline: '2 weeks',
    client: 'Hotel Kapetanovina',
    deliverables: 'Visit card design, branding assets',
    tools: ['Figma', 'Illustrator'],
    info: [
      { title: 'Role', info: 'Product Designer' },
      { title: 'Duration', info: '2 weeks' },
      { title: 'Client', info: 'Hotel Kapetanovina' },
      { title: 'Deliverables', info: 'Visit card design, branding assets' },
      { title: 'Tools', info: 'Figma, Illustrator' },
    ],

    // Story-driven case study copy
    challenge: `Hotel Kapetanovina, located in Mostar, wanted branding that felt distinct and aligned with the experience they offer. Their existing materials felt generic and didn’t capture the hotel’s welcoming atmosphere. The challenge was to design a business card that was not only functional but also conveyed the hotel’s character and left a lasting impression on guests and partners.`,

    research:
      'In conversations with the client and through competitor research, it became clear that most hotels relied on formal, predictable designs. Guests valued clarity, personality, and memorability. Given Mostar’s hot climate, the design also needed to feel light and refreshing. Aloe vera, a plant associated with comfort and renewal, emerged as a natural motif that could communicate these qualities subtly and elegantly.',

    solution:
      'I anchored the design in the hotel’s teal brand color, giving the card a distinctive, calming presence. Hand-drawn aloe vera illustrations introduced an organic, refreshing touch. The logo was refined for clear recognition, and the layout and typography were kept simple and legible. The final card balanced professionalism with an approachable, inviting tone, reflecting the hotel’s trustworthy and welcoming character.',

    impact:
      'The redesigned card became more than a contact tool — it became a memorable touchpoint for the brand. Staff shared it confidently, and guests described it as "elegant" and "refreshing." Partners also responded positively, often sparking conversations around the design. Beyond this single asset, the approach established a flexible visual language that could extend to future branding, giving the hotel a consistent identity to build on.',

    outcome:
      'Positive brand feedback from guests and partners; established reusable design language for future collateral.',

    gallery: [
      '/kapetanovina/spavaca.png',
      '/kapetanovina/most.png',
      '/kapetanovina/hotel.png',
      '/kapetanovina/aloa.png',
      '/kapetanovina/cards_dual.png',
      '/kapetanovina/tower.png',
      '/kapetanovina/palm_card.png',
      '/kapetanovina/plate_cards.png',
    ],
  },
];
