// Create a new namespace within the $ library for storage-related code 
$.prototype.Storage = {}


// Stores a reference to the technique's code object, set with the initialize method 
$.prototype.Storage.dataStore = null;

// The initialize method selects the technique to use for local data storage. Takes 
// a parameter that specifies the Flash element on the page in order to support 
// Flash Shared Objects. If this parameter is not provided, Flash will not attempt 
// to be used to store the data 
$.prototype.Storage.initialize = function(flashElement) {

	// Work through our order of preference 
	if (window.localStorage) {

		// If local storage API is available, set the dataStore to point to the 
		// local storage API namespace we created earlier 
		this.dataStore = $.Storage.LocalStorage;

	} else if (window.openDatabase) {

		// If the  client-side database API is supported, assign the dataStore to the 
		// DBStorage namespace and initialize it 
		this.dataStore = $.Storage.DBStorage;
		this.dataStore.initialize();

	} else if (window.globalStorage) {

		// If the global storage API is supported, set dataStore to point to the 
		// appropriate namespace 
		this.dataStore = $.Storage.GlobalStorage;
		this.dataStore.initialize();

	} else if (window.ActiveXObject) {

		// If Internet Explorer's userData mechanism is present, 
		// initialize that for use 
		this.dataStore = $.Storage.UserData;
		this.dataStore.initialize();

		//  } else if (flashElement) { 
		//	
		//      // If Flash 8 is supported, set the dataStore to use Flash Shared Objects 
		//      this.dataStore = $.Storage.Flash; 
		//      this.dataStore.initialize(flashElement); 
		//		
	} else {

		// If all else fails, use cookies 
		this.dataStore = $.Storage.Cookies;
	}
};

// The get method retrieves a previously stored value and passes it to the 
// specified callback function. Because the callback technique is used in the 
//  client-side database API, we need to use it throughout 
$.prototype.Storage.get = function(name, callback) {

	// Only one object (client-side database API) actually uses the callback 
	// parameter as part of the data retrieval process. Other namespaces specified 
	// in the dataStore will just ignore it 
	var value = this.dataStore.get(name, callback);

	// If a value is returned (which it isn't with the client-side database API), 
	// execute the callback function, passing it the value found. 
	if (value && callback) {
		callback(value);
	}
};

// The set method stores a value against a specified name 
$.prototype.Storage.set = function(name, value) {

	// All the different techniques accept the same inputs for setting data, so this 
	// universal method is fairly simple 
	this.dataStore.set(name, value);
};

// The remove method permanently deletes data by a specified name 
$.prototype.Storage.remove = function(name) {

	// Each technique accepts the same inputs for removing data 
	this.dataStore.remove(name);
};

//$.Storage.initialize(); 
//
//// Save an email address using whichever technique was selected previously 
//$.Storage.set({ 
//  name: "email", 
//  value: "me@denodell.com" 
//}); 
//
//// Output the "email" value we saved earlier. 
//// After a browser restart, the data will still be there 
//$.Storage.get("email", function(value) { 
//  alert(value); 
//}); 
//
//// Delete the "email" data value permanently 
//$.Storage.remove("email");
//
//// Outputs an empty string since the "email" data no longer exists 
//$.Storage.get("email", function(value) { 
//  alert(value); 
//});






// Create a Cookies namespace for storing cookie-related storage methods 
$.prototype.Storage.Cookies = {

	// The set method sets a cookie on the local machine with the given name 
	// and value 
	set: function(input) {

		// Expect an object literal as an input, with name, value, expiry and 
		// path properties 
		var name = input.name || "";
		var value = input.value || "";

		// If an expiry date is provided, get its value as a string for setting in 
		// the cookie. If no expiry date is provided, default to 10 years ahead 
		var tenYearsAhead = new Date();
		tenYearsAhead.setFullYear(tenYearsAhead.getFullYear() + 10);

		// Use an expiry date provided as an input or default to a date 
		// 10 years in the future 
		var expiry = (input.expiry ? input.expiry.toUTCString() : tenYearsAhead.toUTCString());

		// Default to the site root directory if no path is given 
		var path = input.path || "/";

		// A cookie is set as a specially formatted string. The domain will be 
		// assigned automatically to the current domain of the site being accessed 
		var cookieFormat = "{name}={value}; expires={expiry}; path={path}";

		// Create a new cookie by assigning the formatted string to document.cookie 
		document.cookie = $.Utils.replaceText(cookieFormat, {

			// Use the escape method to ensure nonalphanumeric characters 
			// are encoded and cannot break the resulting formatted cookie string 
			name: escape(name),
			value: escape(value),
			expiry: expiryDate,
			path: path
		});
	},

	// The get method retrieves a previously stored cookie value by name 
	get: function(name) {
		// document.cookie is a string automatically containing all cookies valid 
		// for the current domain and path of the site being accessed 

		// Locate the cookie using a regular expression run against document.cookie 
		var cookieFinder = new RegExp("(^|;) ?" + name + "=([^;]*)(;|$)");
		var cookie = document.cookie.match(cookieFinder);

		var value = "";
		if (cookie) {

			// If a cookie was located, take its value found using the 
			// regular expression 
			value = unescape(cookie[2]);
		}
		return value;
	},

	// The remove method deletes an existing cookie by name 
	remove: function(name) {

		// A cookie is removed by resetting the expiry date to any time 
		// before the present 
		var expiryDate = new Date();

		// Wind back the clock 
		expiryDate.setTime(expiryDate.getTime() - 1);

		// Let the previously defined set method reset the cookie's expiry date, 
		// deleting the cookie 
		this.set({
			name: escape(name),
			expiry: expiryDate
		});
	}
}

//// Create a new cookie which will expire, by default, in 10 years 
//$.Storage.Cookies.set({ 
//  name: "email", 
//  value: "me@denodell.com" 
//}); 
//// Output the value of the cookie named "email" we created earlier. 
//// After a browser restart, the data will still be there 
//alert($.Storage.Cookies.get("email")); 
//
//// Delete the "email" cookie 
//$.Storage.Cookies.remove("email"); 
//
//// Outputs an empty string, since the cookie no longer exists 
//alert($.Storage.Cookies.get("email")); 


// Add a UserData namespace to hold Microsoft  userData-specific methods 
$.prototype.Storage.UserData = {

	// Reference an element to store data within 
	storageElement: null,

	// Data can be stored in different data stores by using different names. We 
	// want all our data to be in one place, so we pick one name and stick with it 
	dataStore: "data-store",

	// Before we can use any data, we need to initialize the DOM element 
	initialize: function() {

		// Data is stored within DOM elements, so let's create one to use 
		this.storageElement = $.Elements.create("span");

		// The behavior attribute is what allows the DOM element to be able to load 
		// and save data to a data store 
		this.storageElement.addBehavior('#default#userdata');

		// We don't want this element to be seen on the page, so hide it 
		this.storageElement.style.display = 'none';

		// Add the new DOM element to the end of the page 
		document.body.appendChild(this.storageElement);

		// Load any previously stored data from the data store, populating the 
		// element's attributes with the data 
		this.storageElement.load(this.dataStore);
	},

	// The set method saves a data value with a given name to the data store 
	set: function(input) {

		// Expect an object literal as an input, containing name and value 
		var name = input.name || "";
		var value = input.value || "";

		// Save the data name and value to the DOM element 
		this.storageElement.setAttribute(name, value);

		// Commit the current data from the DOM element to the data store 
		this.storageElement.save(this.dataStore);
	},

	// The get method returns a previously stored value from the data store from a 
	// given property name 
	get: function(name) {

		// Return the attribute value of the given name, or an empty string 
		// if it does not exist 
		return this.storageElement.getAttribute(name) || "";
	},

	// The remove method permanently removes the data name and associated 
	// value from the data store 
	remove: function(name) {

		// Remove the attribute of the given name from the DOM element used for 
		// storing the data within 
		this.storageElement.removeAttribute(name);

		// Commit the changes made to the data store so the specified data is 
		// permanently removed 
		this.storageElement.save(this.dataStore);
	}
}


// Initialize the userData store 
//$.Storage.UserData.initialize(); 
//
//// Save an email address to the data store 
//$.Storage.UserData.set({ 
//  name: "email", 
//  value: "me@denodell.com" 
//}); 
//
//// Output the "email" value we created earlier. 
//// After a browser restart, the data will still be there 
//alert($.Storage.UserData.get("email")); 
//
//// Delete the "email" data value permanently from the data store 
//$.Storage.UserData.remove("email"); 
//
//// Outputs an empty string since the data no longer exists 
//alert($.Storage.UserData.get("email"));

// Add a LocalStorage namespace to keep local storage API code together 
$.prototype.Storage.LocalStorage = {

	// The set method stores a value with a given name using the local storage API 
	set: function(input) {

		// Expect an object literal as an input, containing name and value to set 
		var name = input.name || "";
		var value = input.value || "";

		// Save the data using the  top-level localStorage object 
		localStorage.setItem(name, value);
	},

	// The get method retrieves a previously stored value by name 
	get: function(name) {

		// Return an empty string if the item requested does not exist, otherwise 
		// fetch the value from the localStorage object 
		return localStorage.getItem(name) || "";
	},

	// The remove method deletes a previously stored value from the 
	// localStorage object 
	remove: function(name) {

		// Remove the item from localStorage 
		localStorage.removeItem(name);
	}
}

// Add a GlobalStorage namespace to contain all global storage  API-related 
// methods 
$.prototype.Storage.GlobalStorage = {
	dataStore: null,

	// The initialize method locates the data store to use if the global storage API 
	// is supported in the browser 
	initialize: function() {

		// The data store itself is an index of the globalStorage array, where the 
		// index is always the name of the domain of the current site 
		if (globalStorage) {
			this.dataStore = globalStorage[location.host];
		}
	},

	// The set method stores a value with a given name in the global storage API 
	set: function(input) {
		// Expect an object literal as an input, containing name and value to set 
		var name = input.name || "";
		var value = input.value || "";

		// Save the data using our data store provided by globalStorage 
		this.dataStore.setItem(name, value);
	},

	// The get method retrieves a previously stored value by name 
	get: function(name) {

		// Return an empty string if the item requested does not exist, otherwise 
		// locate it from the data store 
		return this.dataStore.getItem(name) || "";
	},

	// The remove method permanently deletes a previously stored value by name 
	// from the data store 
	remove: function(name) {

		// Remove the item from the data store using the global storage API's 
		// removeItem method 
		this.dataStore.removeItem(name);
	}
}

// Add a DBStorage namespace to contain all  client-side database storage-related 
// methods 
$.prototype.Storage.DBStorage = {

	// There can be multiple databases in each domain, but for this example we'll 
	// define a single one to use throughout the application 
	databaseName: "data_store",
	databaseDesc: "Data store",

	// Specify which SQLite database version we are using, in case future versions 
	// alter methods 
	sqlLiteDBVersion: "1.0",

	// 5MB of storage = 5120 bytes. This is the maximum default size of the 
	// SQLite database 
	FIVE_MB: 5120,

	// Define a database table name for storing our data 
	tableName: "data-store",

	// Define a property to store a reference to the database 
	database: null,

	// The initialize method creates the table in the database to store our name and 
	// value data in, if it does not already exist. The name becomes the primary key 
	initialize: function() {

		// Open the SQLite database 
		this.database = openDatabase(this.databaseName, this.sqlLiteDBVersion, this.databaseDesc, this.FIVE_MB);

		// Construct the SQL command to create a table in the database 
		var command = "CREATE TABLE IF NOT EXISTS {tableName} (name TEXT UNIQUE NOT NULL PRIMARY KEY, value TEXT NOT NULL)";
		command = $.Utils.replaceText(command, {
			tableName: this.tableName
		});

		// Execute the SQL command 
		this.execute(command);
	},

	// The execute method executes a given SQL command against the database, 
	// executing an optional callback function on the command's completion, 
	// passing across the result of the transaction against the database to that 
	// callback function 
	execute: function(command, callback) {
		callback = callback || function() {};

		// Execute the supplied SQL command, then execute the callback function 
		this.database.transaction(function(db) {
			db.executeSql(command, [], callback);
		});
	},

	// The get method performs a lookup against the database for the name key and 
	// passes the value it finds, if any, into the supplied callback function 
	get: function(name, callback) {

		// Generate the command to locate a value from the database by name 
		var command = "SELECT value FROM {tableName} WHERE name = {name}";
		command = $.Utils.replaceText(command, {
			tableName: this.tableName,
			name: name
		});

		// Execute the SQL command 
		this.execute(command, function(db, result) {
			var value = "";

			// Locate the value within the first row of the SQL data returned 
			if (result.rows.length > 0) {
				value = result.rows.item(0)['value'];
			}

			// Execute the callback method, passing it the value found, if any 
			callback(value);

			// Return a null value in case any calling method is expecting a 
			// return value from this method - no code should expect this, but 
			// just in case, we provide a return value here 
			return null;
		});
	},

	// The set method stores a value by name into the database 
	set: function(input) {

		// Expect an object literal as an input, containing name and value to set 
		var name = input.name || "";
		var value = input.value || "";

		var self = this;

		// Check to see if a value already exists by this name in the database 
		this.get(name, function(value) {

			// By default, we will insert the value into the database, so specify 
			// the command to do that 
			var command = "INSERT INTO {tableName} (name, value) VALUES ({name} , {value})";

			// If a value already exists against this name in the database, perform 
			// a SQL update command instead 
			if (value != "") {
				command = "UPDATE {tableName} SET value = {value} WHERE  name = {name}";
			}

			command = $.Utils.replaceText(command, {
				tableName: self.tableName,
				name: name,
				value: value
			});

			// Execute the SQL command, saving the data into the database 
			this.execute(command);
		});
	},

	// The remove method deletes the name and value from the database 
	remove: function(name) {

		// Generate the SQL command to remove the value from the database 
		var command = "DELETE FROM {tableName} WHERE name = {name}";
		command = $.Utils.replaceText(command, {
			tableName: this.tableName,
			name: name
		});

		// Execute the command, removing the entry from the database 
		this.execute(command);
	}
}

//// Initialize the client-side database 
//$.Storage.DBStorage.initialize(); 
//
//// Save an email address 
//$.Storage.DBStorage.set({ 
//  name: "email", 
//  value: "me@denodell.com" 
//}); 
//
//// Output the "email" value we created earlier. 
//// After a browser restart, the data will still be there 
//$.Storage.DBStorage.get("email", function(value) { 
//  alert(value); 
//}); 
//
//// Delete the "email" data value permanently 
//$.Storage.DBStorage.remove("email"); 
//
//// Outputs an empty string since the "email" data no longer exists 
//$.Storage.DBStorage.get("email", function(value) { 
//  alert(value); 
//});