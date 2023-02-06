function saveToLocalStorageByName(name) {
    // Get current values that are saved into local storage
    // Create an array of values to store into local storage
    let favorites = getLocalStorage();

    // Add new name to our favorites array
    favorites.push(name);

    // Sort favorites array
    favorites.sort((a, b) => a - b);

    // Save updated array to local storage
    localStorage.setItem('Favorites', JSON.stringify(favorites));
}

function getLocalStorage() {
    // Get all of the values that are stored in favorites in local storage
    let localStorageData = localStorage.getItem('Favorites');

    if (localStorageData === null) {
        return [];
    }

    return JSON.parse(localStorageData);
}

function removeFromLocalStorage(name) {
    let favorites = getLocalStorage();

    // Find the index of the name in local storage
    let nameIndex = favorites.indexOf(name);

    // Remove the name from the array using splice method
    favorites.splice(nameIndex, 1);

    // Save Updated array to local storage
    localStorage.setItem('Favorites', JSON.stringify(favorites));
}

export { saveToLocalStorageByName, getLocalStorage, removeFromLocalStorage };