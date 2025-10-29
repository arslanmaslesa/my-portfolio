'use client';

import React, { useEffect, useRef, useState } from 'react';

/*
  CaseStudyContent with improved Media component for Safari compatibility.
  - Handles mp4 videos and images everywhere (hero, gallery, pairs, doubles, singles).
  - Adds webkit-playsinline, playsInline, crossOrigin, <source type="video/mp4">, and fallbacks.
  - If video fails to play on Safari, component falls back to poster/img.
*/

const isVideoUrl = (url) =>
  typeof url === 'string' && /\.(mp4|webm|mov|m4v)(\?.*)?$/i.test(url || '');

// Best-effort codec string for canPlayType checks.
const mp4Codec = 'video/mp4; codecs="avc1.42E01E, mp4a.40.2"';

const Media = ({ src, alt = '', className = '', showControls = false, poster = undefined, ...rest }) => {
  const [failed, setFailed] = useState(false);
  const [canPlay, setCanPlay] = useState(true);
  const ref = useRef(null);

  useEffect(() => {
    setFailed(false);
    setCanPlay(true);
  }, [src]);

  // Only run canPlayType in browser
  useEffect(() => {
    if (!isVideoUrl(src)) return;
    try {
      const v = document.createElement('video');
      // If browser explicitly says it can't play mp4 codec, mark as cannot play.
      const support = v.canPlayType(mp4Codec);
      if (!support || support === '') {
        setCanPlay(false);
      } else {
        setCanPlay(true);
      }
    } catch (e) {
      setCanPlay(true);
    }
  }, [src]);

  useEffect(() => {
    // Safari needs the webkit-playsinline attribute set directly on the element for iOS.
    if (ref.current && typeof ref.current.setAttribute === 'function') {
      try {
        ref.current.setAttribute('webkit-playsinline', 'true');
      } catch (e) {
        // ignore
      }
    }
  }, [ref.current]);

  if (!src || typeof src !== 'string') return null;

  // If the source is a video and browser says it can likely play it, render <video>.
  if (isVideoUrl(src) && canPlay && !failed) {
    // When showControls is true we enable controls and unmute; otherwise autoplay muted loop playsInline for demos.
    const controls = !!showControls;
    const muted = !controls;
    const autoPlay = !controls;
    const loop = !controls;

    return (
      <video
        ref={ref}
        className={className}
        preload="metadata"
        controls={controls}
        muted={muted}
        autoPlay={autoPlay}
        loop={loop}
        playsInline
        // crossOrigin can help if your server serves CORs and decoding is sensitive.
        crossOrigin="anonymous"
        poster={poster}
        aria-label={alt}
        onError={() => setFailed(true)}
        onAbort={() => setFailed(true)}
        {...rest}
      >
        {/* Use a <source> with type; some browsers prefer the explicit source/type pairing */}
        <source src={src} type="video/mp4" />
        {/* generic fallback */}
        Your browser does not support the video tag.
      </video>
    );
  }

  // Fallback to poster image (if provided) or a normal <img>.
  const fallbackSrc = poster || (isVideoUrl(src) ? src.replace(/\.(mp4|webm|mov|m4v)(\?.*)?$/i, '.png') : src);

  return (
    <img
      src={fallbackSrc}
      alt={alt}
      loading="lazy"
      className={className}
      onError={() => {
        // If poster also doesn't load, hide element gracefully.
        setFailed(true);
      }}
      {...rest}
    />
  );
};

const CaseStudyContent = ({ project = {}, onClose = () => {}, panelRef }) => {
  // Prefer image2 (hero image/video), then image, then video; keep heroColor fallback.
  const hero = project.image2 || project.image || project.video || project.heroColor || null;
  const categories = project.categories || project.tags || [];

  const projectInfo = project.info || [
    { title: 'Role', info: project.role || 'Product Designer' },
    { title: 'Duration', info: project.timeline || project.duration || '2 weeks' },
    { title: 'Client', info: project.client || project.title || 'Hotel Kapetanovina' },
    { title: 'Deliverables', info: project.deliverables || 'Visit card design, branding assets' },
    {
      title: 'Tools',
      info:
        (project.tools && project.tools.join(', ')) ||
        (project.skills && project.skills.join(', ')) ||
        'Figma, Illustrator',
    },
  ];

  const researchBody = (() => {
    const r = project.research;
    if (Array.isArray(r)) {
      return r
        .map((item) =>
          typeof item === 'string'
            ? item
            : item.finding || item.description || JSON.stringify(item)
        )
        .join('\n\n');
    }
    if (typeof r === 'string' && r.trim().length) return r;
    if (r && typeof r === 'object') {
      if (r.finding || r.description) return r.finding || r.description;
      try {
        return JSON.stringify(r);
      } catch (e) {
        return '';
      }
    }
    return 'User interviews, competitor review, analytics.';
  })();

  // --- Multiple solutions support (handles both `solution` and `solutions`) ---
  const solutionBlocks = Array.isArray(project.solutions)
    ? project.solutions.map((s, idx) => ({
        key: `solution-${idx}`,
        title: s.title || `Solution ${idx + 1}`,
        body:
          s.description ||
          s.body ||
          'A concise walkthrough of the solution: core features, interaction flow, and key design decisions.',
      }))
    : project.solution
    ? [
        {
          key: 'solution',
          title: project.solutionTitle || 'Solution',
          body: project.solution,
        },
      ]
    : [
        {
          key: 'solution',
          title: 'Solution',
          body:
            project.solution ||
            'A concise walkthrough of the solution: core features, interaction flow, and key design decisions that solved the challenge.',
        },
      ];

  const textBlocks = [
    {
      key: 'challenge',
      title: 'Challenge',
      body:
        project.challenge ||
        project.problem ||
        "Describe the user's problem, constraints, and why solving it mattered.",
    },
    { key: 'research', title: 'Research & Insights', body: researchBody },
    ...solutionBlocks,
    {
      key: 'impact',
      title: 'Impact',
      body:
        project.impact ||
        project.outcome ||
        'Concrete results and metrics: conversion lift, time saved, retention change, or qualitative outcomes.',
    },
  ];

  // --- Gallery images ---
  const galleryImages =
    project.gallery && project.gallery.length
      ? project.gallery
      : project.images && project.images.length
      ? project.images
      : [
          'https://picsum.photos/seed/p1/1200/800',
          'https://picsum.photos/seed/p2/1200/800',
          'https://picsum.photos/seed/p3/1200/800',
          'https://picsum.photos/seed/p4/1200/800',
          'https://picsum.photos/seed/p5/1200/800',
          'https://picsum.photos/seed/p6/1200/800',
          'https://picsum.photos/seed/p7/1200/800',
          'https://picsum.photos/seed/p8/1200/800',
        ];

  // --- Build alternating layout ---
  const layout = [];
  let gi = 0; // gallery image index
  let ti = 0; // text block index
  let bigOnLeft = true;

  if (gi + 1 < galleryImages.length) {
    layout.push({
      type: 'double',
      imgs: [galleryImages[gi++], galleryImages[gi++]],
      orientation: bigOnLeft ? 'bigLeft' : 'bigRight',
    });
    bigOnLeft = !bigOnLeft;
  } else if (gi < galleryImages.length) {
    layout.push({ type: 'single', img: galleryImages[gi++] });
  }

  while (ti < textBlocks.length && gi < galleryImages.length) {
    const orientation = bigOnLeft ? 'imageLeft' : 'textLeft';
    layout.push({
      type: 'pair',
      img: galleryImages[gi++],
      text: textBlocks[ti++],
      orientation,
    });
    bigOnLeft = !bigOnLeft;
  }

  while (gi < galleryImages.length) {
    if (gi + 1 < galleryImages.length) {
      layout.push({
        type: 'double',
        imgs: [galleryImages[gi++], galleryImages[gi++]],
        orientation: bigOnLeft ? 'bigLeft' : 'bigRight',
      });
      bigOnLeft = !bigOnLeft;
    } else {
      layout.push({ type: 'single', img: galleryImages[gi++] });
    }
  }

  const remainingTextBlocks = textBlocks.slice(ti);
  const galleryImgClass =
    'w-full h-[20rem] md:h-[36rem] object-cover rounded-[8px]';

  // Helper to pass showControls based on project-wide flag
  const showControls = !!project.showSoundButton;

  return (
    <article
      ref={panelRef}
      className="relative bg-white overflow-visible text-black p-3 xxl:p-6 rounded-[12px] font-sans"
      onClick={(e) => e.stopPropagation()}
      style={{
        fontFamily:
          "'Poppins', system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial",
      }}
    >
      {/* CLOSE */}
      <button
        data-cs-close
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        aria-label="Close case study"
        className="absolute top-3 right-3 h-9 w-9 2xl:h-16 2xl:w-16 rounded-full bg-gray-100 flex items-center justify-center transition-colors duration-500 hover:bg-black group"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          className="h-4 w-4 text-black transition-colors duration-300 group-hover:text-white"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M6 6 L18 18 M6 18 L18 6" />
        </svg>
      </button>

      {/* HEADER */}
      <header className="pt-36 pb-3">
        <div className="flex items-end gap-12">
          <div className="pb-3 flex flex-col gap-0 w-36 shrink-0">
            {categories && categories.length > 0 ? (
              categories.slice(0, 6).map((c, i) => (
                <span
                  key={i}
                  className="text-[16px] text-black w-full text-left"
                >
                  {typeof c === 'string' ? c : c.label || c}
                </span>
              ))
            ) : (
              <>
                <span className="text-[16px] text-black w-full text-left">UI/UX</span>
                <span className="text-[16px] text-black w-full text-left">Product Design</span>
                <span className="text-[16px] text-black w-full text-left">Branding</span>
              </>
            )}
          </div>

          <div className="flex-1">
            <h1 className="text-[48px] font-[400] tracking-[-0.04em]">
              {project.title || 'Project Title'}
            </h1>
          </div>
        </div>
      </header>

      {/* HERO */}
      {hero && (
        <section>
          {project.image2 || project.video || project.image ? (
            <div className="overflow-hidden mb-6 rounded-[8px]">
              <Media
                src={project.image2 || project.video || project.image}
                alt={project.title || 'hero'}
                className="w-full h-[29rem] md:h-[36rem] object-cover rounded-[8px]"
                showControls={showControls}
                poster={project.poster}
              />
            </div>
          ) : (
            <div
              className="mb-6 h-44 md:h-56 flex items-center justify-center rounded-[8px]"
              style={{ background: project.heroColor || '#f3f4f6' }}
            >
              <span className="text-neutral-600">
                {project.title || 'Visual'}
              </span>
            </div>
          )}
        </section>
      )}

      {/* NARRATIVE */}
      <div className="pt-6 space-y-3">
        {/* SUMMARY */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-3 pl-3">
          <div className="md:col-span-1">
            <p className="text-black text-[16px]">
              {project.summary ||
                'One-paragraph summary that hooks the reader: what this project was about, who it was for, and the primary impact.'}
            </p>
          </div>
          <div className="md:col-span-2" />
        </section>

        {/* PROJECT INFO */}
        <section className="grid grid-cols-1 md:grid-cols-3 ml-12 mr-3 gap-3">
          <div className="md:col-span-2 md:col-start-2 flex flex-col space-y-3">
            {projectInfo.map((item, i) => (
              <div
                key={i}
                className="bg-gray-100 p-3 rounded-[8px] flex items-center justify-between gap-3"
                role="group"
                aria-label={`${item.title}: ${item.info}`}
              >
                <div className="uppercase text-black text-[16px] leading-tight flex-shrink-0">
                  {item.title}
                </div>
                <div className="flex-1 text-right text-black text-[16px] break-words ml-3">
                  {item.info}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* GALLERY + TEXT BLOCKS */}
        <section className="mt-12 space-y-3">
          {layout.map((block, idx) => {
            if (block.type === 'single') {
              return (
                <div key={idx} className="w-full">
                  <Media
                    src={block.img}
                    alt={`${project.title || 'project'} - img ${idx + 1}`}
                    showControls={showControls}
                    className={galleryImgClass}
                    poster={project.poster}
                  />
                </div>
              );
            }

            if (block.type === 'double') {
              if (block.orientation === 'bigLeft') {
                return (
                  <div
                    key={idx}
                    className="grid grid-cols-1 md:grid-cols-3 gap-3 items-stretch"
                  >
                    <div className="order-1 md:order-1 md:col-span-2">
                      <Media
                        src={block.imgs[0]}
                        alt={`${project.title || 'project'} - img ${idx + 1}-a`}
                        showControls={showControls}
                        className={galleryImgClass}
                        poster={project.poster}
                      />
                    </div>
                    <div className="order-2 md:order-2 md:col-span-1">
                      <Media
                        src={block.imgs[1]}
                        alt={`${project.title || 'project'} - img ${idx + 1}-b`}
                        showControls={showControls}
                        className={galleryImgClass}
                        poster={project.poster}
                      />
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={idx}
                  className="grid grid-cols-1 md:grid-cols-3 gap-3 items-stretch"
                >
                  <div className="order-1 md:order-1 md:col-span-1">
                    <Media
                      src={block.imgs[0]}
                      alt={`${project.title || 'project'} - img ${idx + 1}-a`}
                      showControls={showControls}
                      className={galleryImgClass}
                      poster={project.poster}
                    />
                  </div>
                  <div className="order-2 md:order-2 md:col-span-2">
                    <Media
                      src={block.imgs[1]}
                      alt={`${project.title || 'project'} - img ${idx + 1}-b`}
                      showControls={showControls}
                      className={galleryImgClass}
                      poster={project.poster}
                    />
                  </div>
                </div>
              );
            }

            // TEXT + IMAGE pair
            return (
              <div
                key={idx}
                className="grid grid-cols-1 md:grid-cols-3 gap-3 items-stretch"
              >
                {block.orientation === 'textLeft' ? (
                  <>
                    <div className="order-1 md:order-1 md:col-span-1 flex flex-col justify-center px-3">
                      <h3 className="uppercase text-[12px] text-gray-500">
                        {block.text.title}
                      </h3>
                      <div className="mt-2 whitespace-pre-line">
                        {block.text.body}
                      </div>
                    </div>

                    <div className="order-2 md:order-2 md:col-span-2">
                      <Media
                        src={block.img}
                        alt={`${project.title || 'project'} - paired img ${idx + 1}`}
                        showControls={showControls}
                        className={galleryImgClass}
                        poster={project.poster}
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="order-1 md:order-1 md:col-span-2">
                      <Media
                        src={block.img}
                        alt={`${project.title || 'project'} - paired img ${idx + 1}`}
                        showControls={showControls}
                        className={galleryImgClass}
                        poster={project.poster}
                      />
                    </div>

                    <div className="order-2 md:order-2 md:col-span-1 flex flex-col justify-center px-3">
                      <h3 className="uppercase text-[12px] text-gray-500">
                        {block.text.title}
                      </h3>
                      <div className="mt-2 text-black whitespace-pre-line">
                        {block.text.body}
                      </div>
                    </div>
                  </>
                )}
              </div>
            );
          })}

          {/* Remaining text-only blocks */}
          {remainingTextBlocks.length > 0 && (
            <div className="space-y-8 px-3 md:px-6">
              {remainingTextBlocks.map((tb, i) => (
                <div key={tb.key || i}>
                  <h3 className="font-semibold">{tb.title}</h3>
                  <p className="mt-2 text-neutral-700 whitespace-pre-line">{tb.body}</p>
                </div>
              ))}
            </div>
          )}
        </section>

        {project.demoVideo && (
  <section>
    <div className="overflow-hidden rounded-[8px]">
      <video
        src={project.demoVideo}
        controls
        className="w-full md:h-[36rem] object-cover rounded-[8px]"
        poster={project.poster}
      />
    </div>
  </section>
)}

      </div>
    </article>
  );
};

export default CaseStudyContent;
