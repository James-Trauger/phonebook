const express = require('express')
const app = express()
const cors = require('cors')
var morgan = require('morgan')

app.use(cors())
app.use(express.static('dist'))

// logging for post requests
morgan.token('post', (request, response) => {
    return request.method === 'POST'
    ? JSON.stringify(request.body)
    : ''
})

app.use(express.json())
app.use(morgan('tiny'))
app.use(morgan(':post'))

let phonebook = [
    { 
      "id": "1",
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": "2",
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": "3",
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": "4",
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]

app.get('/api/persons', (request, response) => {
    response.json(phonebook)
})

app.get('/info', (request, response) => {
    const entries = phonebook.length
    const date = new Date()
    
    const page = 
    `
    <p>Phonebook has info for ${entries} people</p>
    <p>${date}</p>
    `

    response.send(page)
})

const findPersonId = (id) => phonebook.find(person => person.id === id)
const findPersonName = (name) => {
    const lowerCase = name.toLowerCase()
    return phonebook.find(person => person.name.toLowerCase() === name)
}

app.get('/api/persons/:id', (request, response) => {
    const id = request.params.id 
    const person = findPersonId(id)

    if (person) {
        response.json(person)
    } else {
        response.status(404).end()
    }
})

app.delete('/api/persons/:id', (request, response) => {
    const id = request.params.id 
    
    if (!findPersonId(id)) {
        response.status(404).end()
    }

    phonebook = phonebook.filter(person => person.id !== id)

    response.status(204).end()
})

const generateId = () => String(Math.round(Math.random() * 1_000_000))

app.post('/api/persons', (request, response) => {
    const body = request.body 

    if (!body.name || !body.number) {
        return response.status(400).json({
            error: 'content missing',
            req: request.body
        })
    }

    if (findPersonName(body.name)) {
        return response.status(400).json({
            error: 'name must be unique'
        })
    }

    const newPerson = {
        id: generateId(),
        name: body.name,
        number: body.number,
    }

    phonebook = phonebook.concat(newPerson)

    response.json(newPerson)
})

const PORT = 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})