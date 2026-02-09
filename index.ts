export { };
type Status = "Pending" | "Approved" | "Rejected";

interface Document {
    id: string;
    name: string;
    status: Status;
    date: string;
    time: string;
    people: string | null;
}

interface StatusConfig {
    signinSt: string;
    btnClass: string;
    btnText: string;
    showPeople: boolean;
}

const dialog = document.getElementById("addDocument") as HTMLDialogElement
const navAdd = document.querySelector(".navAdd") as HTMLButtonElement
const table = document.querySelector("tbody") as HTMLTableSectionElement
const addName = document.getElementById("addName") as HTMLInputElement
const addStatus = document.getElementById("addStatus") as HTMLSelectElement
const newDate = document.getElementById("newDate") as HTMLInputElement
const newTime = document.getElementById("newTime") as HTMLInputElement
const drop = document.getElementsByClassName("profile-logo")[0] as HTMLElement
const logOut = document.getElementById("dropdownMenu") as HTMLElement
const arrowDown = document.getElementById("arrowDown") as HTMLElement
const addPeople = document.getElementById("addPeople") as HTMLInputElement
const cancelBtn = document.getElementById("cancelBtn") as HTMLButtonElement
const form = dialog?.querySelector("form") as HTMLFormElement
const dialogTitle = dialog?.querySelector("h2") as HTMLHeadingElement
const submitBtn = document.getElementById("addDocumentbutton") as HTMLButtonElement
const inputSearch = document.querySelector(".inputSearch") as HTMLInputElement
const blkDelBtn = document.getElementById('blkDelBtn') as HTMLButtonElement
const selectAllCheckbox = document.getElementById('selectAllCheckbox') as HTMLInputElement

const classifier: Record<string, StatusConfig> = {
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
let editingId: string | null = null;

function formatDateDisplay(dateStr: string | null): string | null {
    if (typeof dateStr === "string") {
        if (dateStr.includes("/")) return dateStr;//if already formated

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



function renderDialog(): void {
    form?.reset();
    addPeople.style.display = "none";
    editingId = null;
    submitBtn.textContent = "Add";
    dialogTitle.textContent = "Add Document";
}

function getDocs(): Document[] {
    const stored = localStorage.getItem(localKey);
    return stored ? JSON.parse(stored) : [];
}

function setDocs(docs: Document[]): void {
    localStorage.setItem(localKey, JSON.stringify(docs));
}

function deleteId(id: string): void {
    const docs = getDocs();
    const updatedDocs = docs.filter(function (doc) { return doc.id !== id; });
    setDocs(updatedDocs);
    loadDocuments();
}

function getDocumentById(id: string): Document | undefined {
    const docs = getDocs();
    return docs.find(function (doc) { return doc.id === id });
}

function editId(id: string): void {
    const doc = getDocumentById(id);
    if (!doc) return; // edge case agr document nai mila

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
    dialog?.showModal();
}

function update(doc: Document): string {
    const cfg = classifier[doc.status] || classifier["Needs Signing"];

    return `
        <tr data-id="${doc.id}">
            <td class="firstTop">
            <input type="checkbox" class="doc-checkbox" data-id="${doc.id}" />
            <p>${doc.name}</p>
            </td>
    
            <td>
            <span class="badge ${cfg?.signinSt}">
                ${doc.status || "Needs Signing"}
            </span>
    
            ${cfg?.showPeople
            ? `<div class="subtext">
                    <i class="bluredText">Waiting for&nbsp;</i>
                    ${doc.people} person
                    </div>`
            : ""
        }
            </td>
    
            <td>
            ${formatDateDisplay(doc.date)}<br>
            <span class="time">${doc.time || ""}</span>
            </td>
    
            <td class="actions">
            <button class="btn ${cfg?.btnClass}">
                ${cfg?.btnText}
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

function loadDocuments(searchQuery: string = ""): void {
    const docs = getDocs();

    if (!table) return;
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

function addDocument(): void {
    if (!addName || !addStatus || !newDate || !newTime || !addPeople) return;

    const name = addName.value;
    const status = addStatus.value as Document["status"];
    const date = newDate.value;
    const time = newTime.value;
    const people = addPeople.value;
    const docs = getDocs();

    if (editingId !== null) {
        const doc: Document = {
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
        const doc: Document = {
            id: crypto.randomUUID(),
            name,
            status,
            date,
            time,
            people: status === "Pending" ? people : null
        };

        setDocs([...docs, doc]);
    }
    const currentSearch = inputSearch?.value || "";
    loadDocuments(currentSearch);
}

function toggleLogOut(): void {
    if (!logOut || !arrowDown) return;
    logOut.style.display = logOut.style.display === "none" ? "block" : "none";
    arrowDown.style.transform = arrowDown.style.transform === "rotate(0deg)" ? "rotate(180deg)" : "rotate(0deg)";
}

function statusChange(): void {
    if (!addStatus || !addPeople) return;

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

function updateBulkDeleteButton(): void {
    const checkedCount = document.querySelectorAll('.doc-checkbox:checked').length;
    blkDelBtn.style.display = checkedCount > 0 ? 'block' : 'none';
}

function deleteSelectedDocuments(): void {
    const checkboxes = document.querySelectorAll<HTMLInputElement>('.doc-checkbox:checked');

    if (checkboxes.length === 0) return;

    const ids: string[] = [];

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


form?.addEventListener("submit", (e) => {
    e.preventDefault();
    addDocument();
    dialog?.close();
});

navAdd?.addEventListener("click", () => {
    form?.reset();
    dialog?.showModal();
});

cancelBtn?.addEventListener("click", () => {
    renderDialog();
    dialog?.close();
});

addStatus?.addEventListener('change', function () {
    statusChange();
});

drop?.addEventListener("click", function () {
    toggleLogOut();
});

table?.addEventListener('change', (e) => {
    const target = e.target as HTMLElement;
    if (target.classList.contains('doc-checkbox')) {
        updateBulkDeleteButton();
    }
});

addName?.addEventListener('change', function () {
    if (!addName || !form) return;
    addName.value = addName.value.trim();
    if (!form.checkValidity()) {
        return;
    }
});

if (inputSearch) {
    inputSearch.addEventListener("input", (e) => {
        const target = e.target as HTMLInputElement;
        const searchQuery = target.value;
        loadDocuments(searchQuery);
    });
}

if (table) {
    table.addEventListener("click", (e) => {
        const target = e.target as HTMLElement;
        const del = target.closest(".delete") as HTMLElement;
        const edit = target.closest(".edit") as HTMLElement;
        const dots = target.closest(".dots") as HTMLElement;

        // delete 
        if (del) {
            e.stopPropagation();
            const id = del.dataset?.id;
            if (id) {
                deleteId(id);
            }
            return;
        }

        // edit 
        if (edit) {
            e.stopPropagation();
            const id = edit.dataset?.id;
            if (id) {
                editId(id);
            }
            return;
        }

        // dots
        if (dots) {
            e.stopPropagation();
            const nav = dots.querySelector(".navigation") as HTMLElement | null;
            if (nav) {
                nav.classList.toggle("show");
            }
            return;
        }
    });
    //checkboxes
    if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener('click', (e) => {
            const target = e.target as HTMLInputElement;
            const isChecked = target.checked;
            const checkedOne = document.querySelectorAll('.doc-checkbox');
            checkedOne.forEach(checkbox => {
                (checkbox as HTMLInputElement).checked = isChecked;
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
