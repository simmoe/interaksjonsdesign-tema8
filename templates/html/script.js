array = [12, 23, 34, 54, 32, 23, 234, 34]

names = ['hans', 'per', 'oetter', 'sara', 'ine']
//brukes til å løpe igjennom elementer og eventuelt manipulere dem
let newArray = array.map( element => element/8)
console.log(newArray)

//brukes til å filtrere elementer i et array 
let newArray2 = array.filter( element => element > 25)

console.log(newArray2)

let namesWithP = names.filter(element => element.includes('p'))

console.log(namesWithP)