require('../src/db/mongoose')
const Task = require('../src/models/task')


// Task.findByIdAndDelete('67436598365912b51648f229').then((task) => {
//     console.log(task)
//     return Task.countDocuments({completed: false})
// }).then((result) => {
//     console.log(result)
// }).catch((e) => {
//     console.log(e)
// })

const deleteTaskAndCount = async (id) => {
    const task = await Task.findByIdAndDelete(id)
    const count = await Task.countDocuments({completed: false})
    return count
}

deleteTaskAndCount('6744b94fed688039b33eb7a6').then((count) => {
    console.log(count)
}).catch((e) => {
    console.log(e)
})