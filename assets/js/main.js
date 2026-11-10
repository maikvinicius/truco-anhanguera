(function () {
  "use strict";

  var header = document.querySelector(".site-header");
  var menuToggle = document.querySelector(".menu-toggle");
  var mobileNav = document.getElementById("menu-mobile");

  /* ---------- Header: sombra ao rolar ---------- */
  function onScroll() {
    header.classList.toggle("is-scrolled", window.scrollY > 8);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Menu mobile ---------- */
  function setMenu(open) {
    mobileNav.classList.toggle("is-open", open);
    menuToggle.setAttribute("aria-expanded", String(open));
    menuToggle.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
    menuToggle.querySelector(".icon").textContent = open ? "close" : "menu";
  }
  menuToggle.addEventListener("click", function () {
    setMenu(menuToggle.getAttribute("aria-expanded") !== "true");
  });
  mobileNav.addEventListener("click", function (e) {
    if (e.target.closest("a")) setMenu(false);
  });
  window.addEventListener("resize", function () {
    if (window.innerWidth >= 1200) setMenu(false);
  });

  /* ---------- Link ativo conforme a seção visível ---------- */
  var navLinks = document.querySelectorAll('.nav a, .mobile-nav a[href^="#"]:not(.btn)');
  var sectionIds = ["o-campeonato", "premiacao", "como-funciona", "regulamento", "duvidas"];
  var sections = sectionIds
    .map(function (id) { return document.getElementById(id); })
    .filter(Boolean);

  function setActive(id) {
    navLinks.forEach(function (a) {
      var active = a.getAttribute("href") === "#" + id;
      a.classList.toggle("is-active", active);
      if (active) a.setAttribute("aria-current", "true");
      else a.removeAttribute("aria-current");
    });
  }

  if ("IntersectionObserver" in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) setActive(entry.target.id);
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    sections.forEach(function (s) { spy.observe(s); });
  }

  /* ---------- Reveal ao rolar ---------- */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var revealer = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    revealEls.forEach(function (el) { revealer.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---------- FAQ (accordion, um aberto por vez) ---------- */
  var faqButtons = document.querySelectorAll(".faq__q");
  faqButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var willOpen = btn.getAttribute("aria-expanded") !== "true";
      faqButtons.forEach(function (other) {
        other.setAttribute("aria-expanded", "false");
        other.closest(".faq__item").classList.remove("is-open");
      });
      if (willOpen) {
        btn.setAttribute("aria-expanded", "true");
        btn.closest(".faq__item").classList.add("is-open");
      }
    });
  });

  /* ---------- Modal do regulamento ---------- */
  var lastFocus = null;

  function openModal(modal) {
    lastFocus = document.activeElement;
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("is-locked");
    var closeBtn = modal.querySelector("[data-close-modal]");
    if (closeBtn) closeBtn.focus();
  }

  function closeModal(modal) {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("is-locked");
    if (lastFocus) lastFocus.focus();
  }

  document.querySelectorAll("[data-open-modal]").forEach(function (trigger) {
    trigger.addEventListener("click", function (e) {
      var modal = document.getElementById(trigger.getAttribute("data-open-modal"));
      if (!modal) return;
      e.preventDefault();
      openModal(modal);
    });
  });

  document.querySelectorAll(".modal").forEach(function (modal) {
    modal.addEventListener("click", function (e) {
      if (e.target === modal || e.target.closest("[data-close-modal]")) closeModal(modal);
    });
    modal.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeModal(modal);
      if (e.key !== "Tab") return;
      var focusables = modal.querySelectorAll("button, [href], input, [tabindex]:not([tabindex='-1'])");
      var first = focusables[0];
      var last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
  });

  /* ---------- Formulário de inscrição ---------- */
  var form = document.getElementById("form-inscricao");
  var success = document.getElementById("form-success");

  function maskPhone(value) {
    var d = value.replace(/\D/g, "").slice(0, 11);
    if (d.length <= 2) return d.length ? "(" + d : "";
    if (d.length <= 6) return "(" + d.slice(0, 2) + ") " + d.slice(2);
    if (d.length <= 10) return "(" + d.slice(0, 2) + ") " + d.slice(2, 6) + "-" + d.slice(6);
    return "(" + d.slice(0, 2) + ") " + d.slice(2, 7) + "-" + d.slice(7);
  }

  form.querySelectorAll('[data-mask="phone"]').forEach(function (input) {
    input.addEventListener("input", function () {
      input.value = maskPhone(input.value);
    });
  });

  function validateField(input) {
    var error = input.parentElement.querySelector(".field__error");
    var value = input.value.trim();
    var message = "";

    if (input.required && !value) {
      message = "Campo obrigatório.";
    } else if (input.type === "tel" && value.replace(/\D/g, "").length < 10) {
      message = "Informe um WhatsApp válido com DDD.";
    } else if (input.type === "text" && input.required && value.length < 3) {
      message = "Mínimo de 3 caracteres.";
    }

    input.setAttribute("aria-invalid", message ? "true" : "false");
    if (error) error.textContent = message;
    return !message;
  }

  form.querySelectorAll("input[required]").forEach(function (input) {
    input.addEventListener("blur", function () { validateField(input); });
    input.addEventListener("input", function () {
      if (input.getAttribute("aria-invalid") === "true") validateField(input);
    });
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var fields = form.querySelectorAll("input[required]");
    var firstInvalid = null;
    fields.forEach(function (input) {
      if (!validateField(input) && !firstInvalid) firstInvalid = input;
    });
    if (firstInvalid) {
      firstInvalid.focus();
      return;
    }

    // TODO: integrar com o backend / fluxo de inscrição.
    success.querySelector("[data-dupla-nome]").textContent = form.dupla.value.trim();
    form.hidden = true;
    success.classList.add("is-visible");
    success.focus();
  });

  success.querySelector("[data-reset-form]").addEventListener("click", function () {
    form.reset();
    form.querySelectorAll("[aria-invalid]").forEach(function (i) { i.removeAttribute("aria-invalid"); });
    success.classList.remove("is-visible");
    form.hidden = false;
    form.dupla.focus();
  });

  /* ---------- Ano no rodapé ---------- */
  var year = document.querySelector("[data-year]");
  if (year) year.textContent = new Date().getFullYear();
})();
