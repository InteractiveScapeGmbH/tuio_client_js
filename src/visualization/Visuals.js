export class Visuals {
	constructor(color, isTouch=false) {
		this.fps = 60;

		/*General*/

		this._hexColor = color;
		this._rgbColor = null;

		this._thickness = [ 10.0, 5.375, 3.0, 2.125, 2.0 ];
		this._didAppear = false;
		this._actFrame = 0;
		this.max_scale = 1.075;
		this.min_scale = 1.0;

		this._delay = [
			0,
			this.fps / 1000.0 * 160,
			this.fps / 1000.0 * 340,
			this.fps / 1000.0 * 540,
			this.fps / 1000.0 * 760
		]


		/*Alpha*/

		this._alpha = [ 1.0, 0.53125, 0.375, 0.28125, 0.25 ];
		this._drawAlpha = [ 0, 0, 0, 0, 0 ];
		this._alphaDirection = [ 1, 1, 1, 1, 1 ];
		this._appearAlphaStep = [
			this._alpha[0] / ((this.fps / 1000.0) * 500),
			this._alpha[1] / ((this.fps / 1000.0) * 500),
			this._alpha[2] / ((this.fps / 1000.0) * 500),
			this._alpha[3] / ((this.fps / 1000.0) * 500),
			this._alpha[4] / ((this.fps / 1000.0) * 500),
		];
		this._maxAlpha = 0.85;
		this._alphaStep = [
			0,
			( this._maxAlpha - this._alpha[1] ) / ((this.fps / 1000.0) * 2000),
			( this._maxAlpha - this._alpha[2] ) / ((this.fps / 1000.0) * 2000),
			( this._maxAlpha - this._alpha[3] ) / ((this.fps / 1000.0) * 2000),
			( this._maxAlpha - this._alpha[4] ) / ((this.fps / 1000.0) * 2000),
		];

		/*Rotation*/
		this._rotation = [ 0.0, 0.0, 0.0, 0.0, 0.0 ];
		this._rotationOffset = [
			( 360.0 / (this.fps * 10.0)),
			(-360.0 / (this.fps * 12.5)),
			( 360.0 / (this.fps * 15.0)),
			(-360.0 / (this.fps * 17.5)),
			( 360.0 / (this.fps * 20.0))
		];

		/*Radius*/
		this._maxScale = 1.075;
		this._radius = isTouch? [ 20, 30, 40, 50, 60 ] : [ 125, 145, 165, 185, 205 ];
		this._maxRadius = [
			this._radius[0] * this._maxScale,
			this._radius[1] * this._maxScale,
			this._radius[2] * this._maxScale,
			this._radius[3] * this._maxScale,
			this._radius[4] * this._maxScale
		];
		this._drawRadius = [ this._radius[0], this._radius[1], this._radius[2], this._radius[3], this._radius[4] ];
		this._radiusStep = [
			0,
			( this._maxRadius[1] - this._radius[1] ) / ((this.fps / 1000.0) * 2000),
			( this._maxRadius[2] - this._radius[2] ) / ((this.fps / 1000.0) * 2000),
			( this._maxRadius[3] - this._radius[3] ) / ((this.fps / 1000.0) * 2000),
			( this._maxRadius[4] - this._radius[4] ) / ((this.fps / 1000.0) * 2000),
		];
		this._radiusDirection = [ 1, 1, 1, 1, 1 ];
		this.init();
	}

	init() {
		for(let i=0;i<this._rotation.length;i++){
			this._rotation[i]=this.getRandomInt(0,360);
		}

		this._rgbColor = this.hexToRgb(this._hexColor);
	}

	getCircle(index){
		index = index % 5;
		return {
			radius : this._drawRadius[index],
			rotation : this._rotation[index],
			thickness : this._thickness[index],
			alpha : this._drawAlpha[index],
			hexColor : this._hexColor,
			rgbColor : this._rgbColor
		}
	}

	getColor(){
		return this._hexColor;
	}

	step(){
		this._actFrame++;
		this.stepRotation();
		this.stepAlpha();
		this.stepRadius();
	}

	stepAlpha(){
		if(!this._didAppear){
			for(let i=0;i<this._drawAlpha.length;i++){
				this._drawAlpha[i]+=this._appearAlphaStep[i];
				if(this._drawAlpha[i] >= this._alpha[i]){
					this._drawAlpha[i]=this._alpha[i];
				}
			}

			let allDone = true;

			for(let i=0;i<this._drawAlpha.length;i++){
				if(this._drawAlpha[i] !== this._alpha[i]){
					allDone = false;
					break;
				}
			}

			if(allDone){
				this._didAppear = true;
				this._actFrame = 0;
			}
		} else {
			for(let i=1;i<this._drawAlpha.length;i++){
				if(this._actFrame >= this._delay[i]){
					this._drawAlpha[i]+=this._alphaStep[i]*this._alphaDirection[i];

					if(this._drawAlpha[i]>=this._maxAlpha){
						this._drawAlpha[i]=this._maxAlpha;
						this._alphaDirection[i]=-1;
					}else if(this._drawAlpha[i] <= this._alpha[i]){
						this._drawAlpha[i]=this._alpha[i];
						this._alphaDirection[i]=1;
					}
				}
			}
		}
	}

	stepRotation(){
		for (let i = 0; i < this._rotation.length; i++) {
			this._rotation[i] += this._rotationOffset[i];
			if (this._rotation[i] < 0) {
				this._rotation[i] += 360.0;
			} else if (this._rotation[i] >= 360.0) {
				this._rotation[i] -= 360.0;
			}
		}
	}

	stepRadius(){
		if(this._didAppear){
			for(let i=1;i<this._drawRadius.length;i++){
				if(this._actFrame >= this._delay[i]){
					this._drawRadius[i]+=this._radiusStep[i]*this._radiusDirection[i];
					if(this._drawRadius[i]>=this._maxRadius[i]){
						this._drawRadius[i]=this._maxRadius[i];
						this._radiusDirection[i]=-1;
					}else if(this._drawRadius[i]<=this._radius[i]){
						this._drawRadius[i]=this._radius[i];
						this._radiusDirection[i]=1;
					}
				}
			}
		}
	}

	hexToRgb(hex) {
	    let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	    return result ? {
	        r: parseInt(result[1], 16),
	        g: parseInt(result[2], 16),
	        b: parseInt(result[3], 16)
	    } : {
	        r: 255,
	        g: 255,
	        b: 255
	    }
	}

	getRandomInt(min,max){
		if(min===undefined || min===null || min<0){ min=0; }
		if(max===undefined || max===null || max<=min){ max=min+10; }
		return(min+Math.round(Math.random()*(max-min+1)));
	}
}