window.Watchman = function(attributes = {}) {

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
    
    invoke(event) {
      const method = methods[event];

      if (!method) return;

      return (...args) => {
        const result = method.call(this, ...args);

        this.trigger(event, ...args);
        return result;
      }
    },

    register(event, method) {

      methods[event] = method;
      return this;
    },

    trigger(event, ...args) {
      const callbacks = subscribers[event.type || event];

      if (!callbacks) return;

      callbacks.forEach(
        callback => callback.call(this, event, ...args)
        );

      return this;
    },

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

    on(event, callback) {

      subscribers[event] = subscribers[event] || [];
      subscribers[event].push(callback);
      return this;
    },

    states(property) {

      if (property) {
        return properties[property];
      } else {
        return states;
      }
    },

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

    states(property) {

      if (property) {
        return properties[property];
      } else {
        return states;
      }
    },

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

    get(property) {

      if (property) {
        return attributes[property];
      } else {
        return Object.assign({}, attributes);
      }
    }
  };
};