const STATE = {
  email: "",
  password: "",
};

const signupBtn = document.getElementById("login-signup-btn");
const loginBtn = document.getElementById("login-login-btn");
const email = document.getElementById("login-email");
const password = document.getElementById("login-password");
const form = document.getElementById("login-form");

signupBtn.onclick = () => {
  signupBtn.classList.add("loading");
  if (STATE.password.length > 3 && validateEmail(STATE.email)) {
    fetch("/api/signup", {
      method: "POST",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify(STATE),
    }).then((response) => {
      if (response.status === 200) {
        signupBtn.classList.remove("loading");
        email.value = "";
        password.value = "";
        window.history.back();
      } else {
        if (form.classList.length < 4) form.classList.add("error");
        signupBtn.classList.remove("loading");
      }
    });
  } else {
    signupBtn.classList.remove("loading");
    if (form.classList.length < 4) return form.classList.add("warning");
    if (
      form.classList.length > 3 &&
      form.className.split(" ").pop() === "error"
    ) {
      form.classList.remove("error");
      form.classList.add("warning");
      return;
    }
  }
};

loginBtn.onclick = () => {
  loginBtn.classList.add("loading");
  if (STATE.password.length > 3 && validateEmail(STATE.email)) {
    fetch("/api/login", {
      method: "POST",
      headers: { "Content-type": "application/json" },
      body: JSON.stringify(STATE),
    })
      .then((response) => {
        console.log(response);
        if (response.status === 200) {
          return response.json();
        } else {
          return;
        }
      })
      .then((data) => {
        loginBtn.classList.remove("loading");
        if (!data) return alert("user not found");
        if (data.message) return alert(data.message);
        window.history.back();
      });
  } else {
    loginBtn.classList.remove("loading");
    alert("error");
  }
};

email.onkeyup = (e) => {
  STATE.email = email.value;
  //   document
  //     .getElementById("login-form")
  //     .classList.remove(
  //       document.getElementById("login-form").className.split(" ").pop()
  //     );
};

password.onkeyup = (e) => {
  STATE.password = password.value;
  //   document
  //     .getElementById("login-form")
  //     .classList.remove(
  //       document.getElementById("login-form").className.split(" ").pop()
  //     );
};

function validateEmail(email) {
  const re =
    /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email);
}
