var plotWidth =500;
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
plotWidth = divWidth - 100 - 50
active_names = []

function setupSVG(height, width){
	svg = d3.select('#plot').append('svg')
		.attr('height', height)
		.attr('width', width)
	return svg
}

depthSVG = setupSVG(totalHeight, axisWidth).attr('id', 'depthAxisSvg')
//chronSVG = setupSVG(curveHeight, axisWidth)
plotSVG = setupSVG(totalHeight, plotWidth).attr('id', 'plotSvg')
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
function getChronology(data){
	chron = []
	for (i in data){
		chron.push(data[i][1]) // assumes that chronology is always in column 1
	}
	return chron
}

$('#load').click(function(){
	csv_file = $('#csv').val()
	loadData(csv_file)
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
			.orient('left')
		var depth = d3.select('#depthAxisSvg').append('g')
			.attr('class', 'axis')
			.attr('transform', 'translate(95, 0)')
			.call(depthAxis)
		console.log(depth)
		
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
			div = $('<div class="selectiondiv" id="' + n + '_div"></div>')
			i = $('<input type="checkbox" name="' + n + '"/>')
			$(i).data('file', csv)
			lab = $('<label for="' + n + '">' + n + '</label>')
			div.append(i)
			div.append(lab)
			i.on('click', dispatch)
			$(id).append(div) // append the name to the csv's div
		}
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
		id = name.replace(" ", "_")
		curve = plot.append('g')
			.attr('class', 'curve')
			.attr('id', id)
		//put 45 degree rotated label on top
		top_label = curve.append('text')
			.attr('class', 'toplabel')
			.attr('x', x_offset)
			.attr('y', nameOffset - 10)
			.attr('transform', 'rotate(-45 ' + (x_offset + 20) + ',' +( nameOffset + -20) + ')')
			.text(name)
		//do scaling stuff
		m = d3.max(tvals, function(d){ return d.x})
		var taxScale = d3.scale.linear()
			.domain([0, m])
			.range([x_offset, (x_offset + (plotWidth - 20)/at.length)])
		console.log('Scaled' + taxScale(m))
		pathvals = []
		start = {'x': x_offset, 'y': nameOffset}
		pathvals.push(start)
		for (t in tvals){
			x = tvals[t]['x']
			scaledX = +taxScale(x)
			y = tvals[t]['y']
			depthY = +depthScale(y) // could accomodate scaing my chronology later on
			point = {'x': scaledX, 'y': depthY} 
			pathvals.push(point)
		}
		end = {'x': x_offset, 'y':curveHeight}
		pathvals.push(end)
		//transform to svg path
		var line = d3.svg.line()
			.x(function (d) {return d.x})
			.y(function(d){return d.y})
			.interpolate('bundle')
		path = line(pathvals)
		
		//append the path the curve group
		var taxonCurve = curve.append('path')
			.attr('d', path)
			.attr('stroke', 'blue')
			.attr('fill', 'blue')
			
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
            .attr("dy", ".15em")
            .attr("transform", function(d) {
                return "rotate(-65)" 
                });

		
		x_offset += (plotWidth)/at.length
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
