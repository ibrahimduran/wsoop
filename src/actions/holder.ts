import { EventEmitter } from 'events';
import { Action, PlainAction } from './action';

import * as debug from 'debug';

export class ActionHolder {
	protected _actions: PlainAction[] = [];

	get actions() {
		return this._actions;
	}

	public add(action: Action|Function): this {
		if (typeof action === 'function') {
			action = Action.fromES6Class(action);
		}

		var actionArray = action.toArray();
		this._actions = this._actions.concat(actionArray);

		return this;
	}
}
