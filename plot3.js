var plotWidth = 1000;
var plotHeight = 800;
var nameOffset = 200;
var axisWidth = 100;

$('load').click(function(){
	loadData
})

loadData = function(csv_file){
	d3.text(csv_file, function(updata){
		data = d3.csv.parseRows(updata)
		
		names= []
		//append the checkboxes here with class 'id_check'
		
		
		//define setupSVG
		var setupSVG = function(width, height){
			svg = d3.select('#plot').append('svg')
				.attr('height', height)
				.attr('width', width)
			return svg
		}
		//create separate svgs for the axes so we don't need to worry about scaling
		depthSVG = setupSVG(axisWidth, (plotHeight - nameOffset));
		chronSVG = setupSVG(axisWidth, (plotHeight - nameOffset));
		//create the main svg canvas for the plot
		plotSVG = setupSVG(plotWidth, plotHeight)
		
		
		//define getValues --> loop through csv object to create array of given taxon
		var getValues = function(taxon){
			return 
		}
		
		//get depths array
		
		
		//define depthScale
		depthScale = d3.scale.linear()
			.domain([])
			.range([])
		//Write Depth Axis
		depthAxis = d3.svg.axis()
			.scale(depthScale)
			.orient('left')
		depth = depthSVG.append('g')
			.attr('class', 'axis')
			.attr('transform', 'translate(100, 0)')
			.call(depthAxis)
			
		//get chronology array
		
		
		//define chronology scale
		chronScale = d3.scale.linear()
			.domain([])
			.range([])
		
		//write chronology axis
		chronAxis = d3.svg.axis()
			.scale(chronScale)
			.orient('left')
		chron = chronSVG.append('g')
			.attr('class', 'axis')
			.attr('transform', 'translate(100, 0)')
			.call(chronAxis)
		
		
		//main interaction function dispatches to makeplot and removeplot
		active_taxa = [] //working list of taxa on the graph at the current point in time
		$('.id_check').on('change', function(){
			if (this.prop('checked')){
				active_taxa.append(this.name)
				makePlot
			}else{
				removePlot
			}
		}) //end of dispatching function
		
		var makePlot = function(active_taxa){
			//get values
			//establish x scale
			//write the name above the curve
			//append the curve to the svg
			//values ->scale(values)->line(
			
			return
		}
		var removePlot = function(name){
			return 
		}
		
		var mousemove = function(){
			mousex = d3.mouse(this)[0]
			mousey = d3.mouse(this)[1]
		}
		
		
	})//end of d3.load
};//end of load data

