document.addEventListener("DOMContentLoaded", () => {
  initTermsGate();
  initCreateAccountForm();
  initPasswordVisibilityToggles();
  initPinInputs();
  initCheckTokenForm();
  initMemberCheckoutForm();
});

function initTermsGate() {
  const form = document.querySelector("[data-mk-welcome-form]");
  if (!form) return;

  const terms = document.getElementById("mk-terms");
  const button = document.getElementById("mk-continue-btn");
  const inlineError = document.getElementById("mk-terms-error");
  const feedback = document.getElementById("mk-submit-feedback");
  let hasSubmitted = false;

  if (!(terms instanceof HTMLInputElement) || !(button instanceof HTMLButtonElement)) return;

  const setButtonState = () => {
    const isValid = terms.checked;
    button.disabled = !isValid;
    button.setAttribute("aria-disabled", String(!isValid));
    terms.setAttribute("aria-invalid", String(hasSubmitted && !isValid));

    if (isValid) {
      inlineError?.classList.add("visually-hidden");
    }
  };

  terms.addEventListener("change", setButtonState);

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    hasSubmitted = true;

    if (!terms.checked) {
      terms.setAttribute("aria-invalid", "true");
      inlineError?.classList.remove("visually-hidden");
      feedback?.classList.add("visually-hidden");
      terms.focus();
      return;
    }

    terms.setAttribute("aria-invalid", "false");
    inlineError?.classList.add("visually-hidden");
    feedback?.classList.remove("visually-hidden");
  });

  setButtonState();
}

function initPasswordVisibilityToggles() {
  const toggles = document.querySelectorAll("[data-mk-toggle-password]");

  toggles.forEach((toggle) => {
    if (!(toggle instanceof HTMLButtonElement)) return;

    const inputId = toggle.getAttribute("aria-controls");
    if (!inputId) return;

    const input = document.getElementById(inputId);
    if (!(input instanceof HTMLInputElement)) return;

    toggle.addEventListener("click", () => {
      const shouldShow = input.type === "password";
      input.type = shouldShow ? "text" : "password";
      toggle.setAttribute("aria-pressed", String(shouldShow));
      toggle.setAttribute("aria-label", shouldShow ? "Ocultar contraseña" : "Mostrar contraseña");

      const icon = toggle.querySelector("i");
      if (icon) {
        icon.classList.toggle("bi-eye", !shouldShow);
        icon.classList.toggle("bi-eye-slash", shouldShow);
      }
    });
  });
}

function initCreateAccountForm() {
  const form = document.querySelector("[data-mk-register-form]");
  if (!(form instanceof HTMLFormElement)) return;

  const firstName = document.getElementById("mk-first-name");
  const lastName = document.getElementById("mk-last-name");
  const email = document.getElementById("mk-email");
  const password = document.getElementById("mk-password");
  const confirmPassword = document.getElementById("mk-confirm-password");
  const terms = document.getElementById("mk-register-terms");
  const submit = document.getElementById("mk-register-submit");
  const success = document.getElementById("mk-register-success");

  if (
    !(firstName instanceof HTMLInputElement) ||
    !(lastName instanceof HTMLInputElement) ||
    !(email instanceof HTMLInputElement) ||
    !(password instanceof HTMLInputElement) ||
    !(confirmPassword instanceof HTMLInputElement) ||
    !(terms instanceof HTMLInputElement) ||
    !(submit instanceof HTMLButtonElement)
  ) {
    return;
  }

  const firstNameError = document.getElementById("mk-first-name-error");
  const lastNameError = document.getElementById("mk-last-name-error");
  const emailError = document.getElementById("mk-email-error");
  const passwordError = document.getElementById("mk-password-error");
  const confirmPasswordError = document.getElementById("mk-confirm-password-error");
  const termsError = document.getElementById("mk-register-terms-error");

  const strengthWrap = document.getElementById("mk-password-strength");
  const strengthLevel = document.getElementById("mk-strength-level");
  const strengthBar = document.getElementById("mk-strength-bar");

  const nameRegex = /^[A-Za-zÀ-ÖØ-öø-ÿÑñ' -]+$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  let hasSubmitted = false;

  const getPasswordChecks = (value) => ({
    minLength: value.length >= 8,
    upper: /[A-Z]/.test(value),
    lower: /[a-z]/.test(value),
    number: /[0-9]/.test(value),
    symbol: /[^A-Za-z0-9]/.test(value),
  });

  const getPasswordStrength = (value) => {
    const checks = getPasswordChecks(value);
    const score = Object.values(checks).filter(Boolean).length;

    if (score <= 2) {
      return { label: "BAJA", textClass: "mk-strength-low", barClass: "mk-strength-bar--low" };
    }

    if (score <= 4) {
      return { label: "MEDIA", textClass: "mk-strength-medium", barClass: "mk-strength-bar--medium" };
    }

    return { label: "ALTA", textClass: "mk-strength-high", barClass: "mk-strength-bar--high" };
  };

  const setFieldVisualState = (input, hasError, showError) => {
    input.setAttribute("aria-invalid", String(showError && hasError));
    const control = input.closest(".mk-input-control");
    if (control) {
      control.classList.toggle("mk-input-control--error", showError && hasError);
    }
  };

  const setFieldError = (errorEl, message, showError) => {
    if (!(errorEl instanceof HTMLElement)) return;
    if (showError && message) {
      errorEl.textContent = message;
      errorEl.classList.remove("visually-hidden");
      return;
    }
    errorEl.textContent = "";
    errorEl.classList.add("visually-hidden");
  };

  const validateName = (value, label) => {
    const normalized = value.trim();
    if (!normalized) return `El ${label} es obligatorio.`;
    if (normalized.length < 2) return `El ${label} debe tener al menos 2 caracteres.`;
    if (!nameRegex.test(normalized)) return `El ${label} solo puede contener letras.`;
    return "";
  };

  const validateEmail = (value) => {
    const normalized = value.trim();
    if (!normalized) return "El correo electrónico es obligatorio.";
    if (!emailRegex.test(normalized)) return "Ingresa un correo electrónico válido.";
    return "";
  };

  const validatePassword = (value) => {
    if (!value) return "La contraseña es obligatoria.";
    const checks = getPasswordChecks(value);
    const isStrong = Object.values(checks).every(Boolean);
    if (!isStrong) {
      return "La contraseña debe tener 8+ caracteres, 1 mayúscula, 1 minúscula, 1 número y 1 símbolo.";
    }
    return "";
  };

  const validateConfirmPassword = (passwordValue, confirmValue) => {
    if (!confirmValue) return "Debes confirmar la contraseña.";
    if (passwordValue !== confirmValue) return "Las contraseñas no coinciden.";
    return "";
  };

  const validateTerms = (checked) =>
    checked ? "" : "Debes aceptar Términos y Condiciones para registrarte.";

  const shouldShowError = (input) => hasSubmitted || input.dataset.touched === "true";

  const updateStrength = (passwordValue) => {
    if (!(strengthWrap instanceof HTMLElement) || !(strengthLevel instanceof HTMLElement) || !(strengthBar instanceof HTMLElement)) {
      return;
    }

    if (!passwordValue) {
      strengthWrap.classList.add("visually-hidden");
      return;
    }

    strengthWrap.classList.remove("visually-hidden");
    const strength = getPasswordStrength(passwordValue);
    strengthLevel.textContent = strength.label;
    strengthLevel.classList.remove("mk-strength-low", "mk-strength-medium", "mk-strength-high");
    strengthLevel.classList.add(strength.textClass);

    strengthBar.classList.remove("mk-strength-bar--low", "mk-strength-bar--medium", "mk-strength-bar--high");
    strengthBar.classList.add(strength.barClass);
  };

  const collectErrors = () => ({
    firstName: validateName(firstName.value, "nombre"),
    lastName: validateName(lastName.value, "apellido"),
    email: validateEmail(email.value),
    password: validatePassword(password.value),
    confirmPassword: validateConfirmPassword(password.value, confirmPassword.value),
    terms: validateTerms(terms.checked),
  });

  const renderValidation = () => {
    const errors = collectErrors();

    const showFirstNameError = shouldShowError(firstName);
    const showLastNameError = shouldShowError(lastName);
    const showEmailError = shouldShowError(email);
    const showPasswordError = shouldShowError(password);
    const showConfirmError = shouldShowError(confirmPassword);
    const showTermsError = hasSubmitted || terms.dataset.touched === "true";

    setFieldVisualState(firstName, Boolean(errors.firstName), showFirstNameError);
    setFieldVisualState(lastName, Boolean(errors.lastName), showLastNameError);
    setFieldVisualState(email, Boolean(errors.email), showEmailError);
    setFieldVisualState(password, Boolean(errors.password), showPasswordError);
    setFieldVisualState(confirmPassword, Boolean(errors.confirmPassword), showConfirmError);

    setFieldError(firstNameError, errors.firstName, showFirstNameError);
    setFieldError(lastNameError, errors.lastName, showLastNameError);
    setFieldError(emailError, errors.email, showEmailError);
    setFieldError(passwordError, errors.password, showPasswordError);
    setFieldError(confirmPasswordError, errors.confirmPassword, showConfirmError);
    setFieldError(termsError, errors.terms, showTermsError);

    terms.setAttribute("aria-invalid", String(showTermsError && Boolean(errors.terms)));
    updateStrength(password.value);

    const isValid = Object.values(errors).every((value) => value === "");
    submit.disabled = !isValid;
    submit.setAttribute("aria-disabled", String(!isValid));
    if (!isValid) success?.classList.add("visually-hidden");

    return { isValid, errors };
  };

  [firstName, lastName, email, password, confirmPassword].forEach((input) => {
    input.addEventListener("blur", () => {
      input.dataset.touched = "true";
      renderValidation();
    });

    input.addEventListener("input", () => {
      renderValidation();
    });
  });

  terms.addEventListener("change", () => {
    terms.dataset.touched = "true";
    renderValidation();
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    hasSubmitted = true;
    firstName.dataset.touched = "true";
    lastName.dataset.touched = "true";
    email.dataset.touched = "true";
    password.dataset.touched = "true";
    confirmPassword.dataset.touched = "true";
    terms.dataset.touched = "true";

    const { isValid } = renderValidation();
    if (!isValid) {
      const focusable = [firstName, lastName, email, password, confirmPassword, terms];
      const firstInvalid = focusable.find((element) => element.getAttribute("aria-invalid") === "true");
      firstInvalid?.focus();
      return;
    }

    success?.classList.remove("visually-hidden");
  });

  renderValidation();
}

function initPinInputs() {
  const pinGroups = document.querySelectorAll("[data-mk-pin-group]");
  if (!pinGroups.length) return;

  pinGroups.forEach((group) => {
    if (!(group instanceof HTMLElement)) return;

    const inputs = Array.from(group.querySelectorAll(".mk-pin-input")).filter(
      (input) => input instanceof HTMLInputElement
    );
    if (!inputs.length) return;

    const editableInputs = inputs.filter((input) => !input.readOnly && !input.disabled);
    if (!editableInputs.length) return;

    const updateVisualStates = () => {
      editableInputs.forEach((input) => {
        if (input.dataset.state === "error") return;
        if (input.value) {
          input.dataset.state = "filled";
        } else {
          delete input.dataset.state;
        }
      });
    };

    const emitPinChange = () => {
      const value = editableInputs.map((input) => input.value).join("");
      group.dispatchEvent(
        new CustomEvent("mk:pin-change", {
          bubbles: true,
          detail: { value },
        })
      );
    };

    const moveFocus = (index) => {
      const next = editableInputs[index];
      if (next) {
        next.focus();
        next.select();
      }
    };

    editableInputs.forEach((input, index) => {
      input.addEventListener("focus", () => {
        input.select();
      });

      input.addEventListener("input", () => {
        const sanitized = input.value.replace(/\D/g, "").slice(-1);
        input.value = sanitized;

        if (sanitized) {
          moveFocus(index + 1);
        }

        updateVisualStates();
        emitPinChange();
      });

      input.addEventListener("keydown", (event) => {
        if (event.key === "Backspace" && !input.value && index > 0) {
          const previous = editableInputs[index - 1];
          previous.value = "";
          delete previous.dataset.state;
          previous.focus();
          previous.select();
          emitPinChange();
          event.preventDefault();
          return;
        }

        if (event.key === "ArrowLeft" && index > 0) {
          moveFocus(index - 1);
          event.preventDefault();
          return;
        }

        if (event.key === "ArrowRight" && index < editableInputs.length - 1) {
          moveFocus(index + 1);
          event.preventDefault();
        }
      });
    });

    group.addEventListener("paste", (event) => {
      const clipboardText = event.clipboardData?.getData("text") ?? "";
      const digits = clipboardText.replace(/\D/g, "");
      if (!digits) return;

      event.preventDefault();
      const max = Math.min(digits.length, editableInputs.length);
      for (let index = 0; index < max; index += 1) {
        editableInputs[index].value = digits[index];
      }

      const focusIndex = max >= editableInputs.length ? editableInputs.length - 1 : max;
      moveFocus(focusIndex);
      updateVisualStates();
      emitPinChange();
    });

    updateVisualStates();
    emitPinChange();
  });
}

function initCheckTokenForm() {
  const form = document.querySelector("[data-mk-checktoken-form]");
  if (!(form instanceof HTMLFormElement)) return;

  const pinGroup = form.querySelector("[data-mk-pin-group]");
  if (!(pinGroup instanceof HTMLElement)) return;

  const inputs = Array.from(pinGroup.querySelectorAll(".mk-pin-input")).filter(
    (input) => input instanceof HTMLInputElement && !input.readOnly && !input.disabled
  );
  if (!inputs.length) return;

  const submit = document.getElementById("mk-checktoken-submit");
  const error = document.getElementById("mk-pin-error");
  const success = document.getElementById("mk-checktoken-success");
  const resend = form.querySelector("[data-mk-resend-token]");
  const pinLength = Number(pinGroup.dataset.mkPinLength || inputs.length);

  if (!(submit instanceof HTMLButtonElement)) return;

  const getCode = () => inputs.map((input) => input.value).join("");

  const clearErrorState = () => {
    if (error instanceof HTMLElement) {
      error.textContent = "";
      error.classList.add("visually-hidden");
    }

    inputs.forEach((input) => {
      if (input.dataset.state === "error") {
        if (input.value) {
          input.dataset.state = "filled";
        } else {
          delete input.dataset.state;
        }
      }
      input.setAttribute("aria-invalid", "false");
    });
  };

  const showErrorState = (message) => {
    if (error instanceof HTMLElement) {
      error.textContent = message;
      error.classList.remove("visually-hidden");
    }

    inputs.forEach((input) => {
      input.dataset.state = "error";
      input.setAttribute("aria-invalid", "true");
    });

    success?.classList.add("visually-hidden");
  };

  const updateButtonState = () => {
    const code = getCode();
    const isComplete = code.length === pinLength && /^\d+$/.test(code);
    clearErrorState();
    submit.disabled = !isComplete;
    submit.setAttribute("aria-disabled", String(!isComplete));
  };

  pinGroup.addEventListener("mk:pin-change", () => {
    updateButtonState();
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const code = getCode();
    const isComplete = code.length === pinLength && /^\d+$/.test(code);

    if (!isComplete) {
      showErrorState(`Ingresa el código completo de ${pinLength} dígitos.`);
      const firstEmpty = inputs.find((input) => !input.value);
      (firstEmpty ?? inputs[0]).focus();
      return;
    }

    clearErrorState();
    success?.classList.remove("visually-hidden");
  });

  resend?.addEventListener("click", (event) => {
    event.preventDefault();
    clearErrorState();
    success?.classList.add("visually-hidden");
  });

  updateButtonState();
}

function initMemberCheckoutForm() {
  const form = document.querySelector("[data-mk-membercheckout-form]");
  if (!(form instanceof HTMLFormElement)) return;

  const cards = Array.from(form.querySelectorAll("[data-mk-membership-card]")).filter(
    (card) => card instanceof HTMLButtonElement
  );
  const payButton = document.getElementById("mk-member-pay-btn");
  const hiddenSelection = document.getElementById("mk-member-selection");
  const error = document.getElementById("mk-member-error");
  const success = document.getElementById("mk-member-success");
  const modal = document.querySelector("[data-mk-membership-modal]");
  const modalPrice = document.getElementById("mk-membership-modal-price");
  const modalImage = document.getElementById("mk-membership-modal-image");

  if (!(payButton instanceof HTMLButtonElement) || !(hiddenSelection instanceof HTMLInputElement) || !cards.length) {
    return;
  }

  let selectedMembership =
    cards.find((card) => card.dataset.selected === "true")?.dataset.membership ??
    hiddenSelection.value ??
    "";
  let hasInteracted = false;
  let lastFocusedCard = null;

  const clearMessages = () => {
    if (error instanceof HTMLElement) {
      error.textContent = "";
      error.classList.add("visually-hidden");
    }
    success?.classList.add("visually-hidden");
  };

  const updateModalContent = () => {
    if (!(modalPrice instanceof HTMLElement) || !(modalImage instanceof HTMLImageElement)) return;
    const selectedCard = cards.find((card) => card.dataset.membership === selectedMembership);
    if (!selectedCard) return;

    const price = selectedCard.querySelector(".mk-membership-price");
    if (price instanceof HTMLElement) {
      modalPrice.textContent = price.textContent?.trim() ?? "Membresía";
    }

    const image = selectedCard.querySelector(".mk-membership-image");
    if (image instanceof HTMLImageElement) {
      modalImage.src = image.src;
      modalImage.alt = image.alt;
    }
  };

  const closeModal = () => {
    if (!(modal instanceof HTMLElement)) return;
    modal.classList.add("visually-hidden");
    document.body.classList.remove("mk-modal-open");
    if (lastFocusedCard instanceof HTMLButtonElement) {
      lastFocusedCard.focus();
    }
  };

  const openModal = () => {
    if (!(modal instanceof HTMLElement)) return;
    updateModalContent();
    modal.classList.remove("visually-hidden");
    document.body.classList.add("mk-modal-open");
    const continueBtn = modal.querySelector("[data-mk-modal-ack]");
    if (continueBtn instanceof HTMLButtonElement) {
      continueBtn.focus();
    }
  };

  const renderState = () => {
    hiddenSelection.value = selectedMembership;

    cards.forEach((card) => {
      const isSelected = card.dataset.membership === selectedMembership;
      card.classList.toggle("mk-membership-card--selected", isSelected);
      card.classList.toggle("mk-membership-card--unselected", !isSelected);
      card.dataset.selected = String(isSelected);
      card.setAttribute("aria-checked", String(isSelected));

      const check = card.querySelector(".mk-membership-check");
      if (check instanceof HTMLElement) {
        check.classList.toggle("visually-hidden", !isSelected);
      }
    });

    const canPay = Boolean(selectedMembership) && hasInteracted;
    payButton.disabled = !canPay;
    payButton.setAttribute("aria-disabled", String(!canPay));
  };

  cards.forEach((card) => {
    card.addEventListener("click", () => {
      selectedMembership = card.dataset.membership ?? "";
      hasInteracted = true;
      lastFocusedCard = card;
      clearMessages();
      renderState();
      openModal();
    });
  });

  if (modal instanceof HTMLElement) {
    const closeTriggers = modal.querySelectorAll("[data-mk-modal-close], [data-mk-modal-ack]");
    closeTriggers.forEach((trigger) => {
      if (!(trigger instanceof HTMLElement)) return;
      trigger.addEventListener("click", closeModal);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key !== "Escape") return;
      if (modal.classList.contains("visually-hidden")) return;
      closeModal();
    });
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!selectedMembership || !hasInteracted) {
      if (error instanceof HTMLElement) {
        error.textContent = "Selecciona una membresía para continuar al pago.";
        error.classList.remove("visually-hidden");
      }
      cards[0]?.focus();
      return;
    }

    clearMessages();
    closeModal();
    const label = selectedMembership === "elite" ? "500 Elite" : "100 Básico";
    if (success instanceof HTMLElement) {
      success.textContent = `Membresía ${label} seleccionada. Puedes continuar al checkout de pago.`;
      success.classList.remove("visually-hidden");
    }
  });

  renderState();
}
