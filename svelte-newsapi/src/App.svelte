<script>
	import {apikeys} from '/Users/simo018/Documents/GitHub/00api_keys/apikeys.js'
	const api_key = apikeys.worldnews.api_key

	let q = 'asteroid'
	let article

	const getNews = () => {
		fetch(`https://newsapi.org/v2/everything?q=${q}&apiKey=${api_key}`)
		.then( res => res.json()).then( json => {article = json.articles[0]})
	}
</script>

<main>
	<header>
		<input placeholder="type to search" bind:value={q}>
		<button on:click={getNews}>ok</button>
	</header>
	{#if article}
		<div class="article">
			<div class='text'>		
				<a href="{article.url}"><h1>{ article.title }</h1></a>
				<p>{article.description}</p>
			</div>
			<img src="{article.urlToImage}" alt="{q}">
		</div>
	{:else}
		<h2>Skriv noe og trykk enter..</h2>
	{/if}
</main>

<style>
	:global(*){
		box-sizing:border-box;
	}
	main{
		display:grid;
		grid-template-rows: 1fr 8fr 4fr;
		gap:1rem;
		padding: 10vh 20vw 0 20vw;
	}
	.article{
		display:grid;
		grid-template-columns: 6fr 4fr;
		background-color:#eee;
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