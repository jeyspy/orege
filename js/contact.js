/**
 * contact.js — Gestion du formulaire de contact
 * Observatoire de l'Eau Grand Est
 *
 * Fonctionnement :
 *  - Validation côté client (champs requis, format email, longueur message)
 *  - Envoi via mailto: (ouvre le client mail natif) avec pré-remplissage
 *  - L'adresse destinataire est à renseigner dans CONTACT_EMAIL ci-dessous
 */

(function () {
  'use strict';

  /* ── Configuration ────────────────────────────────────────── */
  var CONTACT_EMAIL = 'contact@observatoire-eau-grandest.fr'; // ← à remplacer par l'adresse réelle
  var MAX_MESSAGE_LENGTH = 1000;

  /* ── Éléments DOM ─────────────────────────────────────────── */
  var form        = document.getElementById('contact-form');
  var submitBtn   = document.getElementById('contact-submit');
  var successBox  = document.getElementById('contact-success');
  var backBtn     = document.getElementById('contact-success-back');
  var msgArea     = document.getElementById('contact-message');
  var msgCount    = document.getElementById('contact-message-count');

  if (!form) return; // sécurité si la page n'est pas chargée

  /* ── Compteur de caractères du message ───────────────────── */
  function updateCount() {
    var len = msgArea.value.length;
    msgCount.textContent = len + ' / ' + MAX_MESSAGE_LENGTH + ' caractères';
    msgCount.classList.toggle('is-warning', len > MAX_MESSAGE_LENGTH * 0.85);
    msgCount.classList.toggle('is-danger',  len >= MAX_MESSAGE_LENGTH);
    if (len > MAX_MESSAGE_LENGTH) {
      msgArea.value = msgArea.value.substring(0, MAX_MESSAGE_LENGTH);
      len = MAX_MESSAGE_LENGTH;
      msgCount.textContent = len + ' / ' + MAX_MESSAGE_LENGTH + ' caractères';
    }
  }
  if (msgArea) msgArea.addEventListener('input', updateCount);

  /* ── Validation ───────────────────────────────────────────── */
  function showError(fieldId, errorId, message) {
    var field = document.getElementById(fieldId);
    var error = document.getElementById(errorId);
    if (!field || !error) return;
    field.classList.add('is-error');
    error.textContent = message;
    error.removeAttribute('hidden');
  }

  function clearError(fieldId, errorId) {
    var field = document.getElementById(fieldId);
    var error = document.getElementById(errorId);
    if (!field || !error) return;
    field.classList.remove('is-error');
    error.setAttribute('hidden', '');
  }

  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function validateForm() {
    var valid = true;

    // Nom
    var nom = document.getElementById('contact-nom').value.trim();
    if (!nom) {
      showError('contact-nom', 'contact-nom-error', 'Veuillez saisir votre nom.');
      valid = false;
    } else {
      clearError('contact-nom', 'contact-nom-error');
    }

    // Prénom
    var prenom = document.getElementById('contact-prenom').value.trim();
    if (!prenom) {
      showError('contact-prenom', 'contact-prenom-error', 'Veuillez saisir votre prénom.');
      valid = false;
    } else {
      clearError('contact-prenom', 'contact-prenom-error');
    }

    // Email
    var email = document.getElementById('contact-email').value.trim();
    if (!email) {
      showError('contact-email', 'contact-email-error', 'Veuillez saisir votre adresse email.');
      valid = false;
    } else if (!validateEmail(email)) {
      showError('contact-email', 'contact-email-error', 'Adresse email invalide (ex: nom@domaine.fr).');
      valid = false;
    } else {
      clearError('contact-email', 'contact-email-error');
    }

    // Sujet
    var sujet = document.getElementById('contact-sujet').value;
    if (!sujet) {
      showError('contact-sujet', 'contact-sujet-error', 'Veuillez choisir un sujet.');
      valid = false;
    } else {
      clearError('contact-sujet', 'contact-sujet-error');
    }

    // Message
    var message = document.getElementById('contact-message').value.trim();
    if (!message) {
      showError('contact-message', 'contact-message-error', 'Veuillez saisir votre message.');
      valid = false;
    } else if (message.length < 10) {
      showError('contact-message', 'contact-message-error', 'Votre message doit contenir au moins 10 caractères.');
      valid = false;
    } else {
      clearError('contact-message', 'contact-message-error');
    }

    // RGPD
    var rgpd = document.getElementById('contact-rgpd').checked;
    if (!rgpd) {
      showError('contact-rgpd', 'contact-rgpd-error', 'Vous devez accepter la politique de confidentialité.');
      valid = false;
    } else {
      clearError('contact-rgpd', 'contact-rgpd-error');
    }

    return valid;
  }

  /* ── Effacement des erreurs à la saisie ───────────────────── */
  ['contact-nom', 'contact-prenom', 'contact-email', 'contact-sujet', 'contact-message'].forEach(function (id) {
    var el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('input', function () {
      el.classList.remove('is-error');
      var errEl = document.getElementById(id + '-error');
      if (errEl) errEl.setAttribute('hidden', '');
    });
  });
  var rgpdCb = document.getElementById('contact-rgpd');
  if (rgpdCb) {
    rgpdCb.addEventListener('change', function () {
      clearError('contact-rgpd', 'contact-rgpd-error');
    });
  }

  /* ── Construction du libellé de sujet ────────────────────── */
  function getSujetLabel() {
    var sel = document.getElementById('contact-sujet');
    if (!sel) return '';
    var opt = sel.options[sel.selectedIndex];
    return opt ? opt.text : sel.value;
  }

  /* ── Envoi via mailto: ────────────────────────────────────── */
  function envoyerViaMailto(nom, prenom, email, sujet, message) {
    var subject = encodeURIComponent('[Observatoire Eau GE] ' + getSujetLabel());
    var body    = encodeURIComponent(
      'Nom : ' + nom + '\n' +
      'Prénom : ' + prenom + '\n' +
      'Email : ' + email + '\n' +
      'Sujet : ' + getSujetLabel() + '\n\n' +
      'Message :\n' + message + '\n\n' +
      '---\nEnvoyé depuis le formulaire de contact de l\'Observatoire de l\'Eau Grand Est.'
    );
    var mailtoUrl = 'mailto:' + CONTACT_EMAIL + '?subject=' + subject + '&body=' + body;
    window.location.href = mailtoUrl;
  }

  /* ── Affichage du succès ──────────────────────────────────── */
  function afficherSucces() {
    form.setAttribute('hidden', '');
    successBox.removeAttribute('hidden');
    successBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  function reinitialiserFormulaire() {
    form.reset();
    updateCount();
    // Vider toutes les erreurs
    ['contact-nom', 'contact-prenom', 'contact-email', 'contact-sujet', 'contact-message', 'contact-rgpd'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.classList.remove('is-error');
      var err = document.getElementById(id + '-error');
      if (err) err.setAttribute('hidden', '');
    });
    successBox.setAttribute('hidden', '');
    form.removeAttribute('hidden');
    window.scrollTo({ top: form.offsetTop - 160, behavior: 'smooth' });
  }

  /* ── Soumission du formulaire ─────────────────────────────── */
  form.addEventListener('submit', function (e) {
    e.preventDefault();

    if (!validateForm()) {
      // Scroll vers la première erreur visible
      var firstError = form.querySelector('.contact-form__input.is-error, .contact-form__select.is-error, .contact-form__textarea.is-error');
      if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    // Simulation d'état chargement
    submitBtn.classList.add('is-loading');
    submitBtn.querySelector('i').className = 'ph ph-spinner';

    var nom     = document.getElementById('contact-nom').value.trim();
    var prenom  = document.getElementById('contact-prenom').value.trim();
    var email   = document.getElementById('contact-email').value.trim();
    var sujet   = document.getElementById('contact-sujet').value;
    var message = document.getElementById('contact-message').value.trim();

    // Léger délai pour le feedback visuel, puis ouverture du client mail
    setTimeout(function () {
      submitBtn.classList.remove('is-loading');
      submitBtn.querySelector('i').className = 'ph ph-paper-plane-tilt';
      envoyerViaMailto(nom, prenom, email, sujet, message);
      afficherSucces();
    }, 600);
  });

  /* ── Bouton retour depuis le succès ──────────────────────── */
  if (backBtn) {
    backBtn.addEventListener('click', reinitialiserFormulaire);
  }

  /* ── Initialisation ──────────────────────────────────────── */
  updateCount();

})();
