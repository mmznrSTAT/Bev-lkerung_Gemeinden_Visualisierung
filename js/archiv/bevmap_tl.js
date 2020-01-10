(function () {

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
		var clickGemeinde = function (thisData, bbox) {
			var mRectInnerPad = 5,
				//mRectW = 512,
				//mRectH = mRectW/gRatio,
				mRectH = 195.5+2*mRectInnerPad,
				//mRectH = 150+2*mRectInnerPad,
				mRectW = mRectH+mRectH*gRatio,
				mRectPad = 30;
			/*
			//Position Tooltip
			var xPos = bbox.x+bbox.width/2-mRectW/2,
				yPos = bbox.y+bbox.height;
			//Korrektur, damit tooltip nicht über den Rand hinaus geht:
			if (xPos+mRectW/2>width/2) {
				xPos = d3.min([xPos, width-mRectW-mRectPad+mRectInnerPad])
			} else {
				xPos = d3.max([xPos, mRectPad+mRectInnerPad])
			}
			if (yPos-mRectH/2>mapH/2) {
				yPos = yPos-mRectH-bbox.height -20
			} else {
				yPos = yPos +20
			} */
			
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
			areaAF.fill = '#372fe1';
			areas.push(areaAF);

			var areaAM = new Object;
			areaAM.area = d3.svg.area()
				//.interpolate("basis")
				.x(function(d) { return xScale(+d.jahr); })
				.y0(function(d) { return yScale(d.total-d.ch_m-d.ch_f-d.ausl_m); })
				.y1(function(d) { return yScale(d.total-d.ch_m-d.ch_f); });
			areaAM.fill = '#99ccff';
			areas.push(areaAM);
		
			var areaCHF = new Object;
			areaCHF.area = d3.svg.area()
				//.interpolate("basis")
				.x(function(d) { return xScale(+d.jahr); })
				.y0(function(d) { return yScale(d.total-d.ch_m-d.ch_f); })
				.y1(function(d) { return yScale(d.total-d.ch_m); });
			areaCHF.fill = '#b2df8a';
			areas.push(areaCHF);

			var areaCHM = new Object;
			areaCHM.area = d3.svg.area()
				//.interpolate("basis")
				.x(function(d) { return xScale(+d.jahr); })
				.y0(function(d) { return yScale(d.total-d.ch_m); })
				.y1(function(d) { return yScale(d.total); });
			areaCHM.fill = '#33a02c';
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
				thisMouseRect.append("path")
					.attr("class", "area")
					.style('stroke', areas[i].fill)
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

		// Legende für Area-Plot: Dasselbe könnte wahrscheinlich mit viel weniger code umgesetzt werden. Alternativ könnte die Beschriftung auch direkt erfolgen
	
		var drawarealegend = function () {
		var sizeRect = 17
		
		arealegend.append('rect')
			.attr('width', sizeRect)
			.attr('height', sizeRect)
					.attr('y',0)
					.attr('x',15 )
					.style('fill','#ff9999');	
			
			arealegend.append('text')
					.attr('y',13)
					.attr('x',33 )
					.text('Männer (CH)');
					
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
								
		drawarealegend(); 				

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
			
		//	console.log(maxZ, minZ);
					
			
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
			//		drawarealegend();  /// nach mouseout verschwindet die Grafik nicht
					if  (clickStatus == 0 && d.properties.bevoelkerung[5]) {
						d3.select(this).style('fill', function(d) { return d3.lab(color(d.properties.bevoelkerung[5].zunahme_vorjahr)).darker();});
						var bbox = this.getBBox();
						d3.selectAll('.gemeinden')
							.attr('fill-opacity', 0.5)
							.attr('stroke-opacity', 0.7);
						d3.select(this).attr('fill-opacity', 1);
						d3.select(this).style('fill', function(d) { return d3.lab(color(d.properties.bevoelkerung[5].zunahme_vorjahr)).darker();});
						clickGemeinde(d.properties, bbox);
					}
				})
				.on('mouseout', function(d, i) {
					if (clickStatus == 0) {
						d3.select('#thisMouseRect').remove();
					// d3.select('#arealegend').remove();         //Funktioniert nicht wie gewünscht
						d3.selectAll('.gemeinden')
							.attr('fill-opacity', 1)
							.attr('stroke-opacity', 1);
						if (d.properties.bevoelkerung[5]) {
							d3.select(this).style('fill',function(d) { return color(d.properties.bevoelkerung[5].zunahme_vorjahr);});
						}
					}
				})
				.on('click', function(d,i) {
					console.log(clickId);
					if (clickStatus == 0) {
						clickStatus = 1;
					} else if (clickStatus == 1 && clickIdPast == clickId) {
						clickStatus = 0;
					} else if (clickStatus == 1 && clickIdPast != clickId) {
						clickStatus = 1;
						clickIdPast = clickId;
						clickId = d.properties.BFS;
					}

					console.log(clickStatus);
				});
					

		});

					
//end		

};
}());













