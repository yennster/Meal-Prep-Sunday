'use strict';

// Initializes MealPrepSunday.
function MealPrepSunday() {
  // Shortcuts to DOM Elements.
  this.userName = document.getElementById('user-name');
  this.userPic = document.getElementById('user-pic');
  this.signInButton = document.getElementById('sign-in');
  this.signOutButton = document.getElementById('sign-out');
  this.signInSnackbar = document.getElementById('must-signin-snackbar');

  // ====================== Public Recipes ======================
  this.publicRecipeList = document.getElementById('public-recipe-list');

  // ====================== Inventory ======================
  /**this.inventoryForm = document.getElementById('inventory-form');
  this.inventoryList = document.getElementById('inventory-list');
  this.ingredientInput = document.getElementById('ingredient');
  this.ingredientAmount = document.getElementById('ingredient_amount');
  this.ingredientUnits = document.getElementById('ingredient_units');
  this.addIngredient = document.getElementById('add-ingredient'); **/

  // ====================== Grocery List ======================
  this.groceryForm = document.getElementById('grocery-form');
  this.groceryList = document.getElementById('grocery-list');
  this.itemInput = document.getElementById('item');
  this.itemAmount = document.getElementById('item_amount');
  this.itemUnits = document.getElementById('item_units');
  this.addGroceryItem = document.getElementById('add-grocery-item');

  // ====================== Recipes ======================
  this.recipeForm = document.getElementById('recipe-form');
  this.recipeList = document.getElementById('recipe-list');
  this.recipeName = document.getElementById('recipe_name');
  this.recipeImage = document.getElementById('recipe_image');
  this.recipeInput = document.getElementById('recipe');
  this.recipeIngredient = document.getElementById('recipe_ingredient0');
  this.recipeIngredientAmt = document.getElementById('recipe_ingredient_amount0');
  this.recipeIngredientUnits = document.getElementById('recipe_ingredient_units0');
  this.createRecipeIngredients = document.getElementById('recipe-ingredients');
  this.createRecipeIngredientsNumAdded = 0;
  this.addRecipe = document.getElementById('add-recipe');
  this.recipePublic = document.getElementById('recipe-public');
  this.importRecipe = document.getElementById('import-recipe');
  this.importLink = document.getElementById('recipe_link');
  this.importForm = document.getElementById('import-form');
  this.plannerList = document.getElementById('planner-list');
  this.plannerSnackbar = document.getElementById('added-to-planner-snackbar');
  this.grocerySnackbar = document.getElementById('added-to-planner-snackbar');

  // ====================== Button/Input Handlers ======================
  var buttonTogglingHandler = this.toggleButton.bind(this);
  /**this.ingredientInput.addEventListener('keyup', buttonTogglingHandler);
  this.ingredientInput.addEventListener('change', buttonTogglingHandler);
  this.ingredientAmount.addEventListener('keyup', buttonTogglingHandler);
  this.ingredientAmount.addEventListener('change', buttonTogglingHandler);**/
  this.recipeInput.addEventListener('keyup', buttonTogglingHandler);
  this.recipeInput.addEventListener('change', buttonTogglingHandler);
  this.itemInput.addEventListener('keyup', buttonTogglingHandler);
  this.itemInput.addEventListener('change', buttonTogglingHandler);
  this.importLink.addEventListener('keyup', buttonTogglingHandler);
  this.importLink.addEventListener('change', buttonTogglingHandler);

  // ====================== Save Button Handlers ======================
  //this.inventoryForm.addEventListener('submit', this.saveIngredient.bind(this));
  this.recipeForm.addEventListener('submit', this.saveRecipe.bind(this));
  this.groceryForm.addEventListener('submit', this.saveItem.bind(this));
  this.importForm.addEventListener('submit', this.saveImport.bind(this));

  // ====================== Sign-out/Sign-in Handlers ======================
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

    // ====================== Load User Data ======================
    //this.loadInventory();
    this.loadPublicRecipes();
    this.loadRecipes();
    this.loadPlanner();
    this.loadGroceryList();

    // ====================== Edit/Remove Handlers ======================
    $(document).on('click', '.inventory-edit', this.editIngredient.bind(this));
    $(document).on('click', '.inventory-remove', this.removeIngredient.bind(this));

    $(document).on('click', '.grocery-edit', this.editItem.bind(this));
    $(document).on('click', '.grocery-remove', this.removeItem.bind(this));

    $(document).on('click', '.recipe_add_ingredient', this.recipeAddIngredient.bind(this));
    $(document).on('click', '.recipe-edit', this.editRecipe.bind(this));
    $(document).on('click', '.recipe-remove', this.removeRecipe.bind(this));
    $(document).on('click', '.recipe-add-to-planner', this.recipeAddToPlanner.bind(this));
    $(document).on('click', '.planner-remove', this.recipeRemoveFromPlanner.bind(this));
    $(document).on('click', '.recipe-add-to-grocery-list', this.recipeAddToGrocery.bind(this));

    $(document).on('click', '.public-recipe-like', this.likePublicRecipe.bind(this));
    $(document).on('click', '.public-recipe-unlike', this.unlikePublicRecipe.bind(this));
    $(document).on('click', '.public-recipe-add-to-recipes', this.publicRecipeAddToRecipes.bind(this));

    // Print grocery list function (on button click)
    $('#print-grocery-list').on('click',function(){
      var groceryTable = document.getElementById("grocery-table");
      var newWin = window.open("");
      newWin.document.write("<html><head><title>Meal Prep Sunday - Grocery List</title>")
      newWin.document.write("<link rel='stylesheet' href='//cdnjs.cloudflare.com/ajax/libs/skeleton/2.0.4/skeleton.min.css'>");
      newWin.document.write("<link rel='stylesheet' href='//fonts.googleapis.com/css?family=Lobster|Roboto'></head>");
      var today = new Date().toLocaleDateString("en-US");
      newWin.document.write("<body><h2>Meal Prep Sunday</h2><h5>Grocery List (" + today + ")</h5><table class='u-full-width'>");
      newWin.document.write(groceryTable.innerHTML);
      newWin.document.write("</table><style>h2{font-family: 'Lobster';} th:nth-child(4){display:none;} td:nth-child(4){display:none;}</style></body></html>");
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
    this.loadPublicRecipes();
    $(document).on('click', '.public-recipe-like', this.checkSignedInWithMessage.bind(this));
    $(document).on('click', '.create-recipe', this.checkSignedInWithMessage.bind(this));
    $(document).on('click', '.add-grocery', this.checkSignedInWithMessage.bind(this));
    //$(document).on('click', '.add-ingred', this.checkSignedInWithMessage.bind(this));
    $(document).on('click', '.import-recipe', this.checkSignedInWithMessage.bind(this));
    $(document).on('click', '.recipe-add-to-planner', this.checkSignedInWithMessage.bind(this));
    $(document).on('click', '.recipe-add-to-grocery-list', this.checkSignedInWithMessage.bind(this));
    $(document).on('click', '#print-grocery-list', this.checkSignedInWithMessage.bind(this));
    $(document).on('click', '.public-recipe-add-to-recipes', this.checkSignedInWithMessage.bind(this));
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
  if (this.auth.currentUser) {
    return true;
  }
  var data = {
    message: 'You must sign-in first',
    timeout: 2000
  };
  this.signInSnackbar.MaterialSnackbar.showSnackbar(data);
  return false;
};

/*
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~ Inventory ~~~~~~~~~~~~~~~~~~~~~~~~~~~
 */
MealPrepSunday.prototype.saveIngredient = function(e) {
  e.preventDefault();

  if (this.ingredientInput.value && this.checkSignedInWithMessage()) {
    var currentUser = this.auth.currentUser.uid;
    this.inventoryRef = this.database.ref("/users/" + currentUser + "/inventory");
    this.inventoryRef.push({
      ingredient: this.ingredientInput.value,
      amount: this.ingredientAmount.value,
      units: this.ingredientUnits.value
    }).then(function() {
      MealPrepSunday.resetMaterialTextfield(this.ingredientInput);
      MealPrepSunday.resetMaterialTextfield(this.ingredientAmount);
      MealPrepSunday.resetMaterialTextfield(this.ingredientUnits);
      this.toggleButton();
    }.bind(this)).catch(function(error) {
      console.error('Error writing new message to Firebase Database', error);
    });
  }
};

MealPrepSunday.prototype.loadInventory = function() {
  var currentUser = this.auth.currentUser.uid;
  this.inventoryRef = this.database.ref("/users/" + currentUser + "/inventory");
  this.inventoryRef.off();
  var numIngredients = 0;
  var setIngredient = function(data) {
    var val = data.val();
    this.displayInventory(data.key, val.ingredient, val.amount, val.units, numIngredients);
    numIngredients++;
  }.bind(this);
  this.inventoryRef.on('child_added', setIngredient);
  //this.inventoryRef.on('child_changed', setIngredient);
};

MealPrepSunday.prototype.editIngredient = function(e) {
  e.preventDefault();
  var target = e.target.parentNode;
  if ((!$(target).hasClass("inventory-edit"))) return;
  target.style.display = "none";
  target.nextSibling.style.display = "inline";
  $('.inventory-edit').prop('disabled', true);
  $('.inventory-remove').prop('disabled', true);
  var num = target.id.substring(4);
  var key = target.parentNode.parentNode.id;
  var ingredient = document.getElementById("name" + num);
  var amount = document.getElementById("amount" + num);
  var name = ingredient.textContent;
  var current_amt = amount.textContent;
  var units = document.getElementById("units" + num);
  var current_units = units.textContent;
  ingredient.innerHTML = "<input class='mdl-textfield__input' type='text' value='"
                          + name + "' id='new_name" + num + "'>";
  amount.innerHTML = "<input class='mdl-textfield__input' step='any' type='number' value='"
                          + current_amt + "' id='new_amount" + num + "'>";
  units.innerHTML = '<div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label getmdl-select getmdl-select__fix-height getmdl-select__fullwidth" style="z-index:900;">' +
            '<input class="mdl-textfield__input" type="text" id="new_units' + num + '" value="' + current_units + '" readonly>' +
            '<label for="new_units' + num + '">' +
                '<i class="mdl-icon-toggle__label material-icons">keyboard_arrow_down</i>' +
            '</label>' +
            '<label for="new_units' + num + '" class="mdl-textfield__label">Units</label>' +
            '<ul for="new_units' + num + '" class="mdl-menu mdl-menu--bottom-left mdl-js-menu flexdropdown">' +
                '<li class="mdl-menu__item" data-val="units">units</li>' +
                '<li class="mdl-menu__item" data-val="cups">cups</li>' +
                '<li class="mdl-menu__item" data-val="tsp">tsp</li>' +
                '<li class="mdl-menu__item" data-val="tbsp">tbsp</li>' +
                '<li class="mdl-menu__item" data-val="ounces">ounces</li>' +
                '<li class="mdl-menu__item" data-val="pints">pints</li>' +
                '<li class="mdl-menu__item" data-val="gallons">gallons</li>' +
                '<li class="mdl-menu__item" data-val="quarts">quarts</li>' +
                '<li class="mdl-menu__item" data-val="liters">liters</li>' +
                '<li class="mdl-menu__item" data-val="lbs">lbs</li>' +
                '<li class="mdl-menu__item" data-val="grams">grams</li>' +
            '</ul></div>';
  componentHandler.upgradeDom();
  getmdlSelect.init(".getmdl-select");
  var currentUser = this.auth.currentUser.uid;
  var inventoryRef = this.database.ref("/users/" + currentUser + "/inventory");
  $("#save" + num).on("click", function(e) {
    e.preventDefault();
    var new_ingred = document.getElementById("new_name" + num).value;
    var new_amt = document.getElementById("new_amount" + num).value;
    var new_unt = document.getElementById("new_units" + num).value;
    inventoryRef.child(key).set({
      ingredient: new_ingred,
      amount: new_amt,
      units: new_unt
    }).then(function() {
      document.getElementById("name" + num).innerHTML = new_ingred;
      document.getElementById("amount" + num).innerHTML = new_amt;
      document.getElementById("units" + num).innerHTML = new_unt;
      target.style.display = "inline";
      target.nextSibling.style.display = "none";
      $('.inventory-edit').prop('disabled', false);
      $('.inventory-remove').prop('disabled', false);
    }.bind(this)).catch(function(error) {
      console.error('Error writing new message to Firebase Database', error);
    });
  });
};

MealPrepSunday.prototype.removeIngredient = function(e) {
  var target = e.target.parentNode;
  if ((!$(target).hasClass("inventory-remove"))) return;
  var num = target.id.substring(6);
  var key = target.parentNode.parentNode.id;
  document.getElementById("name" + num + "").parentNode.outerHTML="";
  var currentUser = this.auth.currentUser.uid;
  this.inventoryRef = this.database.ref("/users/" + currentUser + "/inventory");
  this.inventoryRef.child(key).remove();
};

MealPrepSunday.prototype.displayInventory = function(key, ingredient, amount, units, num) {
  var container = document.createElement('tr');
  container.innerHTML = MealPrepSunday.INGREDIENT_TEMPLATE;
  container.setAttribute('id', key);
  var td = container.firstChild;
  td.setAttribute('id', "name" + num);
  td.textContent = ingredient;
  var td2 = container.firstChild.nextSibling;
  td2.setAttribute('id', "amount" + num);
  td2.textContent = amount;
  var td3a = container.firstChild.nextSibling.nextSibling;
  td3a.setAttribute('id', "units" + num);
  td3a.textContent = units;
  var td3 = container.firstChild.nextSibling.nextSibling.nextSibling.firstChild;
  td3.setAttribute('id', "edit" + num);
  td3 = container.firstChild.nextSibling.nextSibling.nextSibling.firstChild.nextSibling;
  td3.setAttribute('id', "save" + num);
  td3 = container.firstChild.nextSibling.nextSibling.nextSibling.firstChild.nextSibling.nextSibling;
  td3.setAttribute('id', "remove" + num);
  this.inventoryList.appendChild(container);
};

MealPrepSunday.INGREDIENT_TEMPLATE =
    '<tr>' +
      '<td class="mdl-data-table__cell--non-numeric"></td>' +
      '<td class="mdl-data-table__cell--numeric"></td>' +
      '<td class="mdl-data-table__cell--non-numeric"></td>' +
      '<td class="zindex mdl-data-table__cell">' +
        '<button class="inventory-edit mdl-button mdl-js-button mdl-button--icon mdl-button--accent"><i class="material-icons">edit</i></button>' +
        '<button class="inventory-submit mdl-button mdl-js-button mdl-button--icon mdl-button--accent" type="submit" style="display:none;"><i class="material-icons">save</i></button>' +
        '<button class="inventory-remove mdl-button mdl-js-button mdl-button--icon mdl-button--accent"><i class="material-icons">remove</i></button>' +
      '</td>' +
    '</tr>';

/*
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~ Recipes ~~~~~~~~~~~~~~~~~~~~~~~~~~~
 */
MealPrepSunday.prototype.saveRecipe = function(e) {
  e.preventDefault();

  if (this.recipeInput.value && this.checkSignedInWithMessage()) {
    var currentUser = this.auth.currentUser.uid;
    this.recipeRef = this.database.ref("/users/" + currentUser + "/recipes");
    var num_ingreds = document.getElementById("recipe-ingredients").childElementCount;
    var ingredUpdates = {};
    for (var i = 0; i < num_ingreds; i++) {
      var newIngredRef = this.recipeRef.push();
      var newKey = newIngredRef.key;
      var recipeData = {
        ingredient: document.getElementById("recipe_ingredient" + i).value,
        amount: document.getElementById("recipe_ingredient_amount" + i).value,
        units: document.getElementById("recipe_ingredient_units" + i).value
      }
      ingredUpdates[newKey] = recipeData;
    }
    var recipeKey = this.recipeRef.push().key;
    var updates = {};
    var recipeData = {
      name: this.recipeName.value,
      recipe: this.recipeInput.value,
      ingredients: ingredUpdates,
      public: $(this.recipePublic).is(":checked"),
      likes: 0,
      image: this.recipeImage.value
    }
    if ($(this.recipePublic).is(":checked")) {
      var time = 0 - (Date.now());
      var publicData = {
        recipe: recipeKey,
        user: currentUser,
        time: time
      }
      updates['/public-recipes/' + recipeKey] = publicData;
    }
    updates["/users/" + currentUser + "/recipes/" + recipeKey] = recipeData;
    for (var i = 0; i < num_ingreds; i++) {
      document.getElementById("recipe-ingredients" + i).outerHTML = "";
      this.createRecipeIngredientsNumAdded = 0;
    }
    this.database.ref().update(updates).then(function() {
      MealPrepSunday.resetMaterialTextfield(this.recipeName);
      MealPrepSunday.resetMaterialTextfield(this.recipeInput);
      this.createRecipeIngredientsNumAdded = 0;
      //console.log($(this.recipePublic).parent());
      $(this.recipePublic).parent().removeClass('is-checked');
      this.toggleButton();
    }.bind(this));
  }
};

MealPrepSunday.prototype.saveImport = function(e) {
  e.preventDefault();

  if (this.importLink.value && this.checkSignedInWithMessage()) {
    var currentUser = this.auth.currentUser.uid;
    var recipe_link = this.importLink.value;
    var recipe_id = recipe_link.substring(31);
    if (!recipe_link.includes("#")) {
      recipe_id = recipe_link.substring(30);
    }
    //console.log(recipe_id);
    var yummly_id = "004619c4";
    var yummly_key = "86b46ce6f6b2e672f933aba75ff2de10";
    var url = "https://api.yummly.com/v1/api/recipe/" + recipe_id + "?_app_id=" + yummly_id + "&_app_key=" + yummly_key;
    //console.log(url);
    var database = this.database;
    var blah = this;
    fetch(url).then(function(response) {
      return response.json();
    }).then(function(data) {
      //console.log(data);
      var img = data.images[0].hostedLargeUrl;
      var ingredients = data.ingredientLines;
      //console.log(ingredients);
      var recipe_name = data.name;
      var ingredUpdates = {};
      var recipeRef = database.ref("/users/" + currentUser + "/recipes");
      for (var i = 0; i < ingredients.length; i++) {
        var newKey = recipeRef.push().key;
        var amount = ingredients[i].substr(0, ingredients[i].indexOf(' '));
        if (ingredients[i].match(/\d+/g) == null && !amount.includes("¾") && !amount.includes("½") && !amount.includes("¼") && !amount.includes("⅓")){
          var amount = 0;
          var units = "units";
          var name = ingredients[i];
        } else {
          var units1 = ingredients[i].substr(ingredients[i].indexOf(' ') + 1);
          var units = ingredients[i].substr(amount.length + 1, units1.indexOf(' '));
          var name = ingredients[i].substr(units.length + amount.length + 1);
          if (units.includes("heaping")) {
            units = ingredients[i].substr(units.length + amount.length + 2);
          }
          if (units.match(/\d+/g)) {
            var old_units = amount + " " + units;
            amount = amount + " " + units;
            units1 = ingredients[i].substr(old_units.length + 1);
            units = units1.substring(0, units1.indexOf(' '));
            name = units1.substring(units1.indexOf(' '));
          }
          amount = amount.toString();
          if (amount.indexOf("-") != -1) {
            amount = amount.substr(amount.indexOf('-') + 1);
          }
          if (amount.indexOf("/") != -1) {
            var slashIndex = amount.indexOf("/");
            var total = amount.substring(0, slashIndex - 2);
            var frac = eval(amount.substr(slashIndex - 2));
            amount = +total + +frac;
          } else if (amount.includes("¾")) {
            var fracIndex = amount.indexOf("¾");
            var total = amount.substring(0, fracIndex);
            amount = eval(total + ".75");
          } else if (amount.includes("½")) {
            var fracIndex = amount.indexOf("½");
            var total = amount.substring(0, fracIndex);
            amount = eval(total + ".5");
          } else if (amount.includes("¼")) {
            var fracIndex = amount.indexOf("¼");
            var total = amount.substring(0, fracIndex);
            amount = eval(total + ".25");
          } else if (amount.includes("⅓")) {
            var fracIndex = amount.indexOf("⅓");
            var total = amount.substring(0, fracIndex);
            amount = eval(total + ".33");
          } else if (amount.match(/\d+/g) == null) {
            name = amount + " " + name;
            amount = 0;
          }
          if (units.includes('cup') || units.includes('Cup')) {
            units = "cups";
          } else if (units.includes('teaspoon') || units.includes('Teaspoon') || units.includes('tsp')) {
            units = "tsp";
          } else if (units.includes('tablespoon') || units.includes('Tablespoon') || units.includes('tbsp')) {
            units = "tbsp";
          } else if (units.includes('lb') || units.includes('lbs') || units.includes('pound') || units.includes('Pound')) {
            units = "lbs";
          } else if (units.includes('oz') || units.includes('ounce') || units.includes('Ounce')) {
            units = "ounces";
          } else if (units.includes('pt') || units.includes('pint') || units.includes('Pint')|| units.includes('pints')) {
            units = "pints";
          } else {
            name = units + " " + name;
            units = "units";
          }
        }
        if (name.indexOf("chopped") != -1) {
          name = name.replace("chopped",'');
        }
        if (name.indexOf("divided") != -1) {
          name = name.replace("divided",'');
        }
        if (name.indexOf("plus") != -1) {
          name = name.replace("plus",'');
        }
        if (name.indexOf("more") != -1) {
          name = name.replace("more",'');
        }
        if (name.indexOf("thinly") != -1) {
          name = name.replace("thinly",'');
        }
        if (name.indexOf("freshly") != -1) {
          name = name.replace("freshly",'');
        }
        if (name.indexOf("fresh") != -1) {
          name = name.replace("fresh",'');
        }
        if (name.indexOf("softened") != -1) {
          name = name.replace("softened",'');
        }
        if (name.indexOf("warm") != -1) {
          name = name.replace("warm",'');
        }
        if (name.indexOf("peeled") != -1) {
          name = name.replace("peeled",'');
        }
        if (name.indexOf("diced") != -1) {
          name = name.replace("diced",'');
        }
        if (name.indexOf("sliced") != -1) {
          name = name.replace("sliced",'');
        }
        if (name.indexOf("uncooked") != -1) {
          name = name.replace("uncooked",'');
        }
        if (name.indexOf("cooked") != -1) {
          name = name.replace("cooked",'');
        }
        if (name.indexOf("frozen") != -1) {
          name = name.replace("frozen",'');
        }
        if (name.indexOf("shredded") != -1) {
          name = name.replace("shredded",'');
        }
        if (name.indexOf("very") != -1) {
          name = name.replace("very",'');
        }
        if (name.indexOf("ripe") != -1) {
          name = name.replace("ripe",'');
        }
        if (name.indexOf("squeezed") != -1) {
          name = name.replace("squeezed",'');
        }
        if (name.indexOf("mashed") != -1) {
          name = name.replace("mashed",'');
        }
        if (name.indexOf("squeeze of") != -1) {
          name = name.replace("squeeze of",'');
        }
        if (name.indexOf("pinch of") != -1) {
          name = name.replace("pinch of",'');
        }
        if (name.indexOf("A ") != -1) {
          name = name.replace("A ",'');
        }/**
        if (name.indexOf("or") != -1) {
          var orRecipe = name.substring(name.indexOf("or"));
          name = name.replace(orRecipe,'');
        }
        if (name.indexOf("-") != -1) {
          var dashRecipe = name.substring(name.indexOf("-"));
          name = name.replace(dashRecipe,'');
        }**/
        if (name.indexOf("for") != -1) {
          var forRecipe = name.substring(name.indexOf("for"));
          name = name.replace(forRecipe,'');
        }
        if (name.indexOf("(") != -1) {
          if (name.indexOf(")") != -1) {
            var parentheses = name.substring(name.indexOf("(") - 1, name.indexOf(")") + 1);
            name = name.replace(parentheses,'');
          }
        }
        if (name.indexOf("(") != -1) {
          var parentheses = name.substring(name.indexOf("("));
          name = name.replace(parentheses,'');
        } else if (name.indexOf(")") != -1) {
          var parentheses = name.substring(0, name.indexOf(")") + 1);
          name = name.replace(parentheses,'');
        }
        if (amount.toString().indexOf("(") != -1) {
          var parentheses = amount.toString().substring(amount.toString().indexOf("("));
          amount = amount.toString().replace(parentheses,'');
        } else if (amount.toString().indexOf(")") != -1) {
          var parentheses = amount.toString().substring(0, amount.toString().indexOf(")") + 1);
          amount = amount.toString().replace(parentheses,'');
        }
        if (name.indexOf(", ") != -1) {
          name = name.replace(", ",' ');
        }
        if (name.indexOf("Club House") != -1) {
          name = name.replace("Club House",'');
        }
        //console.log("name: " + name + ", amount: " + amount + ", units: " + units);
        var ingred = {
          ingredient : name,
          amount : amount,
          units : units
        }
        ingredUpdates[newKey] = ingred;
      }
      var recipeData = {
        name: recipe_name,
        recipe: "<a target='_blank' href='" + data.source.sourceRecipeUrl + "'>" + data.source.sourceRecipeUrl + "</a>",
        ingredients: ingredUpdates,
        public: false,
        likes: 0,
        image: img
      }
      var updates = {};
      var recipeKey = recipeRef.push().key;
      updates["/users/" + currentUser + "/recipes/" + recipeKey] = recipeData;
      //console.log(recipeData);
      database.ref().update(updates).then(function() {
        MealPrepSunday.resetMaterialTextfield(document.getElementById('recipe_link'));
        blah.toggleButton();
      }.bind(this));
    });
  }
};

MealPrepSunday.prototype.removeRecipe = function(e) {
  var target = e.target.parentNode;
  if ((!$(target).hasClass("recipe-remove"))) return;
  var num = target.id.substring(13);
  var key = target.parentNode.parentNode.id;
  document.getElementById("recipe_name" + num + "").parentNode.parentNode.outerHTML="";
  var currentUser = this.auth.currentUser.uid;
  var updates = {};
  updates['/public-recipes/' + key] = null;
  updates["/users/" + currentUser + "/recipes/" + key] = null;
  updates["/users/" + currentUser + "/planner/" + key] = null;
  this.database.ref().update(updates);
};

MealPrepSunday.prototype.loadRecipes = function() {
  var currentUser = this.auth.currentUser.uid;
  this.recipeRef = this.database.ref("/users/" + currentUser + "/recipes");
  this.recipeRef.off();
  var numRecipes = 0;
  var setRecipe = function(data) {
    var val = data.val();
    if (val == null) return;
    this.displayRecipes(data.key, val.name, val.recipe, val.ingredients, val.public, val.likes, val.image, numRecipes);
    numRecipes++;
  }.bind(this);
  this.recipeRef.on('child_added', setRecipe);
};

MealPrepSunday.prototype.displayRecipes = function(key, name, recipe, ingredients, pub, likes, image, num) {
  var container = document.createElement('div');
  container.innerHTML = MealPrepSunday.RECIPE_TEMPLATE;
  container.setAttribute('id', key);
  container.className += "cell-overflow zindex mdl-cell mdl-cell--4-col mdl-card mdl-shadow--6dp";
  if (image) {
    var title_bg = container.firstChild;
    var bg = "background: linear-gradient(transparent, transparent, rgba(66,66,66,0.9)), url('" + image + "') bottom right no-repeat;height: 200px;background-size: 100%;";
    title_bg.setAttribute("style", bg);
  }
  var title = container.firstChild.firstChild;
  title.setAttribute('id', "recipe_name" + num);
  title.textContent = name;
  var rcp = container.firstChild.nextSibling;
  rcp.setAttribute('id', "recipe_data" + num);
  rcp.innerHTML += "<pre>" + recipe + "</pre>";
  rcp.setAttribute('style', "padding-bottom:0px;");
  var onclick = "$(" + "'#recipe_ingrds" + num + "').parent().toggle();"
  var show_ingred =
    "<div class='show-ingredients'><button class='mdl-button mdl-js-button mdl-button--icon mdl-button--colored'>" +
      '<i class="material-icons">expand_more</i>' +
    '</button></div>';
  rcp.innerHTML += show_ingred;
  rcp.firstChild.nextSibling.firstChild.setAttribute('onclick', onclick);
  var ingrd = container.firstChild.nextSibling.nextSibling;
  ingrd.innerHTML += MealPrepSunday.RECIPE_INGRDS_TEMPLATE;
  ingrd.firstChild.setAttribute('id', "recipe_ingrds" + num);
  ingrd.setAttribute('style', "display:none;padding:0px;width:100%;");
  if (ingredients != null) {
    var sortedKeys = Object.keys(ingredients).sort();
    for (var i = 0; i < sortedKeys.length; i++) {
      var row = document.createElement('tr');
      var ingred = ingredients[sortedKeys[i]];
      row.innerHTML = MealPrepSunday.RECIPE_INGRDS_ROW_TEMPLATE;
      row.setAttribute('id', "recipe" + num + "_ingrd" + i);
      row.firstChild.textContent = ingred.ingredient;
      row.firstChild.nextSibling.textContent = ingred.amount;
      row.firstChild.nextSibling.nextSibling.textContent = ingred.units;
      ingrd.firstChild.firstChild.nextSibling.appendChild(row);
    }
  }
  var btns = container.firstChild.nextSibling.nextSibling.nextSibling.firstChild;
  btns.setAttribute('id', "recipe_edit" + num);
  btns.nextSibling.setAttribute('id', "recipe_save" + num);
  btns.nextSibling.nextSibling.setAttribute('id', "recipe_remove" + num);
  btns.nextSibling.nextSibling.nextSibling.setAttribute('id', "recipe_day" + num);
  btns.nextSibling.nextSibling.nextSibling.nextSibling.setAttribute('id', "recipe_grocery" + num);
  var likesHeart =
    '<span class="recipe_likes"><button disabled class="mdl-button mdl-js-button mdl-button--icon mdl-button--colored">' +
      '<i class="material-icons">favorite</i></button>';
  if (likes == 1) {
    likesHeart += likes + ' like</span>';
  } else {
    likesHeart += likes + ' likes</span>';
  }
  btns.nextSibling.nextSibling.outerHTML += likesHeart;
  this.recipeList.appendChild(container);
};

MealPrepSunday.prototype.editRecipe = function(e) {
  e.preventDefault();
  var target = e.target.parentNode;
  if ((!$(target).hasClass("recipe-edit"))) return;
  var img = $(target.parentNode.parentNode.firstChild).css("background").replace(/.*\s?url\([\'\"]?/, '').replace(/[\'\"]?\).*/, '');
  var num = target.id.substring(11);
  var steps = document.getElementById("recipe_data" + num);
  var steps_data = steps.firstChild.innerHTML;
  var currentUser = this.auth.currentUser.uid;
  target.style.display = "none";
  $('.recipe-edit').prop('disabled', true);
  $('.recipe-remove').prop('disabled', true);
  $('.recipe-add-to-grocery-list').prop('disabled', true);
  $('.recipe-add-to-planner').prop('disabled', true);
  target.nextSibling.style.display = "inline";
  var key = target.parentNode.parentNode.id;
  $(target.parentNode.parentNode).removeClass("mdl-cell--4-col");
  $(target.parentNode.parentNode).addClass("mdl-cell--12-col");
  var recipe = document.getElementById("recipe_name" + num);
  var recipe_name = recipe.textContent;
  recipe.innerHTML = "<input class='mdl-textfield__input' type='text' value='"
                          + recipe_name + "' id='new_name" + num + "'>";
  steps.innerHTML = '<div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label" style="width:100%;">' +
    '<textarea class="mdl-textfield__input" type="text" rows="7" id="new_recipe_data' + num + '"></textarea>' +
    '<label class="mdl-textfield__label" for="new_recipe_data' + num + '">Recipe</label></div>';
  $('#new_recipe_data' + num).val(steps_data);
  var steps_div = $('#new_recipe_data' + num);
  $('#recipe_ingrds' + num).parent().show();
  var tbody = document.getElementById('recipe_ingrds' + num).firstChild.nextSibling;
  var num_rows = tbody.childElementCount;
  var div = document.createElement("div");
  div.className += "mdl-textfield mdl-js-textfield mdl-textfield--floating-label";
  div.setAttribute("style", "width:100%;");
  var div_id = 'new_recipe' + num + "_image";
  div.innerHTML = MealPrepSunday.EDIT_RECIPE_IMAGE;
  div.firstChild.setAttribute('id', div_id);
  div.firstChild.setAttribute('value', img);
  div.firstChild.nextSibling.setAttribute('for', div_id);
  var public_div = document.createElement("div");
  public_div.className += "mdl-textfield";
  public_div.innerHTML = MealPrepSunday.EDIT_RECIPE_PUBLIC;
  var public_div_id = 'new_recipe' + num + "_public";
  public_div.firstChild.setAttribute('for', public_div_id);
  public_div.firstChild.firstChild.setAttribute('id', public_div_id);
  var recipeRef = this.database.ref("/users/" + currentUser + "/recipes/" + key + "/");
  recipeRef.once('value').then(function(snapshot) {
     var data = snapshot.val();
     var is_pub = data.public;
     if (is_pub) {
       public_div.firstChild.MaterialCheckbox.check();
     }
  });
  document.getElementById("recipe_data" + num).appendChild(div);
  document.getElementById("recipe_data" + num).appendChild(public_div);
  for (var i = 0; i < num_rows; i++) {
    var row = document.getElementById("recipe" + num + "_ingrd" + i);
    var ingredient = row.firstChild;
    var amount = row.firstChild.nextSibling;
    var units = row.firstChild.nextSibling.nextSibling;
    var name = ingredient.textContent;
    var current_amt = amount.textContent;
    var current_units = units.textContent;
    ingredient.innerHTML = "<div class='mdl-textfield mdl-js-textfield mdl-textfield--floating-label' style='width:100%;'>" +
      "<input class='mdl-textfield__input' type='text' value='" + name + "' id='new_recipe" + num + "_name" + i + "'>" +
      '<label class="mdl-textfield__label" for="new_recipe' + num + '_name"' + i + '>Name</label></div>';
    amount.innerHTML = "<div class='mdl-textfield mdl-js-textfield mdl-textfield--floating-label' style='width:100%;'>" +
      "<input class='mdl-textfield__input' type='text' value='" + current_amt + "' id='new_recipe" + num + "_amount" + i + "'>" +
      '<label class="mdl-textfield__label" for="new_recipe' + num + '_amount"' + i + '>Amount</label></div>';
    units.innerHTML = '<div class="edit-recipe-units mdl-textfield mdl-js-textfield mdl-textfield--floating-label getmdl-select getmdl-select__fix-height getmdl-select__fullwidth">' +
              '<input class="mdl-textfield__input" type="text" id="new_recipe' + num + "_units" + i + '" value="' + current_units + '" readonly>' +
              '<label for="new_recipe' + num + "_units" + i + '">' +
                  '<i class="mdl-icon-toggle__label material-icons">keyboard_arrow_down</i>' +
              '</label>' +
              '<label for="new_recipe' + num + "_units" + i + '" class="mdl-textfield__label">Units</label>' +
              '<ul for="new_recipe' + num + "_units" + i + '" class="mdl-menu mdl-menu--bottom-left mdl-js-menu flexdropdown">' +
                  '<li class="mdl-menu__item" data-val="units">units</li>' +
                  '<li class="mdl-menu__item" data-val="cups">cups</li>' +
                  '<li class="mdl-menu__item" data-val="tsp">tsp</li>' +
                  '<li class="mdl-menu__item" data-val="tbsp">tbsp</li>' +
                  '<li class="mdl-menu__item" data-val="ounces">ounces</li>' +
                  '<li class="mdl-menu__item" data-val="pints">pints</li>' +
                  '<li class="mdl-menu__item" data-val="gallons">gallons</li>' +
                  '<li class="mdl-menu__item" data-val="quarts">quarts</li>' +
                  '<li class="mdl-menu__item" data-val="liters">liters</li>' +
                  '<li class="mdl-menu__item" data-val="lbs">lbs</li>' +
                  '<li class="mdl-menu__item" data-val="grams">grams</li>' +
              '</ul></div>';
    var rmv = '<td class="zindex mdl-data-table__cell">' +
    '<button class="new_recipe_remove mdl-button mdl-js-button mdl-button--icon mdl-button--accent"><i class="material-icons">remove</i></button></td>';
    units.outerHTML += rmv;
  }
  componentHandler.upgradeDom();
  getmdlSelect.init(".getmdl-select");
  var currentUser = this.auth.currentUser.uid;
  $(".new_recipe_remove").on('click', function(e) {
    if ((!$(e.target.parentNode).hasClass("new_recipe_remove"))) return;
    e.target.parentNode.parentNode.parentNode.outerHTML = "";
  });
  var recipeRef = this.database.ref("/users/" + currentUser + "/recipes");
  var db = this.database.ref();
  $("#recipe_save" + num).on('click', function(e) {
    if ((!$(e.target.parentNode).hasClass("recipe-submit"))) return;
    e.preventDefault();
    var ingredUpdates = {};
    num_rows = tbody.childElementCount;
    for (var i = 0; i < num_rows; i++) {
      var new_key = recipeRef.push().key;
      var row = tbody.getElementsByTagName('tr')[i];
      var item_id = row.firstChild.firstChild.firstChild.id;
      var new_item = document.getElementById(item_id).value;
      var amt_id = row.firstChild.nextSibling.firstChild.firstChild.id;
      var new_item_amt = document.getElementById(amt_id).value;
      var units_id = row.firstChild.nextSibling.nextSibling.firstChild.firstChild.id;
      var new_item_unt = document.getElementById(units_id).value;
      ingredUpdates[new_key] = {
        ingredient: new_item,
        amount: new_item_amt,
        units: new_item_unt
      }
      row.firstChild.innerHTML = new_item;
      row.firstChild.nextSibling.innerHTML = new_item_amt;
      row.firstChild.nextSibling.nextSibling.innerHTML = new_item_unt;
    }
    var new_name = document.getElementById("new_name" + num).value;
    var new_recipe = document.getElementById('new_recipe_data' + num).value;
    var curlikes;
    var updates = {};
    recipeRef.child(key).once('value').then(function(snapshot) {
       var data = snapshot.val();
       curlikes = data.likes;
       var new_img = document.getElementById('new_recipe' + num + "_image").value;
       var old_public = data.public;
       var is_public = $(public_div.firstChild.firstChild).is(":checked");
       if (is_public && (old_public == false)) {
         var time = 0 - (Date.now());
         var publicData = {
           recipe: key,
           user: currentUser,
           time: time
         }
         updates['/public-recipes/' + key] = publicData;
       } else if (old_public) {
         if (is_public == false) {
           updates['/public-recipes/' + key] = null;
         }
       }
       db.update(updates);
       recipeRef.child(key).set({
         name: new_name,
         ingredients: ingredUpdates,
         recipe: new_recipe,
         public: is_public,
         likes: curlikes,
         image: new_img
       }).then(function() {
         $(target.parentNode.parentNode).removeClass("mdl-cell--12-col");
         $(target.parentNode.parentNode).addClass("mdl-cell--4-col");
         document.getElementById("recipe_name" + num).innerHTML = new_name;
         var rcp = document.getElementById("recipe_data" + num);
         rcp.innerHTML = "<pre>" + new_recipe + "</pre>";
         var onclick = "$(" + "'#recipe_ingrds" + num + "').parent().toggle();"
         var show_ingred =
           "<div class='show-ingredients'><button class='mdl-button mdl-js-button mdl-button--icon mdl-button--colored'>" +
             '<i class="material-icons">expand_more</i>' +
           '</button></div>';
         rcp.innerHTML += show_ingred;
         rcp.firstChild.nextSibling.firstChild.setAttribute('onclick', onclick);
         $('#recipe_ingrds' + num).parent().hide();
         target.style.display = "inline";
         target.nextSibling.style.display = "none";
         $(".new_recipe_remove").parent().remove();
         $('.recipe-edit').prop('disabled', false);
         $('.recipe-remove').prop('disabled', false);
         $('.recipe-add-to-grocery-list').prop('disabled', false);
         $('.recipe-add-to-planner').prop('disabled', false);
       }.bind(this)).catch(function(error) {
         console.error('Error writing new message to Firebase Database', error);
       });
     });
  });
};

MealPrepSunday.EDIT_RECIPE_IMAGE =
    '<input class="mdl-textfield__input" type="text">' +
    '<label class="mdl-textfield__label">Image URL</label>';

MealPrepSunday.EDIT_RECIPE_PUBLIC =
'<label class="mdl-checkbox mdl-js-checkbox mdl-js-ripple-effect">' +
'<input type="checkbox" class="mdl-checkbox__input">' +
'<span class="mdl-checkbox__label">Make recipe public?</span></label>';

MealPrepSunday.prototype.recipeAddIngredient = function(e) {
  e.preventDefault();
  var target = e.target.parentNode;
  var ingredients = document.getElementById('recipe-ingredients');
  var new_ingred = document.createElement('div');
  new_ingred.innerHTML = MealPrepSunday.RECIPE_ADD_INGRED_TEMPLATE;
  var ingred_num = this.createRecipeIngredientsNumAdded;
  this.createRecipeIngredientsNumAdded += 1;
  new_ingred.setAttribute('id', "recipe-ingredients" + ingred_num);
  var ingred_name = new_ingred.firstChild.firstChild;
  ingred_name.setAttribute('id', "recipe_ingredient" + ingred_num);
  ingred_name.nextSibling.setAttribute('for', "recipe_ingredient" + ingred_num);
  var ingred_amount = new_ingred.firstChild.nextSibling.firstChild;
  ingred_amount.setAttribute('id', "recipe_ingredient_amount" + ingred_num);
  ingred_amount.nextSibling.setAttribute('for', "recipe_ingredient_amount" + ingred_num);
  var ingred_units = new_ingred.firstChild.nextSibling.nextSibling.firstChild;
  ingred_units.setAttribute('id', "recipe_ingredient_units" + ingred_num);
  ingred_units.nextSibling.setAttribute('for', "recipe_ingredient_units" + ingred_num);
  ingred_units.nextSibling.nextSibling.setAttribute('for', "recipe_ingredient_units" + ingred_num);
  ingred_units.nextSibling.nextSibling.nextSibling.setAttribute('for', "recipe_ingredient_units" + ingred_num);
  this.createRecipeIngredients.appendChild(new_ingred);
  componentHandler.upgradeDom();
  getmdlSelect.init(".getmdl-select");
};

MealPrepSunday.prototype.recipeAddToGrocery = function(e) {
  e.preventDefault();
  var target = e.target.parentNode;
  if ((!$(target).hasClass("recipe-add-to-grocery-list"))) return;
  var num = target.id.substring(14);
  var ingreds_table = document.getElementById("recipe_ingrds" + num);
  var ingreds = ingreds_table.firstChild.nextSibling;
  var num_rows = ingreds.childElementCount;
  var currentUser = this.auth.currentUser.uid;
  var itemRef = this.database.ref("/users/" + currentUser + "/grocery-list");
  var itemUpdates = {};
  for (var i = 0; i < num_rows; i++) {
    var new_key = itemRef.push().key;
    var row = document.getElementById('recipe' + num + "_ingrd" + i);
    var itm = row.firstChild.textContent;
    var item_amt = row.firstChild.nextSibling.textContent;
    var item_unt = row.firstChild.nextSibling.nextSibling.textContent;
    itemUpdates[new_key] = {
      item: itm,
      amount: item_amt,
      units: item_unt
    }
  }
  itemRef.update(itemUpdates);
  var data = {
    message: 'Ingredients added to grocery list',
    timeout: 2000
  };
  this.grocerySnackbar.MaterialSnackbar.showSnackbar(data);
};

MealPrepSunday.prototype.recipeAddToPlanner = function(e) {
  e.preventDefault();
  var target = e.target.parentNode;
  if ((!$(target).hasClass("recipe-add-to-planner"))) return;
  var key = target.parentNode.parentNode.id;
  var recipe_name = target.parentNode.parentNode.firstChild.firstChild.textContent;
  //console.log(recipe_name);
  var num = target.id.substring(10);
  var ingreds_table = document.getElementById("recipe_ingrds" + num);
  var ingreds = ingreds_table.firstChild.nextSibling;
  var num_rows = ingreds.childElementCount;
  var currentUser = this.auth.currentUser.uid;
  var itemRef = this.database.ref("/users/" + currentUser + "/grocery-list");
  var itemUpdates = {};
  for (var i = 0; i < num_rows; i++) {
    var new_key = itemRef.push().key;
    var row = document.getElementById('recipe' + num + "_ingrd" + i);
    var itm = row.firstChild.textContent;
    var item_amt = row.firstChild.nextSibling.textContent;
    var item_unt = row.firstChild.nextSibling.nextSibling.textContent;
    itemUpdates[new_key] = {
      item: itm,
      amount: item_amt,
      units: item_unt,
      recipe: key
    }
  }
  itemRef.update(itemUpdates);
  var plannerData = {
    recipe: key,
    name: recipe_name
  }
  var updates = {};
  updates["/users/" + currentUser + "/planner/" + key] = plannerData;
  this.database.ref().update(updates);
  var data = {
    message: '"' + recipe_name + '" added to planner',
    timeout: 2000
  };
  this.plannerSnackbar.MaterialSnackbar.showSnackbar(data);
};

MealPrepSunday.prototype.recipeRemoveFromPlanner = function(e) {
  e.preventDefault();
  var target = e.target.parentNode;
  if ((!$(target).hasClass("planner-remove"))) return;
  var key = target.parentNode.parentNode.id;
  var recipe_name = target.parentNode.parentNode.firstChild.textContent;
  var num = target.id.substring(14);
  var grocery_list = document.getElementById("grocery-list");
  var num_rows = grocery_list.childElementCount;
  var currentUser = this.auth.currentUser.uid;
  var updates = {};
  for (var i = 0; i < num_rows; i++) {
    var row = grocery_list.getElementsByTagName('tr')[i];
    var row_id = row.id;
    if (($(row).hasClass(key))) {
      updates["/users/" + currentUser + "/grocery-list/" + row_id] = null;
    }
  }
  updates["/users/" + currentUser + "/planner/" + key] = null;
  this.database.ref().update(updates).then(function() {
    //console.log(document.getElementById("planner_remove" + num).parentNode.parentNode.outerHTML);
    document.getElementById("planner_remove" + num).parentNode.parentNode.outerHTML = "";
    for (var i = 0; i < num_rows; i++) {
      var row = grocery_list.getElementsByTagName('tr')[i];
      console.log(row);
      if (($(row).hasClass(key))) {
        row.outerHTML = "";
      }
    }
  }.bind(this)).catch(function(error) {
    console.error('Error writing new message to Firebase Database', error);
  });
  var data = {
    message: '"' + recipe_name + '" removed from planner',
    timeout: 2000
  };
  this.plannerSnackbar.MaterialSnackbar.showSnackbar(data);
};

MealPrepSunday.prototype.loadPlanner = function() {
  var currentUser = this.auth.currentUser.uid;
  //.toLocaleDateString("en-US");
  var date = new Date();
  var now = date? new Date(date) : new Date();
  now.setHours(0,0,0,0);
  var monday = new Date(now);
  monday.setDate(monday.getDate() - monday.getDay() + 1);
  var sunday = new Date(now);
  sunday.setDate(sunday.getDate() - sunday.getDay() + 7);
  var space = '\u2004'
  document.getElementById("planner-week-of").textContent = space + " (" + monday.toLocaleDateString() + " - " + sunday.toLocaleDateString() + ")";
  this.inventoryRef = this.database.ref("/users/" + currentUser + "/planner");
  this.inventoryRef.off();
  var numRecipes = 0;
  var setPlannerRecipe = function(data) {
    var val = data.val();
    this.displayPlanner(val.recipe, val.name, numRecipes);
    numRecipes++;
  }.bind(this);
  this.inventoryRef.on('child_added', setPlannerRecipe);
};

MealPrepSunday.prototype.displayPlanner = function(key, name, num) {
  var container = document.createElement('tr');
  container.innerHTML = MealPrepSunday.PLANNER_TEMPLATE;
  container.setAttribute('id', key);
  var td = container.firstChild;
  td.setAttribute('id', "planner_name" + num);
  td.textContent = name;
  var td2 = container.firstChild.nextSibling.firstChild;
  td2.setAttribute('id', "planner_remove" + num);
  this.plannerList.appendChild(container);
};

MealPrepSunday.PLANNER_TEMPLATE =
    '<tr>' +
      '<td class="mdl-data-table__cell--non-numeric"></td>' +
      '<td class="zindex mdl-data-table__cell">' +
        '<button class="planner-remove mdl-button mdl-js-button mdl-button--icon mdl-button--accent"><i class="material-icons">remove</i></button>' +
      '</td>' +
    '</tr>';

MealPrepSunday.RECIPE_ADD_INGRED_TEMPLATE =
      '<div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label">' +
        '<input class="mdl-textfield__input" type="text" id="recipe_ingredient0">' +
        '<label class="mdl-textfield__label" for="recipe_ingredient0">Ingredient</label>' +
      '</div>' +
      '<div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label">' +
        '<input class="mdl-textfield__input" step="any" type="number" id="recipe_ingredient_amount0">' +
        '<label class="mdl-textfield__label" for="recipe_ingredient_amount0">Amount</label>' +
      '</div>' +
      '<div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label getmdl-select getmdl-select__fix-height getmdl-select__fullwidth">' +
          '<input class="mdl-textfield__input" type="text" id="recipe_ingredient_units0" readonly>' +
          '<label for="recipe_ingredient_units0">' +
              '<i class="mdl-icon-toggle__label material-icons">keyboard_arrow_down</i>' +
          '</label>' +
          '<label for="recipe_ingredient_units0" class="mdl-textfield__label">Units</label>' +
          '<ul for="recipe_ingredient_units0" class="mdl-menu mdl-menu--bottom-left mdl-js-menu flexdropdown">' +
              '<li class="mdl-menu__item" data-val="units">units</li>' +
              '<li class="mdl-menu__item" data-val="cups">cups</li>' +
              '<li class="mdl-menu__item" data-val="tsp">tsp</li>' +
              '<li class="mdl-menu__item" data-val="tbsp">tbsp</li>' +
              '<li class="mdl-menu__item" data-val="ounces">ounces</li>' +
              '<li class="mdl-menu__item" data-val="pints">pints</li>' +
              '<li class="mdl-menu__item" data-val="gallons">gallons</li>' +
              '<li class="mdl-menu__item" data-val="quarts">quarts</li>' +
              '<li class="mdl-menu__item" data-val="liters">liters</li>' +
              '<li class="mdl-menu__item" data-val="lbs">lbs</li>' +
              '<li class="mdl-menu__item" data-val="grams">grams</li>' +
          '</ul></div><hr>';

MealPrepSunday.RECIPE_TEMPLATE =
    '<div class="mdl-card__title mdl-color--accent mdl-color-text--white">' +
      '<h2 class="mdl-card__title-text"></h2>' +
    '</div>' +
    '<div class="recipe-data mdl-card__supporting-text mdl-card--expand">' +
    '</div>' +
    '<div class="cell-overflow recipe-ingrd-data mdl-card__supporting-text" style="padding:0;width:100%;">' +
    '</div>' +
    '<div class="zindex mdl-card__actions mdl-card--border" style="width:100%">' +
      '<button class="recipe-edit mdl-button mdl-js-button mdl-button--icon mdl-button--accent"><i class="material-icons">edit</i></button>' +
      '<button class="recipe-submit mdl-button mdl-js-button mdl-button--icon mdl-button--accent" type="submit" style="display:none;"><i class="material-icons">save</i></button>' +
      '<button class="recipe-remove mdl-button mdl-js-button mdl-button--icon mdl-button--accent"><i class="material-icons">remove</i></button>' +
      '<button class="recipe-add-to-planner mdl-button mdl-js-button mdl-button--icon mdl-button--accent"><i class="material-icons">today</i></button>' +
      '<button class="recipe-add-to-grocery-list mdl-button mdl-js-button mdl-button--icon mdl-button--accent"><i class="material-icons">add_shopping_cart</i></button>' +
    '</div>';

MealPrepSunday.RECIPE_INGRDS_TEMPLATE =
    '<table class="mdl-data-table mdl-js-data-table" style="width:100%;border:none;">' +
      '<thead><tr>' +
          '<th class="mdl-data-table__cell--non-numeric">Ingredient</th>' +
          '<th class="mdl-data-table__cell--numeric">Amount</th>' +
          '<th class="mdl-data-table__cell--non-numeric">Units</th>' +
        '</tr></thead>' +
      '<tbody>' +
      '</tbody>' +
    '</table>';

MealPrepSunday.RECIPE_INGRDS_ROW_TEMPLATE =
    '<tr>' +
      '<td class="mdl-data-table__cell--non-numeric"></td>' +
      '<td class="mdl-data-table__cell--numeric"></td>' +
      '<td class="mdl-data-table__cell--non-numeric"></td>' +
    '</tr>';

/*
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~ Grocery List ~~~~~~~~~~~~~~~~~~~~~~~~~~~
 */
MealPrepSunday.prototype.saveItem = function(e) {
  e.preventDefault();

  if (this.itemInput.value && this.checkSignedInWithMessage()) {
    var currentUser = this.auth.currentUser.uid;
    this.groceryRef = this.database.ref("/users/" + currentUser + "/grocery-list");
    this.groceryRef.push({
      item: this.itemInput.value,
      amount: this.itemAmount.value,
      units: this.itemUnits.value
    }).then(function() {
      MealPrepSunday.resetMaterialTextfield(this.itemInput);
      MealPrepSunday.resetMaterialTextfield(this.itemAmount);
      MealPrepSunday.resetMaterialTextfield(this.itemUnits);
      this.toggleButton();
    }.bind(this)).catch(function(error) {
      console.error('Error writing new message to Firebase Database', error);
    });
  }
};

MealPrepSunday.prototype.loadGroceryList = function() {
  var currentUser = this.auth.currentUser.uid;
  this.groceryRef = this.database.ref("/users/" + currentUser + "/grocery-list");
  this.groceryRef.off();
  var numItems = 0;
  var setItem = function(data) {
    var val = data.val();
    this.displayGroceryList(data.key, val.item, val.amount, val.units, val.recipe, numItems);
    numItems++;
  }.bind(this);
  this.groceryRef.on('child_added', setItem);
};

MealPrepSunday.prototype.editItem = function(e) {
  e.preventDefault();
  var target = e.target.parentNode;
  if ((!$(target).hasClass("grocery-edit"))) return;
  target.style.display = "none";
  target.nextSibling.style.display = "inline";
  $('.grocery-edit').prop('disabled', true);
  $('.grocery-remove').prop('disabled', true);
  var num = target.id.substring(9);
  var key = target.parentNode.parentNode.id;
  var item = document.getElementById("item_name" + num);
  var amount = document.getElementById("item_amount" + num);
  var units = document.getElementById("item_units" + num);
  var name = item.textContent;
  var current_amt = amount.textContent;
  var current_units = units.textContent;
  item.innerHTML = "<input class='mdl-textfield__input' type='text' value='"
                    + name + "' id='new_item_name" + num + "'>";
  amount.innerHTML = "<input class='mdl-textfield__input' step='any' type='number' value='"
                    + current_amt + "' id='new_item_amount" + num + "'>";
  units.innerHTML = '<div class="cell-overflow mdl-textfield mdl-js-textfield mdl-textfield--floating-label getmdl-select getmdl-select__fix-height getmdl-select__fullwidth">' +
            '<input class="mdl-textfield__input" type="text" id="new_item_units' + num + '" value="' + current_units + '" readonly>' +
            '<label for="new_item_units' + num + '">' +
                '<i class="mdl-icon-toggle__label material-icons">keyboard_arrow_down</i>' +
            '</label>' +
            '<label for="new_item_units' + num + '" class="mdl-textfield__label">Units</label>' +
            '<ul for="new_item_units' + num + '" class="mdl-menu mdl-menu--bottom-left mdl-js-menu flexdropdown">' +
                '<li class="mdl-menu__item" data-val="units">units</li>' +
                '<li class="mdl-menu__item" data-val="cups">cups</li>' +
                '<li class="mdl-menu__item" data-val="tsp">tsp</li>' +
                '<li class="mdl-menu__item" data-val="tbsp">tbsp</li>' +
                '<li class="mdl-menu__item" data-val="ounces">ounces</li>' +
                '<li class="mdl-menu__item" data-val="pints">pints</li>' +
                '<li class="mdl-menu__item" data-val="gallons">gallons</li>' +
                '<li class="mdl-menu__item" data-val="quarts">quarts</li>' +
                '<li class="mdl-menu__item" data-val="liters">liters</li>' +
                '<li class="mdl-menu__item" data-val="lbs">lbs</li>' +
                '<li class="mdl-menu__item" data-val="grams">grams</li>' +
            '</ul></div>';
  componentHandler.upgradeDom();
  getmdlSelect.init(".getmdl-select");
  var currentUser = this.auth.currentUser.uid;
  var groceryRef = this.database.ref("/users/" + currentUser + "/grocery-list");
  $("#item_save" + num).on('click', function(e) {
    e.preventDefault();
    var new_item = document.getElementById("new_item_name" + num).value;
    var new_item_amt = document.getElementById("new_item_amount" + num).value;
    var new_item_unt = document.getElementById("new_item_units" + num).value;
    groceryRef.child(key).set({
      item: new_item,
      amount: new_item_amt,
      units: new_item_unt
    }).then(function() {
      document.getElementById("item_name" + num).innerHTML = new_item;
      document.getElementById("item_amount" + num).innerHTML = new_item_amt;
      document.getElementById("item_units" + num).innerHTML = new_item_unt;
      target.style.display = "inline";
      target.nextSibling.style.display = "none";
      $('.grocery-edit').prop('disabled', false);
      $('.grocery-remove').prop('disabled', false);
    }.bind(this)).catch(function(error) {
      console.error('Error writing new message to Firebase Database', error);
    });
  });
};

MealPrepSunday.prototype.removeItem = function(e) {
  var target = e.target.parentNode;
  if ((!$(target).hasClass("grocery-remove"))) return;
  var num = target.id.substring(11);
  var key = target.parentNode.parentNode.id;
  document.getElementById("item_name" + num + "").parentNode.outerHTML="";
  var currentUser = this.auth.currentUser.uid;
  this.groceryRef = this.database.ref("/users/" + currentUser + "/grocery-list");
  this.groceryRef.child(key).remove();
};

MealPrepSunday.prototype.displayGroceryList = function(key, item, amount, units, recipe, num) {
  var container = document.createElement('tr');
  container.innerHTML = MealPrepSunday.GROCERY_LIST_TEMPLATE;
  container.setAttribute('id', key);
  if (recipe) {
    container.className += recipe;
  }
  var td = container.firstChild;
  td.setAttribute('id', "item_name" + num);
  td.textContent = item;
  var td2 = container.firstChild.nextSibling;
  td2.setAttribute('id', "item_amount" + num);
  td2.textContent = amount;
  var td3a = container.firstChild.nextSibling.nextSibling;
  td3a.setAttribute('id', "item_units" + num);
  td3a.textContent = units;
  var td3 = container.firstChild.nextSibling.nextSibling.nextSibling.firstChild;
  td3.setAttribute('id', "item_edit" + num);
  td3 = container.firstChild.nextSibling.nextSibling.nextSibling.firstChild.nextSibling;
  td3.setAttribute('id', "item_save" + num);
  td3 = container.firstChild.nextSibling.nextSibling.nextSibling.firstChild.nextSibling.nextSibling;
  td3.setAttribute('id', "item_remove" + num);
  this.groceryList.appendChild(container);
};

MealPrepSunday.GROCERY_LIST_TEMPLATE =
    '<tr>' +
      '<td class="mdl-data-table__cell--non-numeric"></td>' +
      '<td class="mdl-data-table__cell--numeric"></td>' +
      '<td class="mdl-data-table__cell--non-numeric" class="zindex"></td>' +
      '<td class="mdl-data-table__cell">' +
        '<button class="grocery-edit mdl-button mdl-js-button mdl-button--icon mdl-button--accent"><i class="material-icons">edit</i></button>' +
        '<button class="grocery-submit mdl-button mdl-js-button mdl-button--icon mdl-button--accent" type="submit" style="display:none;"><i class="material-icons">save</i></button>' +
        '<button class="grocery-remove mdl-button mdl-js-button mdl-button--icon mdl-button--accent"><i class="material-icons">remove</i></button>' +
      '</td>' +
    '</tr>';

/*
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~ Public Feed ~~~~~~~~~~~~~~~~~~~~~~~~~~~
 */
 MealPrepSunday.prototype.loadPublicRecipes = function() {
   this.publicRef = this.database.ref("/public-recipes").orderByChild("time");//.limitToLast(20);
   this.publicRef.off();
   var numPublicRecipes = 0;
   var setPublicRecipe = function(data) {
     var val = data.val();
     var recipeKey = val.recipe;
     var userID = val.user;
     var mps = this;
     this.database.ref("/users/" + userID + "/recipes/" + recipeKey).once('value').then(function(snapshot) {
        var rcp = snapshot.val();
        if (rcp == null) return;
        var key = snapshot.key;
        numPublicRecipes++;
        mps.displayPublicRecipes(key, rcp.name, rcp.recipe, rcp.ingredients, rcp.likes, rcp.image, numPublicRecipes);

      });
   }.bind(this);
   this.publicRef.on('child_added', setPublicRecipe);
 };

 MealPrepSunday.prototype.displayPublicRecipes = function(key, name, recipe, ingredients, likes, image, num) {
   var container = document.createElement('div');
   container.innerHTML = MealPrepSunday.PUBLIC_RECIPE_TEMPLATE;
   container.setAttribute('id', key);
   container.className += "cell-overflow zindex mdl-cell mdl-cell--4-col mdl-card mdl-shadow--6dp";
   if (image) {
     var title_bg = container.firstChild;
     var bg = "background: linear-gradient(transparent, transparent, rgba(66,66,66,0.9)), url('" + image + "') bottom right no-repeat;height: 200px;background-size: 100%;";
     title_bg.setAttribute("style", bg);
   }
   var title = container.firstChild.firstChild;
   title.setAttribute('id', "public_recipe_name" + num);
   title.textContent = name;
   var rcp = container.firstChild.nextSibling;
   rcp.setAttribute('id', "public_recipe_data" + num);
   rcp.innerHTML += "<pre>" + recipe + "</pre>";
   rcp.setAttribute('style', "padding-bottom:0px;");
   var onclick = "$(" + "'#public_recipe_ingrds" + num + "').parent().toggle();"
   var show_ingred =
     "<div class='show-ingredients'><button class='mdl-button mdl-js-button mdl-button--icon mdl-button--colored'>" +
       '<i class="material-icons">expand_more</i>' +
     '</button></div>';
   rcp.innerHTML += show_ingred;
   rcp.firstChild.nextSibling.firstChild.setAttribute('onclick', onclick);
   var ingrd = container.firstChild.nextSibling.nextSibling;
   ingrd.innerHTML += MealPrepSunday.RECIPE_INGRDS_TEMPLATE;
   ingrd.firstChild.setAttribute('id', "public_recipe_ingrds" + num);
   ingrd.setAttribute('style', "display:none;padding:0px;width:100%;");
   var sortedKeys = Object.keys(ingredients).sort();
   for (var i = 0; i < sortedKeys.length; i++) {
     var row = document.createElement('tr');
     var ingred = ingredients[sortedKeys[i]];
     row.innerHTML = MealPrepSunday.RECIPE_INGRDS_ROW_TEMPLATE;
     row.setAttribute('id', "public_recipe" + num + "_ingrd" + i);
     row.firstChild.textContent = ingred.ingredient;
     row.firstChild.nextSibling.textContent = ingred.amount;
     row.firstChild.nextSibling.nextSibling.textContent = ingred.units;
     ingrd.firstChild.firstChild.nextSibling.appendChild(row);
   }
   var likes_div = container.firstChild.nextSibling.nextSibling.nextSibling;
   var currentUser;
   if (this.auth.currentUser) {
     currentUser = this.auth.currentUser.uid;
     var likesRef = this.database.ref("/users/" + currentUser + "/liked-recipes/" + key).on('value', function(snapshot) {
        var theyLikeThis = snapshot.val();
        if (theyLikeThis) {
          likes_div.firstChild.firstChild.outerHTML =
            '<button class="public-recipe-unlike mdl-button mdl-js-button mdl-button--icon mdl-button--colored" id="public_recipe_likes' + num + '">' +
              '<i class="material-icons">favorite</i>' +
            '</button>';
        } else {
          likes_div.firstChild.firstChild.setAttribute('id', "public_recipe_likes" + num);
        }
     });
   } else {
     likes_div.firstChild.firstChild.setAttribute('id', "public_recipe_likes" + num);
   }
   var current_likes = likes_div.firstChild.firstChild.nextSibling;
   current_likes.setAttribute('id', "current_likes" + num);
   current_likes.setAttribute('class', "likes");
   if (likes == 1) {
     current_likes.innerHTML = likes + " like";
   } else {
     current_likes.innerHTML = likes + " likes";
   }
   this.publicRecipeList.appendChild(container);
 };

 MealPrepSunday.prototype.likePublicRecipe = function(e) {
   e.preventDefault();
   var target = e.target.parentNode;
   if ((!$(target).hasClass("public-recipe-like"))) return;
   var likes_div = target.parentNode;
   var num = target.id.substring(19);
   var key = target.parentNode.parentNode.parentNode.id;
   target.firstChild.parentNode.outerHTML =
   '<button class="public-recipe-unlike mdl-button mdl-js-button mdl-button--icon mdl-button--colored" id="public_recipe_likes' + num + '">' +
     '<i class="material-icons">favorite</i>' +
   '</button>';
   var currentUser = this.auth.currentUser.uid;
   var recipeUser;
   var currentLikes;
   var recipeRef = this.database.ref("/public-recipes/" + key + "/");
   recipeRef.on('value', function(snapshot) {
     recipeUser = snapshot.val().user;
   });
   var likesRef = this.database.ref("/users/" + recipeUser + "/recipes/" + key);
   likesRef.once('value').then(function(snapshot) {
     currentLikes = snapshot.val().likes + 1;
     likesRef.update({ "likes" : currentLikes });
     if (currentLikes == 1) {
       likes_div.firstChild.nextSibling.innerHTML = currentLikes + " like";
     } else {
       likes_div.firstChild.nextSibling.innerHTML = currentLikes + " likes";
     }
   });
   var likeData = {
     recipe: key
   }
   var updates = {};
   updates["/users/" + currentUser + "/liked-recipes/" + key] = likeData;
   this.database.ref().update(updates);
 };

 MealPrepSunday.prototype.unlikePublicRecipe = function(e) {
   e.preventDefault();
   var target = e.target.parentNode;
   if ((!$(target).hasClass("public-recipe-unlike"))) return;
   var likes_div = target.parentNode;
   var num = target.id.substring(19);
   var key = target.parentNode.parentNode.parentNode.id;
   target.firstChild.parentNode.outerHTML =
   '<button class="public-recipe-like mdl-button mdl-js-button mdl-button--icon mdl-button--colored" id="public_recipe_likes' + num + '">' +
     '<i class="material-icons">favorite_border</i>' +
   '</button>';
   var currentUser = this.auth.currentUser.uid;
   var recipeUser;
   var currentLikes;
   var recipeRef = this.database.ref("/public-recipes/" + key + "/");
   recipeRef.on('value', function(snapshot) {
     recipeUser = snapshot.val().user;
   });
   var likesRef = this.database.ref("/users/" + recipeUser + "/recipes/" + key);
   likesRef.once('value').then(function(snapshot) {
     currentLikes = snapshot.val().likes - 1;
     likesRef.update({ "likes" : currentLikes });
     if (currentLikes == 1) {
       likes_div.firstChild.nextSibling.innerHTML = currentLikes + " like";
     } else {
       likes_div.firstChild.nextSibling.innerHTML = currentLikes + " likes";
     }
   });
   var updates = {};
   updates["/users/" + currentUser + "/liked-recipes/" + key] = null;
   this.database.ref().update(updates);
 };

 MealPrepSunday.prototype.publicRecipeAddToRecipes = function(e) {
   e.preventDefault();
   var target = e.target.parentNode;
   if ((!$(target).hasClass("public-recipe-add-to-recipes"))) return;
   var img = $(target.parentNode.parentNode.firstChild).css("background").replace(/.*\s?url\([\'\"]?/, '').replace(/[\'\"]?\).*/, '');
   var key = target.parentNode.parentNode.id;
   var new_recipe_key = this.database.ref().push().key;
   var recipe_name = target.parentNode.parentNode.firstChild.firstChild.textContent;
   var num = target.parentNode.parentNode.firstChild.firstChild.id.substring(18);
   var recipe_steps =  document.getElementById("public_recipe_data" + num).firstChild.innerHTML;
   var ingreds_table = document.getElementById("public_recipe_ingrds" + num);
   var ingreds = ingreds_table.firstChild.nextSibling;
   var num_rows = ingreds.childElementCount;
   var currentUser = this.auth.currentUser.uid;
   var itemUpdates = {};
   var recipeRef = this.database.ref("/users/" + currentUser + "/recipes/");
   for (var i = 0; i < num_rows; i++) {
     var new_key = recipeRef.push().key;
     var row = ingreds.getElementsByTagName('tr')[i];
     var itm = row.firstChild.textContent;
     var item_amt = row.firstChild.nextSibling.textContent;
     var item_unt = row.firstChild.nextSibling.nextSibling.textContent;
     itemUpdates[new_key] = {
       ingredient: itm,
       amount: item_amt,
       units: item_unt,
       recipe: key
     }
   }
   var currentUser = this.auth.currentUser.uid;
   recipeRef.child(new_recipe_key).set({
     name: recipe_name,
     likes: 0,
     public: false,
     recipe: recipe_steps,
     ingredients: itemUpdates,
     image: img
   });
   var data = {
     message: '"' + recipe_name + '" has been added to your recipes',
     timeout: 2000
   };
   this.plannerSnackbar.MaterialSnackbar.showSnackbar(data);
 };

 MealPrepSunday.PUBLIC_RECIPE_TEMPLATE =
     '<div class="mdl-card__title mdl-color--accent mdl-color-text--white">' +
       '<h2 class="mdl-card__title-text"></h2>' +
     '</div>' +
     '<div class="recipe-data mdl-card__supporting-text mdl-card--expand">' +
     '</div>' +
     '<div class="recipe-ingrd-data mdl-card__supporting-text" style="padding:0;width:100%;">' +
     '</div>' +
     '<div class="flexcontainer mdl-card__actions mdl-card--border" style="margin: auto;text-align: center;">' +
        '<div class="itemcenter"><button class="public-recipe-like mdl-button mdl-js-button mdl-button--icon mdl-button--colored">' +
          '<i class="material-icons">favorite_border</i>' +
        '</button>' +
        '<span></span></div>' +
        '<button class="itemright public-recipe-add-to-recipes mdl-button mdl-js-button mdl-button--icon mdl-button--colored">' +
          '<i class="material-icons">add</i>' +
        '</button>' +
     '</div>';

 /*
  * ~~~~~~~~~~~~~~~~~~~~~~~~~~~ Helper Functions ~~~~~~~~~~~~~~~~~~~~~~~~~~~
  */
MealPrepSunday.prototype.toggleButton = function() {
  if (this.recipeInput.value || this.itemInput.value || this.importLink.value) {
    //this.addIngredient.removeAttribute('disabled');
    this.addRecipe.removeAttribute('disabled');
    this.addGroceryItem.removeAttribute('disabled');
    this.importRecipe.removeAttribute('disabled');
  } else {
    //this.addIngredient.setAttribute('disabled', 'true');
    this.addRecipe.setAttribute('disabled', 'true');
    this.addGroceryItem.setAttribute('disabled', 'true');
    this.importRecipe.setAttribute('disabled', 'true');
  }
};

// Resets the given MaterialTextField.
MealPrepSunday.resetMaterialTextfield = function(element) {
  element.value = '';
  element.parentNode.MaterialTextfield.boundUpdateClassesHandler();
};

window.onload = function() {
  window.mealPrepSunday = new MealPrepSunday();
};
