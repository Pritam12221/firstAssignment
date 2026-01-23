const dialog = document.getElementById("addDocument");
const navAdd = document.querySelector(".navAdd");
const addDocumentBtn = document.getElementById("addDocumentbutton");
const table = document.querySelector("tbody");
const addName = document.getElementById("addName");
const addStatus = document.getElementById("addStatus");
const newDate = document.getElementById("newDate");
const newTime = document.getElementById("newTime");
const drop = document.getElementsByClassName("profile-logo")[0];
const logOut = document.getElementById("dropdownMenu");
const arrowDown = document.getElementById("arrowDown");
const addPeople = document.getElementById("addPeople");
const navigation = document.querySelectorAll(".navigation");
const cancelBtn = document.getElementById("cancelBtn");
const form = dialog.querySelector("form");
const dialogTitle = dialog.querySelector("h2");
const submitBtn = document.getElementById("addDocumentbutton");
const classifier = {

  "Needs Signing": {
    badgeClass: "needs-signing",
    btnClass: "primary",
    btnText: "Sign now",
    showPeople: false
  },
  "Pending": {
    badgeClass: "pending",
    btnClass: "outline",
    btnText: "Preview",
    showPeople: true
  },
  "Completed": {
    badgeClass: "completed",
    btnClass: "outline",
    btnText: "Download PDF",
    showPeople: false
  }

};

//need to see
// const dataSchema = [{
//   name: "",
//   status: "",
//   date: "",
//   time: "",
//   people: status === "Pending" ? people : null
// }]

const localKey = "scrkey"
let editingId = null;

function getDocuments() {
  return JSON.parse(localStorage.getItem(localKey)) || [];
}

function saveDocuments(docs) {
  localStorage.setItem(localKey, JSON.stringify(docs));
}


function deleteDocumentById(id) {
  const docs = getDocuments();
  const updatedDocs = docs.filter(doc => doc.id !== id);
  saveDocuments(updatedDocs);
  loadDocuments();
}

function getDocumentById(id) {
  const docs = getDocuments();
  return docs.find(doc => doc.id === id);
}

function editDocumentById(id) {
  const doc = getDocumentById(id);
  if (!doc) return;

  editingId = id;

  addName.value = doc.name;
  addStatus.value = doc.status;
  newDate.value = doc.date;
  newTime.value = doc.time;
  addPeople.value = doc.people || "";

  statusChange();

  submitBtn.textContent = "Update";
  dialogTitle.textContent = "Edit Document";
  dialog.showModal();
}

function update(doc) {
  const cfg = classifier[doc.status] || classifier["Needs Signing"];

  return `
      <tr data-id="${doc.id}">
        <td class="firstTop">
          <input type="checkbox" />
          <p>${doc.name}</p>
        </td>
  
        <td>
          <span class="badge ${cfg.badgeClass}">
            ${doc.status || "Needs Signing"}
          </span>
  
          ${cfg.showPeople
      ? `<div class="subtext">
                   <i class="bluredText">Waiting for&nbsp;</i>
                   ${doc.people} person
                 </div>`
      : ""
    }
        </td>
  
        <td>
          ${doc.date || ""}<br>
          <span class="time">${doc.time || ""}</span>
        </td>
  
        <td class="actions">
          <button class="btn ${cfg.btnClass}">
            ${cfg.btnText}
          </button>
  
          <span class="dots">
            ⋮
            <div class="navigation">
              <div class="dots-items edit" data-id="${doc.id}">
                <i class="fa-solid fa-pen-to-square"></i>
              </div>
              <div class="dots-items delete" data-id="${doc.id}">
                <i class="fa-solid fa-trash"></i>
              </div>
            </div>
          </span>
        </td>
      </tr>
    `;
}

function loadDocuments() {
  const docs = getDocuments();
  table.innerHTML = "";
  docs.forEach(doc => {
    table.insertAdjacentHTML("beforeend", update(doc));
  });
}


function addDocument() {
  const name = addName.value;
  const status = addStatus.value;
  const date = newDate.value;
  const time = newTime.value;
  const people = addPeople.value;

  //base case
  if (!name || !status || !date || !time) return;

  const docs = getDocuments();

  if (editingId !== null) {
    const doc = {
      id: editingId,
      name,
      status,
      date,
      time,
      people: status === "Pending" ? people : null
    };

    const updatedDocs = docs.map(d => d.id === editingId ? doc : d);
    saveDocuments(updatedDocs);
    editingId = null;
    loadDocuments();
  } else {
    const doc = {
      id: crypto.randomUUID(),name,
      status,
      date,
      time,
      people: status === "Pending" ? people : null
    };
    docs.push(doc);
    saveDocuments(docs);
    table.insertAdjacentHTML("beforeend", update(doc));
  }
}

function toggleLogOut() {
  logOut.style.display = logOut.style.display === "none" ? "block" : "none";
  arrowDown.style.transform = arrowDown.style.transform === "rotate(0deg)" ? "rotate(180deg)" : "rotate(0deg)"
}

function statusChange() {
  if (addStatus.value === "Pending") {
    addPeople.style.display = "block";
  }
  else {
    addPeople.style.display = "none";
    addPeople.value = "";
  }
}

function renderDialog() {
  form.reset();
  addPeople.style.display = "none";
  editingId = null;
  if (submitBtn) submitBtn.textContent = "Add";
  if (dialogTitle) dialogTitle.textContent = "Add Document";
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  addDocument();
  dialog.close();
});

navAdd.addEventListener("click", () => {
  dialog.showModal();
});

cancelBtn.addEventListener("click", () => {
  renderDialog();
  dialog.close();
});


addStatus.addEventListener('change', function () {
  statusChange();
})

drop.addEventListener("click", function () {
  toggleLogOut();
})


if (table) {
  table.addEventListener("click", (e) => {
    const del = e.target.closest(".delete");
    const edit = e.target.closest(".edit");
    const dots = e.target.closest(".dots");

    // del
    if (del) {
      e.stopPropagation();
      const id = del.dataset.id;
      if (id) {
        deleteDocumentById(id);
      }
      return;
    }

    // edit
    if (edit) {
      e.stopPropagation();
      const id = edit.dataset.id;
      if (id) {
        editDocumentById(id);
      }
      return;
    }

    // dots 
    if (dots) {
      e.stopPropagation();
      const nav = dots.querySelector(".navigation");
      if (nav) {
        nav.classList.toggle("show");
      }
      return;
    }
  });
}


loadDocuments();
