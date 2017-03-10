import 'mocha';
import { assert } from 'chai';
import { Action, bind, prefix, child } from '../build';

describe('Action', function() {
	var action: Action;

	class BarAction {

	}

	@child(BarAction)
	@prefix('bar')
	class FooAction {
		@bind('hello')
		hello(socket, data) {
			return 'hello';
		}
	}

	it('should convert ES6 class to action', () => {
		var action = Action.fromES6Class(FooAction);
		assert.equal(action.children.length, 2);
		assert.equal(action.children[0].event, 'hello')
		assert.equal(action.children[0].callbacks.callback(), 'hello');
	});

	it('should create action with children', () => {
		class EmptyAction {}

		var anonymousFunc = () => {};
		(anonymousFunc as any).__boundSocketEvents = false;

		action = new Action()
			.add('test', new Action())
			.add('foo', FooAction)
			.add(EmptyAction)
			.add(new Action('bar', anonymousFunc));

		assert.equal(action.children.length, 4);
	});

	it('should convert action to array', () => {
		var match = { 'foo:bar:hello': 'hello', 'bar': undefined };
		var array = action.toArray();

		assert.equal(array.length, Object.keys(match).length);

		array.forEach((el) => {
			assert.equal(match[el.event], el.callback());
		});
	});
});
