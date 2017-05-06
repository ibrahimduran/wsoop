import * as SocketIOClient from 'socket.io-client';
import * as Debug from 'debug';

import { Action, ActionHolder, bind } from '../actions';

export interface ClientOptions {
	endpoint?: string,
	initConnection: boolean,
	connectOpts?: SocketIOClient.ConnectOpts,
}

export class Client extends ActionHolder {
	private _socket: SocketIOClient.Socket;
	private _options: ClientOptions;
	protected debug;

	get sock() {
		return this._socket;
	}

	constructor(options: ClientOptions = { initConnection: true }) {
		super();

		this._options = options;
		this.debug = Debug('ws:client');

		if (options.initConnection && options.endpoint) {
			this.connect(options.endpoint);
		}

		this.add(Client);
	}

	public connect(endpoint = this._options.endpoint) {
		this._options.endpoint = endpoint;
		this._socket = SocketIOClient.connect(this._options.endpoint, this._options.connectOpts);
		
		this._actions.forEach(plain => {
			this.debug(`Binding action to the socket: ${plain.event}`);
			
			this._socket.on(plain.event, (data) => {
				this.debug(`Socket response from ${this._options.endpoint}: ${plain.event}`);
				plain.callback.call(this, this._socket, data);
			});
		});
	}

	@bind('connect_error')
	private onConnectError(socket, error) {
		this.debug(`Connection error for ${this._options.endpoint}`);
		this.debug(error);
	}

	@bind('connect_timeout')
	private onConnectTimeout() {
		this.debug(`Connection timed out from ${this._options.endpoint}`);
	}

	@bind('reconnect')
	private onReconnect(socket, attempt) {
		this.debug(`Reconnected to ${this._options.endpoint} in #${attempt} attempt.`);
	}

	@bind('reconnect_attempt')
	private onReconnectAttempt(socket) {
		this.debug(`Trying to reconnect to ${this._options.endpoint}`);
	}

	@bind('reconnect_error')
	private onReconnectError(socket, error) {
		this.debug(`Reconnection error for ${this._options.endpoint}`);
		this.debug(error);
	}

	@bind('reconnect_failed')
	private onReconnectFailed() {
		this.debug(`Reconnection failed to ${this._options.endpoint}`);
	}
}
