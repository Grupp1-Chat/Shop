require("dotenv").config();

const bcrypt = require("bcrypt");
const saltRounds = 5;


const path = require("path");
const express = require("express");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const cookieParser = require("cookie-parser");
const cookieEncrypter = require("cookie-encrypter");
const DB = require("./db/index");
const app = express();

//
//
// Global vars

const ENC_SECRET_KEY = process.env.COOKIE_ENC_KEY;
const MODULES_PATH = path.join(__dirname, "node_modules");
const ICON_PATH = path.join(
  MODULES_PATH,
  "semantic-ui-icon",
  "assets",
  "fonts"
);
const cookieParams = {
  httpOnly: true,
  signed: true,
  maxAge: 3600000, 
};



app.use(cookieParser(ENC_SECRET_KEY));
app.use(cookieEncrypter(ENC_SECRET_KEY));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(MODULES_PATH));
app.use(express.static(path.join(MODULES_PATH, "jquery")));
app.use(express.static(path.join(MODULES_PATH, "semantic-ui-css")));
app.use(express.static(path.join(MODULES_PATH, "semantic-ui-icon")));


// Getting module static files for browser imports

app.get("/modules/semantic/css", (req, res) => {
  res.sendFile(path.join(MODULES_PATH, "semantic-ui-css", "semantic.min.css"));
});

app.get("/modules/semantic/js", (req, res) => {
  res.sendFile(path.join(MODULES_PATH, "semantic-ui-css", "semantic.min.js"));
});

app.get(
  "/modules/semantic/themes/default/assets/fonts/icons.woff",
  (req, res) => {
    res.sendFile(path.join(ICON_PATH, "icons.woff"));
  }
);

app.get(
  "/modules/semantic/themes/default/assets/fonts/icons.woff2",
  (req, res) => {
    res.sendFile(path.join(ICON_PATH, "icons.woff2"));
  }
);

app.get("/modules/jquery", (req, res) => {
  res.sendFile(path.join(MODULES_PATH, "jquery", "dist", "jquery.min.js"));
});


// Api routes

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.post("/api/signup", async (req, res) => {
  if (DB.userExists(req.body.email)) return res.status(400).end("user exists");
  const customer = await stripe.customers.create({
    email: req.body.email,
  });
  // console.log(customer); // save customer with customer.id
  bcrypt.hash(req.body.password, saltRounds, (err, hash) => {
    if (err) return console.error(err);
    const data = { id: customer.id, email: req.body.email, password: hash };
    DB.addUser(data);
    res.cookie("x-auth", data, cookieParams);
    res.end("signed");
  });
});

app.post("/api/login", (req, res) => {
  const user = req.body;
  console.log(user);
  const USERS = DB.getUsers();
  console.log(USERS);
  const index = USERS.findIndex((item) => item.email === user.email);
  if (index === -1) return res.status(404).end();
  bcrypt.compare(user.password, USERS[index].password, (err, r) => {
    if (!r) return res.send({ message: "Wrong password!" });
    res.cookie("x-auth", USERS[index], cookieParams);
    res.send({});
  });
});

app.get("/cookie/get", (req, res) => {
  const signed = req.signedCookies["x-auth"];
  res.send(signed ? signed : {});
});

app.get("/cookie/clear/:name", (req, res) => {
  const name = req.params.name;
  res.clearCookie(name);
  res.end("Cookies deleted");
});

app.post("/create-checkout-session", async (req, res) => {
  const signed = req.signedCookies["x-auth"];
  const body = req.body;
  if (!signed) return res.send({ url: "/login.html" });
  const line = [];
  body.forEach((el) => {
    line.push({ price: el.price_id, quantity: el.quantity });
  });
  try {
    const user = req.signedCookies["x-auth"];
    const session = await stripe.checkout.sessions.create({
      line_items: line,

      customer: user.id,
      payment_method_types: ["card"],
      mode: "payment",
      success_url: `http://localhost:3000/success.html`,
      cancel_url: `http://localhost:3000/cancel.html`,
    });
    user.session = session.id;
    const update = DB.updateUser(user);
    res.cookie("x-auth", update, cookieParams);
    res.send({ url: session.url });
  } catch (ex) {
    console.log(ex);
    res.end();
  }
});

app.get("/api/purchases", (req, res) => {
  const user = req.signedCookies["x-auth"];
  if (!user) return res.send({});
  const purchases = DB.getPurchases();
  const data = purchases.filter((p) => p.customer_id === user.id);
  res.send(data);
});

app.get("/api/products", async (req, res) => {
  const products = DB.getProducts();
  try {
    const r1 = await stripe.products.retrieve(products[0].id);
    const r2 = await stripe.products.retrieve(products[1].id);
    const price1 = await stripe.prices.retrieve(products[0].price);
    const p1 = {
      id: r1.id,
      name: r1.name,
      description: r1.description,
      img: r1.images[0],
      price_id: products[0].price,
      price: price1.unit_amount / 100,
    };
    const price2 = await stripe.prices.retrieve(products[1].price);
    const p2 = {
      id: r2.id,
      name: r2.name,
      description: r2.description,
      img: r2.images[0],
      price_id: products[1].price,
      price: price2.unit_amount / 100,
    };
    res.send([p1, p2]);
  } catch (ex) {
    console.error(ex);
  }
});



app.get("/cancel-checkout-session", (req, res) => {
  const user = req.signedCookies["x-auth"];
  user.session = "";
  const update = DB.updateUser(user);
  console.log(update);
  res.cookie("x-auth", update, cookieParams);
  res.end();
});

app.get("/success-checkout-session", async (req, res) => {
  const user = req.signedCookies["x-auth"];
  const session = await stripe.checkout.sessions.retrieve(user.session);
  user.session = "";
  const update = DB.updateUser(user);
  res.cookie("x-auth", update, cookieParams);
  const lineItems = [];
  stripe.checkout.sessions.listLineItems(
    session.id,
    { limit: 5 },
    function (err, li) {
      if (err) return console.error(err);
      li.data.forEach((i) => {
        const temp = {};
        temp.id = i.id;
        temp.description = i.description;
        temp.price = i.price.unit_amount;
        temp.currency = i.price.currency;
        temp.quantity = i.quantity;
        lineItems.push(temp);
      });
    }
  );
  const paymentIntent = await stripe.paymentIntents.retrieve(
    session.payment_intent
  );
  const purchase = {
    date: new Date().toLocaleString("se-SE"),
    customer_id: user.id,
    customer_email: session.customer_details.email,
    session_id: session.id,
    price: paymentIntent.amount,
    receipt: paymentIntent.charges.data[0].receipt_url,
    card: paymentIntent.charges.data[0].payment_method_details.card.last4,
    items: lineItems,
  };
  console.log(purchase);
  DB.addPurchase(purchase);
  res.send(purchase);
});

app.get("/orders", async (req, res)=>{
    const user = res.cookie("x-auth")
    res.send("i orders")
    console.log("user i orders: " + user)
    
})

const PORT = 3000;
app.listen(PORT, () => console.log(`Listening to port ${PORT}...`));
