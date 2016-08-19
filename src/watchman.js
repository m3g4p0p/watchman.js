(window === undefined ? global : window).Watchman = function(attributes = {}) {

  /**
   * Constant for the change event
   * @type {String}
   */
  const CHANGE = 'change';

  /**
   * Constant for the remember event
   * @type {String}
   */
  const REMEMBER = 'remember';

  /**
   * Constant for the restore event
   * @type {String}
   */
  const RESTORE = 'restore';

  /**
   * Holds the subscribers to certain
   * events, where the property is the
   * event and the value the callback
   * @type {Object}
   */
  const subscribers = {};

  /**
   * The functions to be invoked on
   * custom events
   * @type {Object}
   */
  const methods = {};

  /**
   * The states of the attributes object
   * @type {Array}
   */
  const states = [];

  /**
   * States of single properties, where
   * the properties are (of course) properties
   * and the values arrays of the remembered
   * values
   * @type {Object}
   */
  const properties = {};

  /**
   * Returns an event object
   * @param  {string} type The event which
   *                       was triggered
   * @param  {string} prop The affected property
   * @param  {mixed}  data The corresponding data
   * @return {Object}      An appropriately 
   *                       formatted event object
   */
  const _event = (type, prop, data) => ({
    type, prop, data
  });

  /**
   * Just another small helper function
   * @param  {mixed}   value The value to check
   * @return {boolean}       If it's undefined
   *                         or not
   */
  const _isset = value => value !== undefined;

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
    get(property) {

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
    set(property, value, ...args) {

      if (typeof property === 'string') {
        attributes[property] = value;
      } else {
        args = [value, ...args];
        value = property;
        property = undefined;
        Object.assign(attributes, value);
      }

      this.trigger(_event(CHANGE, property, value), ...args);

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
    unset(property, ...args) {
      var success = true;

      if (property) {
        success = delete attributes[property];

        this.trigger(_event(CHANGE, property, success), ...args);
      } else {
        attributes = {};
        this.trigger(_event(CHANGE, property, success), ...args);
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
    on(event, callback) {

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
    off(event, subscriber) {
      const callbacks = subscribers[event];

      if (!callbacks) return;

      if (!subscriber) {
        delete subscribers[event];
      } else {
        subscribers[event] = callbacks.filter(
          callback => subscriber !== callback
          );
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
    trigger(event, ...args) {
      const callbacks = subscribers[event.type || event];

      if (!callbacks) return;

      if (typeof event === 'string') {
        event = _event(event);
      }

      callbacks.forEach(
        callback => callback.call(this, event, ...args)
        );

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
    register(event, method) {

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
    invoke(event, ...args) {
      const method = methods[event];

      if (!method) return;

      const result = method.call(this, ...args);
      this.trigger(event, ...args);

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
    remember(property, ...args) {
      var value;

      if (property) {
        value = attributes[property];
        properties[property] = properties[property] || [];
        properties[property].push(value);
      } else {
        value = Object.assign({}, attributes);
        states.push(value);
      }

      this.trigger(_event(REMEMBER, property, value), ...args);

      return this;
    },

    /**
     * Restore the state of a property or the entire attributes object
     * @param  {string|mixed} property The property to restore
     * @param  {...mixed}     args     Additional arguments
     * @return {Object}                this
     */
    restore(property, ...args) {
      var value;

      if (property) {
        value = (properties[property] || []).pop();
        attributes[property] = _isset(value) ? value : attributes[property];
      } else {
        value = states.pop();
        attributes = value || attributes;
      }

      this.trigger(_event(RESTORE, property, value), ...args);

      return this;
    },

    /**
     * Get a shallow copy of the states array, or of the
     * states array of a certain property
     * @param  {string|undefined} property The property
     * @return {Array}                     An array containing the
     *                                     remembered values
     */
    states(property) {

      if (property) {
        return properties[property].slice();
      } else {
        return states.map(object => Object.assign({}, object));
      }
    }
  };
};