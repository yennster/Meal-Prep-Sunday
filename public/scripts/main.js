/**
 * Copyright 2015 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
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
  this.addIngredient = document.getElementById('add-ingredient');

  this.recipeList = document.getElementById('recipes');
  this.recipeForm = document.getElementById('recipe-form');

  var buttonTogglingHandler = this.toggleButton.bind(this);
  this.ingredientInput.addEventListener('keyup', buttonTogglingHandler);
  this.ingredientInput.addEventListener('change', buttonTogglingHandler);

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
};

// Triggers when the auth state change for instance when the user signs-in or signs-out.
MealPrepSunday.prototype.onAuthStateChanged = function(user) {
  if (user) { // User is signed in!
    var userName = user.displayName;
    var profilePicUrl = user.photoURL;
    var userID = user.uid;

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
  if (this.ingredientInput.value) {
    var currentUser = this.auth.currentUser.uid;
    this.inventoryRef = this.database.ref(currentUser + "/inventory");
    console.log(currentUser + "/inventory" + "/" + this.ingredientInput.value);
    this.inventoryRef.push({
      text: this.ingredientInput.value,
    }).then(function() {
      // Clear message text field and SEND button state.
      MealPrepSunday.resetMaterialTextfield(this.ingredientInput);
      this.toggleButton();
    }.bind(this)).catch(function(error) {
      console.error('Error writing new message to Firebase Database', error);
    });
  }
};

// Loads chat messages history and listens for upcoming ones.
MealPrepSunday.prototype.loadInventory = function() {
  var currentUser = this.auth.currentUser.uid;
  this.inventoryRef = this.database.ref(currentUser + "/inventory");
  this.inventoryRef.off();

  // Loads the last 12 messages and listen for new ones.
  var setIngredient = function(data) {
    var val = data.val();
    this.displayInventory(data.key, val.text);
  }.bind(this);
  this.inventoryRef.on('child_added', setIngredient);
  this.inventoryRef.on('child_changed', setIngredient);
};

// Displays a Message in the UI.
MealPrepSunday.prototype.displayInventory = function(key, text) {
  var container = document.createElement('tr');
  container.innerHTML = MealPrepSunday.INGREDIENT_TEMPLATE;
  var td = container.firstChild;
  console.log(td);
  td.setAttribute('id', key);
  console.log(td);
  td.textContent = text;
  console.log(td);
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
      '<td class="ingred mdl-data-table__cell--non-numeric"></td>' +
    '</tr>';

window.onload = function() {
  window.mealPrepSunday = new MealPrepSunday();
};
