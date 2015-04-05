class DataSource

  constructor: ->
    @_messageDocs = {}
    @_messageListeners = []
    @_initializeMessages()
    @_randomlyPostMessages()

  _initializeMessages: ->
    [0...100].forEach (i) =>
      key = @_getRandomKey()
      @_messageDocs[key] =
        id: key
        timestamp: new Date(2015, 2, 30, 0, i).toISOString()
        message: @_getRandomMessage()

  _getRandomKey: ->
    chars = '1234567890abcdef'
    [0...20].map(-> chars[Math.floor(16 * Math.random())]).join('')

  _getRandomMessage: ->
    chars = 'abcdefghijklmnopqrstuvwxyz  '
    [0...80].map(-> chars[Math.floor(28 * Math.random())]).join('')

  _randomlyPostMessages: ->
    postMessage = =>
      if Math.random() < .3 then @postMessage @_getRandomMessage()
    setInterval postMessage, 5000

  # A method that fakes getting messages from a server, and calling a callback
  # when it's ready. Use like:
  #
  #     @getMessages (messageDocs) ->
  #       console.log messageDocs
  #
  # The `messageDocs` argument looks like this:
  #
  #     [
  #       {
  #         "id": "some-string",
  #         "timestamp": "2015-03-30T18:35:35.160Z",
  #         "message": "blablabla"
  #       },
  #       {
  #         "id": "some-other-string",
  #         "timestamp": "2015-03-30T18:36:28.127Z",
  #         "message": "another message"
  #       }
  #     ]
  getMessages: (cb) ->
    result = Object.keys(@_messageDocs).map (key) =>
        @_messageDocs[key]
      .sort (doc1, doc2) ->
        if doc1.timestamp < doc2.timestamp then -1
        else if doc1.timestamp > doc2.timestamp then 1
        else 0
    setTimeout (-> cb result), 3000

  # A method that fakes getting a message from a server, and calling a callback
  # when it's ready. Use like:
  #
  #     @getMessage key, (messageDoc) ->
  #       console.log messageDoc
  #
  # The `messageDoc` argument looks like this:
  #
  #     {
  #       "id": "some-string",
  #       "timestamp": "2015-03-30T18:35:35.160Z",
  #       "message": "blablabla"
  #     }
  getMessage: (key, cb) ->
    setTimeout (=> cb @_messageDocs[key]), 1000

  # A method that fakes saving messages to a server, and calling a callback
  # when it's ready. Use like:
  #
  #     @postMessage 'this is a message', ->
  #       console.log 'message saved'
  postMessage: (message, cb) ->
    onReady = =>
      console.log 'onReady was called'
      key = @_getRandomKey()
      messageDoc =
        id: key
        timestamp: new Date().toISOString()
        message: message
      @_messageDocs[key] = messageDoc
      cb?()
      @_messageListeners.forEach (listener) -> listener messageDoc
    setTimeout onReady, 500

  # The callback argument is called whenever a message is added. Use like:
  #
  #     @addMessageListener (doc) ->
  #       console.log 'a message was added:', doc.message
  addMessageListener: (cb) ->
    if @_messageListeners.indexOf(cb) == -1
      @_messageListeners.push cb

  # Remove callbacks.
  removeMessageListener: (cb) ->
    i = @_messageListeners.indexOf cb
    if i != -1
      @_messageListeners.splice i, 1


class App

  constructor: ->
    @dataSource = new DataSource
    @msgs = []
    window.addEventListener 'hashchange', @onHashChange
    document.querySelector('form').addEventListener 'submit', @onSubmitForm
    that=this
    # This method does
    #   1. listens to new message
    #   2. Add the new message to array
    #   3. Prepend the new message in DOM

    @dataSource.addMessageListener (doc) ->
      #1
      console.log 'a message was added:', doc.message
      #2
      that.msgs.push doc
      #3
      listNode = document.querySelector('.message-list')
      msgsNodes = document.querySelectorAll('.message-list message-card')
      firstNode = msgsNodes[0]
      newMsgEl = document.createElement('message-card')
      newMsgEl.setAttribute("data-index", doc.id)
      newMsgEl.setAttribute("timestamp", doc.timestamp)
      newMsgEl.innerHTML = "<h1>"+doc.message+"</h1>"
      newEl = listNode.insertBefore(newMsgEl,firstNode)
      return

  # This method does
  # 1. Listens to hash change in location
  # 2. Calls the router to route the request
  onHashChange: (event) =>
    console.log 'hashchange', event
    @router(window.location.hash)

  #This method deos
  # 1. Handles the submit
  # 2. Get the new message text
  # 3. Calls the datasource post message api
  onSubmitForm: (event) =>
    #1
    event.preventDefault()
    #2
    frm = document.querySelector('form')
    msg = frm.querySelector('#newMessage').value
    #3
    if msg
      @dataSource.postMessage msg
    console.log 'submit', event

  # This method Renders the single message in popup
  # 1. Gets the message id
  # 2. Search the message in array
  # 3. If found then set the message in overlay popup
  # 4. And open the popup
  # TODO - Apply the styling from CSS
  renderSingleMessage: (msgid) ->
    #1
    if @msgs.length
      #2
      @msgs.forEach (msg) ->
        if msg.id == msgid
          #3
          popup = document.querySelector('core-overlay')
          popup.style.backgroundColor='white'
          popup.style.padding='20px'
          popup.querySelector('h2').innerText = msg.message
          #4
          popup.open()
        return
    else
      console.log 'No message found'
      window.location.hash = ''
    return

  #This method renders all the messages in list
  # 1.  Get the template
  # 2.  Compile the template
  # 3.  Get the messages from datasource api
  # 4.  Set the progress bar to hidden
  # 5.  Pass the messages to template to generate actual html
  # 6.  Attach onclick handler to parent list element and get the msg id from target
  renderMessages: () ->
    that = this
    list = document.querySelector('.message-list')
    #1
    theTemplateScript = document.querySelector('#message-list-template').innerHTML
    #2
    theTemplate = Handlebars.compile(theTemplateScript)
    #3
    @dataSource.getMessages (msgs) ->
      #4
      document.querySelector('#progress').style.display = 'none'
      that.msgs = msgs
      #5
      list.innerHTML = theTemplate(msgs)
      messageCards = list.querySelectorAll('message-card')
      #6
      list.addEventListener 'click', (e) ->
        e.preventDefault()
        msgId = e.target.getAttribute('data-index')
        if msgId
          window.location.hash = 'message/' + msgId
      return
    return

  # This method routes the request
  # 1. Gets the hash value
  # 2. Has a switch case
  # 3. Call the right function as per the hash.
  router: (url) ->
    #1
    temp = url.split('/')[0]
    that = this
    #2
    map =
      '': ->
        that.renderMessages()
      '#message': ->
        id = url.split('#message/')[1].trim()
        that.renderSingleMessage id
        return

    #4
    if map[temp]
      map[temp]()


window.addEventListener 'DOMContentLoaded', (event) ->
  app = new App()
  app.router(window.location.hash)

