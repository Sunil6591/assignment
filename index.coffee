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
    @dataSource.addMessageListener (doc) ->
      console.log 'a message was added:', doc.message
      that.msgs.push doc
      listNode = document.querySelector('.message-list')
      msgsNodes = document.querySelectorAll('.message-list message-card')
      firstNode = msgsNodes[0]
      newMsgEl = document.createElement('message-card')
      newMsgEl.setAttribute("data-index", doc.id)
      newMsgEl.setAttribute("timestamp", doc.timestamp)
      newMsgEl.innerHTML = "<h1>"+doc.message+"</h1>"

      newEl = listNode.insertBefore(newMsgEl,firstNode)
      newEl.addEventListener 'click', (e) ->
        e.preventDefault()
        msgId = this.getAttribute('data-index')
        window.location.hash = 'message/' + msgId
      return

  onHashChange: (event) =>
    console.log 'hashchange', event
    @router(window.location.hash)

  onSubmitForm: (event) =>
    event.preventDefault()
    msg = document.frmNewMessage[0].value
    @dataSource.postMessage msg
    console.log 'submit', event

  renderSingleMessage: (msgid) ->
    detail = document.querySelector('.detail')
    popup = detail.querySelector('core-overlay')
    if @msgs.length
      @msgs.forEach (msg) ->
        if msg.id == msgid
          popup.querySelector('h2').innerText = msg.message
          popup.style.backgroundColor='white'
          popup.style.padding='20px'
          popup.open()
        return
    return

  renderMessages: () ->
    that = this
    list = document.querySelector('.message-list')
    theTemplateScript = document.querySelector('#message-list-template').innerHTML
    #Compile the template​
    theTemplate = Handlebars.compile(theTemplateScript)

    @dataSource.getMessages (msgs) ->
      document.querySelector('#progress').style.display = 'none'
      that.msgs = msgs
      list.innerHTML = theTemplate(msgs)
      messageCards = list.querySelectorAll('message-card')
      i = 0
      while i < messageCards.length
        messageCards[i].addEventListener 'click', (e) ->
          e.preventDefault()
          msgId = this.getAttribute('data-index')
          window.location.hash = 'message/' + msgId
        i++
      return
    return

  router: (url) ->
    temp = url.split('/')[0]
    that = this
    map =
      '': ->
        that.renderMessages()
      '#message': ->
        id = url.split('#message/')[1].trim()
        that.renderSingleMessage id
        return


    if map[temp]
      map[temp]()


window.addEventListener 'DOMContentLoaded', (event) ->
  app = new App()
  app.router(window.location.hash)

onCloseOverlay= () ->
  console.log 'overlay closed'
