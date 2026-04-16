// ------------------------------
// UI ACCESSIBLE JS MODULE
// ------------------------------

const getFocusableElements = (container) => {
  const selectors = [
    'button:not([disabled])',
    '[href]',
    'input:not([disabled]):not([type="hidden"])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
  ].join(', ');

  return Array.from(container.querySelectorAll(selectors)).filter(
    (el) =>
      el.offsetWidth > 0 &&
      el.offsetHeight > 0 &&
      window.getComputedStyle(el).visibility !== 'hidden' &&
      window.getComputedStyle(el).display !== 'none'
  );
};

export function attachUIEvents(root = document) {

  // =========================
  // MODALS
  // =========================
  root.querySelectorAll('[data-modal]').forEach((modal) => {
    if (modal.dataset['_modalAttached']) return;
    modal.dataset['_modalAttached'] = 'true';

    let modalOpener = null;

    if (!modal._backdrop) {
      const bd = document.createElement('div');
      bd.className = 'tw-fixed tw-inset-0 tw-bg-black tw-bg-opacity-50 tw-hidden tw-z-[999999]';
      document.body.appendChild(bd);
      modal._backdrop = bd;
    }
    const backdrop = modal._backdrop;

    const toggleButtons = document.querySelectorAll(`[data-modal-toggle="${modal.id}"]`);
    const hideButtons = modal.querySelectorAll('[data-modal-hide]');

    const openModal = () => {
      modal.classList.remove('tw-hidden');
      backdrop.classList.remove('tw-hidden');
      document.body.style.overflow = 'hidden';
      getFocusableElements(modal)[0]?.focus();
    };

    const closeModal = () => {
      modal.classList.add('tw-hidden');
      backdrop.classList.add('tw-hidden');
      document.body.style.overflow = '';
      modalOpener?.focus();
      modalOpener = null;
    };

    toggleButtons.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        modalOpener = e.currentTarget;
        openModal();
      });
      btn.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          modalOpener = e.currentTarget;
          openModal();
        }
      });
    });

    hideButtons.forEach((btn) => btn.addEventListener('click', closeModal));
    backdrop.addEventListener('click', closeModal);

    modal.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') { closeModal(); return; }
      const focusable = getFocusableElements(modal);
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.key === 'Tab') {
        if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); closeModal(); }
        else if (e.shiftKey && document.activeElement === first) { e.preventDefault(); closeModal(); }
      }
    });
  });

  // =========================
  // DRAWERS
  // =========================
  root.querySelectorAll('[data-drawer]').forEach((drawer) => {
    if (drawer.dataset['_drawerAttached']) return;
    drawer.dataset['_drawerAttached'] = 'true';

    const toggleButtons = document.querySelectorAll(`[data-drawer-toggle="${drawer.id}"]`);
    const hideButtons = drawer.querySelectorAll('[data-drawer-hide]');

    if (!drawer._backdrop) {
      const bd = document.createElement('div');
      bd.className = 'tw-fixed tw-inset-0 tw-bg-black tw-bg-opacity-50 tw-hidden tw-z-[999]';
      document.body.appendChild(bd);
      drawer._backdrop = bd;
    }
    const backdrop = drawer._backdrop;

    drawer.classList.add(
      'tw-fixed', 'tw-top-0', 'tw-left-0', 'tw-h-full', 'tw-bg-white', 'tw-shadow-xl', 'tw-w-72',
      'tw-transform', 'tw-translate-x-[-100%]', 'tw-transition-transform', 'tw-duration-300', 'tw-ease-in-out', 'tw-z-[1000]'
    );

    const openDrawer = () => {
      drawer.classList.remove('tw-hidden');
      backdrop.classList.remove('tw-hidden');
      requestAnimationFrame(() => { drawer.style.transform = 'translateX(0)'; });
    };

    const closeDrawer = () => {
      drawer.style.transform = 'translateX(-100%)';
      backdrop.classList.add('tw-hidden');
      setTimeout(() => drawer.classList.add('tw-hidden'), 300);
    };

    toggleButtons.forEach((btn) => btn.addEventListener('click', openDrawer));
    hideButtons.forEach((btn) => btn.addEventListener('click', closeDrawer));
    backdrop.addEventListener('click', closeDrawer);
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !drawer.classList.contains('tw-hidden')) closeDrawer();
    });
  });

  // =========================
  // POPOVERS
  // =========================
  const popovers = Array.from(root.querySelectorAll('[data-popover]'));

  const closeAllPopoversExcept = (except) => {
    popovers.forEach((p) => {
      if (p !== except && !p.classList.contains('tw-hidden')) p.classList.add('tw-hidden');
    });
  };

  popovers.forEach((popover) => {
    if (popover.dataset['_popoverAttached']) return;
    popover.dataset['_popoverAttached'] = 'true';

    const toggleButtons = document.querySelectorAll(`[data-popover-toggle="${popover.id}"]`);
    const hideButtons = popover.querySelectorAll('[data-popover-hide]');

    let lastFocused = null;
    let focusTrapHandler = null;
    let tabExitHandler = null;

    const openPopover = () => {
      closeAllPopoversExcept(popover);
      popover.classList.remove('tw-hidden');
      lastFocused = document.activeElement;

      if (popover.hasAttribute('data-focus-trap')) {
        focusTrapHandler = (e) => {
          if (e.key !== 'Tab' || popover.classList.contains('tw-hidden')) return;
          const els = getFocusableElements(popover);
          if (!els.length) return;
          if (e.shiftKey && document.activeElement === els[0]) { e.preventDefault(); els[els.length - 1].focus(); }
          else if (!e.shiftKey && document.activeElement === els[els.length - 1]) { e.preventDefault(); els[0].focus(); }
        };
        popover.addEventListener('keydown', focusTrapHandler);
      } else {
        tabExitHandler = (e) => {
          if (e.key !== 'Tab' || e.shiftKey || popover.classList.contains('tw-hidden')) return;
          const els = getFocusableElements(popover);
          if (els.length && document.activeElement === els[els.length - 1]) { e.preventDefault(); closePopover(); }
        };
        popover.addEventListener('keydown', tabExitHandler, true);
        popover._tabExitHandler = tabExitHandler;
      }
    };

    const closePopover = (skipReturn = false) => {
      popover.classList.add('tw-hidden');
      if (focusTrapHandler) { popover.removeEventListener('keydown', focusTrapHandler); focusTrapHandler = null; }
      if (popover._focusInHandler) { document.removeEventListener('focusin', popover._focusInHandler); popover._focusInHandler = null; }
      if (tabExitHandler) { popover.removeEventListener('keydown', tabExitHandler, true); tabExitHandler = null; }
      if (popover._tabExitHandler) { popover.removeEventListener('keydown', popover._tabExitHandler, true); popover._tabExitHandler = null; }
      if (!skipReturn && lastFocused) { setTimeout(() => { lastFocused?.focus(); lastFocused = null; }, 0); }
      else { lastFocused = null; }
    };

    toggleButtons.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        popover.classList.contains('tw-hidden') ? openPopover() : closePopover();
      });
      btn.addEventListener('keydown', (e) => {
        const isOpen = !popover.classList.contains('tw-hidden');
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); isOpen ? closePopover() : openPopover(); return; }
        if (e.key === 'Tab' && !e.shiftKey && isOpen && document.activeElement === btn) {
          e.preventDefault(); e.stopPropagation();
          getFocusableElements(popover)[0]?.focus();
        }
      }, true);
    });

    hideButtons.forEach((btn) => btn.addEventListener('click', () => closePopover()));

    document.addEventListener('click', (e) => {
      const target = e.target;
      const isToggle = Array.from(toggleButtons).some((btn) => btn.contains(target));
      if (!popover.contains(target) && !isToggle && !popover.classList.contains('tw-hidden')) closePopover();
    });

    const onEscape = (e) => {
      if (e.key === 'Escape' && !popover.classList.contains('tw-hidden')) { e.preventDefault(); e.stopPropagation(); closePopover(); }
    };
    toggleButtons.forEach((btn) => btn.addEventListener('keydown', onEscape));
    popover.addEventListener('keydown', onEscape);
  });

  // =========================
  // ACCORDIONS
  // =========================
  root.querySelectorAll('[data-accordion]').forEach((acc) => {
    if (acc.dataset['_accordionAttached']) return;
    acc.dataset['_accordionAttached'] = 'true';

    acc.querySelectorAll('[data-accordion-target]').forEach((btn) => {
      const panelId = btn.dataset['accordionTarget'];
      if (!panelId) return;
      const panel = document.getElementById(panelId);
      if (!panel) return;

      let item = btn.parentElement;
      while (item && item !== acc) {
        if (item.contains(panel)) break;
        item = item.parentElement;
      }
      if (!item || item === acc) item = null;

      btn.addEventListener('click', () => {
        const expanded = btn.getAttribute('aria-expanded') === 'true';
        btn.setAttribute('aria-expanded', String(!expanded));
        panel.hidden = expanded;
        item?.classList.toggle('is-active', !expanded);
      });
    });
  });

  // =========================
  // TABS
  // =========================
  root.querySelectorAll('[data-tab-list]').forEach((list) => {
    if (list.dataset['_tabAttached']) return;
    list.dataset['_tabAttached'] = 'true';

    const isTabSlide = list.hasAttribute('data-tab-slide');
    const tabs = Array.from(list.querySelectorAll('[data-tab]'));
    const orientation = list.dataset['tabOrientation'] || 'horizontal';
    const parentSection = list.closest('[data-tabs-section]');
    if (!parentSection) return;
    const tabContents = Array.from(parentSection.querySelectorAll('[data-tab-content]'));
    if (!tabContents.length) return;

    tabs.forEach((tab, index) => {
      const panelId = tab.dataset['tabTarget'];

      tab.addEventListener('click', () => {
        tabs.forEach((t) => {
          t.setAttribute('aria-selected', 'false');
          t.classList.remove('active');
          tabContents.forEach((p) => p.classList.add('tw-hidden'));
          Array.from(t.classList).forEach((cls) => { if (cls.includes('--active')) t.classList.remove(cls); });
        });

        tab.setAttribute('aria-selected', 'true');
        tab.classList.add('active');

        const swiperEl = tab.closest('carousel-swiper');
        if (swiperEl?.swiper && isTabSlide) swiperEl.swiper.slideTo(index);

        tabContents.filter((p) => p.id === panelId).forEach((p) => p.classList.remove('tw-hidden'));
        Array.from(tab.classList).forEach((cls) => {
          if (cls.includes('__tab-button') && !cls.includes('--')) tab.classList.add(cls + '--active');
        });
      });

      tab.addEventListener('keydown', (e) => {
        let i = tabs.indexOf(tab);
        if (orientation === 'horizontal') {
          if (e.key === 'ArrowRight') i++;
          else if (e.key === 'ArrowLeft') i--;
        } else {
          if (e.key === 'ArrowDown') i++;
          else if (e.key === 'ArrowUp') i--;
        }
        if (i < 0) i = tabs.length - 1;
        if (i >= tabs.length) i = 0;
        tabs[i].focus();
      });
    });
  });
}

// ------------------------------
// INIT
// ------------------------------
export function initUIComponents(root = document) {
  attachUIEvents(root);
}
