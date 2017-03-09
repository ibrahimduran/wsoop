import * as SocketIO from 'socket.io';
import * as Debug from 'debug';

import Action from './action';

interface ServerOptions {

}

class Server {
	private _io;
	private _debug;

	constructor(options: ServerOptions = {}) {
		this._io = SocketIO();
		this._debug = Debug('ws:server');
	}

	public add(action: Action): this {
		this._io.on('connection', (socket) => {
			this._debug(`Socket connected from ${socket.request.connection.remoteAddress}`)

			this.getPlainActions(action).forEach(plain => {
				this._debug(`Binding action to the server: ${plain.event}`);
				
				socket.on(plain.event, () => {
					this._debug(`Socket request from ${socket.request.connection.remoteAddress}: ${plain.event}`)
					plain.callback.apply(this, socket);
				});
			});

			socket.on('disconnect', () => {
				this._debug(`Socket disconnected from ${socket.request.connection.remoteAddress}`)
			});
		});

		return this;
	}

	public listen(port: number) {
		this._debug(`WebSocket server listening on *:${port}`)
		this._io.listen(port);
	}

	private getPlainActions(action: Action, prefix: string[] = []) {
		var events = [];

		if (action.event) {
			prefix.push(action.event);

			if (action.callbacks.callback) {
				events.push({event:prefix.join(':'),callback:action.callbacks.callback});
			}
		}
		
		action.children.forEach((child) => {
			events = events.concat(this.getPlainActions(child, [].concat(prefix)));
		});

		return events;
	}
}

export { ServerOptions, Server };
