const auth = document.getElementById("auth-btn");
fetch("/cookie/get")
  .then((res) => res.json())
  .then((data) => {
    if (Object.keys(data).length === 0) {
      auth.childNodes[1].nodeValue = "Login";
      auth.setAttribute("href", "/login.html");
    } else {
      auth.setAttribute("onclick", "logout()");
    }
  });

const STATE = JSON.parse(window.sessionStorage.getItem("cart"));
let purchases = [];
/* fetch("/api/purchases")
  .then((res) => res.json())
  .then((data) => {
    purchases = data;
    if (Object.keys(purchases).length === 0) return;
    renderPurchases();
  })
  .catch((ex) => {
    console.error(ex);
    alert("Something went wrong...");
  }); */

const emptyContainer = document.getElementById("empty-container");
const itemContainer = document.getElementById("item-container");
const itemList = document.getElementById("item-list");
const formContainer = document.getElementById("form-container");
const feedContainer = document.getElementById("feed-container");

if (!STATE) {
  itemContainer.style.display = "none";
  formContainer.style.display = "none";
} else {
  emptyContainer.style.display = "none";
}

if (STATE) render();

function checkoutSTATE() {
  fetch("/create-checkout-session", {
    method: "POST",
    headers: {
      "Content-type": "application/json",
    },
    body: window.sessionStorage.getItem("cart"),
  })
    .then((res) => res.json())
    .then((data) => {
      window.location = data.url;
    })
    .catch((ex) => {
      console.error(ex);
      alert("Something went wrong.");
    });
}

function update(e) {
  const data = e.id.split("-");
  const index = parseInt(data[0]);
  if (data[1] === "a") {
    STATE[index].quantity--;
  } else {
    STATE[index].quantity++;
  }
  window.sessionStorage.setItem("cart", JSON.stringify(STATE));
  render();
}

/* function renderPurchases() {
  feedContainer.innerHTML = "";
  purchases.forEach((p) => {
    feedContainer.innerHTML += `
        <div class="ui feed">
        <div class="event" style="cursor: pointer">
          <div class="label">
            <i class="dollar green icon"></i>
          </div>
          <div class="content">
            <div class="summary">
              <a class="user"> You </a> made a purchase with id
              <div class="date">${p.session_id}</div>
            </div>
            <div class="meta">
              <a class="like"> <i class="dollar icon"></i>${p.price / 100}</a>
              <a class="like" href="${
                p.receipt
              }" target="_blank"> <i class="question circle icon"></i> Details </a>
            </div>
          </div>
        </div>
      </div>
        `;
  });
} */

function render() {
  itemList.innerHTML = "";
  STATE.forEach((element, index) => {
    itemList.innerHTML += `
      <div class="item">
        <div class="ui small image">
            <img src="${element.img}" />
        </div>
        <div class="content">
            <div class="header">${element.name}</div>
            <div class="meta">
            <span class="price">$${element.price}</span>
            <span class="stay"
                ><div class="ui star rating" data-rating="4"></div
            ></span>
            </div>
            <div class="description">
            <p>${element.description}</p>
            </div>
            <div class="extra">
            <div class="ui action input">
                <button class="ui teal icon button" id="${index}-a" onclick="update(this)">
                <i class="minus icon"></i>
                </button>
                <input
                type="text"
                style="width: 4em; color: purple"
                value="${element.quantity}"
                disabled
                />
                <button class="ui teal icon button" id="${index}-b" onclick="update(this)">
                <i class="plus icon"></i>
                </button>
            </div>
            <div class="ui action input right floated">
                <button class="ui teal button" disabled>Total:</button>
                <input
                type="text"
                style="width: 4em; color: purple"
                value="${element.quantity * element.price}"
                disabled
                />
            </div>
            </div>
        </div>
    </div>
        `;
  });
}

function logout() {
  fetch("/cookie/clear/x-auth");
  window.location = "/cart.html";
}
