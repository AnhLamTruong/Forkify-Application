import { startsWith } from 'core-js';
import { async } from 'regenerator-runtime';
import 'regenerator-runtime/runtime';
import { API_URL, RES_PER_PAGE, KEY } from './config.js';
// import { getJSON, sendJSON } from './helpers.js';
import { AJAX } from './helpers.js';

export const state = {
  recipe: {},
  search: {
    query: '',
    results: [],
    page: 1,
    resultsPerPage: RES_PER_PAGE,
  },
  bookmarks: [],
};

////////////////////////////////
//LOADING API and convert it to object
////////////////////////////////
const createRecipeObject = function (data) {
  const { recipe } = data.data;
  return {
    id: recipe.id,
    title: recipe.title,
    publisher: recipe.publisher,
    sourceUrl: recipe.source_url,
    image: recipe.image_url,
    servings: recipe.servings,
    cookingTime: recipe.cooking_time,
    ingredients: recipe.ingredients,
    //If there is a key already exist inside the recipe, if not, just return nothing
    //If there is a key inside, using destrucutre the key to key:recipe.key
    ...(recipe.key && { key: recipe.key }),
  };
};

export const loadRecipe = async function (id) {
  try {
    //CREATING AN OBJECT TO STORE THE RECIPE
    const data = await AJAX(`${API_URL}/${id}?key=${KEY}`);
    state.recipe = createRecipeObject(data);

    if (state.bookmarks.some(bookmark => bookmark.id == id)) {
      state.recipe.bookmarks = true;
    } else {
      state.recipe.bookmarks = false;
    }
    // console.log(state.recipe);
  } catch (err) {
    console.error(`${err}`);
    throw err;
  }
};

////////////////////////////////
//LOADING API and convert it to an  array of  objects
////////////////////////////////
export const loadSearchResults = async function (query) {
  try {
    state.search.query = query;
    const data = await AJAX(`${API_URL}?search=${query}&key=${KEY}`);

    state.search.results = data.data.recipes.map(rec => {
      return {
        id: rec.id,
        title: rec.title,
        publisher: rec.publisher,
        image: rec.image_url,
        ...(rec.key && { key: rec.key }),
      };
    });
    state.search.page = 1;
  } catch (err) {
    console.error(`${err}`);
    throw err;
  }
};

////////////////////////////////
//Function Returning 10 recipes per page
////////////////////////////////
export const getSearchResultsPage = function (p = state.search.page) {
  state.search.page = p;
  const start = (p - 1) * state.search.resultsPerPage; //10
  const end = p * state.search.resultsPerPage;
  return state.search.results.slice(start, end);
};

////////////////////////////////
//Function that go through the data quantity to update it into new quantity
////////////////////////////////
export const updateServings = function (newServings) {
  // console.log(state.recipe.servings);
  state.recipe.ingredients.forEach(ing => {
    // console.log(ing);
    ing.quantity = ing.quantity * (newServings / state.recipe.servings);
    // console.log(ing.quantity);
    // newQt = oldQt* newServings/oldServing
    //  4 = 2 * 8/4
  });
  state.recipe.servings = newServings;
};

////////////////////////////////
//PresistBookMarks
////////////////////////////////
const persistBookmarks = function () {
  localStorage.setItem('bookmarks', JSON.stringify(state.bookmarks));
};

////////////////////////////////
//Function Storing data to local storage for bookmarking
////////////////////////////////
export const addBookmark = function (recipe) {
  //Add a bookmark
  state.bookmarks.push(recipe);
  // Mark current recipe as bookmark
  if (recipe.id === state.recipe.id) {
    state.recipe.bookmarks = true;
  }
  persistBookmarks();
};

export const removeBookmark = function (id) {
  //Delete a bookmark
  const index = state.bookmarks.findIndex(el => el.id === id);
  state.bookmarks.splice(index, 1);

  // Mark current recipe as NOT bookmarks
  // console.log('ID check:', id === state.recipe.id);
  if (id === state.recipe.id) {
    state.recipe.bookmarks = false;
  }
  persistBookmarks();
};

const init = function () {
  const storage = localStorage.getItem('bookmarks');
  if (storage) state.bookmarks = JSON.parse(storage);
};
init();

const clearBookmarks = function () {
  localStorage.clear('bookmarks');
};
// clearBookmarks();

export const uploadRecipe = async function (newRecipe) {
  try {
    // console.log(Object.entries(newRecipe));
    const ingredients = Object.entries(newRecipe)
      .filter(entry => entry[0].startsWith('ingredient') && entry[1] !== '')
      .map(ing => {
        const ingArr = ing[1].split(',').map(el => el.trim());
        // const ingArr = ing[1].replaceAll(' ', '').split(',');
        if (ingArr.length !== 3)
          throw new Error(
            'Wrong ingredient format! PLease use the correct format'
          );
        const [quantity, unit, description] = ingArr;
        return { quantity: quantity ? +quantity : null, unit, description };
      });
    const recipe = {
      title: newRecipe.title,
      source_url: newRecipe.sourceUrl,
      image_url: newRecipe.image,
      publisher: newRecipe.publisher,
      cooking_time: +newRecipe.cookingTime,
      servings: +newRecipe.servings,
      ingredients,
    };
    const data = await AJAX(`${API_URL}?key=${KEY}`, recipe);
    state.recipe = createRecipeObject(data);
    addBookmark(state.recipe);
  } catch (err) {
    throw err;
  }
};
