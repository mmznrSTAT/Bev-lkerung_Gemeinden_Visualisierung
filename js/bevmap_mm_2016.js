(function () {

	window.onload = function () {
		console.log('Fenster ist geladen.');	
		
		///////////////////////
		//
		//	Layout
		//	
		var scale = 1.3;
		var width = 572,
			height = 750,
			legendeH = 160,
			mapH =540,
			gRatio = (1+Math.sqrt(5))/2;
		
		var svg = d3.select("#vis").append("svg")
			.attr("width", width)
			.attr("height", height);

		var legende = svg.append('g')
			.attr('id', 'legende')
			.attr('transform','translate('+(480)+','+0+')');


		var map =  svg.append("g")
			.attr('id', 'map')
			//.attr('transform','translate('+((1 - scale) * width/2)+','+((1 - scale) * mapH/2)+')scale('+scale+')');
			.attr('transform','translate('+0+','+20+')scale('+scale+')');
		
		var mapPfade =  map.append("g")
			.attr('id', 'mapPfade')
			.attr('transform', 'translate(30,0)');
	
		var mouseRect = svg.append('g')
			.attr('id', 'mouseRect')
			.attr('pointer-events', 'none');
			

	 var changeclass= function (){

	 	d3.selectAll(".v1")
	 	  .classed("active",true)

	  }
			;
		
		// Area legende
		
		var arealegend = mouseRect.append('g')
			.attr('pointer-events', 'none')
			.attr('id','arealegend')
			.attr('transform','translate('+(365)+','+(620)+')');

		var pattern = svg.append("defs")
			.append("pattern")
			.attr({ id:"hash4_4", width:"3", height:"3", patternUnits:"userSpaceOnUse", patternTransform:"rotate(60)"})
			.append("rect")
			.attr({ width:"1.5", height:"3", transform:"translate(0,0)", fill:"grey" });
			
		///////////////////////
		//
		//	Helper Functions
		//
		//IE 8 kennt die Funktion array.prototype nicht, wir brauchen sie aber zum Filtern der Daten:
		if (!Array.prototype.indexOf) {	
			Array.prototype.indexOf = function(obj, start) {
				 for (var i = (start || 0), j = this.length; i < j; i++) {
					 if (this[i] === obj) { return i; }
				 }
				 return -1;
			}
		}


		function trenner(number) {
			// Info: Die '' sind zwei Hochkommas
			number = '' + number;
			if (number.length > 3) {
				var mod = number.length % 3;
				var output = (mod > 0 ? (number.substring(0,mod)) : '');
				for (i=0 ; i < Math.floor(number.length / 3); i++) {
					if ((mod == 0) && (i == 0))
						output += number.substring(mod+ 3 * i, mod + 3 * i + 3);
					else
					// hier wird das Trennzeichen festgelegt mit '.'
					output+= "'" + number.substring(mod + 3 * i, mod + 3 * i + 3);
					}
					return (output);
				}
				else return number;
		}
		function getClose(num, array) {
			var curr = array[0];
			var diff = Math.abs(num - curr);
			for (i=0;i<array.length;i++) {
				var newDiff = Math.abs(num - array[i]);
				if (newDiff < diff) {
					diff = newDiff;
					curr = array[i];
				}
			}
			return curr;
		}

		///////////////////////
		//
		//	Parameters
		//
		var jahrend = 2018;		
		var jahrstart = jahrend-5;
		
		/// function to create array with years for the axis ticks (area chart)
		function range(size, startAt = 0) {
						return [...Array(size).keys()].map(i => i + startAt);
											}

        var yeararray = range(6, jahrstart)
		
		//
		//	Tooltip
		//
		var clickId = 0,
			clickIdPast = 0,
			clickStatus = 0;
		mouseRect.append('text')
			.attr('id', 'tipp')
			.attr('x', 20)
			.attr('y', mapH+20)
			.style('font-size', '14px')
			.text('Für die Entwicklung in den letzten fünf Jahren auf eine Gemeinde klicken.');
						

		var clickGemeinde = function (thisData, bbox) {
			d3.select('#tipp').remove();
			var mRectInnerPad = 5,
				//mRectW = 512,
				//mRectH = mRectW/gRatio,
				mRectH = 195.5+2*mRectInnerPad,
				//mRectH = 150+2*mRectInnerPad,
				mRectW = mRectH+mRectH*gRatio,
				mRectPad = 30;

			
			var maxY = d3.max(thisData.bevoelkerung, function(d) { return +d.total; });
			//console.log(maxY); 

			var yScale = d3.scale.linear()
				.domain([0,maxY])
				.range([mRectH-20,30])
				.nice()
			
			var xScale = d3.scale.linear()
				.domain([jahrstart,jahrend])
				.range([50,mRectW-mRectH]);
			
			var xAxis = d3.svg.axis()
				.scale(xScale)
				.orient("bottom")
				.ticks(5)
				.tickFormat(d3.format("d"));
			
			var yAxis = d3.svg.axis()
				.scale(yScale)
				.ticks(4)
				.orient("left");
					
			var areas = [];
			
// colors - blue / grey : #737373, #252525, #4682B4, #084594

			var areaAF = new Object;
			areaAF.area = d3.svg.area()
				.x(function(d) { return xScale(+d.jahr); })
				.y0(function(d) { return yScale(d.ausl_f); })
				.y1(function(d) { return yScale(d.total-d.total); });
			areaAF.fill = d3.lab('#D1003D').brighter(2);
			areas.push(areaAF);

			var areaAM = new Object;
			areaAM.area = d3.svg.area()
				//.interpolate("basis")
				.x(function(d) { return xScale(+d.jahr); })
				.y0(function(d) { return yScale(d.total-d.ch_m-d.ch_f-d.ausl_m); })
				.y1(function(d) { return yScale(d.total-d.ch_m-d.ch_f); });
			areaAM.fill = d3.lab('#004085').brighter(2);
			areas.push(areaAM);
		
			var areaCHF = new Object;
			areaCHF.area = d3.svg.area()
				//.interpolate("basis")
				.x(function(d) { return xScale(+d.jahr); })
				.y0(function(d) { return yScale(d.total-d.ch_m-d.ch_f); })
				.y1(function(d) { return yScale(d.total-d.ch_m); });
			areaCHF.fill = d3.lab('#D1003D');
			areas.push(areaCHF);

			var areaCHM = new Object;
			areaCHM.area = d3.svg.area()
				//.interpolate("basis")
				.x(function(d) { return xScale(+d.jahr); })
				.y0(function(d) { return yScale(d.total-d.ch_m); })
				.y1(function(d) { return yScale(d.total); });
			areaCHM.fill = d3.lab('#004085');
			areas.push(areaCHM);

			var thisMouseRect = mouseRect.append('g')
				.attr('id', 'thisMouseRect')
				.attr('transform', 'translate('+20+','+mapH+')');

			thisMouseRect.append("g")
				.attr("class", "axis")
				.attr("transform", "translate(0," + (mRectH-20) + ")")
				.call(xAxis);
			thisMouseRect.append("g")
				.attr("class", "axis")
				.call(yAxis)
				.attr("transform", "translate(50,0)");

			for (i=0;i<areas.length;i++) {
				thisMouseRect.append("path")
					.attr("class", "area")
					//.style('stroke', areas[i].fill)
					.style('fill', areas[i].fill)
					.attr('opacity', 0.7)
					.attr("d", areas[i].area(thisData.bevoelkerung));					
			}
			var mover = thisMouseRect.append('rect')
				.attr('fill', 'none')
				.attr('x', xScale(2013))
				.attr('y', yScale(maxY))
				.attr('height', yScale(0)-yScale(maxY))
				.attr('width', xScale(jahrend)-xScale(jahrstart));

			var closeJahr = jahrend;
			var closeJahrP = 0;
			
			thisMouseRect.append('text')
				.attr('class', 'tippJahr')
				.attr('x', 300+1*50)
				.attr('y', 105-70)
				.style('font-size', '12px')
				.text('Für detaillierte Zahlen pro Jahr');
			thisMouseRect.append('text')
				.attr('class', 'tippJahr')
				.attr('x', 300+1*50)
				.attr('y', 121-70)
				.style('font-size', '12px')
				.text('über Flächendiagramm fahren.');

			mover
				.attr('cursor', 'pointer')
				.attr('pointer-events', 'visible')
				.on("mousemove", function() {
					d3.selectAll('.tippJahr').remove();
					var m = d3.mouse(this);
					var mX = m[0], mY=m[1];
					var jahre = yeararray;
					closeJahrP = closeJahr;
					closeJahr = getClose(xScale.invert(mX), jahre);

					var drawMouseLine = function(jahrAkt) {
						thisMouseRect.append("line")
						.style('stroke', 'black')
							.attr("id", "line_"+jahrAkt)
							.attr("class", "mouseLine")
							.attr("x1", xScale(jahrAkt))
							.attr("y1", yScale(0))
							.attr("x2", xScale(jahrAkt))
							.attr("y2", yScale(maxY));
					};
					if (d3.select("#line_"+closeJahr).empty() === true) {
						drawMouseLine(closeJahr);
					}
					//if (d3.select("#b"+closeJahr).empty() === true) {
						//updateBar(closeJahr);
					//}

					////////////
					//remove old
					var allLines = d3.selectAll(".mouseLine");
					for (i=0;i<allLines.length;i++) {
						if (allLines[0][i].id != "line_"+closeJahr) {
							var element = allLines[0][i];
							element.parentNode.removeChild(element);
							//allLines[0][i].remove();
						}
					}

					var dataJahr = thisData.bevoelkerung[closeJahr-jahrstart];
					
				//	console.log("DATAJAHR: +", dataJahr)
					
					if (closeJahrP !== closeJahr) {
						d3.select('#textJahr').remove();
						var jahrText = thisMouseRect.append('g')
							.attr('id', 'textJahr');
						
						jahrText.append('text')
							.attr('x', 300+1*50)
							.attr('y', 15)
							.style('font-weight', 'bold')
							.style('font-size', '14px')
							.text(closeJahr);

						jahrText.append('text')
							.attr('x', 300+1*50)
							.attr('y', 118-70)
							.style('font-size', '12px')
							.style('font-weight', 'bold')
							.text('Total:');
						jahrText.append('text')
							.attr('text-anchor', 'end')
							.attr('x', 420+1*50)
							.attr('y', 118-70)
							.style('font-size', '12px')
							.style('font-weight', 'bold')
							.text(trenner(+dataJahr.total));
						jahrText.append('text')
							.attr('text-anchor', 'end')
							.attr('x', 480+1*50)
							.attr('y', 118-70)
							.style('font-size', '12px')
							.style('font-weight', 'bold')
							.text('100.0%');
						jahrText.append('text')
							.attr('text-anchor', 'end')
							.attr('x', 420+1*50)
							.attr('y', 142-70)
							.style('font-size', '12px')
							.style('font-weight', 'bold')
							.text(trenner(+dataJahr.ch));

						jahrText.append('text')
							.attr('text-anchor', 'end')
							.attr('x', 420+1*50)
							.attr('y', 163-70)
							.style('font-size', '12px')
							.text(trenner(+dataJahr.ch_m));
						jahrText.append('text')
							.attr('text-anchor', 'end')
							.attr('x', 420+1*50)
							.attr('y', 184-70)
							.style('font-size', '12px')
							.text(trenner(+dataJahr.ch_f));

						jahrText.append('text')
							.attr('text-anchor', 'end')
							.style('font-weight', 'bold')
							.attr('x', 420+1*50)
							.attr('y', 142)
							.style('font-size', '12px')
							.text(trenner(+dataJahr.ausl));

						jahrText.append('text')
							.attr('text-anchor', 'end')
							.attr('x', 420+1*50)
							.attr('y', 163)
							.style('font-size', '12px')
							.text(trenner(+dataJahr.ausl_m));
						jahrText.append('text')
							.attr('text-anchor', 'end')
							.attr('x', 420+1*50)
							.attr('y', 184)
							.style('font-size', '12px')
							.text(trenner(+dataJahr.ausl_f));

						jahrText.append('text')
							.attr('text-anchor', 'end')
							.attr('x', 480+1*50)
							.attr('y', 142-70)
							.style('font-size', '12px')
							.style('font-weight', 'bold')
							.text((Math.round(1000*dataJahr.ch/dataJahr.total)/10).toFixed(1)+'%');
						jahrText.append('text')
							.attr('text-anchor', 'end')
							.attr('x', 480+1*50)
							.attr('y', 142)
							.style('font-size', '12px')
							.style('font-weight', 'bold')
							.text((Math.round(1000*dataJahr.ausl/dataJahr.total)/10).toFixed(1)+'%');

						jahrText.append('text')
							.attr('text-anchor', 'end')
							.attr('x', 480+1*50)
							.attr('y', 163-70)
							.style('font-size', '12px')
							.text((Math.round(1000*dataJahr.ch_m/dataJahr.total)/10).toFixed(1)+'%');
						jahrText.append('text')
							.attr('text-anchor', 'end')
							.attr('x', 480+1*50)
							.attr('y', 184-70)
							.style('font-size', '12px')
							.text((Math.round(1000*dataJahr.ch_f/dataJahr.total)/10).toFixed(1)+'%');
						jahrText.append('text')
							.attr('text-anchor', 'end')
							.attr('x', 480+1*50)
							.attr('y', 163)
							.style('font-size', '12px')
							.text((Math.round(1000*dataJahr.ausl_m/dataJahr.total)/10).toFixed(1)+'%');
						jahrText.append('text')
							.attr('text-anchor', 'end')
							.attr('x', 480+1*50)
							.attr('y', 184)
							.style('font-size', '12px')
							.text((Math.round(1000*dataJahr.ausl_f/dataJahr.total)/10).toFixed(1)+'%');
					}
			});



			thisMouseRect.append('text')
				.attr('x', 300+1*50)
				.attr('y', 142-70)
				.style('font-size', '12px')
				.style('font-weight', 'bold')
				.text('Schweiz:');

			thisMouseRect.append('rect')
					.attr('x', 300+1*50)
					.attr('y', 150-70)
					.attr('height', 17*0.85)
					.attr('width', 17*0.85)
					.attr('opacity', 0.7)
					.attr('fill', areas[3].fill);
			thisMouseRect.append('text')
				.attr('x', 320+1*50)
				.attr('y', 163-70)
				.style('font-size', '12px')
				.text('Männer');
			
			thisMouseRect.append('rect')
					.attr('x', 300+1*50)
					.attr('y', 171-70)
					.attr('height', 17*0.85)
					.attr('width', 17*0.85)
					.attr('opacity', 0.7)
					.attr('fill', areas[2].fill)
			thisMouseRect.append('text')
				.attr('x', 320+1*50)
				.attr('y', 184-70)
				.style('font-size', '12px')
				.text('Frauen');
			

			thisMouseRect.append('text')
				.attr('x', 300+1*50)
				.attr('y', 142)
				.style('font-size', '12px')
				.style('font-weight', 'bold')
				.text('Ausland:');

			thisMouseRect.append('rect')
					.attr('x', 300+1*50)
					.attr('y', 150)
					.attr('height', 17*0.85)
					.attr('width', 17*0.85)
					.attr('opacity', 0.7)
					.attr('fill', areas[1].fill);
			thisMouseRect.append('text')
				.attr('x', 320+1*50)
				.attr('y', 163)
				//.style('font-weight', 'bold')
				.style('font-size', '12px')
				.text('Männer');
			
			thisMouseRect.append('rect')
					.attr('x', 300+1*50)
					.attr('y', 171)
					.attr('height', 17*0.85)
					.attr('width', 17*0.85)
					.attr('opacity', 0.7)
					.attr('fill', areas[0].fill)

			thisMouseRect.append('text')
				.attr('x', 320+1*50)
				.attr('y', 184)
				//.style('font-weight', 'bold')
				.style('font-size', '12px')
				.text('Frauen');
			thisMouseRect.append('text')
				.attr('x', 0)
				.attr('y', 15)
				.style('font-weight', 'bold')
				.style('font-size', '14px')
				.text(thisData.NAME);

			thisMouseRect.append('line')
				.attr('y1', 20)
				.attr('x1', 0)
				.attr('y2', 20)
				.attr('x2', width-40)
				.style('stroke', 'grey');
			
		};


		var mouseOver = function(thisData, that, bbox) {
			

			var mouseOverRW = 210,
				mouseOverRH = 100;
			//Position Tooltip
			var xPos = bbox.x+bbox.width/2,
				yPos = bbox.y+bbox.height/2;
			//Korrektur, damit tooltip nicht über den Rand hinaus geht:
			if (xPos>200) {
				xPos = bbox.x+bbox.width/2-mouseOverRW
			}
			if (yPos>100) {
				yPos = bbox.y+bbox.height/2-mouseOverRH
			}
			var mouseOverL = mapPfade.append('g').attr('id', 'mouseOverL')
				.attr('pointer-events', 'none');

			var mouseOverP = mouseOverL.append('g')
				.attr('id','mouseOverP');
				
			var mouseOverT = mouseOverL.append('g')
				.attr('id','mouseOverT')
				.attr('transform', 'translate('+(xPos)+','+(yPos)+')');
				
			mouseOverP.append('path')
				.attr("class", 'mouse')
				.attr("d", that.attr('d'))
				.style('fill', 'none')
				.style('stroke', 'dimgrey')
				.style('stroke-width', 2);

			mouseOverT.append('rect')
				.attr('x', -5)
				.attr('y', 0)
				.attr('width', mouseOverRW)
				.attr('height', mouseOverRH)
				.style('fill', 'GhostWhite')
				//.attr('fill-opacity', 0.9)
				.style('stroke', 'dimgrey');

			mouseOverT.append('path')
				.attr("class", 'mouse')
				.attr("d", that.attr('d'))
				.style('fill', 'white')
				.attr('transform', 'translate('+(-xPos)+','+(-yPos)+')');
			
			mouseOverT.append('text')
				.attr('x', 5)
				.attr('y', 20)
				.style('font-size', '12px')
				.style('font-weight', 'bold')
				.text(thisData.properties.NAME);
				

			var lineHeight = 22;

			var zunahme = +thisData.properties.bevoelkerung[5].zunahme_vorjahr;

            var zunahme5 = +thisData.properties.bevoelkerung[5].zunahme5jahr;

			var textVer = 'Veränderung zum Vorjahr:'

			var textVer5 = 'Ø jährliche Veränderung:'

			var textVerZ = +(d3.round(zunahme,1))+'%';
			if (zunahme>=0) {
				textVerZ = '+'+textVerZ;}

			var textVerZ5 = +(d3.round(zunahme5,1))+'%';
			if (zunahme5>=0) {
				textVerZ5 = '+'+textVerZ5;}


			mouseOverT.append('text')
				.attr("class","v1")
				.attr('x', 5)
				.attr('y', 20+2*lineHeight)
				.attr("class","v1")
				//.style('font-weight', 'bold')
				.text(textVer);

			mouseOverT.append('text')
				.attr('x', mouseOverRW-15)
				.attr('y', 20+2*lineHeight)
				.style('font-size', '12px')
				.attr('text-anchor', 'end')
				.style('font-weight', 'bold')
				.text(textVerZ);
			
			mouseOverT.append('text')
				.attr('x', 5)
				.attr('y', 20+1*lineHeight)
				//.style('font-weight', 'bold')
				.text('Einwohner 2018:');

			var bev = trenner(+thisData.properties.bevoelkerung[5].total);

			mouseOverT.append('text')
				.attr('x', mouseOverRW-15)
				.attr('y', 20+1*lineHeight)
				.style('font-size', '12px')
				.attr('text-anchor', 'end')
				.style('font-weight', 'bold')
				.text(bev);


			mouseOverT.append('text')
				.attr('x', 5)
				.attr('y', 20+3*lineHeight)
				.attr("class","v5")
				//.style('font-weight', 'bold')
				.text(textVer5);

			mouseOverT.append('text')
				.attr('x', mouseOverRW-15)
				.attr('y', 20+3*lineHeight)
				.style('font-size', '12px')
				.attr('text-anchor', 'end')
				.style('font-weight', 'bold')
				.text(textVerZ5);


		};	
		var mouseOut = function() {
			d3.select('#mouseOverL').remove();
		};

		d3.json("data/gemeinden2018.json", function(error, topoJson) {
			
			////////////////
			//	Projektion
			var path= d3.geo.path()
					.projection(null);
			
			var gemeindeDaten = topoJson.objects.gemeinden2018_geo2.geometries;

			//console.log(gemeindeDaten);
        	var variable = 'zunahme_vorjahr';


            d3.select('.control').selectAll('li')
            .attr('cursor', 'pointer')
            .on('click', function() {
                if (this.className == 'selected') {
                    console.log('schon gewählt');
                } else {
                    d3.selectAll('li').attr('class', '');
                    this.className = 'selected';
               var  variable = d3.select(this).attr('id');

                 console.log(variable);

                 updateGem(variable);
   
                }
            });
			console.log(variable);
			
			////////////////
			//	MIN + Max		
			var minZ = Number.POSITIVE_INFINITY;
			var maxZ = Number.NEGATIVE_INFINITY;

			var tmp;
			for (var i=gemeindeDaten.length-1; i>=0; i--) {
				dataFilter = gemeindeDaten[i].properties.bevoelkerung.filter(function (bevJ) {
					return bevJ.jahr == jahrend &&
						bevJ;
				});

				if  (dataFilter.length>0) {
					tmp = Number(dataFilter[0].zunahme5jahr); //da der Wert als Sting gespeicher ist, hier noch Umwandlung
					if (tmp < minZ) minZ = tmp;
					if (tmp > maxZ) maxZ = tmp;
				}
			}
			console.log(maxZ);
			////////////////
			//
			//	ColorScale		
			//	

///////////////// button

//////////hier geblieben - UPDATE COLOR SCALE ETC
/////////////////////////// 


			var color = d3.scale.linear()
				.domain([-3,0, 11])
				.range([d3.lab('#A586B7').darker(), d3.lab('#FAFAD2'), d3.lab('#6EBD72').darker()])
				.interpolate(d3.interpolateLab);

			legende.append('text')
				.attr('x', -2)
				.attr('y', 12)
				.style('font-weight', 'bold')
				.text('Veränderung');

			// legende.append('text')
			//     .attr("id","indi2")
			// 	.attr('x', -2)
			// 	.attr('y', 56)
			// 	.style('font-weight', 'bold')
			// 	.text('zum Vorjahr:');

			//Legende ColorScale
			maxZ=11
			minZ=-3

			var anzRect = 28,
				sizeRect = 15,
				distance = maxZ-minZ;
				
				
					////////
					// Weiach Spezial
				legende.append('rect')
					.attr("class","collegend")
					.attr('width', sizeRect)
					.attr('height', sizeRect)
					.attr('y', 30)
					.attr('x', 0)
					.style('fill', color(20));
				legende.append('text')
					.attr("class","collegend")
					.attr('x', sizeRect+5)
					.attr('y', 40)
					.attr('text-anchor', 'start')
					.text('+20%');	
					////////	
					
					
			for (i=0;i<anzRect;i++) {
				var valueC = maxZ-i*distance/anzRect;
				var text;
				if (valueC>0) {
					text ='+'+(Math.round(10*valueC)/10)+'%'
				}
				else  {
					text =(Math.round(10*valueC)/10)+'%'
				}

				legende.append('rect')
					.attr("class","collegend")
					.attr('width', sizeRect)
					.attr('height', sizeRect)
					.attr('y', (mapH/2-(sizeRect/2))+(i-((anzRect-1)/2))*sizeRect)
					.attr('x', 0)
					.style('fill', color(valueC));

	

				if (i%2==0) {
					legende.append('text')
						.attr("class","collegend")
						.attr('x', sizeRect+5)
						.attr('y', (mapH/2)+(i-((anzRect-1)/2))*sizeRect+5)
						.attr('text-anchor', 'start')
						.text(text);
				}
			}			


		function drawGemeinden(variable){

			
			var gemeinden = mapPfade.selectAll('.gemeinden')
				.data(topojson.feature(topoJson, topoJson.objects.gemeinden2018_geo2).features)
				.enter()
				.append('path')
				.attr("class", function(d) {
					if (d.properties.ART_TEXT == 'See' ){
						return 'see';
					}  else {
						return 'gemeinden';
					}
				})
				.attr("d", path)
				.style('stroke', function(d) {
					if (d.properties.ART_TEXT == 'See' ){
						return 'LightBlue';
					}  else {
						return 'grey';
					}
				})
				.style('stroke-width', 0.5)
				.style('fill', function(d) {
					if (d.properties.ART_TEXT == 'See' ){
							return 'url(#hash4_4)'
					}  else {
						if (!d.properties.bevoelkerung[5]) {
							return 'white';
						} else {
							return color(d.properties.bevoelkerung[5][variable]); 
						}
					}
				});
			};

			drawGemeinden('zunahme_vorjahr');

		function updateGem(variable) {


	
// hier skala updaten
 
			// legende.select("#indi2")
			// .text(function(variable){if(variable == zunahme_vorjahr){return 'hello'}else
				// {return 'was'}})



//	MIN + Max	
		var minZ = Number.POSITIVE_INFINITY;
			var maxZ = Number.NEGATIVE_INFINITY;
			var tmp;
			for (var i=gemeindeDaten.length-1; i>=0; i--) {
				dataFilter = gemeindeDaten[i].properties.bevoelkerung.filter(function (bevJ) {
					return bevJ.jahr == jahrend &&
						bevJ;
				});

				if  (dataFilter.length>0) {
					tmp = Number(dataFilter[0][variable]); //da der Wert als Sting gespeicher ist, hier noch Umwandlung
					if (tmp < minZ) minZ = tmp;
					if (tmp > maxZ) maxZ = tmp;
				}
			}
			console.log(maxZ);

/*
			color 
				.domain([minZ,0, maxZ])
				.range([d3.lab('#A586B7').darker(), d3.lab('#FAFAD2'), d3.lab('#6EBD72').darker()])
				.interpolate(d3.interpolateLab);

// 

			//Legende ColorScale


			var anzRect = 25,
				sizeRect = 17,
				distance = maxZ-minZ;

			console.log('maxZ');
			console.log(maxZ);
			console.log('minZ');
			console.log(minZ);

			legende.selectAll('.collegend').remove()

			for (i=0;i<anzRect;i++) {
				var valueC = maxZ-i*distance/anzRect;
				var text;
				if (valueC>0) {
					text ='+'+Math.round(valueC*10)/10+'%'
				}
				else  {
					text =Math.round(valueC*10)/10+'%'
				}

				legende.append('rect')
				    .attr('class','collegend')
					.attr('width', sizeRect)
					.attr('height', sizeRect)
					.attr('y', (mapH/2-(sizeRect/2))+(i-((anzRect-1)/2))*sizeRect)
					.attr('x', 0)
					.style('fill', color(valueC));
				if (i%2==0) {
					legende.append('text')
					.attr('class','collegend')
						.attr('x', sizeRect+5)
						.attr('y', (mapH/2)+(i-((anzRect-1)/2))*sizeRect+5)
						.attr('text-anchor', 'start')
						.text(text);
				}
			}		
*/
		mapPfade.selectAll('.gemeinden')
					.transition()
					.duration(800)
					.style('fill', function(d) {
						if (d.properties.ART_TEXT == 'See' ){
							return 'url(#hash4_4)'
						}  else {
							if (!d.properties.bevoelkerung[5]) {
								return 'white';
							} else {
								return color(d.properties.bevoelkerung[5][variable]); 
							}
						}
					});


		};

			d3.selectAll('.gemeinden')
				.attr('cursor', function(d) { 
					if  (d.properties.bevoelkerung[5]) {
						return 'pointer'
					}
				})
				.on('mouseover', function(d, i) {
					var bbox = this.getBBox();
					mouseOver(d, d3.select(this), bbox);
					


					if(variable=="zunahme_vorjahr"){

				  mouseRect.select(".v1")
                     .classed("active",true)
					 

					} ;

               

				})
				.on('mouseout', function(d, i) {
					mouseOut();
				})
				.on('click', function(d,i) {
					clickIdPast = clickId;
					clickId = d.properties.BFS;
					if (clickStatus == 0) {
						clickStatus = 1;
						var bbox = this.getBBox();
						
						clickGemeinde(d.properties, bbox);
					} else if (clickStatus == 1 && clickIdPast == clickId) {
						clickStatus = 0;
						d3.select('#thisMouseRect').remove();

						mouseRect.append('text')
							.attr('id', 'tipp')
							.attr('x', 20)
							.attr('y', mapH+20)
							.style('font-size', '14px')
							.text('Für die Entwicklung in den letzten fünf Jahren auf eine Gemeinde klicken.');

					} else if (clickStatus == 1 && clickIdPast != clickId) {
						clickStatus = 1;
						var bbox = this.getBBox();
						
						d3.select('#thisMouseRect').remove();
						clickGemeinde(d.properties, bbox);
					}

				});
					

		});

					
//end		

};
}());













