(function () {
      /* ---- Step wizard state ---- */
      const STEPS = [
        { eyebrow: 'Step 1', heading: 'Enter project basic information' },
        { eyebrow: 'Step 2', heading: 'Enter project prompt' },
        { eyebrow: 'Step 3', heading: 'Choose AI Engine' },
        { eyebrow: 'Step 4', heading: 'Advanced settings' },
        { eyebrow: 'Step 5', heading: 'Set project budget' },
      ];
      const STEP_DESCS = [
        'Key in project information',
        'Key in prompt',
        'Choose AI Engine',
        'Advanced settings',
        'Set project budget',
      ];
      const DONE_CHECK_SVG = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true"><path d="M5 12.5 10 17.5 19 8" stroke="#141414" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';

      let current = 1;
      const totalPanels = STEPS.length;

      const eyebrowEl  = document.getElementById('step-eyebrow');
      const headingEl  = document.getElementById('step-heading');
      const btnPrev    = document.getElementById('btn-prev');
      const btnNext    = document.getElementById('btn-next');
      const stepEls    = document.querySelectorAll('.stepper .step');
      const panels     = document.querySelectorAll('.step-panel');

      /* ---- Validation ---- */
      function validateStep(n) {
        if (n === 1) return document.getElementById('app-name').value.trim() !== '';
        if (n === 2) return document.getElementById('app-prompt').value.trim() !== '';
        if (n === 5) {
          const v = document.querySelector('.budget-input').value.trim();
          return v !== '' && !isNaN(parseFloat(v));
        }
        return true;
      }

      function refreshNextBtn() {
        const valid = validateStep(current);
        btnNext.setAttribute('aria-disabled', valid ? 'false' : 'true');
      }

      window.goToStep = goToStep;
      function goToStep(n) {
        if (n < 1 || n > totalPanels) return;
        current = n;

        // Update title block
        eyebrowEl.textContent = STEPS[n - 1].eyebrow;
        headingEl.textContent = STEPS[n - 1].heading;

        // Toggle panels
        panels.forEach(p => {
          p.classList.toggle('is-active', +p.dataset.panel === n);
        });

        // Update stepper
        stepEls.forEach((el, i) => {
          const stepNum = i + 1;
          el.classList.remove('is-active', 'is-pending', 'is-done', 'step--after-done');

          if (stepNum < n) {
            el.classList.add('is-done');
            const node = el.querySelector('.step-node');
            node.classList.add('step-node--done');
            node.setAttribute('aria-label', 'completed');
            node.innerHTML = DONE_CHECK_SVG;
          } else if (stepNum === n) {
            el.classList.add('is-active');
            if (stepNum > 1) el.classList.add('step--after-done');
            const node = el.querySelector('.step-node');
            node.classList.remove('step-node--done');
            node.removeAttribute('aria-label');
            node.innerHTML = '<span class="step-dot"></span>';
          } else {
            el.classList.add('is-pending');
            const node = el.querySelector('.step-node');
            node.classList.remove('step-node--done');
            node.removeAttribute('aria-label');
            node.innerHTML = '';
          }
        });

        // Prev button visibility
        if (n > 1) {
          btnPrev.classList.add('is-visible');
          btnPrev.removeAttribute('tabindex');
          btnPrev.removeAttribute('aria-hidden');
        } else {
          btnPrev.classList.remove('is-visible');
          btnPrev.setAttribute('tabindex', '-1');
          btnPrev.setAttribute('aria-hidden', 'true');
        }

        // Next/Create button
        if (n < totalPanels) {
          btnNext.classList.remove('is-hidden', 'is-create');
        } else {
          btnNext.classList.remove('is-hidden');
          btnNext.classList.add('is-create');
          btnNext.setAttribute('aria-label', 'Create project');
        }

        // Scroll to top of main content
        document.querySelector('.content-shell').scrollIntoView({ behavior: 'smooth', block: 'start' });

        refreshNextBtn();
      }

      /* ---- Wave shift on navigation ---- */
      var wave = document.querySelector('.wave-bg');
      var waveShift = 0;
      function nudgeWave(direction) {
        if (!wave) return;
        waveShift += direction === 'next' ? -5 : 5;
        wave.style.transform = 'translateX(' + waveShift + '%)';
      }

      btnNext.addEventListener('click', () => {
        if (btnNext.getAttribute('aria-disabled') === 'true') return;
        if (current === 3 && !customRevPanel.hidden) {
          const revInputs = customRevPanel.querySelectorAll('.custom-rev-input');
          let hasError = false;
          revInputs.forEach(input => {
            const val = parseInt(input.value, 10);
            const over = isNaN(val) || val < 1 || val > 10;
            const wrap = input.closest('.custom-rev-input-wrap');
            const error = input.closest('.custom-rev-field').querySelector('.custom-rev-error');
            wrap.classList.toggle('has-error', over);
            error.classList.toggle('is-visible', over);
            if (over) hasError = true;
          });
          if (hasError) return;
        }
        if (current === totalPanels) {
          document.querySelector('.page').style.display = 'none';
          document.getElementById('ws-view').classList.add('is-visible');
          return;
        }
        nudgeWave('next');
        goToStep(current + 1);
      });
      btnPrev.addEventListener('click', () => { nudgeWave('prev'); goToStep(current - 1); });

      /* ---- Icon picker (Step 1) ---- */
      const chips     = document.querySelectorAll('.icon-chip');
      const preview   = document.querySelector('.picker-preview-avatar');
      const uploadBtn = document.querySelector('.upload-btn');
      const fileInput = document.getElementById('icon-upload');

      function clearSelection() {
        chips.forEach(c => {
          c.classList.remove('is-selected');
          c.removeAttribute('aria-selected');
        });
      }

      function showEmoji(icon, label) {
        preview.classList.remove('has-image');
        preview.style.backgroundImage = '';
        preview.textContent = icon;
        preview.setAttribute('aria-label', 'Selected app icon: ' + (label || icon));
      }

      function showUploadedImage(dataUrl, filename) {
        preview.classList.add('has-image');
        preview.textContent = '';
        preview.style.backgroundImage = 'url("' + dataUrl + '")';
        preview.setAttribute('aria-label', 'Uploaded app icon' + (filename ? ': ' + filename : ''));
      }

      chips.forEach(chip => {
        chip.addEventListener('click', () => {
          clearSelection();
          chip.classList.add('is-selected');
          chip.setAttribute('aria-selected', 'true');
          showEmoji(chip.textContent.trim(), chip.title);
        });
      });

      uploadBtn.addEventListener('click', () => fileInput.click());

      fileInput.addEventListener('change', (e) => {
        var file = e.target.files && e.target.files[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) {
          alert('Please choose an image file.');
          fileInput.value = '';
          return;
        }
        var reader = new FileReader();
        reader.onload = function (ev) {
          showUploadedImage(ev.target.result, file.name);
          clearSelection();
        };
        reader.onerror = function () { alert('Could not read that file.'); };
        reader.readAsDataURL(file);
        fileInput.value = '';
      });

      /* ---- Engine card selection (Step 3) ---- */
      const engineCards = document.querySelectorAll('.engine-card');
      const customRevPanel = document.getElementById('custom-revisions');
      engineCards.forEach(card => {
        card.addEventListener('click', () => {
          engineCards.forEach(c => {
            c.classList.remove('is-selected');
            c.setAttribute('aria-checked', 'false');
          });
          card.classList.add('is-selected');
          card.setAttribute('aria-checked', 'true');
          customRevPanel.hidden = card.dataset.engine !== 'custom';
        });
      });

      /* ---- Custom revision input validation ---- */
      document.querySelectorAll('.custom-rev-input').forEach(input => {
        const wrap = input.closest('.custom-rev-input-wrap');
        const error = input.closest('.custom-rev-field').querySelector('.custom-rev-error');

        input.addEventListener('input', () => {
          input.value = input.value.replace(/[^0-9]/g, '');
        });

        input.addEventListener('input', () => {
          const val = parseInt(input.value, 10);
          const over = !isNaN(val) && val > 10;
          wrap.classList.toggle('has-error', over);
          error.classList.toggle('is-visible', over);
        });
      });


      /* ---- Step 4: radio (Autopilot/Manual Review), toggle, add-on ---- */
      const advRadios = document.querySelectorAll('.adv-radio');
      advRadios.forEach(btn => {
        btn.addEventListener('click', () => {
          // Deselect all radios, select only the clicked one
          advRadios.forEach(r => r.setAttribute('aria-pressed', 'false'));
          btn.setAttribute('aria-pressed', 'true');
          // Disable sub-toggles when Autopilot selected
          const isAutopilot = btn.dataset.radio === 'autopilot';
          document.querySelectorAll('.adv-subtoggle-row').forEach(row => {
            row.style.opacity = isAutopilot ? '0.35' : '1';
            row.style.pointerEvents = isAutopilot ? 'none' : '';
          });
        });
      });
      document.querySelectorAll('.adv-toggle-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const on = btn.getAttribute('aria-pressed') === 'true';
          btn.setAttribute('aria-pressed', String(!on));
        });
      });
      document.querySelectorAll('.addon-card').forEach(card => {
        card.addEventListener('click', () => {
          const on = card.getAttribute('aria-pressed') === 'true';
          card.classList.toggle('is-selected', !on);
          card.setAttribute('aria-pressed', String(!on));
        });
      });

      /* ---- Advanced Ideation Modal ---- */
      const aiModal       = document.getElementById('ai-modal');
      const aiModalClose  = document.getElementById('ai-modal-close');
      const aiModalCancel = document.getElementById('ai-modal-cancel');
      const aiModalConfirm= document.getElementById('ai-modal-confirm');
      const advIdeationBtn= document.querySelector('.feat-card-brand');

      var motionOK = function() {
        return !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      };

      function openAiModal() {
        aiModal.removeAttribute('hidden');
        document.body.style.overflow = 'hidden';
        if (motionOK()) {
          aiModal.classList.remove('is-closing');
          aiModal.classList.add('is-entering');
        }
        aiModalClose.focus();
      }

      function clearAiErrors() {
        ['ai-goal', 'ai-features'].forEach(function(id) {
          document.getElementById(id).classList.remove('is-error');
          document.getElementById(id + '-error').setAttribute('hidden', '');
        });
      }

      function closeAiModal() {
        function doClose() {
          aiModal.setAttribute('hidden', '');
          aiModal.classList.remove('is-closing', 'is-entering');
          document.body.style.overflow = '';
          clearAiErrors();
          advIdeationBtn.focus();
        }
        if (motionOK()) {
          aiModal.classList.remove('is-entering');
          aiModal.classList.add('is-closing');
          aiModal.addEventListener('animationend', doClose, { once: true });
        } else {
          doClose();
        }
      }

      advIdeationBtn.addEventListener('click', openAiModal);
      aiModalClose.addEventListener('click', closeAiModal);
      aiModalCancel.addEventListener('click', closeAiModal);

      aiModalConfirm.addEventListener('click', function() {
        const goalEl     = document.getElementById('ai-goal');
        const featuresEl = document.getElementById('ai-features');
        const goalErr    = document.getElementById('ai-goal-error');
        const featErr    = document.getElementById('ai-features-error');
        let valid = true;

        if (!goalEl.value.trim()) {
          goalEl.classList.add('is-error');
          goalErr.textContent = 'Please describe the primary goal of your app.';
          goalErr.removeAttribute('hidden');
          valid = false;
        } else {
          goalEl.classList.remove('is-error');
          goalErr.setAttribute('hidden', '');
        }

        if (!featuresEl.value.trim()) {
          featuresEl.classList.add('is-error');
          featErr.textContent = 'Please list the key features your app must have.';
          featErr.removeAttribute('hidden');
          valid = false;
        } else {
          featuresEl.classList.remove('is-error');
          featErr.setAttribute('hidden', '');
        }

        if (!valid) return;

        const goal     = goalEl.value.trim();
        const audience = document.getElementById('ai-audience').value.trim();
        const features = featuresEl.value.trim();
        const style    = document.getElementById('ai-style').value.trim();
        const platform = document.getElementById('ai-platform').value.trim();
        const extra    = document.getElementById('ai-extra').value.trim();

        const parts = [];
        if (goal)     parts.push('I want to build an app that ' + goal + '.');
        if (audience) parts.push('The target audience is ' + audience + '.');
        if (features) parts.push('Key features include: ' + features + '.');
        if (style)    parts.push('The design should feel ' + style + '.');
        if (platform) parts.push('It should support ' + platform + '.');
        if (extra)    parts.push(extra);

        const promptEl = document.getElementById('app-prompt');
        promptEl.value = parts.join(' ');
        promptEl.dispatchEvent(new Event('input'));
        closeAiModal();
        nudgeWave('next');
        goToStep(3);
      });

      document.getElementById('ai-goal').addEventListener('input', function() {
        this.classList.remove('is-error');
        document.getElementById('ai-goal-error').setAttribute('hidden', '');
      });
      document.getElementById('ai-features').addEventListener('input', function() {
        this.classList.remove('is-error');
        document.getElementById('ai-features-error').setAttribute('hidden', '');
      });

      aiModal.addEventListener('click', (e) => { if (e.target === aiModal) closeAiModal(); });
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !aiModal.hasAttribute('hidden')) closeAiModal();
      });

      /* ---- Live re-validation on typed fields ---- */
      document.getElementById('app-name').addEventListener('input', refreshNextBtn);
      document.getElementById('app-prompt').addEventListener('input', refreshNextBtn);
      document.querySelector('.budget-input').addEventListener('input', refreshNextBtn);

      /* ---- Initialise disabled state for Step 1 ---- */
      refreshNextBtn();

      /* ---- Instant Ideas Modal ---- */
      const iiModal      = document.getElementById('ii-modal');
      const iiCloseBtn   = document.getElementById('ii-modal-close');
      const instantBtn   = document.querySelector('.feat-card-blue');

      var II_RAW = 'assets/';
      function iiAsset(n){ return (window.__II_ASSETS__ && window.__II_ASSETS__[n]) || (II_RAW + n); }

      var iiTemplates = [
        { id: 1, name: 'Wellness Tracker', version: '1.0', price: 'Free', category: 'Dashboard',  platform: 'Healthcare',        vendor: 'Official eMOBIQ', img: 'template-pic-1.jpg', bookmarked: false },
        { id: 2, name: 'Shop Flow',        version: '2.1', price: '$19',  category: 'eCommerce',  platform: 'Retail',            vendor: 'Official eMOBIQ', img: 'template-pic-2.jpg', bookmarked: true  },
        { id: 3, name: 'Finance Hub',      version: '1.3', price: '$29',  category: 'Dashboard',  platform: 'Financial',         vendor: 'Official eMOBIQ', img: 'template-pic-3.jpg', bookmarked: false },
        { id: 4, name: 'Auto Dealer',      version: '1.0', price: 'Free', category: 'Landing',    platform: 'Automotive',        vendor: 'Third party',     img: 'template-pic-4.jpg', bookmarked: false },
        { id: 5, name: 'Beauty Store',     version: '3.0', price: '$15',  category: 'eCommerce',  platform: 'Beauty & Wellness', vendor: 'Official eMOBIQ', img: 'template-pic-5.jpg', bookmarked: true  },
        { id: 6, name: 'Blog Minimal',     version: '1.1', price: 'Free', category: 'Blog',       platform: null,                vendor: 'Third party',     img: 'template-pic-6.png', bookmarked: false },
        { id: 7, name: 'SaaS Landing',     version: '2.0', price: '$25',  category: 'Landing',    platform: null,                vendor: 'Official eMOBIQ', img: 'template-pic-7.png', bookmarked: false },
        { id: 8, name: 'Portfolio Site',   version: '1.5', price: 'Free', category: 'Website',    platform: null,                vendor: 'Third party',     img: 'template-pic-8.png', bookmarked: true  },
        { id: 9, name: 'Marketplace',      version: '1.2', price: '$39',  category: 'eCommerce',  platform: 'Retail',            vendor: 'Official eMOBIQ', img: 'template-pic-9.jpg', bookmarked: false },
      ];

      var iiState = {
        cat: 'All', plat: 'All', vendor: 'All',
        keyword: '', bookmarked: false,
        search: '', sortField: 'name', sortDir: 'asc'
      };

      function iiRenderGrid() {
        var grid = document.getElementById('ii-grid');
        var list = iiTemplates.slice();
        if (iiState.cat    !== 'All') list = list.filter(function(t) { return t.category === iiState.cat; });
        if (iiState.plat   !== 'All') list = list.filter(function(t) { return t.platform === iiState.plat; });
        if (iiState.vendor !== 'All') list = list.filter(function(t) { return t.vendor   === iiState.vendor; });
        if (iiState.bookmarked)       list = list.filter(function(t) { return t.bookmarked; });
        if (iiState.keyword.trim())   list = list.filter(function(t) {
          var kw = iiState.keyword.toLowerCase();
          return (t.name || '').toLowerCase().includes(kw)
              || (t.category || '').toLowerCase().includes(kw)
              || (t.platform || '').toLowerCase().includes(kw)
              || (t.vendor   || '').toLowerCase().includes(kw);
        });
        if (iiState.search.trim())    list = list.filter(function(t) { return t.name.toLowerCase().includes(iiState.search.toLowerCase()); });
        list.sort(function(a, b) {
          var va = (a[iiState.sortField] || '').toString();
          var vb = (b[iiState.sortField] || '').toString();
          if (va < vb) return iiState.sortDir === 'asc' ? -1 :  1;
          if (va > vb) return iiState.sortDir === 'asc' ?  1 : -1;
          return 0;
        });
        document.getElementById('ii-count').textContent = list.length + ' template' + (list.length !== 1 ? 's' : '') + ' found.';
        grid.innerHTML = '';
        list.forEach(function(t) {
          var bmSrc      = t.bookmarked ? 'bookmark-on-icon.svg' : 'bookmark-off-icon.svg';
          var isFree     = t.price === 'Free';
          var isOfficial = t.vendor === 'Official eMOBIQ';
          var priceLabel = isFree ? 'FREE' : t.price;
          var card = document.createElement('div');
          card.className = 'ii-card' + (isOfficial ? ' ii-card--official' : '');
          card.innerHTML =
            '<div class="ii-card-thumb">' +
              '<img src="' + iiAsset(t.img) + '" alt="' + t.name + ' preview" loading="lazy" />' +
              '<div class="ii-card-overlay">' +
                '<button class="ii-overlay-btn ii-overlay-btn--details" type="button" data-id="' + t.id + '">Details</button>' +
                '<button class="ii-overlay-btn ii-overlay-btn--use" type="button" data-id="' + t.id + '">Use Template</button>' +
              '</div>' +
            '</div>' +
            '<button class="ii-bookmark-btn" type="button" data-id="' + t.id + '" aria-label="Toggle bookmark for ' + t.name + '">' +
              '<img src="' + iiAsset(bmSrc) + '" alt="" aria-hidden="true" />' +
            '</button>' +
            '<div class="ii-card-footer">' +
              '<div class="ii-card-heading">' +
                '<div class="ii-card-name-row">' +
                  '<span class="ii-card-name">' + t.name + '</span>' +
                  '<span class="ii-card-version">v' + t.version + '</span>' +
                '</div>' +
                '<div class="ii-card-badges">' +
                  (isOfficial ? '<span class="ii-badge">Official</span>' : '') +
                  (t.category ? '<span class="ii-badge">' + t.category + '</span>' : '') +
                  (t.platform ? '<span class="ii-badge">' + t.platform + '</span>' : '') +
                '</div>' +
              '</div>' +
              '<span class="ii-card-price' + (isFree ? ' is-free' : '') + '">' + priceLabel + '</span>' +
            '</div>';
          card.querySelector('.ii-bookmark-btn').addEventListener('click', function(e) {
            e.stopPropagation();
            var id = parseInt(this.dataset.id, 10);
            var tpl = iiTemplates.find(function(x) { return x.id === id; });
            if (!tpl) return;
            tpl.bookmarked = !tpl.bookmarked;
            var img = this.querySelector('img');
            if (img) img.src = iiAsset(tpl.bookmarked ? 'bookmark-on-icon.svg' : 'bookmark-off-icon.svg');
            if (iiState.bookmarked) iiRenderGrid();
          });
          card.querySelector('.ii-overlay-btn--use').addEventListener('click', function() {
            var id = parseInt(this.dataset.id, 10);
            var tpl = iiTemplates.find(function(x) { return x.id === id; });
            if (tpl) {
              var promptEl = document.getElementById('app-prompt');
              promptEl.value = 'Build an app based on the "' + tpl.name + '" template. Category: ' + tpl.category + '.' + (tpl.platform ? ' Platform: ' + tpl.platform + '.' : '');
              promptEl.dispatchEvent(new Event('input'));
            }
            closeInstantModal();
            nudgeWave('next');
            goToStep(3);
          });
          grid.appendChild(card);
        });
      }

      function openInstantModal() {
        iiModal.removeAttribute('hidden');
        document.body.style.overflow = 'hidden';
        if (motionOK()) {
          iiModal.classList.remove('is-closing');
          iiModal.classList.add('is-entering');
        }
        iiRenderGrid();
        iiCloseBtn.focus();
      }

      function closeInstantModal() {
        function doClose() {
          iiModal.setAttribute('hidden', '');
          iiModal.classList.remove('is-closing', 'is-entering');
          document.body.style.overflow = '';
          instantBtn.focus();
        }
        if (motionOK()) {
          iiModal.classList.remove('is-entering');
          iiModal.classList.add('is-closing');
          iiModal.addEventListener('animationend', doClose, { once: true });
        } else {
          doClose();
        }
      }

      instantBtn.addEventListener('click', openInstantModal);
      iiCloseBtn.addEventListener('click', closeInstantModal);

      document.querySelectorAll('.ii-radio-item').forEach(function(label) {
        label.addEventListener('click', function() {
          var filter = this.dataset.filter;
          var value  = this.dataset.value;
          document.querySelectorAll('.ii-radio-item[data-filter="' + filter + '"]').forEach(function(el) { el.classList.remove('is-active'); });
          this.classList.add('is-active');
          if (filter === 'cat')    iiState.cat    = value;
          if (filter === 'plat')   iiState.plat   = value;
          if (filter === 'vendor') iiState.vendor = value;
          iiRenderGrid();
        });
      });

      document.getElementById('ii-side-search').addEventListener('input', function() {
        iiState.keyword = this.value; iiRenderGrid();
      });

      document.getElementById('ii-bookmarked-label').addEventListener('click', function() {
        iiState.bookmarked = !iiState.bookmarked;
        this.classList.toggle('is-checked', iiState.bookmarked);
        document.getElementById('ii-bookmarked-chk').checked = iiState.bookmarked;
        iiRenderGrid();
      });

      document.getElementById('ii-search').addEventListener('input', function() {
        iiState.search = this.value; iiRenderGrid();
      });

      document.getElementById('ii-sort-asc').addEventListener('click', function() {
        iiState.sortDir = 'asc';
        this.classList.add('is-active'); this.setAttribute('aria-pressed', 'true');
        document.getElementById('ii-sort-dsc').classList.remove('is-active');
        document.getElementById('ii-sort-dsc').setAttribute('aria-pressed', 'false');
        iiRenderGrid();
      });

      document.getElementById('ii-sort-dsc').addEventListener('click', function() {
        iiState.sortDir = 'desc';
        this.classList.add('is-active'); this.setAttribute('aria-pressed', 'true');
        document.getElementById('ii-sort-asc').classList.remove('is-active');
        document.getElementById('ii-sort-asc').setAttribute('aria-pressed', 'false');
        iiRenderGrid();
      });

      /* Custom contextual sort menu */
      var iiSortTrigger = document.getElementById('ii-sort-trigger');
      var iiSortList    = document.getElementById('ii-sort-list');
      var iiSortLabel   = document.getElementById('ii-sort-label');

      function iiCloseSortMenu() {
        iiSortList.setAttribute('hidden', '');
        iiSortTrigger.setAttribute('aria-expanded', 'false');
      }
      function iiOpenSortMenu() {
        iiSortList.removeAttribute('hidden');
        iiSortTrigger.setAttribute('aria-expanded', 'true');
      }
      iiSortTrigger.addEventListener('click', function(e) {
        e.stopPropagation();
        if (iiSortList.hasAttribute('hidden')) iiOpenSortMenu(); else iiCloseSortMenu();
      });
      iiSortList.querySelectorAll('.ii-menu-item').forEach(function(item) {
        item.addEventListener('click', function() {
          iiSortList.querySelectorAll('.ii-menu-item').forEach(function(el) {
            el.classList.remove('is-selected');
            el.setAttribute('aria-selected', 'false');
          });
          this.classList.add('is-selected');
          this.setAttribute('aria-selected', 'true');
          iiState.sortField = this.dataset.value;
          iiSortLabel.textContent = this.childNodes[0].nodeValue.trim();
          iiCloseSortMenu();
          iiRenderGrid();
        });
      });
      document.addEventListener('click', function(e) {
        if (!iiSortList.hasAttribute('hidden') && !document.getElementById('ii-sort-menu').contains(e.target)) {
          iiCloseSortMenu();
        }
      });

      function iiResetSortMenu() {
        iiSortList.querySelectorAll('.ii-menu-item').forEach(function(el, i) {
          el.classList.toggle('is-selected', i === 0);
          el.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
        });
        iiSortLabel.textContent = 'Alphabetical order';
      }

      document.getElementById('ii-reset-btn').addEventListener('click', function() {
        iiState = { cat: 'All', plat: 'All', vendor: 'All', keyword: '', bookmarked: false, search: '', sortField: 'name', sortDir: 'asc' };
        document.querySelectorAll('.ii-radio-item').forEach(function(el) { el.classList.remove('is-active'); });
        document.querySelectorAll('.ii-radio-item[data-value="All"]').forEach(function(el) { el.classList.add('is-active'); });
        document.getElementById('ii-bookmarked-label').classList.remove('is-checked');
        document.getElementById('ii-bookmarked-chk').checked = false;
        document.getElementById('ii-side-search').value = '';
        document.getElementById('ii-search').value = '';
        document.getElementById('ii-sort-asc').classList.add('is-active');
        document.getElementById('ii-sort-asc').setAttribute('aria-pressed', 'true');
        document.getElementById('ii-sort-dsc').classList.remove('is-active');
        document.getElementById('ii-sort-dsc').setAttribute('aria-pressed', 'false');
        iiResetSortMenu();
        iiRenderGrid();
      });

      document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
          if (!iiSortList.hasAttribute('hidden')) { iiCloseSortMenu(); return; }
          if (!iiModal.hasAttribute('hidden')) { closeInstantModal(); return; }
          if (typeof pmSortList !== 'undefined' && !pmSortList.hasAttribute('hidden')) { pmCloseSortMenu(); return; }
          if (typeof pmModal !== 'undefined' && !pmModal.hasAttribute('hidden')) { closePluginModal(); return; }
        }
      });

      /* ---- Plugin Marketplace Modal ---- */
      var pmModal    = document.getElementById('pm-modal');
      var pmCloseBtn = document.getElementById('pm-modal-close');

      var PM_RAW = 'assets/';
      function pmAsset(n){ return (window.__II_ASSETS__ && window.__II_ASSETS__[n]) || PM_RAW + n; }

      var pmPlugins = [
        { id: 1,  name: 'ProCamera',         version: '1.1.0', category: 'Image editing', platform: 'iOS', vendor: 'Official eMOBIQ', icon: 'plugin-camera-icon.png',          bookmarked: false, added: false, locked: false },
        { id: 2,  name: 'ProSpeaker',        version: '1.1.0', category: 'Image editing', platform: 'iOS', vendor: 'Official eMOBIQ', icon: 'plugin-speaker-icon.png',         bookmarked: false, added: false, locked: false },
        { id: 3,  name: 'Smart Printer',     version: '1.1.0', category: 'Image editing', platform: 'iOS', vendor: 'Official eMOBIQ', icon: 'plugin-printer-icon.png',         bookmarked: false, added: false, locked: false },
        { id: 4,  name: 'Smart Thermostat',  version: '1.1.0', category: 'Image editing', platform: 'iOS', vendor: 'Official eMOBIQ', icon: 'plugin-thermostat-icon.png',      bookmarked: true,  added: false, locked: false },
        { id: 5,  name: 'CCTV',              version: '1.1.0', category: 'Image editing', platform: 'iOS', vendor: 'Official eMOBIQ', icon: 'plugin-cctv-icon.png',            bookmarked: false, added: false, locked: false },
        { id: 6,  name: 'Smart Bulb',        version: '1.1.0', category: 'Image editing', platform: 'iOS', vendor: 'Official eMOBIQ', icon: 'plugin-light-bulb-icon.png',      bookmarked: false, added: true,  locked: false },
        { id: 7,  name: 'ProCamera',         version: '1.1.0', category: 'Image editing', platform: 'iOS', vendor: 'Official eMOBIQ', icon: 'plugin-camera-icon.png',          bookmarked: true,  added: false, locked: true  },
        { id: 8,  name: 'Fitness Tracker',   version: '1.1.0', category: 'Image editing', platform: 'iOS', vendor: 'Official eMOBIQ', icon: 'plugin-fitness-tracker-icon.png', bookmarked: false, added: false, locked: false },
        { id: 9,  name: 'SQ Lite',           version: '1.1.0', category: 'Image editing', platform: 'iOS', vendor: 'Official eMOBIQ', icon: 'plugin-sq-lite-icon.png',         bookmarked: false, added: true,  locked: false },
      ];

      var pmState = {
        cat: 'All', plat: 'iOS', vendor: 'All',
        keyword: '', bookmarked: false,
        search: '', sortField: 'name', sortDir: 'asc'
      };

      function pmRenderGrid() {
        var grid = document.getElementById('pm-grid');
        var list = pmPlugins.slice();
        if (pmState.cat    !== 'All') list = list.filter(function(p) { return p.category === pmState.cat; });
        if (pmState.plat   !== 'All') list = list.filter(function(p) { return p.platform === pmState.plat; });
        if (pmState.vendor !== 'All') list = list.filter(function(p) { return p.vendor   === pmState.vendor; });
        if (pmState.bookmarked)       list = list.filter(function(p) { return p.bookmarked; });
        if (pmState.keyword.trim())   list = list.filter(function(p) {
          var kw = pmState.keyword.toLowerCase();
          return (p.name || '').toLowerCase().includes(kw)
              || (p.category || '').toLowerCase().includes(kw)
              || (p.platform || '').toLowerCase().includes(kw)
              || (p.vendor   || '').toLowerCase().includes(kw);
        });
        if (pmState.search.trim()) list = list.filter(function(p) { return p.name.toLowerCase().includes(pmState.search.toLowerCase()); });
        list.sort(function(a, b) {
          var va = (a[pmState.sortField] || '').toString();
          var vb = (b[pmState.sortField] || '').toString();
          if (va < vb) return pmState.sortDir === 'asc' ? -1 :  1;
          if (va > vb) return pmState.sortDir === 'asc' ?  1 : -1;
          return 0;
        });
        document.getElementById('pm-count').textContent = list.length + ' plugin' + (list.length !== 1 ? 's' : '') + ' found.';
        grid.innerHTML = '';

        var desc = 'Looking to sell digitally and enhance customer experience Looking to sell digitally and enhance customer experience';

        list.forEach(function(p) {
          var bmSrc      = p.bookmarked ? 'bookmark-on-icon.svg' : 'bookmark-off-icon.svg';
          var isOfficial = p.vendor === 'Official eMOBIQ';

          var card = document.createElement('div');
          var cardClass = 'pm-card';
          if (isOfficial) cardClass += ' pm-card--official';
          if (p.locked)   cardClass += ' pm-card--locked';
          card.className = cardClass;

          var actionsHtml = '';
          if (p.locked) {
            actionsHtml =
              '<button class="pm-btn-details" type="button">Details</button>' +
              '<button class="pm-btn-upgrade" type="button">Upgrade plan</button>';
          } else if (p.added) {
            actionsHtml =
              '<button class="pm-btn-details" type="button">Details</button>' +
              '<span class="pm-added-label"><svg viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="7" stroke="#4dd4ac" stroke-width="1.5"/><path d="M5 8l2.5 2.5L11 6" stroke="#4dd4ac" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>Added</span>';
          } else {
            actionsHtml =
              '<button class="pm-btn-details" type="button">Details</button>' +
              '<button class="pm-btn-activate" type="button">Add &amp; activate</button>';
          }

          card.innerHTML =
            '<div class="pm-card-inner">' +
              (isOfficial ? '<img class="pm-stamp" src="' + pmAsset('official-stamp.png') + '" alt="" aria-hidden="true" />' : '') +
              '<button class="pm-bookmark-btn" type="button" data-id="' + p.id + '" aria-label="Toggle bookmark for ' + p.name + '">' +
                '<img src="' + pmAsset(bmSrc) + '" alt="" aria-hidden="true" />' +
              '</button>' +
              (p.locked ? '<img class="pm-lock-icon" src="' + pmAsset('padlock-icon.svg') + '" alt="Locked" />' : '') +
              '<div class="pm-card-top">' +
                '<img class="pm-card-icon" src="' + pmAsset(p.icon) + '" alt="" aria-hidden="true" />' +
                '<div class="pm-card-info">' +
                  '<div class="pm-card-name-row">' +
                    '<span class="pm-card-name">' + p.name + '</span>' +
                    '<span class="pm-card-version">v' + p.version + '</span>' +
                  '</div>' +
                  '<div class="pm-card-badges">' +
                    (isOfficial ? '<span class="pm-badge">Official</span>' : '') +
                    (p.category ? '<span class="pm-badge">' + p.category + '</span>' : '') +
                    (p.platform ? '<span class="pm-badge">' + p.platform + '</span>' : '') +
                    '<span class="pm-badge">Keyword</span>' +
                  '</div>' +
                '</div>' +
              '</div>' +
              '<p class="pm-card-desc">' + desc + '</p>' +
              '<div class="pm-card-actions">' + actionsHtml + '</div>' +
            '</div>';

          /* Bookmark toggle (in-place swap, no re-render) */
          card.querySelector('.pm-bookmark-btn').addEventListener('click', function(e) {
            e.stopPropagation();
            var id = parseInt(this.dataset.id, 10);
            var plug = pmPlugins.find(function(x) { return x.id === id; });
            if (!plug) return;
            plug.bookmarked = !plug.bookmarked;
            var img = this.querySelector('img');
            if (img) img.src = pmAsset(plug.bookmarked ? 'bookmark-on-icon.svg' : 'bookmark-off-icon.svg');
            if (pmState.bookmarked) pmRenderGrid();
          });

          grid.appendChild(card);
        });
      }

      function openPluginModal() {
        pmModal.removeAttribute('hidden');
        document.body.style.overflow = 'hidden';
        if (motionOK()) {
          pmModal.classList.remove('is-closing');
          pmModal.classList.add('is-entering');
        }
        pmRenderGrid();
        pmCloseBtn.focus();
      }

      function closePluginModal() {
        var pluginAddon = document.querySelector('.addon-card[data-addon="plugins"]');
        function doClose() {
          pmModal.setAttribute('hidden', '');
          pmModal.classList.remove('is-closing', 'is-entering');
          document.body.style.overflow = '';
          if (pluginAddon) pluginAddon.focus();
        }
        if (motionOK()) {
          pmModal.classList.remove('is-entering');
          pmModal.classList.add('is-closing');
          pmModal.addEventListener('animationend', doClose, { once: true });
        } else {
          doClose();
        }
      }

      /* Wire Plugins addon card to open modal */
      var pluginAddonCard = document.querySelector('.addon-card[data-addon="plugins"]');
      if (pluginAddonCard) {
        pluginAddonCard.addEventListener('click', function() {
          /* The card's own handler toggles is-selected / aria-pressed.
             Open the modal only when the card becomes selected. */
          requestAnimationFrame(function() {
            if (pluginAddonCard.getAttribute('aria-pressed') === 'true') {
              openPluginModal();
            }
          });
        });
      }

      pmCloseBtn.addEventListener('click', closePluginModal);

      /* Sidebar filter radios */
      document.querySelectorAll('.pm-radio-item').forEach(function(label) {
        label.addEventListener('click', function() {
          var filter = this.dataset.pmFilter;
          var value  = this.dataset.value;
          document.querySelectorAll('.pm-radio-item[data-pm-filter="' + filter + '"]').forEach(function(el) { el.classList.remove('is-active'); });
          this.classList.add('is-active');
          if (filter === 'cat')    pmState.cat    = value;
          if (filter === 'plat')   pmState.plat   = value;
          if (filter === 'vendor') pmState.vendor = value;
          pmRenderGrid();
        });
      });

      document.getElementById('pm-side-search').addEventListener('input', function() {
        pmState.keyword = this.value; pmRenderGrid();
      });

      document.getElementById('pm-bookmarked-label').addEventListener('click', function() {
        pmState.bookmarked = !pmState.bookmarked;
        this.classList.toggle('is-checked', pmState.bookmarked);
        document.getElementById('pm-bookmarked-chk').checked = pmState.bookmarked;
        pmRenderGrid();
      });

      document.getElementById('pm-search').addEventListener('input', function() {
        pmState.search = this.value; pmRenderGrid();
      });

      document.getElementById('pm-sort-asc').addEventListener('click', function() {
        pmState.sortDir = 'asc';
        this.classList.add('is-active'); this.setAttribute('aria-pressed', 'true');
        document.getElementById('pm-sort-dsc').classList.remove('is-active');
        document.getElementById('pm-sort-dsc').setAttribute('aria-pressed', 'false');
        pmRenderGrid();
      });

      document.getElementById('pm-sort-dsc').addEventListener('click', function() {
        pmState.sortDir = 'desc';
        this.classList.add('is-active'); this.setAttribute('aria-pressed', 'true');
        document.getElementById('pm-sort-asc').classList.remove('is-active');
        document.getElementById('pm-sort-asc').setAttribute('aria-pressed', 'false');
        pmRenderGrid();
      });

      /* Custom contextual sort menu (PM) */
      var pmSortTrigger = document.getElementById('pm-sort-trigger');
      var pmSortList    = document.getElementById('pm-sort-list');
      var pmSortLabel   = document.getElementById('pm-sort-label');

      function pmCloseSortMenu() {
        pmSortList.setAttribute('hidden', '');
        pmSortTrigger.setAttribute('aria-expanded', 'false');
      }
      function pmOpenSortMenu() {
        pmSortList.removeAttribute('hidden');
        pmSortTrigger.setAttribute('aria-expanded', 'true');
      }
      pmSortTrigger.addEventListener('click', function(e) {
        e.stopPropagation();
        if (pmSortList.hasAttribute('hidden')) pmOpenSortMenu(); else pmCloseSortMenu();
      });
      pmSortList.querySelectorAll('.pm-menu-item').forEach(function(item) {
        item.addEventListener('click', function() {
          pmSortList.querySelectorAll('.pm-menu-item').forEach(function(el) {
            el.classList.remove('is-selected');
            el.setAttribute('aria-selected', 'false');
          });
          this.classList.add('is-selected');
          this.setAttribute('aria-selected', 'true');
          pmState.sortField = this.dataset.value;
          pmSortLabel.textContent = this.childNodes[0].nodeValue.trim();
          pmCloseSortMenu();
          pmRenderGrid();
        });
      });
      document.addEventListener('click', function(e) {
        if (!pmSortList.hasAttribute('hidden') && !document.getElementById('pm-sort-menu').contains(e.target)) {
          pmCloseSortMenu();
        }
      });

      function pmResetSortMenu() {
        pmSortList.querySelectorAll('.pm-menu-item').forEach(function(el, i) {
          el.classList.toggle('is-selected', i === 0);
          el.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
        });
        pmSortLabel.textContent = 'Alphabetical order';
      }

      document.getElementById('pm-reset-btn').addEventListener('click', function() {
        pmState = { cat: 'All', plat: 'iOS', vendor: 'All', keyword: '', bookmarked: false, search: '', sortField: 'name', sortDir: 'asc' };
        document.querySelectorAll('.pm-radio-item').forEach(function(el) { el.classList.remove('is-active'); });
        document.querySelectorAll('.pm-radio-item[data-value="All"]').forEach(function(el) { el.classList.add('is-active'); });
        /* Re-activate iOS as the default platform */
        document.querySelectorAll('.pm-radio-item[data-pm-filter="plat"][data-value="iOS"]').forEach(function(el) { el.classList.add('is-active'); });
        document.getElementById('pm-bookmarked-label').classList.remove('is-checked');
        document.getElementById('pm-bookmarked-chk').checked = false;
        document.getElementById('pm-side-search').value = '';
        document.getElementById('pm-search').value = '';
        document.getElementById('pm-sort-asc').classList.add('is-active');
        document.getElementById('pm-sort-asc').setAttribute('aria-pressed', 'true');
        document.getElementById('pm-sort-dsc').classList.remove('is-active');
        document.getElementById('pm-sort-dsc').setAttribute('aria-pressed', 'false');
        pmResetSortMenu();
        pmRenderGrid();
      });

    })();

/* ---------------------------------------------------------- */

/* ---- Workspace nav stage switching (Build / Test / Launch) ---- */
    document.querySelectorAll('.ws-nav-item').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.ws-nav-item').forEach(b => {
          b.classList.remove('is-active');
          b.classList.remove('is-muted');
        });
        btn.classList.add('is-active');
        const stage = btn.dataset.stage;
        const buildView = document.querySelector('.build-view');
        const testView = document.querySelector('.test-view');
        const launchView = document.querySelector('.launch-view');
        if (buildView) buildView.hidden = stage !== 'build';
        if (testView) testView.hidden = stage !== 'test';
        if (launchView) launchView.hidden = stage !== 'launch';
      });
    });

    /* ---- Back button → return to Step 1 ---- */
    document.querySelector('.ws-back-btn').addEventListener('click', () => {
      document.getElementById('ws-view').classList.remove('is-visible');
      const page = document.querySelector('.page');
      page.style.display = 'flex';
      window.goToStep(1);
    });

    /* ---- Build view: agent stepper detail switching ---- */
    (function () {
      const ASSET_BASE = 'assets/';
      const AGENTS = {
        ba: { name: 'Business Analyst', icon: 'ba-icon.svg',
          desc: "The Business Analyst AI agent acts as the strategic planner while your app is built. It takes your input from natural language prompts or structured forms and turns it into clear, actionable requirements. Like a real business analyst, it identifies the app's main goals, outlines the key features, and keeps everything aligned with your intended purpose. This gives the other AI agents a strong foundation to build on." },
        tl: { name: 'Tech Lead', icon: 'tech-lead-icon.svg',
          desc: 'The Tech Lead AI agent defines the technical architecture and implementation approach. It selects the stack, structures the codebase, and sets engineering standards so the app is built on a solid, scalable foundation for the rest of the team.' },
        pm: { name: 'Project Manager', icon: 'project-manager-icon.svg',
          desc: 'The Project Manager AI agent coordinates the build. It breaks the work into tasks, sequences the agents, and tracks progress to keep the project on schedule and aligned with its goals.' },
        ui: { name: 'UI Designer', icon: 'ui-designer-icon.svg',
          desc: "The UI Designer AI agent crafts the app's look and feel. It designs layouts, components, and visual styling that are consistent, accessible, and aligned with the product's purpose." },
        se: { name: 'Software Engineer', icon: 'software-engineer-icon.svg',
          desc: 'The Software Engineer AI agent writes the application code. It implements features, wires up data and logic, and turns the design and requirements into a working product.' },
        qa: { name: 'QA Specialist', icon: 'qa-icon.svg',
          desc: 'The QA Specialist AI agent verifies quality. It tests features, catches issues, and validates that the app behaves correctly before it moves toward launch.' },
      };
      // In the embedded artifact preview, raw.githubusercontent is CSP-blocked,
      // so resolve icons through the base64 asset map when it is present.
      const ASSET_MAP = window.__II_ASSETS__ || {};
      const resolveIcon = (file) => ASSET_MAP[file] || (ASSET_BASE + file);
      const nameEl = document.getElementById('bv-agent-name');
      const descEl = document.getElementById('bv-agent-desc');
      const iconEl = document.getElementById('bv-agent-icon');
      document.querySelectorAll('.bv-step').forEach(step => {
        step.addEventListener('click', () => {
          const a = AGENTS[step.dataset.agent];
          if (!a) return;
          document.querySelectorAll('.bv-step').forEach(s => s.classList.remove('is-selected'));
          step.classList.add('is-selected');
          nameEl.textContent = a.name;
          descEl.textContent = a.desc;
          iconEl.src = resolveIcon(a.icon);
          iconEl.alt = a.name;
        });
      });

      /* Output window collapse / expand */
      const output = document.querySelector('.bv-output');
      const collapseBtn = document.querySelector('.bv-output-collapse');
      if (output && collapseBtn) {
        collapseBtn.addEventListener('click', () => {
          const collapsed = output.classList.toggle('is-collapsed');
          collapseBtn.setAttribute('aria-expanded', String(!collapsed));
          collapseBtn.setAttribute('aria-label', collapsed ? 'Expand output' : 'Collapse output');
        });
      }

      /* Test view: terminal window collapse / expand */
      const term = document.querySelector('.tv-terminal');
      const termBtn = document.querySelector('.tv-term-collapse');
      if (term && termBtn) {
        termBtn.addEventListener('click', () => {
          const collapsed = term.classList.toggle('is-collapsed');
          termBtn.setAttribute('aria-expanded', String(!collapsed));
          termBtn.setAttribute('aria-label', collapsed ? 'Expand terminal' : 'Collapse terminal');
        });
      }

      /* Test view: collapsible "Add search functionality to navbar" task card */
      document.querySelectorAll('.tv-task-head').forEach(head => {
        head.addEventListener('click', () => {
          const collapsed = head.closest('.tv-task').classList.toggle('is-collapsed');
          head.setAttribute('aria-expanded', String(!collapsed));
        });
      });

      /* Test view: interactive app prototype (Home is the real screen) */
      const app = document.getElementById('tv-app');
      if (app) {
        const screens = app.querySelectorAll('.tv-app-screen');
        const tabs = app.querySelectorAll('.tv-app-tab');
        tabs.forEach(tab => {
          tab.addEventListener('click', () => {
            const target = tab.dataset.screen;
            tabs.forEach(t => t.classList.toggle('is-active', t === tab));
            screens.forEach(s => s.classList.toggle('is-active', s.dataset.screen === target));
          });
        });
        // live product search on the Home screen
        const q = document.getElementById('tv-app-q');
        const cards = app.querySelectorAll('.tv-app-card');
        const noResults = document.getElementById('tv-app-noresults');
        if (q) {
          q.addEventListener('input', () => {
            const term = q.value.trim().toLowerCase();
            let shown = 0;
            cards.forEach(c => {
              const match = c.dataset.name.toLowerCase().includes(term);
              c.classList.toggle('is-hidden', !match);
              if (match) shown++;
            });
            if (noResults) noResults.hidden = shown !== 0;
          });
        }
      }
    })();