// ================== ELEMENT ==================
const questions      = document.querySelector('.questions');
const semesterSelect = document.getElementById('semesterSelect');
const tahunSelect    = document.getElementById('tahunInput');
const kelasSelect    = document.getElementById('kelasSelect');
const fanInput       = document.getElementById('fanInput');
const soalInput      = document.getElementById('soalInput');
const addSoalBtn     = document.getElementById('addSoal');
const downloadBtn    = document.getElementById('downloadPdf');

const semesterKop = document.getElementById('semesterKop');
const tahunKop    = document.getElementById('tahunKop');
const kelasValue  = document.getElementById('kelasValue');
const fanValue    = document.getElementById('fanValue');

// ================== TAHUN AJARAN ==================
(function generateTahun() {
    const now = new Date().getFullYear();
    const opsi = [
        `${now - 1}/${now}`,
        `${now}/${now + 1}`
    ];

    tahunSelect.innerHTML =
        `<option value="">--Pilih Tahun--</option>` +
        opsi.map(v => `<option value="${v}">${v}</option>`).join('');
})();

// ================== KOP & INFO ==================
semesterSelect.addEventListener('change', () => {
    semesterKop.textContent = semesterSelect.value;
});

tahunSelect.addEventListener('change', () => {
    tahunKop.textContent = tahunSelect.value
        ? `TAHUN PELAJARAN ${tahunSelect.value}`
        : '';
});

kelasSelect.addEventListener('change', () => {
    kelasValue.textContent = kelasSelect.value;
});

fanInput.addEventListener('input', () => {
    fanValue.textContent = fanInput.value;
});

// ================== UTIL ==================
function isArabic(text) {
    return /[\u0600-\u06FF]/.test(text);
}

// ================== TAMBAH SOAL ==================
addSoalBtn.addEventListener('click', () => {
    const soalText = soalInput.value.trim();
    if (!soalText) return;

    const question = document.createElement('div');
    question.className = 'question ' + (isArabic(soalText) ? 'arab' : 'latin');

    const number = document.createElement('div');
    number.className = 'number';

    const text = document.createElement('div');
    text.className = 'text';
    text.contentEditable = true;
    text.textContent = soalText;

    question.append(number, text);
    questions.appendChild(question);

    soalInput.value = '';
    soalInput.focus();
});

// ================== FONT & GAP ==================
const latinSizeInput = document.getElementById('latinSize');
const arabSizeInput  = document.getElementById('arabSize');
const gapInput       = document.getElementById('soalGap');

function applySettings() {
    questions.style.setProperty('--latin-size', `${latinSizeInput.value}pt`);
    questions.style.setProperty('--arab-size',  `${arabSizeInput.value}pt`);
    questions.style.setProperty('--soal-gap',   `${gapInput.value}pt`);
}

[latinSizeInput, arabSizeInput, gapInput]
    .forEach(el => el.addEventListener('input', applySettings));

applySettings();

// ================== RESET ==================
function resetDefault() {
    latinSizeInput.value = 12;
    arabSizeInput.value  = 16;
    gapInput.value       = 18;
    applySettings();

    semesterSelect.value = '';
    tahunSelect.value    = '';
    kelasSelect.value    = '';
    fanInput.value       = '';

    semesterKop.textContent = '';
    tahunKop.textContent    = '';
    kelasValue.textContent  = '';
    fanValue.textContent    = '';

    questions.innerHTML = '';
}

// ================== DOWNLOAD PDF F4 ==================
downloadBtn.addEventListener('click', async () => {
    const paper = document.querySelector('.paper');

    await new Promise(r => setTimeout(r, 300));

    const canvas = await html2canvas(paper, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff'
    });

    const imgData = canvas.toDataURL('image/jpeg', 1);
    const { jsPDF } = window.jspdf;

    const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [210, 330] // F4
    });

    pdf.addImage(imgData, 'JPEG', 0, 0, 210, 330);
    pdf.save('ujian.pdf');
});