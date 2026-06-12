const checkBtn =
document.getElementById(
  "checkBtn"
);

const resetBtn =
document.getElementById(
  "resetBtn"
);

const resultSection =
document.getElementById("resultSection");

const themeToggle =
document.getElementById("themeToggle");

let currentEligible = [];
let recommendedModel = null;
let selectedModel = null;
let currentIncome = 0;
let currentDownpayment = 0;
let currentBudget = 0;
let currentTenure = 9;

initThemeToggle();

checkBtn.addEventListener(
  "click",
  () => {

    selectedModel = null;

    renderResults({
      trackAnalytics: true
    });

  }
);

resetBtn.addEventListener(
  "click",
  resetCalculator
);

function initThemeToggle() {

  if (!themeToggle) return;

  updateThemeToggle();

  themeToggle.addEventListener(
    "click",
    () => {

      const isLight =
        document.documentElement.dataset.theme ===
        "light";

      const nextTheme =
        isLight ? "dark" : "light";

      if (nextTheme === "light") {

        document.documentElement.dataset.theme =
          "light";

      } else {

        delete document.documentElement.dataset.theme;

      }

      try {

        localStorage.setItem(
          "theme",
          nextTheme
        );

      } catch (error) {}

      updateThemeToggle();

    }
  );

}

function updateThemeToggle() {

  const isLight =
    document.documentElement.dataset.theme ===
    "light";

  themeToggle.textContent =
    isLight ? "🌙" : "☀️";

  themeToggle.setAttribute(
    "aria-label",
    isLight
      ? "Tukar ke dark mode"
      : "Tukar ke light mode"
  );

  themeToggle.setAttribute(
    "title",
    isLight
      ? "Tukar ke dark mode"
      : "Tukar ke light mode"
  );

}

document
.querySelectorAll(".tenure-btn")
.forEach(button => {

  button.addEventListener(
    "click",
    () => {

      document
      .querySelectorAll(".tenure-btn")
      .forEach(btn => {

        btn.classList.remove(
          "active"
        );

      });

      button.classList.add(
        "active"
      );

      currentTenure =
      Number(
        button.dataset.tenure
      );

      if (
        !resultSection.classList.contains(
          "hidden"
        )
      ) {

        renderResults({
          trackAnalytics: false
        });

      }

    }
  );

});

function formatCurrency(value) {

  return new Intl.NumberFormat(
    "en-MY",
    {
      style: "currency",
      currency: "MYR",
      minimumFractionDigits: 0
    }
  ).format(value);

}

function calculateMonthlyPayment(
  price,
  downpayment = currentDownpayment,
  rebate = 0,
  tenureYears = currentTenure
) {

  const loanAmount =
    Math.max(
      price - downpayment - rebate,
      0
    );

  const totalInterest =
    loanAmount *
    APP_CONFIG.interestRate *
    tenureYears;

  const totalRepayment =
    loanAmount +
    totalInterest;

  return totalRepayment /
    (tenureYears * 12);

}

function getModelRebate(model) {

  return (
    MODEL_REBATES[
      model.id
    ]?.rebate || 0
  );

}

function getModelMonthlyPayment(model) {

  return calculateMonthlyPayment(
    model.price,
    currentDownpayment,
    getModelRebate(model)
  );

}

function calculateBudget(currentIncome) {

  return currentIncome *
    APP_CONFIG.eligibilityRatio;

}

function renderResults(options = {}) {

  const shouldTrackAnalytics =
    options.trackAnalytics !== false;

  currentIncome =
Number(
  document.getElementById("income").value
);

const downpaymentInput =
document.getElementById(
  "downpayment"
);

currentDownpayment =
Number(
  downpaymentInput.value
) || 0;

  if (!currentIncome) return;

if (
  shouldTrackAnalytics &&
  typeof gtag !== "undefined"
) {

  gtag(
    "event",
    "calculator_submit",
    {
      income: currentIncome
    }
  );

}

  currentBudget =
calculateBudget(
  currentIncome
);

  const affordableModels =
MODELS.filter(model =>
  getModelMonthlyPayment(model) <=
  currentBudget
).sort(
  (a, b) =>
  b.price - a.price
);

  const fallbackModel =
MODELS.slice().sort(
  (a, b) =>
  getModelMonthlyPayment(a) -
  getModelMonthlyPayment(b)
)[0];

  currentEligible =
affordableModels.length
  ? affordableModels
  : [fallbackModel];

  recommendedModel =
  currentEligible[0];

if (!selectedModel) {

  selectedModel =
    recommendedModel;

}

if (
  shouldTrackAnalytics &&
  typeof gtag !== "undefined"
) {

  gtag(
    "event",
    "recommendation_generated",
    {
      model:
        recommendedModel.name
    }
  );

}
    
const alternatives =
MODELS.filter(
  model =>
  model.id !== selectedModel.id
).sort(
  (a, b) =>
  getModelMonthlyPayment(a) -
  getModelMonthlyPayment(b)
);

const rebateData =
MODEL_REBATES[
  selectedModel.id
] || {
  rebate: 0
};

const rebate =
rebateData.rebate;

const monthlyAfterRebate =
getModelMonthlyPayment(
  selectedModel
);

const monthlySaving =
Math.round(
  calculateMonthlyPayment(
    selectedModel.price,
    currentDownpayment,
    0
  ) -
  monthlyAfterRebate
);

  const reasons =
  MODEL_REASONS[
  selectedModel.id
] || [];

  const whatsappMessage = encodeURIComponent(`Hi Ridzuan,

Saya baru menggunakan BYD Miri EV Advisor.

Pendapatan Bersih Bulanan:
${formatCurrency(currentIncome)}

Downpayment:
${formatCurrency(currentDownpayment)}

Tempoh Pembiayaan:
${currentTenure} Tahun

Model Dicadangkan:
${selectedModel.name}

Rebat Semasa:
${formatCurrency(rebate)}

Anggaran Bulanan:
${formatCurrency(monthlyAfterRebate)}/bulan

Saya berminat untuk mengetahui kelayakan sebenar dan pilihan loan yang tersedia.`);

  const testDriveMessage = encodeURIComponent(`Hi Ridzuan,

Saya baru menggunakan BYD Miri EV Advisor dan berminat untuk buat test drive.

Model:
${selectedModel.name}

Pendapatan Bersih Bulanan:
${formatCurrency(currentIncome)}

Downpayment:
${formatCurrency(currentDownpayment)}

Boleh tolong uruskan appointment test drive?`);

  resultSection.innerHTML = `


  <div class="advisor-header">

  <div class="advisor-line"></div>

  <div class="featured-badge">
    ${
  selectedModel.id ===
  recommendedModel.id

  ?

  "⭐ CADANGAN RIDZUAN"

  :

  "🔍 MODEL LAIN YANG SESUAI DENGAN ANDA"
}
  </div>

  <div class="advisor-line"></div>

</div>

${
  selectedModel.id !==
  recommendedModel.id

  ?

  `
    <div class="back-recommendation">

      ← Kembali ke Cadangan Ridzuan

    </div>
  `

  :

  ""
}

 <div class="featured-layout">

  <div class="featured-content">

    <h2>
      ${selectedModel.name}
    </h2>

    <p>
      ${selectedModel.positioning}
    </p>

    <img
      src="${selectedModel.image}"
      class="featured-image"
      alt="${selectedModel.name}">

    <p class="range-text">
      ⚡ Range: ${selectedModel.range}
    </p>

    <div class="monthly-payment">
      ${formatCurrency(monthlyAfterRebate)}
      / bulan
    </div>

    <div class="payment-context">

      Downpayment:

      <span class="payment-highlight">
        ${formatCurrency(
          currentDownpayment
        )}
      </span>

      •

      Rebat:

      <span class="payment-highlight">
        ${formatCurrency(
          rebate
        )}
      </span>

    </div>

    <div class="advisor-reasons">

      <h4>
        Mengapa Model Ini Sesuai Untuk Anda
      </h4>

      ${reasons.map(reason => `

        <div class="advisor-reason">

          ✓ ${reason}

        </div>

      `).join("")}

    </div>

    <div class="rebate-card">

      <h4>
        🎁 PROMO BULAN INI
      </h4>

      ${
        rebateData.badge
          ? `
          <div class="promo-badge">
            ${rebateData.badge}
          </div>
          `
          : ""
      }

      <div class="rebate-value">

        Rebat Tunai:
        ${formatCurrency(rebate)}

      </div>

      <div class="rebate-saving">

        💰 Jimat
        ${formatCurrency(
          monthlySaving
        )}
        sebulan

      </div>

    </div>

  </div>

</div>

   <div class="calculator-card">

  <h3>
  Lihat Model Lain
</h3>

  ${
    alternatives.length
    ?
    alternatives.map(model => `

      <div
  class="eligible-item"
  data-model-id="${model.id}">

  <div>

    <strong>
      ✓ ${model.name}
    </strong>

    <br>

    <small>
  ${model.positioning}
</small>

<div class="eligible-price">

  ${formatCurrency(

    calculateMonthlyPayment(
      model.price,
      currentDownpayment,
      getModelRebate(model)

    )

  )}/bulan

</div>

<div class="eligible-meta">

  ⚡ ${model.range}

</div>

  </div>

  <img
    src="${model.image}"
    class="eligible-thumb"
    alt="${model.name}">

</div>

    `).join("")
    :
    "<p>Tiada model lain dalam julat yang sama.</p>"
  }

</div>


<div class="calculator-card">

  <h2>
    Hubungi Ridzuan BYD Miri
  </h2>

  <p style="margin-top:10px">

    Nak semakan loan yang lebih tepat berdasarkan komitmen semasa anda?

  </p>

  <a
    class="wa-button"
    target="_blank"
    href="https://wa.me/${APP_CONFIG.whatsappNumber}?text=${whatsappMessage}">
    
    

    📱 Dapatkan Semakan Advisor Percuma

  </a>

  <a
    class="td-button"
    target="_blank"
    href="https://wa.me/${APP_CONFIG.whatsappNumber}?text=${testDriveMessage}">
    

    🚗 Tempah Test Drive Percuma

  </a>

</div>
<div class="disclaimer-card">

  <h4>📌 Disclaimer</h4>

  <p>

  Anggaran ansuran bulanan yang dipaparkan adalah untuk tujuan rujukan awal sahaja.

  <br><br>

  Pengiraan mengambil kira:

  <br>

  • Downpayment yang anda masukkan

  <br>

  • Rebat semasa yang ditawarkan

  <br>

  • Tempoh pembiayaan ${currentTenure} tahun

  <br>

  • Anggaran kadar faedah semasa 2.2% setahun

  <br><br>

  Ansuran dan kelulusan pembiayaan sebenar adalah tertakluk kepada penilaian pihak bank, rekod CCRIS/CTOS, komitmen kewangan semasa serta kadar pembiayaan yang berkuat kuasa pada waktu permohonan.

  <br><br>

  Untuk semakan yang lebih tepat berdasarkan profil kewangan anda, sila hubungi Ridzuan BYD Miri.

</p>

  <div class="footer-note">

    © 2026 Ridzuan BYD Miri. All Rights Reserved.

  </div>

</div>
  

  `;

  resultSection.classList.remove(
  "hidden"
);

const waButton =
document.querySelector(".wa-button");

if (waButton) {

  waButton.addEventListener(
    "click",
    () => {

      if (
        typeof gtag !== "undefined"
      ) {

        gtag(
          "event",
          "whatsapp_click",
          {
            model:
              selectedModel.name,
            income:
              currentIncome
          }
        );

      }

    }
  );

}

document
.querySelectorAll(".eligible-item")
.forEach(card => {

  card.addEventListener(
    "click",
    () => {

      const selectedId =
        card.dataset.modelId;

      const chosenModel =
        MODELS.find(
          model =>
          model.id === selectedId
        );

      if (!chosenModel) return;

      selectedModel =
        chosenModel;

      renderResults({
        trackAnalytics: false
      });

    }
  );

});

const backButton =
document.querySelector(
  ".back-recommendation"
);

if (backButton) {

  backButton.addEventListener(
    "click",
    () => {

      selectedModel =
        recommendedModel;

      renderResults({
        trackAnalytics: false
      });

    }
  );

}

}

function resetCalculator() {

  document.getElementById(
    "income"
  ).value = "";

  document.getElementById(
    "downpayment"
  ).value = "";

  currentIncome = 0;
  currentDownpayment = 0;

  currentEligible = [];

  recommendedModel = null;

  selectedModel = null;

  resultSection.innerHTML = "";

  resultSection.classList.add(
    "hidden"
  );

  currentTenure = 9;

document
.querySelectorAll(".tenure-btn")
.forEach(btn => {

  btn.classList.remove(
    "active"
  );

});

document
.querySelector(
  '[data-tenure="9"]'
)
.classList.add(
  "active"
);

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });

}
