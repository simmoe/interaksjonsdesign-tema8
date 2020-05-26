<script>
    import { fade } from 'svelte/transition'
    export let plant
    export let remove = ''
    export let day = ''
</script>

<div transition:fade class="plant {plant.needwater && 'need'} {plant.needwater && !plant.days.includes(day) && 'bad'}">
    <h3>{plant.name}</h3>
    {#each plant.days as day}
        <li>{day}</li>
    {/each}
    {#if plant.needwater}
        <button on:click={ () => remove(plant)}>done</button>
    {/if}
</div>

<style>
    .plant{
        height:11rem;
        width:8rem;
        padding:1rem;
        border:1px solid #ddd;
        border-radius:1rem;
        position:relative;
    }
    button{
        position:absolute;
        background:none;
        bottom:.2rem;
        right:.4rem;
    }
    .need{
        background-color:#ddd;
    }
    .bad{
        background-color:salmon;
    }
</style>