Make a single page app, without dependencies, that does the following:
- show a list of messages - Done
- allow the user to add a message to the list
- add messages that are added by others to the list
- when a message is clicked, the message is shown in an in-page popup (the list stays visible in the back) - Done. Css later
- every message will have his own url (hash) - Done

As the basis for the app, you can (should) take the supplied HTML/coffee/Makefile. The data source is faked, so you don't need a back-end (this means a page reload will 'reset the database'). You can use the following methods, which are documented in the coffee-source:
- `getMessages`
- `getMessage`
- `postMessage`
- `addMessageListener`
- `removeMessageListener`

Some other points:
- the language used is coffeescript
- I've set up some html/css to give an idea, but this may be changed (but not to make it easier); for example you may use web components
- the code isn't 100% tested, so if you encounter problems, let me know
