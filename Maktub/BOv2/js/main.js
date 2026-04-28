(() => {
  const doc = document;
  const app = doc.querySelector('[data-cm-app]');
  const menuToggle = doc.querySelector('[data-cm-menu-toggle]');
  const mobileMenu = doc.querySelector('[data-cm-mobile-menu]');

  const setMenuState = (isOpen) => {
    if (!app || !menuToggle || !mobileMenu) return;

    mobileMenu.classList.toggle('cm-is-open', isOpen);
    mobileMenu.hidden = !isOpen;
    menuToggle.setAttribute('aria-expanded', String(isOpen));
    menuToggle.setAttribute('aria-label', isOpen ? 'Cerrar menú' : 'Abrir menú');
    app.classList.toggle('cm-is-menu-open', isOpen);
  };

  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener('click', () => {
      const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
      setMenuState(!isExpanded);
    });

    mobileMenu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => setMenuState(false));
    });

    doc.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        setMenuState(false);
      }
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 991.98) {
        setMenuState(false);
      }
    });
  }

  const userMenuToggle = doc.querySelector(
    '[data-cm-user-menu-toggle], .cm-user-btn[aria-label="Perfil de usuario"]'
  );
  const headerInner = userMenuToggle?.closest('.cm-header__inner') || null;
  let userMenu = doc.querySelector('[data-cm-user-menu]');

  if (userMenuToggle && headerInner && !userMenu) {
    userMenu = doc.createElement('div');
    userMenu.className = 'cm-user-menu';
    userMenu.id = 'cm-user-menu';
    userMenu.setAttribute('data-cm-user-menu', '');
    userMenu.setAttribute('role', 'menu');
    userMenu.setAttribute('aria-label', 'Menú de usuario');
    userMenu.innerHTML = `
      <a class="cm-user-menu__item cm-user-menu__item--active" href="perfil-usuario.html" role="menuitem">
        <img src="assets/icons/icon-perfil-user.svg" alt="" aria-hidden="true" />
        <span>Perfil</span>
      </a>
      <span class="cm-user-menu__separator" aria-hidden="true"></span>
      <button class="cm-user-menu__item" type="button" role="menuitem" data-cm-user-logout>
        <img src="assets/icons/icon-logout.svg" alt="" aria-hidden="true" />
        <span>Cerrar sesión</span>
      </button>
    `;
    headerInner.append(userMenu);
  }

  if (userMenuToggle && userMenu) {
    userMenuToggle.setAttribute('data-cm-user-menu-toggle', '');
    userMenuToggle.setAttribute('aria-controls', userMenu.id || 'cm-user-menu');
    if (!userMenuToggle.hasAttribute('aria-expanded')) {
      userMenuToggle.setAttribute('aria-expanded', 'false');
    }
  }

  let logoutModal = doc.querySelector('[data-cm-logout-modal]');
  if (userMenuToggle && !logoutModal) {
    logoutModal = doc.createElement('div');
    logoutModal.className = 'cm-modal';
    logoutModal.setAttribute('data-cm-logout-modal', '');
    logoutModal.setAttribute('aria-hidden', 'true');
    logoutModal.innerHTML = `
      <div class="cm-modal__backdrop" data-cm-logout-cancel></div>
      <div
        class="cm-modal__dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cm-logout-title"
        aria-describedby="cm-logout-description"
      >
        <h2 id="cm-logout-title">¿Cerrar sesión?</h2>
        <p id="cm-logout-description">Se cerrará tu sesión actual y regresarás al panel principal.</p>
        <div class="cm-modal__actions">
          <button type="button" class="cm-modal__btn cm-modal__btn--ghost" data-cm-logout-cancel>Cancelar</button>
          <button type="button" class="cm-modal__btn cm-modal__btn--danger" data-cm-logout-confirm>Cerrar sesión</button>
        </div>
      </div>
    `;
    doc.body.append(logoutModal);
  }

  const logoutMenuBtn = doc.querySelector('[data-cm-user-logout]');
  const logoutCancelBtns = Array.from(doc.querySelectorAll('[data-cm-logout-cancel]'));
  const logoutConfirmBtn = doc.querySelector('[data-cm-logout-confirm]');

  const setUserMenuState = (isOpen) => {
    if (!userMenuToggle || !userMenu) return;
    userMenu.classList.toggle('cm-is-open', isOpen);
    userMenuToggle.setAttribute('aria-expanded', String(isOpen));
  };

  const setLogoutModalState = (isOpen) => {
    if (!logoutModal) return;
    logoutModal.classList.toggle('cm-is-open', isOpen);
    logoutModal.setAttribute('aria-hidden', String(!isOpen));
    doc.body.classList.toggle('cm-has-modal-open', isOpen);
  };

  if (userMenuToggle && userMenu) {
    userMenuToggle.addEventListener('click', (event) => {
      event.stopPropagation();
      const isExpanded = userMenuToggle.getAttribute('aria-expanded') === 'true';
      setUserMenuState(!isExpanded);
    });

    userMenu.addEventListener('click', (event) => {
      event.stopPropagation();
    });

    doc.addEventListener('click', (event) => {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (userMenu.contains(target) || userMenuToggle.contains(target)) return;
      setUserMenuState(false);
    });
  }

  if (logoutMenuBtn && logoutModal) {
    logoutMenuBtn.addEventListener('click', () => {
      setUserMenuState(false);
      setLogoutModalState(true);
    });

    logoutCancelBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        setLogoutModalState(false);
      });
    });

    logoutConfirmBtn?.addEventListener('click', () => {
      setLogoutModalState(false);
      window.location.href = 'index.html';
    });
  }

  doc.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    setUserMenuState(false);
    setLogoutModalState(false);
  });

  const profileRoot = doc.querySelector('[data-cm-profile]');
  if (profileRoot) {
    const profileForm = profileRoot.querySelector('[data-cm-profile-form]');
    const profileFeedback = profileRoot.querySelector('[data-cm-profile-feedback]');
    const passwordForm = profileRoot.querySelector('[data-cm-password-form]');
    const passwordFeedback = profileRoot.querySelector('[data-cm-password-feedback]');
    const photoTrigger = profileRoot.querySelector('[data-cm-photo-trigger]');
    const photoInput = profileRoot.querySelector('[data-cm-photo-input]');
    const avatarImg = profileRoot.querySelector('[data-cm-profile-avatar-img]');
    const avatarInitials = profileRoot.querySelector('[data-cm-profile-initials]');

    let avatarObjectUrl = '';

    const setFormFeedback = (node, message, type = '') => {
      if (!node) return;
      node.textContent = message || '';
      node.classList.remove('cm-form-feedback--success', 'cm-form-feedback--error', 'cm-is-visible');
      if (!message) return;
      node.classList.add('cm-is-visible');
      if (type) node.classList.add(`cm-form-feedback--${type}`);
    };

    const setInputInvalidState = (input, isInvalid) => {
      if (!input) return;
      input.setAttribute('aria-invalid', String(isInvalid));
    };

    profileForm?.addEventListener('submit', (event) => {
      event.preventDefault();
      const requiredFields = Array.from(profileForm.querySelectorAll('[data-cm-required]'));
      const phoneInput = profileForm.querySelector('[data-cm-phone]');

      requiredFields.forEach((input) => setInputInvalidState(input, false));
      setFormFeedback(profileFeedback, '');

      const firstEmpty = requiredFields.find((input) => !String(input.value || '').trim());
      if (firstEmpty) {
        setInputInvalidState(firstEmpty, true);
        setFormFeedback(profileFeedback, 'Completa todos los campos de información personal.', 'error');
        firstEmpty.focus();
        return;
      }

      if (phoneInput && !/^[0-9]{10,15}$/.test(String(phoneInput.value || '').trim())) {
        setInputInvalidState(phoneInput, true);
        setFormFeedback(profileFeedback, 'Ingresa un número de teléfono válido (10 a 15 dígitos).', 'error');
        phoneInput.focus();
        return;
      }

      setFormFeedback(profileFeedback, 'Información personal actualizada correctamente.', 'success');
    });

    passwordForm?.addEventListener('submit', (event) => {
      event.preventDefault();
      const passwordInput = passwordForm.querySelector('[data-cm-password]');
      const confirmInput = passwordForm.querySelector('[data-cm-password-confirm]');
      const passwordValue = String(passwordInput?.value || '');
      const confirmValue = String(confirmInput?.value || '');

      setInputInvalidState(passwordInput, false);
      setInputInvalidState(confirmInput, false);
      setFormFeedback(passwordFeedback, '');

      if (passwordValue.length < 8) {
        setInputInvalidState(passwordInput, true);
        setFormFeedback(passwordFeedback, 'La contraseña debe tener al menos 8 caracteres.', 'error');
        passwordInput?.focus();
        return;
      }

      if (passwordValue !== confirmValue) {
        setInputInvalidState(confirmInput, true);
        setFormFeedback(passwordFeedback, 'La confirmación de contraseña no coincide.', 'error');
        confirmInput?.focus();
        return;
      }

      passwordForm.reset();
      setFormFeedback(passwordFeedback, 'Password actualizado correctamente.', 'success');
    });

    photoTrigger?.addEventListener('click', () => {
      photoInput?.click();
    });

    photoInput?.addEventListener('change', () => {
      const file = photoInput.files?.[0];
      if (!file) return;

      if (!file.type.startsWith('image/')) {
        setFormFeedback(profileFeedback, 'Selecciona una imagen válida para la foto de perfil.', 'error');
        photoInput.value = '';
        return;
      }

      if (avatarObjectUrl) URL.revokeObjectURL(avatarObjectUrl);
      avatarObjectUrl = URL.createObjectURL(file);

      if (avatarImg) {
        avatarImg.src = avatarObjectUrl;
        avatarImg.hidden = false;
      }

      if (avatarInitials) avatarInitials.hidden = true;
      setFormFeedback(profileFeedback, 'Foto de perfil actualizada correctamente.', 'success');
      photoInput.value = '';
    });

    window.addEventListener('beforeunload', () => {
      if (avatarObjectUrl) URL.revokeObjectURL(avatarObjectUrl);
    });
  }

  const referralForm = doc.querySelector('[data-cm-referral-form]');
  if (referralForm) {
    const referralInput = referralForm.querySelector('[data-cm-referral-input]');
    const copyBtn = referralForm.querySelector('[data-cm-copy-btn]');
    const feedback = referralForm.querySelector('[data-cm-copy-feedback]');

    const setFeedback = (message, type = '') => {
      if (!feedback) return;
      feedback.textContent = message;
      feedback.classList.remove('cm-feedback--success', 'cm-feedback--error');
      if (type) feedback.classList.add(type);
    };

    const validateReferral = () => {
      if (!referralInput || !copyBtn) return false;
      const isValid = referralInput.checkValidity();
      referralInput.setAttribute('aria-invalid', String(!isValid));
      copyBtn.disabled = !isValid;
      return isValid;
    };

    referralInput?.addEventListener('input', () => {
      validateReferral();
      setFeedback('');
    });

    referralForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (!referralInput) return;

      const isValid = validateReferral();
      if (!isValid) {
        setFeedback('Ingresa un enlace válido para poder copiarlo.', 'cm-feedback--error');
        referralInput.focus();
        return;
      }

      const value = referralInput.value.trim();

      try {
        if (navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(value);
        } else {
          referralInput.select();
          doc.execCommand('copy');
          referralInput.setSelectionRange(value.length, value.length);
        }
        setFeedback('Enlace copiado al portapapeles.', 'cm-feedback--success');
      } catch (error) {
        setFeedback('No fue posible copiar el enlace. Inténtalo de nuevo.', 'cm-feedback--error');
      }
    });

    validateReferral();
  }

  const walletsRoot = doc.querySelector('[data-cm-wallets]');
  if (walletsRoot) {
    const walletActions = Array.from(walletsRoot.querySelectorAll('[data-cm-wallet-action]'));
    const walletViews = Array.from(walletsRoot.querySelectorAll('[data-cm-wallet-view]'));
    const primaryLabel = walletsRoot.querySelector('[data-cm-wallet-primary-label]');

    const setPrimaryActionLabel = (isDepositActive) => {
      if (!primaryLabel) return;
      const activeLabel = primaryLabel.getAttribute('data-label-active') || 'Depositar a cartera';
      const defaultLabel = primaryLabel.getAttribute('data-label-default') || 'Depositar';
      primaryLabel.textContent = isDepositActive ? activeLabel : defaultLabel;
    };

    const setWalletView = (viewId) => {
      walletActions.forEach((action) => {
        const isActive = action.getAttribute('data-cm-wallet-action') === viewId;
        action.classList.toggle('cm-wallet-action--active', isActive);
        action.setAttribute('aria-pressed', String(isActive));
      });

      walletViews.forEach((view) => {
        const isActive = view.getAttribute('data-cm-wallet-view') === viewId;
        view.classList.toggle('cm-wallet-view--active', isActive);
        view.setAttribute('aria-hidden', String(!isActive));
      });

      setPrimaryActionLabel(viewId === 'deposit');
    };

    walletActions.forEach((action) => {
      action.addEventListener('click', () => {
        const targetView = action.getAttribute('data-cm-wallet-action');
        if (!targetView) return;
        setWalletView(targetView);
      });
    });

    const activeAction =
      walletActions.find((action) => action.classList.contains('cm-wallet-action--active')) ||
      walletActions[0];
    setWalletView(activeAction?.getAttribute('data-cm-wallet-action') || 'deposit');

    const knownRecipients = new Map([
      ['1212312', 'José Rafael Perez'],
      ['0258', 'Usuario MIU 0258'],
      ['20012001', 'Embajador Club Maktub'],
    ]);

    const walletForms = Array.from(walletsRoot.querySelectorAll('[data-cm-wallet-form]'));
    walletForms.forEach((form) => {
      const formType = form.getAttribute('data-cm-wallet-form') || '';
      const amountInput = form.querySelector('[data-cm-wallet-amount]');
      const submitBtn = form.querySelector('[data-cm-wallet-submit]');
      const errorNode = form.querySelector('[data-cm-wallet-error]');
      const successNode = form.querySelector('[data-cm-wallet-success]');
      const showErrorOnLoad = form.getAttribute('data-cm-wallet-show-error') === 'true';
      const availableBalance = Number.parseFloat(form.getAttribute('data-cm-wallet-available') || '');

      const fromSelect = form.querySelector('[data-cm-wallet-from]');
      const toSelect = form.querySelector('[data-cm-wallet-to]');
      const fromChip = form.querySelector('[data-cm-wallet-chip]');
      const fromBalanceNode = form.querySelector('[data-cm-wallet-balance-from]');
      const toBalanceNode = form.querySelector('[data-cm-wallet-balance-to]');
      const clearFromBtn = form.querySelector('[data-cm-wallet-clear-from]');
      const miuInput = form.querySelector('[data-cm-wallet-miu]');
      const recipientNode = form.querySelector('[data-cm-wallet-recipient]');
      const recipientNameNode = form.querySelector('[data-cm-wallet-recipient-name]');

      const minAmountRaw = amountInput ? Number.parseFloat(amountInput.getAttribute('min') || '0') : 0;
      const minAmount = Number.isFinite(minAmountRaw) ? minAmountRaw : 0;

      let userInteracted = showErrorOnLoad;

      const toggleMessage = (node, message) => {
        if (!node) return;
        const hasMessage = Boolean(message);
        node.textContent = message || '';
        node.classList.toggle('cm-is-visible', hasMessage);
      };

      const setInvalid = (input, isInvalid) => {
        if (!input) return;
        input.setAttribute('aria-invalid', String(isInvalid));
        input
          .closest('.cm-wallet-input-wrap, .cm-wallet-select-wrap')
          ?.classList.toggle('cm-is-invalid', isInvalid);
      };

      const formatMinimumLabel = (value) => {
        if (!Number.isFinite(value)) return '0.1 USDT';
        const decimals = Number.isInteger(value) ? 0 : 2;
        return `${value.toFixed(decimals)} USDT`;
      };

      const resetTransferBalances = () => {
        if (fromBalanceNode) fromBalanceNode.textContent = '0.00';
        if (toBalanceNode) toBalanceNode.textContent = '0.00';
      };

      const syncTransferWalletState = () => {
        if (formType !== 'transfer-wallets') return;
        const hasFromValue = Boolean(fromSelect?.value);
        fromChip?.classList.toggle('cm-is-empty', !hasFromValue);
        if (clearFromBtn) clearFromBtn.disabled = !hasFromValue;
        resetTransferBalances();
      };

      const updateRecipientState = () => {
        if (!miuInput || !recipientNode) return '';
        const miu = miuInput.value.trim();
        const recipientName = knownRecipients.get(miu) || '';
        recipientNode.classList.toggle('cm-is-visible', Boolean(recipientName));
        if (recipientNameNode && recipientName) {
          recipientNameNode.textContent = `Le transferirá a ${recipientName}`;
        }
        if (!recipientName && recipientNameNode) {
          recipientNameNode.textContent = '';
        }
        return recipientName;
      };

      const getAmountValidation = () => {
        if (!amountInput) return { valid: true, message: '' };
        const parsed = Number.parseFloat(amountInput.value);
        if (!Number.isFinite(parsed) || parsed < minAmount) {
          return {
            valid: false,
            message: `Ingresa una cantidad válida, mínimo ${formatMinimumLabel(minAmount)}.`,
          };
        }
        if (formType === 'withdraw' && Number.isFinite(availableBalance) && parsed > availableBalance) {
          return {
            valid: false,
            message: `El monto excede el saldo disponible de ${availableBalance.toFixed(2)} USDT.`,
          };
        }
        return { valid: true, message: '' };
      };

      const validateCurrentForm = () => {
        const validation = {
          valid: true,
          message: '',
          firstInvalidInput: null,
        };

        if (formType === 'transfer-wallets') {
          const from = fromSelect?.value || '';
          const to = toSelect?.value || '';
          setInvalid(fromSelect, false);
          setInvalid(toSelect, false);

          if (!from || !to) {
            validation.valid = false;
            validation.message = 'Selecciona las carteras de origen y destino.';
            validation.firstInvalidInput = !from ? fromSelect : toSelect;
            setInvalid(validation.firstInvalidInput, true);
            return validation;
          }
          if (from === to) {
            validation.valid = false;
            validation.message = 'La cartera de origen debe ser diferente a la cartera de destino.';
            validation.firstInvalidInput = toSelect;
            setInvalid(fromSelect, true);
            setInvalid(toSelect, true);
            return validation;
          }
        }

        if (formType === 'transfer-user' && miuInput) {
          const miu = miuInput.value.trim();
          const hasValidPattern = /^[0-9]{6,10}$/.test(miu);
          const recipientName = updateRecipientState();
          setInvalid(miuInput, false);

          if (!hasValidPattern) {
            validation.valid = false;
            validation.message = 'Ingresa un MIU válido de 6 a 10 dígitos.';
            validation.firstInvalidInput = miuInput;
            setInvalid(miuInput, true);
            return validation;
          }
          if (!recipientName) {
            validation.valid = false;
            validation.message = 'No encontramos el MIU del destinatario.';
            validation.firstInvalidInput = miuInput;
            setInvalid(miuInput, true);
            return validation;
          }
        } else if (miuInput) {
          updateRecipientState();
        }

        const amountValidation = getAmountValidation();
        setInvalid(amountInput, !amountValidation.valid);
        if (!amountValidation.valid) {
          validation.valid = false;
          validation.message = amountValidation.message;
          validation.firstInvalidInput = amountInput;
          return validation;
        }

        return validation;
      };

      const getSuccessMessage = () => {
        if (formType === 'deposit') return 'Solicitud de fondeo enviada.';
        if (formType === 'transfer-wallets') return 'Transferencia entre carteras creada.';
        if (formType === 'transfer-user') return 'Transferencia a usuario enviada.';
        if (formType === 'withdraw') return 'Solicitud de retiro enviada.';
        return 'Operación enviada correctamente.';
      };

      const renderFormState = ({ showErrors } = { showErrors: false }) => {
        const result = validateCurrentForm();
        if (showErrors && !result.valid) {
          toggleMessage(errorNode, result.message);
          toggleMessage(successNode, '');
        } else {
          toggleMessage(errorNode, '');
        }
      };

      clearFromBtn?.addEventListener('click', () => {
        if (fromSelect) {
          fromSelect.value = '';
          userInteracted = true;
          toggleMessage(successNode, '');
          syncTransferWalletState();
          renderFormState({ showErrors: true });
        }
      });

      [amountInput, fromSelect, toSelect, miuInput].forEach((field) => {
        field?.addEventListener('input', () => {
          userInteracted = true;
          toggleMessage(successNode, '');
          syncTransferWalletState();
          renderFormState({ showErrors: userInteracted });
        });
        field?.addEventListener('change', () => {
          userInteracted = true;
          toggleMessage(successNode, '');
          syncTransferWalletState();
          renderFormState({ showErrors: userInteracted });
        });
      });

      form.addEventListener('submit', (event) => {
        event.preventDefault();
        userInteracted = true;
        const result = validateCurrentForm();
        if (!result.valid) {
          toggleMessage(errorNode, result.message);
          toggleMessage(successNode, '');
          result.firstInvalidInput?.focus();
          return;
        }

        toggleMessage(errorNode, '');
        toggleMessage(successNode, getSuccessMessage());
      });

      syncTransferWalletState();
      renderFormState({ showErrors: showErrorOnLoad });
      if (submitBtn) submitBtn.disabled = false;
    });
  }

  const referralsRoot = doc.querySelector('[data-cm-referrals]');
  if (referralsRoot) {
    const multiselects = Array.from(referralsRoot.querySelectorAll('[data-cm-multiselect]')).map((node) => ({
      key: node.getAttribute('data-cm-multiselect') || '',
      node,
      trigger: node.querySelector('[data-cm-ms-trigger]'),
      menu: node.querySelector('[data-cm-ms-menu]'),
      valueNode: node.querySelector('[data-cm-ms-value]'),
      inputs: Array.from(node.querySelectorAll('[data-cm-ms-option]')),
    }));
    const searchInput = referralsRoot.querySelector('[data-cm-ref-search]');
    const pageSizeSelect = referralsRoot.querySelector('[data-cm-ref-page-size]');
    const clearBtn = referralsRoot.querySelector('[data-cm-ref-clear]');
    const tableBody = referralsRoot.querySelector('[data-cm-ref-table-body]');
    const cardsBody = referralsRoot.querySelector('[data-cm-ref-cards]');
    const emptyState = referralsRoot.querySelector('[data-cm-ref-empty]');
    const resultsNode = referralsRoot.querySelector('[data-cm-ref-results]');
    const pageNode = referralsRoot.querySelector('[data-cm-ref-page]');
    const prevBtn = referralsRoot.querySelector('[data-cm-ref-prev]');
    const nextBtn = referralsRoot.querySelector('[data-cm-ref-next]');
    const activeFiltersNode = referralsRoot.querySelector('[data-cm-ref-active]');
    const announcerNode = referralsRoot.querySelector('[data-cm-ref-announcer]');

    const referralsData = [
      { id: 'REF-1001', name: 'Shaula Barenca', generation: 1, miu: 5, directos: 11, membership: 'Elite', status: 'Activo', fidActive: true, conexActive: true, avatar: 'assets/img/referido-avatar.png' },
      { id: 'REF-1002', name: 'Camila Ortega', generation: 1, miu: 8, directos: 7, membership: 'Premium', status: 'Activo', fidActive: true, conexActive: false, avatar: 'assets/img/referido-avatar.png' },
      { id: 'REF-1003', name: 'Mateo Giner', generation: 1, miu: 3, directos: 2, membership: 'Esencial', status: 'No activo', fidActive: false, conexActive: false, avatar: 'assets/img/referido-avatar.png' },
      { id: 'REF-1004', name: 'Valentina Ruiz', generation: 1, miu: 12, directos: 9, membership: 'Elite', status: 'Activo', fidActive: true, conexActive: true, avatar: 'assets/img/referido-avatar.png' },
      { id: 'REF-1005', name: 'Sebastian Prado', generation: 2, miu: 4, directos: 5, membership: 'Premium', status: 'No activo', fidActive: false, conexActive: true, avatar: 'assets/img/referido-avatar.png' },
      { id: 'REF-1006', name: 'Luciana Soto', generation: 2, miu: 6, directos: 8, membership: 'Elite', status: 'Activo', fidActive: true, conexActive: true, avatar: 'assets/img/referido-avatar.png' },
      { id: 'REF-1007', name: 'Hector Salas', generation: 2, miu: 10, directos: 6, membership: 'Premium', status: 'Activo', fidActive: true, conexActive: false, avatar: 'assets/img/referido-avatar.png' },
      { id: 'REF-1008', name: 'Regina Acosta', generation: 2, miu: 2, directos: 3, membership: 'Esencial', status: 'No activo', fidActive: false, conexActive: false, avatar: 'assets/img/referido-avatar.png' },
      { id: 'REF-1009', name: 'Diego Cardenas', generation: 3, miu: 9, directos: 4, membership: 'Premium', status: 'Activo', fidActive: true, conexActive: true, avatar: 'assets/img/referido-avatar.png' },
      { id: 'REF-1010', name: 'Nadia Fuentes', generation: 3, miu: 13, directos: 12, membership: 'Elite', status: 'Activo', fidActive: true, conexActive: true, avatar: 'assets/img/referido-avatar.png' },
      { id: 'REF-1011', name: 'Bruno Almeida', generation: 3, miu: 7, directos: 5, membership: 'Esencial', status: 'No activo', fidActive: true, conexActive: false, avatar: 'assets/img/referido-avatar.png' },
      { id: 'REF-1012', name: 'Mia Villasenor', generation: 3, miu: 1, directos: 1, membership: 'Esencial', status: 'No activo', fidActive: false, conexActive: false, avatar: 'assets/img/referido-avatar.png' },
      { id: 'REF-1013', name: 'Andres Lujan', generation: 4, miu: 14, directos: 15, membership: 'Elite', status: 'Activo', fidActive: true, conexActive: true, avatar: 'assets/img/referido-avatar.png' },
      { id: 'REF-1014', name: 'Daniela Ponce', generation: 4, miu: 11, directos: 10, membership: 'Premium', status: 'Activo', fidActive: false, conexActive: true, avatar: 'assets/img/referido-avatar.png' },
      { id: 'REF-1015', name: 'Emilio Valdes', generation: 4, miu: 5, directos: 4, membership: 'Esencial', status: 'No activo', fidActive: false, conexActive: false, avatar: 'assets/img/referido-avatar.png' },
      { id: 'REF-1016', name: 'Paula Ibarra', generation: 4, miu: 8, directos: 6, membership: 'Premium', status: 'Activo', fidActive: true, conexActive: true, avatar: 'assets/img/referido-avatar.png' },
    ];

    const defaultFilterLabels = { generation: 'Todas', miu: 'Todos', membership: 'Todas', status: 'Todos' };

    const filterLabelMap = {
      generation: { 1: 'Generación 1', 2: 'Generación 2', 3: 'Generación 3', 4: 'Generación 4' },
      miu: { '0-4': '0 a 4', '5-8': '5 a 8', '9-12': '9 a 12', '13+': '13 o más' },
      membership: { Elite: 'Elite', Premium: 'Premium', Esencial: 'Esencial' },
      status: { Activo: 'Activos', 'No activo': 'No activos' },
    };

    const escapeHtml = (value) =>
      String(value).replace(/[&<>"']/g, (char) => {
        const entities = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
        return entities[char] || char;
      });

    const normalizeValue = (value) =>
      String(value || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');

    const getSelections = (key) =>
      multiselects.find((multiselect) => multiselect.key === key)?.inputs
        .filter((input) => input.checked)
        .map((input) => input.value) || [];

    const setMultiselectState = (multiselect, isOpen) => {
      multiselect.node.classList.toggle('cm-is-open', isOpen);
      if (multiselect.menu) multiselect.menu.hidden = !isOpen;
      multiselect.trigger?.setAttribute('aria-expanded', String(isOpen));
    };

    const closeAllMultiselects = (exceptKey = '') => {
      multiselects.forEach((multiselect) => {
        if (multiselect.key === exceptKey) return;
        setMultiselectState(multiselect, false);
      });
    };

    const formatTriggerValue = (key, values) => {
      if (!values.length) return defaultFilterLabels[key] || 'Todos';
      if (values.length === 1) return filterLabelMap[key]?.[values[0]] || values[0];
      return `${values.length} seleccionados`;
    };

    const syncTriggerValues = () => {
      multiselects.forEach((multiselect) => {
        if (!multiselect.valueNode) return;
        multiselect.valueNode.textContent = formatTriggerValue(multiselect.key, getSelections(multiselect.key));
      });
    };

    const matchesMiuRange = (miu, range) => {
      if (range === '0-4') return miu >= 0 && miu <= 4;
      if (range === '5-8') return miu >= 5 && miu <= 8;
      if (range === '9-12') return miu >= 9 && miu <= 12;
      if (range === '13+') return miu >= 13;
      return true;
    };

    let currentPage = 1;

    const getFilteredReferrals = () => {
      const generationFilters = getSelections('generation');
      const miuFilters = getSelections('miu');
      const membershipFilters = getSelections('membership');
      const statusFilters = getSelections('status');
      const searchTerm = normalizeValue(searchInput?.value || '');

      return referralsData
        .filter((referral) => {
          if (generationFilters.length && !generationFilters.includes(String(referral.generation))) return false;
          if (miuFilters.length && !miuFilters.some((range) => matchesMiuRange(referral.miu, range))) return false;
          if (membershipFilters.length && !membershipFilters.includes(referral.membership)) return false;
          if (statusFilters.length && !statusFilters.includes(referral.status)) return false;

          if (searchTerm) {
            const searchable = normalizeValue(
              `${referral.id} ${referral.name} ${referral.membership} ${referral.status} ${referral.generation} ${referral.miu} ${referral.directos}`
            );
            if (!searchable.includes(searchTerm)) return false;
          }

          return true;
        })
        .sort(
          (left, right) => left.generation - right.generation || right.miu - left.miu || left.name.localeCompare(right.name)
        );
    };

    const servicePillsMarkup = (referral) => `
      <div class="cm-referrals__services" aria-label="Servicios de ${escapeHtml(referral.name)}">
        <span class="cm-referrals__pill ${referral.fidActive ? 'cm-referrals__pill--fid' : 'cm-referrals__pill--inactive'}">Curso FID</span>
        <span class="cm-referrals__pill ${referral.conexActive ? 'cm-referrals__pill--conex' : 'cm-referrals__pill--inactive'}">CONEX</span>
      </div>
    `;

    const actionMarkup = (referral) => {
      const isActive = referral.status === 'Activo';
      return `
        <button
          class="cm-referrals__action ${isActive ? 'cm-referrals__action--active' : ''}"
          type="button"
          data-cm-ref-action
          data-id="${escapeHtml(referral.id)}"
          ${isActive ? 'disabled' : ''}
        >
          ${isActive ? 'Activo' : 'Activar'}
        </button>
      `;
    };

    const renderTableRows = (rows) => {
      if (!tableBody) return;

      tableBody.innerHTML = rows
        .map((referral) => {
          const stateClass =
            referral.status === 'Activo' ? 'cm-referrals__state-badge--active' : 'cm-referrals__state-badge--inactive';

          return `
            <article class="cm-referrals__row cm-referrals__table-row" role="row">
              <div class="cm-referrals__cell" role="cell">
                <div class="cm-referrals__person">
                  <div class="cm-referrals__avatar-wrap" aria-hidden="true">
                    <img class="cm-referrals__avatar" src="${escapeHtml(referral.avatar)}" alt="" width="48" height="48" />
                  </div>
                  <div class="cm-referrals__person-copy">
                    <p class="cm-referrals__person-name">${escapeHtml(referral.name)}</p>
                    <p class="cm-referrals__person-id">${escapeHtml(referral.id)}</p>
                  </div>
                </div>
              </div>
              <div class="cm-referrals__cell" role="cell">
                <span class="cm-referrals__generation-badge">G${escapeHtml(referral.generation)}</span>
              </div>
              <div class="cm-referrals__cell" role="cell">${escapeHtml(referral.miu)}</div>
              <div class="cm-referrals__cell" role="cell">${escapeHtml(referral.directos)}</div>
              <div class="cm-referrals__cell" role="cell">
                <span class="cm-referrals__membership-badge">${escapeHtml(referral.membership)}</span>
              </div>
              <div class="cm-referrals__cell" role="cell">
                <span class="cm-referrals__state-badge ${stateClass}">${escapeHtml(referral.status)}</span>
              </div>
              <div class="cm-referrals__cell" role="cell">${servicePillsMarkup(referral)}</div>
              <div class="cm-referrals__cell" role="cell">${actionMarkup(referral)}</div>
            </article>
          `;
        })
        .join('');
    };

    const renderCards = (rows) => {
      if (!cardsBody) return;

      cardsBody.innerHTML = rows
        .map((referral) => {
          const stateClass =
            referral.status === 'Activo' ? 'cm-referrals__state-badge--active' : 'cm-referrals__state-badge--inactive';

          return `
            <article class="cm-referrals__card">
              <div class="cm-referrals__card-top">
                <div class="cm-referrals__person">
                  <div class="cm-referrals__avatar-wrap" aria-hidden="true">
                    <img class="cm-referrals__avatar" src="${escapeHtml(referral.avatar)}" alt="" width="48" height="48" />
                  </div>
                  <div class="cm-referrals__person-copy">
                    <p class="cm-referrals__person-name">${escapeHtml(referral.name)}</p>
                    <p class="cm-referrals__person-id">${escapeHtml(referral.id)}</p>
                  </div>
                </div>
                <span class="cm-referrals__state-badge ${stateClass}">${escapeHtml(referral.status)}</span>
              </div>

              <div class="cm-referrals__card-meta">
                <span class="cm-referrals__generation-badge">G${escapeHtml(referral.generation)}</span>
                <span class="cm-referrals__membership-badge">${escapeHtml(referral.membership)}</span>
              </div>

              <div class="cm-referrals__card-grid">
                <div class="cm-referrals__card-item">
                  <p class="cm-referrals__card-label">MIU</p>
                  <p class="cm-referrals__card-value">${escapeHtml(referral.miu)}</p>
                </div>
                <div class="cm-referrals__card-item">
                  <p class="cm-referrals__card-label">Directos</p>
                  <p class="cm-referrals__card-value">${escapeHtml(referral.directos)}</p>
                </div>
                <div class="cm-referrals__card-item">
                  <p class="cm-referrals__card-label">Membresía</p>
                  <p class="cm-referrals__card-value">${escapeHtml(referral.membership)}</p>
                </div>
                <div class="cm-referrals__card-item">
                  <p class="cm-referrals__card-label">Generación</p>
                  <p class="cm-referrals__card-value">Generación ${escapeHtml(referral.generation)}</p>
                </div>
              </div>

              <div class="cm-referrals__card-item">
                <p class="cm-referrals__card-label">Servicios</p>
                ${servicePillsMarkup(referral)}
              </div>

              ${actionMarkup(referral)}
            </article>
          `;
        })
        .join('');
    };

    const renderActiveFilters = () => {
      if (!activeFiltersNode) return;

      const chips = [];
      multiselects.forEach((multiselect) => {
        getSelections(multiselect.key).forEach((value) => {
          chips.push({
            key: multiselect.key,
            value,
            label: `${multiselect.trigger?.querySelector('.cm-ref-select__label')?.textContent || multiselect.key}: ${
              filterLabelMap[multiselect.key]?.[value] || value
            }`,
          });
        });
      });

      const searchValue = String(searchInput?.value || '').trim();
      if (searchValue) chips.push({ key: 'search', value: '__search__', label: `Búsqueda: ${searchValue}` });

      activeFiltersNode.innerHTML = chips
        .map(
          (chip) => `
            <button
              type="button"
              class="cm-referrals__chip"
              data-cm-ref-chip
              data-key="${escapeHtml(chip.key)}"
              data-value="${escapeHtml(chip.value)}"
            >
              ${escapeHtml(chip.label)}
            </button>
          `
        )
        .join('');
      activeFiltersNode.hidden = chips.length === 0;

      if (clearBtn) clearBtn.disabled = chips.length === 0;
    };

    const setPaginationState = (current, total) => {
      if (pageNode) pageNode.textContent = `Página ${current} / ${total}`;
      if (prevBtn) prevBtn.disabled = current <= 1;
      if (nextBtn) nextBtn.disabled = current >= total;
    };

    const renderReferrals = (announcement = '') => {
      const filtered = getFilteredReferrals();
      const total = filtered.length;
      const pageSize = Number.parseInt(pageSizeSelect?.value || '8', 10) || 8;
      const totalPages = Math.max(1, Math.ceil(total / pageSize));

      if (currentPage > totalPages) currentPage = totalPages;
      if (currentPage < 1) currentPage = 1;

      const sliceStart = (currentPage - 1) * pageSize;
      const pageItems = filtered.slice(sliceStart, sliceStart + pageSize);

      renderActiveFilters();
      renderTableRows(pageItems);
      renderCards(pageItems);

      if (emptyState) emptyState.hidden = pageItems.length !== 0;

      if (resultsNode) {
        if (total === 0) {
          resultsNode.textContent = 'Mostrando 0-0 de 0 resultados';
        } else {
          resultsNode.textContent = `Mostrando ${sliceStart + 1}-${sliceStart + pageItems.length} de ${total} resultados`;
        }
      }

      if (announcerNode) {
        announcerNode.textContent =
          announcement || (total === 0 ? 'No hay referidos disponibles con los filtros elegidos.' : `${total} referidos encontrados.`);
      }

      setPaginationState(currentPage, totalPages);
    };

    const resetFilters = (announcement = 'Se limpiaron los filtros.') => {
      if (searchInput) searchInput.value = '';
      multiselects.forEach((multiselect) => {
        multiselect.inputs.forEach((input) => {
          input.checked = false;
        });
        setMultiselectState(multiselect, false);
      });
      syncTriggerValues();
      currentPage = 1;
      renderReferrals(announcement);
    };

    const activateReferral = (id) => {
      const referral = referralsData.find((item) => item.id === id);
      if (!referral || referral.status === 'Activo') return;

      referral.status = 'Activo';
      currentPage = 1;
      renderReferrals(`${referral.name} ahora aparece como activo.`);
    };

    multiselects.forEach((multiselect) => {
      multiselect.trigger?.addEventListener('click', (event) => {
        event.stopPropagation();
        const isOpen = multiselect.node.classList.contains('cm-is-open');
        closeAllMultiselects(isOpen ? multiselect.key : '');
        setMultiselectState(multiselect, !isOpen);
      });

      multiselect.inputs.forEach((input) => {
        input.addEventListener('change', () => {
          currentPage = 1;
          syncTriggerValues();
          renderReferrals();
        });
      });
    });

    searchInput?.addEventListener('input', () => {
      currentPage = 1;
      renderReferrals();
    });

    pageSizeSelect?.addEventListener('change', () => {
      currentPage = 1;
      renderReferrals();
    });

    clearBtn?.addEventListener('click', () => {
      resetFilters();
    });

    prevBtn?.addEventListener('click', () => {
      if (currentPage <= 1) return;
      currentPage -= 1;
      renderReferrals();
    });

    nextBtn?.addEventListener('click', () => {
      currentPage += 1;
      renderReferrals();
    });

    referralsRoot.addEventListener('click', (event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;

      const chip = target.closest('[data-cm-ref-chip]');
      if (chip instanceof HTMLElement) {
        const key = chip.getAttribute('data-key') || '';
        const value = chip.getAttribute('data-value') || '';

        if (key === 'search') {
          if (searchInput) searchInput.value = '';
        } else {
          const multiselect = multiselects.find((item) => item.key === key);
          multiselect?.inputs.forEach((input) => {
            if (input.value === value) input.checked = false;
          });
          syncTriggerValues();
        }

        currentPage = 1;
        renderReferrals();
        return;
      }

      const actionBtn = target.closest('[data-cm-ref-action]');
      if (actionBtn instanceof HTMLButtonElement && !actionBtn.disabled) {
        activateReferral(actionBtn.getAttribute('data-id') || '');
      }
    });

    doc.addEventListener('click', (event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (target.closest('[data-cm-multiselect]')) return;
      closeAllMultiselects();
    });

    doc.addEventListener('keydown', (event) => {
      if (event.key !== 'Escape') return;
      closeAllMultiselects();
    });

    syncTriggerValues();
    renderReferrals();
  }

  const transactionsRoot = doc.querySelector('[data-cm-transactions]');
  if (transactionsRoot) {
    const typeSelect = transactionsRoot.querySelector('[data-cm-tx-type]');
    const searchInput = transactionsRoot.querySelector('[data-cm-tx-search]');
    const dateInput = transactionsRoot.querySelector('[data-cm-tx-date]');
    const exportBtn = transactionsRoot.querySelector('[data-cm-tx-export]');
    const tableBody = transactionsRoot.querySelector('[data-cm-tx-table-body]');
    const cardsBody = transactionsRoot.querySelector('[data-cm-tx-cards]');
    const emptyState = transactionsRoot.querySelector('[data-cm-tx-empty]');
    const resultsNode = transactionsRoot.querySelector('[data-cm-tx-results]');
    const pageNode = transactionsRoot.querySelector('[data-cm-tx-page]');
    const prevBtn = transactionsRoot.querySelector('[data-cm-tx-prev]');
    const nextBtn = transactionsRoot.querySelector('[data-cm-tx-next]');

    const transactionsData = [
      {
        id: 'TX-1001',
        type: 'Comision membresía',
        description: 'MIU 258 G2',
        date: '2025-11-07 09:35:55',
        amount: '- 500.00 USDT',
        amountTone: 'negative',
        status: 'Completado',
      },
      {
        id: 'TX-1002',
        type: 'Retiro',
        description: 'Retiro a CaDes',
        date: '2025-11-04 18:45:22',
        amount: '+ 25.00 USDT',
        amountTone: 'positive',
        status: 'Pendiente',
      },
      {
        id: 'TX-1003',
        type: 'Comision tokens',
        description: 'MIU 258 Ronda B2',
        date: '2028-11-01 09:35:55',
        amount: '- 100.00 USDT',
        amountTone: 'negative',
        status: 'Completado',
      },
      {
        id: 'TX-1004',
        type: 'Depósito club',
        description: 'Deposito a cartera',
        date: '2025-11-10 14:20:00',
        amount: '+ 1000.00 USDT',
        amountTone: 'positive',
        status: 'Completado',
      },
      {
        id: 'TX-1005',
        type: 'Conexión CONEX',
        description: 'Nueva conexión ID 0001',
        date: '2025-11-12 11:15:30',
        amount: '- 50.00 USDT',
        amountTone: 'negative',
        status: 'Pendiente',
      },
      {
        id: 'TX-1006',
        type: 'Comision membresía',
        description: 'MIU 842 G1',
        date: '2025-10-21 07:18:43',
        amount: '+ 75.00 USDT',
        amountTone: 'positive',
        status: 'Completado',
      },
      {
        id: 'TX-1007',
        type: 'Retiro',
        description: 'Retiro a wallet externa',
        date: '2025-10-18 22:02:11',
        amount: '- 130.00 USDT',
        amountTone: 'negative',
        status: 'Pendiente',
      },
      {
        id: 'TX-1008',
        type: 'Comision tokens',
        description: 'MIU 884 Ronda B3',
        date: '2025-10-14 17:48:02',
        amount: '+ 60.00 USDT',
        amountTone: 'positive',
        status: 'Completado',
      },
      {
        id: 'TX-1009',
        type: 'Depósito club',
        description: 'Fondeo inicial',
        date: '2025-10-12 09:10:00',
        amount: '+ 300.00 USDT',
        amountTone: 'positive',
        status: 'Completado',
      },
      {
        id: 'TX-1010',
        type: 'Conexión CONEX',
        description: 'Nueva conexión ID 0002',
        date: '2025-10-08 20:25:44',
        amount: '- 50.00 USDT',
        amountTone: 'negative',
        status: 'Pendiente',
      },
      {
        id: 'TX-1011',
        type: 'Comision membresía',
        description: 'MIU 125 G3',
        date: '2025-09-30 13:05:12',
        amount: '+ 120.00 USDT',
        amountTone: 'positive',
        status: 'Completado',
      },
      {
        id: 'TX-1012',
        type: 'Depósito club',
        description: 'Aporte extraordinario',
        date: '2025-09-25 08:44:20',
        amount: '+ 500.00 USDT',
        amountTone: 'positive',
        status: 'Completado',
      },
    ];

    const typeIconMap = {
      'Comision membresía': 'assets/icons/icon-membresia.svg',
      Retiro: 'assets/icons/icon-retirar.svg',
      'Comision tokens': 'assets/icons/icon-transferir.svg',
      'Depósito club': 'assets/icons/icon-depositar.svg',
      'Conexión CONEX': 'assets/icons/icon-users-round.svg',
    };

    const escapeHtml = (value) =>
      String(value).replace(/[&<>"']/g, (char) => {
        const entities = {
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#39;',
        };
        return entities[char] || char;
      });

    const normalizeValue = (value) =>
      String(value || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');

    const parseTransactionDate = (rawDate) => {
      const [datePart, timePart = '00:00:00'] = String(rawDate).split(' ');
      const [year, month, day] = datePart.split('-').map((part) => Number.parseInt(part, 10));
      const [hour, minute, second] = timePart.split(':').map((part) => Number.parseInt(part, 10));
      return new Date(year, (month || 1) - 1, day || 1, hour || 0, minute || 0, second || 0, 0);
    };

    const pageSizeByViewport = () => (window.innerWidth <= 991.98 ? 4 : 5);

    let currentPage = 1;
    let dateRangeStart = null;
    let dateRangeEnd = null;

    const renderTableRows = (rows) => {
      if (!tableBody) return;
      tableBody.innerHTML = rows
        .map((transaction) => {
          const amountToneClass =
            transaction.amountTone === 'positive' ? 'cm-tx-row__amount--positive' : 'cm-tx-row__amount--negative';
          const statusClass =
            transaction.status === 'Completado' ? 'cm-tx-badge--completed' : 'cm-tx-badge--pending';
          const icon = typeIconMap[transaction.type] || 'assets/icons/icon-transacciones.svg';

          return `
            <article class="cm-tx-row" role="row">
              <div class="cm-tx-row__icon-cell" role="cell">
                <span class="cm-tx-row__icon-wrap" aria-hidden="true">
                  <img src="${escapeHtml(icon)}" alt="" />
                </span>
              </div>
              <div class="cm-tx-row__concept" role="cell">${escapeHtml(transaction.type)}</div>
              <div class="cm-tx-row__desc" role="cell">${escapeHtml(transaction.description)}</div>
              <div class="cm-tx-row__date" role="cell">${escapeHtml(transaction.date)}</div>
              <div class="cm-tx-row__amount ${amountToneClass}" role="cell">${escapeHtml(transaction.amount)}</div>
              <div class="cm-tx-row__status" role="cell">
                <span class="cm-tx-badge ${statusClass}">${escapeHtml(transaction.status)}</span>
              </div>
            </article>
          `;
        })
        .join('');
    };

    const renderCards = (rows) => {
      if (!cardsBody) return;
      cardsBody.innerHTML = rows
        .map((transaction) => {
          const amountToneClass =
            transaction.amountTone === 'positive' ? 'cm-tx-row__amount--positive' : 'cm-tx-row__amount--negative';
          const statusClass =
            transaction.status === 'Completado' ? 'cm-tx-badge--completed' : 'cm-tx-badge--pending';
          const icon = typeIconMap[transaction.type] || 'assets/icons/icon-transacciones.svg';

          return `
            <article class="cm-tx-card">
              <div class="cm-tx-card__top">
                <div class="cm-tx-card__left">
                  <span class="cm-tx-row__icon-wrap" aria-hidden="true">
                    <img src="${escapeHtml(icon)}" alt="" />
                  </span>
                  <div>
                    <p class="cm-tx-card__title">${escapeHtml(transaction.type)}</p>
                    <p class="cm-tx-card__desc">${escapeHtml(transaction.description)}</p>
                  </div>
                </div>
                <span class="cm-tx-badge ${statusClass}">${escapeHtml(transaction.status)}</span>
              </div>
              <div class="cm-tx-card__meta">
                <p class="cm-tx-card__date">${escapeHtml(transaction.date)}</p>
                <p class="cm-tx-card__amount ${amountToneClass}">${escapeHtml(transaction.amount)}</p>
              </div>
            </article>
          `;
        })
        .join('');
    };

    const getFilteredTransactions = () => {
      const selectedType = typeSelect?.value || '';
      const searchTerm = normalizeValue(searchInput?.value || '');

      return transactionsData.filter((transaction) => {
        if (selectedType && transaction.type !== selectedType) return false;

        if (searchTerm) {
          const searchable = normalizeValue(
            `${transaction.id} ${transaction.type} ${transaction.description} ${transaction.date} ${transaction.amount} ${transaction.status}`
          );
          if (!searchable.includes(searchTerm)) return false;
        }

        const transactionDate = parseTransactionDate(transaction.date);
        if (dateRangeStart && transactionDate < dateRangeStart) return false;
        if (dateRangeEnd && transactionDate > dateRangeEnd) return false;

        return true;
      });
    };

    const setPaginationState = (current, total) => {
      if (pageNode) pageNode.textContent = `Página ${current} / ${total}`;
      if (prevBtn) prevBtn.disabled = current <= 1;
      if (nextBtn) nextBtn.disabled = current >= total;
    };

    const renderTransactions = () => {
      const filtered = getFilteredTransactions();
      const pageSize = pageSizeByViewport();
      const total = filtered.length;
      const totalPages = Math.max(1, Math.ceil(total / pageSize));
      if (currentPage > totalPages) currentPage = totalPages;
      if (currentPage < 1) currentPage = 1;

      const sliceStart = (currentPage - 1) * pageSize;
      const pageItems = filtered.slice(sliceStart, sliceStart + pageSize);

      renderTableRows(pageItems);
      renderCards(pageItems);

      if (emptyState) emptyState.hidden = pageItems.length !== 0;

      if (resultsNode) {
        if (total === 0) {
          resultsNode.textContent = 'Mostrando 0-0 de 0 resultados';
        } else {
          const start = sliceStart + 1;
          const end = sliceStart + pageItems.length;
          resultsNode.textContent = `Mostrando ${start}-${end} de ${total} resultados`;
        }
      }

      setPaginationState(currentPage, totalPages);
      return filtered;
    };

    const csvValue = (value) => `"${String(value).replace(/"/g, '""')}"`;

    typeSelect?.addEventListener('change', () => {
      currentPage = 1;
      renderTransactions();
    });

    searchInput?.addEventListener('input', () => {
      currentPage = 1;
      renderTransactions();
    });

    prevBtn?.addEventListener('click', () => {
      if (currentPage <= 1) return;
      currentPage -= 1;
      renderTransactions();
    });

    nextBtn?.addEventListener('click', () => {
      currentPage += 1;
      renderTransactions();
    });

    if (typeof window.flatpickr === 'function' && dateInput) {
      const localeEs = window.flatpickr.l10ns?.es || 'default';
      window.flatpickr(dateInput, {
        mode: 'range',
        dateFormat: 'd/m/Y',
        locale: localeEs,
        allowInput: true,
        onChange: (selectedDates) => {
          if (selectedDates.length === 0) {
            dateRangeStart = null;
            dateRangeEnd = null;
          } else if (selectedDates.length === 1) {
            const start = new Date(selectedDates[0]);
            dateRangeStart = new Date(start.getFullYear(), start.getMonth(), start.getDate(), 0, 0, 0, 0);
            dateRangeEnd = new Date(start.getFullYear(), start.getMonth(), start.getDate(), 23, 59, 59, 999);
          } else {
            const start = selectedDates[0];
            const end = selectedDates[1];
            dateRangeStart = new Date(start.getFullYear(), start.getMonth(), start.getDate(), 0, 0, 0, 0);
            dateRangeEnd = new Date(end.getFullYear(), end.getMonth(), end.getDate(), 23, 59, 59, 999);
          }
          currentPage = 1;
          renderTransactions();
        },
      });
    }

    exportBtn?.addEventListener('click', () => {
      const filtered = getFilteredTransactions();
      const header = ['ID', 'Concepto', 'Descripcion', 'Fecha', 'Monto', 'Estado'];
      const rows = filtered.map((transaction) => [
        transaction.id,
        transaction.type,
        transaction.description,
        transaction.date,
        transaction.amount,
        transaction.status,
      ]);
      const csv = [header, ...rows].map((line) => line.map(csvValue).join(',')).join('\n');
      const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = doc.createElement('a');
      const today = new Date().toISOString().slice(0, 10);
      link.href = url;
      link.download = `transacciones-${today}.csv`;
      doc.body.append(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    });

    let currentPageSize = pageSizeByViewport();
    window.addEventListener('resize', () => {
      const nextPageSize = pageSizeByViewport();
      if (nextPageSize === currentPageSize) return;
      currentPageSize = nextPageSize;
      currentPage = 1;
      renderTransactions();
    });

    renderTransactions();
  }

  if (typeof window.Chart === 'undefined') return;

  const getToken = (token) => getComputedStyle(doc.documentElement).getPropertyValue(token).trim();

  const chartPalette = {
    grid: getToken('--cm-chart-grid'),
    axis: getToken('--cm-chart-axis'),
    blue: getToken('--cm-chart-blue'),
    blueSoft: getToken('--cm-chart-blue-soft'),
    navy: getToken('--cm-chart-navy'),
    line: getToken('--cm-chart-line'),
  };

  const chartFont = {
    family: getToken('--cm-font-body') || 'Satoshi, sans-serif',
  };

  const membersChartCanvas = doc.getElementById('cm-members-chart');
  if (membersChartCanvas) {
    new Chart(membersChartCanvas, {
      type: 'bar',
      data: {
        labels: ['G1: 10 Miembros', 'G2: 5 Miembros', 'G3: 15 Miembros'],
        datasets: [
          {
            data: [58, 84, 20],
            backgroundColor: [chartPalette.blue, chartPalette.blueSoft, chartPalette.blue],
            borderRadius: 4,
            barThickness: 34,
          },
        ],
      },
      options: {
        maintainAspectRatio: false,
        animation: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            displayColors: false,
            callbacks: {
              label: (context) => `${context.raw} miembros`,
            },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: {
              color: chartPalette.axis,
              maxRotation: 0,
              autoSkip: false,
              font: { ...chartFont, size: 10 },
            },
            border: { display: false },
          },
          y: {
            beginAtZero: true,
            max: 100,
            ticks: {
              display: false,
            },
            grid: {
              color: chartPalette.grid,
              borderDash: [2, 3],
              drawTicks: false,
            },
            border: { display: false },
          },
        },
      },
    });
  }

  const volumeChartCanvas = doc.getElementById('cm-volume-chart');
  if (volumeChartCanvas) {
    new Chart(volumeChartCanvas, {
      type: 'bar',
      data: {
        labels: ['NIVEL 1: $25,000', 'NIVEL 2: $50,000', 'NIVEL 3: $75,000'],
        datasets: [
          {
            data: [66, 92, 32],
            backgroundColor: chartPalette.navy,
            borderRadius: 3,
            barThickness: 34,
          },
        ],
      },
      options: {
        maintainAspectRatio: false,
        animation: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            displayColors: false,
            callbacks: {
              label: (context) => `${context.raw} USDT`,
            },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: {
              color: chartPalette.axis,
              maxRotation: 0,
              autoSkip: false,
              font: { ...chartFont, size: 10 },
            },
            border: { display: false },
          },
          y: {
            beginAtZero: true,
            max: 100,
            ticks: { display: false },
            grid: {
              color: chartPalette.grid,
              borderDash: [2, 3],
              drawTicks: false,
            },
            border: { display: false },
          },
        },
      },
    });
  }

  const statusChartCanvas = doc.getElementById('cm-status-chart');
  if (statusChartCanvas) {
    new Chart(statusChartCanvas, {
      type: 'line',
      data: {
        labels: ['Ene', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Ago', 'Sep'],
        datasets: [
          {
            data: [0, 0, 0, 0, 10, 0, 40, 2, 300],
            borderColor: chartPalette.line,
            borderWidth: 2,
            pointRadius: 0,
            tension: 0,
            fill: false,
          },
        ],
      },
      options: {
        maintainAspectRatio: false,
        animation: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            displayColors: false,
            callbacks: {
              label: (context) => `${context.raw}M`,
            },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: {
              color: chartPalette.axis,
              font: { ...chartFont, size: 12 },
            },
            border: { display: false },
          },
          y: {
            min: 0,
            max: 500,
            afterBuildTicks: (axis) => {
              axis.ticks = [0, 25, 50, 100, 250, 500].map((value) => ({ value }));
            },
            ticks: {
              color: chartPalette.axis,
              font: { ...chartFont, size: 12 },
              callback: (value) => (value === 0 ? '0' : `${value}M`),
            },
            grid: {
              color: chartPalette.grid,
              borderDash: [2, 4],
              drawTicks: false,
            },
            border: { display: false },
          },
        },
      },
    });
  }
})();
