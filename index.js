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
      return setInterval(postMessage, 1000);
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
    function App() {
      this.onSubmitForm = bind(this.onSubmitForm, this);
      this.onHashChange = bind(this.onHashChange, this);
      var that;
      this.dataSource = new DataSource;
      this.msgs = [];
      window.addEventListener('hashchange', this.onHashChange);
      document.querySelector('form').addEventListener('submit', this.onSubmitForm);
      that = this;
      this.dataSource.addMessageListener(function(doc) {
        var list;
        console.log('a message was added:', doc.message);
        that.msgs.push(doc);
        list = $('.message-list');
        return list.append("<li data-index=" + doc.id + "><h2><a href='#'>" + doc.timestamp + "</a></h2><p>" + doc.message + "</p>");
      });
    }

    App.prototype.onHashChange = function(event) {
      console.log('hashchange', event);
      return this.router(window.location.hash);
    };

    App.prototype.onSubmitForm = function(event) {
      return console.log('submit', event);
    };

    App.prototype.renderSingleMessage = function(msgid) {
      var detail;
      detail = $('.detail');
      if (this.msgs.length) {
        this.msgs.forEach(function(msg) {
          if (msg.id === msgid) {
            detail.find('h1').text(msg.message);
          }
        });
      }
    };

    App.prototype.renderMessages = function() {
      var list, that, theTemplate, theTemplateScript;
      that = this;
      list = $('.message-list');
      theTemplateScript = $('#message-list-template').html();
      theTemplate = Handlebars.compile(theTemplateScript);
      this.dataSource.getMessages(function(msgs) {
        that.msgs = msgs;
        list.append(theTemplate(msgs));
        list.find('li').on('click', function(e) {
          var msgId;
          e.preventDefault();
          msgId = $(this).data('index');
          window.location.hash = 'message/' + msgId;
        });
      });
    };

    App.prototype.router = function(url) {
      var map, temp, that;
      temp = url.split('/')[0];
      that = this;
      map = {
        '': function() {
          return that.renderMessages();
        },
        '#message': function() {
          var id;
          id = url.split('#message/')[1].trim();
          that.renderSingleMessage(id);
        }
      };
      if (map[temp]) {
        return map[temp]();
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
