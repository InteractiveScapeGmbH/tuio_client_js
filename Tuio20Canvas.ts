import {Tuio20Pointer} from "./src/tuio20/Tuio20Pointer";
import {Visuals} from "./src/visualization/Visuals";
import {Tuio20Token} from "./src/tuio20/Tuio20Token";
import {Tuio20Bounds} from "./src/tuio20/Tuio20Bounds";
import {WebsocketTuioReceiver} from "./src/common/WebsocketTuioReceiver";
import {Tuio20Client} from "./src/tuio20/Tuio20Client";
import {Tuio20Object} from "./src/tuio20/Tuio20Object";
import {TuioTime} from "./src/common/TuioTime";
import {Tuio20Listener} from "./src/tuio20/Tuio20Listener";
import {renderSVG} from 'uqr';
import {Vector} from "vecti";
import {ScapeXMobile, SxmConfig} from "./src/extensions/ScapeXMobile";
import {Tuio20Symbol} from "./src/tuio20/Tuio20Symbol";


interface PointerVisual{
	tuioPointer: Tuio20Pointer,
	visual: Visuals,
}

interface TokenVisual{
	tuioToken: Tuio20Token,
	visual: Visuals,
	uuid: string,
	time: number,
}

interface BlobVisual{
	tuioBounds: Tuio20Bounds,
	tuioSymbol: Tuio20Symbol,
	visual: Visuals
}

export class Tuio20Canvas implements Tuio20Listener{
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
	_touches: Map<number, PointerVisual>;
	_tokens: Map<number, TokenVisual>;
	_blobs: Map<number, BlobVisual>;
	_tuioReceiver: WebsocketTuioReceiver;
	_tuio20Client: Tuio20Client;
	_baseWebsite: string = "https://interactivescapegmbh.github.io/sxmtest.html";
	_website: string = ""
	_scapeXMobile: ScapeXMobile;


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

		// console.log(svg);

		this._touches = new Map();
		this._tokens = new Map();
		this._blobs = new Map();
		this._tuioReceiver = new WebsocketTuioReceiver(hostname, 3343);
		console.log(`Connected to ws://${hostname}:3343`)
		this._tuio20Client = new Tuio20Client(this._tuioReceiver);
		this._tuio20Client.addTuioListener(this);

		this._scapeXMobile = new ScapeXMobile("10.0.0.20");
		this._scapeXMobile.onConfigChange = (config) => this.updateQrCodeUrl(config);

	}

	private updateQrCodeUrl(config: SxmConfig){
		console.log(config)
		if(config.mqttUrl !== "" && config.roomId !== ""){
			this._website = `${this._baseWebsite}?r=${config.roomId}&u=${config.mqttUrl}`;
			console.log(this._website);
		}
	}

	private getColor() {
		var use = this._colors_2;
		let color = use[this._colorPointer];
		this._colorPointer = (this._colorPointer + 1) % use.length;
		return color;
	};

	private drawQrCode(data: string, position: Vector, size: Vector){
		if(!this._context) return;
		const svg = renderSVG(data);
		const img = new Image();
		img.src = `data:image/svg+xml,${svg}`;
		this._context?.drawImage(img, position.x, position.y, size.x, size.y);
	}

	private draw() {
		if (this._shouldDraw) {
			this._drawing = true;
			this.prepareCanvas();


			this._touches.forEach((token) =>{
				this.drawTouch(token);
			})

			this._tokens.forEach((token) =>{
				this.drawToken(token);
			});
			this._blobs.forEach((blob)=>{
				this.drawBlob(blob);
			})

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
		this._scapeXMobile.connect();
		this.startDrawing();
	};

	private closeSocket() {
		this.stopDrawing();
		this._tuio20Client.disconnect();
		this._scapeXMobile.disconnect();
	};

	private addTuioPointer(tuioPointer: Tuio20Pointer | null) {
		if(!tuioPointer) return;
		this._touches.set(
			tuioPointer.sessionId,
			{
				tuioPointer: tuioPointer,
				visual: new Visuals(this.getColor(), true),
			}
		);
	};

	private addTuioBounds(tuioBounds: Tuio20Bounds | null, tuioSymbol: Tuio20Symbol | null) {
		if(!tuioBounds) return;
		this._blobs.set(
			tuioBounds.sessionId,
			{
				tuioBounds: tuioBounds,
				tuioSymbol: tuioSymbol,
				visual: new Visuals(this.getColor()),
			}
		);
	};

	private addTuioToken(tuioToken: Tuio20Token | null) {
		if(!tuioToken) return;
		console.log(this._tokens);
		console.log(tuioToken.sessionId);
		this._tokens.set(
			tuioToken.sessionId,
			{
				tuioToken: tuioToken,
				visual: new Visuals(this.getColor()),
				uuid: "",
				time: new Date().getTime(),
			}
		);
		console.log(this._tokens);
	};

	private onWindowResize() {
		this.setCanvasSize(window.innerWidth, window.innerHeight);
	};

	public tuioAdd(tuioObject: Tuio20Object) {
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
			this.addTuioBounds(tuioObject.bounds, tuioObject.symbol);
		}
	}

	public tuioUpdate(tuioObject: Tuio20Object) {
		// if(tuioObject.containsTuioBounds()){
		// 	console.log(`bound_id: ${tuioObject.bounds.sessionId}`);
		// 	console.log(`symbol_id: ${tuioObject.symbol.sessionId}`);
		// }
	}

	public tuioRemove(tuioObject: Tuio20Object) {
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

	public tuioRefresh(tuioTime: TuioTime) {
		if(this._tuio20Client && this._tuio20Client.dim){
			this._size = [this._tuio20Client.dim % 65536, Math.floor(this._tuio20Client.dim / 65536)];
		}
	}

	private clearObjectsAndTouchesList() {
		console.log("clear lists");
		this._touches = new Map();
		this._tokens = new Map();
		this._blobs = new Map();
	}

	public show() {
		this.clearObjectsAndTouchesList();
		if(this._ui){
			document.body.append(this._ui);
		}
		this.openSocket();
	}

	public hide() {
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
		if(!this._context) return;
		if (width < 2 * radius) radius = width / 2;
		if (height < 2 * radius) radius = height / 2;
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


	private drawBlob(blob: BlobVisual) {
		if (!this._context) return;
		blob.visual.step();
		let i = 0;
		var c = blob.visual.getCircle(i);
		var x = blob.tuioBounds.position.x * this._size[0] / this._drawingScale;
		var y = blob.tuioBounds.position.y * this._size[1] / this._drawingScale;
		var r = c.radius - 80
		var w = blob.tuioBounds.size.x * this._size[0] / this._drawingScale + 2 * r;
		var h = blob.tuioBounds.size.y * this._size[1] / this._drawingScale + 2 * r;
		this._context.strokeStyle = "rgba(" + c.rgbColor?.r + "," + c.rgbColor?.g + "," + c.rgbColor?.b + "," + c.alpha + ")";
		this._context.lineWidth = c.thickness;
		this.strokeRect(x, y, w, h, blob.tuioBounds.angle, r);
		this._context.font = "bold 24px Arial";
		this._context.fillStyle = blob.visual.getColor();
		this._context.textAlign = "right";
		const text = "ID: " + (blob.tuioSymbol.data);
		this._context.textAlign = "left";
		this._context.fillText(text, x,y);
		this._context.rotate(-blob.tuioBounds.angle);
		this._context.translate(-(x + w / 2), -(y + h / 2));
	}

	private drawTouch(touch: PointerVisual) {
		if (!this._context) return;

		touch.visual.step();
		var x = touch.tuioPointer.position.x * this._size[0] / this._drawingScale;
		var y = touch.tuioPointer.position.y * this._size[1] / this._drawingScale;
		let i = 0;
		var c = touch.visual.getCircle(i);
		this._context.strokeStyle = "rgba(" + c.rgbColor?.r + "," + c.rgbColor?.g + "," + c.rgbColor?.b + "," + c.alpha + ")";
		this._context.lineWidth = c.thickness;
		this._context.beginPath();
		this._context.arc(x, y, c.radius, this.degToRad(c.rotation), this.degToRad(c.rotation + 315));
		this._context.stroke();
		this._context.closePath();
	}

	private drawToken(token: TokenVisual) {
		if (!this._context) return;

		var x = token.tuioToken.position.x * this._size[0] / this._drawingScale;
		var y = token.tuioToken.position.y * this._size[1] / this._drawingScale;

		token.visual.step();
		let i = 0;
		var c = token.visual.getCircle(i);
		this._context.strokeStyle = "rgba(" + c.rgbColor?.r + "," + c.rgbColor?.g + "," + c.rgbColor?.b + "," + c.alpha + ")";
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
		text = "ID: " + (token.tuioToken.cId == 0 ? "-" : token.tuioToken.cId);
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
		this.drawQrCode(this._website, new Vector(0,0), new Vector(300, 300));

	}
};
