// Generated by CoffeeScript 1.9.1
(function() {
  var App, DataSource,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  DataSource = (function() {
    function DataSource() {
      this._messageDocs = {};
      this._messageListeners = [];
      this._initializeMessages();
      this._randomlyPostMessages();
    }

    DataSource.prototype._initializeMessages = function() {
      var j, results;
      return (function() {
        results = [];
        for (j = 0; j < 100; j++){ results.push(j); }
        return results;
      }).apply(this).forEach((function(_this) {
        return function(i) {
          var key;
          key = _this._getRandomKey();
          return _this._messageDocs[key] = {
            id: key,
            timestamp: new Date(2015, 2, 30, 0, i).toISOString(),
            message: _this._getRandomMessage()
          };
        };
      })(this));
    };

    DataSource.prototype._getRandomKey = function() {
      var chars;
      chars = '1234567890abcdef';
      return [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19].map(function() {
        return chars[Math.floor(16 * Math.random())];
      }).join('');
    };

    DataSource.prototype._getRandomMessage = function() {
      var chars, j, results;
      chars = 'abcdefghijklmnopqrstuvwxyz  ';
      return (function() {
        results = [];
        for (j = 0; j < 80; j++){ results.push(j); }
        return results;
      }).apply(this).map(function() {
        return chars[Math.floor(28 * Math.random())];
      }).join('');
    };

    DataSource.prototype._randomlyPostMessages = function() {
      var postMessage;
      postMessage = (function(_this) {
        return function() {
          if (Math.random() < .3) {
            return _this.postMessage(_this._getRandomMessage());
          }
        };
      })(this);
      return setInterval(postMessage, 5000);
    };

    DataSource.prototype.getMessages = function(cb) {
      var result;
      result = Object.keys(this._messageDocs).map((function(_this) {
        return function(key) {
          return _this._messageDocs[key];
        };
      })(this)).sort(function(doc1, doc2) {
        if (doc1.timestamp < doc2.timestamp) {
          return -1;
        } else if (doc1.timestamp > doc2.timestamp) {
          return 1;
        } else {
          return 0;
        }
      });
      return setTimeout((function() {
        return cb(result);
      }), 3000);
    };

    DataSource.prototype.getMessage = function(key, cb) {
      return setTimeout(((function(_this) {
        return function() {
          return cb(_this._messageDocs[key]);
        };
      })(this)), 1000);
    };

    DataSource.prototype.postMessage = function(message, cb) {
      var onReady;
      onReady = (function(_this) {
        return function() {
          var key, messageDoc;
          console.log('onReady was called');
          key = _this._getRandomKey();
          messageDoc = {
            id: key,
            timestamp: new Date().toISOString(),
            message: message
          };
          _this._messageDocs[key] = messageDoc;
          if (typeof cb === "function") {
            cb();
          }
          return _this._messageListeners.forEach(function(listener) {
            return listener(messageDoc);
          });
        };
      })(this);
      return setTimeout(onReady, 500);
    };

    DataSource.prototype.addMessageListener = function(cb) {
      if (this._messageListeners.indexOf(cb) === -1) {
        return this._messageListeners.push(cb);
      }
    };

    DataSource.prototype.removeMessageListener = function(cb) {
      var i;
      i = this._messageListeners.indexOf(cb);
      if (i !== -1) {
        return this._messageListeners.splice(i, 1);
      }
    };

    return DataSource;

  })();

  App = (function() {
    var escapeHtml, theTemplate;

    theTemplate = null;

    function App() {
      this.onSubmitForm = bind(this.onSubmitForm, this);
      this.onHashChange = bind(this.onHashChange, this);
      this.onDialogClose = bind(this.onDialogClose, this);
      this.dataSource = new DataSource;
      this.msgs = [];
      this.theDailog = document.querySelector('core-overlay');
      this.theDailog.style.backgroundColor = 'white';
      this.theDailog.style.padding = '20px';
      window.addEventListener('hashchange', this.onHashChange);
      document.querySelector('form').addEventListener('submit', this.onSubmitForm);
      this.theDailog.addEventListener('core-overlay-close-completed', this.onDialogClose);
      this.dataSource.addMessageListener((function(_this) {
        return function(doc) {
          var firstNode, listNode, msgsNodes, newMsgEl;
          console.log('a message was added:', doc.message);
          _this.msgs.push(doc);
          listNode = document.querySelector('.message-list');
          msgsNodes = document.querySelectorAll('.message-list message-card');
          firstNode = msgsNodes[0];
          newMsgEl = document.createElement('message-card');
          newMsgEl.dataset.index = doc.id;
          newMsgEl.setAttribute("timestamp", doc.timestamp);
          newMsgEl.innerHTML = "<h1>" + doc.message + "</h1>";
          listNode.insertBefore(newMsgEl, firstNode);
        };
      })(this));
    }

    App.prototype.onDialogClose = function(event) {
      console.log('closed');
      return window.location.hash = '#';
    };

    App.prototype.onHashChange = function(event) {
      console.log('hashchange', event);
      return this.router(window.location.hash);
    };

    escapeHtml = function(unsafe) {
      return unsafe.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
    };

    App.prototype.onSubmitForm = function(event) {
      var frm, msg;
      event.preventDefault();
      frm = document.querySelector('form');
      msg = frm.querySelector('#newMessage').value;
      frm.querySelector('#newMessage').value = '';
      frm.querySelector('#paperNewMsg').labelVisible = true;
      if (msg) {
        this.dataSource.postMessage(escapeHtml(msg));
      }
      return console.log('submit', event);
    };

    App.prototype.renderSingleMessage = function(msgid) {
      var foundMsg, j, len, msg, ref;
      foundMsg = false;
      ref = this.msgs;
      for (j = 0, len = ref.length; j < len; j++) {
        msg = ref[j];
        if (msg.id === msgid) {
          this.theDailog.querySelector('h2').innerHTML = msg.message;
          this.theDailog.open();
          foundMsg = true;
          break;
        }
      }
      if (!foundMsg) {
        console.log('Message not found');
        window.location.hash = '#';
      }
    };

    App.prototype.getTemplate = function() {
      var theTemplateScript;
      theTemplateScript = document.querySelector('#message-list-template').innerHTML;
      return theTemplate = Handlebars.compile(theTemplateScript);
    };

    App.prototype.renderMessages = function() {
      var list;
      list = document.querySelector('.message-list');
      if (!theTemplate) {
        theTemplate = this.getTemplate();
      }
      this.dataSource.getMessages((function(_this) {
        return function(msgs) {
          document.querySelector('#progress').style.display = 'none';
          _this.msgs = msgs;
          list.innerHTML = theTemplate(msgs);
          return list.addEventListener('click', function(e) {
            var msgId;
            e.preventDefault();
            msgId = e.target.dataset.index;
            if (msgId) {
              return window.location.hash = '#message/' + msgId;
            }
          });
        };
      })(this));
    };

    App.prototype.router = function(url) {
      var hash, map;
      hash = url.split('/')[0];
      map = {
        '': (function(_this) {
          return function() {
            if (_this.theDailog.opened) {
              _this.theDailog.close();
            }
            return _this.renderMessages();
          };
        })(this),
        '#message': (function(_this) {
          return function() {
            var id;
            id = url.split('#message/')[1].trim();
            _this.renderSingleMessage(id);
          };
        })(this)
      };
      if (map[hash]) {
        return map[hash]();
      }
    };

    return App;

  })();

  window.addEventListener('DOMContentLoaded', function(event) {
    var app;
    app = new App();
    return app.router(window.location.hash);
  });

}).call(this);

//# sourceMappingURL=index.js.map
