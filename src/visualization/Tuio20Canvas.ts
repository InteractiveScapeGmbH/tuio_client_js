import { TuioTime } from "../common/TuioTime.ts";
import { WebsocketTuioReceiver } from "../common/WebsocketTuioReceiver.js";
import { Tuio20Bounds } from "../tuio20/Tuio20Bounds.ts";
import { Tuio20Client } from "../tuio20/Tuio20Client.ts"
import { Tuio20Object } from "../tuio20/Tuio20Object.ts";
import { Tuio20Pointer } from "../tuio20/Tuio20Pointer.ts";
import { Tuio20Token } from "../tuio20/Tuio20Token.ts";
import { Visuals } from "./Visuals.js";


export class Tuio20Canvas {
	_canvasWidth: number;
	_canvasHeight: number;
	_sensorWidth: number;
	_sensorHeight: number;
	_drawingScale: number;
	_context: CanvasRenderingContext2D | null;
	_size: number[];
	_colors_2: string[];
	_colorPointer: number;
	_shouldDraw: boolean;
	_drawing: boolean;
	_ui: HTMLElement | null;
	_canvas: HTMLCanvasElement | null;
	_touches: Map<number, any>;
	_tokens: Map<number, any>;
	_blobs: Map<number, any>;
	_tuioReceiver: WebsocketTuioReceiver;
	_tuio20Client: any;


	constructor(hostname: string) {
		this._canvasWidth = 0;
		this._canvasHeight = 0;
		this._sensorWidth = 0;
		this._sensorHeight = 0;
		this._drawingScale = 0.4;
		this._size = [160, 90];
		this._colors_2 = [
			'#91d255',
			'#55c8b4',
			'#2896af',
			'#73d2ff',
			'#ffa541',
			'#eb4b50',
			'#f57d7d',
			'#e1afdc',
			'#d2b4a0',
			'#d7af69'
		];

		this._colorPointer = 0;
		this._shouldDraw = false;
		this._drawing = false;

		this._ui = document.getElementById("tuio20div")
		this._canvas = document.getElementById("tuio20canvas") as HTMLCanvasElement;

		window.onresize = this.onWindowResize.bind(this);

		this.onWindowResize();

		this._context = this._canvas.getContext("2d", { alpha: true });

		this._touches = new Map<number, any>();
		this._tokens = new Map<number, any>();
		this._blobs = new Map<number, any>();
		this._tuioReceiver = new WebsocketTuioReceiver("ws://" + hostname + ":3343/");
		console.log(`Connected to ws://${hostname}:3343`)
		this._tuio20Client = new Tuio20Client(this._tuioReceiver);
		this._tuio20Client.addTuioListener(this);


	}

	private getColor() {
		var use = this._colors_2;
		let color = use[this._colorPointer];
		this._colorPointer = (this._colorPointer + 1) % use.length;
		return color;
	};

	private draw() {
		if (this._shouldDraw) {
			this._drawing = true;
			this.prepareCanvas();

			for (var b in this._blobs.values()) {
				this.drawBlob(b);
			}

			for (var t in this._touches.values()) {
				this.drawTouch(t);
			}

			for (var t in this._tokens.values()) {
				this.drawToken(t);
			}

			window.requestAnimationFrame(this.draw.bind(this));
		}

		this._drawing = false;
	};

	private startDrawing() {
		if (!this._shouldDraw) {
			this._shouldDraw = true
			window.requestAnimationFrame(this.draw.bind(this));
		}
	};

	private stopDrawing() {
		this._shouldDraw = false;
	};

	private openSocket() {
		this._tuio20Client.connect();
		this.startDrawing();
	};

	private closeSocket() {
		this.stopDrawing();
		this._tuio20Client.disconnect();
	};

	private addTuioPointer(tuioPointer: Tuio20Pointer) {
		this._touches.set(
			tuioPointer.sessionId,
			{
				tuioPointer: tuioPointer,
				visual: new Visuals(this.getColor(), true),
			}
		);
	};

	private addTuioBounds(tuioBounds: Tuio20Bounds) {
		this._blobs.set(
			tuioBounds.sessionId,
			{
				tuioBounds: tuioBounds,
				visual: new Visuals(this.getColor()),
			}
		);
	};

	private addTuioToken(tuioToken: Tuio20Token) {
		this._tokens.set(
			tuioToken.sessionId,
			{
				tuioToken: tuioToken,
				visual: new Visuals(this.getColor()),
				uuId: "",
				time: new Date().getTime(),
			}
		);
	};

	private onWindowResize() {
		this.setCanvasSize(window.innerWidth, window.innerHeight);
	};

	private tuioAdd(tuioObject: Tuio20Object) {
		console.log("TUIO Add event", true);
		if (tuioObject.containsNewTuioPointer()) {
			console.log("Add Pointer", true);
			this.addTuioPointer(tuioObject.pointer);
		}
		if (tuioObject.containsNewTuioToken()) {
			console.log("Add Token", true);
			this.addTuioToken(tuioObject.token);
		}
		if (tuioObject.containsNewTuioBounds()) {
			console.log("Add bounds", true);
			this.addTuioBounds(tuioObject.bounds);
		}
	}

	private tuioUpdate(tuioObject: Tuio20Object) {
	}

	private tuioRemove(tuioObject: Tuio20Object) {
		console.log("TUIO Remove event", true);
		if (tuioObject.containsTuioPointer()) {
			console.log("Remove Pointer", true);
			this._touches.delete(tuioObject.sessionId);
		}
		if (tuioObject.containsTuioToken()) {
			console.log("Remove Token", true);
			this._tokens.delete(tuioObject.sessionId);
			var hasNoObjects = true;
			for (var k in this._tokens) {
				hasNoObjects = false;
				break;
			}
			if (hasNoObjects) {
				console.log("last object gone", true);
			}
		}
		if (tuioObject.containsTuioBounds()) {
			console.log("Remove bounds", true);
			this._blobs.delete(tuioObject.sessionId);
		}
	}

	private tuioRefresh(tuioTime: TuioTime) {
		this._size = [this._tuio20Client.dim % 65536, Math.floor(this._tuio20Client.dim / 65536)];
	}

	private clearObjectsAndTouchesList() {
		this._touches = new Map<number, any>();
		this._tokens = new Map<number, any>();
		this._blobs = new Map<number, any>();
		this._objectCount = 0;
	}

	private show() {
		this.clearObjectsAndTouchesList();
		document.body.append(this._ui);
		this.openSocket();
	}

	private hide() {
		this.stopDrawing();
		this.closeSocket();
	}

	// Visualization and utilities

	private setCanvasSize(width: number, height: number) {
		if (!!this._canvas) {
			this._canvas.width = width;
			this._canvas.height = height;
			this._canvas.style = "{width: width+'px',height: height+'px'}";
			this._ui.style = "{width: width+'px',height: height+'px'}";
			this._canvasWidth = this._canvas.width;
			this._canvasHeight = this._canvas.height;
		}
	};

	private degToRad(deg: number) {
		return deg * Math.PI / 180.0;
	};

	private radToDeg(rad: number) {
		return rad * 180.0 / Math.PI;
	};

	private strokeRect(x: number, y: number, width: number, height: number, angle: number, radius: number) {
		if (width < 2 * radius) radius = width / 2;
		if (height < 2 * radius) radius = height / 2;
		if (!!this._context) {
			this._context.save();
			this._context.translate(x, y);
			this._context.rotate(angle);
			this._context.beginPath();
			this._context.moveTo(-0.5 * width + radius, -0.5 * height);
			this._context.arcTo(0.5 * width, -0.5 * height, 0.5 * width, 0.5 * height, radius);
			this._context.arcTo(0.5 * width, 0.5 * height, -0.5 * width, 0.5 * height, radius);
			this._context.arcTo(-0.5 * width, 0.5 * height, -0.5 * width, -0.5 * height, radius);
			this._context.arcTo(-0.5 * width, -0.5 * height, 0.5 * width, -0.5 * height, radius);
			this._context.stroke();
			this._context.closePath();
			this._context.restore();
		}
	}


	private drawBlob(blob: Tuio20Bounds) {
		blob.visual.step();
		let i = 0;
		var c = blob.visual.getCircle(i);
		var x = blob.tuioBounds.xPos * this._size[0] / this._drawingScale;
		var y = blob.tuioBounds.yPos * this._size[1] / this._drawingScale;
		var r = c.radius - 80
		var w = blob.tuioBounds.width * this._size[0] / this._drawingScale + 2 * r;
		var h = blob.tuioBounds.height * this._size[1] / this._drawingScale + 2 * r;
		if (!!this._context) {
			this._context.strokeStyle = "rgba(" + c.rgbColor.r + "," + c.rgbColor.g + "," + c.rgbColor.b + "," + c.alpha + ")";
			this._context.lineWidth = c.thickness;
		}
		this.strokeRect(this._context, x, y, w, h, blob.tuioBounds.angle, r);
	}

	private drawTouch(touch: any) {
		if (!this._context) return;

		touch.visual.step();
		var x = touch.tuioPointer.xPos * this._size[0] / this._drawingScale;
		var y = touch.tuioPointer.yPos * this._size[1] / this._drawingScale;
		let i = 0;
		var c = touch.visual.getCircle(i);
		this._context.strokeStyle = "rgba(" + c.rgbColor.r + "," + c.rgbColor.g + "," + c.rgbColor.b + "," + c.alpha + ")";
		this._context.lineWidth = c.thickness;
		this._context.beginPath();
		this._context.arc(x, y, c.radius, this.degToRad(c.rotation), this.degToRad(c.rotation + 315));
		this._context.stroke();
		this._context.closePath();
	}

	private drawToken(token: any) {
		if (!this._context) return;

		var x = token.tuioToken.xPos * this._size[0] / this._drawingScale;
		var y = token.tuioToken.yPos * this._size[1] / this._drawingScale;

		token.visual.step();

		let i = 0;
		var c = token.visual.getCircle(i);
		this._context.strokeStyle = "rgba(" + c.rgbColor.r + "," + c.rgbColor.g + "," + c.rgbColor.b + "," + c.alpha + ")";
		this._context.lineWidth = c.thickness;
		this._context.beginPath();
		this._context.arc(x, y, c.radius, this.degToRad(c.rotation), this.degToRad(c.rotation + 315));
		this._context.stroke();
		this._context.closePath();
		var rectWidth = 441;
		var rectHeight = 441;

		x -= rectWidth / 2;
		y -= rectHeight / 2;

		var rotation = token.tuioToken.angle;
		var color = token.visual.getColor();
		this._context.translate(x + rectWidth / 2, y + rectHeight / 2);
		this._context.rotate(rotation);

		this._context.font = "bold 24px Arial";
		this._context.fillStyle = color;
		this._context.textAlign = "right";

		//rotation
		var text = (Math.round(this.radToDeg(rotation)) % 360) + "°";
		this._context.fillText(text, -rectWidth / 2 - 20, 0);

		//markerId
		text = "ID: " + (token.tuioToken.cId == "0" ? "-" : token.tuioToken.cId);
		this._context.textAlign = "left";
		this._context.fillText(text, rectWidth / 2 + 20, 0);


		this._context.rotate(-rotation);
		this._context.translate(-(x + rectWidth / 2), -(y + rectHeight / 2));
	}

	private prepareCanvas() {
		if (!this._context) return;

		this._context.setTransform(1, 0, 0, 1, 0, 0);
		this._context.clearRect(-this._canvasWidth, -this._canvasHeight, this._canvasWidth * 3, this._canvasHeight * 3);
		this._context.fillStyle = "#1d1d1d";
		this._context.fillRect(-this._canvasWidth, -this._canvasHeight, this._canvasWidth * 3, this._canvasHeight * 3);

		this._sensorWidth = this._canvasWidth;
		this._sensorHeight = this._canvasHeight;

		if (this._size[0] > 0 && this._size[1] > 0) {
			if (this._sensorWidth / this._sensorHeight > this._size[0] / this._size[1]) {
				this._sensorWidth = this._sensorHeight * this._size[0] / this._size[1];
			} else if (this._sensorWidth / this._sensorHeight < this._size[0] / this._size[1]) {
				this._sensorHeight = this._sensorWidth * this._size[1] / this._size[0];
			}
		}

		this._context.setTransform(1, 0, 0, 1, 0, 0);
		this._context.translate(0.5 * (this._canvasWidth - this._sensorWidth), 0.5 * (this._canvasHeight - this._sensorHeight));
		this._context.scale(this._drawingScale * this._sensorHeight / this._size[1], this._drawingScale * this._sensorHeight / this._size[1]);

		this._context.fillStyle = "#000000";
		this._context.fillRect(0, 0, this._size[0] / this._drawingScale, this._size[1] / this._drawingScale);
	}
};
