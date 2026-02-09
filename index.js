export {};
const dialog = document.getElementById("addDocument");
const navAdd = document.querySelector(".navAdd");
const table = document.querySelector("tbody");
const addName = document.getElementById("addName");
const addStatus = document.getElementById("addStatus");
const newDate = document.getElementById("newDate");
const newTime = document.getElementById("newTime");
const drop = document.getElementsByClassName("profile-logo")[0];
const logOut = document.getElementById("dropdownMenu");
const arrowDown = document.getElementById("arrowDown");
const addPeople = document.getElementById("addPeople");
const cancelBtn = document.getElementById("cancelBtn");
const form = dialog === null || dialog === void 0 ? void 0 : dialog.querySelector("form");
const dialogTitle = dialog === null || dialog === void 0 ? void 0 : dialog.querySelector("h2");
const submitBtn = document.getElementById("addDocumentbutton");
const inputSearch = document.querySelector(".inputSearch");
const blkDelBtn = document.getElementById('blkDelBtn');
const selectAllCheckbox = document.getElementById('selectAllCheckbox');
const classifier = {
    "Needs Signing": {
        signinSt: "needs-signing",
        btnClass: "primary",
        btnText: "Sign now",
        showPeople: false
    },
    "Pending": {
        signinSt: "pending",
        btnClass: "outline",
        btnText: "Preview",
        showPeople: true
    },
    "Completed": {
        signinSt: "completed",
        btnClass: "outline",
        btnText: "Download PDF",
        showPeople: false
    }
};
const localKey = "scrkey";
let editingId = null;
function formatDateDisplay(dateStr) {
    if (typeof dateStr === "string") {
        if (dateStr.includes("/"))
            return dateStr; //if already formated
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) {
            return dateStr;
        }
        return d.toLocaleDateString("en-US", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
        });
    }
    else {
        return null;
    }
}
function renderDialog() {
    form === null || form === void 0 ? void 0 : form.reset();
    addPeople.style.display = "none";
    editingId = null;
    submitBtn.textContent = "Add";
    dialogTitle.textContent = "Add Document";
}
function getDocs() {
    const stored = localStorage.getItem(localKey);
    return stored ? JSON.parse(stored) : [];
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
    return docs.find(function (doc) { return doc.id === id; });
}
function editId(id) {
    const doc = getDocumentById(id);
    if (!doc)
        return; // edge case agr document nai mila
    editingId = id;
    if (!addName || !addStatus || !newDate || !newTime || !addPeople)
        addName.value = doc.name;
    addStatus.value = doc.status;
    newDate.value = doc.date;
    newTime.value = doc.time;
    addPeople.value = doc.people || "";
    statusChange();
    submitBtn.textContent = "Update";
    dialogTitle.textContent = "Edit Document";
    dialog === null || dialog === void 0 ? void 0 : dialog.showModal();
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
            <span class="badge ${cfg === null || cfg === void 0 ? void 0 : cfg.signinSt}">
                ${doc.status || "Needs Signing"}
            </span>
    
            ${(cfg === null || cfg === void 0 ? void 0 : cfg.showPeople)
        ? `<div class="subtext">
                    <i class="bluredText">Waiting for&nbsp;</i>
                    ${doc.people} person
                    </div>`
        : ""}
            </td>
    
            <td>
            ${formatDateDisplay(doc.date)}<br>
            <span class="time">${doc.time || ""}</span>
            </td>
    
            <td class="actions">
            <button class="btn ${cfg === null || cfg === void 0 ? void 0 : cfg.btnClass}">
                ${cfg === null || cfg === void 0 ? void 0 : cfg.btnText}
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
    if (!table)
        return;
    table.innerHTML = "";
    const filteredDocs = docs.filter(doc => {
        if (!searchQuery.trim())
            return true;
        const query = searchQuery.toLowerCase();
        return (doc.name.toLowerCase().includes(query) ||
            doc.status.toLowerCase().includes(query));
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
    if (!addName || !addStatus || !newDate || !newTime || !addPeople)
        return;
    const name = addName.value;
    const status = addStatus.value;
    const date = newDate.value;
    const time = newTime.value;
    const people = addPeople.value;
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
    }
    else {
        const doc = {
            id: crypto.randomUUID(),
            name,
            status,
            date,
            time,
            people: status === "Pending" ? people : null
        };
        setDocs([...docs, doc]);
    }
    const currentSearch = (inputSearch === null || inputSearch === void 0 ? void 0 : inputSearch.value) || "";
    loadDocuments(currentSearch);
}
function toggleLogOut() {
    if (!logOut || !arrowDown)
        return;
    logOut.style.display = logOut.style.display === "none" ? "block" : "none";
    arrowDown.style.transform = arrowDown.style.transform === "rotate(0deg)" ? "rotate(180deg)" : "rotate(0deg)";
}
function statusChange() {
    if (!addStatus || !addPeople)
        return;
    if (addStatus.value === "Pending") {
        addPeople.style.display = "block";
        addPeople.required = true;
    }
    else {
        addPeople.style.display = "none";
        addPeople.required = false;
        addPeople.value = "";
    }
}
function updateBulkDeleteButton() {
    const checkedCount = document.querySelectorAll('.doc-checkbox:checked').length;
    blkDelBtn.style.display = checkedCount > 0 ? 'block' : 'none';
}
function deleteSelectedDocuments() {
    const checkboxes = document.querySelectorAll('.doc-checkbox:checked');
    if (checkboxes.length === 0)
        return;
    const ids = [];
    Array.from(checkboxes).forEach(cb => {
        const id = cb.dataset.id;
        if (id) {
            ids.push(id);
        }
    });
    const docs = getDocs();
    const updatedDocs = docs.filter(doc => !ids.includes(doc.id));
    setDocs(updatedDocs);
    if (selectAllCheckbox) {
        selectAllCheckbox.checked = false;
    }
    loadDocuments();
    updateBulkDeleteButton();
}
form === null || form === void 0 ? void 0 : form.addEventListener("submit", (e) => {
    e.preventDefault();
    addDocument();
    dialog === null || dialog === void 0 ? void 0 : dialog.close();
});
navAdd === null || navAdd === void 0 ? void 0 : navAdd.addEventListener("click", () => {
    form === null || form === void 0 ? void 0 : form.reset();
    dialog === null || dialog === void 0 ? void 0 : dialog.showModal();
});
cancelBtn === null || cancelBtn === void 0 ? void 0 : cancelBtn.addEventListener("click", () => {
    renderDialog();
    dialog === null || dialog === void 0 ? void 0 : dialog.close();
});
addStatus === null || addStatus === void 0 ? void 0 : addStatus.addEventListener('change', function () {
    statusChange();
});
drop === null || drop === void 0 ? void 0 : drop.addEventListener("click", function () {
    toggleLogOut();
});
table === null || table === void 0 ? void 0 : table.addEventListener('change', (e) => {
    const target = e.target;
    if (target.classList.contains('doc-checkbox')) {
        updateBulkDeleteButton();
    }
});
addName === null || addName === void 0 ? void 0 : addName.addEventListener('change', function () {
    if (!addName || !form)
        return;
    addName.value = addName.value.trim();
    if (!form.checkValidity()) {
        return;
    }
});
if (inputSearch) {
    inputSearch.addEventListener("input", (e) => {
        const target = e.target;
        const searchQuery = target.value;
        loadDocuments(searchQuery);
    });
}
if (table) {
    table.addEventListener("click", (e) => {
        var _a, _b;
        const target = e.target;
        const del = target.closest(".delete");
        const edit = target.closest(".edit");
        const dots = target.closest(".dots");
        // delete 
        if (del) {
            e.stopPropagation();
            const id = (_a = del.dataset) === null || _a === void 0 ? void 0 : _a.id;
            if (id) {
                deleteId(id);
            }
            return;
        }
        // edit 
        if (edit) {
            e.stopPropagation();
            const id = (_b = edit.dataset) === null || _b === void 0 ? void 0 : _b.id;
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
    //checkboxes
    if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener('click', (e) => {
            const target = e.target;
            const isChecked = target.checked;
            const checkedOne = document.querySelectorAll('.doc-checkbox');
            checkedOne.forEach(checkbox => {
                checkbox.checked = isChecked;
            });
            updateBulkDeleteButton();
        });
    }
}
// Bulk delete
if (blkDelBtn) {
    blkDelBtn.addEventListener('click', deleteSelectedDocuments);
}
statusChange();
loadDocuments();
//# sourceMappingURL=index.js.map