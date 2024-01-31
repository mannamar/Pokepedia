import { AdaptiveBackgrounds } from './adaptive-backgrounds.js'

import { saveToLocalStorageByName, getLocalStorage, removeFromLocalStorage, getLocalFavData, saveLocalFavData } from "./localstorage.js";

// import pokemonNames from '../data/pokemonNames.json' assert { type: 'json' };
// import pokemonData from '../data/pokemonData.json' assert { type: 'json' };
// const { default: pokemonData } = await import("../data/pokemonData.json", { assert: { type: "json" } });

async function GetLocalData() {
    let resp = await fetch('./data/pokemonData.json');
    return await resp.json();
}

let pokemonData = await GetLocalData();
// console.log(pokemonData)

const favDrawer = document.getElementById('favDrawer');
const drawerXBtn = document.getElementById('drawerXBtn');
const drawer = new Drawer(favDrawer);

let pokData, specData, pokId, encData, evoData, allEvoPaths;
let isShiny = false;

let searchBar = document.getElementById('searchBar');
let searchBtn = document.getElementById('searchBtn');
let autoWrap = document.getElementById('autoWrap');
let autoList = document.getElementById('autoList');
// let typeTxt = document.getElementById('typeTxt');
let evoCont = document.getElementById('evoCont');
let typeColors = { Bug: '#90c12c', Dark: '#5a5366', Dragon: '#0a6dc4', Electric: '#f3d23b', Fairy: '#ec8fe6', Fighting: '#ce4069', Fire: '#ff9c54', Flying: '#8fa8dd', Ghost: '#5269ac', Grass: '#63bd5b', Ground: '#d97746', Ice: '#74cec0', Normal: '#9099a1', Poison: '#ab6ac8', Psychic: '#f97176', Rock: '#c7b78b', Steel: '#5a8ea1', Water: '#4d90d5' };

async function GetPokemonData(pokemon = searchBar.value.toLowerCase()) {
    searchBar.value = '';
    autoList.textContent = '';

    let pokResp = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemon}`);
    pokData = await pokResp.json();
    pokId = pokData.id;
    let specResp = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${pokemon}`);
    specData = await specResp.json();
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

function setFavIcon() {
    let favorites = getLocalStorage();
    if (favorites.includes(pokId)) {
        heartImg.classList.add('ph-heart-fill');
        heartImg.classList.add('text-red-600');
        heartImg.classList.remove('ph-heart');
    } else {
        heartImg.classList.remove('ph-heart-fill');
        heartImg.classList.remove('text-red-600');
        heartImg.classList.add('ph-heart');
    }
}

function GetEnglishFlavText() {
    let flavArray = specData.flavor_text_entries;
    let flav = 'Not much is known about this mysterious Pokemon. Play the latest game to find out more!';
    for (let i = 0; i < flavArray.length; i++) {
        if (flavArray[i].language.name == 'en') {
            flav = flavArray[i].flavor_text.replaceAll('', ' ');
            break;
        }
    }
    return flav;
}

async function PopulateData() {
    isShiny = false;
    pokNameTxt.textContent = CapCase(pokData.name);
    pokNumTxt.textContent = '#' + String(pokData.id).padStart(3, '0');
    pokImg.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokData.id}.png`;
    // pokImg.src = `./assets/artwork/${pokData.id}.png`;
    flavTxt.textContent = GetEnglishFlavText();

    let location = encData[0].location_area.name;
    locTxt.textContent = CapCase(location).replace(' Area', '');

    let types = pokData.types.map(data => CapCase(data.type.name));
    // typeTxt.textContent = types.join(', ');
    PopulateTypeIcons(types);

    let abilities = pokData.abilities.map( data => CapCase(data.ability.name));
    abilTxt.textContent = abilities.join(', ');

    let pName = document.createElement('p');
    pName.textContent = CapCase(pokData.name);

    let moves = pokData.moves.map( data => CapCase(data.move.name));
    movTxt.textContent = moves.join(', ');

    setFavIcon();
    ParseEvoData();
    PopulateEvoData();

}

function PopulateTypeIcons(types) {
    typeCont.innerHTML = '';
    for (let i = 0; i < types.length; i++) {
        let div = document.createElement('div');
        div.classList.add('typeIconCont', 'flex', 'items-center');
        div.style.backgroundColor = typeColors[types[i]];
        let img = document.createElement('img');
        img.src = `./assets/types/${types[i]}.png`;
        img.classList.add('typeImg');
        let p = document.createElement('p');
        p.classList.add('typeTxt', 'mx-auto', 'pr-4');
        p.textContent = types[i];

        div.append(img, p);
        typeCont.append(div);
    }
}

function ParseEvoData() {
    allEvoPaths = [];
    if (evoData === null) {
        console.warn('No evo path');
        let evoBase = {};
        evoBase.name = CapCase(pokData.name);
        evoBase.id = pokData.id;
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
        evoBase.id = pokData.id;
        allEvoPaths.push([evoBase]);
    }
}

function PopulateEvoData() {
    evoCont.innerHTML = '';
    for (let i = 0; i < allEvoPaths.length; i++) {
        // let pEvo = document.createElement('p');
        // pEvo.textContent = allEvoPaths[i].map(data => data.name).join(' --> ');
        // pEvo.classList.add('text-2xl', 'mt-2');
        // evoCont.append(pEvo);
        let thisPath = allEvoPaths[i];
        let outterDiv = document.createElement('div');
        outterDiv.classList.add('flex', 'items-center', 'justify-center', 'evoBranch');
        for (let j = 0; j < thisPath.length; j++) {
            let thisMon = thisPath[j];

            let innerDiv = document.createElement('div');
            innerDiv.classList.add('evoCol');
            
            if (j > 0) {
                let iCon = document.createElement('i');
                iCon.classList.add('ph-arrow-right-bold');
                outterDiv.append(iCon);
            }

            let img = new Image();
            img.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/${thisMon.id}.gif`;
            img.onerror = function() {
                img.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${thisMon.id}.png`;
                img.onerror = null;
            }
            img.classList.add('evoImg', 'mx-auto');
            img.addEventListener('click', async function() {
                await GetPokemonData(thisMon.id);
                await PopulateData();
                AdaptiveBackgrounds();
                window.scrollTo({top: 0, behavior: 'instant'});
            });

            let p = document.createElement('p');
            p.textContent = thisMon.name;
            p.classList.add('text-center');

            innerDiv.append(img, p);
            outterDiv.append(innerDiv);
        }
        evoCont.append(outterDiv);
    }
    // console.log(allEvoPaths);

}

searchBtn.addEventListener('click', async function() {
    if (searchBar.value === '') {
        console.warn('Empty search')
        return;
    };
    await GetPokemonData();
    await PopulateData();
    AdaptiveBackgrounds();
});

searchBar.addEventListener('keypress', async function(key) {
    if (key.key === 'Enter') {
        autoList.textContent = '';
        if (searchBar.value === '') {
            console.warn('Empty search')
            return;
        };
        await GetPokemonData();
        await PopulateData();
        AdaptiveBackgrounds();
    }
})

searchBar.addEventListener('input', function() {
    const inputValue = searchBar.value.toLowerCase();

    if (inputValue.length === 0) {
        autoList.textContent = '';
    } else if (isNaN(inputValue)) {
        let filteredData = pokemonData.results.filter(x => x.name.startsWith(inputValue)).slice(0,11);
        createAutocompleteList(filteredData);
    } else {
        let filteredData = pokemonData.results.filter(x => x.num.startsWith(inputValue)).slice(0,11);
        createAutocompleteList(filteredData);
    }
});

searchBar.addEventListener('focus', function() {
    autoList.classList.remove('hidden');
});

searchBar.addEventListener('blur', function() {
    setTimeout(function(){
        autoList.classList.add('hidden');
    }, 150);
});

function createAutocompleteList(arr) {
    autoList.textContent = '';

    arr.forEach(item => {
        const li = document.createElement('li');
        const button = document.createElement('button');
        const span = document.createElement('span');
        span.classList.add('flex');
        const img = document.createElement('img');
        img.classList.add('h-10', 'ml-1');
        img.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${item.num}.png`
        const div = document.createElement('div');
        div.classList.add('mt-3', 'ml-2');
        div.innerText = `${item.num}. ${item.name}`
        // button.innerHTML = item.name;
        button.addEventListener('click', async function() {
            autoList.textContent = '';
            await GetPokemonData(item.num);
            await PopulateData();
            AdaptiveBackgrounds();
        });
        span.append(img, div);
        button.append(span);
        li.appendChild(button);
        autoList.appendChild(li);
    });
}

randBtn.addEventListener('click', async function() {
    await GetPokemonData(Math.floor(Math.random() * 1008) + 1);
    await PopulateData();
    AdaptiveBackgrounds();
});

pokImg.addEventListener('click', function() {
    if (isShiny) {
        pokImg.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokData.id}.png`
        // pokImg.src = `./assets/artwork/${pokData.id}.png`
    } else {
        pokImg.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/${pokData.id}.png`;
        // pokImg.src = `./assets/artwork/shiny/${pokData.id}.png`;
    }
    isShiny = !isShiny;
});

heartImg.addEventListener('click', function() {
    let favorites = getLocalStorage();
    let favData = getLocalFavData();
    if (favorites.includes(pokId)) {
        removeFromLocalStorage(pokId);
    } else {
        saveToLocalStorageByName(pokId);
        saveLocalFavData(pokId, CapCase(pokData.name), document.body.style.backgroundColor);
    }
    heartImg.classList.toggle('ph-heart-fill');
    heartImg.classList.toggle('ph-heart');
    heartImg.classList.toggle('text-red-600');
})

favBtn.addEventListener('click', function() {
    CreateElements();
    drawer.show();
});

drawerXBtn.addEventListener('click', function() {
    drawer.hide();
})

function CreateElements() {
    favBox.innerHTML = '';
    let favData = getLocalFavData();
    let favorites = getLocalStorage();
    
    favorites.map(pokNum => {
        let div = document.createElement('div');
        div.classList.add('favPokBox', 'mx-auto', 'flex', 'items-end');
        div.style.background = favData[pokNum].color;

        let p1 = document.createElement('p');
        p1.classList.add('favPokNum');
        p1.textContent = '#' + String(pokNum).padStart(3, '0');

        let p2 = document.createElement('p');
        p2.classList.add('favPokName');
        p2.textContent = favData[pokNum].name;

        let img = document.createElement('img');
        img.classList.add('favPokImg');
        img.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokNum}.png`;
        // img.src = `./assets/artwork/${pokNum}.png`;
        // img.type = 'button';
        // img.setAttribute('data-drawer-hide', 'favDrawer');

        // let deleteBtn = document.createElement('button');
        // deleteBtn.className = 'btn btn-danger';
        // deleteBtn.textContent = 'Delete';
        // deleteBtn.type = 'button';
        // deleteBtn.addEventListener('click', function() {
        //     removeFromLocalStorage(person);
        // });
        div.addEventListener('click', async function() {
            await GetPokemonData(pokNum);
            await PopulateData();
            AdaptiveBackgrounds();
            drawer.hide();
        });
        div.append(p1, p2, img);
        favBox.appendChild(div);
        // favDrawer.appendChild(deleteBtn);
    })

}

function CapCase(word, splitOn = '-', joinWith = ' ') {
    return word.split(splitOn)
                .map(word => word[0].toUpperCase() + word.slice(1))
                .join(joinWith);
}

async function PageLoad() {
    await GetPokemonData(1);
    setFavIcon();
    ParseEvoData();
    PopulateEvoData();
    AdaptiveBackgrounds();
}

PageLoad();

// No Auto-complete for now
// new Awesomplete(searchBar, {
// 	list: pokemonNames
// });


// Check these edge case
    // Stunfisk don't be evolving
    // Eevee going ham
    // MewTwo no evo
    // Gholdengo no evo data
    // Cosmog two paths
