var CCS = {};

CCS.AjaxQueue = Class.create({
  initialize: function(name) {
      var latest = -1, serializer;

      serializer  = function(index) {
          return function(proceed, arg1, arg2) {
              if (index >= latest) {
                  latest = index;
                  proceed(arg1, arg2);
              }
          };
      };

      this.createRequest = function(url, options) {
          var time = new Date().getTime();
          options = Object.clone(options);
          if (options.onComplete) {
            options.onComplete = options.onComplete.wrap(serializer(time));
          }
          if (options.onSuccess) {
            options.onSuccess = options.onSuccess.wrap(serializer(time));
          }
          if (options.onFailure) {
            options.onFailure = options.onFailure.wrap(serializer(time));
          }
          return new Ajax.Request(url, options);
      };

      this.createUpdater = function(container, url, options) {
          var time = new Date().getTime();
          options = Object.clone(options || {});
          if (options.onSuccess) {
            options.onSuccess = options.onSuccess.wrap(serializer(time));
          }
          if (options.onFailure) {
            options.onFailure = options.onFailure.wrap(serializer(time));
          }
          options.wrapper = serializer(time);
          return new CCS.AjaxQueue.Updater(container, url, options);
      };

      this.name = name;
  }
});

CCS.AjaxQueue.Updater = Class.create(Ajax.Request, {
    initialize: function($super, container, url, options) {
        var that, onComplete, updateContent;

        that = this;

        that.container = {
            success: (container.success || container),
            failure: (container.failure || (container.success ? null : container))
        };

        options = Object.clone(options);
        onComplete = options.onComplete;

        updateContent = function(responseText) {
            var receiver = that.container[that.success() ? 'success' : 'failure'],
                options  = that.options;

            if (!options.evalScripts) responseText = responseText.stripScripts();

            if (receiver = $(receiver)) {
                if (options.insertion) {
                    if (Object.isString(options.insertion)) {
                        var insertion = { };
                        insertion[options.insertion] = responseText;
                        receiver.insert(insertion);
                    } else options.insertion(receiver, responseText);
                } else receiver.update(responseText);
            }
        };

        options.onComplete = function(response, json) {
            updateContent(response.responseText);
            if (Object.isFunction(onComplete)) onComplete(response, json);
        }.wrap(options.wrapper);

        $super(url, options);
    }
});
