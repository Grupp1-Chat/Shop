const path = require("path");
const fs = require("fs");

const productsDB = path.join(__dirname, "products.json");
const usersDB = path.join(__dirname, "users.json");
const purchasesDB = path.join(__dirname, "purchases.json");

function readDB(db) {
  try {
    const result = fs.readFileSync(db);
    return JSON.parse(result);
  } catch (ex) {
    console.error(ex);
  }
}

function writeDB(db, data) {
  try {
    fs.writeFileSync(db, JSON.stringify(data));
    return data;
  } catch (ex) {
    console.error(ex);
  }
}

function addUser(user) {
  const data = readDB(usersDB);
  data.push(user);
  writeDB(usersDB, data);
  return user;
}

function getUsers() {
  return readDB(usersDB);
}

function updateUser(user) {
  const data = getUsers();
  const index = data.findIndex((item) => item.id === user.id);
  data[index] = user;
  writeDB(usersDB, data);
  return user;
}

function userExists(email) {
  const data = getUsers();
  const index = data.findIndex((item) => item.email === email);
  if (index === -1) return false;
  return true;
}

function getProducts() {
  return readDB(productsDB);
}

function getPurchases() {
  return readDB(purchasesDB);
}

function addPurchase(item) {
  const data = getPurchases();
  data.push(item);
  writeDB(purchasesDB, data);
  return item;
}

module.exports = {
  getProducts,
  addUser,
  getUsers,
  updateUser,
  getPurchases,
  addPurchase,
  userExists,
};
