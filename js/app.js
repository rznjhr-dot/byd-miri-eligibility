const checkBtn =
document.getElementById("checkBtn");

const resultSection =
document.getElementById("resultSection");

let currentEligible = [];

let recommendedModel = null;

let selectedModel = null;

let currentIncome = 0;

let currentBudget = 0;

checkBtn.addEventListener(
  "click",
  renderResults
);

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

function calculateMonthlyPayment(price) {

  const loanAmount =
    price * (1 - APP_CONFIG.depositRate);

  const totalInterest =
    loanAmount *
    APP_CONFIG.interestRate *
    APP_CONFIG.tenureYears;

  const totalRepayment =
    loanAmount +
    totalInterest;

  return totalRepayment /
    (APP_CONFIG.tenureYears * 12);

}

function calculateBudget(currentIncome) {

  return currentIncome *
    APP_CONFIG.eligibilityRatio;

}

function getBudgetMeter(
  monthly,
  budget
) {

  const usage =
    Math.round(
      (monthly / budget) * 100
    );

  let color = "🟢";

  if (usage > 85) {

    color = "🟠";

  } else if (usage > 60) {

    color = "🔵";

  }

  return {

    usage,

    position:
      Math.min(
        usage,
        100
      ),

    label:
      `${color} Menggunakan ${usage}% bajet disyorkan`

  };

}

function renderResults() {

  currentIncome =
Number(
  document.getElementById("income").value
);

  if (!currentIncome) return;

  currentBudget =
calculateBudget(
  currentIncome
);

  currentEligible =
MODELS.filter(model => {

    return (
      calculateMonthlyPayment(
  model.price
) <= currentBudget
    );

  }).sort(
    (a, b) =>
    b.price - a.price
  );

  if (!currentEligible.length) {

  resultSection.innerHTML = `
    <div class="calculator-card">
      <h3>
        Tiada model dalam julat bajet semasa.
      </h3>

      <p style="margin-top:12px;">
        Hubungi Ridzuan BYD Miri
        untuk semakan lanjut.
      </p>
    </div>
  `;

  resultSection.classList.remove("hidden");

  return;

}

  recommendedModel =
  currentEligible[0];

if (!selectedModel) {

  selectedModel =
    recommendedModel;

}
    
  const alternatives =
currentEligible.filter(
  model =>
  model.id !== selectedModel.id
);

  const monthly =
calculateMonthlyPayment(
  selectedModel.price
);

const budgetMeter =
getBudgetMeter(
  monthly,
  currentBudget
);


  const reasons =
  MODEL_REASONS[
  selectedModel.id
] || [];

  const whatsappMessage =
encodeURIComponent(
`Hi Ridzuan,

Saya baru menggunakan BYD Miri EV Advisor.

Pendapatan Bersih Bulanan:
RM${currentIncome}

Cadangan Ridzuan:
${selectedModel.name}

Boleh bantu saya dengan semakan loan yang lebih tepat?`
);

  resultSection.innerHTML = `

    <div class="calculator-card featured-card">

      <h3>
        Bajet Disyorkan
      </h3>

      <h2>
        ~ ${formatCurrency(currentBudget)}
      </h2>

    </div>

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

    <p class="range-text">
      ⚡ Range: ${selectedModel.range}
    </p>

    <div class="monthly-payment">
      ${formatCurrency(monthly)}
      / bulan
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

  </div>

  <div class="suitability-section">

  <h4>
    📊 BAJET-O-METER
  </h4>

  <div class="suitability-scale">

    0%

    <span>
      100%
    </span>

  </div>

  <div class="suitability-meter">

    <div
      class="suitability-dot"
      style="
      left:${budgetMeter.position}%;">
    </div>

  </div>

  <div class="suitability-label">

  ${budgetMeter.label}

</div>

<div class="suitability-description">

  RM${monthly.toLocaleString()}
  daripada
  RM${currentBudget.toLocaleString()}

</div>

<div class="suitability-usage">

  (${budgetMeter.usage}% penggunaan bajet)

</div>

</div>

  <img
    src="${selectedModel.image}"
    class="featured-image"
    alt="${selectedModel.name}">

</div>



   <div class="calculator-card">

  <h3>
  ANDA LAYAK UNTUK
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

<div class="eligible-hint">
  Klik untuk lihat model ini
</div>

    <div class="eligible-meta">

  Range: ${model.range}

  •

  ${formatCurrency(
    calculateMonthlyPayment(
      model.price
    )
  )}/bulan

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

  <h3>
    Tahukah Anda?
  </h3>

  <div style="margin-top:15px">

    ⚡ Kos perjalanan EV sekitar
    5–8 sen/km

    <br><br>

    🏠 Cas penuh di rumah sekitar
    RM15–RM30

    <br><br>

    🔋 Waranti bateri
    8 Tahun / 160,000km

  </div>

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
    
    

    📱 Dapatkan Semakan Loan Percuma

  </a>

</div>
<div class="disclaimer-card">

  <h4>📌 Disclaimer</h4>

  <p>

    Kiraan kelayakan dan ansuran bulanan yang dipaparkan adalah
    anggaran awal untuk tujuan rujukan sahaja.

    <br><br>

    Pengiraan dibuat berdasarkan:

    <br>

    • Deposit 10%

    <br>

    • Tempoh pembiayaan 9 tahun

    <br>

    • Anggaran kadar faedah semasa 2.2% setahun

    <br><br>

    Kelayakan pembiayaan dan ansuran sebenar adalah tertakluk kepada
    penilaian institusi kewangan, rekod CCRIS/CTOS, komitmen kewangan
    semasa, margin pembiayaan yang diluluskan serta kadar faedah yang
    berkuat kuasa pada waktu permohonan.

    <br><br>

    Untuk semakan yang lebih tepat, sila hubungi Ridzuan BYD Miri.

  </p>

  <div class="footer-note">

    © 2026 Ridzuan BYD Miri. All Rights Reserved.

  </div>

</div>
  

  `;

  resultSection.classList.remove(
  "hidden"
);

document
.querySelectorAll(".eligible-item")
.forEach(card => {

  card.addEventListener(
    "click",
    () => {

      const selectedId =
        card.dataset.modelId;

      const chosenModel =
        currentEligible.find(
          model =>
          model.id === selectedId
        );

      if (!chosenModel) return;

      selectedModel =
        chosenModel;

      renderResults();

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

      renderResults();

    }
  );

}

}