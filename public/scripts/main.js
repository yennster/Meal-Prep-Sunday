'use strict';

// Initializes MealPrepSunday.
function MealPrepSunday() {
  document.getElementById("Inventory").style.visibility = "hidden";
  $("#inventory-selector").click(function(event){
    document.getElementById("Inventory").style.visibility = "visible";
  });
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

  this.recipeList = document.getElementById('recipe-list');
  this.recipeForm = document.getElementById('recipe-form');

  var buttonTogglingHandler = this.toggleButton.bind(this);
  this.ingredientInput.addEventListener('keyup', buttonTogglingHandler);
  this.ingredientInput.addEventListener('change', buttonTogglingHandler);
  this.ingredientAmount.addEventListener('keyup', buttonTogglingHandler);
  this.ingredientAmount.addEventListener('change', buttonTogglingHandler);

  this.inventoryForm.addEventListener('submit', this.saveIngredient.bind(this));
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
  this.auth.signInWithPopup(provider);
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
MealPrepSunday.prototype.checkSignedIn = function() {
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
  if (this.ingredientInput.value) {
    var currentUser = this.auth.currentUser.uid;
    this.inventoryRef = this.database.ref(currentUser + "/inventory");
    console.log(currentUser + "/inventory" + "/" + this.ingredientInput.value);
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
  this.inventoryRef.on('child_changed', setIngredient);
};

function editIngredient(num) {

};

function removeIngredient(num) {
  var key = document.getElementById("name" + num + "").parentNode.id;
  document.getElementById("name" + num + "").parentNode.outerHTML="";

};

MealPrepSunday.prototype.displayInventory = function(key, ingredient, amount, num) {
  var container = document.createElement('tr');
  container.innerHTML = MealPrepSunday.INGREDIENT_TEMPLATE;
  container.setAttribute('id', key);
  var td = container.firstChild;
  //td.setAttribute('id', key);
  td.setAttribute('id', "name" + num);
  td.textContent = ingredient;
  var td2 = container.firstChild.nextSibling;
  //td2.setAttribute('id', key);
  td2.setAttribute('id', "amount" + num);
  td2.textContent = amount;
  var td3 = container.firstChild.nextSibling.nextSibling.firstChild;
  td3.setAttribute('id', "edit" + num);
  td3.setAttribute('onclick', "editIngredient('" + num + "')");
  var td4 = container.firstChild.nextSibling.nextSibling.nextSibling.firstChild;
  td4.setAttribute('id', "remove" + num);
  td4.setAttribute('onclick', "removeIngredient('" + num + "')");
  this.inventoryList.appendChild(container);
};

MealPrepSunday.prototype.toggleButton = function() {
  if (this.ingredientInput.value) {
    this.addIngredient.removeAttribute('disabled');
  } else {
    this.addIngredient.setAttribute('disabled', 'true');
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
        '<button class="inventory-edit mdl-button mdl-js-button mdl-button--raised">Edit</button>' +
      '</td>' +
      '<td class="mdl-data-table__cell">' +
        '<button class="inventory-remove mdl-button mdl-js-button mdl-button--raised">Remove</button>' +
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
