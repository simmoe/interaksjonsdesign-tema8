
export const words = [

    {title:'dag 6'},
    {title:'svelte vs vanilla', img:'./assets/svelte.png'},
    {code:`
        //Vanilla
        
        document.querySelector('#domelement').addEventlistener('click', () => { doStuff...} )
        
        //Svelte

        <h2 on:click={doStuff}>Hi</h2>

        `},
    {title:'component based strategy', text:`
        <li>create html <b>templates</b></li>
        <li>fill them with data</li>
        <li>create listeners to interactive elements <b>aka on:click={}</b></li>
        <li>create functions that respond to those interactions</li>
        <li>remove, <b>copy</b> or recreate templates...</li>
    `},
    {title:'More live data'},
    {code:`
    fetch('https://www.someapi.com?maybe_some_constraints')
    .then(res => res.json())
    .then(json => useDataForSomethingFun(json))
    `},
    {title:'Utilities', text:'Utility apps are rarely top-of-mind until you need them. For instance, <b>a pomodoro app</b> to help you plan work-life balance. Or a <b>weather app</b> that warns you before going outside. Or you have to figure out your <b>share of the dinner bill</b>. Or want to <b>theme your local news</b>. Or just <b>a well designed alarm clock</b>. Or a nice featured <b>camera app</b>. Or a <b>checklist</b> or a <b>goodreads list</b> or a <b>thesaurus</b> or...'},
    {title:'<b>Any nice function</b> or feature you can pack inside a simple, yet elegant web app'},
    {title:'It allows a user <b>to get a task done effectively</b>, to <b>get some info</b> - or simply <b>to be entertained</b>'},
    {title:'Consider', text:'<li>Feature (just one, please)</li><li>Simplicity</li><li>Design</li>'},
    {title:'the end'}
]
