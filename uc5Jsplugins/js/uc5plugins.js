var $ = function() {};

$.prototype.onDomReady = function(callback) { // callback should be a function 
	if (document.addEventListener) {
		// If the browser supports the DOMContentLoaded event, 
		// assign the callback function to execute when that event fires 
		document.addEventListener("DOMContentLoaded", callback, false);
	} else {
		if (document.body && document.body.lastChild) {
			// If the DOM is available for access, execute the callback function 
			callback();
		} else {
			// Reexecute the current function, denoted by arguments.callee, 
			// after waiting a brief nanosecond so as not to lock up the browser 
			return setTimeout(arguments.callee, 0);
		}
	}
}


$.prototype.Observer = function() {
	// Create an array to store the events 
	this.events = [];

	// The listen method listens for an event of a specific name to fire, assigning 
	// a method to execute when it does 
	this.listen = function(eventName, method) {
		if (typeof method == "function") {
			if (!this.events[eventName]) {
				this.events[eventName] = []
			}
			this.events[eventName].push(method);
		}
	};

	// The fire method fires an event of a specific name, executing all methods 
	// that have been associated with that event in turn, passing in any optional 
	// parameters that have been sent along with the request to fire 
	this.fire = function(eventName, params, scope) {
		scope = scope || window;
		for (var methodIndex = 0; methodIndex < this.events[eventName].length; methodIndex++) {
			this.events[eventName][methodIndex].call(scope, params);
		}
	}
}



// Add a new namespace to the $ library to hold all event-related code, 
// using an object literal notation to add multiple methods at once 
$.prototype.Events = {
	// The add method allows us to assign a function to execute when an 
	// event of a specified type occurs on a specific element

	add: function(element, eventType, callback) {
		// Store the current value of this to use within subfunctions 
		var self = this;
		eventType = eventType.toLowerCase();
		console.log(element);
		if (element.addEventListener) {
			// If the W3C event listener method is available, use that 
			element.addEventListener(eventType, function(e) {
				// Execute callback function, passing it a standardized version of 
				// the event object, e. The standardize method is defined later 
				callback(self.standardize(e));
			}, false);
		} else if (element.attachEvent) {
			// Otherwise use the Internet Explorer-proprietary event handler 
			element.attachEvent("on" + eventType, function() {
				// IE uses window.event to store the current event's properties 
				callback(self.standardize(window.event));
			});
		}
	},

	// The remove method allows us to remove previously assigned code 
	// from an event 
	remove: function(element, eventType, callback) {
		eventType = eventType.toLowerCase();
		if (element.removeEventListener) {
			// If the W3C-specified method is available, use that 
			element.removeEventListener(element, eventType, callback);
		} else if (element.detachEvent) {
			// Otherwise, use the Internet Explorer-specific method 
			element.detachEvent("on" + eventType, callback);
		}
	},

	// The standardize method produces a unified set of event 
	// properties, regardless of the browser 
	standardize: function(event) {

		// These two methods, defined later, return the current position of the 
		// mouse pointer, relative to the document as a whole, and relative to the 
		// element the event occurred within 
		var page = this.getMousePositionRelativeToDocument(event);
		var offset = this.getMousePositionOffset(event);

		// Let's stop events from firing on element nodes above the current 
		if (event.stopPropagation) {
			event.stopPropagation();
		} else {
			event.cancelBubble = true;
		}
		// We return an object literal containing seven properties and one method 
		return {
			// The target is the element the event occurred on 
			target: this.getTarget(event),
			// The relatedTarget is the element the event was listening for, 
			// which can be different from the target if the event occurred on an 
			// element located within the relatedTarget element in the DOM 
			relatedTarget: this.getRelatedTarget(event),
			// If the event was a  keyboard-related one, key returns the character 
			key: this.getCharacterFromKey(event),
			// Return the x and y coordinates of the mouse pointer, 
			// relative to the document 
			pageX: page.x,
			pageY: page.y,
			// Return the x and y coordinates of the mouse pointer, 
			// relative to the element the current event occurred on 
			offsetX: offset.x,
			offsetY: offset.y,
			// The preventDefault method stops the default event of the element 
			// we're acting upon from occurring. If we were listening for click 
			// events on a hyperlink, for example, this method would stop the 
			// link from being followed 
			preventDefault: function() {
				if (event.preventDefault) {
					event.preventDefault(); // W3C method 
				} else {
					event.returnValue = false; // Internet Explorer method 
				}
			}
		};
	},

	// The getTarget method locates the element the event occurred on
	getTarget: function(event) {
		// Internet Explorer value is srcElement, W3C value is target 
		var target = event.srcElement || event.target;
		// Fix legacy Safari bug which reports events occurring on a text 
		// node instead of an element node 
		if (target.nodeType == 3) { // 3 denotes a text node 
			target = target.parentNode; // Get parent node of text node 
		}
		// Return the element node the event occurred on 
		return target;
	},

	// The getCharacterFromKey method returns the character pressed when 
	// keyboard events occur. You should use the keypress event 
	// as others vary in reliability 
	getCharacterFromKey: function(event) {
		var character = "";
		if (event.keyCode) { // Internet Explorer 
			character = String.fromCharCode(event.keyCode);
		} else if (event.which) { // W3C 
			character = String.fromCharCode(event.which);
		}
		return character;
	},

	// The getMousePositionRelativeToDocument method returns the current 
	// mouse pointer position relative to the top left edge of the current page 
	getMousePositionRelativeToDocument: function(event) {
		var x = 0,
			y = 0;
		if (event.pageX) {
			// pageX gets coordinates of pointer from left of entire document 
			x = event.pageX;
			y = event.pageY;
		} else if (event.clientX) {
			// clientX gets coordinates from left of current viewable area 
			// so we have to add the distance the page has scrolled onto this value 
			x = event.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
			y = event.clientY + document.body.scrollTop + document.documentElement.scrollTop;
		}

		// Return an object literal containing the x and y mouse coordinates 
		return {
			x: x,
			y: y
		}
	},

	// The getMousePositionOffset method returns the distance of the mouse 
	// pointer from the top left of the element the event occurred on 
	getMousePositionOffset: function(event) {
		var x = 0,
			y = 0;
		if (event.layerX) {
			x = event.layerX;
			y = event.layerY;
		} else if (event.offsetX) {
			// Internet Explorer-proprietary 
			x = event.offsetX;
			y = event.offsetY;
		}

		// Returns an object literal containing the x and y coordinates of the 
		// mouse relative to the element the event fired on 
		return {
			x: x,
			y: y
		}
	},

	// The getRelatedTarget method returns the element node the event was set up to 
	// fire on, which can be different from the element the event actually fired on 
	getRelatedTarget: function(event) {
		var relatedTarget = event.relatedTarget;
		if (event.type == "mouseover") {
			// With mouseover events, relatedTarget is not set by default 
			relatedTarget = event.fromElement;
		} else if (event.type == "mouseout") {
			// With mouseout events, relatedTarget is not set by default 
			relatedTarget = event.toElement;
		}
		return relatedTarget;
	}
};



$.prototype.Remote = {

	// The getConnector method returns the base object for performing 
	// dynamic browser-server communication through JavaScript 

	getConnector: function() {
		var connectionObject = null;
		if (window.XMLHttpRequest) {
			// If the W3C-supported request object is available, use that 
			connectionObject = new XMLHttpRequest();
		} else if (window.ActiveXObject) {
			// Otherwise, if the IE-proprietary object is available, use that 
			connectionObject = new ActiveXObject('Microsoft.XMLHTTP');
		}

		// Both objects contain virtually identical properties and methods 
		// so it's just a case of returning the correct one that's supported 
		// within the current browser 
		return connectionObject;
	},

	// The configureConnector method defines what should happen while the 
	// request is taking place, and ensures that a callback  method is executed 
	// when the response is successfully received from the server 

	configureConnector: function(connector, callback) {
		// The readystatechange event fires at different points in the life cycle 
		// of the request, when loading starts, while it is continuing and 
		// again when it ends 
		connector.onreadystatechange = function() {

			// If the current state of the request informs us that the 
			// current request has completed 
			if (connector.readyState == 4) {

				// Ensure the HTTP status denotes successful download of content 
				if (connector.status == 200) {

					// Execute the callback method, passing it an object 
					// literal containing two properties, the raw text of the
					// downloaded content and the same content in XML format, 
					// if the content requested was able to be parsed as XML. 
					// We also set its owner to be the connector in case this 
					// object is required in the callback function 

					callback.call(connector, {
						text: connector.responseText,
						xml: connector.responseXML
					});
				}
			}
		}
	},

	// The load method takes an object literal containing a URL to load and a method 
	// to execute once the content has been downloaded from that URL. Since the 
	// Ajax technique is asynchronous, the rest of the code does not wait for the 
	// content to finish downloading before continuing, hence the need to pass in 
	// the method to execute once the content has downloaded in the background. 

	load: function(request) {
		// Take the url from the request object literal input, 
		// or use an empty string value if it doesn't exist 
		var url = request.url || "";

		// Take the callback method from the request input object literal, 
		// or use an empty function if it is not supplied 
		var callback = request.callback || function() {};

		// Get our cross-browser connection object 
		var connector = this.getConnector();

		if (connector) {
			// Configure the connector to execute the callback method once the 
			// content has been successfully downloaded 
			this.configureConnector(connector, callback);

			// Now actually make the request for the contents found at the URL 
			connector.open("GET", url, true);
			connector.send("");
		}
	},

	// The save method performs an HTTP POST action, effectively sending content, 
	// such as a form's field values, to a server-side script for processing

	save: function(request) {
		var url = request.url || "";
		var callback = request.callback || function() {};

		// The data variable is a string of URL-encoded name-value pairs to send to 
		// the server in the following format: 
		// "parameter1=value1&parameter2=value2&..." 
		var data = request.data || "";

		var connector = this.getConnector();
		if (connector) {
			this.configureConnector(connector, callback);

			// Now actually send the data to script found at the URL 
			connector.open("POST", url, true);
			// connector.setRequestHeader("Content type", "application/x-www-form-urlencoded"); 
			connector.setRequestHeader("Content-length", data.length);
			connector.setRequestHeader("Connection", "close");
			connector.send(data);
		}
	},
	loadScript: function(fileName, callback) {
		var scriptTag = document.createElement("script");
		scriptTag.src = fileName;

		if (callback) {
			scriptTag.onload = callback;
			scriptTag.onreadystatechange = function() {
				if (scriptTag.readyState == 4) {
					callback();
				}
			}
		}
		document.getElementsByTagName("head")[0].appendChild(scriptTag);
	},
	loadJSONP: function(url, callback) {
		// The callback function needs to exist within the global window object 
		window.tempFunction = callback;

		// Append the jsonp=tempFunction query string parameter to the URL. 
		// The server should wrap the returned JSON data in a call to the function 
		// of the name specified in this parameter, so it is executed when 
		// the data is returned 
		url = url.contains("?") ? url + "&jsonp=tempFunction" : "?jsonp=tempFunction";

		// Call the existing loadScript method to place the <script> tag on the page 
		this.loadScript(url);
	}

}




// The loadJSONP method mimics the existing loadScript method but allows 
// the returned JSON data to be available to the callback method as an input. 
// Add this method to our $ JavaScript library code. 
//$.Remote.loadJSONP("my-script.php", function(data) { 
//  alert(typeof data); 
//}); 


$.prototype.Utils = {

	// The mergeObjects method copies all the property values of one object 
	// literal into another, replacing any properties that already exist, and 
	// adding any that don't 

	mergeObjects: function(original, newObject) {
		for (var key in newObject) {
			// for ... in ... loops expose unwanted properties such as prototype 
			// and constructor, among others. Using the hasOwnProperty 
			// native method allows us to only allow real properties to pass
			if (newObject.hasOwnProperty(key)) {
				// Loop through every item in the new object literal, 
				// getting the value of that item in the original object and 
				// the equivalent value in the original object, if it exists 
				var newPropertyValue = newObject[key];
				var originalPropertyValue = original[key];
			}

			// Set the value in the original object to the equivalent value from the 
			// new object, except if the property's value is an object type, in 
			// which case call this method again recursively, in order to copy every 
			// value within that object literal also 
			original[key] = (originalPropertyValue && typeof newPropertyValue == 'object' && typeof originalPropertyValue == 'object') ? this.mergeObjects(originalPropertyValue, newPropertyValue) : newPropertyValue;
		}

		// Return the original object, with all properties copied over from 
		// the new object 
		return original;
	},

	// The replaceText method takes a text string containing placeholder values and 
	// replaces those placeholders with actual values passed in through the values 
	// object literal. 
	// For example: "You have {count} messages in the {folderName} folder" 
	// Each placeholder, marked with braces – { } – will be replaced with the 
	// actual value from the values object literal, the properties count and 
	// folderName will be sought in this case 

	replaceText: function(text, values) {
		for (var key in values) {
			if (values.hasOwnProperty(key)) {
				// Loop through all properties in the value object literal 
				if (typeof values[key] == undefined) { // Code defensively 
					values[key] = "";
				}

				// Replace the property name wrapped in braces from the text 
				// string with the actual value of that property. The regular 
				// expression ensures that multiple occurrences are replaced 
				text = text.replace(new RegExp("{" + key + "}", "g"), values[key]);
			}
		}

		// Return the text with all placeholder values replaced with real ones 
		return text;
	},

	// The toCamelCase method takes a hyphenated value and converts it into 
	// a camel case equivalent, e.g.,  margin-left becomes marginLeft. Hyphens 
	// are removed, and each word after the first begins with a capital letter 

	toCamelCase: function(hyphenatedValue) {
		var result = hyphenatedValue.replace(/-\D/g, function(character) {
			return character.charAt(1).toUpperCase();
		});
		return result;
	},

	// The toHyphens method performs the opposite conversion, taking a camel 
	// case string and converting it into a hyphenated one. 
	// e.g., marginLeft becomes  margin-left 

	toHyphens: function(camelCaseValue) {
		var result = camelCaseValue.replace(/[A-Z]/g, function(character) {
			return ('-' + character.charAt(0).toLowerCase());
		});
		return result;
	},
	memoize: function(func) {
		return function() {
			// Add a memory object property to this function, if it does not exist 
			func.memory = func.memory || {};

			// Create a key to use to store and retrieve function results within 
			// the memory object property. The key should be based on a combination 
			// of all the arguments passed to the function to ensure it is unique based 
			// on all combinations of inputs 
			arguments.join = Array.prototype.join;
			var key = arguments.join("|");

			// Does the key exist in the memory object? 
			if (key in func.memory) {
				// If it does, then return the associated value to avoid recomputation 
				return func.memory[key];
			} else {
				// If it doesn't, execute the associated function then save the result 
				// to the memory object 
				func.memory[key] = func.apply(this, arguments);

				// Return the newly saved value, the result of the function's execution 
				return func.memory[key];
			}
		}
	},
	// Add the padZero method to the Utils namespace. This method returns the string 
	// form of a number passed to it. If the number is less than 10, an extra 0 is 
	// to added beginning of the resulting string 
	padZero: function(number) {
		return (number < 10 ? "0" : "") + number.toString();
	}

};

// memoize expects a function as an input and returns the same function 
// with storage capabilities added 





$.prototype.CSS = {

	// The getAppliedStyle method returns the current value of a specific 
	// CSS style property on a particular element 

	getAppliedStyle: function(element, styleName) {
		var style = "";
		if (window.getComputedStyle) {
			//  W3C-specific method. Expects a style property with hyphens 
			style = element.ownerDocument.defaultView.getComputedStyle(element, null).getPropertyValue($.Utils.toHyphens(styleName));
		} else if (element.currentStyle) {
			// Internet Explorer-specific method. Expects style property names 
			// in camel case 
			style = element.currentStyle[$.Utils.toCamelCase(styleName)];
		}

		// Return the value of the style property found 
		return style;
	},

	// The getArrayOfClassNames method is a utility method which returns an 
	// array of all the CSS class names assigned to a particular element. 
	// Multiple class names are separated by a space character 

	getArrayOfClassNames: function(element) {
		var classNames = [];
		if (element.className) {
			// If the element has a CSS class specified, create an array 
			classNames = element.className.split(' ');
		}
		return classNames;
	},

	// The addClass method adds a new CSS class of a given name to a 
	// particular element 

	addClass: function(element, className) {
		// Get a list of the current CSS class names applied to the element 
		var classNames = this.getArrayOfClassNames(element);

		// Add the new class name to the list 
		classNames.push(className);

		// Convert the list in space-separated string and assign to the element 
		element.className = classNames.join(' ');
	},

	// The removeClass method removes a given CSS class name from 
	// a given element 

	removeClass: function(element, className) {
		var classNames = this.getArrayOfClassNames(element);

		// Create a new array for storing all the final CSS class names in 
		var resultingClassNames = [];

		for (var index = 0; index < classNames.length; index++) {
			// Loop through every class name in the list 
			if (className != classNames[index]) {
				// Add the class name to the new list if it isn't the one specified 
				resultingClassNames.push(classNames[index]);
			}
		}

		// Convert the new list into a  space-separated string and assign it 
		element.className = resultingClassNames.join(" ");
	},

	// The hasClass method returns true if a given class name exists on a 
	// specific element, false otherwise 

	hasClass: function(element, className) {
		// Assume by default that the class name is not applied to the element 
		var isClassNamePresent = false;

		var classNames = this.getArrayOfClassNames(element);
		for (var index = 0; index < classNames.length; index++) {
			// Loop through each CSS class name applied to this element 
			if (className == classNames[index]) {
				// If the specific class name is found, set the return value to true 
				isClassNamePresent = true;
			}
		}

		// Return true or false, depending on if the specified class name was found 
		return isClassNamePresent;
	},

	// The getPosition method returns the x and y coordinates of the  top-left 
	// position of a page element within the current page, along with the 
	// current width and height of that element 

	getPosition: function(element) {
		var x = 0,
			y = 0;
		var elementBackup = element;
		if (element.offsetParent) {
			// The offsetLeft and offsetTop properties get the position of the 
			// element with respect to its parent node. To get the position with 
			// respect to the page itself, we need to go up the tree, adding the 
			// offsets together each time until we reach the node at the top of 
			// the document, by which point, we'll have coordinates for the 
			// position of the element in the page 
			do {
				x += element.offsetLeft;
				y += element.offsetTop;

				// Deliberately using = to force the loop to execute on the next 
				// parent node in the page hierarchy 
			} while (element = element.offsetParent)
		}

		// Return an object literal with the x and y coordinates of the element, 
		// along with the actual width and height of the element 
		return {
			x: x,
			y: y,
			height: elementBackup == null ? 1 : elementBackup.offsetHeight,
			width: elementBackup == null ? 1 : elementBackup.offsetWidth
		}
	}
};


// Add a new Elements namespace to the $ library 

$.prototype.Elements = {

	// The getElementsByClassName method returns an array of DOM elements 
	// which all have the same given CSS class name applied. To improve the speed 
	// of the method, an optional contextElement can be supplied which restricts the 
	// search to only those child nodes within that element in the node hierarchy 

	getElementsByClassName: function(className, contextElement) {
		var allElements = null;
		if (contextElement) {
			// Get an array of all elements within the contextElement 
			// The * wildcard value returns all tags 
			allElements = contextElement.getElementsByTagName("*");
		} else {
			// Get an array of all elements, if no contextElement was supplied 
			allElements = document.getElementsByTagName("*");
		}

		var results = [];
		for (var elementIndex = 0; elementIndex < allElements.length; elementIndex++) {
			// Loop through every element found 
			var element = allElements[elementIndex];

			// If the element has the specified class, add that element to 
			// the output array 
			if ($.CSS.hasClass(element, className)) {
				results.push(element);
			}
		}

		// Return the list of elements that contain the specific CSS class name 
		return results;
	},
	create: function(tagName) {
		// This method utilizes the memoizer technique 
		this.memory = this.memory || {};
		if (tagName in this.memory) {
			// If we have stored an element of this tag name already, duplicate it 
			return this.memory[tagName].cloneNode(true);
		} else {
			// Create a new element of the tag name and store it 
			this.memory[tagName] = document.createElement(tagName);
			return this.memory[tagName].cloneNode(true);
		}
	}
}




// Create a new namespace called Date for holding all date-specific utility methods 
$.prototype.Date = {

	// The copy method duplicates a Date object and returns the copy. Typically, 
	// Dates are passed around in JavaScript as references to a single object, so 
	// normal variable copying is not possible - each copy would always point as 
	// a reference to the same object. This method creates a new Date object, 
	// taking the exact date and time from the existing object 
	copy: function(date) {
		var newDate = new Date();
		newDate.setTime(date.valueOf());
		return newDate;
	},

	// The add method takes an existing Date object and adds a specified number of 
	// days, months and years to that object, returning the resulting Date object 
	add: function(date, options) {
		// The options object literal contains three properties - day, month and 
		// year - representing the number of each to add to the input Date object 
		var daysToAdd = options.day || 0;
		var monthsToAdd = options.month || 0;
		var yearsToAdd = options.year || 0;

		// Create a new Date object and add the days, months and years 
		// specified to it 
		var date = this.copy(date);
		var initialDay = date.getDate();
		var initialMonth = date.getMonth();
		var initialYear = date.getFullYear();
		date.setFullYear(initialYear + yearsToAdd);
		date.setMonth(initialMonth + monthsToAdd);
		date.setDate(initialDay + daysToAdd);

		// Return the resulting Date object 
		return date;
	},

	// The matchDay method returns true if the two Date objects passed to it have 
	// the same day number - i.e., inputs of 28 May and 28 June would return true 
	// since the day number is the same for each 
	matchDay: function(date1, date2) {
		return date1.getDate() == date2.getDate();
	},

	// The matchMonth method returns true if both Date objects passed to it occur 
	// within the same month and same year as each other 
	matchMonth: function(date1, date2) {
		return ((date1.getMonth() == date2.getMonth()) && (date1.getFullYear() == date2.getFullYear()));
	},

	// The match method returns true or false depending on whether the two Date 
	// objects input represent identical dates 
	match: function(date1, date2) {
		return this.matchDay(date1, date2) && this.matchMonth(date1, date2);
	},

	// The format method returns a date as a user-friendly formatted string 
	format: function(date, formatDefinition, dayName, monthName) {
		var d = date.getDate(); // Single or double digit day 
		var dd = $.Utils.padZero(d); // Double digit day 
		var dddd = dayName; // Day name 
		var ddd = dddd.substr(0, 3); // Short day name 
		var m = date.getMonth(); // Single or double digit month 
		var mm = $.Utils.padZero(m); // Double digit month 
		var mmmm = monthName; // Full month name 
		var mmm = mmmm.substr(0, 3); // Short month name 
		var yy = $.Utils.padZero(date.getYear()); // Two digit year 
		var yyyy = date.getFullYear(); // Four digit year 
		var tttt = date.getTime(); // Date represented as time

		return $.Utils.replaceText(formatDefinition, {
			d: d,
			dd: dd,
			ddd: ddd,
			dddd: dddd,
			m: m,
			mm: mm,
			mmm: mmm,
			mmmm: mmmm,
			yy: yy,
			yyyy: yyyy,
			tttt: tttt
		})
	},

	// The getStartOfFirstWeekInMonthSquare method returns the Date object 
	// representing the first day of a month square. This is usually the day before 
	// the first of the month, which occurs on a Sunday in JavaScript, allowing a 
	// calendar to display dates that fit into a neat date square, including dates 
	// that occur in the previous month 
	getStartOfFirstWeekInMonthSquare: function(date) {
		date = this.copy(date);
		date.setDate(1); // First day in month 
		date.setDate(1 - date.getDay()); // Go back to Sunday at start of week 
		return date;
	},

	// The getEndOfWeekInMonthSquare method returns the last date that would fit 
	// into a neat month square around the month represented in the date 
	// input parameter 
	getEndOfWeekInMonthSquare: function(date, weeksInSquare) {
		var DAYS_IN_WEEK = 7;

		date = this.copy(date);
		date.setDate(1);
		date = this.add(date, {
			month: 1
		});

		// Go back to the last day of the month 
		date.setDate(date.getDate() - 1);

		// Look forward to last day of month square 
		var numberOfDaysToEndOfWeek = (DAYS_IN_WEEK - 1) - date.getDay();
		date = this.add(date, {
			day: numberOfDaysToEndOfWeek
		});

		return date;
	}
}

// Example usage 
// Assuming an instance of the $ library exists on the page 
// Create two elements from scratch 
//var newH2Tag = $.Elements.create("h2"); 
//var newPTag = $.Elements.create("p"); 
//
//// Create another element of the same type as one already created. 
//// Duplicates the stored element, boosting performance over creating 
//// the element from scratch again 
//var anotherH2Tag = $.Elements.create("h2"); // Uses a duplicate


// Instantiate the library as a singleton for use on a page 
$ = new $();