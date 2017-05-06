import 'mocha';
import { assert } from 'chai';

import { Action, bind, prefix, child } from '../../build';

describe('actions/action', function () {
	var action: Action;

	beforeEach(function () {
		if (action) {
			action.reset();
		}
	});

	it('should create new blank Action', function () {
		action = new Action();

		// getters
		assert.equal(action.event, undefined);
		assert.equal(Array.isArray(action.children), true);
		assert.equal('callback' in action.callbacks, true);
	});

	it('should add Action', function () {
		action.add(new Action());
	});

	it('should add Action with key', function () {
		action.add('foo', new Action());
	});

	it('should convert bound ES6 class to Action', function () {
		class FooAction { @bind('hello') hello() { return 'helloReturn'; } }
		var myAction = Action.fromES6Class(FooAction);
		assert.equal(myAction.event, undefined);
		assert.equal(myAction.children[0].event, 'hello');
	});
	
	it('should add Action Class', function () {
		class FooAction {}
		action.add(FooAction);
	});

	it('should add Action Class with key', function () {
		class FooAction {}
		action.add('bar', FooAction);

		assert.equal(action.event, undefined);
		assert.equal(action.children[0].event, 'bar');
		assert.equal(action.children.length, 1);
	});
	
	it('should add Action Class with bound events', function () {
		class FooAction { @bind('bar') bar() { return 'return'; } }
		action.add('foo', FooAction);

		assert.equal(action.children[0].event, 'foo');
		assert.equal(action.children[0].children.length, 1);
	});

	it('should add Action Class with prefix', function () {
		@prefix('foo') class FooAction { @bind('bar') bar() { return 'foo:bar'; } }

		action.add(FooAction);

		var arr = action.toArray();
		assert.equal(action.children[0].event, 'foo');
		assert.equal(action.children[0].children[0].event, 'bar');
		assert.equal(arr[0].event, 'foo:bar');
		assert.equal(arr[0].callback(), 'foo:bar');
	});

	it('should add Action Class with child', function () {
		class FooAction {}
		class BarAction {}
		@child(FooAction) @child(BarAction) class MainAction {}

		var mainAction = Action.fromES6Class(MainAction);
		assert.equal(mainAction.event, undefined);
		assert.equal(mainAction.children.length, 2);
	});

	it('should add Action Callback with key', function () {
		action.add('fooBar', () => {});
	});

	it('should reset (empty) action', function () {
		action.add('foo', () => {});
		action.reset();
		assert.equal(action.children.length, 0);
	});

	it('should convert children to array list', function () {
		action.add('hello', () => 'helloReturn');
		action.add('actionWithChildren', new Action().add('childAction', () => 'childActionReturn'))
		
		var arr = action.toArray();
		assert.equal(arr[0].event, 'hello');
		assert.equal(arr[0].callback(), 'helloReturn');
		assert.equal(arr[1].event, 'actionWithChildren:childAction');
		assert.equal(arr[1].callback(), 'childActionReturn');
	});
});
