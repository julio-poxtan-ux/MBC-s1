(function initCmBackoffice() {
  initMenuToggle();
  initUserMenu();
  initLogoutModal();
  initCurrentNav();
  initWalletModule();
  initProfilePhotoUpload();
  initCopyButtons();
  initTransactionsModule();
  initForms();
  initCharts();

  function initMenuToggle() {
    const button = document.querySelector("[data-cm-menu-toggle]");
    const menu = document.querySelector("[data-cm-menu]");

    if (!button || !menu) {
      return;
    }

    button.addEventListener("click", () => {
      const isOpen = menu.classList.toggle("cm-is-open");
      button.setAttribute("aria-expanded", String(isOpen));
    });

    document.addEventListener("click", (event) => {
      if (!menu.classList.contains("cm-is-open")) {
        return;
      }

      const target = event.target;
      if (!(target instanceof Node)) {
        return;
      }

      if (!menu.contains(target) && !button.contains(target)) {
        menu.classList.remove("cm-is-open");
        button.setAttribute("aria-expanded", "false");
      }
    });
  }

  function initUserMenu() {
    const menuWrappers = Array.from(document.querySelectorAll("[data-cm-user-menu]"));

    if (!menuWrappers.length) {
      return;
    }

    menuWrappers.forEach((wrapper, index) => {
      const toggle = wrapper.querySelector("[data-cm-user-menu-toggle]");
      const panel = wrapper.querySelector("[data-cm-user-menu-panel]");

      if (!(toggle instanceof HTMLButtonElement) || !(panel instanceof HTMLElement)) {
        return;
      }

      if (!panel.id) {
        panel.id = `cm-user-menu-panel-${index + 1}`;
      }

      toggle.setAttribute("aria-controls", panel.id);

      const closeMenu = () => {
        panel.hidden = true;
        toggle.setAttribute("aria-expanded", "false");
        wrapper.classList.remove("cm-is-open");
      };

      const openMenu = () => {
        panel.hidden = false;
        toggle.setAttribute("aria-expanded", "true");
        wrapper.classList.add("cm-is-open");
      };

      toggle.addEventListener("click", (event) => {
        event.stopPropagation();
        const shouldOpen = panel.hidden;

        menuWrappers.forEach((otherWrapper) => {
          if (otherWrapper === wrapper) {
            return;
          }

          const otherToggle = otherWrapper.querySelector("[data-cm-user-menu-toggle]");
          const otherPanel = otherWrapper.querySelector("[data-cm-user-menu-panel]");

          if (!(otherToggle instanceof HTMLButtonElement) || !(otherPanel instanceof HTMLElement)) {
            return;
          }

          otherPanel.hidden = true;
          otherToggle.setAttribute("aria-expanded", "false");
          otherWrapper.classList.remove("cm-is-open");
        });

        if (shouldOpen) {
          openMenu();
        } else {
          closeMenu();
        }
      });

      wrapper.querySelectorAll("[data-cm-user-menu-close]").forEach((closeTrigger) => {
        closeTrigger.addEventListener("click", (event) => {
          event.preventDefault();
          closeMenu();
        });
      });

      wrapper.querySelectorAll("a[role='menuitem']").forEach((menuLink) => {
        menuLink.addEventListener("click", () => {
          closeMenu();
        });
      });

      document.addEventListener("click", (event) => {
        const target = event.target;
        if (!(target instanceof Node)) {
          return;
        }

        if (!wrapper.contains(target)) {
          closeMenu();
        }
      });

      document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
          closeMenu();
        }
      });
    });
  }

  function initLogoutModal() {
    const logoutTriggers = Array.from(document.querySelectorAll("[data-cm-user-menu-close]"));

    if (!logoutTriggers.length) {
      return;
    }

    const modal = ensureLogoutModal();
    const closeButton = modal.querySelector("[data-cm-logout-close]");
    const cancelButton = modal.querySelector("[data-cm-logout-cancel]");
    const confirmButton = modal.querySelector("[data-cm-logout-confirm]");
    const fallbackRedirect = "../../MBClub/LoginMB/login.html";
    let redirectTarget = fallbackRedirect;
    let lastActiveElement = null;

    const closeModal = () => {
      modal.hidden = true;
      document.body.classList.remove("cm-modal-open");

      if (lastActiveElement instanceof HTMLElement) {
        lastActiveElement.focus();
      }
    };

    const openModal = (trigger) => {
      redirectTarget = trigger.getAttribute("data-cm-logout-redirect") || fallbackRedirect;
      lastActiveElement = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      modal.hidden = false;
      document.body.classList.add("cm-modal-open");
      window.requestAnimationFrame(() => {
        if (cancelButton instanceof HTMLButtonElement) {
          cancelButton.focus();
        }
      });
    };

    logoutTriggers.forEach((trigger) => {
      trigger.addEventListener("click", (event) => {
        event.preventDefault();
        openModal(trigger);
      });
    });

    closeButton?.addEventListener("click", closeModal);
    cancelButton?.addEventListener("click", closeModal);
    confirmButton?.addEventListener("click", () => {
      closeModal();
      window.location.href = redirectTarget;
    });

    modal.addEventListener("click", (event) => {
      if (event.target === modal) {
        closeModal();
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !modal.hidden) {
        closeModal();
      }
    });
  }

  function ensureLogoutModal() {
    const existingModal = document.querySelector("[data-cm-modal='logout']");
    if (existingModal instanceof HTMLElement) {
      return existingModal;
    }

    const modal = document.createElement("div");
    modal.className = "cm-modal-backdrop";
    modal.setAttribute("data-cm-modal", "logout");
    modal.hidden = true;
    modal.innerHTML = `
      <div class="cm-modal" role="dialog" aria-modal="true" aria-labelledby="cm-logout-title" aria-describedby="cm-logout-desc">
        <header class="cm-modal__head">
          <h2 id="cm-logout-title" class="cm-modal__title">Cerrar sesión</h2>
          <button class="cm-modal__close" type="button" aria-label="Cerrar modal" data-cm-logout-close>
            <i class="bi bi-x-lg" aria-hidden="true"></i>
          </button>
        </header>
        <p id="cm-logout-desc" class="cm-modal__desc">¿Seguro que deseas cerrar tu sesión? Se cerrará tu acceso actual al backoffice.</p>
        <div class="cm-modal__actions">
          <button class="cm-button cm-button--secondary" type="button" data-cm-logout-cancel>Cancelar</button>
          <button class="cm-button cm-button--primary" type="button" data-cm-logout-confirm>Cerrar sesión</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    return modal;
  }

  function initProfilePhotoUpload() {
    const inputs = Array.from(document.querySelectorAll("[data-cm-profile-photo-input]"));
    if (!inputs.length) {
      return;
    }

    const avatar = document.querySelector("[data-cm-profile-avatar]");
    const initials = avatar?.querySelector("[data-cm-profile-initials]");
    let objectUrl = "";

    inputs.forEach((input) => {
      if (!(input instanceof HTMLInputElement)) {
        return;
      }

      input.addEventListener("change", () => {
        const file = input.files?.[0];

        if (!(file instanceof File)) {
          return;
        }

        if (!file.type.startsWith("image/")) {
          return;
        }

        if (objectUrl) {
          URL.revokeObjectURL(objectUrl);
        }
        objectUrl = URL.createObjectURL(file);

        if (avatar instanceof HTMLElement) {
          avatar.classList.add("cm-profile-avatar--image");
          avatar.style.backgroundImage = `url("${objectUrl}")`;
        }

        if (initials instanceof HTMLElement) {
          initials.hidden = true;
        }
      });
    });
  }

  function initCurrentNav() {
    const links = document.querySelectorAll("[data-cm-nav]");
    if (!links.length) {
      return;
    }

    const currentPath = normalizePath(window.location.pathname);

    links.forEach((link) => {
      const href = normalizePath(link.getAttribute("href") || "");
      const isCurrent = href === currentPath;

      link.classList.toggle("cm-nav-link--active", isCurrent);
      if (isCurrent) {
        link.setAttribute("aria-current", "page");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  }

  function normalizePath(pathValue) {
    const normalized = pathValue.split("/").pop() || "index.html";
    return normalized === "" ? "index.html" : normalized;
  }

  function initWalletModule() {
    const walletModules = document.querySelectorAll("[data-cm-wallet-module]");

    walletModules.forEach((module) => {
      const actions = Array.from(module.querySelectorAll("[data-cm-wallet-action]"));
      const panels = Array.from(module.querySelectorAll("[data-cm-wallet-panel]"));
      const depositAction = actions.find((action) => action.getAttribute("data-cm-wallet-target") === "deposito");
      const depositLabel = depositAction?.querySelector(".cm-wallet-action__label");

      if (!actions.length || !panels.length) {
        return;
      }

      const currentAction = actions.find((action) => action.classList.contains("cm-is-active"));
      const initialTarget = currentAction?.getAttribute("data-cm-wallet-target") || actions[0].getAttribute("data-cm-wallet-target");

      setActiveWalletView(initialTarget || "");

      actions.forEach((action) => {
        action.addEventListener("click", () => {
          const target = action.getAttribute("data-cm-wallet-target") || "";
          setActiveWalletView(target);
        });

        action.addEventListener("keydown", (event) => {
          if (event.key !== "Enter" && event.key !== " ") {
            return;
          }
          event.preventDefault();
          const target = action.getAttribute("data-cm-wallet-target") || "";
          setActiveWalletView(target);
        });
      });

      function setActiveWalletView(target) {
        actions.forEach((action) => {
          const isActive = action.getAttribute("data-cm-wallet-target") === target;
          action.classList.toggle("cm-is-active", isActive);
          action.setAttribute("aria-selected", String(isActive));
          action.tabIndex = isActive ? 0 : -1;
        });

        panels.forEach((panel) => {
          const isActive = panel.getAttribute("data-cm-wallet-panel") === target;
          panel.classList.toggle("cm-is-active", isActive);
          panel.hidden = !isActive;
        });

        if (depositLabel instanceof HTMLElement) {
          depositLabel.textContent = target === "deposito" ? "Depositar a cartera" : "Depositar";
        }
      }
    });
  }

  function initCopyButtons() {
    const copyButtons = document.querySelectorAll("[data-cm-copy-button]");

    copyButtons.forEach((button) => {
      button.addEventListener("click", async () => {
        const targetId = button.getAttribute("data-cm-copy-target");
        const fallbackValue = button.getAttribute("data-cm-copy-value") || "";
        const field = targetId ? document.getElementById(targetId) : null;
        const value = field && "value" in field ? field.value : fallbackValue;

        if (!value) {
          return;
        }

        const feedbackId = button.getAttribute("data-cm-feedback");
        const feedback = feedbackId ? document.getElementById(feedbackId) : null;
        const copyText = button.getAttribute("data-cm-text-copy") || "Copiar Enlace";
        const copiedText = button.getAttribute("data-cm-text-copied") || "Enlace Copiado";

        const copied = await copyTextToClipboard(value);

        if (copied) {
          button.querySelector("[data-cm-copy-label]")?.replaceChildren(copiedText);
          if (feedback) {
            feedback.textContent = "Enlace copiado al portapapeles.";
          }

          window.setTimeout(() => {
            button.querySelector("[data-cm-copy-label]")?.replaceChildren(copyText);
            if (feedback) {
              feedback.textContent = "";
            }
          }, 1800);
        } else if (feedback) {
          feedback.textContent = "No se pudo copiar. Copia manualmente el enlace.";
        }
      });
    });
  }

  async function copyTextToClipboard(value) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(value);
        return true;
      } catch (error) {
        return false;
      }
    }

    // Fallback para navegadores sin Clipboard API.
    const tempInput = document.createElement("textarea");
    tempInput.value = value;
    tempInput.setAttribute("readonly", "readonly");
    tempInput.style.position = "absolute";
    tempInput.style.left = "-9999px";
    document.body.appendChild(tempInput);
    tempInput.select();

    const copied = document.execCommand("copy");
    document.body.removeChild(tempInput);

    return copied;
  }

  function initTransactionsModule() {
    const module = document.querySelector(".cm-transactions-shell");

    if (!module) {
      return;
    }

    const controlsForm = module.querySelector("[data-cm-tx-controls]");
    const searchInput = module.querySelector("[data-cm-tx-search]");
    const fromInput = module.querySelector("[data-cm-tx-from]");
    const toInput = module.querySelector("[data-cm-tx-to]");
    const rows = Array.from(module.querySelectorAll("[data-cm-tx-row]"));
    const resultsLabel = module.querySelector("[data-cm-tx-results]");
    const typeFilter = module.querySelector("[data-cm-tx-type-filter]");
    const typeToggle = module.querySelector("[data-cm-tx-type-toggle]");
    const typeMenu = module.querySelector("[data-cm-tx-type-menu]");
    const typeLabel = module.querySelector("[data-cm-tx-type-label]");
    const exportButton = module.querySelector("[data-cm-tx-export]");

    if (!rows.length) {
      return;
    }

    let selectedType = "all";

    if (controlsForm instanceof HTMLFormElement) {
      controlsForm.addEventListener("submit", (event) => {
        event.preventDefault();
      });
    }

    initDatePicker(fromInput);
    initDatePicker(toInput);

    const types = Array.from(
      new Set(
        rows
          .map((row) => (row.dataset.cmTxType || "").trim())
          .filter((type) => type.length > 0)
      )
    );

    renderTypeOptions(types);
    markActiveTypeOption();
    applyFilters();

    searchInput?.addEventListener("input", applyFilters);
    fromInput?.addEventListener("change", applyFilters);
    toInput?.addEventListener("change", applyFilters);

    typeToggle?.addEventListener("click", () => {
      if (!typeMenu) {
        return;
      }
      setTypeMenuState(typeMenu.hidden);
    });

    typeMenu?.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) {
        return;
      }

      const option = target.closest("[data-cm-tx-type-value]");
      if (!(option instanceof HTMLButtonElement)) {
        return;
      }

      selectedType = option.getAttribute("data-cm-tx-type-value") || "all";

      if (typeLabel) {
        typeLabel.textContent = option.getAttribute("data-cm-tx-type-label") || "Filtrar por Tipo";
      }

      setTypeMenuState(false);
      markActiveTypeOption();
      applyFilters();
    });

    exportButton?.addEventListener("click", () => {
      exportVisibleRowsToCsv();
    });

    document.addEventListener("click", (event) => {
      if (!typeFilter || !typeMenu || !typeToggle) {
        return;
      }

      const target = event.target;
      if (!(target instanceof Node)) {
        return;
      }

      if (typeMenu.hidden) {
        return;
      }

      if (!typeFilter.contains(target) && !typeToggle.contains(target)) {
        setTypeMenuState(false);
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key !== "Escape") {
        return;
      }
      setTypeMenuState(false);
    });

    function initDatePicker(input) {
      if (!(input instanceof HTMLInputElement)) {
        return;
      }

      if (typeof window.flatpickr !== "function") {
        return;
      }

      const options = {
        dateFormat: "d/m/Y",
        allowInput: false,
        disableMobile: true,
        onChange: () => applyFilters()
      };

      if (window.flatpickr.l10ns && window.flatpickr.l10ns.es) {
        options.locale = window.flatpickr.l10ns.es;
      }

      window.flatpickr(input, options);
    }

    function renderTypeOptions(typeItems) {
      if (!typeMenu) {
        return;
      }

      typeMenu.innerHTML = "";

      const allOption = createTypeOption("all", "Todos los tipos");
      typeMenu.appendChild(allOption);

      typeItems.forEach((typeValue) => {
        const normalizedValue = normalizeText(typeValue);
        const option = createTypeOption(normalizedValue, typeValue);
        typeMenu.appendChild(option);
      });
    }

    function createTypeOption(value, label) {
      const option = document.createElement("button");
      option.type = "button";
      option.className = "cm-transactions-type-option";
      option.dataset.cmTxTypeValue = value;
      option.dataset.cmTxTypeLabel = label;
      option.setAttribute("role", "option");
      option.textContent = label;
      return option;
    }

    function setTypeMenuState(isOpen) {
      if (!typeMenu || !typeToggle || !typeFilter) {
        return;
      }

      typeMenu.hidden = !isOpen;
      typeToggle.setAttribute("aria-expanded", String(isOpen));
      typeFilter.classList.toggle("cm-is-open", isOpen);
    }

    function markActiveTypeOption() {
      if (!typeMenu) {
        return;
      }

      const options = typeMenu.querySelectorAll("[data-cm-tx-type-value]");
      options.forEach((option) => {
        const isActive = option.getAttribute("data-cm-tx-type-value") === selectedType;
        option.classList.toggle("cm-is-active", isActive);
        option.setAttribute("aria-selected", String(isActive));
      });
    }

    function applyFilters() {
      const searchValue = normalizeText(searchInput instanceof HTMLInputElement ? searchInput.value : "");
      let startDate = parseFilterDate(fromInput instanceof HTMLInputElement ? fromInput.value : "");
      let endDate = parseFilterDate(toInput instanceof HTMLInputElement ? toInput.value : "");
      const totalRows = rows.length;
      let visibleRows = 0;

      if (startDate && endDate && startDate > endDate) {
        const tempDate = startDate;
        startDate = endDate;
        endDate = tempDate;
      }

      rows.forEach((row) => {
        const rowType = normalizeText(row.dataset.cmTxType || "");
        const rowDate = parseIsoDate(row.dataset.cmTxDate || "");
        const rowText = normalizeText(row.textContent || "");

        const matchesType = selectedType === "all" || rowType === selectedType;
        const matchesSearch = !searchValue || rowText.includes(searchValue);
        const matchesStartDate = !startDate || (rowDate !== null && rowDate >= startDate);
        const matchesEndDate = !endDate || (rowDate !== null && rowDate <= endDate);

        const isVisible = matchesType && matchesSearch && matchesStartDate && matchesEndDate;
        row.hidden = !isVisible;

        if (isVisible) {
          visibleRows += 1;
        }
      });

      if (resultsLabel) {
        resultsLabel.textContent = `Mostrando ${visibleRows} de ${totalRows} resultados`;
      }

      if (exportButton instanceof HTMLButtonElement) {
        exportButton.disabled = visibleRows === 0;
      }
    }

    function parseIsoDate(value) {
      const normalized = value.trim();
      if (!normalized) {
        return null;
      }

      const parts = normalized.split("-").map(Number);
      if (parts.length !== 3 || parts.some((part) => Number.isNaN(part))) {
        return null;
      }

      const date = new Date(parts[0], parts[1] - 1, parts[2]);
      return Number.isNaN(date.getTime()) ? null : date;
    }

    function parseFilterDate(value) {
      const normalized = value.trim();
      if (!normalized) {
        return null;
      }

      const slashParts = normalized.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
      if (slashParts) {
        const date = new Date(Number(slashParts[3]), Number(slashParts[2]) - 1, Number(slashParts[1]));
        return Number.isNaN(date.getTime()) ? null : date;
      }

      const isoParts = normalized.match(/^(\d{4})-(\d{2})-(\d{2})$/);
      if (isoParts) {
        const date = new Date(Number(isoParts[1]), Number(isoParts[2]) - 1, Number(isoParts[3]));
        return Number.isNaN(date.getTime()) ? null : date;
      }

      return null;
    }

    function normalizeText(value) {
      return value
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
    }

    function exportVisibleRowsToCsv() {
      const visibleRows = rows.filter((row) => !row.hidden);

      if (!visibleRows.length) {
        return;
      }

      const headers = ["Concepto", "Usuario", "Fecha", "Monto", "Estado"];
      const csvLines = [headers.map(escapeCsvValue).join(",")];

      visibleRows.forEach((row) => {
        const cells = row.querySelectorAll("td");
        const concept = cells[1]?.textContent?.trim() || "";
        const user = cells[2]?.textContent?.trim() || "";
        const date = cells[3]?.textContent?.trim() || "";
        const amount = cells[4]?.textContent?.trim() || "";
        const state = cells[5]?.textContent?.trim() || "";

        csvLines.push([concept, user, date, amount, state].map(escapeCsvValue).join(","));
      });

      const csvContent = `\ufeff${csvLines.join("\n")}`;
      const file = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(file);
      const link = document.createElement("a");

      link.href = url;
      link.download = `transacciones-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }

    function escapeCsvValue(value) {
      const sanitized = String(value).replace(/"/g, "\"\"");
      return `"${sanitized}"`;
    }
  }

  function initForms() {
    const forms = document.querySelectorAll(".cm-validate-form");

    forms.forEach((form) => {
      const fields = form.querySelectorAll("input, select, textarea");
      const message = form.querySelector("[data-cm-form-message]");
      const invalidText = form.getAttribute("data-cm-invalid-message") || "Verifica los campos requeridos antes de continuar.";
      const successText = form.getAttribute("data-cm-success-message") || "Formulario validado correctamente (demo sin backend).";

      fields.forEach((field) => {
        const eventName =
          field instanceof HTMLSelectElement ||
          (field instanceof HTMLInputElement && (field.type === "checkbox" || field.type === "radio" || field.type === "file"))
            ? "change"
            : "input";

        field.addEventListener(eventName, () => {
          validateField(field);
          revalidateRelatedFields(form, field);
        });
      });

      form.addEventListener("submit", (event) => {
        event.preventDefault();

        let isValid = true;
        fields.forEach((field) => {
          if (!validateField(field)) {
            isValid = false;
          }
        });

        if (!isValid) {
          if (message) {
            message.classList.remove("cm-is-success");
            message.textContent = invalidText;
          }
          return;
        }

        if (message) {
          message.classList.add("cm-is-success");
          message.textContent = successText;
        }

        if (!form.hasAttribute("data-cm-no-reset")) {
          form.reset();
          clearFieldStates(fields);
        }
      });
    });

    function revalidateRelatedFields(formElement, changedField) {
      const fieldId = changedField.getAttribute("id");
      if (!fieldId) {
        return;
      }

      const relatedFields = formElement.querySelectorAll(`[data-cm-match="${fieldId}"]`);
      relatedFields.forEach((field) => validateField(field));
    }

    function clearFieldStates(fieldsList) {
      fieldsList.forEach((field) => {
        if (!(field instanceof HTMLInputElement || field instanceof HTMLSelectElement || field instanceof HTMLTextAreaElement)) {
          return;
        }

        field.classList.remove("cm-is-invalid");
        field.setAttribute("aria-invalid", "false");

        const errorId = field.getAttribute("data-cm-error");
        const errorElement = errorId ? document.getElementById(errorId) : null;
        if (errorElement) {
          errorElement.textContent = "";
        }
      });
    }
  }

  function validateField(field) {
    if (!(field instanceof HTMLInputElement || field instanceof HTMLSelectElement || field instanceof HTMLTextAreaElement)) {
      return true;
    }

    const errorId = field.getAttribute("data-cm-error");
    const errorElement = errorId ? document.getElementById(errorId) : null;

    let isValid = true;
    let message = "";
    const inputValue = field.value;
    const textValue = field instanceof HTMLInputElement && field.type === "password" ? inputValue : inputValue.trim();

    if (field.hasAttribute("required")) {
      if (field instanceof HTMLInputElement && field.type === "checkbox") {
        isValid = field.checked;
      } else if (field instanceof HTMLInputElement && field.type === "file") {
        isValid = Boolean(field.files && field.files.length > 0);
      } else {
        isValid = textValue.length > 0;
      }

      if (!isValid) {
        message = field.getAttribute("data-cm-error-message") || "Este campo es obligatorio.";
      }
    }

    if (isValid && field instanceof HTMLInputElement && field.type === "email" && field.value) {
      const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value);
      if (!isEmailValid) {
        isValid = false;
        message = "Ingresa un correo válido.";
      }
    }

    if (isValid && field instanceof HTMLInputElement && field.type === "file") {
      const file = field.files?.[0];
      if (file) {
        const allowedFileTypes = (field.getAttribute("data-cm-file-types") || "")
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean);
        const maxFileSize = Number(field.getAttribute("data-cm-file-max-size") || 0);

        if (allowedFileTypes.length && !allowedFileTypes.includes(file.type)) {
          isValid = false;
          message = field.getAttribute("data-cm-file-type-message") || "El formato del archivo no es válido.";
        } else if (maxFileSize > 0 && file.size > maxFileSize) {
          isValid = false;
          message = field.getAttribute("data-cm-file-size-message") || "El archivo excede el tamaño permitido.";
        }
      }
    }

    if (isValid && textValue.length > 0 && field.hasAttribute("pattern")) {
      const patternValue = field.getAttribute("pattern") || "";
      try {
        const regex = new RegExp(patternValue);
        if (!regex.test(textValue)) {
          isValid = false;
          message = field.getAttribute("data-cm-pattern-message") || "El formato ingresado no es válido.";
        }
      } catch (error) {
        isValid = false;
        message = "No se pudo validar este campo.";
      }
    }

    if (
      isValid &&
      field instanceof HTMLInputElement &&
      field.type !== "file" &&
      field.minLength > 0 &&
      textValue.length > 0 &&
      textValue.length < field.minLength
    ) {
      isValid = false;
      message = field.getAttribute("data-cm-minlength-message") || `Debe contener al menos ${field.minLength} caracteres.`;
    }

    if (isValid && field.dataset.cmMatch) {
      const targetField = document.getElementById(field.dataset.cmMatch);
      const targetValue =
        targetField instanceof HTMLInputElement || targetField instanceof HTMLTextAreaElement || targetField instanceof HTMLSelectElement
          ? targetField.value
          : "";

      if (inputValue !== targetValue) {
        isValid = false;
        message = field.getAttribute("data-cm-match-message") || "Los campos no coinciden.";
      }
    }

    field.classList.toggle("cm-is-invalid", !isValid);
    field.setAttribute("aria-invalid", String(!isValid));

    if (errorElement) {
      errorElement.textContent = message;
    }

    return isValid;
  }

  function initCharts() {
    if (typeof window.Chart === "undefined") {
      return;
    }

    const chartElements = document.querySelectorAll("[data-cm-chart]");
    if (!chartElements.length) {
      return;
    }

    const colors = {
      text: readVar("--cm-color-text", "#17324e"),
      label: readVar("--cm-chart-label", "#64748b"),
      grid: readVar("--cm-chart-gridline", "rgba(20, 71, 230, 0.14)"),
      barPrimary: readVar("--cm-chart-bar-primary", "#2b7fff"),
      barSecondary: readVar("--cm-chart-bar-secondary", "rgba(43, 127, 255, 0.76)"),
      barDark: readVar("--cm-chart-bar-dark", "#17324e"),
      line: readVar("--cm-chart-line", "#00b8db")
    };

    window.Chart.defaults.font.family = readVar("--cm-font-family-base", "Satoshi, Inter, sans-serif");
    window.Chart.defaults.color = colors.label;
    window.Chart.defaults.plugins.legend.display = false;

    chartElements.forEach((canvas) => {
      if (!(canvas instanceof HTMLCanvasElement)) {
        return;
      }

      const chartType = canvas.dataset.cmChart || "";
      const config = buildConfigByType(chartType, colors);
      if (!config) {
        return;
      }

      new window.Chart(canvas, config);
    });
  }

  function readVar(variableName, fallback) {
    const value = getComputedStyle(document.documentElement).getPropertyValue(variableName).trim();
    return value || fallback;
  }

  function buildConfigByType(type, colors) {
    const commonOptions = {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: "index",
        intersect: false
      },
      plugins: {
        tooltip: {
          backgroundColor: "rgba(23, 50, 78, 0.95)",
          titleColor: "#ffffff",
          bodyColor: "#ffffff",
          padding: 10
        }
      }
    };

    if (type === "members") {
      return {
        type: "bar",
        data: {
          labels: ["NIVEL 1: 10 Miembros", "NIVEL 2: 5 Miembros", "NIVEL 3: 15 Miembros"],
          datasets: [
            {
              data: [10, 16, 4],
              borderRadius: 8,
              maxBarThickness: 42,
              backgroundColor: [colors.barPrimary, colors.barSecondary, colors.barPrimary]
            }
          ]
        },
        options: {
          ...commonOptions,
          scales: {
            x: {
              grid: { display: false },
              ticks: { color: colors.label, font: { size: 11 }, maxRotation: 0, minRotation: 0 }
            },
            y: {
              beginAtZero: true,
              ticks: { display: false },
              grid: { color: colors.grid }
            }
          }
        }
      };
    }

    if (type === "volume") {
      return {
        type: "bar",
        data: {
          labels: ["NIVEL 1: $25,000", "NIVEL 2: $50,000", "NIVEL 3: $75,000"],
          datasets: [
            {
              data: [25000, 50000, 18000],
              borderRadius: 8,
              maxBarThickness: 42,
              backgroundColor: [colors.barDark, colors.barDark, colors.barDark]
            }
          ]
        },
        options: {
          ...commonOptions,
          scales: {
            x: {
              grid: { display: false },
              ticks: { color: colors.label, font: { size: 11 }, maxRotation: 0, minRotation: 0 }
            },
            y: {
              beginAtZero: true,
              ticks: { display: false },
              grid: { color: colors.grid }
            }
          }
        }
      };
    }

    if (type === "status") {
      return {
        type: "line",
        data: {
          labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
          datasets: [
            {
              data: [0, 0, 0, 0, 0, 0],
              borderColor: colors.line,
              borderWidth: 2,
              fill: false,
              pointRadius: 0,
              tension: 0.2
            }
          ]
        },
        options: {
          ...commonOptions,
          scales: {
            x: {
              grid: { display: false },
              ticks: { color: colors.label }
            },
            y: {
              beginAtZero: true,
              max: 1,
              ticks: { color: colors.label, stepSize: 0.2 },
              grid: { color: colors.grid }
            }
          }
        }
      };
    }

    if (type === "wallet") {
      return {
        type: "line",
        data: {
          labels: ["Ene", "Feb", "Mar", "Abr", "May", "Jun"],
          datasets: [
            {
              data: [420, 780, 610, 950, 870, 1120],
              borderColor: colors.barPrimary,
              backgroundColor: "rgba(43, 127, 255, 0.16)",
              fill: true,
              pointRadius: 3,
              pointHoverRadius: 5,
              tension: 0.28
            }
          ]
        },
        options: {
          ...commonOptions,
          scales: {
            x: {
              grid: { display: false },
              ticks: { color: colors.label }
            },
            y: {
              beginAtZero: true,
              grid: { color: colors.grid },
              ticks: { color: colors.label }
            }
          }
        }
      };
    }

    if (type === "referral") {
      return {
        type: "line",
        data: {
          labels: ["", "Feb", "Mar", "Apr", "May", "Jun"],
          datasets: [
            {
              data: [4, 6, 8, 13, 18, 28],
              borderColor: colors.barPrimary,
              borderWidth: 3,
              backgroundColor: "rgba(43, 127, 255, 0.18)",
              fill: true,
              pointRadius: 0,
              tension: 0.34
            }
          ]
        },
        options: {
          ...commonOptions,
          scales: {
            x: {
              grid: { display: false },
              ticks: { color: colors.label }
            },
            y: {
              beginAtZero: true,
              ticks: { display: false },
              grid: { display: false },
              border: { display: false }
            }
          }
        }
      };
    }

    return null;
  }
})();
