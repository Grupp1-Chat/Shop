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
  })
  .catch((ex) => {
    alert("something went wrong.");
    console.err(ex);
  });

let STATE = [];

const main = document.getElementById("main");
const load = document.getElementById("load");

main.hidden = true;
load.hidden = false;

const p1name = document.getElementById("product-name1");
const p1desc = document.getElementById("product-desc1");
const p1img = document.getElementById("product-img1");
const p1btn = document.getElementById("product-btn1");
const p2name = document.getElementById("product-name2");
const p2desc = document.getElementById("product-desc2");
const p2img = document.getElementById("product-img2");
const p2btn = document.getElementById("product-btn2");

fetch("/api/products")
  .then((res) => res.json())
  .then((data) => {
    STATE = data;
    p1name.innerText = STATE[0].name;
    p1desc.innerText = STATE[0].description;
    p1img.setAttribute("src", STATE[0].img);
    p2name.innerText = STATE[1].name;
    p2desc.innerText = STATE[1].description;
    p2img.setAttribute("src", STATE[1].img);
    main.hidden = false;
    load.hidden = true;
  })
  .catch((err) => console.error(err));

p1btn.onclick = () => {
  if (!window.sessionStorage.getItem("cart")) {
    const cart = [];
    cart.push({ ...STATE[0], quantity: 1 });
    window.sessionStorage.setItem("cart", JSON.stringify(cart));
  } else {
    const cart = JSON.parse(window.sessionStorage.getItem("cart"));
    const index = cart.findIndex((item) => item.id === STATE[0].id);
    if (index === -1) {
      cart.push({ ...STATE[0], quantity: 1 });
    } else {
      cart[index].quantity++;
    }
    window.sessionStorage.setItem("cart", JSON.stringify(cart));
  }
};

p2btn.onclick = () => {
  if (!window.sessionStorage.getItem("cart")) {
    const cart = [];
    cart.push({ ...STATE[1], quantity: 1 });
    window.sessionStorage.setItem("cart", JSON.stringify(cart));
  } else {
    const cart = JSON.parse(window.sessionStorage.getItem("cart"));
    const index = cart.findIndex((item) => item.id === STATE[1].id);
    if (index === -1) {
      cart.push({ ...STATE[1], quantity: 1 });
    } else {
      cart[index].quantity++;
    }
    window.sessionStorage.setItem("cart", JSON.stringify(cart));
  }
};

function logout() {
  fetch("/cookie/clear/x-auth");
  window.location = "/";
}
