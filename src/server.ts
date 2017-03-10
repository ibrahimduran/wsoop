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
		var actionArray = action.toArray();

		this._io.on('connection', (socket) => {
			this._debug(`Socket connected from ${socket.request.connection.remoteAddress}`)

			actionArray.forEach(plain => {
				this._debug(`Binding action to the socket: ${plain.event}`);
				
				socket.on(plain.event, (data) => {
					this._debug(`Socket request from ${socket.request.connection.remoteAddress}: ${plain.event}`);
					plain.callback.call(this, socket, data);
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
}

export { ServerOptions, Server };
