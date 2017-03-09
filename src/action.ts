export interface PlainAction {
	event: string,
	callback: (socket: any) => any;
}

export interface ActionCallbacks {
	callback: () => any;
}

export default class Action {
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

	public add(action: (Action|string), callback?): this {
		if (arguments.length == 2) {
			action = new Action(action as string, callback);
		}

		this._children.push(action as Action);

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
}
