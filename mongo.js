const mongoose = require('mongoose')

if (process.argv.length<3) {
  console.log('give password, name, and number as arguments')
  process.exit(1)
}

const password = process.argv[2]

const url =
  `mongodb+srv://jamestrauger:${password}@cluster0.bggsk.mongodb.net/phonebook?retryWrites=true&w=majority&appName=Cluster0`

mongoose.set('strictQuery',false)

mongoose.connect(url)

const personSchema = new mongoose.Schema({
    name: String,
    number: String,
  })
  
const Person = mongoose.model('Person', personSchema)

if (process.argv.length === 3) {
    // display all entires
    Person
    .find({})
    .then(people => {
        console.log('phonebook:')
        people.forEach(p => console.log(`${p.name} ${p.number}`))
        mongoose.connection.close()
        process.exit(0)
    }).catch(error => {
        console.log(error)
        mongoose.connection.close()
        process.exit(1)
    })
} else {
    // adding entries must only have 5 arguments
    if (process.argv.length !== 5) {
        console.log('must pass name and number as arguments')
        console.log('usage: node mongo.js [password] [name] [number]')
        process.exit(1)
    }

    const name = process.argv[3]
    const number = process.argv[4]

    const person = new Person({
        name: name,
        number: number 
    })

    person
    .save()
    .then(result => {
        console.log(`added ${result.name} number ${result.number} to phonebook`)
        mongoose.connection.close()
        process.exit(0)
    }).catch(error => {
        console.log(error)
        mongoose.connection.close()
        process.exit(1)
    })

}