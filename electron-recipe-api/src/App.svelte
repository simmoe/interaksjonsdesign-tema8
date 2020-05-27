<script>
	import {apikeys} from '/Users/simo018/Documents/GitHub/00api_keys/apikeys.js'
	import { scale, fade } from 'svelte/transition'

	let ingredients = []
	let recipe
	$: console.log(ingredients.toString())
	const apikey = apikeys.spoonacular.api_key

	const getRecipes = () => {
		fetch(`https://api.spoonacular.com/recipes/findByIngredients?apiKey=${apikey}&ingredients=${ingredients}&number=1`)
			.then(res=>res.json())
			.then(json => {
				console.log(json)
				recipe=json[0]
				showRecipe = true
			})
	}
	const add = (e) => {
		e.target.checked ? ingredients = [...ingredients, e.target.id] : ingredients.filter(i => i!= e.target.id)
	}

	let inp
	let suggestions = []

	let showRecipe = false

	const autocomplete = () => {
		if(inp.length < 2) return
		fetch(`https://api.spoonacular.com/food/ingredients/autocomplete?apiKey=${apikey}&query=${inp}`)
			.then(res=>res.json())
			.then(json => suggestions = json)
	}
</script>

<main>
	<h1>Hello cookie!</h1>
	<input type="text" bind:value={inp} on:input={autocomplete}>

	{#if ingredients.length > 0}
		<button transition:scale on:click={getRecipes}>search recipe</button>
	{/if}

	{#if !showRecipe}
	<div class="find" out:scale>	
		<div class="suggestions">
			{#each suggestions as item}
				<div class="suggestion" on:click={()=>ingredients = [item.name, ...ingredients]}>{item.name}</div>
			{/each}
		</div>
		<div class="ingredients">
			{#each ingredients as item}
				<div class="ingredient" on:click={()=>{ingredients = ingredients.filter(i=>i!=item)}}>{item}</div>
			{/each}
		</div>
	</div>
	{:else}
	<div class="recipe" in:fade>
		<h1>{recipe.title}</h1>
		<div class="divider">		
			<img src="{recipe.image}" alt="">
			<div class="info">			
				<h2>Du mangler disse ingrediensene</h2>
				{#each recipe.missedIngredients as missed}
					<li>{missed.name}</li>
				{/each}
				<button on:click={()=>showRecipe=false}>tilbake</button>
			</div>
		</div>
	</div>
	{/if}


</main>

<style>
	.divider{
		display:grid;
		grid-template-columns: 1fr 3fr;
		gap:2rem;
	}
	.find{
		margin-top:3rem;
		display:grid;
		grid-template-columns: 1fr 1fr;
	}
	main {
		text-align: center;
		padding: 1em;
		max-width: 240px;
		margin: 0 auto;
	}
	.suggestions, .ingredients{
		display:grid;
		grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
		gap:1rem;
	}
	.suggestion, .ingredient{
		width:100px;
		height:3rem;
		border:1px solid gray;
		display: grid;
		place-items: center;
	}
	.ingredient{
		background:salmon;
	}
	h1 {
		color: #ff3e00;
		text-transform: uppercase;
		font-size: 4em;
		font-weight: 100;
	}
	@media (min-width: 640px) {
		main {
			max-width: none;
		}
	}
</style>