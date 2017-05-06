import * as SocketIO from 'socket.io';
import * as Debug from 'debug';

import { Action, ActionHolder, bind } from '../actions';

export interface ServerOptions
{
}

export class Server extends ActionHolder {
	public io: SocketIO.Server;
	protected debug;

	constructor(options: ServerOptions = {}) {
		super();

		this.io = SocketIO();
		this.debug = Debug('ws:server');
		this.add(Server);
	}

	@bind('connection')
	private onConnection(socket, data) {
		this.debug(`Socket connected from ${socket.request.connection.remoteAddress}`);

		socket.on('disconnect', () => {
			this.debug(`Socket disconnected from ${socket.request.connection.remoteAddress}`);
		});
	}

	public listen(port: number) {
		this.debug(`WebSocket server listening on *:${port}`);

		this.actions.forEach(plain => {
			this.debug(`Binding action to the socket: ${plain.event}`);
			
			this.io.on('connection', (socket) => {
				socket.on(plain.event, (data) => {
					this.debug(`Socket request from ${socket.request.connection.remoteAddress}: ${plain.event}`);
					plain.callback.call(this, socket, data);
				});
			});
		});

		this.io.listen(port);
	}
}
