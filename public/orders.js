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
const ordersDiv = document.getElementById("renderOrders")



const isLoggedIn = async () => {
    let response =  await fetch("/cookie/get")
    let cookie =  response.json()
    return cookie
    
}



const getOrders =  async () => {
    const auth = await isLoggedIn()
    if(Object.keys(auth).length>0){
    fetch("/api/purchases")
    .then((res) => res.json())
    .then((data) => {
      purchases = data;
      if (Object.keys(purchases).length === 0) return;
      renderPurchases();
    })
    .catch((ex) => {
      console.error(ex);
      alert("Something went wrong...");
    });
}else{
    alert("Login to see orders")
}
}


function renderPurchases() {
    ordersDiv.innerHTML = "";
    purchases.forEach((p) => {
      ordersDiv.innerHTML += `
          <div class="ui feed">
          <h4>${p.date}</h4>
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
  }
getOrders()

function logout() {
    fetch("/cookie/clear/x-auth");
    window.location = "/";
  }