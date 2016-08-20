/**
 * Watchman.js
 *
 * @author m3g4p0p
 */
(window === undefined ? global : window).Watchman = function(subject = {}) {

  const CHANGE = 'change';
  const REMEMBER = 'remember';
  const RESTORE = 'restore';

  const subscribers = {};
  const methods = {};
  const states = [];
  const properties = {};

  const _event = (type, prop, data) => ({
    type, prop, data
  });

  const _isset = value => value !== undefined;

  return {

    ////////////////////
    // Change methods //
    ////////////////////

    get(...properties) {

      if (properties.length === 1) {
        return subject[property];
      }

      else if (properties.length > 1) {
        return properties.reduce((obj, key) => 
          Object.defineProperty(obj, key, {value: subject[key]}), 
        {});
      }

      else {
        return Object.assign({}, subject);
      }
    },

    set(property, value, ...args) {

      if (typeof property === 'string') {
        subject[property] = value;
      } 

      else {
        args = [value, ...args];
        value = property;
        property = undefined;
        Object.assign(subject, value);
      }

      this.trigger(_event(CHANGE, property, value), ...args);

      return this;
    },

    unset(property, ...args) {
      var success = true;

      if (property) {
        success = delete subject[property];

        this.trigger(_event(CHANGE, property, success), ...args);
      } 

      else {
        subject = {};
        this.trigger(_event(CHANGE, property, success), ...args);
      }

      return this;
    },

    ///////////////////
    // Event methods //
    ///////////////////

    on(event, property, callback) {

      subscribers[event] = subscribers[event] || [];
      subscribers[event].push(callback);

      return this;
    },

    off(event, subscriber) {
      const callbacks = subscribers[event];

      if (!callbacks) return;

      if (!subscriber) {
        delete subscribers[event];
      } 

      else {
        subscribers[event] = callbacks.filter(
          callback => subscriber !== callback
        );
      }

      return this;
    },

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

    register(event, method) {

      methods[event] = method;

      return this;
    },
    
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

    remember(property, ...args) {
      var value;

      if (property) {
        value = subject[property];
        properties[property] = properties[property] || [];
        properties[property].push(value);
      } 

      else {
        value = Object.assign({}, subject);
        states.push(value);
      }

      this.trigger(_event(REMEMBER, property, value), ...args);

      return this;
    },

     restore(property, ...args) {
      var value;

      if (property) {
        value = (properties[property] || []).pop();
        subject[property] = _isset(value) ? value : subject[property];
      } 

      else {
        value = states.pop();
        subject = value || subject;
      }

      this.trigger(_event(RESTORE, property, value), ...args);

      return this;
    },

    states(property) {

      if (property) {
        return properties[property].slice();
      } 

      else {
        return states.map(object => Object.assign({}, object));
      }
    }
  };
};