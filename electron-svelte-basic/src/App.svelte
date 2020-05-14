<script>
	import { time } from './stores.js'

	let alarm = new Date()

	const formatter = new Intl.DateTimeFormat('en', {
		hour12: true,
		hour: 'numeric',
		minute: '2-digit',
		second: '2-digit'
	})

	let kanjegfaais = true
	let visbeskjed = false
	$: beskjed = kanjegfaais ? 'Ja, du kan få is' : 'Nei, og nå må du vente endda lengere'
	
	$: kanjegfaais = alarm < $time ? true : false

	let foreldreKontroll = 30

	const faaIs = (event) => {

		visbeskjed = true
		
		if(kanjegfaais){
			event.target.src = './assets/flag.webp'
		}else{
			event.target.src = './assets/barn.webp'
		}
		
		setTimeout(()=>{
			event.target.src = './assets/is.png'
			visbeskjed = false
			alarm = new Date(new Date().getTime() + foreldreKontroll * 60000)
		}, 5000)
	}

</script>

<main>
	<img src='./assets/is.png' alt='iskrem' on:click={faaIs}/>
	{#if visbeskjed}
		<h1>{beskjed}</h1>
	{/if}
</main>

<style>
	:global(*){
		box-sizing:border-box;
	}
	main {
		display:grid;
		place-items:center;
		padding:10vw;
		position:relative;
		height:100vh;
	}
	img{
		height:100%;
	}
	h1 {
		color: #ff3e00;
		text-transform: uppercase;
		font-size: 4em;
		font-weight: 100;
		position:absolute;
		bottom:4rem;
	}
</style>