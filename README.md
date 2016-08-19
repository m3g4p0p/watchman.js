# watchman.js

A minimalist JavaScript object container that provides events and state handling.

## Usage

Download `dist/watchman.min.js` and include it in your application as usual.

## API

### Initialise

```javascript
const watchman = new Watchman();
```

or

```javascript
const watchman = new Watchman(object);
```

### Chaining

All non-getter methods are chainable.

### `get()`

```javascript
// Get a specific property like
const value = watchman.get('foo');

// Get a shallow copy of the entire object
const object = watchman.get();
```

### `set()`

```javascript
// Set a specific property
watchman.set('foo', 42);

// Set multiple properties
watchman.set({foo: 42, bar: 'baz'});
```

### `unset()`

```javascript
// Delete a specific property
watchman.unset('foo');

// Unset the entire object (i.e. {})
watchman.unset();
```

### `remember()`

```javascript
// Remember the state of a specific property
watchman.remember('foo');

// Remember the state of the entire object
watchman.remember();
```

### `restore()`

```javascript
// Restore a previously remembered property (note that 
// this will not restore properties as remembered from 
// the entire object)
watchman.restore('foo');

// Remember a previously remembered object state
watchman.remember();
```

### `states()`

```javascript
// Get the array of the states of a specific property
const propertyStates = watchman.states('foo');

// Get the array of the states of the entire object
const objectStates = watchman.states();
```

### `on()`

```javascript
// Bind an event listener. Native events are "change" 
// (triggered by set() and unset()), "remember" and "restore"
watchman.on('change', function changeHandler(event) {
  console.log(event, this.get());
});

// The "event" parameter passed to the handler function is 
// an object with the properties "type" ("change" etc.), 
// "prop" (the affected property or "undefined" if the 
// whole object was affected) and "data" (like the restored 
// state or the changed value). When using custom events, 
// it may just contain "type". You can also pass additional
// arguments from any listenable method, like e.g.
watchman.on('change', function changeHandler(event, that) {
  console.log(event, that);
});

watchman.set({foo: 43}, this);
```

### `off()`

```javascript
// Remove all event listeners of a specific type
watchman.off('change');

// Remove a specific event listener by reference to the
// handler function
watchman.off('change', changeHandler);
```

### `trigger()`

```javascript
// Trigger a specific event, again optionally passing 
// additional arguments to the corresponding listener
watchman.trigger('change');
watchman.trigger('change', 'foo', 'bar');
```

### `register()`

```javascript
// Register a custom event, like e.g.
watchman.register('reset', function(replacement) {
  this.unset().set(replacement);

  // Return this to maintain chainability
  return this;
});
```

### `invoke()`

```javascript
// Invoke a previously registered event, optionally
// passing additional arguments to listeners, e.g.
const result = watchman.invoke('reset', {foo: [1, 2, 3]});
```

## License
MIT