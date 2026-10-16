/* ============================================================
   js/ressources-depot.js
   Page-specific JavaScript for ressources-depot.html
   (Form to submit a "retour d'expérience" project)

   Responsibilities:
     1. DOM utilities — $ / $$ helpers, setInvalid / clearInvalid
     2. Thematic checkboxes — visual is-checked toggle
     3. Character counters — live counter for presentation / objectifs / actions
     4. GPS auto-detect — fills lat/lng from the browser Geolocation API
     5. Image upload preview — shows thumbnail + dimensions check
     6. PDF upload — displays filename + size, validates MIME type
     7. RGPD / rights checkboxes — clears errors on check
     8. Funder checkboxes — is-checked toggle, show/hide "Autre" text field
     9. Inline error clearing — removes errors as the user types/changes
    10. Form validation — checks all required fields before submit
    11. Form submission — POSTs payload to tables/retex_submissions,
        shows success message or error banner

   Dependencies:
     - nav.js    (site navigation)
     - a11y.js   (RGAA accessibility patches)
     - css/ressources-depot.css (page-specific styles)
============================================================ */
(function () {
  'use strict';

  /* ────────────────────────────────────────────────────────────
     1. DOM UTILITIES
  ──────────────────────────────────────────────────────────── */

  /** Shorthand for document.querySelector (with optional context) */
  function $(sel, ctx) { return (ctx || document).querySelector(sel); }

  /** Shorthand for document.querySelectorAll, returns a real Array */
  function $$(sel, ctx) { return Array.from((ctx || document).querySelectorAll(sel)); }

  /**
   * Mark a field as invalid:
   *   - adds 'is-invalid' to the field element
   *   - adds 'is-invalid' to the parent .ge-box (if present)
   *   - creates a .ge-error-msg div with the provided message
   * @param {Element} el  – the input/select/textarea
   * @param {string}  msg – error text (HTML allowed)
   */
  function setInvalid(el, msg) {
    el.classList.add('is-invalid');
    el.setAttribute('aria-invalid', 'true');
    var box = el.closest('.ge-box');
    if (box) box.classList.add('is-invalid');
    if (msg) {
      var container = box ? box.parentElement : el.parentElement;
      var hint = container.querySelector('.field-err');
      if (!hint) {
        hint = document.createElement('div');
        hint.className = 'ge-error-msg field-err';
        hint.setAttribute('role', 'alert');
        hint.style.display = 'block';
        /* RGAA 11.10 — lier le message d'erreur au champ via aria-describedby */
        var errId = el.id ? el.id + '-err' : 'err-' + Math.random().toString(36).slice(2, 7);
        hint.id = errId;
        var existingDesc = el.getAttribute('aria-describedby') || '';
        if (existingDesc.indexOf(errId) === -1) {
          el.setAttribute('aria-describedby', (existingDesc + ' ' + errId).trim());
        }
        container.appendChild(hint);
      }
      hint.innerHTML = '<i class="ph ph-warning"></i> ' + msg;
    }
  }

  /**
   * Clear the invalid state on a field and its parent .ge-box.
   * Removes any dynamically-created .field-err message.
   * @param {Element} el – the input/select/textarea
   */
  function clearInvalid(el) {
    el.classList.remove('is-invalid');
    el.removeAttribute('aria-invalid');
    var box = el.closest('.ge-box');
    if (box) box.classList.remove('is-invalid');
    var container = box ? box.parentElement : el.parentElement;
    var hint = container.querySelector('.field-err');
    if (hint) {
      /* RGAA 11.10 — retirer la référence aria-describedby vers l'erreur supprimée */
      var desc = el.getAttribute('aria-describedby') || '';
      if (hint.id && desc.indexOf(hint.id) !== -1) {
        el.setAttribute('aria-describedby', desc.replace(hint.id, '').trim());
        if (!el.getAttribute('aria-describedby')) el.removeAttribute('aria-describedby');
      }
      hint.remove();
    }
  }

  /* ────────────────────────────────────────────────────────────
     2. THEMATIC CHECKBOXES
     Toggle the 'is-checked' class on the label when the checkbox
     changes, and clear the thematic error once at least one is
     checked.
  ──────────────────────────────────────────────────────────── */
  $$('.thematique-checkbox input').forEach(function (cb) {
    cb.addEventListener('change', function () {
      this.closest('.thematique-checkbox').classList.toggle('is-checked', this.checked);
      /* Remove validation error as soon as at least one theme is selected */
      if ($$('input[name="thematique"]:checked').length > 0) {
        $('#thematiques-grid').classList.remove('is-invalid');
        $('#thematique-error').style.display = 'none';
      }
    });
  });

  /* ────────────────────────────────────────────────────────────
     3. CHARACTER COUNTERS
     Show a live "N / MAX" counter below each long textarea.
     Turns orange/red when the character limit is exceeded.
  ──────────────────────────────────────────────────────────── */
  [
    { id: 'presentation', max: 2000, counterId: 'presentation-counter' },
    { id: 'objectifs',    max: 1500, counterId: 'objectifs-counter'    },
    { id: 'actions',      max: 2000, counterId: 'actions-counter'      }
  ].forEach(function (cfg) {
    var ta      = document.getElementById(cfg.id);
    var counter = document.getElementById(cfg.counterId);
    if (!ta || !counter) return;
    ta.addEventListener('input', function () {
      var len = this.value.length;
      counter.textContent = len + ' / ' + cfg.max;
      /* Add 'warn' class when over the character limit */
      counter.classList.toggle('warn', len > cfg.max);
    });
  });

  /* ────────────────────────────────────────────────────────────
     4. GPS AUTO-DETECT
     Fills the latitude and longitude fields via the browser's
     Geolocation API when the "Ma position" button is clicked.
  ──────────────────────────────────────────────────────────── */
  var gpsBtn = document.getElementById('gps-auto-btn');
  if (gpsBtn) {
    gpsBtn.addEventListener('click', function () {
      if (!navigator.geolocation) {
        alert('Géolocalisation non disponible sur ce navigateur.');
        return;
      }
      var btn = this;
      btn.innerHTML = '<i class="ph ph-spinner fa-spin"></i> Localisation…';
      btn.disabled  = true;
      navigator.geolocation.getCurrentPosition(
        function (pos) {
          document.getElementById('gps-lat').value = pos.coords.latitude.toFixed(5);
          document.getElementById('gps-lng').value = pos.coords.longitude.toFixed(5);
          clearInvalid(document.getElementById('gps-lat'));
          clearInvalid(document.getElementById('gps-lng'));
          btn.innerHTML = '<i class="ph ph-check"></i> Localisé !';
          /* Reset button label after 2.5 s */
          setTimeout(function () {
            btn.innerHTML = '<i class="ph ph-crosshairs"></i> Ma position';
            btn.disabled  = false;
          }, 2500);
        },
        function () {
          alert('Impossible de récupérer votre position. Saisissez les coordonnées manuellement.');
          btn.innerHTML = '<i class="ph ph-crosshairs"></i> Ma position';
          btn.disabled  = false;
        }
      );
    });
  }

  /* ────────────────────────────────────────────────────────────
     5. IMAGE UPLOAD PREVIEW
     Shows a thumbnail and checks the minimum resolution
     (1200×675 px recommended). Warns the user if the image is
     below the recommended dimensions.
  ──────────────────────────────────────────────────────────── */
  var imageFile = document.getElementById('image-file');
  if (imageFile) {
    imageFile.addEventListener('change', function () {
      var file = this.files[0];
      if (!file) return;

      /* Max 5 MB */
      if (file.size > 5 * 1024 * 1024) {
        alert('L\'image dépasse 5 Mo. Veuillez choisir un fichier plus léger.');
        this.value = '';
        return;
      }

      /* Read as data URL to show the preview */
      var reader = new FileReader();
      reader.onload = function (e) {
        var img   = document.getElementById('img-preview');
        img.src   = e.target.result;
        img.onload = function () {
          var dims  = document.getElementById('img-dimensions');
          var ratio = (img.naturalWidth / img.naturalHeight).toFixed(2);
          dims.textContent = img.naturalWidth + ' × ' + img.naturalHeight + ' px — ratio ' + ratio;
          /* Flag images below the recommended minimum size */
          var ok = img.naturalWidth >= 1200 && img.naturalHeight >= 675;
          dims.style.color = ok ? '#2a347d' : '#fa640a';
          if (!ok) dims.textContent += ' ⚠ Résolution recommandée : 1 200 × 675 px minimum';
        };
        document.getElementById('img-preview-wrap').style.display = 'block';
        document.getElementById('img-upload-zone').classList.add('has-file');
      };
      reader.readAsDataURL(file);
    });
  }

  /* ────────────────────────────────────────────────────────────
     6. PDF UPLOAD — filename + size display + MIME validation
  ──────────────────────────────────────────────────────────── */
  var pdfFile = document.getElementById('pdf-file');
  if (pdfFile) {
    pdfFile.addEventListener('change', function () {
      var file = this.files[0];
      if (!file) return;

      /* Max 20 MB */
      if (file.size > 20 * 1024 * 1024) {
        alert('Le PDF dépasse 20 Mo. Veuillez choisir un fichier plus léger.');
        this.value = '';
        return;
      }

      /* Show filename + file size in the upload zone */
      var sizeMb = (file.size / (1024 * 1024)).toFixed(2);
      var nameEl = document.getElementById('pdf-name');
      nameEl.innerHTML =
        '<i class="ph ph-file-pdf" style="color:#fa640a;margin-right:5px;"></i>' +
        file.name +
        ' <span class="file-size">(' + sizeMb + ' Mo)</span>';
      nameEl.style.display = 'block';

      var zone = document.getElementById('pdf-upload-zone');
      zone.classList.add('has-file');
      zone.classList.remove('is-invalid');
      document.getElementById('pdf-error').style.display = 'none';
    });
  }

  /* ────────────────────────────────────────────────────────────
     7. RGPD & CONTENT RIGHTS — clear errors on checkbox change
  ──────────────────────────────────────────────────────────── */
  document.getElementById('rgpd').addEventListener('change', function () {
    var label = document.getElementById('rgpd-label');
    var error = document.getElementById('rgpd-error');
    if (this.checked) {
      label.classList.remove('is-invalid');
      if (error) error.style.display = 'none';
    }
  });
  document.getElementById('droits-contenus').addEventListener('change', function () {
    var label = document.getElementById('droits-label');
    var error = document.getElementById('droits-error');
    if (this.checked) {
      label.classList.remove('is-invalid');
      if (error) error.style.display = 'none';
    }
  });

  /* ────────────────────────────────────────────────────────────
     8. FUNDER CHECKBOXES
     Toggle 'is-checked' style, hide error on first check,
     and conditionally show the "Autre" free-text field.
  ──────────────────────────────────────────────────────────── */
  document.querySelectorAll('.financeur-check input[type="checkbox"]').forEach(function (cb) {
    cb.addEventListener('change', function () {
      this.closest('.financeur-check').classList.toggle('is-checked', this.checked);

      /* Hide the funder error once at least one box is checked */
      var nbChecked = document.querySelectorAll('input[name="financeurs"]:checked').length;
      if (nbChecked > 0) {
        document.getElementById('financeurs-error').style.display = 'none';
      }

      /* Show/hide the free-text "Autre" field */
      var autreCheckbox = document.getElementById('financeur-autre');
      var autreWrap     = document.getElementById('autre-financeur-wrap');
      if (autreCheckbox && autreWrap) {
        autreWrap.style.display = autreCheckbox.checked ? 'block' : 'none';
        if (autreCheckbox.checked) {
          document.getElementById('autre-financeur-text').focus();
        }
      }
    });
  });

  /* ────────────────────────────────────────────────────────────
     9. INLINE ERROR CLEARING
     Clear validation state on any field in the form as soon as
     the user starts typing or changes the value.
  ──────────────────────────────────────────────────────────── */
  document.getElementById('retex-form').addEventListener('input', function (e) {
    if (e.target.classList.contains('is-invalid')) clearInvalid(e.target);
  });
  document.getElementById('retex-form').addEventListener('change', function (e) {
    if (e.target.classList.contains('is-invalid')) clearInvalid(e.target);
  });

  /* ────────────────────────────────────────────────────────────
     10. FORM VALIDATION
     Checks all required fields and returns { valid, firstError }.
     Calls setInvalid() on every failing field so errors are
     visible in the UI.
  ──────────────────────────────────────────────────────────── */
  function validateForm() {
    var valid      = true;
    var firstError = null;

    /* Required text / email / date / number fields */
    var requiredFields = [
      { id: 'nom-projet',       msg: 'Le nom du projet est obligatoire.'                         },
      { id: 'porteur',          msg: 'Le nom du porteur est obligatoire.'                        },
      { id: 'date-debut',       msg: 'La date de début est obligatoire.'                         },
      { id: 'localisation-nom', msg: 'La localisation est obligatoire.'                          },
      { id: 'gps-lat',          msg: 'La latitude GPS est obligatoire.'                          },
      { id: 'gps-lng',          msg: 'La longitude GPS est obligatoire.'                         },
      { id: 'presentation',     msg: 'La présentation est obligatoire (100 caractères min.).'    },
      { id: 'objectifs',        msg: 'Les objectifs sont obligatoires (50 caractères min.).'     },
      { id: 'actions',          msg: 'Les actions sont obligatoires (50 caractères min.).'       },
      { id: 'email',            msg: 'L\'adresse email est obligatoire.'                         }
    ];

    requiredFields.forEach(function (f) {
      var el     = document.getElementById(f.id);
      if (!el) return;
      var val    = el.value.trim();
      var empty  = (val === '');
      /* Check minlength attribute if present */
      var minLen = parseInt(el.getAttribute('minlength') || '0', 10);
      var tooShort = (minLen > 0 && val.length < minLen);
      if (empty || tooShort) {
        setInvalid(el, f.msg);
        if (!firstError) firstError = el;
        valid = false;
      } else {
        clearInvalid(el);
      }
    });

    /* Email format validation */
    var emailEl = document.getElementById('email');
    if (emailEl && emailEl.value.trim()) {
      var emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailEl.value.trim());
      if (!emailOk) {
        setInvalid(emailEl, 'Format d\'email invalide.');
        if (!firstError) firstError = emailEl;
        valid = false;
      }
    }

    /* At least one funder must be checked */
    var nbFinanceurs   = document.querySelectorAll('input[name="financeurs"]:checked').length;
    var financeurErrEl = document.getElementById('financeurs-error');
    if (nbFinanceurs === 0) {
      if (financeurErrEl) financeurErrEl.style.display = 'block';
      var financeurGrid = document.getElementById('financeurs-grid');
      if (!firstError) firstError = financeurGrid;
      valid = false;
    } else {
      if (financeurErrEl) financeurErrEl.style.display = 'none';
    }

    /* At least one thematic category must be selected */
    var nbThematiques = document.querySelectorAll('input[name="thematique"]:checked').length;
    if (nbThematiques === 0) {
      document.getElementById('thematiques-grid').classList.add('is-invalid');
      document.getElementById('thematique-error').style.display = 'block';
      if (!firstError) firstError = document.getElementById('thematiques-grid');
      valid = false;
    } else {
      document.getElementById('thematiques-grid').classList.remove('is-invalid');
      document.getElementById('thematique-error').style.display = 'none';
    }

    /* PDF: if a file is attached, it must be a real PDF (MIME check) */
    if (pdfFile && pdfFile.files[0]) {
      var pdfType = pdfFile.files[0].type;
      if (pdfType !== 'application/pdf') {
        var pdfZone = document.getElementById('pdf-upload-zone');
        pdfZone.classList.add('is-invalid');
        document.getElementById('pdf-error').style.display = 'block';
        if (!firstError) firstError = pdfZone;
        valid = false;
      }
    }

    /* RGPD consent must be accepted */
    var rgpdEl    = document.getElementById('rgpd');
    var rgpdLabel = document.getElementById('rgpd-label');
    var rgpdError = document.getElementById('rgpd-error');
    if (rgpdEl && !rgpdEl.checked) {
      rgpdLabel.classList.add('is-invalid');
      if (rgpdError) rgpdError.style.display = 'block';
      if (!firstError) firstError = rgpdLabel;
      valid = false;
    } else {
      if (rgpdLabel) rgpdLabel.classList.remove('is-invalid');
      if (rgpdError) rgpdError.style.display = 'none';
    }

    /* Content rights consent must be accepted */
    var droitsEl    = document.getElementById('droits-contenus');
    var droitsLabel = document.getElementById('droits-label');
    var droitsError = document.getElementById('droits-error');
    if (droitsEl && !droitsEl.checked) {
      droitsLabel.classList.add('is-invalid');
      if (droitsError) droitsError.style.display = 'block';
      if (!firstError) firstError = droitsLabel;
      valid = false;
    } else {
      if (droitsLabel) droitsLabel.classList.remove('is-invalid');
      if (droitsError) droitsError.style.display = 'none';
    }

    return { valid: valid, firstError: firstError };
  }

  /* ────────────────────────────────────────────────────────────
     11. FORM SUBMISSION
     On submit: validate → disable button + show loader → POST
     payload to the RESTful Table API → show success or error.
  ──────────────────────────────────────────────────────────── */
  document.getElementById('retex-form').addEventListener('submit', async function (e) {
    e.preventDefault();

    var errorBanner = document.getElementById('error-banner');
    errorBanner.style.display = 'none';

    /* Run validation first */
    var result = validateForm();
    if (!result.valid) {
      errorBanner.style.display = 'block';
      document.getElementById('error-banner-text').textContent =
        'Veuillez corriger les erreurs indiquées ci-dessous avant d\'envoyer.';
      /* Scroll to the first invalid field */
      if (result.firstError) {
        var offset = result.firstError.getBoundingClientRect().top + window.scrollY - 140;
        window.scrollTo({ top: offset, behavior: 'smooth' });
      }
      return;
    }

    /* Disable submit button and show spinner */
    var submitBtn = document.getElementById('submit-btn');
    submitBtn.disabled = true;
    document.getElementById('form-loader').style.display = 'block';
    submitBtn.style.display = 'none';

    /* Collect selected thematic categories */
    var thematiques = Array.from(
      document.querySelectorAll('input[name="thematique"]:checked')
    ).map(function (cb) { return cb.value; });

    /* Read the selected image as a base64 data URL (if provided) */
    var imageDataUrl  = '';
    var imageFilename = '';
    var imgFileInput  = document.getElementById('image-file');
    if (imgFileInput && imgFileInput.files[0]) {
      imageFilename = imgFileInput.files[0].name;
      imageDataUrl  = await new Promise(function (resolve) {
        var reader = new FileReader();
        reader.onload = function (ev) { resolve(ev.target.result); };
        reader.readAsDataURL(imgFileInput.files[0]);
      });
    }

    /* Get PDF filename (binary not stored — name only) */
    var pdfFilename = (pdfFile && pdfFile.files[0]) ? pdfFile.files[0].name : '';

    /* Build the submission payload */
    var payload = {
      nom_projet:         document.getElementById('nom-projet').value.trim(),
      porteur_projet:     document.getElementById('porteur').value.trim(),
      thematiques:        thematiques,
      date_debut:         document.getElementById('date-debut').value,
      duree:              document.getElementById('duree').value.trim(),
      localisation_nom:   document.getElementById('localisation-nom').value.trim(),
      gps_lat:            document.getElementById('gps-lat').value.trim(),
      gps_lng:            document.getElementById('gps-lng').value.trim(),
      presentation:       document.getElementById('presentation').value.trim(),
      objectifs:          document.getElementById('objectifs').value.trim(),
      actions:            document.getElementById('actions').value.trim(),
      financeur:          (document.getElementById('financeur') || {}).value || '',
      autofinance:        document.getElementById('autofinance').checked,
      url_projet:         document.getElementById('url-projet').value.trim(),
      image_filename:     imageFilename,
      image_data_url:     imageDataUrl,
      pdf_filename:       pdfFilename,
      email_contact:      document.getElementById('email').value.trim(),
      telephone_contact:  document.getElementById('telephone').value.trim(),
      statut_validation:  'en_attente',   /* pending review by Orège team */
      commentaire_orege:  '',
      rgpd_accepte:       true
    };

    try {
      /* POST to the RESTful Table API */
      var response = await fetch('tables/retex_submissions', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error('Erreur serveur : ' + response.status);
      }

      var data = await response.json();

      /* Show success message and hide the form */
      document.getElementById('form-loader').style.display = 'none';
      document.getElementById('retex-form').style.display = 'none';
      var successMsg = document.getElementById('success-msg');
      var refEl      = document.getElementById('success-ref');
      if (data && data.id) {
        /* Display the first 8 characters of the UUID as a reference */
        refEl.textContent = 'Référence de votre dépôt : ' + data.id.substring(0, 8).toUpperCase();
      }
      successMsg.style.display = 'block';
      window.scrollTo({ top: 0, behavior: 'smooth' });

    } catch (err) {
      /* Show error banner and re-enable the submit button */
      document.getElementById('form-loader').style.display = 'none';
      submitBtn.style.display = 'inline-flex';
      submitBtn.disabled      = false;
      errorBanner.style.display = 'block';
      document.getElementById('error-banner-text').textContent =
        'Une erreur est survenue lors de l\'enregistrement. Veuillez réessayer. (' + err.message + ')';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });

})();
