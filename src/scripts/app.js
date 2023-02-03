let pokData, specData, pokId, encData, evoData;

let searchBar = document.getElementById('searchBar');
let searchBtn = document.getElementById('searchBtn');

async function GetPokemonData() {
    infoCont.innerHTML = '';
    let searchTerm = searchBar.value.toLowerCase();

    let pokResp = await fetch(`https://pokeapi.co/api/v2/pokemon/${searchTerm}`);
    pokData = await pokResp.json();
    let specResp = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${searchTerm}`);
    specData = await specResp.json();
    pokId = await pokData.id;
    let evoUrl = specData.evolution_chain.url;
    let evoResp = await fetch(evoUrl);
    evoData = await evoResp.json();
    console.log(evoUrl);
    let id = pokData.id;
    let encResp = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}/encounters`);
    encData = await encResp.json();
    if (encData.length === 0) {
        encData = [{location_area: {name: 'Unkown'}}];
    }
}

async function PopulateData() {
    let pName = document.createElement('p');
    pName.textContent = pokData.name[0].toUpperCase() + pokData.name.slice(1);

    let img1 = document.createElement('img');
    img1.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokData.id}.png`
    img1.width = 300;

    let img2 = document.createElement('img');
    img2.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/${pokData.id}.png`
    img2.width = 300;

    let location = encData[0].location_area.name;
    let pLoc = document.createElement('p');
    pLoc.textContent = 'Location: ' + CapCase(location);

    let types = pokData.types.map(data => CapCase(data.type.name));
    let pTypes = document.createElement('p');
    pTypes.textContent = 'Type: ' + types.join(', ');

    let abilities = pokData.abilities.map( data => CapCase(data.ability.name));
    let pAbil = document.createElement('p');
    pAbil.textContent = 'Abilities: ' + abilities.join(', ');

    let moves = pokData.moves.map( data => CapCase(data.move.name));
    let pMov = document.createElement('p');
    pMov.textContent = 'Moves: ' + moves.join(', ');

    let allEvoPaths = [];
    let evoBase = evoData.chain.species.name;
    let evoTo = evoData.chain.evolves_to;
    for (let i = 0; i < evoTo.length; i++) {
        let evoMid = evoTo[i].species.name;
        let evoArray = [evoBase, evoMid];
        if (evoTo[i].evolves_to.length >= 1) {
            let evoMax = evoTo[i].evolves_to[0].species.name;
            evoArray.push(evoMax);
        }
        allEvoPaths.push(evoArray);
    }
    console.log(allEvoPaths);



    infoCont.append(pName, img1, img2, pLoc, pTypes, pAbil, pMov);
}

searchBtn.addEventListener('click', async function() {
    await GetPokemonData();
    await PopulateData();
});

function CapCase(word, splitOn = '-', joinWith = ' ') {
    return word.split(splitOn)
                .map(word => word[0].toUpperCase() + word.slice(1))
                .join(joinWith);
}

// GetPokemonData();

// stunfisk don't be evolving