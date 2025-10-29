'use client';
import ProjectCard from "./ProjectCard";
import cn from "../utils/cn";
import { useCaseStudy } from "./CaseStudyProvider"; // adjust path if needed
import { PROJECTS } from "./projectsData"; // or your original PROJECTS

const itemHeight = 'h-[calc(100vw-108px)] md:h-[calc((100vw-64px)/2-44px)]';

const ProjectSection = ({ projects = PROJECTS }) => {
  const { openCaseStudy } = useCaseStudy();

  return (
    <section className="px-3 2xl:px-6 py-3 2xl:py-6">
      <div className="grid gap-3 2xl:gap-6 grid-cols-1 md:grid-cols-2">
        {projects.map((p) => (
          <div key={p.id} className={cn('w-full', itemHeight, p.featured && 'md:col-span-2')}>
            <ProjectCard
              project={p}
              image={p.image}
              title={p.title}
              video={p.video}
              subtitles={p.subtitles}
              showSoundButton={p.showSoundButton}
              skills={p.skills}
              onOpen={() => openCaseStudy(p)}
            />
          </div>
        ))}
      </div>
    </section>
  );
};

export default ProjectSection;
