import * as model from './model.js';
import { MODAL_CLOSE_SEC } from './config.js';
import recipeView from './view/recipeView.js';
import searchView from './view/searchView.js';
import resultsView from './view/resultsView.js';
import paginationView from './view/paginationView.js';
import bookmarksView from './view/bookmarksView.js';
import addRecipeView from './view/addRecipeView.js';

import 'core-js/stable';
import 'regenerator-runtime/runtime';
import { async } from 'regenerator-runtime';

if (module.hot) {
  module.hot.accept();
}

////////////////////////////////
//RENDER RECIPE MOCKUP
////////////////////////////////
const recipeContainer = document.querySelector('.recipe');
// https://forkify-api.herokuapp.com/v2

const controlRecipe = async function () {
  try {
    const id = window.location.hash.slice(1);
    if (!id) return;
    recipeView.renderSpinner(recipeContainer);

    //0. Update results view to mark selected search results
    resultsView.update(model.getSearchResultsPage());
    //1. Updating bookmarks View
    bookmarksView.update(model.state.bookmarks);

    //2. Loading Recipe
    await model.loadRecipe(id);
    const { recipe } = model.state;

    //3. Redering Recipe
    recipeView.render(model.state.recipe);
    // controlServings();
  } catch (err) {
    console.error(`${err}`);
    recipeView.renderError();
  }
};

////////////////////////////////
//RENDER CONTROL RESULT
////////////////////////////////
const controlSearchResults = async function () {
  try {
    resultsView.renderSpinner();
    // 1. Get search query
    const query = searchView.getQuery();
    if (!query) return;

    // 2. Load search data API from model
    await model.loadSearchResults(query);

    // 3. Render search results
    // console.log(model.state.search.results);
    // resultsView.render(model.state.search.results);
    resultsView.render(model.getSearchResultsPage());

    // 4. Render intial pagination button
    // resultsView.update(model.getSearchResultsPage());
    paginationView.render(model.state.search);
  } catch (err) {
    console.error(`${err}`);
  }
};

////////////////////////////////
//RENDER PAGINATION
////////////////////////////////
const controlPagination = function (gotoPage) {
  // 3. Render NEW search results
  resultsView.render(model.getSearchResultsPage(gotoPage));
  // 4. Render NEW intial pagination button
  paginationView.render(model.state.search);
};

////////////////////////////////
//RENDER Serving inside recipe View
////////////////////////////////
const controlServings = function (newServings) {
  //Update the recipe servings (in state)
  model.updateServings(newServings);

  //Update the recipe view
  // recipeView.render(model.state.recipe);
  recipeView.update(model.state.recipe);
};

////////////////////////////////
//Controling to add a bookmark
////////////////////////////////
const controlAddBookmark = function () {
  // console.log(model.state.recipe.bookmarks);
  //Add or Remove bookmark
  if (!model.state.recipe.bookmarks) {
    model.addBookmark(model.state.recipe);
  } else {
    model.removeBookmark(model.state.recipe.id);
  }
  // model.addBookmark(model.state.recipe);
  // console.log(model.state.recipe);
  //Update recipe view
  recipeView.update(model.state.recipe);

  //Render bookmarks
  bookmarksView.render(model.state.bookmarks);
};
const controlBookmarks = function () {
  bookmarksView.render(model.state.bookmarks);
};

const controlAddRecipe = async function (newRecipe) {
  try {
    // Show loading indicator
    recipeView.renderSpinner();

    await model.uploadRecipe(newRecipe);
    console.log(model.state.recipe);

    // Render Recipe
    recipeView.render(model.state.recipe);

    // Success message
    addRecipeView.renderMessage();

    //Render bookmarks
    bookmarksView.render(model.state.bookmarks);

    // Change ID for URL
    window.history.pushState(null, '', `#${model.state.recipe.id}`);

    //Close form window
    setTimeout(function () {
      addRecipeView.toggleWindow();
    }, MODAL_CLOSE_SEC * 1000);
  } catch (err) {
    console.error('🤣', err);
    addRecipeView.renderError(err.message);
  }

  //Upload new recipe
};

////////////////////////////////
//EVENT LISTENERS RUNNING INSIDE THE VIEW CONTROL
////////////////////////////////
const init = function () {
  bookmarksView.addHandlerRender(controlBookmarks);
  recipeView.addHandlerRender(controlRecipe);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerAddBookmark(controlAddBookmark);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPagination);
  addRecipeView.addHandlerUpload(controlAddRecipe);
};
init();
