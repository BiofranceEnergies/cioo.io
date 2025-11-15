// ==============================
// UTILITAIRES
// ==============================
function smoothScrollToId(id) {
  const target = document.getElementById(id);
  if (!target) return;
  target.scrollIntoView({ behavior: "smooth", block: "start" });
}

// ==============================
// INIT GÉNÉRAL
// ==============================
document.addEventListener("DOMContentLoaded", () => {
  initBurgerMenu();
  initScrollButtons();
  initMultiStepForm();
  initFAQ();
});

// ==============================
// BURGER / NAV MOBILE
// ==============================
function initBurgerMenu() {
  const burger = document.getElementById("burger-menu");
  const nav = document.getElementById("main-nav");
  if (!burger || !nav) return;

  burger.addEventListener("click", () => {
    nav.classList.toggle("open");
  });

  // Fermer le menu quand on clique sur un lien
  nav.querySelectorAll("a, button").forEach((el) => {
    el.addEventListener("click", () => {
      nav.classList.remove("open");
    });
  });
}

// ==============================
// SCROLL SUR LES CTA
// ==============================
function initScrollButtons() {
  document.querySelectorAll("[data-scroll-to]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const id = btn.getAttribute("data-scroll-to");
      if (!id) return;
      smoothScrollToId(id);
    });
  });
}

// ==============================
// FORMULAIRE MULTI-ÉTAPES
// ==============================
function initMultiStepForm() {
  const form = document.getElementById("eligibility-form");
  if (!form) return;

  const steps = Array.from(form.querySelectorAll(".form-step"));
  const nextButtons = form.querySelectorAll(".btn-next");
  const prevButtons = form.querySelectorAll(".btn-prev");
  const progressSteps = Array.from(
    document.querySelectorAll(".progress-step")
  );
  const successBox = document.getElementById("form-success");

  let currentStepIndex = 0;

  function showStep(index) {
    steps.forEach((step, i) => {
      step.classList.toggle("active", i === index);
    });

    progressSteps.forEach((ps, i) => {
      ps.classList.toggle("active", i === index);
      ps.classList.toggle("completed", i < index);
    });

    currentStepIndex = index;
  }

  function validateCurrentStep() {
    const currentStep = steps[currentStepIndex];
    if (!currentStep) return true;

    const requiredFields = currentStep.querySelectorAll("[required]");
    for (const field of requiredFields) {
      if (field.type === "radio") {
        const name = field.name;
        const checked = currentStep.querySelector(
          `input[name="${name}"]:checked`
        );
        if (!checked) {
          field.focus();
          return false;
        }
      } else if (!field.value) {
        field.focus();
        return false;
      }
    }
    return true;
  }

  nextButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      if (!validateCurrentStep()) {
        form.reportValidity?.();
        return;
      }
      const nextIndex = Math.min(currentStepIndex + 1, steps.length - 1);
      showStep(nextIndex);
    });
  });

  prevButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const prevIndex = Math.max(currentStepIndex - 1, 0);
      showStep(prevIndex);
    });
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    // Validation finale
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    // Rassembler les données
    const formData = new FormData(form);
    const dataObj = {};
    for (const [key, value] of formData.entries()) {
      if (dataObj[key] !== undefined) {
        // gestion des radios/checkbox multiples
        if (Array.isArray(dataObj[key])) {
          dataObj[key].push(value);
        } else {
          dataObj[key] = [dataObj[key], value];
        }
      } else {
        dataObj[key] = value;
      }
    }

    // Callback plug-in pour plus tard (Apps Script, etc.)
    if (typeof window.onFormSubmit === "function") {
      try {
        window.onFormSubmit(dataObj);
      } catch (err) {
        console.error("Erreur dans onFormSubmit :", err);
      }
    } else {
      console.log("Données du formulaire :", dataObj);
    }

    // Affichage message de succès
    steps.forEach((s) => s.classList.remove("active"));
    if (successBox) {
      successBox.style.display = "block";
    }
  });

  // Afficher la première étape au démarrage
  showStep(0);
}

// ==============================
// FAQ ACCORDÉON
// ==============================
function initFAQ() {
  const items = document.querySelectorAll(".faq-item");
  if (!items.length) return;

  items.forEach((item) => {
    const button = item.querySelector(".faq-question");
    const answer = item.querySelector(".faq-answer");
    if (!button || !answer) return;

    button.addEventListener("click", () => {
      const isOpen = item.classList.contains("open");
      // on peut choisir de fermer les autres
      items.forEach((it) => it.classList.remove("open"));
      if (!isOpen) {
        item.classList.add("open");
      }
    });
  });
}

// ==============================
// CALLBACK PAR DÉFAUT (OPTIONNEL)
// ==============================
// Tu pourras remplacer cette fonction plus tard
// par un fetch vers Apps Script / Sheets.
window.onFormSubmit = window.onFormSubmit || function (data) {
  console.log("Formulaire soumis (callback par défaut) :", data);
};

