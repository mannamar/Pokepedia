import { AdaptiveBackgrounds } from './adaptive-backgrounds.js'

let pokData, specData, pokId, encData, evoData, allEvoPaths;
let isShiny = false;

let searchBar = document.getElementById('searchBar');
let searchBtn = document.getElementById('searchBtn');
let typeTxt = document.getElementById('typeTxt');
let evoCont = document.getElementById('evoCont');

async function GetPokemonData(pokemon = searchBar.value.toLowerCase()) {
    searchBar.value = '';

    let pokResp = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemon}`);
    pokData = await pokResp.json();
    let specResp = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${pokemon}`);
    specData = await specResp.json();
    pokId = await pokData.id;
    if (specData.evolution_chain !== null) {
        let evoUrl = specData.evolution_chain.url;
        let evoResp = await fetch(evoUrl);
        evoData = await evoResp.json();
    } else {
        evoData = null;
    }
    let id = pokData.id;
    let encResp = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}/encounters`);
    encData = await encResp.json();
    if (encData.length === 0) {
        encData = [{location_area: {name: 'Unkown'}}];
    }
}

function GetEnglishFlavText() {
    let flavArray = specData.flavor_text_entries;
    let flav;
    for (let i = 0; i < flavArray.length; i++) {
        if (flavArray[i].language.name == 'en') {
            flav = flavArray[i].flavor_text;
            break;
        }
    }
    if (flav === undefined) {
        flav = 'Not much is known about this mysterious Pokemon. Play the latest game to find out more!';
    }
    return flav;
}

async function PopulateData() {
    pokNameTxt.textContent = CapCase(pokData.name);
    pokNumTxt.textContent = '#' + String(pokData.id).padStart(3, '0');
    pokImg.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokData.id}.png`;
    flavTxt.textContent = GetEnglishFlavText();

    let location = encData[0].location_area.name;
    locTxt.textContent = CapCase(location).replace(' Area', '');

    let types = pokData.types.map(data => CapCase(data.type.name));
    typeTxt.textContent = types.join(', ');

    let abilities = pokData.abilities.map( data => CapCase(data.ability.name));
    abilTxt.textContent = abilities.join(', ');

    let pName = document.createElement('p');
    pName.textContent = CapCase(pokData.name);

    let moves = pokData.moves.map( data => CapCase(data.move.name));
    movTxt.textContent = moves.join(', ');

    ParseEvoData();
    PopulateEvoData();

}

function ParseEvoData() {
    allEvoPaths = [];
    if (evoData === null) {
        console.warn('No evo path');
        let evoBase = {};
        evoBase.name = CapCase(pokData.name);
        evoBase.id = pokData.name;
        allEvoPaths.push([evoBase]);
    } else {
        let evoBase = {};
        evoBase.name = CapCase(evoData.chain.species.name);
        evoBase.id = evoData.chain.species.url.split('/').slice(-2)[0];
        let evoTo = evoData.chain.evolves_to;
        for (let i = 0; i < evoTo.length; i++) {
            let evoMid = {};
            evoMid.name = CapCase(evoTo[i].species.name);
            evoMid.id = evoTo[i].species.url.split('/').slice(-2)[0];
            let evoArray = [evoBase, evoMid];
            let innerEvoTo = evoTo[i].evolves_to;
            if (innerEvoTo.length >= 1) {
                for (let j = 0; j < innerEvoTo.length; j++) {
                    let evoMax = {};
                    evoMax.name = CapCase(innerEvoTo[j].species.name);
                    evoMax.id = innerEvoTo[j].species.url.split('/').slice(-2)[0];
                    evoArray = [evoBase, evoMid, evoMax];
                    allEvoPaths.push(evoArray);
                }
            } else {
                allEvoPaths.push(evoArray);
            }
        }
    }
    if (allEvoPaths.length === 0) {
        let evoBase = {};
        evoBase.name = CapCase(pokData.name);
        evoBase.id = pokData.name;
        allEvoPaths.push([evoBase]);
    }
}

function PopulateEvoData() {
    evoCont.innerHTML = '';
    for (let i = 0; i < allEvoPaths.length; i++) {
        let pEvo = document.createElement('p');
        pEvo.textContent = allEvoPaths[i].map(data => data.name).join(' --> ');
        pEvo.classList.add('text-2xl', 'mt-2');
        evoCont.append(pEvo);
    }
    // console.log(allEvoPaths);
}

searchBtn.addEventListener('click', async function() {
    await GetPokemonData();
    await PopulateData();
    AdaptiveBackgrounds();
});

searchBar.addEventListener('keypress', async function(key) {
    if (key.key === 'Enter') {
        await GetPokemonData();
        await PopulateData();
        AdaptiveBackgrounds();
    }
})

randBtn.addEventListener('click', async function() {
    await GetPokemonData(Math.floor(Math.random() * 1008) + 1);
    await PopulateData();
    AdaptiveBackgrounds();
});

pokImg.addEventListener('click', function() {
    if (isShiny) {
        pokImg.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokData.id}.png`
    } else {
        pokImg.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/${pokData.id}.png`;
    }
    isShiny = !isShiny;
});

heartImg.addEventListener('click', function() {
    heartImg.classList.toggle('ph-heart-fill');
    heartImg.classList.toggle('ph-heart');
    heartImg.classList.toggle('text-red-600');
})

function CapCase(word, splitOn = '-', joinWith = ' ') {
    return word.split(splitOn)
                .map(word => word[0].toUpperCase() + word.slice(1))
                .join(joinWith);
}

GetPokemonData(1);

// stunfisk don't be evolving

AdaptiveBackgrounds();