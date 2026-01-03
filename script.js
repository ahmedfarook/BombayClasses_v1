const $ = id => document.getElementById(id);
const suggestionsBox = document.getElementById("studentSuggestions");
let activeIndex = -1;
let currentMatches = [];


/* ========= GENERATE RECEIPT ========= */

function generate() {
    let required = ['studentname', 'amount', 'paymentfor', 'standard'];
    let ok = true;

    required.forEach(id => {
        let el = $(id);
        if (!el.value.trim()) {
            el.classList.add('error');
            ok = false;
        } else el.classList.remove('error');
    });

    if (!ok) return alert("Fill required fields");

    let date = new Date().toLocaleDateString('en-GB');

    $("receipt").innerHTML = `
        <div class="title">BOMBAY COACHING CLASSES</div>
        <div class="center small">G101, Ashiyana Complex, Adajan Patiya, Surat</div>
        <div class="center small">Contact: 9819484931</div>
        <div class="receipt-title">FEES RECEIPT</div>
        <hr>
        <div class="line"><b>Date:</b> ${date}</div>
        <div class="line"><b>Student:</b> ${$("studentname").value}</div>
        <div class="line"><b>Standard:</b> ${$("standard").value}</div>
        <div class="line"><b>Payment For:</b> ${$("paymentfor").value}</div>
        <div class="line"><b>Amount:</b> ₹${$("amount").value}</div>
        <div class="line"><b>Mode:</b> ${$("mode").value}</div>
        <div class="line"><b>Received By:</b> ${$("receivedby").value}</div>
        <div class="line"><b>Note:</b> ${$("note").value}</div>
        <br><b>Thank you!</b>
    `;

    $("receipt").classList.remove("hidden");
}

/* ========= DOWNLOAD JPG ========= */

function generateAndUploadJPG() {
    const receipt = document.getElementById("receipt");

    if (!receipt || receipt.classList.contains("hidden")) {
        alert("Pehle receipt generate karo");
        return;
    }

    html2canvas(receipt).then(canvas => {
        // ---------- 1) LOCAL DOWNLOAD ----------
        const fileName =
            document.getElementById("studentname").value + "_receipt.jpg";

        const downloadLink = document.createElement("a");
        downloadLink.href = canvas.toDataURL("image/jpeg", 0.9);
        downloadLink.download = fileName;
        downloadLink.click();

        // ---------- 2) UPLOAD TO WORKER ----------
        const imageBase64 = canvas.toDataURL("image/jpeg", 0.9);

        fetch("https://bombay-classes-api.ahmedgaziyani.workers.dev/save", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                student: document.getElementById("studentname").value,
                amount: document.getElementById("amount").value,
                mode: document.getElementById("mode").value,
                image: imageBase64
            })
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    console.log("Upload success:", data.imageUrl);
                } else {
                    alert("Upload failed");
                }
            })
            .catch(err => {
                console.error(err);
                alert("Upload error");
            });
    });
}


/* ========= PRINT ========= */

/* 
function printReceipt() {
    let receipt = $("receipt");
    if (receipt.classList.contains("hidden"))
        return alert("Generate first");

    let w = window.open("");
    w.document.write(receipt.outerHTML);
    w.print();
    w.close();
}
*/
/* ========= HISTORY (READ ONLY) ========= */

let fullHistory = [];
let historyIndex = 0;
const PAGE_SIZE = 5;

async function openHistory() {
    const currentYear = new Date().getFullYear();
    const lastYear = (new Date().getFullYear()) -1;
    const panel = document.getElementById("historyPanel");

    panel.innerHTML = "Loading...";
    panel.style.display = "block";

    //const res = await fetch(
        //`https://bombay-classes-api.ahmedgaziyani.workers.dev/history/${year}`
    //);
    const [currentRes, lastRes] = await Promise.all([
    fetch(`https://bombay-classes-api.ahmedgaziyani.workers.dev/history/${currentYear}`),
    fetch(`https://bombay-classes-api.ahmedgaziyani.workers.dev/history/${lastYear}`)
     ]);
    const currentData = await currentRes.json();
    const lastData = await lastRes.json();
    const combinedData = [...lastData, ...currentData];
    const data = combinedData;

    // latest first
    fullHistory = data.reverse();
    historyIndex = 0;

    renderHistory();
}

function renderHistory() {
    const panel = document.getElementById("historyPanel");

    let html = `
    <table border="1" width="100%" cellspacing="0" cellpadding="6">
      <tr>
        <th>#</th>
        <th>Student</th>
        <th>Amount</th>
        <th>Date</th>
        <th>View</th>
      </tr>
  `;

    const slice = fullHistory.slice(0, historyIndex + PAGE_SIZE);
    historyIndex = slice.length;

    slice.forEach((x, i) => {
        html += `
      <tr>
        <td>${i + 1}</td>
        <td>${x.student}</td>
        <td>₹${x.amount}</td>
        <td>${x.date}</td>
        <td>
          <a href="https://bombay-classes-api.ahmedgaziyani.workers.dev/image/${x.id}"
             <td class="icon-col">
                <svg class="folder-icon" xmlns="http://www.w3.org/2000/svg"
                    width="20" height="20" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="1.8"
                    stroke-linecap="round" stroke-linejoin="round">
                    <path d="M3 7h5l2 3h11v9a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2z"/>
                </svg>
            </td>
        </td>
      </tr>
    `;
    });

    html += "</table>";

    if (historyIndex < fullHistory.length) {
        html += `
      <button onclick="renderHistory()"
        style="margin-top:10px;width:100%;padding:10px;
        background:#111;color:#fff;border:none;border-radius:8px;">
        Show More
      </button>
    `;
    }

    panel.innerHTML = html;
}
document.addEventListener("DOMContentLoaded", () => {

  const STUDENT_API = "https://studentdb.ahmedgaziyani.workers.dev/";
  let students = [];
  let selectedStudentId = null;
  let activeIndex = -1;
  let currentMatches = [];

  const studentNameInput = document.getElementById("studentname");
  const stdInput = document.getElementById("standard");
  const suggestionsBox = document.getElementById("studentSuggestions");

  // ✅ 1️⃣ selectStudent pehle define
  function selectStudent(student) {
  studentNameInput.value = student.name;
  stdInput.value = student.std;
  selectedStudentId = student.id;

  suggestionsBox.innerHTML = "";
  suggestionsBox.style.display = "none";
}


  // load students
  fetch(STUDENT_API)
    .then(res => res.json())
    .then(data => {
      students = data;
      console.log("Students ready:", students);
    });

  // input autocomplete
studentNameInput.addEventListener("input", () => {
  const value = studentNameInput.value.toLowerCase();
  suggestionsBox.innerHTML = "";
  activeIndex = -1;

  if (!value) {
    suggestionsBox.style.display = "none";
    return;
  }

  currentMatches = students.filter(s =>
    s.name.toLowerCase().includes(value)
  );

  if (!currentMatches.length) {
    suggestionsBox.style.display = "none";
    return;
  }

  suggestionsBox.style.display = "block";

  currentMatches.forEach(student => {
    const div = document.createElement("div");
    div.textContent = `${student.name} — ${student.std}`;
    div.onmousedown = () => selectStudent(student);
    suggestionsBox.appendChild(div);
  });
});

  // keyboard support
  studentNameInput.addEventListener("keydown", (e) => {
    const items = suggestionsBox.children;
    if (!items.length) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      activeIndex = (activeIndex + 1) % items.length;
      highlight(items);
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      activeIndex = (activeIndex - 1 + items.length) % items.length;
      highlight(items);
    }

    if (e.key === "Enter" && activeIndex > -1) {
      e.preventDefault();
      selectStudent(currentMatches[activeIndex]);
    }
  });

  function highlight(items) {
    Array.from(items).forEach((el, i) => {
      el.style.background = i === activeIndex ? "#e5e7eb" : "#fff";
    });
  }

});



