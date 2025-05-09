import express from 'express'
import morgan from 'morgan'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import Person from './models/person.js'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
dotenv.config()

mongoose.set('strictQuery', false)

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB')
  })
  .catch(error => {
    console.error('Error connecting to MongoDB:', error.message)
  })

const app = express()
app.use(express.json())
app.use(cors())


morgan.token('body', (req) => req.method === 'POST' ? JSON.stringify(req.body) : '')

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))


const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

app.use(express.static(path.join(__dirname, 'dist')))

const PORT = process.env.PORT || 3001



app.get('/api/persons', (req, res, next) => {
  Person.find({})
    .then(persons => {
      res.json(persons)
    })
    .catch(error => next(error))
})

app.get('/info', (req, res, next) => {
  Person.countDocuments({})
    .then(count => {
      res.send(`
        <p>Phonebook has info for ${count} people</p>
        <p>${new Date()}</p>
      `)
    })
    .catch(error => next(error))
})


app.get('/api/persons/:id', (req, res, next) => {
  Person.findById(req.params.id)
    .then(person => {
      if (person) {
        res.json(person)
      } else {
        res.status(404).send({ error: 'Person not found' })
      }
    })
    .catch(error => next(error))
})

  
app.delete('/api/persons/:id', (req, res, next) => {
  Person.findByIdAndRemove(req.params.id)
    .then(result => {
      if (result) {
        res.status(204).end()
      } else {
        res.status(404).send({ error: 'Person not found' })
      }
    })
    .catch(error => next(error))
})


  
app.post('/api/persons', (req, res, next) => {
  const body = req.body

  if (!body.name || !body.number) {
    return res.status(400).json({ error: 'Name or number is missing' })
  }

  Person.findOne({ name: body.name })
    .then(existing => {
      if (existing) {
        return res.status(400).json({ error: 'Name must be unique' })
      }

      const person = new Person({
        name: body.name,
        number: body.number,
      })

      return person.save().then(savedPerson => {
        res.status(201).json(savedPerson)
      })
    })
    .catch(error => next(error))
})

app.put('/api/persons/:id', (req, res, next) => {
  const { name, number } = req.body

  const update = { name, number }
  const opts = { new: true, runValidators: true, context: 'query' }

  Person.findByIdAndUpdate(req.params.id, update, opts)
    .then(updatedPerson => {
      if (updatedPerson) {
        res.json(updatedPerson)
      } else {
        res.status(404).send({ error: 'Person not found' })
      }
    })
    .catch(error => next(error))
})


  // Fallback for SPA routing
  app.get(/^\/(?!api).*/, (req, res) => {
    res.sendFile(path.resolve(__dirname, 'dist', 'index.html'))
  })

  app.use((error, req, res, next) => {
    console.error(error.message)
  
    if (error.name === 'CastError') {
      return res.status(400).send({ error: 'Malformed ID' })
    } else if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message })
    }
  
    next(error)
  })
  
  
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })
  