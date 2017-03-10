export interface PlainAction {
	event: string,
	callback: (socket: any) => any;
}

export interface ActionCallbacks {
	callback: () => any;
}

export class Action {
	private _children: Action[] = [];
	private _event: string;
	private _callbacks: ActionCallbacks = {
		callback: null
	};

	get event(): string {
		return this._event;
	}

	get children(): Action[] {
		return this._children;
	}

	get callbacks(): ActionCallbacks {
		return this._callbacks;
	}

	constructor(event?: string, callback?) {
		this._event = event;
		this._callbacks.callback = callback;
	}

	public add(action: Action): this;
	public add(action: Function): this;
	public add(action: string, callback: Action): this;
	public add(action: string, callback: Function): this;
	public add(action: (Action|string|Function), callback?): this {
		// add(MyAction)
		if (typeof action === 'function' && !callback) {
			this._children.push(Action.fromES6Class(action));
		}
		
		// add(new Action(...))
		if (typeof action === 'object' && !callback) {
			this._children.push(action);
		}

		// add('foo', MyAction | ()=>any)
		if (typeof action === 'string' && typeof callback === 'function') {
			if (callback.prototype && callback.prototype.__boundSocketEvents) { // ES6 class
				this._children.push(new Action(action).add(Action.fromES6Class(callback)))
			} else { // Anonymous function
				this._children.push(new Action(action, callback));
			}
		}

		// add('foo', new Action(...))
		if (typeof action === 'string' && typeof callback === 'object') {
			this._children.push(new Action(action).add(callback));
		}

		return this;
	}

	public toArray(prefix = []) {
		var events = [];

		if (this.event) {
			prefix.push(this.event);

			if (this.callbacks.callback) {
				events.push({event:prefix.join(':'),callback:this.callbacks.callback});
			}
		}
		
		this.children.forEach((child) => {
			events = events.concat(child.toArray([].concat(prefix)));
		});

		return events;
	}

	public static fromES6Class(func): Action {
		var action = new Action(func.prototype.__boundSocketEventsPrefix);

		for (var event in func.prototype.__boundSocketEvents) {
			action.add(new Action(event, func.prototype[func.prototype.__boundSocketEvents[event]]));
		}

		if (func.prototype.__actionChildren) {
			func.prototype.__actionChildren.forEach((args) => {
				action.add.apply(action, args);
			});
		}

		return action;
	}
}

export function bind(event: string) {
	return function (target, propertyKey: string, descriptor: PropertyDescriptor) {
		if (!target.__boundSocketEvents) {
			target.__boundSocketEvents = {};
		}

		target.__boundSocketEvents[event] = propertyKey;
	}
}

export function prefix(prefix: string) {
	return function (constructor: Function) {
		constructor.prototype.__boundSocketEventsPrefix = prefix;
	};
}

export function child(action: Action);
export function child(action: Function);
export function child(action: string, callback: Action);
export function child(action: string, callback: Function);
export function child(action: (Action|string|Function), callback?) {
	var args = Array.prototype.slice.call(arguments);

	return function (constructor: Function) {
		if (!constructor.prototype.__actionChildren) {
			constructor.prototype.__actionChildren = [];
		}

		constructor.prototype.__actionChildren.push(args);
	};
}
