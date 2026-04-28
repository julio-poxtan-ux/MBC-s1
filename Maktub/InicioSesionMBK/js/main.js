(function () {
  "use strict";

  const setButtonState = (button, disabled) => {
    if (!button) {
      return;
    }

    button.disabled = disabled;
    button.setAttribute("aria-disabled", String(disabled));
  };

  const bindDemoLinks = (container, onClickMessage) => {
    if (!container) {
      return;
    }

    container.querySelectorAll('a[href="#"]').forEach((link) => {
      link.addEventListener("click", (event) => {
        event.preventDefault();
        if (typeof onClickMessage === "function") {
          onClickMessage();
        }
      });
    });
  };

  const latinAmericaCountries = [
    { code: "AR", name: "Argentina", flag: "🇦🇷" },
    { code: "BO", name: "Bolivia", flag: "🇧🇴" },
    { code: "BR", name: "Brasil", flag: "🇧🇷" },
    { code: "CL", name: "Chile", flag: "🇨🇱" },
    { code: "CO", name: "Colombia", flag: "🇨🇴" },
    { code: "CR", name: "Costa Rica", flag: "🇨🇷" },
    { code: "CU", name: "Cuba", flag: "🇨🇺" },
    { code: "DO", name: "República Dominicana", flag: "🇩🇴" },
    { code: "EC", name: "Ecuador", flag: "🇪🇨" },
    { code: "SV", name: "El Salvador", flag: "🇸🇻" },
    { code: "GT", name: "Guatemala", flag: "🇬🇹" },
    { code: "HT", name: "Haití", flag: "🇭🇹" },
    { code: "HN", name: "Honduras", flag: "🇭🇳" },
    { code: "MX", name: "México", flag: "🇲🇽" },
    { code: "NI", name: "Nicaragua", flag: "🇳🇮" },
    { code: "PA", name: "Panamá", flag: "🇵🇦" },
    { code: "PY", name: "Paraguay", flag: "🇵🇾" },
    { code: "PE", name: "Perú", flag: "🇵🇪" },
    { code: "UY", name: "Uruguay", flag: "🇺🇾" },
    { code: "VE", name: "Venezuela", flag: "🇻🇪" },
  ];

  const latinAmericaCountryByCode = latinAmericaCountries.reduce((countries, country) => {
    countries[country.code] = country;
    return countries;
  }, {});

  const latinAmericaTimezoneMap = {
    argentina: "AR",
    buenos_aires: "AR",
    la_paz: "BO",
    sao_paulo: "BR",
    belem: "BR",
    fortaleza: "BR",
    recife: "BR",
    maceio: "BR",
    bahia: "BR",
    chile: "CL",
    santiago: "CL",
    bogota: "CO",
    costa_rica: "CR",
    havana: "CU",
    santo_domingo: "DO",
    guayaquil: "EC",
    quito: "EC",
    el_salvador: "SV",
    guatemala: "GT",
    port_au_prince: "HT",
    tegucigalpa: "HN",
    mexico: "MX",
    merida: "MX",
    monterrey: "MX",
    mexico_city: "MX",
    managua: "NI",
    panama: "PA",
    asuncion: "PY",
    lima: "PE",
    montevideo: "UY",
    caracas: "VE",
  };

  const normalizeSearchValue = (value) => {
    return (value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();
  };

  const findLatinAmericaCountry = (value) => {
    const normalizedValue = normalizeSearchValue(value);
    return latinAmericaCountries.find((country) => normalizeSearchValue(country.name) === normalizedValue) || null;
  };

  const detectLatinAmericaCountry = () => {
    const localeCandidates = [];

    if (Array.isArray(window.navigator.languages)) {
      localeCandidates.push(...window.navigator.languages);
    }

    if (window.navigator.language) {
      localeCandidates.push(window.navigator.language);
    }

    for (const locale of localeCandidates) {
      const codeMatch = /-([a-z]{2})$/i.exec(locale || "");
      const countryCode = codeMatch ? codeMatch[1].toUpperCase() : "";

      if (countryCode && latinAmericaCountryByCode[countryCode]) {
        return latinAmericaCountryByCode[countryCode];
      }
    }

    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
    const normalizedTimeZone = normalizeSearchValue(timeZone).replace(/\//g, "_");
    const timezoneKey = Object.keys(latinAmericaTimezoneMap).find((key) => normalizedTimeZone.includes(key));

    if (timezoneKey) {
      return latinAmericaCountryByCode[latinAmericaTimezoneMap[timezoneKey]] || null;
    }

    return null;
  };

  const initCountrySelectComponents = () => {
    const components = document.querySelectorAll("[data-mk-country-select]");

    if (!components.length) {
      return;
    }

    components.forEach((component) => {
      const hiddenInput = component.querySelector("[data-mk-country-hidden]");
      const trigger = component.querySelector("[data-mk-country-trigger]");
      const triggerValue = component.querySelector("[data-mk-country-value]");
      const triggerFlag = component.querySelector("[data-mk-country-flag]");
      const panel = component.querySelector("[data-mk-country-panel]");
      const searchInput = component.querySelector("[data-mk-country-search]");
      const optionsContainer = component.querySelector("[data-mk-country-options]");
      const autoButton = component.querySelector("[data-mk-country-auto]");
      const emptyState = component.querySelector("[data-mk-country-empty]");

      if (!hiddenInput || !trigger || !triggerValue || !triggerFlag || !panel || !searchInput || !optionsContainer || !autoButton || !emptyState) {
        return;
      }

      let filteredCountries = latinAmericaCountries.slice();

      const updateTrigger = (country) => {
        if (!country) {
          return;
        }

        triggerValue.textContent = country.name;
        triggerFlag.textContent = country.flag;
      };

      const dispatchCountryChange = () => {
        hiddenInput.dispatchEvent(new Event("input", { bubbles: true }));
        hiddenInput.dispatchEvent(new Event("change", { bubbles: true }));
      };

      const closePanel = (focusTrigger) => {
        if (panel.hidden) {
          if (focusTrigger) {
            trigger.focus();
          }
          return;
        }

        component.classList.remove("mk-country-select--open");
        trigger.setAttribute("aria-expanded", "false");
        panel.hidden = true;
        searchInput.value = "";
        filteredCountries = latinAmericaCountries.slice();
        renderOptions();

        if (focusTrigger) {
          trigger.focus();
        }
      };

      const setSelectedCountry = (country, closeAfterSelect) => {
        if (!country) {
          return;
        }

        const shouldDispatch = hiddenInput.value !== country.name;
        hiddenInput.value = country.name;
        updateTrigger(country);
        renderOptions();

        if (shouldDispatch) {
          dispatchCountryChange();
        }

        if (closeAfterSelect) {
          closePanel(true);
        }
      };

      const focusOptionByIndex = (index) => {
        const options = Array.from(optionsContainer.querySelectorAll("[data-mk-country-option]"));
        const safeIndex = Math.max(0, Math.min(index, options.length - 1));

        if (options[safeIndex]) {
          options[safeIndex].focus();
        }
      };

      function renderOptions() {
        optionsContainer.innerHTML = "";

        filteredCountries.forEach((country) => {
          const option = document.createElement("button");
          const optionMain = document.createElement("span");
          const optionFlag = document.createElement("span");
          const optionLabel = document.createElement("span");
          const optionCheck = document.createElement("span");
          const selected = hiddenInput.value === country.name;

          option.type = "button";
          option.className = "mk-country-select__option mk-focus-ring";
          option.dataset.mkCountryOption = country.code;
          option.setAttribute("role", "option");
          option.setAttribute("aria-selected", String(selected));
          option.setAttribute("data-country-name", country.name);

          optionMain.className = "mk-country-select__option-main";
          optionFlag.className = "mk-country-select__flag";
          optionFlag.setAttribute("aria-hidden", "true");
          optionFlag.textContent = country.flag;
          optionLabel.className = "mk-country-select__option-label";
          optionLabel.textContent = country.name;
          optionCheck.className = "mk-country-select__check bi bi-check-lg";
          optionCheck.setAttribute("aria-hidden", "true");

          optionMain.appendChild(optionFlag);
          optionMain.appendChild(optionLabel);
          option.appendChild(optionMain);
          option.appendChild(optionCheck);
          optionsContainer.appendChild(option);
        });

        emptyState.hidden = filteredCountries.length > 0;
      }

      const filterCountries = (searchTerm) => {
        const normalizedTerm = normalizeSearchValue(searchTerm);

        filteredCountries = normalizedTerm
          ? latinAmericaCountries.filter((country) => normalizeSearchValue(country.name).includes(normalizedTerm))
          : latinAmericaCountries.slice();

        renderOptions();
      };

      const openPanel = () => {
        component.classList.add("mk-country-select--open");
        trigger.setAttribute("aria-expanded", "true");
        panel.hidden = false;
        searchInput.placeholder = "Busca tu país...";
        searchInput.value = "";
        filterCountries("");
        window.setTimeout(() => {
          searchInput.focus();
        }, 0);
      };

      const initialCountry = findLatinAmericaCountry(hiddenInput.value) || latinAmericaCountryByCode.MX;
      setSelectedCountry(initialCountry, false);

      trigger.addEventListener("click", () => {
        if (panel.hidden) {
          openPanel();
          return;
        }

        closePanel(false);
      });

      searchInput.addEventListener("input", () => {
        filterCountries(searchInput.value);
      });

      searchInput.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
          event.preventDefault();
          closePanel(true);
          return;
        }

        if (event.key === "ArrowDown") {
          event.preventDefault();
          focusOptionByIndex(0);
          return;
        }

        if (event.key === "Enter") {
          event.preventDefault();

          if (filteredCountries.length === 1) {
            setSelectedCountry(filteredCountries[0], true);
          }
        }
      });

      optionsContainer.addEventListener("click", (event) => {
        const option = event.target.closest("[data-mk-country-option]");

        if (!option) {
          return;
        }

        const country = latinAmericaCountryByCode[option.dataset.mkCountryOption];
        setSelectedCountry(country, true);
      });

      optionsContainer.addEventListener("keydown", (event) => {
        const options = Array.from(optionsContainer.querySelectorAll("[data-mk-country-option]"));
        const currentIndex = options.indexOf(event.target);

        if (event.key === "Escape") {
          event.preventDefault();
          closePanel(true);
          return;
        }

        if (event.key === "ArrowDown") {
          event.preventDefault();
          focusOptionByIndex(currentIndex + 1);
          return;
        }

        if (event.key === "ArrowUp") {
          event.preventDefault();
          if (currentIndex <= 0) {
            searchInput.focus();
            return;
          }
          focusOptionByIndex(currentIndex - 1);
          return;
        }

        if (event.key === "Home") {
          event.preventDefault();
          focusOptionByIndex(0);
          return;
        }

        if (event.key === "End") {
          event.preventDefault();
          focusOptionByIndex(options.length - 1);
        }
      });

      autoButton.addEventListener("click", () => {
        const detectedCountry = detectLatinAmericaCountry();

        if (detectedCountry) {
          setSelectedCountry(detectedCountry, true);
          return;
        }

        openPanel();
        searchInput.placeholder = "No pudimos detectarlo. Selecciónalo manualmente.";
      });

      document.addEventListener("mousedown", (event) => {
        if (!component.contains(event.target)) {
          closePanel(false);
        }
      });
    });
  };

  const initCodeInputComponents = () => {
    const codeInputComponents = document.querySelectorAll("[data-mk-code-input]");

    if (!codeInputComponents.length) {
      return;
    }

    codeInputComponents.forEach((component) => {
      const digitsContainer = component.querySelector(".mk-code-input__digits");
      const hiddenField = component.querySelector("[data-mk-code-value]");

      if (!digitsContainer || !hiddenField) {
        return;
      }

      const length = Math.max(1, Number.parseInt(component.dataset.length || "6", 10) || 6);
      const initialCode = (component.dataset.initialCode || "").replace(/\D/g, "").slice(0, length);
      const codeName = component.dataset.name || "code";
      const digits = [];

      hiddenField.name = codeName;
      digitsContainer.innerHTML = "";

      for (let index = 0; index < length; index += 1) {
        const input = document.createElement("input");
        input.id = "mkCodeDigit" + String(index + 1);
        input.type = "text";
        input.inputMode = "numeric";
        input.autoComplete = "one-time-code";
        input.maxLength = 1;
        input.className = "mk-code-input__digit mk-focus-ring";
        input.setAttribute("aria-label", "Dígito " + String(index + 1) + " de " + String(length));
        input.dataset.mkPinDigit = String(index);
        digitsContainer.appendChild(input);
        digits.push(input);
      }

      const emitValueChange = () => {
        const value = digits.map((input) => input.value).join("");
        hiddenField.value = value;
        component.dispatchEvent(
          new CustomEvent("mk:code-input-change", {
            bubbles: true,
            detail: {
              value,
              complete: digits.every((input) => input.value.length === 1),
            },
          }),
        );
      };

      const setActiveDigit = (targetInput) => {
        digits.forEach((input) => input.classList.remove("mk-code-input__digit--active"));
        if (targetInput) {
          targetInput.classList.add("mk-code-input__digit--active");
        }
      };

      const fillFromIndex = (startIndex, value) => {
        const chars = (value || "").replace(/\D/g, "").split("");
        chars.forEach((char, offset) => {
          const targetInput = digits[startIndex + offset];
          if (targetInput) {
            targetInput.value = char;
          }
        });
      };

      digits.forEach((input, index) => {
        input.addEventListener("focus", () => {
          setActiveDigit(input);
        });

        input.addEventListener("click", () => {
          setActiveDigit(input);
        });

        input.addEventListener("keydown", (event) => {
          if (event.key === "Backspace" && input.value === "" && index > 0) {
            event.preventDefault();
            const previous = digits[index - 1];
            previous.value = "";
            previous.focus();
            setActiveDigit(previous);
            emitValueChange();
            return;
          }

          if (event.key === "ArrowLeft" && index > 0) {
            event.preventDefault();
            digits[index - 1].focus();
            return;
          }

          if (event.key === "ArrowRight" && index < length - 1) {
            event.preventDefault();
            digits[index + 1].focus();
          }
        });

        input.addEventListener("paste", (event) => {
          const raw = event.clipboardData ? event.clipboardData.getData("text") : "";
          const pastedDigits = raw.replace(/\D/g, "");

          if (!pastedDigits) {
            return;
          }

          event.preventDefault();
          fillFromIndex(index, pastedDigits);

          const nextIndex = Math.min(index + pastedDigits.length, length - 1);
          digits[nextIndex].focus();
          setActiveDigit(digits[nextIndex]);
          emitValueChange();
        });

        input.addEventListener("input", () => {
          const cleanValue = input.value.replace(/\D/g, "");
          input.value = cleanValue ? cleanValue.charAt(cleanValue.length - 1) : "";

          if (input.value && index < length - 1) {
            digits[index + 1].focus();
            setActiveDigit(digits[index + 1]);
          } else {
            setActiveDigit(input);
          }

          emitValueChange();
        });
      });

      if (initialCode) {
        fillFromIndex(0, initialCode);
      }

      setActiveDigit(digits[0]);
      emitValueChange();
    });
  };

  const initWelcomeForm = () => {
    const onboardingForm = document.querySelector("[data-mk-onboarding-form]");

    if (!onboardingForm) {
      return;
    }

    const termsCheckbox = onboardingForm.querySelector("#mkTerms");
    const continueButton = onboardingForm.querySelector("#mkContinueBtn");
    const feedback = onboardingForm.querySelector("#mkTermsFeedback");

    if (!termsCheckbox || !continueButton || !feedback) {
      return;
    }

    const setFeedback = (message, state) => {
      feedback.textContent = message;
      if (state) {
        feedback.dataset.mkState = state;
      } else {
        feedback.removeAttribute("data-mk-state");
      }
    };

    const syncButtonState = () => {
      setButtonState(continueButton, !termsCheckbox.checked);
    };

    bindDemoLinks(onboardingForm, () => {
      setFeedback("En esta maqueta el enlace es demostrativo.", "success");
    });

    termsCheckbox.addEventListener("change", () => {
      syncButtonState();
      if (termsCheckbox.checked) {
        setFeedback("Términos aceptados. Ya puedes continuar.", "success");
        return;
      }
      setFeedback("", "");
    });

    onboardingForm.addEventListener("submit", (event) => {
      event.preventDefault();

      if (!termsCheckbox.checked) {
        syncButtonState();
        setFeedback("Para continuar, acepta los Términos y condiciones.", "error");
        termsCheckbox.focus();
        return;
      }

      setButtonState(continueButton, true);
      continueButton.textContent = "Validando...";
      setFeedback("Validando información del paso 1...", "success");

      window.setTimeout(() => {
        continueButton.textContent = "Continuar";
        syncButtonState();
        setFeedback("Paso 1 completado. Continúa con la confirmación de código.", "success");
      }, 900);
    });

    syncButtonState();
  };

  const initLoginForm = () => {
    const loginForm = document.querySelector("[data-mk-login-form]");

    if (!loginForm) {
      return;
    }

    const fields = {
      email: loginForm.querySelector('[data-mk-login-field="email"]'),
      password: loginForm.querySelector('[data-mk-login-field="password"]'),
    };
    const submitButton = loginForm.querySelector("[data-mk-login-submit]");
    const feedback = loginForm.querySelector("[data-mk-login-feedback]");
    const walletButton = loginForm.querySelector("[data-mk-wallet-btn]");
    const passwordToggle = loginForm.querySelector('[data-mk-login-toggle="password"]');

    if (!fields.email || !fields.password || !submitButton || !feedback) {
      return;
    }

    const touched = new Set();
    const regex = {
      email: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/,
      password: /^.{8,}$/,
    };

    const setFeedback = (message, state) => {
      feedback.textContent = message;
      if (state) {
        feedback.dataset.mkState = state;
      } else {
        feedback.removeAttribute("data-mk-state");
      }
    };

    const setFieldError = (fieldName, message) => {
      const input = fields[fieldName];
      if (!input) {
        return;
      }

      const inputRoot = input.closest(".mk-input");
      const inputField = inputRoot ? inputRoot.querySelector(".mk-input__field") : null;
      const errorNode = loginForm.querySelector('[data-mk-login-error-for="' + fieldName + '"]');

      if (message) {
        if (inputField) {
          inputField.classList.add("mk-input__field--error");
        }
        input.setAttribute("aria-invalid", "true");
        if (errorNode) {
          errorNode.textContent = message;
          errorNode.hidden = false;
        }
        return;
      }

      if (inputField) {
        inputField.classList.remove("mk-input__field--error");
      }
      input.removeAttribute("aria-invalid");
      if (errorNode) {
        errorNode.textContent = "";
        errorNode.hidden = true;
      }
    };

    const getFieldMessage = (fieldName) => {
      const email = fields.email.value.trim();
      const password = fields.password.value;

      switch (fieldName) {
        case "email":
          if (!email) {
            return "El email es obligatorio.";
          }
          if (!regex.email.test(email)) {
            return "Ingresa un email válido.";
          }
          return "";
        case "password":
          if (!password) {
            return "La contraseña es obligatoria.";
          }
          if (!regex.password.test(password)) {
            return "La contraseña debe tener al menos 8 caracteres.";
          }
          return "";
        default:
          return "";
      }
    };

    const validateField = (fieldName, forceShow) => {
      const message = getFieldMessage(fieldName);
      if (forceShow || touched.has(fieldName) || !message) {
        setFieldError(fieldName, message);
      }
      return !message;
    };

    const syncSubmitState = () => {
      const valid = getFieldMessage("email") === "" && getFieldMessage("password") === "";
      setButtonState(submitButton, !valid);
    };

    if (walletButton) {
      walletButton.addEventListener("click", () => {
        setFeedback("La conexión de wallet es demostrativa en esta maqueta.", "success");
      });
    }

    bindDemoLinks(loginForm, () => {
      setFeedback("En esta maqueta el enlace es demostrativo.", "success");
    });

    if (passwordToggle) {
      passwordToggle.addEventListener("click", () => {
        const isPassword = fields.password.type === "password";
        fields.password.type = isPassword ? "text" : "password";
        passwordToggle.setAttribute("aria-label", isPassword ? "Ocultar contraseña" : "Mostrar contraseña");
      });
    }

    ["email", "password"].forEach((fieldName) => {
      const input = fields[fieldName];

      input.addEventListener("blur", () => {
        touched.add(fieldName);
        validateField(fieldName, true);
        syncSubmitState();
      });

      input.addEventListener("input", () => {
        if (touched.has(fieldName)) {
          validateField(fieldName, true);
        } else {
          validateField(fieldName, false);
        }
        syncSubmitState();
      });
    });

    loginForm.addEventListener("submit", (event) => {
      event.preventDefault();

      touched.add("email");
      touched.add("password");

      const emailValid = validateField("email", true);
      const passwordValid = validateField("password", true);

      if (!emailValid || !passwordValid) {
        setFeedback("Revisa los campos marcados para continuar.", "error");
        if (!emailValid) {
          fields.email.focus();
        } else {
          fields.password.focus();
        }
        syncSubmitState();
        return;
      }

      setButtonState(submitButton, true);
      submitButton.textContent = "Ingresando...";
      setFeedback("Validando acceso...", "success");

      window.setTimeout(() => {
        submitButton.textContent = "Ingresar";
        syncSubmitState();
        setFeedback("Acceso validado correctamente.", "success");
      }, 1000);
    });

    syncSubmitState();
  };

  const initRegisterForm = () => {
    const registerForm = document.querySelector("[data-mk-register-form]");

    if (!registerForm) {
      return;
    }

    const fields = {
      firstName: registerForm.querySelector('[data-mk-field="firstName"]'),
      lastName: registerForm.querySelector('[data-mk-field="lastName"]'),
      email: registerForm.querySelector('[data-mk-field="email"]'),
      password: registerForm.querySelector('[data-mk-field="password"]'),
      confirmPassword: registerForm.querySelector('[data-mk-field="confirmPassword"]'),
      terms: registerForm.querySelector('[data-mk-field="terms"]'),
    };

    const submitButton = registerForm.querySelector("[data-mk-register-submit]");
    const feedback = registerForm.querySelector("[data-mk-register-feedback]");

    if (!fields.firstName || !fields.lastName || !fields.email || !fields.password || !fields.confirmPassword || !fields.terms || !submitButton || !feedback) {
      return;
    }

    const validationOrder = ["firstName", "lastName", "email", "password", "confirmPassword"];
    const touched = new Set();

    const regex = {
      name: /^[A-Za-zÀ-ÖØ-öø-ÿ' -]{2,}$/,
      email: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/,
      password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/,
    };

    const setFeedback = (message, state) => {
      feedback.textContent = message;
      if (state) {
        feedback.dataset.mkState = state;
      } else {
        feedback.removeAttribute("data-mk-state");
      }
    };

    const setFieldError = (fieldName, message) => {
      const input = fields[fieldName];
      if (!input) {
        return;
      }

      const inputRoot = input.closest(".mk-input");
      const inputField = inputRoot ? inputRoot.querySelector(".mk-input__field") : null;
      const errorNode = registerForm.querySelector('[data-mk-error-for="' + fieldName + '"]');

      if (message) {
        if (inputField) {
          inputField.classList.add("mk-input__field--error");
        }
        input.setAttribute("aria-invalid", "true");

        if (errorNode) {
          errorNode.textContent = message;
          errorNode.hidden = false;
        }
        return;
      }

      if (inputField) {
        inputField.classList.remove("mk-input__field--error");
      }
      input.removeAttribute("aria-invalid");

      if (errorNode) {
        errorNode.textContent = "";
        errorNode.hidden = true;
      }
    };

    const getFieldMessage = (fieldName) => {
      const firstName = fields.firstName.value.trim();
      const lastName = fields.lastName.value.trim();
      const email = fields.email.value.trim();
      const password = fields.password.value;
      const confirmPassword = fields.confirmPassword.value;

      switch (fieldName) {
        case "firstName":
          if (!firstName) {
            return "El nombre es obligatorio.";
          }
          if (!regex.name.test(firstName)) {
            return "Ingresa un nombre válido (mínimo 2 caracteres).";
          }
          return "";
        case "lastName":
          if (!lastName) {
            return "El apellido es obligatorio.";
          }
          if (!regex.name.test(lastName)) {
            return "Ingresa un apellido válido (mínimo 2 caracteres).";
          }
          return "";
        case "email":
          if (!email) {
            return "El correo electrónico es obligatorio.";
          }
          if (!regex.email.test(email)) {
            return "Ingresa un correo electrónico válido.";
          }
          return "";
        case "password":
          if (!password) {
            return "La contraseña es obligatoria.";
          }
          if (!regex.password.test(password)) {
            return "La contraseña debe tener 8+ caracteres, mayúscula, minúscula, número y símbolo.";
          }
          return "";
        case "confirmPassword":
          if (!confirmPassword) {
            return "Confirma tu contraseña.";
          }
          if (password !== confirmPassword) {
            return "Las contraseñas no coinciden.";
          }
          return "";
        default:
          return "";
      }
    };

    const validateField = (fieldName, forceShow) => {
      const message = getFieldMessage(fieldName);
      if (forceShow || touched.has(fieldName) || !message) {
        setFieldError(fieldName, message);
      }
      return !message;
    };

    const isFormCompleteAndValid = () => {
      const validInputs = validationOrder.every((fieldName) => getFieldMessage(fieldName) === "");
      return validInputs && fields.terms.checked;
    };

    const syncSubmitState = () => {
      setButtonState(submitButton, !isFormCompleteAndValid());
    };

    bindDemoLinks(registerForm, () => {
      setFeedback("En esta maqueta los enlaces legales son demostrativos.", "success");
    });

    registerForm.querySelectorAll('[data-mk-toggle="password"]').forEach((toggleButton) => {
      const targetId = toggleButton.getAttribute("data-target");
      if (!targetId) {
        return;
      }

      const targetInput = registerForm.querySelector("#" + targetId);
      if (!targetInput) {
        return;
      }

      const icon = toggleButton.querySelector(".bi");

      const syncPasswordToggleUI = () => {
        const isPassword = targetInput.type === "password";

        if (icon) {
          icon.classList.toggle("bi-eye", isPassword);
          icon.classList.toggle("bi-eye-slash", !isPassword);
        }

        toggleButton.setAttribute("aria-label", isPassword ? "Mostrar contraseña" : "Ocultar contraseña");
      };

      syncPasswordToggleUI();

      toggleButton.addEventListener("click", () => {
        targetInput.type = targetInput.type === "password" ? "text" : "password";
        syncPasswordToggleUI();
      });
    });

    validationOrder.forEach((fieldName) => {
      const input = fields[fieldName];

      input.addEventListener("blur", () => {
        touched.add(fieldName);
        validateField(fieldName, true);

        if (fieldName === "password" && touched.has("confirmPassword")) {
          validateField("confirmPassword", true);
        }

        syncSubmitState();
      });

      input.addEventListener("input", () => {
        if (fieldName === "confirmPassword" && input.value.trim() !== "") {
          input.classList.remove("mk-input__control--prefilled");
        }

        if (touched.has(fieldName)) {
          validateField(fieldName, true);
        } else {
          validateField(fieldName, false);
        }

        if (fieldName === "password" && touched.has("confirmPassword")) {
          validateField("confirmPassword", true);
        }

        syncSubmitState();
      });
    });

    fields.terms.addEventListener("change", () => {
      syncSubmitState();

      if (fields.terms.checked && feedback.dataset.mkState === "error") {
        setFeedback("", "");
      }
    });

    registerForm.addEventListener("submit", (event) => {
      event.preventDefault();

      validationOrder.forEach((fieldName) => touched.add(fieldName));

      const firstInvalidField = validationOrder.find((fieldName) => !validateField(fieldName, true));

      if (firstInvalidField) {
        setFeedback("Revisa los campos marcados para continuar.", "error");
        fields[firstInvalidField].focus();
        syncSubmitState();
        return;
      }

      if (!fields.terms.checked) {
        setFeedback("Para registrarte, acepta Términos y Condiciones y Políticas de Privacidad.", "error");
        fields.terms.focus();
        syncSubmitState();
        return;
      }

      const defaultLabel = submitButton.textContent || "Registrarme";
      setButtonState(submitButton, true);
      submitButton.textContent = "Registrando...";
      setFeedback("Validando información del registro...", "success");

      window.setTimeout(() => {
        submitButton.textContent = defaultLabel;
        syncSubmitState();
        setFeedback("Formulario validado correctamente. Puedes continuar al siguiente paso.", "success");
      }, 1000);
    });

    syncSubmitState();
  };

  const initPinForm = () => {
    const pinForm = document.querySelector("[data-mk-pin-form]");

    if (!pinForm) {
      return;
    }

    const codeInput = pinForm.querySelector("[data-mk-code-input]");
    const hiddenCode = pinForm.querySelector("[data-mk-code-value]");
    const submitButton = pinForm.querySelector("[data-mk-pin-submit]");
    const feedback = pinForm.querySelector("[data-mk-pin-feedback]");
    const resendLink = pinForm.querySelector("[data-mk-pin-resend-link]");

    if (!codeInput || !hiddenCode || !submitButton || !feedback || !resendLink) {
      return;
    }

    const length = Math.max(1, Number.parseInt(codeInput.dataset.length || "6", 10) || 6);
    const baseButtonLabel = submitButton.textContent || "Validar código";
    let secondsToResend = 59;
    let resendTimerId = null;

    const setFeedback = (message, state) => {
      feedback.textContent = message;
      if (state) {
        feedback.dataset.mkState = state;
      } else {
        feedback.removeAttribute("data-mk-state");
      }
    };

    const syncSubmitState = () => {
      const isReady = hiddenCode.value.length === length;
      setButtonState(submitButton, !isReady);
    };

    const formatSeconds = (seconds) => {
      return "00:" + String(Math.max(0, seconds)).padStart(2, "0");
    };

    const updateResendText = () => {
      if (secondsToResend > 0) {
        resendLink.textContent = "Reenviar código (" + formatSeconds(secondsToResend) + ")";
        resendLink.setAttribute("aria-disabled", "true");
        return;
      }

      resendLink.textContent = "Reenviar código";
      resendLink.setAttribute("aria-disabled", "false");
    };

    const startResendCountdown = () => {
      if (resendTimerId) {
        window.clearInterval(resendTimerId);
      }

      updateResendText();

      resendTimerId = window.setInterval(() => {
        secondsToResend -= 1;
        updateResendText();

        if (secondsToResend <= 0 && resendTimerId) {
          window.clearInterval(resendTimerId);
          resendTimerId = null;
        }
      }, 1000);
    };

    codeInput.addEventListener("mk:code-input-change", () => {
      syncSubmitState();
      if (feedback.textContent) {
        setFeedback("", "");
      }
    });

    resendLink.addEventListener("click", (event) => {
      event.preventDefault();

      if (secondsToResend > 0) {
        return;
      }

      secondsToResend = 59;
      startResendCountdown();
      setFeedback("Te enviamos un nuevo código de verificación.", "success");
    });

    pinForm.addEventListener("submit", (event) => {
      event.preventDefault();

      if (hiddenCode.value.length !== length) {
        const firstEmptyInput = Array.from(pinForm.querySelectorAll(".mk-code-input__digit")).find(
          (input) => input.value.length === 0,
        );
        setFeedback("Ingresa el código completo para continuar.", "error");
        if (firstEmptyInput) {
          firstEmptyInput.focus();
        }
        syncSubmitState();
        return;
      }

      setButtonState(submitButton, true);
      submitButton.textContent = "Validando código...";
      setFeedback("Validando código de seguridad...", "success");

      window.setTimeout(() => {
        submitButton.textContent = baseButtonLabel;
        syncSubmitState();
        setFeedback("Código validado correctamente. Puedes continuar.", "success");
      }, 1000);
    });

    updateResendText();
    startResendCountdown();
    syncSubmitState();
  };

  const initProfilePage = () => {
    const profilePage = document.querySelector('[data-mk-page="profile-user"]');

    if (!profilePage) {
      return;
    }

    const modalElement = document.getElementById("mkSaveProfileModal");
    const confirmButton = modalElement ? modalElement.querySelector("[data-mk-confirm-save]") : null;
    const modalFeedback = modalElement ? modalElement.querySelector("[data-mk-profile-modal-feedback]") : null;
    const saveModal = modalElement && window.bootstrap ? new window.bootstrap.Modal(modalElement) : null;
    let activeFormState = null;

    const setModalFeedback = (message, state) => {
      if (!modalFeedback) {
        return;
      }
      modalFeedback.textContent = message;
      if (state) {
        modalFeedback.dataset.mkState = state;
      } else {
        modalFeedback.removeAttribute("data-mk-state");
      }
    };

    profilePage.querySelectorAll("[data-mk-profile-form]").forEach((form) => {
      const saveButton = form.querySelector("[data-mk-open-save-modal]");
      const fields = Array.from(form.querySelectorAll("input:not([data-mk-country-search])"));

      if (!saveButton || !fields.length) {
        return;
      }

      let baselineValues = fields.map((field) => field.value);

      const hasChanges = () => {
        return fields.some((field, index) => field.value !== baselineValues[index]);
      };

      const syncSaveState = () => {
        setButtonState(saveButton, !hasChanges());
      };

      fields.forEach((field) => {
        field.addEventListener("input", syncSaveState);
      });

      form.addEventListener("submit", (event) => {
        event.preventDefault();

        if (!hasChanges()) {
          syncSaveState();
          return;
        }

        activeFormState = {
          fields,
          setBaseline: () => {
            baselineValues = fields.map((field) => field.value);
          },
          syncSaveState,
        };

        setModalFeedback("", "");

        if (saveModal) {
          saveModal.show();
        }
      });

      syncSaveState();
    });

    if (modalElement) {
      modalElement.addEventListener("hidden.bs.modal", () => {
        setModalFeedback("", "");
      });
    }

    if (!confirmButton || !saveModal) {
      return;
    }

    confirmButton.addEventListener("click", () => {
      if (!activeFormState) {
        return;
      }

      setButtonState(confirmButton, true);
      confirmButton.textContent = "Guardando...";
      setModalFeedback("Guardando información de perfil...", "success");

      window.setTimeout(() => {
        activeFormState.setBaseline();
        activeFormState.syncSaveState();
        activeFormState = null;

        confirmButton.textContent = "Confirmar guardado";
        setButtonState(confirmButton, false);
        saveModal.hide();
      }, 900);
    });
  };

  initCodeInputComponents();
  initWelcomeForm();
  initLoginForm();
  initRegisterForm();
  initPinForm();
  initCountrySelectComponents();
  initProfilePage();
})();
