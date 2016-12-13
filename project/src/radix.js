// ## Radix chart ###################################
(function( astrology ) {
	
	var context;
    
	/**
	 * Radix charts.
	 * 
	 * @class
	 * @public
	 * @constructor
 	 * @param {astrology.SVG} paper 
	 * @param {int} cx
	 * @param {int} cy
	 * @param {int} radius
	 * @param {Object} data
	 */
	astrology.Radix = function( paper, cx, cy, radius, data ){
		
		// Validate data
		var status = astrology.utils.validate(data);		 		
		if( status.hasError ) {										
			throw new Error( status.messages );
		}
		
		this.data = data;								
		this.paper = paper; 
		this.cx = cx;
		this.cy = cy;
		this.radius = radius;
		
		this.shift = 0;		
		if(this.data.cusps && this.data.cusps[0]){
			var deg360 = astrology.utils.radiansToDegree(2*Math.PI);
			this.shift = deg360 - this.data.cusps[0];	
		}	
				
		this.universe = document.createElementNS(this.paper.root.namespaceURI, "g");
		this.universe.setAttribute('id', astrology.ID_CHART + "-" + astrology.ID_RADIX);
		this.paper.root.appendChild( this.universe );
		
		context = this;
			
		return this;
	};
	
	/**
	 * Draw background
	 */
	astrology.Radix.prototype.drawBg = function(){				
		var universe = this.universe;		
										
		// Background consists of two segments.
		// TODO - one segment		
		var northernHemisphere = this.paper.segment( this.cx, this.cy, this.radius-this.radius/astrology.INNER_CIRCLE_RADIUS_RATIO, 0, astrology.utils.radiansToDegree( Math.PI ), this.radius/astrology.INDOOR_CIRCLE_RADIUS_RATIO);
		northernHemisphere.setAttribute("fill", astrology.STROKE_ONLY ? "none" : astrology.COLOR_BACKGROUND);				
		universe.appendChild( northernHemisphere );
		
		var southHemisphere = this.paper.segment( this.cx, this.cy, this.radius-this.radius/astrology.INNER_CIRCLE_RADIUS_RATIO, astrology.utils.radiansToDegree( Math.PI ), 0, this.radius/astrology.INDOOR_CIRCLE_RADIUS_RATIO);
		southHemisphere.setAttribute("fill", astrology.STROKE_ONLY ? "none" : astrology.COLOR_BACKGROUND);				
		universe.appendChild( southHemisphere );				
	};
		
	/**
	 * Draw universe.
	 */
	astrology.Radix.prototype.drawUniverse = function(){
		var universe = this.universe;
		
		// colors 
        for( var i = 0, step = 30, start = this.shift, len = astrology.COLORS_SIGNS.length; i < len; i++ ){ 
        	        	        	       	        	                	        	        	     
        	var segment = this.paper.segment( this.cx, this.cy, this.radius, start, start+step, this.radius-this.radius/astrology.INNER_CIRCLE_RADIUS_RATIO);        	        	
        	segment.setAttribute("fill", astrology.STROKE_ONLY ? "none" : astrology.COLORS_SIGNS[i]);        	        	        	
        	segment.setAttribute("stroke", astrology.STROKE_ONLY ? astrology.COLOR_CIRCLE: "none");		 				 				 		
 			segment.setAttribute("stroke-width", astrology.STROKE_ONLY ? 1 : 0); 				
        	universe.appendChild( segment );
        	
        	
        	        	        	        	               		
			start += step;
        };
	};
	
	/**
	 * Draw points
	 */
	astrology.Radix.prototype.drawPoints = function(){
		if(this.data.points == null){
			return;
		}
		
		var universe = this.universe;		
		var wrapper = astrology.utils.getEmptyWrapper( universe, astrology.ID_CHART + "-" + astrology.ID_RADIX + "-" + astrology.ID_POINTS);
		
		// Planets can not be displayed on the same radius.
		// The gap between indoor circle and outdoor circle / count of planets
		var padding = 2 * astrology.PADDING * astrology.SYMBOL_SCALE;
		var gap = this.radius - (this.radius/astrology.INNER_CIRCLE_RADIUS_RATIO + this.radius/astrology.INDOOR_CIRCLE_RADIUS_RATIO);
		var radiusStep = (gap - padding) / Object.keys(this.data.points).length;	
		var planetRadius = (this.radius/astrology.INDOOR_CIRCLE_RADIUS_RATIO) + padding;
									
		for (var planet in this.data.points) {
 		   if (this.data.points.hasOwnProperty( planet )) {
 		   		var position = astrology.utils.getPointPosition( this.cx, this.cy, planetRadius, this.data.points[planet] + this.shift);
        		var symbol = this.paper.getSymbol(planet, position.x, position.y);
        		symbol.setAttribute('id', astrology.ID_CHART + "-" + astrology.ID_RADIX + "-" + astrology.ID_POINTS + "-" + planet);
        		symbol.setAttribute('data-radius', planetRadius);
        		wrapper.appendChild( symbol );
        		planetRadius += radiusStep;
    		}
		}		
	};
	
	/**
	 * Draw cusps
	 */
	astrology.Radix.prototype.drawCusps = function(){
		if(this.data.cusps == null){
			return;
		}
		
		var universe = this.universe;
		
		var AS = 0;
		var IC = 3;
		var DC = 6;
		var MC = 9;
		var numbersRadius = this.radius/astrology.INDOOR_CIRCLE_RADIUS_RATIO + astrology.PADDING;
		var overlap = 15 * astrology.SYMBOL_SCALE; // px
		var axisRadius = this.radius + overlap;
				
		//Cusps
		for (var i = 0, ln = this.data.cusps.length; i < ln; i++) {
 			
 			// Lines
 			var topPosition, line;
 			var bottomPosition = astrology.utils.getPointPosition( this.cx, this.cy, this.radius/astrology.INDOOR_CIRCLE_RADIUS_RATIO, this.data.cusps[i] + this.shift);   			 			
 			if( i == AS || i == IC || i == DC || i == MC ){ 			
 				topPosition = astrology.utils.getPointPosition( this.cx, this.cy, axisRadius, this.data.cusps[i] + this.shift);
 				line = this.paper.line( bottomPosition.x, bottomPosition.y, topPosition.x, topPosition.y); 				 			
 				line.setAttribute("stroke", astrology.COLOR_LINE);		 				 				 		
 				line.setAttribute("stroke-width", 2);
 			}else{
 				topPosition = astrology.utils.getPointPosition( this.cx, this.cy, this.radius - this.radius/astrology.INNER_CIRCLE_RADIUS_RATIO, this.data.cusps[i] + this.shift);
 				line = this.paper.line( bottomPosition.x, bottomPosition.y, topPosition.x, topPosition.y);
 				line.setAttribute("stroke", astrology.COLOR_LINE);		 				 				 		
 				line.setAttribute("stroke-width", 1);
 			} 			 			 			 			 		
 		 	universe.appendChild( line ); 
 		 	 		 	
 		 	// Cup number 
 		 	var xShift = 6; //px
 		 	var deg360 = astrology.utils.radiansToDegree( 2 * Math.PI );
 		 	var startOfCusp = this.data.cusps[i];
 		 	var endOfCusp = this.data.cusps[ (i+1)%12 ];
 		 	var gap = endOfCusp - startOfCusp > 0 ? endOfCusp - startOfCusp : endOfCusp - startOfCusp + deg360;
 		 	var textPosition = astrology.utils.getPointPosition( this.cx, this.cy, numbersRadius, ((startOfCusp + gap/2) % deg360) + this.shift );
 		 	universe.appendChild( this.paper.text( i+1, textPosition.x - xShift, textPosition.y, astrology.FONT_SIZE + "px", astrology.FONT_COLOR ));
 		 	  		 			 
 		 	// As
 		 	if(i == 0){ 
 		 		// Text
 		 		textPosition = astrology.utils.getPointPosition( this.cx, this.cy, axisRadius + 1.5*overlap, this.data.cusps[i] + this.shift);
 		 		universe.appendChild( this.paper.text( "As", textPosition.x, textPosition.y, astrology.FONT_SIZE * 1.5 + "px", astrology.FONT_COLOR ));
 		 	}
 		 	 		 	 		 	 		
 		 	// Dc
 		 	if(i == 6){  		 		 		 		 		 		 		 
 		 		// Text
 		 		textPosition = astrology.utils.getPointPosition( this.cx, this.cy, axisRadius, this.data.cusps[i] + this.shift);
 		 		universe.appendChild( this.paper.text( "Dc", textPosition.x, textPosition.y, astrology.FONT_SIZE * 1.5 + "px", astrology.FONT_COLOR ));
 		 	}
 		 	 		 	
 		 	// Ic
 		 	if(i == 3){ 
 		 		// Text
 		 		textPosition = astrology.utils.getPointPosition( this.cx, this.cy, axisRadius + 0.7*overlap, this.data.cusps[i] - 2 + this.shift);
 		 		universe.appendChild( this.paper.text( "Ic", textPosition.x, textPosition.y, astrology.FONT_SIZE * 1.5 + "px", astrology.FONT_COLOR ));
 		 	}
 		 	
 		 	// Mc
 		 	if(i == 9){ 		 		 		 	
 		 		// Text
 		 		textPosition = astrology.utils.getPointPosition( this.cx, this.cy, axisRadius + overlap, this.data.cusps[i] + 2 + this.shift);
 		 		universe.appendChild( this.paper.text( "Mc", textPosition.x, textPosition.y, astrology.FONT_SIZE * 1.5 + "px", astrology.FONT_COLOR ));
 		 	} 		 
		}
	};
	
	/**
	 * Draw aspects
	 */
	astrology.Radix.prototype.aspects = function( data ){
		
		// TODO
		// validate data
								
		var wrapper = astrology.utils.getEmptyWrapper( this.universe, astrology.ID_CHART + "-" + astrology.ID_ASPECTS );
					
        for( var i = 0, len = data.length; i < len; i++ ){ 
        	var startPosition = astrology.utils.getPointPosition( this.cx, this.cy, this.radius/astrology.INDOOR_CIRCLE_RADIUS_RATIO, data[i][0] + this.shift);
        	var endPosition = astrology.utils.getPointPosition( this.cx, this.cy, this.radius/astrology.INDOOR_CIRCLE_RADIUS_RATIO, data[i][1] + this.shift);
        	var line = this.paper.line( startPosition.x, startPosition.y, endPosition.x, endPosition.y);        	
        	line.setAttribute("stroke", astrology.STROKE_ONLY ? astrology.FONT_COLOR : data[i][2]);		 				 				 		
 			line.setAttribute("stroke-width", 1);        	
        	wrapper.appendChild( line );
        }
        
        // this
        return context;
	};
	
	/**
	 * Draw signs symbols
	 * .
	 */
	astrology.Radix.prototype.drawSigns = function(){
		var universe = this.universe;
		
		// signs
        for( var i = 0, step = 30, start = 15 + this.shift, len = astrology.SYMBOL_SIGNS.length; i < len; i++ ){ 
        	var position = astrology.utils.getPointPosition( this.cx, this.cy, this.radius - (this.radius/astrology.INNER_CIRCLE_RADIUS_RATIO)/2, start);       	        	                	
        	universe.appendChild( this.paper.getSymbol( astrology.SYMBOL_SIGNS[i], position.x, position.y));        	        	        	               		
			start += step;
        }
	};
	
	/**
	 * Draw circles
	 */
	astrology.Radix.prototype.drawCircles = function drawCircles(){
		var universe = this.universe;
						
		var circle;
		
		//outdoor circle
		circle = this.paper.circle( this.cx, this.cy, this.radius);
		circle.setAttribute("stroke", astrology.COLOR_CIRCLE);		 
		circle.setAttribute("stroke-width", 1);
        universe.appendChild( circle );
       	
       	//inner circle
       	circle = this.paper.circle( this.cx, this.cy, this.radius-this.radius/astrology.INNER_CIRCLE_RADIUS_RATIO);
       	circle.setAttribute("stroke", astrology.COLOR_CIRCLE);		 
		circle.setAttribute("stroke-width", 1);
        universe.appendChild( circle );
        
        //indoor circle
        circle = this.paper.circle( this.cx, this.cy, this.radius/astrology.INDOOR_CIRCLE_RADIUS_RATIO);
        circle.setAttribute("stroke", astrology.COLOR_CIRCLE);		 
		circle.setAttribute("stroke-width", 1);		
       	universe.appendChild( circle );       	       
	};
	
	/**
	 * Draw ruler
	 */
	astrology.Radix.prototype.drawRuler = function drawRuler(){
		var universe = this.universe;
				
		// rays
        var lineLength = 3;
        for( i = 0, start = 0, step = 5;i < 72; i++ ){ 
            var startPosition = astrology.utils.getPointPosition( this.cx, this.cy, this.radius - (this.radius/astrology.INNER_CIRCLE_RADIUS_RATIO + lineLength) , start + this.shift );
        	var endPosition = astrology.utils.getPointPosition( this.cx, this.cy, this.radius-this.radius/astrology.INNER_CIRCLE_RADIUS_RATIO, start + this.shift);
       		var line = this.paper.line( startPosition.x, startPosition.y, endPosition.x, endPosition.y);       		       		       
       		line.setAttribute("stroke", astrology.COLOR_CIRCLE);		 				 				 		
 			line.setAttribute("stroke-width", 1);       		
       		universe.appendChild( line );
       		start += step;
       	}       		
	};
		
	/**
	 * Display transit horoscope
	 * 
	 * @param {Object} data
	 * @example
	 *	{
	 *		"points":{"Moon":0, "Sun":30,  ... },
	 *		"cusps":[300, 340, 30, 60, 75, 90, 116, 172, 210, 236, 250, 274],
	 *		"aspects":[[20,110,"#ff0"], [200,245,"#f0f"]] 
	 *	} 
	 * 
	 * @return {astrology.Transit} transit
	 */
	astrology.Radix.prototype.transit = function( data ){
		var transit = new astrology.Transit(context, data);
		transit.drawRuler();						
		transit.drawPoints();		
		context.drawCircles();		
		return transit; 
	};
		
}( window.astrology = window.astrology || {}));
