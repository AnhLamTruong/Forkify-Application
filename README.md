# Forkify Project

## Design Pattern

This project was implement in **MVC (Model-View-Control)** design pattern.

1. **Model** will contain the back-end functionality which is including AJAX cal APIs, handling recipe Objects, Uploading funtion, etc.

2. **View** will have many class annd methods which will be called by the **Controller** to render the DOM structure to the application view

3. **Controller** will call the functions inside **View** and **Model** to manipulate data from the API and render it from **View**

![Architecture](https://github.com/AnhLamTruong/Forkify-Application/blob/master/forkify-architecture-recipe-loading.png)

## Flow Charts and Functions

### Selecting and Rendering Recipe to the UI

![Render_And_Select](https://github.com/AnhLamTruong/Forkify-Application/blob/master/forkify-flowchart-part-1.png)

- **Model** The recipe was fetched from the Forkify APIv2 using async-await function.
  `const data = await AJAX(`${API_URL}/${id}?key=${KEY}`);`
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
