<script>
	import { info } from './data.js'
	let map

	const init = () => {
		mapboxgl.accessToken = 'pk.eyJ1IjoibHVkdmlra3ZhbHN2aWsiLCJhIjoiY2s5NGFnOG45MDVjMzNvbnhoanBzb3BoNCJ9.UyR6o9v82LFpr3naB6_YLg';
		map = new mapboxgl.Map({
			container: 'map',
			style: 'mapbox://styles/mapbox/satellite-v9',
			zoom: 2.5,
			center: [6.856797, 66.597289]
		});
		map.addControl(
			new mapboxgl.GeolocateControl({
				positionOptions: {
					enableHighAccuracy: true  
				}, 
				trackUserLocation: true
			})
			);
			var nav = new mapboxgl.NavigationControl()
			map.addControl(nav, 'bottom-right')
	}

	let region 

	$: console.log(region)
	const flySor = () => {
		region = info[0]
		map.flyTo({
			center: [6.282324, 60.254881],
			zoom: 4.65
		})
	}

	const flyNord = () => {
		region = info[1]
		map.flyTo({
			center: [13.071520 , 68.925976],
			zoom: 3.65
		})	
	}


</script>

<svelte:head>
	<script on:load={init} src='https://api.mapbox.com/mapbox-gl-js/v1.8.0/mapbox-gl.js'></script>
	<script src="https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-directions/v4.0.2/mapbox-gl-directions.js">
	</script>
	<link href='https://api.mapbox.com/mapbox-gl-js/v1.8.0/mapbox-gl.css' rel='stylesheet' />
	<link rel="stylesheet"
		href="https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-directions/v4.0.2/mapbox-gl-directions.css"
		type="text/css" />
</svelte:head>

<main>
	<div>
		<div id='map' />
		<button on:click={flySor}>sør</button>
		<button on:click={flyNord}>nord</button>
	</div>
	{#if region}
		<div class="region">
			<h2>{region.Region}</h2>
			<p>{region.Tidsrom}</p>
			<p>{region.Minstemål}</p>
		</div>
	{:else}
		<h2>Klikk på knappene for å vise info</h2>
	{/if}

</main>

<style>
	main {
		width: 100vw;
		height: 100vh;
		display: grid;
		place-items: center;
	}

	#map {
		width: 60vw;
		height: 60vh;
	}
	#map{
		border-radius:4rem;
	}
</style>