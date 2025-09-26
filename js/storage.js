// Get favorites from localStorage
export function getFavorites() {
  const favorites = localStorage.getItem('favorites');
  return favorites ? JSON.parse(favorites) : [];
}

// Add a city to favorites
export function addFavorite(city) {
  const favorites = getFavorites();
  
  if (!favorites.includes(city)) {
    favorites.push(city);
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }
}

// Remove a city from favorites
export function removeFavorite(city) {
  const favorites = getFavorites();
  const index = favorites.indexOf(city);
  
  if (index !== -1) {
    favorites.splice(index, 1);
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }
}