'use client';
import ProjectCard from "./ProjectCard";
import cn from "../utils/cn";

const PROJECTS = [
  { id: 1, image: '/proj1.png', title: 'Appo Landing Page' },
  { id: 2, image: '/proj2.png', title: 'Appo' },
  { id: 3, 
    image: '/proj3.png', 
    title: 'Appo for Business', 
    featured: true,
    video: '/appoproductdemo.mp4',
    subtitles: '/appoproductdemo.vtt', // <-- optional subtitles
  },
  { id: 4, image: '/proj4.png', title: 'Book Covers' },
  { id: 5, image: '/proj5.png', title: 'Kapetanovina Visit Card' },
];

const itemHeight = 'h-[calc(100vw-108px)] md:h-[calc((100vw-64px)/2-44px)]';

const ProjectSection = ({ projects = PROJECTS }) => (
  <section className="px-3 2xl:px-6 pb-3 2xl:pb-6">
    <div className="grid gap-3 2xl:gap-6 grid-cols-1 md:grid-cols-2">
      {projects.map((p) => (
        <div key={p.id} className={cn('w-full', itemHeight, p.featured && 'md:col-span-2')}>
          <ProjectCard 
            image={p.image} 
            title={p.title} 
            video={p.video} 
            subtitles={p.subtitles} 
          />
        </div>
      ))}
    </div>
  </section>
);

export default ProjectSection;
