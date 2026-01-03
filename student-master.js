const API_URL = "https://studentdb.ahmedgaziyani.workers.dev/";

document.addEventListener("DOMContentLoaded", () => {

  let students = [];
  let editStudentId = null;

  const nameInput = document.getElementById("name");
  const stdInput = document.getElementById("std");
  const studentList = document.getElementById("studentList");
  const addBtn = document.getElementById("addStudentBtn");

  // ADD / UPDATE
  addBtn.addEventListener("click", () => {
    const name = nameInput.value.trim();
    const std = stdInput.value;

    if (!name || !std) {
      alert("Name aur STD dono bhar bhai");
      return;
    }

    if (editStudentId) {
      // UPDATE
      const student = students.find(s => s.id === editStudentId);
      student.std = std;

      editStudentId = null;
      addBtn.innerText = "Add Student";
      nameInput.disabled = false;

    } else {
      // ADD
      students.push({
        id: Date.now(),
        name,
        std
      });
    }

    renderStudents();
    saveStudents();
    nameInput.value = "";
    stdInput.value = "";
  });

  function renderStudents() {
    studentList.innerHTML = "";

    students.forEach(s => {
      const tr = document.createElement("tr");

      tr.innerHTML = `
        <td>${s.name}</td>
        <td>${s.std}</td>
        <td>
          <button onclick="editStudent(${s.id})">Edit</button>
          <button onclick="deleteStudent(${s.id})">Delete</button>
        </td>
      `;

      studentList.appendChild(tr);
    });
  }

  // EDIT
  window.editStudent = function (id) {
    const student = students.find(s => s.id === id);
    if (!student) return;

    nameInput.value = student.name;
    stdInput.value = student.std;

    nameInput.disabled = true; // name lock
    addBtn.innerText = "Update Student";
    editStudentId = id;
  };

  // DELETE
  window.deleteStudent = function (id) {
    students = students.filter(s => s.id !== id);
    renderStudents();
    saveStudents();

  };


  async function loadStudents() {
  try {
    const res = await fetch(API_URL);
    const data = await res.json();
    students = data || [];
    renderStudents();
  } catch (err) {
    console.error("Failed to load students", err);
  }
  console.log("Loaded students:", data);

}
loadStudents();

async function saveStudents() {
  try {
    await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(students)
    });
  } catch (err) {
    console.error("Failed to save students", err);
  }
}

});
