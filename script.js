  const dialog         = document.getElementById("addDocument");
  const navAdd         = document.querySelector(".navAdd");
  const addDocumentBtn = document.getElementById("addDocumentbutton");
  const table          = document.querySelector("tbody");
  const addName        = document.getElementById("addName");
  const addStatus      = document.getElementById("addStatus");
  const newDate        = document.getElementById("newDate");
  const newTime        = document.getElementById("newTime");
  const drop           = document.getElementsByClassName("profile-logo")[0];
  const logOut         = document.getElementById("dropdownMenu");
  const arrowDown      = document.getElementById("arrowDown");
  const addPeople      = document.getElementById("addPeople");
  const navigation     = document.querySelectorAll(".navigation");
  const cancelBtn      = document.getElementById("cancelBtn");
  const form           = dialog.querySelector("form");
  // const list =[{id:'as',name:'asdasd',className:'asd',data:'asdasd'},{},{}]
  // const localKey = "scrkey"


  // function renderRow(doc) {
  //   const cfg = STATUS_CLASSIFIER[doc.status];
  
  //   return `
  //     <tr data-id="${doc.id}">
  //       <td class="firstTop">
  //         <input type="checkbox" />
  //         <p>${doc.name}</p>
  //       </td>
  
  //       <td>
  //         <span class="badge ${cfg.badgeClass}">
  //           ${doc.status}
  //         </span>
  
  //         ${
  //           cfg.showPeople
  //             ? `<div class="subtext">
  //                  <i class="bluredText">Waiting for&nbsp;</i>
  //                  ${doc.people} person
  //                </div>`
  //             : ""
  //         }
  //       </td>
  
  //       <td>
  //         ${doc.date}<br>
  //         <span class="time">${doc.time}</span>
  //       </td>
  
  //       <td class="actions">
  //         <button class="btn ${cfg.btnClass}">
  //           ${cfg.btnText}
  //         </button>
  
  //         <span class="dots">
  //           ⋮
  //           <div class="navigation">
  //             <div class="dots-items edit" data-id="${doc.id}">
  //               <i class="fa-solid fa-pen-to-square"></i>
  //             </div>
  //             <div class="dots-items delete" data-id="${doc.id}">
  //               <i class="fa-solid fa-trash"></i>
  //             </div>
  //           </div>
  //         </span>
  //       </td>
  //     </tr>
  //   `;
  // }
  

  function addDocument() {
    const name = addName.value;
    const status = addStatus.value;
    const date = newDate.value;
    const time = newTime.value;
    const people = addPeople.value;



    const newRow = document.createElement("tr");

    //base case agr koi bhi ek option me value nai he to
    if (!name || !status || !date || !time) { return; }

    //to be optimized if possible(need to be done)
    newRow.innerHTML = `
    <td class="firstTop">
      <input type="checkbox" />
      <p>${name}</p>
    </td>

    <td>
      ${status === "Needs Signing" ?
        `<span class="badge needs-signing">${status}</span>`
        : status === "Pending" ?
          `<span class="badge pending">${status}</span>
      <div class="subtext"><i class="bluredText">Waiting for &nbsp</i>${people}person</div>`
          : `<span class="badge completed">${status}</span>`
      }
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
        <div class="dots-items edit">    
        <i class="fa-solid fa-pen-to-square"></i>
        </div>
        <div class="dots-items delete">
        <i class="fa-solid fa-trash"></i>
        </div>
        </div>
      </div>
    </td>
  `;
    table.appendChild(newRow);
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

  form.addEventListener("submit", (e) => {
    //preventing from auto closing when clicking on any button
    e.preventDefault();
    addDocument();
    dialog.close();
  });

  navAdd.addEventListener("click", () => {
    dialog.showModal();
  });

  cancelBtn.addEventListener("click", () => {
    dialog.close();
  });

  drop.addEventListener("click", (e) => {
    e.preventDefault();
    toggleLogOut();
  })

  addStatus.addEventListener('change', function()
  {
    statusChange();
  })


  table.addEventListener("click", (e) => {
    const dot = e.target.closest(".dots");
    if (!dot) return;
    e.stopPropagation();
    const navigation = dot.querySelector(".navigation");
    navigation.classList.toggle("show");
  });
  

  

