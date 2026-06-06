const checkBtn =
document.getElementById("checkBtn");

const resultSection =
document.getElementById("resultSection");

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

function calculateBudget(income) {

  return income *
    APP_CONFIG.eligibilityRatio;

}

function renderResults() {

  const income =
    Number(
      document.getElementById("income").value
    );

  if (!income) return;

  const budget =
    calculateBudget(income);

  const eligible =
  MODELS.filter(model => {

    return (
      calculateMonthlyPayment(
        model.price
      ) <= budget
    );

  }).sort(
    (a, b) =>
    b.price - a.price
  );

  if (!eligible.length) {

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

  const featured =
    eligible[0];
    
  const alternatives =
  eligible.slice(1);

  const monthly =
    calculateMonthlyPayment(
      featured.price
    );

  const whatsappMessage =
encodeURIComponent(
`Hi Ridzuan,

Saya baru menggunakan BYD Miri EV Advisor.

Pendapatan Bersih Bulanan:
RM${income}

Cadangan Ridzuan:
${featured.name}

Boleh bantu saya dengan semakan loan yang lebih tepat?`
);

  resultSection.innerHTML = `

    <div class="calculator-card">

      <h3>
        Bajet Disyorkan
      </h3>

      <h2>
        ${formatCurrency(budget)}
      </h2>

    </div>

    <div class="featured-badge">
    ⭐ CADANGAN RIDZUAN
  </div>

  <h2>
    ${featured.name}
  </h2>

  <p>
    ${featured.positioning}
  </p>

  <p class="range-text">
    ${featured.range}
  </p>

  <div class="monthly-payment">
    ${formatCurrency(monthly)}
    / bulan
  </div>

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
      style="
      margin-top:15px;
      padding:12px;
      border:1px solid rgba(255,255,255,.08);
      border-radius:12px;
      ">

        <strong>
  ✓ ${model.name}
</strong>

        <br>

        <small>
          ${model.positioning}
        </small>

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

  

  `;

  resultSection.classList.remove(
    "hidden"
  );

}