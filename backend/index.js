// connecting to database file
const connectToMongo = require('./db.js')

connectToMongo();


const express = require('express')
const app = express()
const port = 5000

// using middlewares
var cors = require('cors')
app.use(cors())

app.use(express.json())
// app.use(express.urlencoded({extended: false}))

// Available Routes
app.use('/api/auth', require('./routes/auth.js'))
app.use('/api/notes', require('./routes/notes.js'))

app.listen(port, () => {
  console.log(`iNotebook backend listening on port ${port}`)
})