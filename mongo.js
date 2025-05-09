import mongoose from 'mongoose'

const password = process.argv[2]

if (!password) {
  console.log('Please provide the password as an argument: node mongo.js <password>')
  process.exit(1)
}

const url = `mongodb+srv://AiTrinh:${password}@cluster0.upmsnpj.mongodb.net/phonebook?retryWrites=true&w=majority&appName=Cluster0`


mongoose.set('strictQuery', false)
mongoose.connect(url)

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
})

const Person = mongoose.model('Person', personSchema)

const args = process.argv

if (args.length === 3) {
  // List all entries
  Person.find({}).then(result => {
    console.log('phonebook:')
    result.forEach(person => {
      console.log(`${person.name} ${person.number}`)
    })
    mongoose.connection.close()
  })
} else if (args.length === 5) {
  // Add a new entry
  const name = args[3]
  const number = args[4]

  const person = new Person({ name, number })

  person.save().then(() => {
    console.log(`added ${name} number ${number} to phonebook`)
    mongoose.connection.close()
  })
} else {
  console.log('Usage:')
  console.log('  node mongo.js <password>             # list entries')
  console.log('  node mongo.js <password> <name> <number> # add entry')
  mongoose.connection.close()
}
