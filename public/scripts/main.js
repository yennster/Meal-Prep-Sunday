'use strict';

// Initializes MealPrepSunday.
function MealPrepSunday() {
  // Shortcuts to DOM Elements.
  this.userName = document.getElementById('user-name');
  this.userPic = document.getElementById('user-pic');
  this.signInButton = document.getElementById('sign-in');
  this.signOutButton = document.getElementById('sign-out');
  this.signInSnackbar = document.getElementById('must-signin-snackbar');

  this.inventoryForm = document.getElementById('inventory-form');
  this.inventoryList = document.getElementById('inventory-list');
  this.ingredientInput = document.getElementById('ingredient');
  this.ingredientAmount = document.getElementById('ingredient_amount');
  this.addIngredient = document.getElementById('add-ingredient');

  this.groceryForm = document.getElementById('grocery-form');
  this.groceryList = document.getElementById('grocery-list');
  this.itemInput = document.getElementById('item');
  this.itemAmount = document.getElementById('item_amount');
  this.addGroceryItem = document.getElementById('add-grocery-item');

  this.recipeForm = document.getElementById('recipe-form');
  this.recipeList = document.getElementById('recipe-list');
  this.recipeName = document.getElementById('recipe_name');
  this.recipeInput = document.getElementById('recipe');
  this.recipeIngredient = document.getElementById('recipe_ingredient');
  this.recipeIngredientAmt = document.getElementById('recipe_ingredient_amount');
  this.addRecipe = document.getElementById('add-recipe');

  var buttonTogglingHandler = this.toggleButton.bind(this);
  this.ingredientInput.addEventListener('keyup', buttonTogglingHandler);
  this.ingredientInput.addEventListener('change', buttonTogglingHandler);
  this.ingredientAmount.addEventListener('keyup', buttonTogglingHandler);
  this.ingredientAmount.addEventListener('change', buttonTogglingHandler);
  this.recipeInput.addEventListener('keyup', buttonTogglingHandler);
  this.recipeInput.addEventListener('change', buttonTogglingHandler);
  this.itemInput.addEventListener('keyup', buttonTogglingHandler);
  this.itemInput.addEventListener('change', buttonTogglingHandler);

  this.inventoryForm.addEventListener('submit', this.saveIngredient.bind(this));
  this.recipeForm.addEventListener('submit', this.saveRecipe.bind(this));
  this.groceryForm.addEventListener('submit', this.saveItem.bind(this));

  this.signOutButton.addEventListener('click', this.signOut.bind(this));
  this.signInButton.addEventListener('click', this.signIn.bind(this));

  this.initFirebase();
}

// Sets up shortcuts to Firebase features and initiate firebase auth.
MealPrepSunday.prototype.initFirebase = function() {
  // Shortcuts to Firebase SDK features.
  // Initialize Firebase
  var config = {
    apiKey: "AIzaSyBjvLrWLCqOv6nlU6I_Ug8TxyuiaatIXjk",
    authDomain: "ee461l-mealprepsunday.firebaseapp.com",
    databaseURL: "https://ee461l-mealprepsunday.firebaseio.com",
    projectId: "ee461l-mealprepsunday",
    storageBucket: "ee461l-mealprepsunday.appspot.com",
    messagingSenderId: "28260377775"
  };
  firebase.initializeApp(config);
  this.auth = firebase.auth();
  this.database = firebase.database();
  this.storage = firebase.storage();
  // Initiates Firebase auth and listen to auth state changes.
  this.auth.onAuthStateChanged(this.onAuthStateChanged.bind(this));
};

MealPrepSunday.prototype.signIn = function() {
  // Sign in Firebase using popup auth and Google as the identity provider.
  var provider = new firebase.auth.GoogleAuthProvider();
  this.auth.signInWithRedirect(provider);
};

MealPrepSunday.prototype.signOut = function() {
  // Sign out of Firebase.
  this.auth.signOut();
  window.location.reload();
};

// Triggers when the auth state change for instance when the user signs-in or signs-out.
MealPrepSunday.prototype.onAuthStateChanged = function(user) {
  if (user) { // User is signed in!
    var userName = user.displayName;
    var profilePicUrl = user.photoURL;

    this.userPic.style.backgroundImage = 'url(' + (profilePicUrl || '/images/profile_placeholder.png') + ')';
    this.userName.textContent = userName;

    // Show user's profile and sign-out button.
    this.userName.removeAttribute('hidden');
    this.userPic.removeAttribute('hidden');
    this.signOutButton.removeAttribute('hidden');

    this.loadInventory();
    this.loadRecipes();
    this.loadGroceryList();

    $(document).on('click', '.inventory-edit', this.editIngredient.bind(this));
    $(document).on('click', '.inventory-remove', this.removeIngredient.bind(this));

    $(document).on('click', '.grocery-edit', this.editItem.bind(this));
    $(document).on('click', '.grocery-remove', this.removeItem.bind(this));

    $('#print-grocery-list').on('click',function(){
      var groceryTable = document.getElementById("grocery-table");
      var newWin = window.open("");
      newWin.document.write("<html><head><title>Meal Prep Sunday - Grocery List</title>")
      newWin.document.write("<link rel='stylesheet' media='all' href='//cdnjs.cloudflare.com/ajax/libs/skeleton/2.0.4/skeleton.min.css'>");
      newWin.document.write("<link rel='stylesheet' media='all' href='//fonts.googleapis.com/css?family=Lobster|Roboto'></head>");
      var today = new Date().toLocaleDateString("en-US");
      newWin.document.write("<body><h2>Meal Prep Sunday</h2><h5>Grocery List (" + today + ")</h5><table class='u-full-width'>");
      newWin.document.write(groceryTable.innerHTML);
      newWin.document.write("</table><style> h2{font-family: 'Lobster';} th:nth-child(3){display:none;} td:nth-child(3){display:none;}" +
                            "th:nth-child(4){display:none;} td:nth-child(4){display:none;}</style></body></html>");
      newWin.document.close();
      newWin.focus();
      newWin.document.body.onload = function() {
        newWin.print();
        newWin.close();
      };
    });

    // Hide sign-in button.
    this.signInButton.setAttribute('hidden', 'true');
  } else { // User is signed out!
    // Hide user's profile and sign-out button.
    this.userName.setAttribute('hidden', 'true');
    this.userPic.setAttribute('hidden', 'true');
    this.signOutButton.setAttribute('hidden', 'true');

    // Show sign-in button.
    this.signInButton.removeAttribute('hidden');
  }
};

// Returns true if user is signed-in. Otherwise false and displays a message.
MealPrepSunday.prototype.checkSignedInWithMessage = function() {
  // Return true if the user is signed in Firebase
  if (this.auth.currentUser) {
    return true;
  }

  // Display a message to the user using a Toast.
  var data = {
    message: 'You must sign-in first',
    timeout: 2000
  };
  this.signInSnackbar.MaterialSnackbar.showSnackbar(data);
  return false;
};

// Saves a new message on the Firebase DB.
MealPrepSunday.prototype.saveIngredient = function(e) {
  e.preventDefault();

  // Check that the user entered a message and is signed in.
  if (this.ingredientInput.value && this.checkSignedInWithMessage()) {
    var currentUser = this.auth.currentUser.uid;
    this.inventoryRef = this.database.ref(currentUser + "/inventory");
    this.inventoryRef.push({
      ingredient: this.ingredientInput.value,
      amount: this.ingredientAmount.value,
    }).then(function() {
      // Clear message text field and SEND button state.
      MealPrepSunday.resetMaterialTextfield(this.ingredientInput);
      MealPrepSunday.resetMaterialTextfield(this.ingredientAmount);
      this.toggleButton();
    }.bind(this)).catch(function(error) {
      console.error('Error writing new message to Firebase Database', error);
    });
  }
};

MealPrepSunday.prototype.loadInventory = function() {
  var currentUser = this.auth.currentUser.uid;
  this.inventoryRef = this.database.ref(currentUser + "/inventory");
  this.inventoryRef.off();
  var numIngredients = 0;
  var setIngredient = function(data) {
    var val = data.val();
    this.displayInventory(data.key, val.ingredient, val.amount, numIngredients);
    numIngredients++;
  }.bind(this);
  this.inventoryRef.on('child_added', setIngredient);
  //this.inventoryRef.on('child_changed', setIngredient);
};

MealPrepSunday.prototype.editIngredient = function(e) {
  e.preventDefault();
  var target = e.target.parentNode;
  target.style.display = "none";
  target.nextSibling.style.display = "inline";
  $('.inventory-edit').prop('disabled', true);
  var num = target.id.substring(4);
  var key = target.parentNode.parentNode.id;
  var ingredient = document.getElementById("name" + num);
  var amount = document.getElementById("amount" + num);
  var name = ingredient.textContent;
  var current_amt = amount.textContent;
  ingredient.innerHTML = "<input class='mdl-textfield__input' type='text' value='" + name + "' id='new_name" + num + "'>"
  amount.innerHTML = "<input class='mdl-textfield__input' type='number' value='" + current_amt + "' id='new_amount" + num + "'>"
  var currentUser = this.auth.currentUser.uid;
  var inventoryRef = this.database.ref(currentUser + "/inventory");
  $("#save" + num).on("click", function(e) {
    e.preventDefault();
    var new_ingred = document.getElementById("new_name" + num).value;
    var new_amt = document.getElementById("new_amount" + num).value;
    inventoryRef.child(key).set({
      ingredient: new_ingred,
      amount: new_amt,
    }).then(function() {
      document.getElementById("name" + num).innerHTML = new_ingred;
      document.getElementById("amount" + num).innerHTML = new_amt;
      target.style.display = "inline";
      target.nextSibling.style.display = "none";
      $('.inventory-edit').prop('disabled', false);
    }.bind(this)).catch(function(error) {
      console.error('Error writing new message to Firebase Database', error);
    });
  });
};

MealPrepSunday.prototype.removeIngredient = function(e) {
  var target = e.target.parentNode;
  var num = target.id.substring(6);
  var key = target.parentNode.parentNode.id;
  document.getElementById("name" + num + "").parentNode.outerHTML="";
  var currentUser = this.auth.currentUser.uid;
  this.inventoryRef = this.database.ref(currentUser + "/inventory");
  this.inventoryRef.child(key).remove();
};

MealPrepSunday.prototype.displayInventory = function(key, ingredient, amount, num) {
  var container = document.createElement('tr');
  container.innerHTML = MealPrepSunday.INGREDIENT_TEMPLATE;
  container.setAttribute('id', key);
  var td = container.firstChild;
  td.setAttribute('id', "name" + num);
  td.textContent = ingredient;
  var td2 = container.firstChild.nextSibling;
  td2.setAttribute('id', "amount" + num);
  td2.textContent = amount;
  var td3 = container.firstChild.nextSibling.nextSibling.firstChild;
  td3.setAttribute('id', "edit" + num);
  td3 = container.firstChild.nextSibling.nextSibling.firstChild.nextSibling;
  td3.setAttribute('id', "save" + num);
  var td4 = container.firstChild.nextSibling.nextSibling.nextSibling.firstChild;
  td4.setAttribute('id', "remove" + num);
  this.inventoryList.appendChild(container);
};

MealPrepSunday.prototype.saveRecipe = function(e) {
  e.preventDefault();

  if (this.recipeInput.value && this.checkSignedInWithMessage()) {
    var currentUser = this.auth.currentUser.uid;
    this.recipeRef = this.database.ref(currentUser + "/recipes");
    this.recipeRef.push({
      name: this.recipeName.value,
      recipe: this.recipeInput.value,
      ingredient: this.recipeIngredient.value,
      amount: this.recipeIngredientAmt.value,
    }).then(function() {
      MealPrepSunday.resetMaterialTextfield(this.recipeName);
      MealPrepSunday.resetMaterialTextfield(this.recipeInput);
      MealPrepSunday.resetMaterialTextfield(this.recipeIngredient);
      MealPrepSunday.resetMaterialTextfield(this.recipeIngredientAmt);
      this.toggleButton();
    }.bind(this)).catch(function(error) {
      console.error('Error writing new message to Firebase Database', error);
    });
  }
};

MealPrepSunday.prototype.loadRecipes = function() {
  var currentUser = this.auth.currentUser.uid;
  this.recipeRef = this.database.ref(currentUser + "/recipes");
  this.recipeRef.off();
  var numRecipes = 0;
  var setRecipe = function(data) {
    var val = data.val();
    this.displayRecipes(data.key, val.name, val.recipe, val.ingredient, val.amount, numRecipes);
    numRecipes++;
  }.bind(this);
  this.recipeRef.on('child_added', setRecipe);
};

MealPrepSunday.prototype.displayRecipes = function(key, name, recipe, ingredient, amount, num) {
  var container = document.createElement('div');
  container.innerHTML = MealPrepSunday.RECIPE_TEMPLATE;
  container.setAttribute('id', key);
  container.className += "mdl-cell mdl-cell--4-col mdl-card mdl-shadow--6dp";
  var title = container.firstChild.firstChild;
  title.setAttribute('id', "recipe_name" + num);
  title.textContent = name;
  var rcp = container.firstChild.nextSibling;
  rcp.setAttribute('id', "recipe_data" + num);
  rcp.innerHTML = "<pre>" + recipe + "</pre>" + "<p></p>Ingredient: " + ingredient + ", Amount: " + amount;
  this.recipeList.appendChild(container);
};

MealPrepSunday.prototype.saveItem = function(e) {
  e.preventDefault();

  if (this.itemInput.value && this.checkSignedInWithMessage()) {
    var currentUser = this.auth.currentUser.uid;
    this.groceryRef = this.database.ref(currentUser + "/grocery-list");
    this.groceryRef.push({
      item: this.itemInput.value,
      amount: this.itemAmount.value,
    }).then(function() {
      MealPrepSunday.resetMaterialTextfield(this.itemInput);
      MealPrepSunday.resetMaterialTextfield(this.itemAmount);
      this.toggleButton();
    }.bind(this)).catch(function(error) {
      console.error('Error writing new message to Firebase Database', error);
    });
  }
};

MealPrepSunday.prototype.loadGroceryList = function() {
  var currentUser = this.auth.currentUser.uid;
  this.groceryRef = this.database.ref(currentUser + "/grocery-list");
  this.groceryRef.off();
  var numItems = 0;
  var setItem = function(data) {
    var val = data.val();
    this.displayGroceryList(data.key, val.item, val.amount, numItems);
    numItems++;
  }.bind(this);
  this.groceryRef.on('child_added', setItem);
};

MealPrepSunday.prototype.editItem = function(e) {
  e.preventDefault();
  var target = e.target.parentNode;
  target.style.display = "none";
  target.nextSibling.style.display = "inline";
  $('.grocery-edit').prop('disabled', true);
  var num = target.id.substring(9);
  var key = target.parentNode.parentNode.id;
  var item = document.getElementById("item_name" + num);
  var amount = document.getElementById("item_amount" + num);
  var name = item.textContent;
  var current_amt = amount.textContent;
  item.innerHTML = "<input class='mdl-textfield__input' type='text' value='" + name + "' id='new_item_name" + num + "'>"
  amount.innerHTML = "<input class='mdl-textfield__input' type='number' value='" + current_amt + "' id='new_item_amount" + num + "'>"
  var currentUser = this.auth.currentUser.uid;
  var groceryRef = this.database.ref(currentUser + "/grocery-list");
  $("#item_save" + num).on('click', function(e) {
    e.preventDefault();
    var new_item = document.getElementById("new_item_name" + num).value;
    var new_item_amt = document.getElementById("new_item_amount" + num).value;
    groceryRef.child(key).set({
      item: new_item,
      amount: new_item_amt,
    }).then(function() {
      document.getElementById("item_name" + num).innerHTML = new_item;
      document.getElementById("item_amount" + num).innerHTML = new_item_amt;
      target.style.display = "inline";
      target.nextSibling.style.display = "none";
      $('.grocery-edit').prop('disabled', false);
    }.bind(this)).catch(function(error) {
      console.error('Error writing new message to Firebase Database', error);
    });
  });
};

MealPrepSunday.prototype.removeItem = function(e) {
  var target = e.target.parentNode;
  var num = target.id;
  var key = target.parentNode.parentNode.id;
  document.getElementById("item_name" + num + "").parentNode.outerHTML="";
  var currentUser = this.auth.currentUser.uid;
  this.groceryRef = this.database.ref(currentUser + "/grocery-list");
  this.groceryRef.child(key).remove();
};

MealPrepSunday.prototype.displayGroceryList = function(key, item, amount, num) {
  var container = document.createElement('tr');
  container.innerHTML = MealPrepSunday.GROCERY_LIST_TEMPLATE;
  container.setAttribute('id', key);
  var td = container.firstChild;
  td.setAttribute('id', "item_name" + num);
  td.textContent = item;
  var td2 = container.firstChild.nextSibling;
  td2.setAttribute('id', "item_amount" + num);
  td2.textContent = amount;
  var td3 = container.firstChild.nextSibling.nextSibling.firstChild;
  td3.setAttribute('id', "item_edit" + num);
  td3 = container.firstChild.nextSibling.nextSibling.firstChild.nextSibling;
  td3.setAttribute('id', "item_save" + num);
  var td4 = container.firstChild.nextSibling.nextSibling.nextSibling.firstChild;
  td4.setAttribute('id', "item_remove" + num);
  this.groceryList.appendChild(container);
};

MealPrepSunday.prototype.toggleButton = function() {
  if (this.ingredientInput.value || this.recipeInput.value || this.itemInput.value) {
    this.addIngredient.removeAttribute('disabled');
    this.addRecipe.removeAttribute('disabled');
    this.addGroceryItem.removeAttribute('disabled');
  } else {
    this.addIngredient.setAttribute('disabled', 'true');
    this.addRecipe.setAttribute('disabled', 'true');
    this.addGroceryItem.setAttribute('disabled', 'true');
  }
};

// Resets the given MaterialTextField.
MealPrepSunday.resetMaterialTextfield = function(element) {
  element.value = '';
  element.parentNode.MaterialTextfield.boundUpdateClassesHandler();
};

MealPrepSunday.INGREDIENT_TEMPLATE =
    '<tr>' +
      '<td class="mdl-data-table__cell--non-numeric"></td>' +
      '<td class="mdl-data-table__cell--numeric"></td>' +
      '<td class="mdl-data-table__cell">' +
        '<button class="inventory-edit mdl-button mdl-js-button mdl-button--fab mdl-button--mini-fab mdl-button--accent"><i class="material-icons">edit</i></button>' +
        '<button class="inventory-submit mdl-button mdl-js-button mdl-button--fab mdl-button--mini-fab mdl-button--accent" type="submit" style="display:none;"><i class="material-icons">save</i></button>' +
      '</td>' +
      '<td class="mdl-data-table__cell">' +
        '<button class="inventory-remove mdl-button mdl-js-button mdl-button--fab mdl-button--mini-fab"><i class="material-icons">remove</i></button>' +
      '</td>' +
    '</tr>';

MealPrepSunday.RECIPE_TEMPLATE =
    '<div class="mdl-card__title mdl-color--accent mdl-color-text--white">' +
      '<h2 class="mdl-card__title-text"></h2>' +
    '</div>' +
    '<div class="recipe-data mdl-card__supporting-text"></div>';

MealPrepSunday.GROCERY_LIST_TEMPLATE =
    '<tr>' +
      '<td class="mdl-data-table__cell--non-numeric"></td>' +
      '<td class="mdl-data-table__cell--numeric"></td>' +
      '<td class="mdl-data-table__cell">' +
        '<button class="grocery-edit mdl-button mdl-js-button mdl-button--fab mdl-button--mini-fab mdl-button--accent"><i class="material-icons">edit</i></button>' +
        '<button class="grocery-submit mdl-button mdl-js-button mdl-button--fab mdl-button--mini-fab mdl-button--accent" type="submit" style="display:none;"><i class="material-icons">save</i></button>' +
      '</td>' +
      '<td class="mdl-data-table__cell">' +
        '<button class="grocery-remove mdl-button mdl-js-button mdl-button--fab mdl-button--mini-fab"><i class="material-icons">remove</i></button>' +
      '</td>' +
    '</tr>';

/**
'<td class="ingred mdl-data-table__cell--non-nurmeric">' +
  '<button class="mdl-button mdl-js-button mdl-button--fab mdl-button--mini-fab">' +
  '<i class="material-icons">remove</i></button>' +
'</td>' +
**/

window.onload = function() {
  window.mealPrepSunday = new MealPrepSunday();
};
