# Forkify Project

https://forkify-application-anh-portfolio.netlify.app/

## Design Pattern

This project was implement in **MVC (Model-View-Control)** design pattern.

1. **Model** will contain the back-end functionality which is including AJAX cal APIs, handling recipe Objects, Uploading funtion, etc.

2. **View** will have many class annd methods which will be called by the **Controller** to render the DOM structure to the application view

3. **Controller** will call the functions inside **View** and **Model** to manipulate data from the API and render it from **View**

![Architecture](https://github.com/AnhLamTruong/Forkify-Application/blob/master/flow-chart/forkify-architecture-recipe-loading.png)

## Flow Charts and Functions

### Selecting and Rendering Recipe to the UI

![Render_And_Select](https://github.com/AnhLamTruong/Forkify-Application/blob/master/flow-chart/forkify-flowchart-part-1-render.png)

- **Model** The recipe was fetched from the Forkify APIv2 using async-await function.
  `const data = await AJAX('${API_URL}/${id}?key=${KEY}');`
  Then it will be exported the state objetc which is contain recipe.

```
{
  export const state = {
    recipe: {},
  };
}
```

Selecting and recipe will be based on the `href='#[DATA.ID]'`. Then, using the `window.location.hash.slice(1);` to get the hash of the the recipe, and use it to get the request from the API.

- **Control** The controller will load the recipe with the id provided by the API, then create the recipe object baseed on the state object which was exported from the Model.js
  ````{
    await model.loadRecipe(id);
    const { recipe } = model.state;
  }```
  ````
- **View** The view will render the recipe object from the model.state to the DOM. View will contains _View.js_ as a parent class of the _RecipeView.js_. _*RecipeView.js*_ will generate the DOM string by using the `_generateMarkup()`, and it will render to the DOM by `_render()` methods.

### Searching and Rendering Recipe to the Result Panel

![Search_and_Result](https://github.com/AnhLamTruong/Forkify-Application/blob/master/flow-chart/forkify-flowchart-part-1-search.jpg)

- **Model** The recipe was fetched from the Forkify APIv2 using async-await function.
  `state.search.query = query;`
  `const data = await AJAX('${API_URL}?search=${query}&key=${KEY}');`
  Data return from the API will be an array of object; therefore another state object should be created, and will be an array that contains the results.

```
{
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
}
```

`getSearchResultsPage()` function will return the array of 10 elements of the search results base one the page passing in (ex: page 2 will contain elements 10-19)

- **View** The controller will call a method `addHandlerSearch(handler)` in _searchView.js_ than handling the event of 'submit'. Users after hitting the submit button, it will run the function `controlsearchResult` that the controller passing for the sake of the _MVC_ (Controller will never run funtion that access to the UI - like `addEventListener`) design pattern.

- **Control** The `controlsearchResult` will get a `query` from the by calling the _searchView.js_ method. Then it will pass that `query` to _model.js_ by `await model.loadSearchResults(query);`. After get the array of results from _model.js_. Controller will render the results by calling
  `resultsView.render(model.getSearchResultsPage());` which will render the results to the result panel.

### Pagination Funtion

![Pagination](https://github.com/AnhLamTruong/Forkify-Application/blob/master/flow-chart/forkify-flowchart-part-1-pagination.png)

- **Model** `getSearchResultsPage()` function will return the array of 10 elements of the search results base one the page passing in (ex: page 2 will contain elements 10-19)

- **View** There will be 4 cases of pagination (1st page, last page, in the middle, others) to use to create a `markup`. When the user hit the button, depended on situations, the `data-goto` atributes will be updated. then it will call the `controlPagination()` function which will re-render the _resultView_, and the _paginationView_(btn)

- **Control** After the call to seach is done by user, the UI is automaticlly on 1st page. Therefore, I also need to Render he initial state fore the button inside of the `controlsearchResult` function by using `paginationView.render(model.state.search);`
