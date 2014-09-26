





// Example usage 
// Assuming an instance of the $ library exists on the page 



// Locate the first <hr> element within the page 
var horizontalRule = document.getElementsByTagName("hr")[0]; 

// Output the current width of the <hr> element 
//alert($.CSS.getAppliedStyle(horizontalRule, "width")); 

// Add the hide CSS class to the <hr> element 
$.CSS.addClass(horizontalRule, "hide"); 

// Remove the hide CSS class from the <hr> element 
$.CSS.removeClass(horizontalRule, "hide"); 

// Outputs true if the hide CSS class exists on the <hr> element 
//alert($.CSS.hasClass(horizontalRule, "hide")); 

// Outputs the x and y coordinates of the <hr> element 
var position = $.CSS.getPosition(horizontalRule) 
//alert("The element is at 'x' position '" + position.x + "' and 'y' position '" + position.y + "'. It also has a width of '" + position.width + "' and a height of '" + position.height + "'");


// Clicking anywhere on the page will output the current coordinates 
// of the mouse pointer 
$.Events.add(document.body, "click", function(e) { 
  //  alert("Mouse clicked at 'x' position " + e.pageX + " and 'y' position "+ e.pageY); 
}); 

// Load the contents of the URL index.html from the root of the web server 
$.Remote.load({ 
    url: "http://localhost/1cms/admin/set_Login.aspx", 
    callback: function(response) { 
        // Get the plain text contents of the file 
        var text = response.text; 
		
        // If the HTML file was written in XHTML format, it would be available 
        // in XML format through the response.xml property 
        var xml = response.xml; 
		
        // Output the contents of the index.html file as plain text 
      //  alert(text); 
    } 
});

// Send some data to a server-side script at the URL process-form.php 
$.Remote.save({ 
    url: "http://localhost/1cms/admin/set_Login.aspx", 
    data: "name=Den&surname=Odell", 
    callback: function(response) { 
        // Output the server-side script's response to the form submission 
       // alert(response.text); 
    } 
}); 


// Combine two object literals 
var creature = { 
    face: 1, 
    arms: 2, 
    legs: 2 
}; 

var animal = { 
    legs: 4, 
    chicken: true 
}; 

// Resulting object literal becomes... 
// { 
//     face: 1, 
//     arms: 2,
//     legs: 4, 
//     chicken: true 
// } 
creature = $.Utils.mergeObjects(creature, animal); 

// Outputs "You have 3 messages waiting in your inbox."; 
$.Utils.replaceText("You have {count} messages waiting in your {folder}.", { 
    count: 3, 
    folder: "inbox" 
}); 

// Outputs "fontFamily" 
//alert($.Utils.toCamelCase("font-family")); 

// Outputs  "font-family" 
//alert($.Utils.toHyphens("fontFamily")); 


// Example usage 
// Assuming an instance of the $ library exists on the page 

// Write a function that computes the factorial of a given number 
// - execute it 99999 times to exaggerate the effect of a slow-running function 
var computeFactorial = function(input) { 
    var result; 
    for (var count = 0; count < 99999; count++) { 
        result = 1; 
        for (var num = 2; num <= input; num++) { 
            result *= num; 
        } 
    } 
    return result; 
} 

// Add memoize capability to the factorial function 
computeFactorial = $.Utils.memoize(computeFactorial); 

// Measure the speed of the factorial function's execution 
computeFactorial(100); // Execution takes ~945 milliseconds 
computeFactorial(50); // Execution takes ~506 milliseconds 
computeFactorial(100); // Execution takes 0-1 milliseconds - using stored value 
computeFactorial(50); // Execution takes 0-1 milliseconds - using stored value 


$.Remote.loadJSONP("my-script.php", function(data) { 
    // Outputs "object" denoting an object literal has been returned 
    alert(typeof data); 
}); 



// Outputs "The DOM is ready!" when the DOM is ready for access 
$.onDomReady(function() { 

   // alert("The DOM is ready!"); 
    
    
// Loads  my-script.js, then outputs "script loaded and available" when complete 
$.Remote.loadScript("my-script.js", function() {
	//alert("script loaded and available!");
});

$.Events.add(document.getElementById("form"),"keypress",function(e){
	if(e.target.className=="numerical")
	{
		if(e.key.match(/[^0-9]/g))
		{
			e.preventDefault();
		}
	}
	
})

}); 