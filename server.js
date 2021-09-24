const express = require('express')
const cookieSession = require('cookie-session')
const cors = require('cors')
const uuid = require("uuid")
const bcrypt = require("bcrypt")
const fs = require("fs")
const stripe = require('stripe')('sk_test_51Jc358GZ9XZdSxRMx6Luq6I8WSYXu1x8BkmRNKUaC7EtzbRpLXXy0Oq54Bkfek8dnnSjGzfOcpaQ0bTHjaRIxV5E00SH8h9lWs');


const app = express()
const PORT = process.env.PORT || 3000

app.use(express.json())
app.use(cors())

const users = []

app.use(cookieSession({
    secret: "kajkaj123458",
    maxAge: 1000*60*20, // 20 minuter
    sameSite: "strict",
    httpOnly: "true",
    secure: "false"
    
}))

app.post("/test", async (req, res)=>{
 console.log(req.body)
 res.send(req.body)
})
app.get('/users', (req, res)=>{
    res.json(users)
})


app.post("/users", async (req, res) =>{
    if(users.find(user => user.name === req.body.name)){
        return res.status(409).send("username already exist")
    }
    console.log(users)
  
    const hashedPassword = await bcrypt.hash(req.body.password, 10)
    saveUser(req.body.name, hashedPassword)
    users.push({name: req.body.name, password: hashedPassword})
    res.status(201).send("user saved")

})

app.post("/login", async (req, res)=>{
    const users = getAllUsers()
    const user = users.find(user => user.name === req.body.name)
    console.log(users)
    if(!user || await bcrypt.compare(req.body.password, user.password)){
        return res.status(401).send("fel användarnamn eller lösenord")
    }

    req.session.id ? res.send("redan inloggad"): ""

    req.session.id = uuid.v4()
    req.session.username = user.name
    req.session.date = new Date()
    res.send('Inloggad')
})

const saveUser = (nameToSave, passwordToSave) => {
    let users = getAllUsers()

    let userToSave = {name: nameToSave, password: passwordToSave}
    users.push(userToSave)
    console.log(users)

    fs.writeFileSync(__dirname + "/users.json", JSON.stringify(users))
    
}

const getAllUsers = () =>{
    let allUsers = fs.readFileSync(__dirname + "/users.json", "utf8")
    let pasredUsers = JSON.parse(allUsers)
    return pasredUsers
}
const testPay= async () => {
const paymentIntent = await stripe.paymentIntents.create({
    amount: 1000,
    currency: 'sek',
    payment_method_types: ['card'],
    receipt_email: 'jenny.rosen@example.com',
  });
}

const creatCustomer = async () => {
    const customer = await stripe.customers.create({
        email: 'jenny.rosen@example.com',
        
        invoice_settings: {
          default_payment_method: null,
        },
      });
}

const getOrders = async () =>{
    const orders = await stripe.orders.list({
        
        limit: 3,
      });
      console.log(orders)
}
getOrders()
/* creatCustomer()
testPay() */
app.listen(PORT, ()=> console.log(`App running on port ${PORT}`))