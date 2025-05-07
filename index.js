import express from 'express'
import morgan from 'morgan'
import cors from 'cors'

const app = express()
app.use(express.json())
app.use(cors())


let persons = [
  { id: "1", name: "Arto Hellas", number: "040-123456" },
  { id: "2", name: "Ada Lovelace", number: "39-44-5323523" },
  { id: "3", name: "Dan Abramov", number: "12-43-234345" },
  { id: "4", name: "Mary Poppendieck", number: "39-23-6423122" }
]

app.get('/api/persons', (req, res) => {
  res.json(persons)
})

const PORT = 3001

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

app.get('/info', (req, res) => {
    const date = new Date()
    const total = persons.length
  
    res.send(`
      <p>Phonebook has info for ${total} people</p>
      <p>${date}</p>
    `)
  })

app.get('/api/persons/:id', (req, res) => {
    const id = req.params.id
    const person = persons.find(p => p.id === id)
  
    if (person) {
      res.json(person)
    } else {
      res.status(404).send({ error: 'Person not found' })
    }
  })  
  
app.delete('/api/persons/:id', (req, res) => {
    const id = req.params.id
    const personExists = persons.some(p => p.id === id)
  
    if (!personExists) {
      return res.status(404).send({ error: 'Person not found' })
    }
  
    persons = persons.filter(p => p.id !== id)
    res.status(204).end()
  })
  
app.post('/api/persons', (req, res) => {
    const body = req.body
    console.log('Received POST:', req.body)
  
    if (!body.name || !body.number) {
      return res.status(400).json({ error: 'Name or number is missing' })
    }
  
    const nameExists = persons.some(p => p.name === body.name)
    if (nameExists) {
      return res.status(400).json({ error: 'Name must be unique' })
    }
  
    const newPerson = {
      id: (Math.random() * 1000000).toFixed(0),
      name: body.name,
      number: body.number
    }
  
    persons = persons.concat(newPerson)
  
    res.status(201).json(newPerson)
  })
  

  morgan.token('body', (req) => req.method === 'POST' ? JSON.stringify(req.body) : '')

  app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))


  