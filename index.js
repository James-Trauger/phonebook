require('dotenv').config()
const express = require('express')
const app = express()
const Person = require('./models/person')
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

app.get('/api/persons', (request, response, next) => {
    Person.find({}).then(persons => {
        response.json(persons)
    })
    .catch(error => next(error))
})

app.get('/info', (request, response, next) => {
    Person.countDocuments()
    .then(entries => {
        const date = new Date()
    
        const page = 
        `
        <p>Phonebook has info for ${entries} people</p>
        <p>${date}</p>
        `

        response.send(page)
    })
    .catch(error => next(error))

})

app.get('/api/persons/:id', (request, response, next) => {
    Person.findById(request.params.id)
        .then(person => {
            response.json(person)
        })
        .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
    Person.findByIdAndDelete(request.params.id)
    .then(result => {
        console.log(`deleted person : ${JSON.stringify(result)}`)
        if (!result) {
            next(new Error('person not found'))
        } else {
            response.status(204).end() 
        }
    })
    .catch(error => next(error))
})

app.post('/api/persons', (request, response, next) => {
    
    const body = request.body 

    if (!body.name || !body.number) {
        return response.status(400).json({
            error: 'content missing',
            req: request.body
        })
    }

    const newPerson = new Person({
        name: body.name,
        number: body.number
    })

    newPerson.save()
    .then(savedPerson => {
        response.json(savedPerson)
    })
    .catch(error => next(error))
})


/* error handling middleware */
const errorHandler = (error, request, response, next) => {
    console.error(error.message)

    if (error.name === 'CastError') {
        return response.status(400).send({error: 'malformed id'})
    }

    next(error)
}
app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})