((function () {

	window.onload = function () {
		console.log('Fenster ist geladen.');	
		
		///////////////////////
		//
		//	Layout
		//	
		var scale = 0.85;
		var width = 572,
			height = 900,
			legendeH = 160,
			mapH =650*scale,
			legendeH = 900-mapH,
			gRatio = (1+Math.sqrt(5))/2;
		
		var svg = d3.select("body").append("svg")
			.attr("width", width)
			.attr("height", 900);

		var map =  svg.append("g")
			.attr('id', 'map')
			//.attr('transform','translate('+((1 - scale) * width/2)+','+((1 - scale) * mapH/2)+')scale('+scale+')');
			.attr('transform','translate('+0+','+0+')scale('+scale+')');
		
		var legende = svg.append('g')
			.attr('id', 'legende')
			.attr('transform','translate('+(480)+','+0+')');
		var mapPfade =  map.append("g")
			.attr('id', 'mapPfade')
			.attr('transform', 'translate(30,0)');
		var mouseRect = svg.append('g')
			.attr('id', 'mouseRect')
			.attr('pointer-events', 'none');
		
		// Area legende
		
		var arealegend = svg.append('g')
			.attr('pointer-events', 'none')
			.attr('id','arealegend')
			.attr('transform','translate('+(365)+','+(620)+')');
			
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
		
		///////////////////////
		//
		//	Parameters
		//
		var jahr = 2015;		

		///////////////////////
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
			.attr('font-weight', 'bold')
			.style('font-size', '14px')
			.text('Für den Verlauf der letzten fünf Jahre auf eine Gemeinde klicken');

		var drawarealegend = function () {
			var sizeRect = 17;
			
			arealegend.append('text')
				.text('Schweiz')
				.attr('x', 13)
				.attr('y', -20)
				.style('font-weight', 'bold');

			arealegend.append('rect')
				.attr('width', sizeRect)
				.attr('height', sizeRect)
				.attr('y',0)
				.attr('x',15 )
				.style('fill','#ff9999');
			
			arealegend.append('text')
				.attr('y',13)
				.attr('x',33 )
				.text('Männer');
					
			arealegend.append('rect')
				.attr('width', sizeRect)
				.attr('height', sizeRect)
				.attr('y',20)
				.attr('x',15 )
				.style('fill','#b30000');
					
			arealegend.append('text')
				.attr('y',33)
				.attr('x',33 )
				.text('Frauen (CH)');
					
			 arealegend.append('rect')
				.attr('width', sizeRect)
				.attr('height', sizeRect)
				.attr('y',40)
				.attr('x',15 )
				.style('fill','#99ccff');
					
			arealegend.append('text')
				.attr('y',54)
				.attr('x',33 )
				.text('Männer (Ausland)');
					
			 arealegend.append('rect')
				.attr('width', sizeRect)
				.attr('height', sizeRect)
				.attr('y',60)
				.attr('x',15 )
				.style('fill','#372fe1');
					
			arealegend.append('text')
				.attr('y',74)
				.attr('x',33 )
				.text('Frauen (Ausland)');			
				
		};		
								

		var clickGemeinde = function (thisData, bbox) {
			d3.select('#tipp').remove();
			drawarealegend();
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
				.domain([2010,2015])
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

			var areaAF = new Object;
			areaAF.area = d3.svg.area()
				//.interpolate("basis")
				.x(function(d) { return xScale(+d.jahr); })
				.y0(function(d) { return yScale(d.ausl_f); })
				.y1(function(d) { return yScale(d.total-d.total); });
			areaAF.fill = d3.hsl('#2166ac').brighter();
			areas.push(areaAF);

			var areaAM = new Object;
			areaAM.area = d3.svg.area()
				//.interpolate("basis")
				.x(function(d) { return xScale(+d.jahr); })
				.y0(function(d) { return yScale(d.total-d.ch_m-d.ch_f-d.ausl_m); })
				.y1(function(d) { return yScale(d.total-d.ch_m-d.ch_f); });
			areaAM.fill = d3.hsl('#4393c3').brighter();
			areas.push(areaAM);
		
			var areaCHF = new Object;
			areaCHF.area = d3.svg.area()
				//.interpolate("basis")
				.x(function(d) { return xScale(+d.jahr); })
				.y0(function(d) { return yScale(d.total-d.ch_m-d.ch_f); })
				.y1(function(d) { return yScale(d.total-d.ch_m); });
			areaCHF.fill = d3.hsl('#01665e');
			areas.push(areaCHF);

			var areaCHM = new Object;
			areaCHM.area = d3.svg.area()
				//.interpolate("basis")
				.x(function(d) { return xScale(+d.jahr); })
				.y0(function(d) { return yScale(d.total-d.ch_m); })
				.y1(function(d) { return yScale(d.total); });
			areaCHM.fill = d3.hsl('#c7eae5');
			areas.push(areaCHM);

			var thisMouseRect = mouseRect.append('g')
				.attr('id', 'thisMouseRect')
				.attr('transform', 'translate('+20+','+mapH+')');
			/*
			thisMouseRect.append('rect')
				.attr('x', -mRectInnerPad)
				.attr('y', 0)
				.attr('width', mRectW)
				.attr('height', mRectH)
				.style('fill', 'white')
				.attr('fill-opacity', 0.9)
				.style('stroke','grey');
			*/

			thisMouseRect.append("g")
				.attr("class", "axis")
				.attr("transform", "translate(0," + (mRectH-20) + ")")
				.call(xAxis);
			thisMouseRect.append("g")
				.attr("class", "axis")
				.call(yAxis)
				.attr("transform", "translate(50,0)");

			for (i=0;i<areas.length;i++) {
				console.log(thisData);
				thisMouseRect.append("path")
					.attr("class", "area")
					//.style('stroke', areas[i].fill)
					.style('fill', areas[i].fill)
					.attr('opacity', 0.7)
					.attr("d", areas[i].area(thisData.bevoelkerung));
					
			}
		
			thisMouseRect.append('text')
				.attr('x', 0)
				.attr('y', 15)
				.style('font-weight', 'bold')
				.style('font-size', '14px')
				.text(thisData.NAME);		
			
		};


		var mouseOver = function(thisData, that, bbox) {
			console.log(thisData);
			console.log(that);
			console.log(bbox);
			var mouseOverRW = 230,
				mouseOverRH = 72;
			//Position Tooltip
			var xPos = bbox.x+bbox.width/2,
				yPos = bbox.y+bbox.height/2;
			//Korrektur, damit tooltip nicht über den Rand hinaus geht:
			if (xPos>320) {
				xPos = bbox.x+bbox.width/2-mouseOverRW
			}
			if (yPos>80) {
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
				.style('font-size', '16px')
				.style('font-weight', 'bold')
				.text(thisData.properties.NAME);
			var lineHeight = 22;
			var zunahme = +thisData.properties.bevoelkerung[5].zunahme_vorjahr;

			var textVer = 'Veränderung zum Vorjahr:'

			var textVerZ = +(Math.round(1000*(zunahme))/10)+'%';
			if (zunahme>=0) {
				textVerZ = '+'+textVerZ;
			}
			mouseOverT.append('text')
				.attr('x', 5)
				.attr('y', 20+1*lineHeight)
				//.style('font-weight', 'bold')
				.text(textVer);
			mouseOverT.append('text')
				.attr('x', mouseOverRW-15)
				.attr('y', 20+1*lineHeight)
				.style('font-size', '16px')
				.attr('text-anchor', 'end')
				.style('font-weight', 'bold')
				.text(textVerZ);
			
			mouseOverT.append('text')
				.attr('x', 5)
				.attr('y', 20+2*lineHeight)
				//.style('font-weight', 'bold')
				.text('Einwohner 2015:');
			var bev = trenner(+thisData.properties.bevoelkerung[5].total);
			mouseOverT.append('text')
				.attr('x', mouseOverRW-15)
				.attr('y', 20+2*lineHeight)
				.style('font-size', '16px')
				.attr('text-anchor', 'end')
				.style('font-weight', 'bold')
				.text(bev);


		};	
		var mouseOut = function() {
			d3.select('#mouseOverL').remove();
		};

		d3.json("data/gemeinden2015_Bev2015_small.json", function(error, topoJson) {
			
			////////////////
			//	Projektion
			var path= d3.geo.path()
					.projection(null)
			
			var gemeindeDaten = topoJson.objects.gemeinden2015.geometries;
			////////////////
			//	MIN + Max		
			var minZ = Number.POSITIVE_INFINITY;
			var maxZ = Number.NEGATIVE_INFINITY;
			var tmp;
			for (var i=gemeindeDaten.length-1; i>=0; i--) {
				dataFilter = gemeindeDaten[i].properties.bevoelkerung.filter(function (bevJ) {
					return bevJ.jahr == jahr &&
						bevJ;
				});
				if  (dataFilter.length>0) {
					tmp = Number(dataFilter[0].zunahme_vorjahr); //da der Wert als Sting gespeicher ist, hier noch Umwandlung
					if (tmp < minZ) minZ = tmp;
					if (tmp > maxZ) maxZ = tmp;
				}
			}
			
			////////////////
			//
			//	ColorScale		
			//			
			var color = d3.scale.linear()
				.domain([minZ,0, maxZ])
				.range([d3.lab('#A586B7').darker(), d3.lab('#FAFAD2'), d3.lab('#6EBD72').darker()])
				.interpolate(d3.interpolateLab);

			legende.append('text')
				.attr('x', -2)
				.attr('y', 40)
				.style('font-weight', 'bold')
				.text('Veränderung');

			legende.append('text')
				.attr('x', -2)
				.attr('y', 56)
				.style('font-weight', 'bold')
				.text('zum Vorjahr:');

			//Legende ColorScale
			var anzRect = 25,
				sizeRect = 17,
				distance = maxZ-minZ;

			for (i=0;i<anzRect;i++) {
				var valueC = maxZ-i*distance/anzRect;
				var text;
				if (valueC>0) {
					text ='+'+Math.round(Number(valueC)*100)+'%'
				}
				else  {
					text =Math.round(Number(valueC)*100)+'%'
				}

				legende.append('rect')
					.attr('width', sizeRect)
					.attr('height', sizeRect)
					.attr('y', (mapH/2-(sizeRect/2))+(i-((anzRect-1)/2))*sizeRect)
					.attr('x', 0)
					.style('fill', color(valueC));
				if (i%2==0) {
					legende.append('text')
						.attr('x', sizeRect+5)
						.attr('y', (mapH/2)+(i-((anzRect-1)/2))*sizeRect+5)
						.attr('text-anchor', 'start')
						.text(text);
				}
			}		
		
			var gemeinden = mapPfade.selectAll('.gemeinden')
				.data(topojson.feature(topoJson, topoJson.objects.gemeinden2015).features)
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
						return 'LightBlue';
					}  else {
						if (!d.properties.bevoelkerung[5]) {
							return 'white';
						} else {
							return color(d.properties.bevoelkerung[5].zunahme_vorjahr); 
						}
					}
				});


			d3.selectAll('.gemeinden')
				.attr('cursor', function(d) { 
					if  (d.properties.bevoelkerung[5]) {
						return 'pointer'
					}
				})
				.on('mouseover', function(d, i) {
					var bbox = this.getBBox();
					mouseOver(d, d3.select(this), bbox);
				})
				.on('mouseout', function(d, i) {
					mouseOut();
				})
				.on('click', function(d,i) {
					console.log(clickId);	
					clickIdPast = clickId;
					clickId = d.properties.BFS;
					if (clickStatus == 0) {
						clickStatus = 1;
						d3.select(this).style('fill', function(d) { return d3.lab(color(d.properties.bevoelkerung[5].zunahme_vorjahr)).darker();});
						var bbox = this.getBBox();
						d3.selectAll('.gemeinden')
							.attr('fill-opacity', 0.5)
							.attr('stroke-opacity', 0.7);
						d3.select(this).attr('fill-opacity', 1);
						d3.select(this).style('fill', function(d) { return d3.lab(color(d.properties.bevoelkerung[5].zunahme_vorjahr)).darker();});
						
						clickGemeinde(d.properties, bbox);
					} else if (clickStatus == 1 && clickIdPast == clickId) {
						clickStatus = 0;
						d3.select('#thisMouseRect').remove();

						mouseRect.append('text')
							.attr('id', 'tipp')
							.attr('x', 20)
							.attr('y', mapH+20)
							.attr('font-weight', 'bold')
							.style('font-size', '14px')
							.text('Für den Verlauf der letzten fünf Jahre auf eine Gemeinde klicken');

					} else if (clickStatus == 1 && clickIdPast != clickId) {
						clickStatus = 1;
						d3.select(this).style('fill', function(d) { return d3.lab(color(d.properties.bevoelkerung[5].zunahme_vorjahr)).darker();});
						var bbox = this.getBBox();
						d3.selectAll('.gemeinden')
							.attr('fill-opacity', 0.5)
							.attr('stroke-opacity', 0.7);
						d3.select(this).attr('fill-opacity', 1);
						d3.select(this).style('fill', function(d) { return d3.lab(color(d.properties.bevoelkerung[5].zunahme_vorjahr)).darker();});
						
						d3.select('#thisMouseRect').remove();
						clickGemeinde(d.properties, bbox);
					}

					console.log(clickStatus);
				});
					

		});

					
//end		

};
}());
