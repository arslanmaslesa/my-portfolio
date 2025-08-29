'use client';
import Image from "next/image";
import { Poppins } from 'next/font/google';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

const ProjectCard = ({ image, title }) => (
  <div className="relative w-full h-full rounded-[12px] overflow-hidden bg-neutral-100 group">
    <Image
      src={image}
      alt={title}
      fill
      sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
      className="object-cover transform transition-transform duration-500 ease-in-out group-hover:scale-105"
    />
    <div className={`absolute bottom-3 2xl:bottom-6 left-3 2xl:left-6 pl-6 2xl:pl-12 pr-2 2xl:pr-4 py-2 2xl:py-4 gap-3 2xl:gap-6 inline-flex items-center w-fit h-fit rounded-[8px] bg-white ${poppins.className}`}>
      <p className="text-black text-[16px] 2xl:text-[24px] font-semibold leading-none whitespace-nowrap">
        {title}
      </p>
      <div className="h-9 w-9 2xl:h-16 2xl:w-16 rounded-full bg-[#E6E6E6] flex items-center justify-center transition-colors duration-500 group-hover:bg-black">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
          strokeWidth="3" stroke="currentColor"
          className="h-4 w-4 text-black transition-colors duration-300 group-hover:text-white">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </div>
  </div>
);

export default ProjectCard;
