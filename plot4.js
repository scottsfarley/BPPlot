var curveHeight = 800;
var nameOffset = 150;
var axisWidth = 100;
var plotHeight  = nameOffset + curveHeight;
var totalHeight = plotHeight + 200;
var data = {}
var names = {}
var ids = []
var depths = {}
var depthMinMax = [10000, 0]
var active_taxa = []
var depthScale;
divWidth = $('#plot').width()
plotWidth = divWidth - 200 - 50
active_names = []
pageHeight = $(document).height()
totalHeight = pageHeight - 200
curveHeight = totalHeight * .75
numfiles = 1
smooth_paths = {}
scales = {}
var chronScale;
var chron;
var chronDepths;
var chronofile;
var chronSVG;
var depthSVG;
var depthCalled = false;
var plotCalled = false;
var chronCalled = false;
console.log(plotWidth)


function setupSVG(height, width){
	svg = d3.select('#plot').append('svg')
		.attr('height', height)
		.attr('width', width)
	return svg
}



	
function getDepths(data){
	depths = []
	for (i in data){ //loops over multiple sets from different csvs
		set = data[i]
		x = 1
		while (x < data[i].length){ //loops over levels in each csv
			depth = +set[x][0]
			depths.push(depth)
			x+=1
		}
	}
	return depths
}

$('#load').click(function(){
	chronofile = $('#chronoinput').val()
	csv_file = $('#csv' + numfiles).val()
	$('#csv' + numfiles).attr('disabled', 'disabled')
	numfiles += 1
	$('#inputbox').append('<input type="file" name="csv" id="csv' + numfiles + '"/>')
	$('#load').html('Load File')
	loadData(csv_file)
	if (depthCalled == false){
		depthSVG = setupSVG(totalHeight, axisWidth).attr('id', 'depthAxisSvg')
		console.log('false')
	}
	depthCalled = true
})

function loadData(csv){
	d3.text(csv, function(updata){
		d = d3.csv.parseRows(updata)
		data[csv] = d
		csv_names = []
		
		//check out the depths in the dataset...if there is a new range, adjust it to include the max 
		fileDepths = getDepths(data)
		d3.select('#depthAxisSvg').select('.axis').remove()
		if (d3.max(fileDepths) > depthMinMax[1]){
			depthMinMax[1] = d3.max(fileDepths)
		}
		if(d3.min(fileDepths) < depthMinMax[0]){
			depthMinMax[0] = d3.min(fileDepths)
		}
		depthScale = d3.scale.linear()
			.domain([depthMinMax[0], depthMinMax[1]])
			.range([nameOffset, curveHeight])
		var depthAxis = d3.svg.axis()
			.scale(depthScale)
			.orient('right')
		var depth = d3.select('#depthAxisSvg').append('g')
			.attr('class', 'axis')
			.attr('transform', 'translate(5, 0)')
			.call(depthAxis)
		var depth_label = depth.append('text')
					.attr('class', 'toplabel')
					.attr('x', 5)
					.attr('y', nameOffset - 10)
					.attr('transform', 'rotate(-45 ' + (5) + ',' +( nameOffset + -20) + ')')
					.text('Depth')
					.selectAll("text")	
						.style("text-anchor", "end")
						.attr("dx", "-.8em")
						.attr("dy", ".35em")
						.attr("transform", function(d) {
							return "rotate(-45)" 
							})
			
		if (csv != "" && chronCalled == false){ //chronology file exists
				d3.text(chronofile, function(updata){
					console.log('Setting Chronology')
					if (chronCalled == false){
					chronSVG = setupSVG(totalHeight, axisWidth)
					}
					chronCalled = true
					console.log('added chronology')
					c = d3.csv.parseRows(updata)
					chron = []
					chronDepths = []
					dates = []
					var x = 1
					while (x < c.length){
						console.log(c[x])
						C = +c[x][1]
						D = +c[x][0]
						date = +c[x][2]
						chron.push(C)
						chronDepths.push(D)
						if (date != 0){dates.push(date)}
						x+=1
					}
					function findY(date, depths, chron_array){
						index = chron_array.indexOf(date)
						depthAtIndex = depths.splice(index, 1)
						yAtIndex = depthScale(depthAtIndex)
						return yAtIndex
					}
					chronMin = d3.min(chron, function(d){return d})
					chronMax = d3.max(chron, function(d){return d})
					yAtMin = findY(chronMin, chronDepths, chron)
					maxIndex = chron.indexOf(date) - 1
					depthAtMax = chronDepths.splice(maxIndex, 1)
					yAtMax = depthScale(depthAtMax)
					chronAxis = chronSVG.append('g')
						.attr('class', 'axis')
					chronAxis.append('line')
						.attr('x1', 5)
						.attr('x2', 5)
						.attr('y1', yAtMax)
						.attr('y2', yAtMin)
						.attr('stroke', 'black')
					workingDates = dates.sort()
					q = 0
					while (q < dates.length) {
						date = parseInt(workingDates.splice(q, 1))
						if ($.isNumeric(date)){
							yVal = findY(date, chronDepths, chron)
							chronAxis.append('line')
								.attr('x1', 0)
								.attr('x2', 10)
								.attr('y1', yVal)
								.attr('y2', yVal)
								.attr('stroke', 'black')
							chronAxis.append('text')
								.attr('x', 10)
								.attr('y', yVal+5)
								.text(date)
							}
							q+=1
						}
					var top_label = chronAxis.append('text')
					.attr('class', 'toplabel')
					.attr('x', 5)
					.attr('y', nameOffset - 10)
					.attr('transform', 'rotate(-45 ' + (5) + ',' +( nameOffset + -20) + ')')
					.text('Years BP')
					.selectAll("text")	
						.style("text-anchor", "end")
						.attr("dx", "-.8em")
						.attr("dy", ".35em")
						.attr("transform", function(d) {
							return "rotate(-45)" 
							})
				})
			}
	if (plotCalled == false){
		plotSVG = setupSVG(totalHeight, plotWidth).attr('id', 'plotSvg')
	}
	console.log('added plot')
	plotCalled = true
		//find names
		for (i in data[csv][0]){
			name = data[csv][0][i].trim()
			csv_names.push(name)
			id = name.replace(/\s/g, '_')
			ids.push(id)
		}
		names[csv] = csv_names
		$('#controls').append($('<div id="' + csv + '" class="fileHolder"></div>'))
		id = '#' + csv.replace(".", "\\.")
		$(id).append('<div class="page-header">File: ' + csv + '</div>')
		for (i in csv_names){
			n = csv_names[i]
			if (n != ""){
				div = $('<div class="selectiondiv" id="' + n + '_div"></div>')
				i = $('<input type="checkbox" name="' + n + '"/>')
				$(i).data('file', csv)
				lab = $('<label for="' + n + '">' + n + '</label>')
				div.append(i)
				div.append(lab)
				i.on('click', dispatch)
				$(id).append(div) // append the name to the csv's div
			}
		}
	focus = plotSVG.append('g')
		.attr('class', 'focus')
	focus.append('line')
		.attr('x1', 0)
		.attr('x2', plotWidth)
		.attr('stroke', 'black')
		.attr('strokewidth', 1)
		.attr('display', null)
	focus.append('text')
		.attr('x', plotWidth - 150)
		.attr('id', 'depthtext')
	focus.append('text')
		.attr('x', plotWidth - 150)
		.attr('id', 'chrontext')
	})
}

function getValues(dataset, name){ //get the values for a certain taxon 
	taxon = []
	index = names[dataset].indexOf(name)
	numlevels = data[dataset].length
	level = 1 //gets rid of depth but not age
	while (level < numlevels){
		depth = data[dataset][level][0]
		d = +data[dataset][level][index]
		point = {'x': d, 'y': depth}
		taxon.push(point)
		level +=1
	}
	return taxon
}
		

function makePlot(at){ //the central graph loop
	d3.selectAll('.curve').remove()
	var x_offset = 5;
	plot = plotSVG;
	for (t in at){
		console.log('working at: ' + x_offset)
		datafile = at[t]['datafile']
		name = at[t]['Tname']
		var tvals = getValues(datafile, name)
		id = name.replace('+', ' ').replace(/ /g, "_").replace(/%/g, "_").replace(')', "_").replace('(', "_").replace('/', "_")
		id = "C" + id
		curve = plot.append('g')
			.attr('class', 'curve')
			.attr('id', id)
			.attr('name', at[t]['Tname'])
			.on('click', curveclick)
			
		//put 45 degree rotated label on top
		top_label = curve.append('text')
			.attr('class', 'toplabel')
			.attr('x', x_offset)
			.attr('y', nameOffset - 10)
			.attr('transform', 'rotate(-45 ' + (x_offset + 20) + ',' +( nameOffset + -20) + ')')
			.text(name)
			.selectAll("text")	
				.style("text-anchor", "end")
				.attr("dx", "-.8em")
				.attr("dy", ".35em")
				.attr("transform", function(d) {
					return "rotate(-45)" 
					});
		//do scaling stuff
		m = d3.max(tvals, function(d){ return d.x})
		var taxScale = d3.scale.linear()
			.domain([0, m])
			.range([x_offset, (x_offset + (plotWidth -130)/at.length)])
		console.log('Scaled' + taxScale(m))
		pathvals = []
		smoothvals = [] //3 point smoothed values
		start = {'x': x_offset, 'y': nameOffset}
		pathvals.push(start)
		smoothvals.push(start)
		t = 0
		while (t < tvals.length){
			x = tvals[t]['x']
			scaledX = +taxScale(x)
			y = tvals[t]['y']
			depthY = +depthScale(y) // could accomodate scaing my chronology later on
			point = {'x': scaledX, 'y': depthY} 
			pathvals.push(point)
			if (t > 1 && t < tvals.length -1){
				var plus = +taxScale(tvals[t + 1]['x'])
				var minus = +taxScale(tvals[t - 1]['x'])
				var smoothx = (2*scaledX + plus + minus)/4
				var smoothpoint = {'x':smoothx, 'y':depthY}
				smoothvals.push(smoothpoint)
			}
			t +=1
		}
		end = {'x': x_offset, 'y':curveHeight}
		pathvals.push(end)
		smoothvals.push(end)
		//transform to svg path
		var line = d3.svg.line()
			.x(function (d) {return d.x})
			.y(function(d){return d.y})
			.interpolate('linear')
		path = line(pathvals)
		smooth = line(smoothvals)
		
		smooth_paths[id] = smooth
		//append the path the curve group
		var taxonCurve = curve.append('path')
			.attr('d', path)
			.attr('fill', 'lightsteelblue')
			.attr('stroke', 'lightsteelblue')
			.attr('stroke-width', 1)
		//draw out the axis
		var taxAxis = d3.svg.axis()
			.scale(taxScale)
			.orient('bottom')
		var tax = curve.append('g')
			.attr('class', 'axis')
			.attr('transform', 'translate(0' + ',' + (curveHeight + 50) + ')')
			.call(taxAxis)
			.selectAll("text")	
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".35em")
            .attr("transform", function(d) {
                return "rotate(-65)" 
                });
		x_offset += (plotWidth - 100)/at.length
		plot.on('mousemove', mousemove)
		plot.on('mouseout', function(){
			focus.attr('display', 'none')
		})	
		plot.on('mouseover', function(){
			focus.attr('display', null)
		})	
	}
}

var curveclick = function(){
			var orig = d3.select(this)
			orig_path = orig.selectAll('path')
			console.log(orig)
			curveId = orig.attr('id')
			if (orig.attr('clicked') == 'true'){
				var selection = '[smooth_id=' + id + ']' 
				console.log(selection)
				a = orig.select(selection)
				console.log(a)
				a.remove()
				orig_path.transition().duration(500).attr('fill', 'lightsteelblue').attr('stroke-width', 1).attr('stroke', 'lightsteelblue')
				orig.attr('clicked', 'false')
			}else{
			smoothvals = smooth_paths[curveId]
			orig_path.transition().duration(500).attr('fill', 'none').attr('stroke-width', 0.5).attr('stroke', 'grey')
			c = orig.append('path')
				.attr('d', smoothvals)
				.attr('stroke', 'red')
				.attr('fill', 'none')
				.attr('stroke-width', 3)
				.attr('class', 'smooth-curve')
				.attr('smooth_id', curveId)
			console.log(c)
			
			orig.attr('clicked', 'true')
	}
}

var mousemove = function(){
	mousex = d3.mouse(this)[0]
	mousey = d3.mouse(this)[1]
	depth = depthScale.invert(mousey)
	function closest(array,num){
	    var i=0;
	    var minDiff=1000;
	    var ans;
	    for(i in array){
	         var m=Math.abs(num-array[i]);
	         if(m<minDiff){ 
	                minDiff=m; 
	                ans=array[i]; 
	            }
	      }
	    return +ans;
	}

	if ((depth > depthMinMax[0]) && (depth < depthMinMax[1])){
		
		focus.select('line')
				.attr('y1', mousey)
				.attr('y2', mousey)
		var depthlab = Math.round(depth * 100) / 100
		
			focus.select('#depthtext')
				.text('Depth: ' + depthlab)
				.attr('y', mousey - 20) 
		if (chron.length > 0){
			closestChronDepth = closest(chronDepths, depth)
			closestChronIndex = chronDepths.indexOf(closestChronDepth)
			closestChronDate = +chron.slice(closestChronIndex, closestChronIndex + 1)
			var chronlab = Math.round(closestChronDate * 100) / 100 + " Years BP"
			focus.select('#chrontext')
				.text('Age: ' + chronlab)
				.attr('y', mousey + 23)
		}
			
				
	}else{
		focus.attr('display', 'none')
	}
}

	

var dispatch = function(){
	var input = this
	if (input.checked){
		name = this.name
		f = $(this).data('file')
		taxon = {'datafile': f, 'Tname' : name}
		active_taxa.push(taxon)
		active_names.push(name)
		makePlot(active_taxa)
	}else{
		name = this.name
		d3.selectAll('.curve').remove()
		index = active_names.indexOf(name)
		console.log(index)
		if (index > -1){
			active_taxa.splice(index, 1)
			active_names.splice(index, 1)
		}
		console.log(active_taxa)
		if (active_taxa.length > 0){
			makePlot(active_taxa)
		}
	}
}
