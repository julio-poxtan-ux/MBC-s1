(() => {
  document.body.classList.add("motion-ready");

  const scrollRoot = document.getElementById("main-content");
  const navToggle = document.querySelector("[data-nav-toggle]");
  const mobileMenu = document.getElementById("mobileMenu");
  const desktopDropdown = document.querySelector("[data-nav-dropdown]");
  const desktopDropdownTrigger = document.querySelector("[data-nav-dropdown-trigger]");
  const desktopDropdownMenu = document.querySelector("[data-nav-dropdown-menu]");
  const mobileSubmenuTrigger = document.querySelector("[data-mobile-submenu-toggle]");
  const mobileSubmenu = document.querySelector("[data-mobile-submenu]");
  const navLinks = Array.from(document.querySelectorAll("[data-nav-link]"));
  const sectionNodes = Array.from(document.querySelectorAll("main section[id]"));
  const segmentedButtons = Array.from(document.querySelectorAll("[data-segment]"));
  const revealNodes = Array.from(document.querySelectorAll(".reveal"));
  const sectionVisibility = new Map();
  const ecosystemSection = document.querySelector("[data-ecosystem]");
  const ecosystemTabs = Array.from(
    ecosystemSection?.querySelectorAll("[data-ecosystem-tab]") ?? []
  );
  const ecosystemPreview = ecosystemSection?.querySelector(
    "[data-ecosystem-preview], .ecosystem-preview img"
  );

  const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  const desktopMenuQuery = window.matchMedia("(min-width: 992px)");
  const prefersReducedMotion = reducedMotionQuery.matches;

  const setSegmentState = (scope, activeButton) => {
    scope.querySelectorAll("[data-segment]").forEach((peer) => {
      const isActive = peer === activeButton;
      peer.classList.toggle("is-active", isActive);
      peer.setAttribute("aria-selected", String(isActive));
      if (peer.matches("[role='tab']")) {
        peer.setAttribute("tabindex", isActive ? "0" : "-1");
      }
    });
  };

  const setEcosystemPreview = (button) => {
    if (!ecosystemPreview || !button) return;

    const nextImage = button.dataset.ecosystemImage?.trim();
    const nextAlt = button.dataset.ecosystemAlt?.trim();

    if (nextImage && ecosystemPreview.getAttribute("src") !== nextImage) {
      ecosystemPreview.setAttribute("src", nextImage);
    }

    if (nextAlt) {
      ecosystemPreview.setAttribute("alt", nextAlt);
    }
  };

  const setActiveEcosystemTab = (button, shouldFocus = false) => {
    if (!button) return;

    const scope = button.parentElement;
    if (!scope) return;

    setSegmentState(scope, button);
    setEcosystemPreview(button);

    if (shouldFocus) {
      button.focus();
    }
  };

  const setMenuState = (open) => {
    if (!mobileMenu || !navToggle) return;

    mobileMenu.classList.toggle("is-open", open);
    mobileMenu.setAttribute("aria-hidden", String(!open));
    navToggle.setAttribute("aria-expanded", String(open));
    document.body.classList.toggle("menu-open", open);

    if (!open) {
      setMobileSubmenuState(false);
    }
  };

  const setDesktopDropdownState = (open) => {
    if (!desktopDropdown || !desktopDropdownTrigger || !desktopDropdownMenu) return;

    const shouldOpen = desktopMenuQuery.matches ? open : false;
    desktopDropdown.classList.toggle("is-open", shouldOpen);
    desktopDropdownTrigger.classList.toggle("is-open", shouldOpen);
    desktopDropdownTrigger.setAttribute("aria-expanded", String(shouldOpen));
    desktopDropdownMenu.classList.toggle("is-open", shouldOpen);
    desktopDropdownMenu.setAttribute("aria-hidden", String(!shouldOpen));
  };

  const setMobileSubmenuState = (open) => {
    if (!mobileSubmenu || !mobileSubmenuTrigger) return;

    mobileSubmenu.classList.toggle("is-open", open);
    mobileSubmenu.setAttribute("aria-hidden", String(!open));
    mobileSubmenuTrigger.setAttribute("aria-expanded", String(open));
  };

  if (navToggle && mobileMenu) {
    navToggle.addEventListener("click", () => {
      const isOpen = navToggle.getAttribute("aria-expanded") === "true";
      setMenuState(!isOpen);
    });

    mobileMenu.addEventListener("click", (event) => {
      if (event.target === mobileMenu) {
        setMenuState(false);
      }
    });
  }

  if (desktopDropdownTrigger && desktopDropdownMenu) {
    desktopDropdownTrigger.addEventListener("click", () => {
      const isOpen = desktopDropdownTrigger.getAttribute("aria-expanded") === "true";
      setDesktopDropdownState(!isOpen);
    });

    desktopDropdownTrigger.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        setDesktopDropdownState(false);
      }
    });

    desktopDropdownMenu.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        setDesktopDropdownState(false);
        desktopDropdownTrigger.focus();
      }
    });

    document.addEventListener("click", (event) => {
      if (!desktopMenuQuery.matches || !desktopDropdown) return;
      if (desktopDropdown.contains(event.target)) return;
      setDesktopDropdownState(false);
    });
  }

  if (mobileSubmenuTrigger && mobileSubmenu) {
    mobileSubmenuTrigger.addEventListener("click", () => {
      const isOpen = mobileSubmenuTrigger.getAttribute("aria-expanded") === "true";
      setMobileSubmenuState(!isOpen);
    });
  }

  const setActiveLink = (id) => {
    navLinks.forEach((link) => {
      const linkHash = link.getAttribute("href");
      const shouldBeActive = linkHash === `#${id}`;
      link.classList.toggle("is-active", shouldBeActive);
    });
  };

  const setActiveSection = (id) => {
    sectionNodes.forEach((section) => {
      section.classList.toggle("is-active", section.id === id);
    });
    if (id) setActiveLink(id);
  };

  const navigateToHash = (hash) => {
    if (!hash || !hash.startsWith("#")) return;

    const target = document.querySelector(hash);
    if (!target) return;

    const behavior = prefersReducedMotion ? "auto" : "smooth";
    target.scrollIntoView({ behavior, block: "start" });
    window.history.replaceState(null, "", hash);
  };

  navLinks.forEach((link) => {
    const href = link.getAttribute("href") || "";
    if (!href.startsWith("#")) return;

    link.addEventListener("click", (event) => {
      event.preventDefault();
      navigateToHash(href);
      setMenuState(false);
      setDesktopDropdownState(false);
    });
  });

  if (sectionNodes.length > 0) {
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const { id } = entry.target;
          if (entry.isIntersecting) {
            sectionVisibility.set(id, entry.intersectionRatio);
          } else {
            sectionVisibility.delete(id);
          }
        });

        let nextActiveId = null;
        let highestRatio = 0;
        sectionVisibility.forEach((ratio, id) => {
          if (ratio >= highestRatio) {
            highestRatio = ratio;
            nextActiveId = id;
          }
        });

        if (!nextActiveId && sectionNodes[0]) {
          nextActiveId = sectionNodes[0].id;
        }
        setActiveSection(nextActiveId);
      },
      {
        root: scrollRoot || null,
        threshold: [0.15, 0.35, 0.55, 0.75, 0.95],
        rootMargin: "-6% 0px -18% 0px",
      }
    );

    sectionNodes.forEach((section) => sectionObserver.observe(section));
  }

  if (window.location.hash) {
    setTimeout(() => navigateToHash(window.location.hash), 10);
  } else if (sectionNodes[0]) {
    setActiveSection(sectionNodes[0].id);
  }

  setDesktopDropdownState(false);
  setMobileSubmenuState(false);

  desktopMenuQuery.addEventListener("change", (event) => {
    setDesktopDropdownState(false);

    if (event.matches) {
      setMenuState(false);
      return;
    }

    setMobileSubmenuState(false);
  });

  if (prefersReducedMotion) {
    document.body.classList.remove("motion-ready");
    sectionNodes.forEach((section) => section.classList.add("is-active"));
    revealNodes.forEach((node) => node.classList.add("is-visible"));
  } else if (revealNodes.length > 0) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      {
        root: scrollRoot || null,
        threshold: 0.16,
        rootMargin: "0px 0px -10% 0px",
      }
    );

    revealNodes.forEach((node) => revealObserver.observe(node));
  }

  segmentedButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const scope = button.parentElement;
      if (!scope) return;

      if (button.matches("[data-ecosystem-tab]")) {
        setActiveEcosystemTab(button);
        return;
      }

      setSegmentState(scope, button);
    });
  });

  if (ecosystemTabs.length > 0) {
    ecosystemTabs.forEach((button, index) => {
      button.addEventListener("keydown", (event) => {
        const key = event.key;
        if (!["ArrowRight", "ArrowLeft", "Home", "End"].includes(key)) return;

        event.preventDefault();

        let nextIndex = index;
        if (key === "ArrowRight") {
          nextIndex = (index + 1) % ecosystemTabs.length;
        } else if (key === "ArrowLeft") {
          nextIndex = (index - 1 + ecosystemTabs.length) % ecosystemTabs.length;
        } else if (key === "Home") {
          nextIndex = 0;
        } else if (key === "End") {
          nextIndex = ecosystemTabs.length - 1;
        }

        setActiveEcosystemTab(ecosystemTabs[nextIndex], true);
      });
    });

    const initiallySelectedEcosystemTab =
      ecosystemTabs.find((button) => button.getAttribute("aria-selected") === "true") ??
      ecosystemTabs[0];

    setActiveEcosystemTab(initiallySelectedEcosystemTab);
  }

  const runOverflowCheck = () => {
    const horizontalOverflow = Math.max(
      0,
      document.documentElement.scrollWidth - window.innerWidth
    );
    if (horizontalOverflow > 1) {
      document.body.classList.add("has-overflow-x");
      console.warn(`[layout] Horizontal overflow detected: ${Math.ceil(horizontalOverflow)}px`);
      return;
    }
    document.body.classList.remove("has-overflow-x");
  };

  window.addEventListener("resize", runOverflowCheck, { passive: true });
  window.addEventListener("load", runOverflowCheck, { once: true });
  setTimeout(runOverflowCheck, 250);
})();
