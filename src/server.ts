import * as SocketIO from 'socket.io';
import * as Debug from 'debug';

import { Action } from './action';

interface ServerOptions {

}

class Server {
	protected io: SocketIO.Server;
	protected debug;

	constructor(options: ServerOptions = {}) {
		this.io = SocketIO();
		this.debug = Debug('ws:server');
	}

	public add(action: Action|Function): this {
		if (typeof action === 'function') {
			action = Action.fromES6Class(action);
		}

		var actionArray = action.toArray();

		this.io.on('connection', (socket) => {
			this.debug(`Socket connected from ${socket.request.connection.remoteAddress}`)

			actionArray.forEach(plain => {
				this.debug(`Binding action to the socket: ${plain.event}`);
				
				socket.on(plain.event, (data) => {
					this.debug(`Socket request from ${socket.request.connection.remoteAddress}: ${plain.event}`);
					plain.callback.call(this, socket, data);
				});
			});

			socket.on('disconnect', () => {
				this.debug(`Socket disconnected from ${socket.request.connection.remoteAddress}`)
			});
		});

		return this;
	}

	public listen(port: number) {
		this.debug(`WebSocket server listening on *:${port}`)
		this.io.listen(port);
	}
}

export { ServerOptions, Server };
