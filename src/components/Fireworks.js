import React from 'react';

import styled from 'styled-components'

const CanvasContainer = styled.div`
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  position: absolute;
  z-index: 2;
`;

var rand = function(rMi, rMa){return ~~((Math.random()*(rMa-rMi+1))+rMi);}

var hitTest = function(x1, y1, w1, h1, x2, y2, w2, h2){return !(x1 + w1 < x2 || x2 + w2 < x1 || y1 + h1 < y2 || y2 + h2 < y1);};


var requestAnimFrame=function(){return window.requestAnimationFrame||window.webkitRequestAnimationFrame||window.mozRequestAnimationFrame||window.oRequestAnimationFrame||window.msRequestAnimationFrame||function(a){window.setTimeout(a,1E3/60)}}();

class Fireworks extends React.Component {
  constructor(props) {
    super(props);
    this.canvasRef = React.createRef();

    const self = this;

    var Particle = function(x, y, hue){
      this.x = x;
      this.y = y;
      this.coordLast = [
        {x: x, y: y},
        {x: x, y: y},
        {x: x, y: y}
      ];
      this.angle = rand(0, 360);
      this.speed = rand(((self.partSpeed - self.partSpeedVariance) <= 0) ? 1 : self.partSpeed - self.partSpeedVariance, (self.partSpeed + self.partSpeedVariance));
      this.friction = 1 - self.partFriction/100;
      this.gravity = self.partGravity/2;
      this.hue = rand(hue-self.hueVariance, hue+self.hueVariance);
      this.brightness = rand(50, 80);
      this.alpha = rand(40,100)/100;
      this.decay = rand(10, 50)/1000;
      this.wind = (rand(0, self.partWind) - (self.partWind/2))/25;
      this.lineWidth = self.lineWidth;
    };
    
    Particle.prototype.update = function(index){
      var radians = this.angle * Math.PI / 180;
      var vx = Math.cos(radians) * this.speed;
      var vy = Math.sin(radians) * this.speed + this.gravity;
      this.speed *= this.friction;
              
      this.coordLast[2].x = this.coordLast[1].x;
      this.coordLast[2].y = this.coordLast[1].y;
      this.coordLast[1].x = this.coordLast[0].x;
      this.coordLast[1].y = this.coordLast[0].y;
      this.coordLast[0].x = this.x;
      this.coordLast[0].y = this.y;
      
      this.x += vx * self.dt;
      this.y += vy * self.dt;
      
      this.angle += this.wind;				
      this.alpha -= this.decay;
      
      if(!hitTest(0,0,self.cw,self.ch,this.x-this.radius, this.y-this.radius, this.radius*2, this.radius*2) || this.alpha < .05){					
        self.particles.splice(index, 1);	
      }			
    };
    
    Particle.prototype.draw = function(){
      var coordRand = (rand(1,3)-1);
      self.ctx.beginPath();								
      self.ctx.moveTo(Math.round(this.coordLast[coordRand].x), Math.round(this.coordLast[coordRand].y));
      self.ctx.lineTo(Math.round(this.x), Math.round(this.y));
      self.ctx.closePath();				
      self.ctx.strokeStyle = 'hsla('+this.hue+', 100%, '+this.brightness+'%, '+this.alpha+')';
      self.ctx.stroke();				
      
      if(self.flickerDensity > 0){
        var inverseDensity = 50 - self.flickerDensity;					
        if(rand(0, inverseDensity) === inverseDensity){
          self.ctx.beginPath();
          self.ctx.arc(Math.round(this.x), Math.round(this.y), rand(this.lineWidth,this.lineWidth+3)/2, 0, Math.PI*2, false)
          self.ctx.closePath();
          var randAlpha = rand(50,100)/100;
          self.ctx.fillStyle = 'hsla('+this.hue+', 100%, '+this.brightness+'%, '+randAlpha+')';
          self.ctx.fill();
        }	
      }
    };

    var Firework = function(startX, startY, targetX, targetY){
      this.x = startX;
      this.y = startY;
      this.startX = startX;
      this.startY = startY;
      this.hitX = false;
      this.hitY = false;
      this.coordLast = [
        {x: startX, y: startY},
        {x: startX, y: startY},
        {x: startX, y: startY}
      ];
      this.targetX = targetX;
      this.targetY = targetY;
      this.speed = self.fworkSpeed;
      this.angle = Math.atan2(targetY - startY, targetX - startX);
      this.shockwaveAngle = Math.atan2(targetY - startY, targetX - startX)+(90*(Math.PI/180));
      this.acceleration = self.fworkAccel/100;
      this.hue = self.currentHue;
      this.brightness = rand(50, 80);
      this.alpha = rand(50,100)/100;
      this.lineWidth = self.lineWidth;
      this.targetRadius = 1;
    };
    
    Firework.prototype.update = function(index){
      self.ctx.lineWidth = this.lineWidth;
        
      let vx = Math.cos(this.angle) * this.speed;
      let vy = Math.sin(this.angle) * this.speed;
      this.speed *= 1 + this.acceleration;				
      this.coordLast[2].x = this.coordLast[1].x;
      this.coordLast[2].y = this.coordLast[1].y;
      this.coordLast[1].x = this.coordLast[0].x;
      this.coordLast[1].y = this.coordLast[0].y;
      this.coordLast[0].x = this.x;
      this.coordLast[0].y = this.y;
      
      if(self.showTarget){
        if(this.targetRadius < 8){
          this.targetRadius += .25 * self.dt;
        } else {
          this.targetRadius = 1 * self.dt;	
        }
      }
      
      if(this.startX >= this.targetX){
        if(this.x + vx <= this.targetX){
          this.x = this.targetX;
          this.hitX = true;
        } else {
          this.x += vx * self.dt;
        }
      } else {
        if(this.x + vx >= this.targetX){
          this.x = this.targetX;
          this.hitX = true;
        } else {
          this.x += vx * self.dt;
        }
      }
      
      if(this.startY >= this.targetY){
        if(this.y + vy <= this.targetY){
          this.y = this.targetY;
          this.hitY = true;
        } else {
          this.y += vy * self.dt;
        }
      } else {
        if(this.y + vy >= this.targetY){
          this.y = this.targetY;
          this.hitY = true;
        } else {
          this.y += vy * self.dt;
        }
      }				
      
      if(this.hitX && this.hitY){
        var randExplosion = rand(0, 9);
        self.createParticles(this.targetX, this.targetY, this.hue);
        self.fireworks.splice(index, 1);					
      }
    };
    
    Firework.prototype.draw = function(){
      self.ctx.lineWidth = this.lineWidth;
        
      var coordRand = (rand(1,3)-1);					
      self.ctx.beginPath();							
      self.ctx.moveTo(Math.round(this.coordLast[coordRand].x), Math.round(this.coordLast[coordRand].y));
      self.ctx.lineTo(Math.round(this.x), Math.round(this.y));
      self.ctx.closePath();
      self.ctx.strokeStyle = 'hsla('+this.hue+', 100%, '+this.brightness+'%, '+this.alpha+')';
      self.ctx.stroke();	
      
      if(self.showTarget){
        self.ctx.save();
        self.ctx.beginPath();
        self.ctx.arc(Math.round(this.targetX), Math.round(this.targetY), this.targetRadius, 0, Math.PI*2, false)
        self.ctx.closePath();
        self.ctx.lineWidth = 1;
        self.ctx.stroke();
        self.ctx.restore();
      }
        
      if(self.showShockwave){
        self.ctx.save();
        self.ctx.translate(Math.round(this.x), Math.round(this.y));
        self.ctx.rotate(this.shockwaveAngle);
        self.ctx.beginPath();
        self.ctx.arc(0, 0, 1*(this.speed/5), 0, Math.PI, true);
        self.ctx.strokeStyle = 'hsla('+this.hue+', 100%, '+this.brightness+'%, '+rand(25, 60)/100+')';
        self.ctx.lineWidth = this.lineWidth;
        self.ctx.stroke();
        self.ctx.restore();
      }								 
    };

    this.Firework = Firework;
    this.Particle = Particle;

  }

  passContext(Constructor, args) {
    function F() {
      return Constructor.apply(this, args);
    }
    F.prototype = Constructor.prototype;
    return new F();
  }

  init(canvas) {
    this.dt = 0;
		this.oldTime = Date.now();
		this.canvas = canvas;
		
		this.canvas.width = this.cw = window.innerWidth;
		this.canvas.height = this.ch = window.innerHeight;	
		
		this.particles = [];	
		this.partCount = 120;
		this.fireworks = [];	
		this.mx = this.cw/2;
		this.my = this.ch/2;
		this.currentHue = 30;
		this.partSpeed = 5;
		this.partSpeedVariance = 10;
		this.partWind = 50;
		this.partFriction = 5;
		this.partGravity = 1;
		this.hueMin = 0;
		this.hueMax = 360;
		this.fworkSpeed = 10;
		this.fworkAccel = 4;
		this.hueVariance = 30;
		this.flickerDensity = 20;
		this.showShockwave = false;
		this.showTarget = false;
		this.clearAlpha = 80;

		this.ctx = this.canvas.getContext('2d');
		this.ctx.lineCap = 'round';
		this.ctx.lineJoin = 'round';
		this.lineWidth = 1;
		// this.bindEvents();			
		this.canvasLoop();
		
		this.canvas.onselectstart = function() {
			return false;
    };
    
    let initialLaunchCount = 100;
    while(initialLaunchCount--){
      setTimeout(() => {
        this.fireworks.push(this.passContext(this.Firework, [this.cw/2, this.ch, rand(50, this.cw-50), rand(50, this.ch/2)-50]));
      }, initialLaunchCount*150);
    }
  }

  createParticles(x,y, hue){
    var countdown = this.partCount;
		while(countdown--){						
			this.particles.push(this.passContext(this.Particle, [x, y, hue]));
		}
	}
	
	updateParticles(){
		var i = this.particles.length;
		while(i--){
			var p = this.particles[i];
			p.update(i);
		};
	}
	
	drawParticles(){
		var i = this.particles.length;
		while(i--){
			var p = this.particles[i];				
			p.draw();				
		};
	}

  canvasLoop() {
    // requestAnimFrame(this.canvasLoop, this.canvas);
    setTimeout(() => { this.canvasLoop() }, 1E3/60);
    this.updateDelta();
		this.ctx.globalCompositeOperation = 'destination-out';
		this.ctx.fillStyle = 'rgba(0,0,0,'+this.clearAlpha/100+')';
		this.ctx.fillRect(0,0,this.cw,this.ch);
		this.ctx.globalCompositeOperation = 'lighter';
		this.updateFireworks();
		this.updateParticles();
		this.drawFireworks();			
		this.drawParticles();
  }

  createFireworks(startX, startY, targetX, targetY) {
		this.fireworks.push(this.passContext(this.Firework, [startX, startY, targetX, targetY]));
	}
	
	updateFireworks() {
    var i = this.fireworks.length;
		while(i--){
      var f = this.fireworks[i];
			f.update(i);
		};
	}
	
	drawFireworks() {
		var i = this.fireworks.length;			
		while(i--){
			var f = this.fireworks[i];		
			f.draw();
		};
	}
	
	clear() {
		this.particles = [];
		this.fireworks = [];
		this.ctx.clearRect(0, 0, this.cw, this.ch);
	}
  
  updateDelta() {
		var newTime = Date.now();
		this.dt = (newTime - this.oldTime)/16;
		this.dt = (this.dt > 5) ? 5 : this.dt;
		this.oldTime = newTime;	
	}

  componentDidUpdate() {
    if (this.props.init === true) {
      this.init(this.canvasRef.current);
    }
  }

  render() {
    if (this.props.init === false) {
      return false;
    }

    return (
      <CanvasContainer>
        <canvas ref={this.canvasRef} />
      </CanvasContainer>
    )
  }
}

export default Fireworks;
