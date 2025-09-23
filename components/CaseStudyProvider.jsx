'use client';

import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

/*
  CASE STUDY PROVIDER — Tailwind-first version (updated)
  - Layout now alternates: DOUBLE IMAGES and PAIR (image+text) rows, starting with DOUBLE
  - In paired rows the text column takes up 1/3 and the image 2/3 on md+ screens
  - Paired text blocks still alternate orientation (first pair shows TEXT on LEFT)
  - Paired text segments have px-3
  - Grid gaps use gap-3
  - Fix: double rows now follow the same flipping pattern as pairs (big image alternates left/right)
  - Gallery images are forced to a uniform height (mobile and md+) — hero image is intentionally left unchanged
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

/* ---------------- CaseStudyOverlay (no focus stuff) ---------------- */
const CaseStudyOverlay = ({ project = {}, onClose, lenis = null }) => {
  const portalRef = useRef(null);
  const overlayRef = useRef(null); // overlay scroll container
  const panelRef = useRef(null);   // the card/panel inside overlay
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

  // ---------------- Core interception logic (fixed to avoid recursion) ----------------
  useEffect(() => {
    if (typeof window === "undefined") return;

    window.__CASE_STUDY_OPEN = true;
    if (!window.mouse) window.mouse = { x: 0, y: 0 };

    const redispatchToTarget = (origEvt) => {
      try {
        const target = origEvt.target;
        if (!target || !panelRef.current || !panelRef.current.contains(target)) return;

        const init = {
          bubbles: true,
          cancelable: true,
          composed: true,
          clientX: origEvt.clientX,
          clientY: origEvt.clientY,
          screenX: origEvt.screenX,
          screenY: origEvt.screenY,
          movementX: origEvt.movementX || 0,
          movementY: origEvt.movementY || 0,
          buttons: origEvt.buttons || 0,
          relatedTarget: origEvt.relatedTarget || null,
        };

        try {
          window.__CS_REDIRECTING = true;
          let evt;
          try {
            evt = new PointerEvent(origEvt.type, init);
          } catch (e) {
            evt = new MouseEvent(origEvt.type, init);
          }
          target.dispatchEvent(evt);
        } finally {
          setTimeout(() => {
            try { window.__CS_REDIRECTING = false; } catch (e) {}
          }, 0);
        }
      } catch (err) {}
    };

    const captureMoveBlocker = (e) => {
      try {
        if (window.__CS_REDIRECTING) return;
        if (typeof e.clientX === 'number' && typeof e.clientY === 'number') {
          window.mouse = { x: e.clientX, y: e.clientY };
        }
        if (typeof e.stopImmediatePropagation === "function") e.stopImmediatePropagation();
        e.stopPropagation();

        if (panelRef.current && panelRef.current.contains(e.target)) {
          redispatchToTarget(e);
        }
      } catch (err) {}
    };

    const onWheel = (e) => {
      try {
        if (window.__CS_REDIRECTING) return;
        if (typeof e.clientX === 'number' && typeof e.clientY === 'number') {
          window.mouse = { x: e.clientX, y: e.clientY };
        }
        e.preventDefault();
        if (typeof e.stopImmediatePropagation === "function") e.stopImmediatePropagation();
        e.stopPropagation();

        const overlay = overlayRef.current;
        if (overlay) overlay.scrollBy({ top: e.deltaY, left: e.deltaX || 0, behavior: "auto" });
      } catch (err) {}
    };

    let touchActive = false;
    let lastY = 0;
    const onTouchStart = (ev) => {
      try {
        if (window.__CS_REDIRECTING) return;
        touchActive = true;
        lastY = ev.touches && ev.touches[0] ? ev.touches[0].clientY : 0;
        if (ev.touches && ev.touches[0]) window.mouse = { x: ev.touches[0].clientX, y: ev.touches[0].clientY };
      } catch (err) { touchActive = false; lastY = 0; }
    };
    const onTouchMove = (ev) => {
      try {
        if (window.__CS_REDIRECTING) return;
        if (!touchActive) return;
        ev.preventDefault();
        if (typeof ev.stopImmediatePropagation === "function") ev.stopImmediatePropagation();
        ev.stopPropagation();
        const overlay = overlayRef.current;
        const currY = ev.touches && ev.touches[0] ? ev.touches[0].clientY : lastY;
        const delta = lastY ? (lastY - currY) : 0;
        if (overlay && delta) overlay.scrollBy({ top: delta, behavior: "auto" });
        lastY = currY;
        if (ev.touches && ev.touches[0]) window.mouse = { x: ev.touches[0].clientX, y: ev.touches[0].clientY };
      } catch (err) {}
    };

    window.addEventListener("pointermove", captureMoveBlocker, { capture: true, passive: false });
    window.addEventListener("mousemove", captureMoveBlocker, { capture: true, passive: false });
    window.addEventListener("wheel", onWheel, { capture: true, passive: false });
    window.addEventListener("touchstart", onTouchStart, { capture: true, passive: false });
    window.addEventListener("touchmove", onTouchMove, { capture: true, passive: false });

    return () => {
      window.removeEventListener("pointermove", captureMoveBlocker, { capture: true });
      window.removeEventListener("mousemove", captureMoveBlocker, { capture: true });
      window.removeEventListener("wheel", onWheel, { capture: true });
      window.removeEventListener("touchstart", onTouchStart, { capture: true });
      window.removeEventListener("touchmove", onTouchMove, { capture: true });
      window.__CASE_STUDY_OPEN = false;
      try { window.__CS_REDIRECTING = false; } catch (e) {}
    };
  }, []);

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

  // SAFE research body extraction: project.research can be an array, a string, or an object
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

  // gallery images: prefer project.gallery, fallback to a few placeholders
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

  // text blocks that can be swapped into the gallery pairs
  const textBlocks = [
    { key: 'challenge', title: 'Challenge', body: project.challenge || project.problem || "Describe the user's problem, constraints, and why solving it mattered." },
    { key: 'research', title: 'Research & Insights', body: researchBody },
    { key: 'solution', title: 'Solution', body: project.solution || "A concise walkthrough of the solution: core features, interaction flow, and key design decisions that solved the challenge." },
    { key: 'impact', title: 'Impact', body: project.impact || project.outcome || "Concrete results and metrics: conversion lift, time saved, retention change, or qualitative outcomes." },
    // leave learnings out of paired content by default (will render after grid if unused)
  ];

  // Build layout: start with DOUBLE IMAGES, then alternate pairs starting with TEXT+IMAGE,
  // i.e. textLeft, then imageLeft, then textLeft... Use pairs until textBlocks exhausted,
  // then finish by appending DOUBLE IMAGES for remaining images.
  // Fix: maintain a single "bigOnLeft" toggle that flips after each block (double or pair)
  // so the "big" (2/3) area alternates left/right across the whole grid.

  const layout = [];
  let gi = 0; // gallery image index
  let ti = 0; // text block index
  let bigOnLeft = true; // controls whether the 2/3 area appears on the left

  // Start with a double images row if possible
  if (gi + 1 < galleryImages.length) {
    layout.push({ type: 'double', imgs: [galleryImages[gi++], galleryImages[gi++]], orientation: bigOnLeft ? 'bigLeft' : 'bigRight' });
    bigOnLeft = !bigOnLeft;
  } else if (gi < galleryImages.length) {
    layout.push({ type: 'single', img: galleryImages[gi++] });
  }

  // Then, while we still have text blocks and images, add alternating pairs (imageLeft or textLeft),
  // where the image is always the 2/3 column and its side follows bigOnLeft.
  while (ti < textBlocks.length && gi < galleryImages.length) {
    const orientation = bigOnLeft ? 'imageLeft' : 'textLeft';
    layout.push({
      type: 'pair',
      img: galleryImages[gi++],
      text: textBlocks[ti++],
      orientation
    });
    bigOnLeft = !bigOnLeft;
  }

  // After text blocks are used up, finish with double image rows for remaining images
  while (gi < galleryImages.length) {
    if (gi + 1 < galleryImages.length) {
      layout.push({ type: 'double', imgs: [galleryImages[gi++], galleryImages[gi++]], orientation: bigOnLeft ? 'bigLeft' : 'bigRight' });
      bigOnLeft = !bigOnLeft;
    } else {
      layout.push({ type: 'single', img: galleryImages[gi++] });
    }
  }

  // any remaining text blocks (not paired) will be rendered after the grid as full-width sections
  const remainingTextBlocks = textBlocks.slice(ti);

  // --- NEW: unified gallery image class (keeps hero untouched) ---
  // mobile: reasonably tall, md+: match hero height scale for visual rhythm
  const galleryImgClass = "w-full h-[20rem] md:h-[36rem] object-cover rounded-[8px]";

  const content = (
    <div
      ref={overlayRef}
      onMouseDown={onOverlayMouseDown}
      className="fixed inset-0 z-50 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label={project.title || "Case study"}
    >
      {/* Inline font loader (kept minimal per request). Everything else is Tailwind. */}
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap"
      />

      {/* Backdrop */}
<div className="fixed top-0 left-0 w-full h-dvh bg-black/80 pointer-events-auto" aria-hidden></div>

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
              {/* first paragraph: left column (1/3) on md, blank to the right to recreate original rhythm */}
              <section className="grid grid-cols-1 md:grid-cols-3 gap-3 pl-3">
                <div className="md:col-span-1">
                  <p className="text-black text-[16px]">
                    {project.summary || "One-paragraph summary that hooks the reader: what this project was about, who it was for, and the primary impact."}
                  </p>
                </div>
                <div className="md:col-span-2" />
              </section>

              {/* PROJECT INFO — restored offset gray boxes (start at column 2, span 2) */}
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

              {/* ------------- NEW: alternating DOUBLE IMAGES and PAIR (image+text) rows ------------- */}
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
                    // respect orientation: 'bigLeft' or 'bigRight'
                    if (block.orientation === 'bigLeft') {
                      return (
                        <div key={idx} className="grid grid-cols-1 md:grid-cols-3 gap-3 items-stretch">
                          {/* First image takes 2/3 on md+, second image takes 1/3 to match the text+image pattern */}
                          <div className="order-1 md:order-1 md:col-span-2">
                            <img src={block.imgs[0]} alt={`${project.title || 'project'} - img ${idx + 1}-a`} loading="lazy" className={galleryImgClass} />
                          </div>
                          <div className="order-2 md:order-2 md:col-span-1">
                            <img src={block.imgs[1]} alt={`${project.title || 'project'} - img ${idx + 1}-b`} loading="lazy" className={galleryImgClass} />
                          </div>
                        </div>
                      );
                    }

                    // bigRight
                    return (
                      <div key={idx} className="grid grid-cols-1 md:grid-cols-3 gap-3 items-stretch">
                        {/* First image takes 1/3 on md+, second image takes 2/3 */}
                        <div className="order-1 md:order-1 md:col-span-1">
                          <img src={block.imgs[0]} alt={`${project.title || 'project'} - img ${idx + 1}-a`} loading="lazy" className={galleryImgClass} />
                        </div>
                        <div className="order-2 md:order-2 md:col-span-2">
                          <img src={block.imgs[1]} alt={`${project.title || 'project'} - img ${idx + 1}-b`} loading="lazy" className={galleryImgClass} />
                        </div>
                      </div>
                    );
                  }

                  // pair: render as 3-column on md+, stacked on small screens
                  // md: text = 1/3 (col-span-1), image = 2/3 (col-span-2)
                  return (
                    <div key={idx} className="grid grid-cols-1 md:grid-cols-3 gap-3 items-stretch">
                      {block.orientation === 'textLeft' ? (
                        <>
                          {/* TEXT left (1/3) */}
                          <div className="order-1 md:order-1 md:col-span-1 flex flex-col justify-center px-3">
                            <h3 className="uppercase text-[12px] text-gray-500">{block.text.title}</h3>
                            <div className="mt-2 whitespace-pre-line">{block.text.body}</div>
                          </div>

                          {/* IMAGE right (2/3) */}
                          <div className="order-2 md:order-2 md:col-span-2">
                            <img src={block.img} alt={`${project.title || 'project'} - paired img ${idx + 1}`} loading="lazy" className={galleryImgClass} />
                          </div>
                        </>
                      ) : (
                        <>
                          {/* IMAGE left (2/3) */}
                          <div className="order-1 md:order-1 md:col-span-2">
                            <img src={block.img} alt={`${project.title || 'project'} - paired img ${idx + 1}`} loading="lazy" className={galleryImgClass} />
                          </div>

                          {/* TEXT right (1/3) */}
                          <div className="order-2 md:order-2 md:col-span-1 flex flex-col justify-center px-3">
                            <h3 className="uppercase text-[12px] text-gray-500">{block.text.title}</h3>
                            <div className="mt-2 text-black whitespace-pre-line">{block.text.body}</div>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}

                {/* Render any remaining text blocks that weren't paired (full-width) */}
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
