
const dialog = document.getElementById("addDocument");
const navAdd= document.querySelector(".navAdd");
const addDocumentBtn = document.getElementById("addDocumentbutton");
const table = document.querySelector("tbody");
const addName = document.getElementById("addName");
const addStatus = document.getElementById("addStatus");
const newDate = document.getElementById("newDate");
const newTime = document.getElementById("newTime");

navAdd.addEventListener("click", () => {
    dialog.showModal();
});

addDocumentBtn.addEventListener("click", (e) => {
    e.preventDefault();//preventing from auto closing when clicking on any button
    const name = addName.value;
    const status = addStatus.value;
    const date = newDate.value;
    const time = newTime.value;
    const newRow = document.createElement("tr");

    //base case agr koi bhi ek option me value nai he to
    if(!name || !status || !date || !time ){return;}
   
    
    let newStatus = "";
    if (status === "Needs Signing") newStatus = "Needs Signing";
    if (status === "Pending") newStatus = "Pending";
    if (status === "Completed") newStatus = "Completed";



    //to be optimized if possible(need to be done)
    newRow.innerHTML = `
    <td class="firstTop">
      <input type="checkbox" />
      <p>${name}</p>
    </td>

    <td>
      <span class="badge needs-signing">${newStatus}</span>
    </td>

    <td>${date}<br><span class="time">${time}</span></td>

    <td class="actions">
      ${status === "Needs Signing"
            ? '<button class="btn primary">Sign now</button>'
            : status === "Pending"
                ? '<button class="btn outline">Preview</button>'
                : '<button class="btn outline">Download PDF</button>'
        }
      <div class="dots">
        ⋮
        <div class="navigation">
          <div class="add">Add</div>
          <div class="add">Delete</div>
        </div>
      </div>
    </td>
  `;

    table.appendChild(newRow);
    dialog.close();
});