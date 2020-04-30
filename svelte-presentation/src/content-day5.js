
export const words = [

    {title:'dag 5'},
    {title:'Bored Api', img:'./assets/boredapi.png'},
    {code:`
        fetch('https://www.boredapi.com/api/activity')
            .then(res => res.json())
                .then(json => console.log(json))
    `},
    {code:`
    {
        "activity": "Organize a cluttered drawer",
        "accessibility": "0.9",
        "type": "busywork",
        "participants": 1,
        "price": "",
        "link": "",
        "key": "9714586"
    }    
    `},
    {code:`
    <main>
        <div id='button' class='button'>hit me</div>
        <div class='activity' id='activity'>
            <h2 id='title'>Some activity</h2>
            <p id='accessibility'>Accessibility</p>
            <p id='type'>Category</p>
            <p id='participants'>Number of participants</p>
            <p id='price'>Price in dollares</p>
            <a href='#' id='link'>a link - if there is one</a>
        </div>
    </main>
    `},
    {img:'./assets/boredtemplate.png'},
    {title:'vanilla strategy', text:`
        <li>create html elements</li>
        <li>create pointers to those elements in javascript</li>
        <li>insert data into these elements</li>
        <li>create listeners to the interactive elements</li>
        <li>create functions that respond to those interactions</li>
        <li>remove or recreate elements.......</li>
    `},
    {img:'./assets/svelte.png'},
    {img:'./assets/nyt.png', link:'https://www.nytimes.com/interactive/2020/02/21/business/coronavirus-airline-travel.html'},
    {img:'./assets/netflix.png'},
    {img:'./assets/drdk.png'},
    {title:'component based strategy', text:`
        <li>create html <b>template</b></li>
        <li>fill template with data</li>
        <li>create listeners to interactive elements</li>
        <li>create functions that respond to those interactions</li>
        <li>remove, <b>copy</b> or recreate templates...</li>
    `},
    {title:'the end'}
]
