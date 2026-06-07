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

let currentEligible = [];
let recommendedModel = null;
let selectedModel = null;
let currentIncome = 0;
let currentDownpayment = 0;
let currentBudget = 0;
let currentTenure = 9;

checkBtn.addEventListener(
  "click",
  renderResults
);

resetBtn.addEventListener(
  "click",
  resetCalculator
);

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
  tenureYears = currentTenure
) {

  const loanAmount =
    price * (1 - APP_CONFIG.depositRate);

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

function calculateBudget(currentIncome) {

  return currentIncome *
    APP_CONFIG.eligibilityRatio;

}

function getBudgetMeter(
  monthly,
  budget
) {

  const displayUsage =
    Math.round(
      (monthly / budget) * 100
    );

  let color = "🟢";

  if (displayUsage > 85) {

    color = "🟠";

  } else if (displayUsage > 60) {

    color = "🔵";

  }

  let label =
    `${color} ${displayUsage}% Bajet Digunakan`;

  if (displayUsage > 100) {

    label =
      "🔴 Melebihi Bajet Disyorkan";

  }

  return {

    usage: displayUsage,

    position:
      Math.min(
        displayUsage,
        100
      ),

    label

  };

}

function renderResults() {

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

if (typeof gtag !== "undefined") {

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

if (typeof gtag !== "undefined") {

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
currentEligible.filter(
  model =>
  model.id !== selectedModel.id
);

  const priceAfterDownpayment =
Math.max(
  selectedModel.price -
  currentDownpayment,
  0
);

const monthly =
calculateMonthlyPayment(
  priceAfterDownpayment
);

const rebateData =
MODEL_REBATES[
  selectedModel.id
] || {
  rebate: 0
};

const rebate =
rebateData.rebate;

const finalPrice =
Math.max(
  priceAfterDownpayment -
  rebate,
  0
);

const monthlyAfterRebate =
calculateMonthlyPayment(
  finalPrice
);

const monthlySaving =
Math.round(
  monthly -
  monthlyAfterRebate
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

  const whatsappMessage = `Hi Ridzuan,

Saya baru menggunakan EV Loan Calculator.

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

Saya berminat untuk mengetahui kelayakan sebenar dan pilihan loan yang tersedia.`;

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

      Math.max(
        model.price -
        currentDownpayment -
        (
          MODEL_REBATES[
            model.id
          ]?.rebate || 0
        ),
        0
      )

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
    
    

    📱 Dapatkan Semakan Loan Percuma

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

  • Tempoh pembiayaan 9 tahun

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