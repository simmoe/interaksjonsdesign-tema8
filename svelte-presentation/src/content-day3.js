export const words = [

    {title:'github'},
    {title:'2 repos:', text:'<li>En lokal kopi af "interaksjonsdesign-tema-8"</li><li>et eget repo med prosjekter og til slutt, temaoppgave</li>'},
    {title:'interaksjonsdesign-tema8', text:'Dette brukes bare som referanse og kopi. Derfor skal det i utgansgspunktet <b>ikke endres</b> i det. <b>MEN</b> når man åpner et repo i VS code, legges det noen skjulte filer till automatisk. Altså kan man i Github Desktop se at det er noe som er forandret - og man får ikke kjøre pull', img:'./assets/git1.png'},
    {title:'slet forandringer', text:'Disse kan slettes ved og velge "branch/discard all changes" i Github Desktop. Etter det kan du velge <b>Fetch Origin , som da henter de nyeste filene</b>', img:'./assets/git2.png'},
    {title:'Bruk finder', text:'I utgangspunktet kan man bruke github desktop (fetch origin) og finder til å se filene - men selvfølgelig kan man åpne dem i VS Code og - da må man bare sørge for å slette endringer (discard changes)', img:'./assets/finder.png'},
    {title:'personligt repo', text:'Så er det det repo dere bruker selv til å holde styr på de forskjellige kodeoppgaver og ekseperimenter. Det er også her temaoppgaven skal ligge til slutt.', img:'./assets/personal.png'},
    {title:'Link i paper', text:'Legg gjerne et link ut til dette repo i paper - så er det lettere og følge med i diverse', img:'./assets/repos.png'},
    {title:'Data!', text:'Dagen i dag jobber vi med å hente inn og parse data i json format. I tema-github ligger det en mappe med tre forskjellige data filer - kopier dem til en ny mappe i dit eget repo. Kald mappen for "parsing-json" eller lignende. Hent også de tre filer i templates/html og legg dem i samme mappe',img:'./assets/assets.png'},
    {title:'Sådan skal mappen se ut', img:'./assets/json-parsing.png'},
    {title:'JSON', text:'Javascript Object Notation er en samlet standard for utveksling av informasjon på internettet. Veldig ofte er JSON på øverste nivå enten et array eller et objekt. Objekter sine indholdselementer tar man fat på med punktum - arrays løper man igjennom med map() eller ved å angi et nummer - array[2] <li>Birds.birds[1].family → Cormorants</li><li>Birds.birds[0].members.map(name => console.log(name)) → skriver ut?</li> ',img:'./assets/json.png'},
    {title:'Lokale data', text:'Om vi har en lokal fil med json data kan vi importere den direkte til vores javascript:', 
    code:`
        import Birds from "./data/Birds.js" 
        console.log(Birds.birds[0].family)    //Albatrosses 
    `},
    {title:'Script module', text:'Men først må vi angi at scriptet har type="module":', 
    code:`
        <script type="module" src="script.js"></script>
    `},
    {title:'the end'}
]
