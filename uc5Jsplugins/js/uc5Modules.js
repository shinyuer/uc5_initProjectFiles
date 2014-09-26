var EmailMessage = function(input){ 
    this.from = input.from || ""; 
    this.to = input.to || []; // Array of recipients 
    this.subject = input.subject || ""; 
    this.body = input.body || ""; 
    this.attachments = input.attachments || []; // Array of attachment URLs 
    this.compose = function() {
        // TODO: Bring up an email composition form, populating the object 
        // instance with the data entered 
    }; 
    this.send = function() { 
        // TODO: Send the message data to a server-side mail sender 
        // script using Ajax 
    }; 
    this.remove = function() { 
        // TODO: Delete the message 
    }; 
	
    // If the input attribute is not supplied, force the compose method to fire 
    if (!input) { 
        this.compose(); 
    } 
} 


var Folder = function(input) { 
    this.name = input.name || ""; 
    this.folders = input.folders || []; // Array of instances of the Folder class 
    this.messages = input.messages || []; // Array of EmailMessage instances 
    this.addMessage(message) = function(){
        this.messages.push(message); 
    },
	this.removeMessage(message) = function() { 
        // TODO: Remove the message from the folder 
    },
    this.listMessages = function() { 
        // TODO: Display a list of the messages in this folder 
    } 
}





//var WebMail = new function() { 
//  this.folders = []; 
//  this.loadFolders = function() { 
//      // TODO: Load list of folders via Ajax from the server and populate Folder 
//      // object instances from this information 
//  }; 
//  this.loadMessagesIntoFolders = function() { 
//      // TODO: Load list of messages via Ajax from the server, create EmailMessage 
//      // object instances and populate the folder instances with these messages 
//  }; 
//	
//  // Initialize the data, loading messages into folders, ready for use 
//  this.folders = this.loadFolders(); 
//  this.loadMessagesIntoFolders();
//	 
//	// Initialize the user interface. When the user clicks the create-mail-button 
//  // element, a new EmailMessage is created, which launches the new mail 
//  // composition form automatically 
//   $.Events.add(document.getElementById("create-mail-button"), "click", function() { 
//      new EmailMessage(); 
//  }); 
//}(); 



var WebMail = new function() { 

    // The Model contains only the code needed to store and manipulate the raw 
    // data of the application. Our EmailMessage and Folder classes are therefore 
    // defined within this code, as well as any other data storage and manipulation 
    // code for the application as a whole
	
	var Model = function() { 
        this.EmailMessage = function(input) { 
            // TODO: Insert class definition code for EmailMessage here 
        }; 
		
        this.Folder = function(input) { 
            // TODO: Insert class definition code for Folder here 
        }; 
		
        this.folders = []; 
        this.getMessages = function(folderName) { 
            // TODO: Return a list of messages within the specified folder 
        } 
        this.composeMessage = function() {} 
        this.sendMessage = function(messageId) {} 
        this.deleteMessage = function(messageId) { 
            // TODO: Insert code to delete message with the specified messageId 
        } 
    }; 
	
    // The View contains only the code needed to construct the user interface and to 
    // wire up button events – though it does not specify what code to execute when 
    // those events occur, that is handled by the Controller 
	
    var View = function() { 
	
        // Define the methods to execute when certain events occur – the code for 
        // the methods is passed in from the Controller 
        this.onComposeButtonClick = function() {}; 
        this.onSendButtonClick = function() {}; 
        this.onDeleteMessageButtonClick = function() {}; 
		
		var self = this;
		
        // Wire up the HTML button events on the page 
        $.Events.add(document.getElementById("compose-button"), "click", this.onComposeButtonClick); 
        $.Events.add(document.getElementById("delete-message-2"), "click", function(e) { 
            // Pass a message identifier parameter, defaulted to a value of 2 
            self.onDeleteMessageButtonClick(e, 2); 
        }); 
		
        // Add user interface-specific methods 
        this.showComposeMailForm = function() { 
            // TODO: Show the form to compose a new email
			
			// Wire up a new button, which we want to use to send the new email 
            $.Events.add(document.getElementById("send-button"), "click", function(e) { 
                // Pass an extra message identifier parameter, defaulted to 2 
                self.onSendButtonClick(e, 2); 
            });
        }; 
		
        this.hideComposeMailForm = function() { 
            // TODO: Add code to remove the compose mail form from the page 
        } 
		
        this.updateMessageList = function(messages) { 
            // TODO: Display the list of messages 
        } 
    }
	
    // The Controller contains event-based code and higher level actions, 
    // connecting the Model and the View to create the full application 
	
    var Controller = function(model, view) { 
        var composeEmail = function(e) { 
            // Stop the default button click event from occurring – that would be 
            // for the HTML-only version of the site, which we are overriding 
            e.preventDefault(); 
			
            view.showComposeMailForm(); 
        }; 
		
        var sendEmail = function(e, message) { 
            e.preventDefault(); 
			
            var messageId = new model.EmailMessage(message); 
            model.sendMessage(messageId); 
            view.hideComposeMailForm(); 
        }; 
		
        var deleteMessage = function(e, messageId) { 
            e.preventDefault(); 
			
            model.deleteMessage(); 
            view.updateMessageList(model.getMessages("Inbox")); 
        };
		
		// Connect the user instantiated events in the View to actual code 
        view.onComposeButtonClick = composeEmail; 
        view.onSendButtonClick = sendEmail; 
        view.onDeleteMessageButtonClick = deleteMessage; 
    } 
	
    // Plug the whole MVC structure together 
    new Controller(new Model(), new View()); 
}(); 



















// Example usage on a page 

// Create a new Inbox folder 
var inbox = new Folder({ 
    name: "Inbox" 
}); 

// Create a new message 
var myEmailMessage = new EmailMessage({ 
    from: "me@denodell.com", 
    to: ["test@denodell.com"], 
    subject: "Test message.", 
    body: "This is a test message. Please ignore." 
}); 

// Add the new message to the inbox folder 
inbox.addMessage(myEmailMessage); 


// Example usage on a page 

// Create an object representing a populated email message 
var myEmailMessage = new EmailMessage({ 
    from: "me@denodell.com", 
    to: ["test@denodell.com"], 
    subject: "Test message.", 
    body: "This is a test message. Please ignore." 
    // We don't supply attachments so the default value will be used instead 
}); 

// Create a new empty message, which will force the compose method to fire 
var emptyEmailMessage = new EmailMessage(); 