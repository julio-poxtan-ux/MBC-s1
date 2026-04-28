/**
 * HubMaktub - main.js
 * JS Vanilla, sin dependencias adicionales.
 */
(() => {
  const HELP_BTN_ID = "hmkHelpFab";
  const HELP_INLINE_ID = "hmkHelpInline";
  const HELP_ICON_OPEN = "bi-headset";
  const HELP_ICON_CLOSE = "bi-x-lg";
  const NAV_STORAGE_KEY = "hmkNavIndex";
  const EXIT_MODAL_ID = "hmkExitModal";
  const SWAP_REFRESH_MS = 30000;

  const swapPriceState = {
    prices: {},
    lastUpdated: null,
  };

  // Marcar item activo en el menú según la ruta
  const setActiveNav = () => {
    const path = (window.location.pathname.split("/").pop() || "index.html").toLowerCase();
    document.querySelectorAll("[data-hmk-nav]").forEach(a => {
      const href = (a.getAttribute("href") || "").toLowerCase();
      a.classList.toggle("is-active", href === path);
      if (href === path) {
        a.setAttribute("aria-current", "page");
      } else {
        a.removeAttribute("aria-current");
      }
    });
  };

  const safeGetNavIndex = () => {
    try {
      const v = window.localStorage.getItem(NAV_STORAGE_KEY);
      return Number.isInteger(Number(v)) ? Number(v) : null;
    } catch (e) {
      return null;
    }
  };

  const safeSetNavIndex = (value) => {
    try {
      window.localStorage.setItem(NAV_STORAGE_KEY, String(value));
    } catch (e) {
      // Sin almacenamiento disponible, ignorar
    }
  };

  const positionNavIndicator = (link, indicator, nav) => {
    if (!link || !indicator || !nav) return;
    const navRect = nav.getBoundingClientRect();
    const linkRect = link.getBoundingClientRect();
    if (!navRect.width || !linkRect.width) return;
    const x = linkRect.left - navRect.left + (linkRect.width / 2) - (indicator.offsetWidth / 2);
    indicator.style.transform = `translateX(${x}px)`;
    indicator.style.opacity = "1";
    return true;
  };

  const initNavIndicator = () => {
    const nav = document.querySelector(".hmk-nav");
    if (!nav) return;

    let indicator = nav.querySelector(".hmk-nav-indicator");
    if (!indicator) {
      indicator = document.createElement("span");
      indicator.className = "hmk-nav-indicator";
      indicator.setAttribute("aria-hidden", "true");
      nav.appendChild(indicator);
    }

    const links = [...nav.querySelectorAll(".hmk-nav-link[data-hmk-nav]")];
    if (links.length === 0) return;
    const active = nav.querySelector(".hmk-nav-link.is-active");
    if (!active) return;

    const activeIndex = links.indexOf(active);
    const prevIndex = safeGetNavIndex();
    const prevLink = Number.isInteger(prevIndex) ? links[prevIndex] : null;

    const applyPosition = (from, to) => {
      const ok = positionNavIndicator(from, indicator, nav);
      if (!ok) return false;
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
          if (positionNavIndicator(to, indicator, nav)) {
            nav.classList.add("hmk-nav--indicator-ready");
          }
        });
      });
      return true;
    };

    if (prevLink && prevLink !== active) {
      applyPosition(prevLink, active);
    } else {
      if (positionNavIndicator(active, indicator, nav)) {
        nav.classList.add("hmk-nav--indicator-ready");
      }
    }

    if (activeIndex >= 0) safeSetNavIndex(activeIndex);

    links.forEach((link, index) => {
      link.addEventListener("click", () => safeSetNavIndex(index));
    });

    const refresh = () => {
      const current = nav.querySelector(".hmk-nav-link.is-active");
      const ok = positionNavIndicator(current, indicator, nav);
      if (ok) {
        nav.classList.add("hmk-nav--indicator-ready");
      }
    };

    window.addEventListener("resize", refresh);
    window.addEventListener("load", refresh);
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => refresh());
    }

    const collapse = document.getElementById("hmkNav");
    if (collapse) {
      collapse.addEventListener("shown.bs.collapse", refresh);
    }
  };

  // Carga el contenido HTML de ayuda.html dentro del panel (sin duplicar <html>)
  const injectHelpContent = async () => {
    const container = document.querySelector("[data-hmk-help-inline]");
    if (!container || container.dataset.loaded === "1") return;

    try {
      const res = await fetch("ayuda.html", { cache: "no-store" });
      if (!res.ok) throw new Error("No se pudo cargar ayuda.html");
      const html = await res.text();

      // Extraer solo el contenido dentro de <main data-hmk-help-main>...</main>
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");
      const main = doc.querySelector("[data-hmk-help-main]");
      if (!main) throw new Error("No se encontró el bloque principal de ayuda.");
      container.innerHTML = main.innerHTML;
      container.dataset.loaded = "1";

      // Enlazar comportamiento del input del chat (demo)
      wireChat();
    } catch (e) {
      container.innerHTML = `
        <div class="p-4">
          <div class="hmk-pill"><i class="bi bi-exclamation-triangle"></i> Error</div>
          <p class="mt-3 mb-0 text-white-50">No fue posible cargar la sección de ayuda. Intenta recargar la página.</p>
        </div>`;
    }
  };

  const swapFabIcon = (isOpen) => {
    const btn = document.getElementById(HELP_BTN_ID);
    if (!btn) return;
    const icon = btn.querySelector("i");
    if (!icon) return;

    icon.classList.remove(isOpen ? HELP_ICON_OPEN : HELP_ICON_CLOSE);
    icon.classList.add(isOpen ? HELP_ICON_CLOSE : HELP_ICON_OPEN);
    btn.setAttribute("aria-label", isOpen ? "Cerrar ayuda" : "Abrir ayuda");
  };

  const wireHelpPanel = () => {
    const btn = document.getElementById(HELP_BTN_ID);
    const panelEl = document.getElementById(HELP_INLINE_ID);
    if (!btn || !panelEl) return;

    btn.addEventListener("click", async () => {
      const isOpen = panelEl.classList.toggle("is-open");
      panelEl.setAttribute("aria-hidden", isOpen ? "false" : "true");
      btn.setAttribute("aria-expanded", isOpen ? "true" : "false");
      btn.classList.toggle("is-open", isOpen);
      swapFabIcon(isOpen);

      if (isOpen) {
        await injectHelpContent();
        panelEl.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  };

  const wireChat = () => {
    // Demo simple: no hay backend. Se mantiene como UI interactiva.
    const forms = [...document.querySelectorAll("[data-hmk-chat-form]")];
    if (forms.length === 0) return;

    forms.forEach((form) => {
      if (form.dataset.wired === "1") return;
      const chat = form.closest(".hmk-chat") || document;
      const input = chat.querySelector("[data-hmk-chat-input]");
      const list = chat.querySelector("[data-hmk-chat-list]");
      if (!input || !list) return;

      const addBubble = (text, who) => {
        const div = document.createElement("div");
        div.className = `hmk-chat-bubble ${who === "user" ? "hmk-chat-bubble--user" : "hmk-chat-bubble--bot"}`;
        div.textContent = text;
        list.appendChild(div);
        list.scrollTop = list.scrollHeight;
      };

      form.addEventListener("submit", (e) => {
        e.preventDefault();
        const v = input.value.trim();
        if (!v) return;
        addBubble(v, "user");
        input.value = "";

        // Respuesta dummy
        window.setTimeout(() => {
          addBubble("Soy un demo UI. Aquí se conectaría tu backend/LLM para responder.", "bot");
        }, 450);
      });

      form.dataset.wired = "1";
    });
  };

  const parseInputNumber = (value) => {
    if (!value) return 0;
    const cleaned = String(value).replace(/,/g, ".").replace(/[^0-9.]/g, "");
    const parsed = Number.parseFloat(cleaned);
    return Number.isFinite(parsed) ? parsed : 0;
  };

  const formatUsd = (value) => {
    if (!Number.isFinite(value)) return "N/D";
    const abs = Math.abs(value);
    const maxDigits = abs >= 100 ? 2 : abs >= 1 ? 4 : 6;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: maxDigits,
    }).format(value);
  };

  const formatRate = (value) => {
    if (!Number.isFinite(value)) return "N/D";
    const abs = Math.abs(value);
    const maxDigits = abs >= 100 ? 2 : abs >= 1 ? 4 : 6;
    return new Intl.NumberFormat("en-US", {
      maximumFractionDigits: maxDigits,
    }).format(value);
  };

  const updateSwapUI = () => {
    const paySelect = document.querySelector('[data-hmk-token-select="pay"]');
    const receiveSelect = document.querySelector('[data-hmk-token-select="receive"]');
    if (!paySelect || !receiveSelect) return;

    const payId = paySelect.dataset.tokenId || "";
    const receiveId = receiveSelect.dataset.tokenId || "";
    const paySymbol = paySelect.dataset.tokenSymbol || "TOKEN";
    const receiveSymbol = receiveSelect.dataset.tokenSymbol || "TOKEN";

    const payPrice = payId ? swapPriceState.prices[payId]?.priceUsd : null;
    const receivePrice = receiveId ? swapPriceState.prices[receiveId]?.priceUsd : null;

    const payInput = document.querySelector('[data-hmk-amount-input="pay"]');
    const receiveInput = document.querySelector('[data-hmk-amount-input="receive"]');
    const payHint = document.getElementById("payHint");
    const receiveHint = document.getElementById("receiveHint");

    if (payHint) {
      const amount = parseInputNumber(payInput?.value || "");
      const total = payPrice ? amount * payPrice : null;
      payHint.textContent = total !== null ? `≈ ${formatUsd(total)} USD` : "≈ N/D USD";
    }

    if (receiveHint) {
      const amount = parseInputNumber(receiveInput?.value || "");
      const total = receivePrice ? amount * receivePrice : null;
      receiveHint.textContent = total !== null ? `≈ ${formatUsd(total)} USD` : "≈ N/D USD";
    }

    const rateEl = document.querySelector("[data-hmk-rate]");
    if (rateEl) {
      if (payPrice && receivePrice) {
        const rate = payPrice / receivePrice;
        rateEl.textContent = `1 ${paySymbol} ≈ ${formatRate(rate)} ${receiveSymbol}`;
      } else {
        rateEl.textContent = "Precio en tiempo real no disponible";
      }
    }

    const updatedEl = document.querySelector("[data-hmk-price-updated]");
    if (updatedEl && swapPriceState.lastUpdated) {
      const time = new Date(swapPriceState.lastUpdated).toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
      });
      updatedEl.textContent = time;
    }
  };

  const wireSwapTokenSelect = () => {
    const selects = [...document.querySelectorAll("[data-hmk-token-select]")];
    if (selects.length === 0) return;

    const esc = (value) => {
      if (window.CSS && typeof window.CSS.escape === "function") {
        return window.CSS.escape(value);
      }
      return String(value).replace(/"/g, '\\"');
    };

    const setExpanded = (select, isOpen) => {
      select.classList.toggle("is-open", isOpen);
      const trigger = select.querySelector(".hmk-token-trigger");
      if (trigger) trigger.setAttribute("aria-expanded", isOpen ? "true" : "false");
    };

    const updateSelection = (select, item) => {
      const items = [...select.querySelectorAll(".hmk-token-item")];
      items.forEach((el) => {
        const selected = el === item;
        el.classList.toggle("is-selected", selected);
        el.setAttribute("aria-selected", selected ? "true" : "false");
      });

      const symbol = item.dataset.tokenSymbol || "TOKEN";
      const name = item.dataset.tokenName || "";
      const icon = item.dataset.tokenIcon || "";
      const letter = item.dataset.tokenLetter || symbol.slice(0, 3);
      const tokenId = item.dataset.tokenId || "";

      select.dataset.tokenSymbol = symbol;
      select.dataset.tokenId = tokenId;

      const trigger = select.querySelector(".hmk-token-trigger");
      if (trigger) {
        const symbolEl = trigger.querySelector(".hmk-token-symbol");
        const nameEl = trigger.querySelector(".hmk-token-name");
        const iconEl = trigger.querySelector(".hmk-asset-icon");

        if (symbolEl) symbolEl.textContent = symbol;
        if (nameEl) nameEl.textContent = name;
        if (iconEl) {
          iconEl.className = icon ? `hmk-asset-icon hmk-asset-icon--${icon}` : "hmk-asset-icon";
          iconEl.textContent = letter;
        }
      }

      const balanceEl = select.closest(".hmk-swap-block")?.querySelector("[data-hmk-token-balance]");
      if (balanceEl && item.dataset.tokenBalance) {
        balanceEl.textContent = item.dataset.tokenBalance;
      }

      const maxBtn = select.closest(".hmk-swap-block")?.querySelector("[data-hmk-max]");
      if (maxBtn && item.dataset.tokenBalanceValue) {
        maxBtn.dataset.hmkMaxValue = item.dataset.tokenBalanceValue;
      }

      updateSwapUI();
    };

    const closeAll = (except = null) => {
      selects.forEach((select) => {
        if (select !== except) setExpanded(select, false);
      });
    };

    selects.forEach((select) => {
      const trigger = select.querySelector(".hmk-token-trigger");
      const search = select.querySelector("[data-hmk-token-search]");
      const items = [...select.querySelectorAll(".hmk-token-item")];
      if (!trigger || items.length === 0) return;

      const initial = select.querySelector(".hmk-token-item.is-selected") || items[0];
      if (initial) updateSelection(select, initial);

      trigger.addEventListener("click", (event) => {
        event.stopPropagation();
        const next = !select.classList.contains("is-open");
        closeAll(select);
        setExpanded(select, next);
        if (next && search) search.focus();
      });

      items.forEach((item) => {
        item.addEventListener("click", (event) => {
          event.preventDefault();
          updateSelection(select, item);
          setExpanded(select, false);
        });
      });

      if (search) {
        search.addEventListener("input", () => {
          const query = search.value.trim().toLowerCase();
          items.forEach((item) => {
            const haystack = `${item.dataset.tokenSymbol || ""} ${item.dataset.tokenName || ""}`.toLowerCase();
            item.hidden = query && !haystack.includes(query);
          });
        });
      }
    });

    document.addEventListener("click", (event) => {
      if (!event.target.closest("[data-hmk-token-select]")) {
        closeAll();
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeAll();
    });

    const maxButtons = [...document.querySelectorAll("[data-hmk-max]")];
    maxButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const target = btn.getAttribute("data-hmk-max-target");
        const input = target ? document.querySelector(`[data-hmk-amount-input="${esc(target)}"]`) : null;
        const value = btn.dataset.hmkMaxValue;
        if (input && value) {
          input.value = value;
          input.dispatchEvent(new Event("input", { bubbles: true }));
        }
      });
    });

    const swapBtn = document.querySelector("[data-hmk-swap-toggle]");
    if (swapBtn) {
      swapBtn.addEventListener("click", () => {
        const paySelect = document.querySelector('[data-hmk-token-select="pay"]');
        const receiveSelect = document.querySelector('[data-hmk-token-select="receive"]');
        if (!paySelect || !receiveSelect) return;

        const payItem = paySelect.querySelector(".hmk-token-item.is-selected");
        const receiveItem = receiveSelect.querySelector(".hmk-token-item.is-selected");
        if (!payItem || !receiveItem) return;

        const paySymbol = payItem.dataset.tokenSymbol || "";
        const receiveSymbol = receiveItem.dataset.tokenSymbol || "";
        if (!paySymbol || !receiveSymbol) return;

        const payTarget = paySelect.querySelector(`.hmk-token-item[data-token-symbol="${esc(receiveSymbol)}"]`);
        const receiveTarget = receiveSelect.querySelector(`.hmk-token-item[data-token-symbol="${esc(paySymbol)}"]`);

        if (payTarget) updateSelection(paySelect, payTarget);
        if (receiveTarget) updateSelection(receiveSelect, receiveTarget);
      });
    }
  };

  const wireLivePrices = () => {
    if (document.querySelectorAll(".hmk-token-item[data-token-id]").length === 0) {
      return;
    }

    const fetchPrices = async () => {
      const ids = new Set();
      document.querySelectorAll(".hmk-token-item[data-token-id]").forEach((item) => {
        const id = (item.getAttribute("data-token-id") || "").trim();
        if (id) ids.add(id);
      });

      if (ids.size === 0) return;
      const url = `https://api.coincap.io/v2/assets?ids=${[...ids].join(",")}`;

      try {
        const res = await fetch(url, { cache: "no-store" });
        if (!res.ok) throw new Error("No se pudo cargar precios.");
        const json = await res.json();
        const data = Array.isArray(json.data) ? json.data : [];

        const next = {};
        data.forEach((asset) => {
          const price = Number(asset.priceUsd);
          if (!Number.isFinite(price)) return;
          next[asset.id] = {
            priceUsd: price,
            changePercent24Hr: Number(asset.changePercent24Hr),
          };
        });

        swapPriceState.prices = next;
        swapPriceState.lastUpdated = Date.now();
        updateSwapUI();
      } catch (e) {
        // Mantener la última data disponible
        updateSwapUI();
      }
    };

    fetchPrices();
    window.setInterval(fetchPrices, SWAP_REFRESH_MS);

    const inputs = [...document.querySelectorAll("[data-hmk-amount-input]")];
    inputs.forEach((input) => input.addEventListener("input", updateSwapUI));
  };

  const wireOrdersTable = () => {
    const body = document.getElementById("hmkOrdersBody");
    const tabs = [...document.querySelectorAll("[data-hmk-tab]")];
    if (!body || tabs.length === 0) return;

    const data = {
      depositos: [
        { id: "#7829", tipo: "Depósito", activo: "USDT", monto: "500", moneda: "USD", fecha: "10 Mar, 14:30", estado: "Completado", badge: "ok", icon: "bi-arrow-down-left", iconClass: "hmk-order-icon--success" },
        { id: "#7826", tipo: "Depósito", activo: "USDT", monto: "1000", moneda: "USD", fecha: "05 Mar, 11:20", estado: "Completado", badge: "ok", icon: "bi-arrow-down-left", iconClass: "hmk-order-icon--success" },
      ],
      retiros: [
        { id: "#7827", tipo: "Retiro", activo: "ETH", monto: "1.5", moneda: "USD", fecha: "08 Mar, 18:45", estado: "Pendiente", badge: "pending", icon: "bi-arrow-up-right", iconClass: "hmk-order-icon--danger" },
      ],
      intercambios: [
        { id: "#7828", tipo: "Intercambio", activo: "BTC", monto: "0.0023", moneda: "", fecha: "09 Mar, 09:15", estado: "Completado", badge: "ok", icon: "bi-arrow-repeat", iconClass: "hmk-order-icon--brand" },
        { id: "#7825", tipo: "Intercambio", activo: "ETH", monto: "12.5", moneda: "", fecha: "01 Mar, 16:10", estado: "Fallido", badge: "fail", icon: "bi-arrow-repeat", iconClass: "hmk-order-icon--brand" },
      ],
    };

    const badgeClass = (b) => ({
      ok: "hmk-badge-status hmk-badge-status--ok",
      pending: "hmk-badge-status hmk-badge-status--pending",
      fail: "hmk-badge-status hmk-badge-status--fail",
    }[b] || "hmk-badge-status");

    const badgeIcon = (b) => ({
      ok: "bi-check",
      pending: "bi-clock",
      fail: "bi-x",
    }[b] || "bi-dot");

    const render = (key) => {
      body.innerHTML = data[key].map(r => {
        const amount = r.moneda
          ? `<span class="hmk-order-value">${r.monto}</span><span class="hmk-order-currency">${r.moneda}</span>`
          : `<span class="hmk-order-value">${r.monto}</span>`;

        return `
          <tr>
            <td class="hmk-order-id">${r.id}</td>
            <td>
              <div class="hmk-order-type">
                <span class="hmk-order-icon ${r.iconClass}">
                  <i class="bi ${r.icon}" aria-hidden="true"></i>
                </span>
                <div>
                  <div class="hmk-order-title">${r.tipo}</div>
                  <div class="hmk-order-sub">${r.activo}</div>
                </div>
              </div>
            </td>
            <td>
              <div class="hmk-order-amount">${amount}</div>
            </td>
            <td class="hmk-order-date">${r.fecha}</td>
            <td class="text-end">
              <span class="${badgeClass(r.badge)}"><i class="bi ${badgeIcon(r.badge)}" aria-hidden="true"></i> ${r.estado}</span>
            </td>
          </tr>
        `;
      }).join("");
    };

    const setSelected = (selected) => {
      tabs.forEach(t => t.setAttribute("aria-selected", t.dataset.hmkTab === selected ? "true" : "false"));
      render(selected);
    };

    tabs.forEach(t => t.addEventListener("click", () => setSelected(t.dataset.hmkTab)));
    setSelected("depositos");
  };

  const wireExternalLinks = () => {
    const modalEl = document.getElementById(EXIT_MODAL_ID);
    if (!modalEl || !window.bootstrap) return;

    const modal = bootstrap.Modal.getOrCreateInstance(modalEl, { backdrop: true });
    const confirmBtn = modalEl.querySelector("[data-hmk-exit-confirm]");
    const destEl = modalEl.querySelector("[data-hmk-exit-dest]");
    let pendingUrl = "";

    document.addEventListener("click", (event) => {
      const link = event.target.closest("[data-hmk-external]");
      if (!link) return;
      const url = link.getAttribute("href");
      if (!url || url === "#") return;
      event.preventDefault();

      pendingUrl = url;
      const name = link.getAttribute("data-hmk-external-name") || link.textContent.trim();
      if (destEl) destEl.textContent = name;
      if (confirmBtn) confirmBtn.setAttribute("data-hmk-exit-url", url);

      modal.show();
    });

    if (confirmBtn) {
      confirmBtn.addEventListener("click", () => {
        const url = confirmBtn.getAttribute("data-hmk-exit-url") || pendingUrl;
        if (!url) return;
        window.open(url, "_blank", "noopener");
        modal.hide();
      });
    }
  };

  document.addEventListener("DOMContentLoaded", () => {
    setActiveNav();
    initNavIndicator();
    wireHelpPanel();
    wireChat();
    wireSwapTokenSelect();
    wireLivePrices();
    wireOrdersTable();
    wireExternalLinks();
  });
})();
