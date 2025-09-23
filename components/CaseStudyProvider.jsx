'use client';

import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

/*
  CASE STUDY PROVIDER — Tailwind-first version (fixed for desktop+mobile)
  - Adds a desktop wheel handler so wheel/trackpad scroll works when overlay is open
  - Keeps mobile touch handling that prevents rubber-banding but allows native overlay scrolling
  - Backdrop lives on the overlay container (so it doesn't steal pointer events)
  - Uses 100dvh to avoid iOS address-bar gaps
*/

const CaseStudyContext = createContext(null);
export const useCaseStudy = () => {
  const ctx = useContext(CaseStudyContext);
  if (!ctx) throw new Error("useCaseStudy must be used inside CaseStudyProvider");
  return ctx;
};

export const CaseStudyProvider = ({ children, lenis = null }) => {
  const [open, setOpen] = useState(false);
  const [project, setProject] = useState(null);

  const openCaseStudy = (proj) => {
    setProject(proj || null);
    setOpen(true);
    if (typeof document !== "undefined") {
      document.body.style.overflow = "hidden";
      document.body.classList.add("case-study-open");
    }
    if (typeof window !== "undefined") window.__CASE_STUDY_OPEN = true;
  };

  const closeCaseStudy = () => {
    setOpen(false);
    setTimeout(() => setProject(null), 180);
    if (typeof document !== "undefined") {
      document.body.style.overflow = "";
      document.body.classList.remove("case-study-open");
    }
    if (typeof window !== "undefined") window.__CASE_STUDY_OPEN = false;
  };

  return (
    <CaseStudyContext.Provider value={{ open, project, openCaseStudy, closeCaseStudy }}>
      {children}
      {open && <CaseStudyOverlay project={project} onClose={closeCaseStudy} lenis={lenis} />}
    </CaseStudyContext.Provider>
  );
};

export default CaseStudyProvider;

/* ---------------- CaseStudyOverlay (desktop wheel + mobile touch handling) ---------------- */
const CaseStudyOverlay = ({ project = {}, onClose, lenis = null }) => {
  const portalRef = useRef(null);
  const overlayRef = useRef(null); // scroll container + backdrop
  const panelRef = useRef(null);
  const lenisPaused = useRef(false);

  // create portal root synchronously (client-only)
  if (typeof document !== "undefined" && !portalRef.current) {
    let el = document.getElementById("case-study-root");
    if (!el) {
      el = document.createElement("div");
      el.id = "case-study-root";
      document.body.appendChild(el);
    }
    portalRef.current = el;
  }

  // Pause lenis when overlay opens
  useEffect(() => {
    try {
      if (lenis && typeof lenis.stop === "function") {
        lenis.stop();
        lenisPaused.current = true;
      }
    } catch (e) {
      lenisPaused.current = false;
    }

    return () => {
      try {
        if (lenis && lenisPaused.current) {
          if (typeof lenis.start === "function") lenis.start();
          else if (typeof lenis.resume === "function") lenis.resume();
        }
      } catch (e) {}
    };
  }, [lenis]);

  // ESC to close
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener("keydown", onKey, { passive: false });

    return () => {
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  // click outside (overlay) closes the panel
  const onOverlayMouseDown = (e) => {
    if (panelRef.current && panelRef.current.contains(e.target)) return;
    onClose();
  };

  // -------- touch scrolling / overscroll containment for mobile --------
  useEffect(() => {
    const el = overlayRef.current;
    if (!el) return;

    let startY = 0;

    const onTouchStart = (ev) => {
      if (!ev.touches || ev.touches.length === 0) return;
      startY = ev.touches[0].clientY;
    };

    const onTouchMove = (ev) => {
      if (!ev.touches || ev.touches.length === 0) return;
      const currY = ev.touches[0].clientY;
      const deltaY = currY - startY; // positive when pulling down

      // if at top and pulling down -> prevent body rubber band
      if (el.scrollTop === 0 && deltaY > 0) {
        ev.preventDefault();
        return;
      }

      // if at bottom and pushing up -> prevent body rubber band
      if (el.scrollHeight - el.clientHeight - el.scrollTop <= 1 && deltaY < 0) {
        ev.preventDefault();
        return;
      }

      // otherwise allow overlay to scroll natively
    };

    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: false });

    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
    };
  }, []);

  // -------- desktop wheel / trackpad handling so wheel scrolls the overlay --------
  // React's onWheel is non-passive so preventDefault works there.
  const handleWheel = (e) => {
    const el = overlayRef.current;
    if (!el) return;

    // if the event started inside the panel and the panel can scroll, let it
    if (panelRef.current && panelRef.current.contains(e.target)) {
      // If the panel itself is scrollable, don't hijack. Check if panel has scrollable overflow.
      const panel = panelRef.current;
      const canPanelScroll = panel.scrollHeight > panel.clientHeight;
      if (canPanelScroll) return; // let native panel scrolling happen
    }

    // prevent body from scrolling and move the overlay instead
    e.preventDefault();
    e.stopPropagation();

    // Some mice/trackpads send very small deltas; just apply them
    el.scrollBy({ top: e.deltaY, left: e.deltaX || 0, behavior: 'auto' });
  };

  if (!portalRef.current) return null;

  const hero = project.image || project.video || project.heroColor || null;
  const categories = project.categories || project.tags || [];

  const projectInfo = project.info || [
    { title: "Role", info: project.role || "Product Designer" },
    { title: "Duration", info: project.timeline || project.duration || "2 weeks" },
    { title: "Client", info: project.client || project.title || "Hotel Kapetanovina" },
    { title: "Deliverables", info: project.deliverables || "Visit card design, branding assets" },
    { title: "Tools", info: (project.tools && project.tools.join(", ")) || (project.skills && project.skills.join(", ")) || "Figma, Illustrator" },
  ];

  const researchBody = (() => {
    const r = project.research;
    if (Array.isArray(r)) {
      return r.map(item => (typeof item === 'string' ? item : (item.finding || item.description || JSON.stringify(item)))).join('\n\n');
    }
    if (typeof r === 'string' && r.trim().length) return r;
    if (r && typeof r === 'object') {
      if (r.finding || r.description) return r.finding || r.description;
      try { return JSON.stringify(r); } catch (e) { return '' }
    }
    return "User interviews, competitor review, analytics.";
  })();

  const galleryImages = (project.gallery && project.gallery.length) ? project.gallery : (
    project.images && project.images.length ? project.images :
    [
      "https://picsum.photos/seed/p1/1200/800",
      "https://picsum.photos/seed/p2/1200/800",
      "https://picsum.photos/seed/p3/1200/800",
      "https://picsum.photos/seed/p4/1200/800",
      "https://picsum.photos/seed/p5/1200/800",
      "https://picsum.photos/seed/p6/1200/800",
      "https://picsum.photos/seed/p7/1200/800",
      "https://picsum.photos/seed/p8/1200/800",
    ]
  );

  const textBlocks = [
    { key: 'challenge', title: 'Challenge', body: project.challenge || project.problem || "Describe the user's problem, constraints, and why solving it mattered." },
    { key: 'research', title: 'Research & Insights', body: researchBody },
    { key: 'solution', title: 'Solution', body: project.solution || "A concise walkthrough of the solution: core features, interaction flow, and key design decisions that solved the challenge." },
    { key: 'impact', title: 'Impact', body: project.impact || project.outcome || "Concrete results and metrics: conversion lift, time saved, retention change, or qualitative outcomes." },
  ];

  // build layout (same as before)
  const layout = [];
  let gi = 0;
  let ti = 0;
  let bigOnLeft = true;

  if (gi + 1 < galleryImages.length) {
    layout.push({ type: 'double', imgs: [galleryImages[gi++], galleryImages[gi++]], orientation: bigOnLeft ? 'bigLeft' : 'bigRight' });
    bigOnLeft = !bigOnLeft;
  } else if (gi < galleryImages.length) {
    layout.push({ type: 'single', img: galleryImages[gi++] });
  }

  while (ti < textBlocks.length && gi < galleryImages.length) {
    const orientation = bigOnLeft ? 'imageLeft' : 'textLeft';
    layout.push({ type: 'pair', img: galleryImages[gi++], text: textBlocks[ti++], orientation });
    bigOnLeft = !bigOnLeft;
  }

  while (gi < galleryImages.length) {
    if (gi + 1 < galleryImages.length) {
      layout.push({ type: 'double', imgs: [galleryImages[gi++], galleryImages[gi++]], orientation: bigOnLeft ? 'bigLeft' : 'bigRight' });
      bigOnLeft = !bigOnLeft;
    } else {
      layout.push({ type: 'single', img: galleryImages[gi++] });
    }
  }

  const remainingTextBlocks = textBlocks.slice(ti);

  const galleryImgClass = "w-full h-[20rem] md:h-[36rem] object-cover rounded-[8px]";

  const content = (
    <div
      ref={overlayRef}
      onMouseDown={onOverlayMouseDown}
      onWheel={handleWheel}
      className="fixed inset-0 z-50 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label={project.title || "Case study"}
      style={{
        // backdrop and scroll friendly styles
        background: 'rgba(0,0,0,0.8)',
        WebkitOverflowScrolling: 'touch',
        touchAction: 'pan-y',
        overscrollBehavior: 'contain',
        minHeight: '100dvh', // try to cover dynamic viewport (iOS/Android address bar)
      }}
    >
      {/* Inline font loader */}
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap"
      />

      {/* Panel flow */}
      <div className="relative z-40">
        <div className="mx-6 my-6 md:mx-28" style={{ marginBottom: '3rem' }}>
          <article
            ref={panelRef}
            className="relative bg-white overflow-visible text-black p-3 xxl:p-6 rounded-[12px] font-sans"
            onMouseDown={(e) => e.stopPropagation()}
            style={{ fontFamily: "'Poppins', system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial" }}
          >

            {/* CLOSE */}
            <button
              data-cs-close
              onClick={(e) => { e.stopPropagation(); onClose(); }}
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
                      <span key={i} className="text-[16px] text-black w-full text-left">
                        {typeof c === 'string' ? c : (c.label || c)}
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
                    {project.title || "Project Title"}
                  </h1>
                </div>
              </div>
            </header>

            {/* HERO */}
            {hero && (
              <section>
                {project.video ? (
                  <div className="overflow-hidden mb-6 rounded-[8px]">
                    <video src={project.video} controls className="w-full h-auto object-cover rounded-[8px]" />
                  </div>
                ) : project.image2 ? (
                  <div className="overflow-hidden mb-6 rounded-[8px]">
                    <img src={project.image2} alt={project.title || "hero"} className="w-full h-[29rem] md:h-[36rem] object-cover rounded-[8px]" />
                  </div>
                ) : (
                  <div className="mb-6 h-44 md:h-56 flex items-center justify-center rounded-[8px]" style={{ background: project.heroColor || "#f3f4f6" }}>
                    <span className="text-neutral-600">{project.title || "Visual"}</span>
                  </div>
                )}
              </section>
            )}

            {/* NARRATIVE */}
            <div className="pt-6 space-y-3">
              <section className="grid grid-cols-1 md:grid-cols-3 gap-3 pl-3">
                <div className="md:col-span-1">
                  <p className="text-black text-[16px]">
                    {project.summary || "One-paragraph summary that hooks the reader: what this project was about, who it was for, and the primary impact."}
                  </p>
                </div>
                <div className="md:col-span-2" />
              </section>

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

              <section className="mt-12 space-y-3">
                {layout.map((block, idx) => {
                  if (block.type === 'single') {
                    return (
                      <div key={idx} className="w-full">
                        <img src={block.img} alt={`${project.title || 'project'} - img ${idx + 1}`} loading="lazy" className={galleryImgClass} />
                      </div>
                    );
                  }

                  if (block.type === 'double') {
                    if (block.orientation === 'bigLeft') {
                      return (
                        <div key={idx} className="grid grid-cols-1 md:grid-cols-3 gap-3 items-stretch">
                          <div className="order-1 md:order-1 md:col-span-2">
                            <img src={block.imgs[0]} alt={`${project.title || 'project'} - img ${idx + 1}-a`} loading="lazy" className={galleryImgClass} />
                          </div>
                          <div className="order-2 md:order-2 md:col-span-1">
                            <img src={block.imgs[1]} alt={`${project.title || 'project'} - img ${idx + 1}-b`} loading="lazy" className={galleryImgClass} />
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div key={idx} className="grid grid-cols-1 md:grid-cols-3 gap-3 items-stretch">
                        <div className="order-1 md:order-1 md:col-span-1">
                          <img src={block.imgs[0]} alt={`${project.title || 'project'} - img ${idx + 1}-a`} loading="lazy" className={galleryImgClass} />
                        </div>
                        <div className="order-2 md:order-2 md:col-span-2">
                          <img src={block.imgs[1]} alt={`${project.title || 'project'} - img ${idx + 1}-b`} loading="lazy" className={galleryImgClass} />
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div key={idx} className="grid grid-cols-1 md:grid-cols-3 gap-3 items-stretch">
                      {block.orientation === 'textLeft' ? (
                        <>
                          <div className="order-1 md:order-1 md:col-span-1 flex flex-col justify-center px-3">
                            <h3 className="uppercase text-[12px] text-gray-500">{block.text.title}</h3>
                            <div className="mt-2 whitespace-pre-line">{block.text.body}</div>
                          </div>

                          <div className="order-2 md:order-2 md:col-span-2">
                            <img src={block.img} alt={`${project.title || 'project'} - paired img ${idx + 1}`} loading="lazy" className={galleryImgClass} />
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="order-1 md:order-1 md:col-span-2">
                            <img src={block.img} alt={`${project.title || 'project'} - paired img ${idx + 1}`} loading="lazy" className={galleryImgClass} />
                          </div>

                          <div className="order-2 md:order-2 md:col-span-1 flex flex-col justify-center px-3">
                            <h3 className="uppercase text-[12px] text-gray-500">{block.text.title}</h3>
                            <div className="mt-2 text-black whitespace-pre-line">{block.text.body}</div>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}

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

            </div>

          </article>
        </div>
      </div>
    </div>
  );

  return createPortal(content, portalRef.current);
};
