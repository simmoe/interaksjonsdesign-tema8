<script>
	import {apikeys} from '/Users/simo018/Documents/GitHub/00api_keys/apikeys.js'
	import { scale, fly, fade } from 'svelte/transition'
	import { HeartIcon } from 'svelte-eva-icons'

	const api_key = apikeys.worldnews.api_key
	let favs = []
	let showFavs = false

	const addFav = (article)=> {
		if(favs.includes(article)){
			favs = favs.filter( element => element != article )
		}else{
			favs = [article, ...favs] //spread syntax
		}
		if(favs.length == 0) showFavs = false
	}

let q = 'space'
	let article

	const getNews = () => {
		article = null
		fetch(`https://newsapi.org/v2/everything?q=${q}&apiKey=${api_key}`)
		.then( res => res.json()).then( json => {article = json.articles[0]})
	}
	getNews()
</script>

<main>
	<header>
		<input 
			placeholder="type to search" 
			bind:value={q}
			on:keydown={ event => event.key == 'Enter' ? getNews() : '' }
			on:click = { event => event.target.value = ''}
			on:click = { event => showFavs = false }
			on:focus = { event => event.target.value = ''}
			>
		<button on:click={getNews}>ok</button>
		{#if favs.length > 0}
			<button transition:scale on:click={ () => showFavs = !showFavs }>
				{ showFavs ? 'skjul favoritter' : 'vis favoritter'}
			</button>
		{/if}
	</header>
	{#if !showFavs}
		{#if article}
			<div class="article" in:fly={{x:-1000}}>
				<div class='text'>		
					<a href="{article.url}"><h1>{ article.title }</h1></a>
					<p>{article.description}</p>
				</div>
				<img src="{article.urlToImage}" alt="{q}">
				<div class="icon" on:click={ () => addFav(article) } 
					style={favs.includes(article) ? 'fill:red;' : ''}
					>
					<HeartIcon />
				</div>
			</div>
		{:else}
			<h2>Skriv noe og trykk enter..</h2>
		{/if}
	{:else}
		<div class="favs">		
		 {#each favs as fav}
		 	<div class="shortarticle">
				<a href="{fav.url}"><h1>{ fav.title }</h1></a>
				<div class="icon" on:click={ () => addFav(fav) } style='fill:red'>
					<HeartIcon />
				</div>
			</div>
		 {/each}
		</div>
	{/if}



</main>

<style>
	:global(*){
		box-sizing:border-box;
	}
	.shortarticle{
		position:relative;
		padding-right:2rem;
	}
	.icon{
		width:2rem;
		height:2rem;
		fill:lightgray;
		position:absolute;
		top:.4rem;
		right:.4rem;
		cursor:pointer;
		transition: all .4s ease;
	}
	.icon:hover{
		transform:scale(1.2);
		fill:salmon;
	}
	main{
		display:grid;
		grid-template-rows: 1fr 8fr 2fr;
		gap:1rem;
		padding: 10vh 20vw 0 20vw;
	}
	.article{
		display:grid;
		grid-template-columns: 6fr 4fr;
		background-color:#eee;
		position:relative;
	}
	.text {
		padding:1rem;
	}
	.article > img {
		width:100%;
		height:100%;
		object-fit: cover;
		object-position: top center;
	}
	a {
		color:black;
	}
	input{
		outline:none;
	}
	@media (max-width:1000px){
		main{
			padding: 5vh 5vw 0 5vw;
			grid-template-rows: 2fr 8fr;
		}
		.article{
			grid-template-columns:1fr;
			grid-template-rows:1fr 1fr;
		}
	}
</style>