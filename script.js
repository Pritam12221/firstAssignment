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
const inputSearch = document.querySelector(".inputSearch");
const bulkDeleteBtn = document.getElementById('bulkDeleteBtn');
const selectAllCheckbox = document.getElementById('selectAllCheckbox');
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
// const Schema = [{
//   name: "",
//   status: "",
//   date: "",
//   time: "",
//   people: status === "Pending" ? people : null
// }]

const localKey = "scrkey"
let editingId = null;

function getDocs() {
  return JSON.parse(localStorage.getItem(localKey)) || [];
}

function setDocs(docs) {
  localStorage.setItem(localKey, JSON.stringify(docs));
}


function deleteId(id) {
  const docs = getDocs();
  const updatedDocs = docs.filter(function (doc) { return doc.id !== id; });
  setDocs(updatedDocs);
  loadDocuments();
}

function getDocumentById(id) {
  const docs = getDocs();
  return docs.find(function (doc) { return doc.id === id });
}

function editId(id) {
  const doc = getDocumentById(id);
  if (!doc) return;//edge case agr doc nai mila

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
          <input type="checkbox" class="doc-checkbox" data-id="${doc.id}" />
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
                <span>Edit</span>
              </div>
              <div class="dots-items delete" data-id="${doc.id}">
                <i class="fa-solid fa-trash"></i>
                <span>Delete</span>
              </div>
            </div>
          </span>
        </td>
      </tr>
    `;
}

function loadDocuments(searchQuery = "") {
  const docs = getDocs();

  table.innerHTML = "";

  const filteredDocs = docs.filter(doc => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      doc.name.toLowerCase().includes(query) ||
      doc.status.toLowerCase().includes(query)
    );
  });

  if (filteredDocs.length === 0) {
    table.insertAdjacentHTML("beforeend", `
      <tr>
        <td colspan="4" class="no-items">
          No items to be loaded
        </td>
      </tr>
    `);
    updateBulkDeleteButton();
    return;
  }

  filteredDocs.forEach(doc => {
    table.insertAdjacentHTML("beforeend", update(doc));
  });

  updateBulkDeleteButton();
}


function addDocument() {
  const name = addName.value;
  const status = addStatus.value;
  const date = newDate.value;
  const time = newTime.value;
  const people = addPeople.value;

  //base case
  if (!name || !status || !date || !time) return;

  const docs = getDocs();

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
    setDocs(updatedDocs);
    editingId = null;
  } else {
    const doc = {
      id: crypto.randomUUID(),
      name,
      status,
      date,
      time,
      people: status === "Pending" ? people : null
    };
    docs.push(doc);
    setDocs(docs);
  }
  const currentSearch = inputSearch ? inputSearch.value : "";
  loadDocuments(currentSearch);
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
  if (submitBtn) submitBtn.textContent = "Add Document";
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

// Search filter 
if (inputSearch) {
  inputSearch.addEventListener("input", (e) => {
    const searchQuery = e.target.value;
    loadDocuments(searchQuery);
  });
}

if (table) {
  table.addEventListener("click", (e) => {
    //keeps bubbling in dom tree jb tk pass ka delete/edit/dots na mile
    const del = e.target.closest(".delete");
    const edit = e.target.closest(".edit");
    const dots = e.target.closest(".dots");

    // del
    if (del) {
      e.stopPropagation();
      const id = del.dataset.id;
      if (id) {
        deleteId(id);
      }
      return;
    }

    // edit
    if (edit) {
      e.stopPropagation();
      const id = edit.dataset.id;
      if (id) {
        editId(id);
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

function deleteSelectedDocuments() {
  const checkedBoxes = document.querySelectorAll('.doc-checkbox:checked');
  if (checkedBoxes.length === 0) return;

  const idsToDelete = Array.from(checkedBoxes).map(cb => cb.dataset.id);
  const docs = getDocs();
  const updatedDocs = docs.filter(doc => !idsToDelete.includes(doc.id));
  setDocs(updatedDocs);

  // Uncheck header checkbox
  const selectAllCheckbox = document.getElementById('selectAllCheckbox');
  if (selectAllCheckbox) {
    selectAllCheckbox.checked = false;
  }

  loadDocuments();
  updateBulkDeleteButton();
}

function updateBulkDeleteButton() {
  const checkedCount = document.querySelectorAll('.doc-checkbox:checked').length;
  const bulkDeleteBtn = document.getElementById('bulkDeleteBtn');
  if (bulkDeleteBtn) {
    bulkDeleteBtn.style.display = checkedCount > 0 ? 'block' : 'none';
  }
}

if (table) {
  table.addEventListener('change', (e) => {
    if (e.target.classList.contains('doc-checkbox')) {
      updateBulkDeleteButton();
    }
  });
}


if (bulkDeleteBtn) {
  bulkDeleteBtn.addEventListener('click', deleteSelectedDocuments);
}


if (selectAllCheckbox) {
  selectAllCheckbox.addEventListener('click', (e) => {
    const isChecked = e.target.checked;
    const allCheckboxes = document.querySelectorAll('.doc-checkbox');
    allCheckboxes.forEach(checkbox => {
      checkbox.checked = isChecked;
    });
    updateBulkDeleteButton();
  });
}

loadDocuments();
