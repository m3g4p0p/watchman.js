# watchman.js
A minimalist JavaScript object container that provides events and state handling

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

### `get()`

```javascript
// Get a specific property
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

// Unset the entire object
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
// (triggered by set()and unset()), "remember" and "restore"
watchman.on('change', function changeHandler(event, ...args) {
  console.log(this.get());
});

// The "event" parameter passed to the handler function is 
// an object with the properties "type" ("change" etc.), 
// "property" (the affected property or "undefined" if the 
// whole object was affected) and "data" (like the restored 
// state or the changed value). When using custom events, 
// it may be just contain "type" string. "...args" are additional 
// arguments that may be passed to any listenable method, e.g.
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
// Trigger a specific event, optionally passing additional
// arguments to the corresponding listener
watchman.trigger(event, ...args);
```

### `register()`

```javascript
// Register a custom event, e.g.
watchman.register('replace', function(replacement) {
  this.set();
  this.set(replacement);
});
```

### `invoke()`

```javascript
// Invoke a previously registered event, optionally
// passing additional arguments to the listener
watchman.invoke('replace', {foo: [1, 2, 3]});
```

### Chaining

All non-getter methods are chainable.

## License
MIT