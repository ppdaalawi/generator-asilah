// ELEMENT
const questions      = document.querySelector('.questions');
const semesterSelect = document.getElementById('semesterSelect');
const tahunSelect    = document.getElementById('tahunInput');
const kelasSelect    = document.getElementById('kelasSelect');
const fanInput       = document.getElementById('fanInput');
const soalInput      = document.getElementById('soalInput');
const addSoalBtn     = document.getElementById('addSoal');
const downloadBtn    = document.getElementById('downloadPdf');
const dragSoalBtn    = document.getElementById('dragSoal');
const clearSoalBtn   = document.getElementById('clearSoal');
const latinSizeInput = document.getElementById('latinSize');
const arabSizeInput  = document.getElementById('arabSize');
const gapInput       = document.getElementById('soalGap');

const semesterKop = document.getElementById('semesterKop');
const tahunKop    = document.getElementById('tahunKop');
const kelasValue  = document.getElementById('kelasValue');
const fanValue    = document.getElementById('fanValue');

const STORAGE_KEY = 'ujian_f4_autosave';

// MODAL
const modal = document.getElementById('modalTitle');
const modalOk = document.getElementById('modalOk');
const modalCancel = document.getElementById('modalCancel');
const customTitle = document.getElementById('customTitle');

// ================== TAHUN AJARAN ==================
(function generateTahun() {
    const now = new Date().getFullYear();
    const opsi = [`${now-1}/${now}`, `${now}/${now+1}`];
    tahunSelect.innerHTML = `<option value="">--Pilih Tahun--</option>` + opsi.map(v=>`<option value="${v}">${v}</option>`).join('');
})();

// ================== UTIL ==================
function isArabic(text){ return /[\u0600-\u06FF]/.test(text); }

// ================== AUTOSAVE ==================
function saveState(){
    const data={semester:semesterSelect.value,tahun:tahunSelect.value,kelas:kelasSelect.value,fan:fanInput.value,
        latinSize:latinSizeInput.value,arabSize:arabSizeInput.value,gap:gapInput.value,
        soal:[...questions.children].map(q=>({type:q.classList.contains('arab')?'arab':'latin',text:q.querySelector('.text').textContent}))
    };
    localStorage.setItem(STORAGE_KEY,JSON.stringify(data));
}
function loadState(){
    const raw=localStorage.getItem(STORAGE_KEY); if(!raw)return;
    const data=JSON.parse(raw);
    semesterSelect.value=data.semester||'';
    tahunSelect.value=data.tahun||'';
    kelasSelect.value=data.kelas||'';
    fanInput.value=data.fan||'';
    latinSizeInput.value=data.latinSize||12;
    arabSizeInput.value=data.arabSize||16;
    gapInput.value=data.gap||18;
    semesterKop.textContent=data.semester||'';
    tahunKop.textContent=data.tahun?`TAHUN PELAJARAN ${data.tahun}`:'';
    kelasValue.textContent=data.kelas||'';
    fanValue.textContent=data.fan||'';
    applySettings(); questions.innerHTML='';
    (data.soal||[]).forEach(s=>{
        const q=document.createElement('div'); q.className=`question ${s.type}`;
        const n=document.createElement('div'); n.className='number';
        const t=document.createElement('div'); t.className='text'; t.contentEditable=true; t.textContent=s.text;
        t.addEventListener('input',saveState);
        q.append(n,t); questions.appendChild(q);
    });
}

// ================== KOP & INFO ==================
[semesterSelect,tahunSelect,kelasSelect,fanInput].forEach(el=>{
    el.addEventListener('change',()=>{ 
        semesterKop.textContent=semesterSelect.value;
        tahunKop.textContent=tahunSelect.value?`TAHUN PELAJARAN ${tahunSelect.value}`:'';
        kelasValue.textContent=kelasSelect.value;
        fanValue.textContent=fanInput.value;
        saveState();
    });
});

// ================== TAMBAH SOAL ==================
addSoalBtn.addEventListener('click',()=>{
    const soalText=soalInput.value.trim(); if(!soalText) return;
    const question=document.createElement('div'); question.className='question '+(isArabic(soalText)?'arab':'latin');
    const number=document.createElement('div'); number.className='number';
    const text=document.createElement('div'); text.className='text'; text.contentEditable=true; text.textContent=soalText;
    text.addEventListener('input',saveState);
    question.append(number,text); questions.appendChild(question);
    soalInput.value=''; soalInput.focus();
    saveState();
});

soalInput.addEventListener('input', () => {
    if (isArabic(soalInput.value)) {
        soalInput.classList.add('rtl');
    } else {
        soalInput.classList.remove('rtl');
    }
});


// ================== FONT & GAP ==================
function applySettings(){
    questions.style.setProperty('--latin-size',`${latinSizeInput.value}pt`);
    questions.style.setProperty('--arab-size',`${arabSizeInput.value}pt`);
    questions.style.setProperty('--soal-gap',`${gapInput.value}pt`);
    saveState();
}
[latinSizeInput,arabSizeInput,gapInput].forEach(el=>el.addEventListener('input',applySettings));

// ================== RESET ==================
function resetDefault(){
    if(!confirm('Yakin reset semua data?')) return;
    localStorage.removeItem(STORAGE_KEY); location.reload();
}

// ================== DRAG & DROP ==================
let sortable=null;
dragSoalBtn.addEventListener('click',()=>{
    if(sortable){ sortable.destroy(); sortable=null; dragSoalBtn.textContent='Urutkan Soal'; }
    else{
        sortable=Sortable.create(questions,{animation:150,handle:'.number',onEnd:saveState});
        dragSoalBtn.textContent='Selesai Urutkan';
    }
});

// ================== DOWNLOAD PDF ==================
downloadBtn.addEventListener('click',()=>{
    // buat judul default
    const thn = tahunSelect.value
        ? tahunSelect.value.split('/').map(x=>x.slice(-2)).join('-')
        : '';

    const defaultTitle = `${kelasSelect.value || 'Kelas'} ${fanInput.value || 'Fan'}`;

    // reset input & set placeholder
    customTitle.value = '';
    customTitle.placeholder = defaultTitle;

    modal.style.display = 'flex';
    customTitle.focus();
});

modalCancel.addEventListener('click',()=>{
    modal.style.display='none';
});

modalOk.addEventListener('click', async ()=>{
    modal.style.display='none';

    // ambil input, fallback ke placeholder
    let filename = customTitle.value.trim() || customTitle.placeholder;

    // amankan nama file
    filename = filename.replace(/[\\/:*?"<>|]/g,'_');

    const paper = document.querySelector('.paper');
    await new Promise(r=>setTimeout(r,300));

    const canvas = await html2canvas(paper,{
        scale:2,
        useCORS:true,
        backgroundColor:'#ffffff'
    });

    const imgData = canvas.toDataURL('image/jpeg',1);
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({
        orientation:'portrait',
        unit:'mm',
        format:[210,330]
    });

    pdf.addImage(imgData,'JPEG',0,0,210,330);
    pdf.save(filename + '.pdf');
});

// LOAD AUTO
loadState();
const confirmModal  = document.getElementById('confirmModal');
const confirmText   = document.getElementById('confirmText');
const confirmOk     = document.getElementById('confirmOk');
const confirmCancel = document.getElementById('confirmCancel');

clearSoalBtn.addEventListener('click',()=>{
  confirmText.textContent = 'Hapus semua soal?';
  confirmModal.style.display = 'flex';

  confirmOk.onclick = ()=>{
    confirmModal.style.display = 'none';
    questions.innerHTML='';
    saveState();
  };

  confirmCancel.onclick = ()=>{
    confirmModal.style.display = 'none';
  };
});

function resetDefault(){
  confirmText.textContent = 'Reset semua data?';
  confirmModal.style.display = 'flex';

  confirmOk.onclick = ()=>{
    confirmModal.style.display = 'none';
    localStorage.removeItem(STORAGE_KEY);
    location.reload();
  };

  confirmCancel.onclick = ()=>{
    confirmModal.style.display = 'none';
  };
}
