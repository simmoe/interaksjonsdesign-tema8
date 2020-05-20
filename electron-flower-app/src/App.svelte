<script>
	import { plants } from './plants'
	import Plant from './Plant.svelte'

	let needwater = []
	let garden = [] 

	//make a copy of the plants in the .js file 
	let allPlants = plants

	//make an array with weekdays
	const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']

	//set a variable, day, to the correct index in the weekdays array 
	let day = days[new Date().getDay()]

	//make a function that checks whether plants need water
	const checkPlants = () => {
		//whenever the day changes (once every 24 hours) 
		//check all plants and set then to need watering if they include the new day 
		if(day != days[new Date().getDay()]){
			day = days[new Date().getDay()]
			console.log('new day ', day)
			allPlants.map( p => { if(p.days.includes(day)) p.needwater = true } ) 
		}
		//needwater includes all plants that have not been watered (even if it was on another day)
		needwater = allPlants.filter( p => p.needwater)
		//garden includes all plants that don't need water
		garden = allPlants.filter( p => !p.needwater)
	}

	//check the plants current status on start
	checkPlants()
 
	//set an interval that check plants every minute
	setInterval(checkPlants, 20000)

	//when a plant has been watered, we can remove it 
	const remove = plant => {
		plant.needwater = false
		needwater = needwater.filter( p => p.name != plant.name)
		garden = [plant, ...garden]
	}


</script>

<h1>{day}</h1>
<main>
<div class="needs">
	{#each needwater as plant}
		<Plant {plant} {remove} {day}/>
	{:else}
		<h3>No watering needed</h3>
	{/each}
</div>
<div class="garden">
	{#each garden as plant}
		<Plant {plant} {day} />
	{:else}
		<h3>No plants</h3>
	{/each}
</div>

</main>

<style>
	main{
		display:grid;
		grid-template-rows: 1fr 1fr;
		gap:2rem;
	}
	.needs, .garden{
		display:grid;
		grid-auto-flow:column;
		justify-content:center;
		gap:1rem; 
	}
</style>