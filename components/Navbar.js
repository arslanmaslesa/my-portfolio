import Link from 'next/link';

const links = [
  { href: '/work', label: 'Work' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
];

export default function Navbar() {
  // Create ripple animation styles inside the component
  // We'll add a <style> tag for keyframes and delays for the ripple animation
  return (
    <>
      <style>{`
        @keyframes ripple {
          0%, 100% {
            transform: translateY(0);
            color: #9ca3af; /* Tailwind gray-400 */
          }
          50% {
            transform: translateY(-4px);
            color: #d1d5db; /* Tailwind gray-300 */
          }
        }
        .nav-letter {
          display: inline-block;
          transition: color 0.3s ease;
        }
        .nav-link:hover .nav-letter {
          animation: ripple 0.6s ease forwards;
        }
        .nav-link:hover .nav-letter:nth-child(1) { animation-delay: 0s; }
        .nav-link:hover .nav-letter:nth-child(2) { animation-delay: 0.1s; }
        .nav-link:hover .nav-letter:nth-child(3) { animation-delay: 0.2s; }
        .nav-link:hover .nav-letter:nth-child(4) { animation-delay: 0.3s; }
        .nav-link:hover .nav-letter:nth-child(5) { animation-delay: 0.4s; }
        .nav-link:hover .nav-letter:nth-child(6) { animation-delay: 0.5s; }
        .nav-link:hover .nav-letter:nth-child(7) { animation-delay: 0.6s; }
      `}</style>

      <div className="fixed top-3 left-0 w-full flex justify-center z-50">
        <nav className="bg-black px-5 py-3 flex gap-8 rounded-md">
          {links.map(({ href, label }) => (
            <Link key={href} href={href} legacyBehavior>
              <a className="nav-link text-gray-400 text-xs font-normal cursor-pointer select-none">
                {label.split('').map((letter, i) => (
                  <span key={i} className="nav-letter">
                    {letter}
                  </span>
                ))}
              </a>
            </Link>
          ))}
        </nav>
      </div>
    </>
  );
}
