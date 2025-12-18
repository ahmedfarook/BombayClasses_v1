// GitHub config
const GH_USER = "ahmedfarook";
const GH_REPO = "BombayClasses";
const GH_FOLDER = "receipts";
const GH_HISTORY = "history";
const GH_TOKEN = "REPLACE_WITH_TOKEN";

function generate(){
    let required = ['name','amount','paymentfor','standard'];
    let ok = true;

    required.forEach(id=>{
        let el = document.getElementById(id);
        if(!el.value.trim()){
            el.classList.add('error');
            ok = false;
        } else el.classList.remove('error');
    });

    if(!ok) return alert("Fill required fields");

    let date = new Date().toLocaleDateString('en-GB');
    let receipt = document.getElementById("receipt");

    receipt.innerHTML = `
        <div class="title">BOMBAY COACHING CLASSES</div>
        <div class="center small">G101, Ashiyana Complex, Adajan Patiya, Surat</div>
        <div class="center small">Contact: 9819484931</div>
        <hr>
        <div class="line"><b>Date:</b> ${date}</div>
        <div class="line"><b>Student:</b> ${name.value}</div>
        <div class="line"><b>Standard:</b> ${standard.value}</div>
        <div class="line"><b>Payment For:</b> ${paymentfor.value}</div>
        <div class="line"><b>Amount:</b> ₹${amount.value}</div>
        <div class="line"><b>Mode:</b> ${mode.value}</div>
        <div class="line"><b>Note:</b> ${note.value}</div>
        <br><b>Thank you!</b>
    `;

    receipt.classList.remove("hidden");
}

function downloadJPG(){
    let receipt = document.getElementById("receipt");
    if(receipt.classList.contains("hidden")) return alert("Generate first");

    html2canvas(receipt).then(canvas=>{
        let file = `${name.value}_${paymentfor.value}.jpg`;
        let a = document.createElement("a");
        a.download = file;
        a.href = canvas.toDataURL("image/jpeg");
        a.click();
    });
}

function printReceipt(){
    let receipt = document.getElementById("receipt");
    if(receipt.classList.contains("hidden")) return alert("Generate first");
    let w = window.open("");
    w.document.write(receipt.outerHTML);
    w.print();
    w.close();
}

/* HISTORY WITH SHOW MORE */

async function openHistory(){
    let year = new Date().getFullYear();
    let url = `https://raw.githubusercontent.com/${GH_USER}/${GH_REPO}/main/${GH_HISTORY}/${year}.json`;

    let panel = document.getElementById("historyPanel");
    panel.innerHTML = "Loading...";
    panel.classList.remove("hidden");

    let data = await fetch(url).then(r=>r.json());
    window.fullHistory = data.reverse();
    window.historyIndex = 0;

    renderHistory();
}

function renderHistory(){
    let panel = document.getElementById("historyPanel");
    let html = `<h3>${new Date().getFullYear()} - History</h3>`;

    let slice = window.fullHistory.slice(0, window.historyIndex + 5);
    window.historyIndex = slice.length;

    slice.forEach(x=>{
        html += `
        <div class="history-card">
            <b>${x.id}. ${x.name} (Std ${x.std})</b><br>
            Amount: ₹${x.amt}<br>
            For: ${x.for}<br>
            Mode: ${x.PaymentMode}<br>
            Date: ${x.date}<br>
            <a target="_blank" href="https://raw.githubusercontent.com/${GH_USER}/${GH_REPO}/main/${GH_FOLDER}/${x.file}">Open Receipt</a>
        </div>`;
    });

    if(window.historyIndex < window.fullHistory.length){
        html += `<button onclick="renderHistory()">Show More</button>`;
    }

    panel.innerHTML = html;
}
