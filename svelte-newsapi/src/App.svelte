<script>
	const api_key = 'KYeoBVBY3HocgSJja8c1XEOK7h5YHiihs'
	let q = ''
	let article

	const getNews = () => {
		fetch(`https://newsapi.org/v2/everything?q=${q}&apiKey=${api_key}`)
			.then( res => res.json() )
				.then( json => {
					console.log(json.articles[0])
					article = json.articles[0]
				})
	}

	//lets get an article to start with
	q = 'tomatoes'
	getNews()

</script>

<main>
<header>
	<input placeholder="type to search" type="text" bind:value={q}>
	<button on:click={getNews}>ok</button>
</header>

{#if article}
<a href="{article.url}">
	<div class="article" style='background-image:url({article.urlToImage})'>
		<div>		
			<h1>{ article.title }</h1>
			<p>{article.description}</p>
		</div>
	</div>
</a>
{:else}
	<h2>Skriv noe og trykk ok..</h2>
{/if}

</main>

<style>
	:global(body, html){
		margin:0;
		padding:0;
	}
	:global(*){
		box-sizing:border-box;
	}
	main{
		display:grid;
		place-items:center;
		height:100%;
	}
	header{
		position:absolute;
		top:2rem;
		width:100%;
		display:grid;
		padding: 0 20vw 0 20vw;
	}
	.article{
		width:60vw;
		height:40vh;
		display:grid;
		place-items:center;
		background-color:#eee;
		padding:1rem;
		background-size: cover;
		overflow: scroll;
	}
	.article > div{
		background-color:rgba(255,255,255,.8);
		padding:1rem;
		border-radius:.6rem;
		transition:1s all ease;
		height:100%;
	}
	.article > div:hover{
		border-radius:0;
		background-color:rgba(255,255,255,1);
		transform:scale(20%)
	}
	main a {
		text-decoration:none;
	}
</style>