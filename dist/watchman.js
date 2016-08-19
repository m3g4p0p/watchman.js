'use strict';

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

(window === undefined ? global : window).Watchman = function () {
  var attributes = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];


  /**
   * Constant for the change event
   * @type {String}
   */
  var CHANGE = 'change';

  /**
   * Constant for the remember event
   * @type {String}
   */
  var REMEMBER = 'remember';

  /**
   * Constant for the restore event
   * @type {String}
   */
  var RESTORE = 'restore';

  /**
   * Holds the subscribers to certain
   * events, where the property is the
   * event and the value the callback
   * @type {Object}
   */
  var subscribers = {};

  /**
   * The functions to be invoked on
   * custom events
   * @type {Object}
   */
  var methods = {};

  /**
   * The states of the attributes object
   * @type {Array}
   */
  var _states = [];

  /**
   * States of single properties, where
   * the properties are (of course) properties
   * and the values arrays of the remembered
   * values
   * @type {Object}
   */
  var properties = {};

  /**
   * Returns an event object
   * @param  {string} type The event which
   *                       was triggered
   * @param  {string} prop The affected property
   * @param  {mixed}  data The corresponding data
   * @return {Object}      An appropriately 
   *                       formatted event object
   */
  var _event = function _event(type, prop, data) {
    return {
      type: type, prop: prop, data: data
    };
  };

  /**
   * Just another small helper function
   * @param  {mixed}   value The value to check
   * @return {boolean}       If it's undefined
   *                         or not
   */
  var _isset = function _isset(value) {
    return value !== undefined;
  };

  return {

    ////////////////////
    // Change methods //
    ////////////////////

    /**
     * Either get a specific attributes property
     * or a shallow copy of the attributes object
     * itself
     * @param  {string|undefined} property Optionally get a specific 
     *                                     property only
     * @return {mixed}                     The requested value(s)
     */
    get: function get(property) {

      if (property) {
        return attributes[property];
      } else {
        return Object.assign({}, attributes);
      }
    },


    /**
     * Either set a specific property of the attributes
     * object, or multiple properties as an object that
     * will be merged with attributes
     * @param {string|object} property The property to set or, if
     *                                 none is given, the object to
     *                                 merge
     * @param {mixed}         value    If a property was specified,
     *                                 the value to set
     * @param {...mixed}      args     Additional arguments that may
     *                                 be passed to listening functions
     */
    set: function set(property, value) {
      for (var _len = arguments.length, args = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
        args[_key - 2] = arguments[_key];
      }

      if (typeof property === 'string') {
        attributes[property] = value;
      } else {
        args = [value].concat(_toConsumableArray(args));
        value = property;
        property = undefined;
        Object.assign(attributes, value);
      }

      this.trigger.apply(this, [_event(CHANGE, property, value)].concat(_toConsumableArray(args)));

      return this;
    },


    /**
     * Unset a specific property or the entire
     * attributes object
     * @param  {string|undefined} property The property to unset
     * @param  {...mixed}         args     Additional arguments that may
     *                                     be passed to listening functions
     * @return {mixed}                     True if the unsetting was successful
     *                                     otherwise false (which is the
     *                                     case when a property was specified
     *                                     but it didn't exist in the
     *                                     attributes object)
     */
    unset: function unset(property) {
      var success = true;

      for (var _len2 = arguments.length, args = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
        args[_key2 - 1] = arguments[_key2];
      }

      if (property) {
        success = delete attributes[property];

        this.trigger.apply(this, [_event(CHANGE, property, success)].concat(args));
      } else {
        attributes = {};
        this.trigger.apply(this, [_event(CHANGE, property, success)].concat(args));
      }

      return this;
    },


    ///////////////////
    // Event methods //
    ///////////////////

    /**
     * Listen to a given event
     * @param  {string}   event    The event that was triggered
     * @param  {Function} callback The function to call
     * @return {Object}            A reference to this for chaining
     */
    on: function on(event, callback) {

      subscribers[event] = subscribers[event] || [];
      subscribers[event].push(callback);

      return this;
    },


    /**
     * Unbind an event listener
     * @param  {string}   event      The event from which to
     *                               unbind
     * @param  {Function} subscriber The function to unbind
     * @return {Object}              this
     */
    off: function off(event, subscriber) {
      var callbacks = subscribers[event];

      if (!callbacks) return;

      if (!subscriber) {
        delete subscribers[event];
      } else {
        subscribers[event] = callbacks.filter(function (callback) {
          return subscriber !== callback;
        });
      }

      return this;
    },


    /**
     * Trigger a certain event
     * @param  {string}    event Which event to trigger
     * @param  {...mixed}  args  Additional arguments that
     *                           will be passed to the callbacks
     * @return {Object}          this
     */
    trigger: function trigger(event) {
      var _this = this;

      for (var _len3 = arguments.length, args = Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
        args[_key3 - 1] = arguments[_key3];
      }

      var callbacks = subscribers[event.type || event];

      if (!callbacks) return;

      if (typeof event === 'string') {
        event = _event(event);
      }

      callbacks.forEach(function (callback) {
        return callback.call.apply(callback, [_this, event].concat(args));
      });

      return this;
    },


    //////////////////////////
    // Custom event methods //
    //////////////////////////

    /**
     * Register a custom event
     * @param  {string}   event  The name of the new event
     * @param  {Function} method A function that will be called
     *                           when the event is invoked
     * @return {Object}          this
     */
    register: function register(event, method) {

      methods[event] = method;

      return this;
    },


    /**
     * Invoke a custom event, which will execute the corresponding
     * function with the arguments passed, and trigger the event
     * to call listening functions
     * event (so that listening functions will be called)
     * @param  {string}    event The name of the event
     * @param  {...mixed}  args  Additional arguments that will be
     *                           passed to the function associated
     *                           with the event, as well as to event
     *                           listeners
     * @return {mixed}           The return value of the event's
     *                           function, typically a reference to
     *                           this
     */
    invoke: function invoke(event) {
      var method = methods[event];

      if (!method) return;

      for (var _len4 = arguments.length, args = Array(_len4 > 1 ? _len4 - 1 : 0), _key4 = 1; _key4 < _len4; _key4++) {
        args[_key4 - 1] = arguments[_key4];
      }

      var result = method.call.apply(method, [this].concat(args));
      this.trigger.apply(this, [event].concat(args));

      return result;
    },


    ///////////////////////////
    // State handler methods //
    ///////////////////////////

    /**
     * Remember the state of a specific property or the
     * entire attributes object
     * @param  {string|undefined} property The name of the property
     *                            to remember; if none is given, the
     *                            state of attributes will be remembered
     * @param  {...mixed} args    Additional arguments
     * @return {Object}           this
     */
    remember: function remember(property) {
      var value;

      if (property) {
        value = attributes[property];
        properties[property] = properties[property] || [];
        properties[property].push(value);
      } else {
        value = Object.assign({}, attributes);
        _states.push(value);
      }

      for (var _len5 = arguments.length, args = Array(_len5 > 1 ? _len5 - 1 : 0), _key5 = 1; _key5 < _len5; _key5++) {
        args[_key5 - 1] = arguments[_key5];
      }

      this.trigger.apply(this, [_event(REMEMBER, property, value)].concat(args));

      return this;
    },


    /**
     * Restore the state of a property or the entire attributes object
     * @param  {string|mixed} property The property to restore
     * @param  {...mixed}     args     Additional arguments
     * @return {Object}                this
     */
    restore: function restore(property) {
      var value;

      if (property) {
        value = (properties[property] || []).pop();
        attributes[property] = _isset(value) ? value : attributes[property];
      } else {
        value = _states.pop();
        attributes = value || attributes;
      }

      for (var _len6 = arguments.length, args = Array(_len6 > 1 ? _len6 - 1 : 0), _key6 = 1; _key6 < _len6; _key6++) {
        args[_key6 - 1] = arguments[_key6];
      }

      this.trigger.apply(this, [_event(RESTORE, property, value)].concat(args));

      return this;
    },


    /**
     * Get a shallow copy of the states array, or of the
     * states array of a certain property
     * @param  {string|undefined} property The property
     * @return {Array}                     An array containing the
     *                                     remembered values
     */
    states: function states(property) {

      if (property) {
        return properties[property].slice();
      } else {
        return _states.map(function (object) {
          return Object.assign({}, object);
        });
      }
    }
  };
};