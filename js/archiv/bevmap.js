(function () {

	window.onload = function () {
		console.log('Fenster ist geladen.');	
		
		var width = 572,height = 900;

		var svg = d3.select("body").append("svg")
			.attr("width", width)
			.attr("height", height);
			
		/////////////////////////
		//// COLORSCALE						
		var color = d3.scale.threshold()
			.domain([2000, 5000, 10000, 20000, 40000])
			.range(["#9e9ac8", "756bb1", "dadaeb", "bcbddc", "#E82D0C"]);			

		d3.json("data/gemeinden2015_Bev2015.json", function(error, topoJson) {
			////////////////
			///// Welche Projektion? -> null!

			var path= d3.geo.path()
					.projection(null)

			var gemeinden = topoJson.objects.gemeinden2015.geometries;
			svg.selectAll('.gemeinden')
				.data(topojson.feature(topoJson, topoJson.objects.gemeinden2015).features)
				.enter()
				.append('path')
				.attr("class", "gemeinden")
				.attr("d", path);

				/*
			//Gemeinden
			var provinzen = svg.selectAll("path")
				.data(gemeinden.geometries)
				.enter()
				.append('path')
				.attr("class","gemeinde") 
				.attr("d", path)
				.attr("name", function(d) { return d.OBJECTID; })

			//.style("fill", function(d) { //color enumeration units return choropleth(d, recolorMap); });

			gemeinden
				.on('mouseover', function(d, i) {
					var currentState = this;
					d3.select(this).style('fill-opacity', .7); })
				.on('mouseout', function(d, i) {
					d3.selectAll('path')
						.style({'fill-opacity':1})
				});
		*/						

		});

					
//end		

};
}());










