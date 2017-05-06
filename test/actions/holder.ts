import 'mocha';
import { assert } from 'chai';

import { Action, ActionHolder, bind } from '../../build';

describe('actions/holders', function () {
	var holder: ActionHolder;

	it('should create new ActionHolder', function () {
		holder = new ActionHolder();

		assert.equal(Array.isArray(holder.actions), true);
	});

	it('should add Action', function () {
		var myAction = new Action('hello', () => 'world');
		holder.add(myAction);

		assert.equal(holder.actions[0].event, 'hello');
		assert.equal(holder.actions[0].callback(null), 'world');
	});

	it('should add Action Class', function () {
		class MyAction { @bind('hello') hello() { return 'world'; } }
		holder.add(MyAction);

		assert.equal(holder.actions[0].event, 'hello');
		assert.equal(holder.actions[0].callback(null), 'world');
	});
});
