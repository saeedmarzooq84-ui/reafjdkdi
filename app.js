
const app = document.getElementById("app") || document.body;

let currentReview = null;
let currentIndex = 0;
let answered = new Set();
let currentQuestions = [];

const saved = JSON.parse(localStorage.getItem("mathAnswered") || "[]");
answered = new Set(saved);

const style = document.createElement("style");
style.textContent = `
  .math-app { direction:rtl; max-width:850px; margin:auto; padding:18px; font-family:Arial,sans-serif; }
  .math-app button { cursor:pointer; border:0; border-radius:12px; padding:12px 18px; font-size:16px; }
  .math-title { text-align:center; margin:18px 0; }
  .math-card { background:var(--card-bg,#f4f6fa); color:var(--text-color,#172033); border-radius:18px; padding:18px; margin:14px 0; }
  .math-options { display:grid; gap:10px; margin-top:18px; }
  .math-option { display:flex; align-items:center; gap:12px; text-align:right; background:var(--option-bg,#fff); color:var(--text-color,#172033); border:1px solid #aaa !important; width:100%; }
  .math-number { background:#2878d0; color:white; border-radius:8px; padding:7px 12px; }
  .math-image { max-width:110px; max-height:100px; object-fit:contain; cursor:zoom-in; border-radius:8px; }
  .math-question-head { display:flex; align-items:flex-start; gap:14px; }
  .math-actions { display:flex; flex-wrap:wrap; gap:10px; justify-content:space-between; margin-top:18px; }
  .math-primary { background:#1769c2; color:white; }
  .math-secondary { background:#dce8f7; color:#12345a; }
  .math-review { width:100%; margin:8px 0; background:#1769c2; color:white; }
  .math-muted { opacity:.75; font-size:14px; }
  .math-modal { position:fixed; inset:0; z-index:9999; background:#000d; display:flex; align-items:center; justify-content:center; padding:15px; }
  .math-modal img { max-width:95vw; max-height:90vh; object-fit:contain; }
`;
document.head.appendChild(style);

function saveProgress() {
  localStorage.setItem("mathAnswered", JSON.stringify([...answered]));
}

function getQuestions(review) {
  return questions.filter(q => Number(q.review) === Number(review));
}

function renderHome() {
  currentReview = null;
  app.innerHTML = `
    <main class="math-app">
      <h1 class="math-title">هيكل الرياضيات 📘</h1>
      <p class="math-title math-muted">
        تم إنشاؤه بواسطة معلمي الرياضيات – مدرسة البريرات – الحلقة الثانية بنين
      </p>
      <div class="math-card">
        <h3>نسخة مراجعة مرتبطة بالملزمة الأصلية</h3>
        <p class="math-muted">اختر المراجعة التي تريد البدء بها.</p>
      </div>
      <button class="math-review" data-review="0">المراجعة الأولى</button>
      <button class="math-review" data-review="1">المراجعة الثانية</button>
      <button class="math-review" data-review="2">المراجعة الثالثة</button>
      <div class="math-card">
        <h3>إنجازك</h3>
        <p>عدد الأسئلة التي أجبت عنها: ${answered.size}</p>
        <button class="math-secondary" id="show-results">عرض النتائج</button>
      </div>
    </main>
  `;

  app.querySelectorAll("[data-review]").forEach(button => {
    button.addEventListener("click", () => {
      startReview(Number(button.dataset.review));
    });
  });

  document.getElementById("show-results").addEventListener("click", renderResults);
}

function startReview(review) {
  currentReview = review;
  currentQuestions = getQuestions(review);
  currentIndex = 0;

  if (!currentQuestions.length) {
    alert("لا توجد أسئلة في هذه المراجعة. تأكد من ملف questions.js");
    return;
  }

  renderQuestion();
}

function renderQuestion() {
  const q = currentQuestions[currentIndex];
  const questionNumber = currentIndex + 1;
  const imageHTML = q.img
    ? `<img class="math-image" src="${q.img}" alt="صورة السؤال" id="question-image">`
    : "";

  const optionsHTML = Array.isArray(q.options) && q.options.length
    ? q.options.map((option, index) => `
        <button class="math-option" type="button">
          <span class="math-number">${index + 1}</span>
          <span>${option}</span>
        </button>
      `).join("")
    : `<p class="math-muted">هذا السؤال كتابي. اكتب إجابتك في ورقتك.</p>`;

  app.innerHTML = `
    <main class="math-app">
      <div class="math-actions">
        <button class="math-secondary" id="home-button">الرئيسية</button>
        <span class="math-muted">السؤال ${questionNumber} من ${currentQuestions.length}</span>
      </div>

      <div class="math-card">
        <div class="math-question-head">
          ${imageHTML}
          <div>
            <h3>السؤال ${questionNumber}</h3>
            <p>${q.text || "لا يوجد نص للسؤال"}</p>
          </div>
        </div>
      </div>

      <div class="math-card">
        <h3>الإجابات</h3>
        <div class="math-options">${optionsHTML}</div>
      </div>

      <p class="math-muted">
        تم تسجيل الإجابة عند الضغط على أحد الخيارات، دون إظهار صح أو خطأ.
      </p>

      <div class="math-actions">
        <button class="math-secondary" id="previous-button">السابق</button>
        <button class="math-primary" id="next-button">
          ${currentIndex === currentQuestions.length - 1 ? "إنهاء المراجعة" : "التالي"}
        </button>
      </div>
    </main>
  `;

  document.getElementById("home-button").addEventListener("click", renderHome);

  document.getElementById("previous-button").addEventListener("click", () => {
    if (currentIndex > 0) {
      currentIndex--;
      renderQuestion();
    }
  });

  document.getElementById("next-button").addEventListener("click", () => {
    if (currentIndex < currentQuestions.length - 1) {
      currentIndex++;
      renderQuestion();
    } else {
      renderResults();
    }
  });

  app.querySelectorAll(".math-option").forEach(button => {
    button.addEventListener("click", () => {
      answered.add(q.id);
      saveProgress();
      button.style.border = "2px solid #2878d0";
    });
  });

  const image = document.getElementById("question-image");
  if (image) {
    image.addEventListener("click", () => {
      const modal = document.createElement("div");
      modal.className = "math-modal";
      modal.innerHTML = `<img src="${q.img}" alt="صورة السؤال مكبرة">`;
      modal.addEventListener("click", () => modal.remove());
      document.body.appendChild(modal);
    });
  }
}

function renderResults() {
  const total = questions.length;
  const completed = answered.size;

  app.innerHTML = `
    <main class="math-app">
      <h1 class="math-title">نتائج المراجعة 📊</h1>
      <div class="math-card">
        <h2>عدد الأسئلة المجاب عنها</h2>
        <h1 class="math-title">${completed}</h1>
        <p>من أصل ${total} سؤال</p>
        <p class="math-muted">هذه إحصائية للإنجاز فقط، ولا تتضمن تصحيح الإجابات.</p>
      </div>
      <button class="math-primary" id="back-home">العودة للرئيسية</button>
    </main>
  `;

  document.getElementById("back-home").addEventListener("click", renderHome);
}

renderHome();
