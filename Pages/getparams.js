var paramsIntervalId;
var drawDependentsIntervalId;

var startDateComponent;
var endDateComponent;
var divStartDate = "#DivStartDate";
var divEndDate = "#DivEndDate";

/*
	pageCode:
	ORDERS_BY_STATUS
	ERROR_ORDERS
	ORDER_DURATION
	TASK_BY_NAME
	TASK_DURATION
	TASK_BY_DATE
	TASK_ASSIGNMENT
*/
var pageCode;	 //Tab code
var glTittle;

var tableParams; //Array of UxTablesObjects and their parameters
var graphParams; //Array of UxGraphsObjects and their parameters

var chkboxParams; //Array of checkbox groups and their parameters
var chkboxesLoaded = 0;

var datesParams; //Array of date fields and their parameters
var datesLoaded = 0;

function pageInit(pc) {
	var visual = "";
	pageCode = pc;
	
	switch(String(pageCode)) {
		case 'ORDERS_BY_STATUS':
			glTittle = "Orders By Status";
			break;
		case 'ERROR_ORDERS':
			glTittle = "Error Orders";
			break;
		case 'ORDER_DURATION':
			glTittle = "Orders Duration";
			break;
		case 'TASK_BY_NAME':
			glTittle = "User Task by Name";
			break;
		case 'TASK_DURATION':
			glTittle = "User Task Duration";
			break;
		case 'TASK_BY_DATE':
			glTittle = "User Task by Date";
			break;
		case 'TASK_ASSIGNMENT':
			glTittle = "User Task Assignment";
			break;
	}
	
	document.title = glTittle;
	
	setHtmlToInfoElement("");
	buttonRedraw();
	drawElements();
}

function checkHeadElements() {
	var ret = 0;
	
	if (pageCode == "ORDERS_BY_STATUS" || pageCode == "ERROR_ORDERS" || pageCode == "ORDER_DURATION") {
		if(startDateComponent && endDateComponent && chkboxesLoaded == 1) {
			ret = 1;
		}
	}
	
	if (pageCode == "TASK_BY_NAME") {
		ret = 1;
	}
		
	
	return ret;
}

function drawElements() {
	
	if (pageCode != "TASK_BY_NAME") {
	
		// Draw start date field
		new Ajax.RemoteCallJSON ('/solutions/titalia/sparkle/kpiReports/getparams.jsp',
			{
				method:'getDateFieldModel',
				parameters: {
						DATE: "SD"
				},
				onSuccess: function(json) {
					var jsonResponse = json.response;

					if (jsonResponse) {
						var jsonParse = JSON.parse(jsonResponse);
						var jsonResult = jsonParse.result;
						if (jsonResult.exeption) {
							setHtmlToInfoElement("Communication with server failed");
							console.log("error=" + jsonResult.exeption);
						}
						else {
							//var sdFieldModel = jsonResult.model;
							//console.log("stringify sdFieldModel="+JSON.stringify(jsonResult.model));
							
							var sdFieldModel = {
								"dateFormat": jsonResult.model.dateFormat,
								"attachToBody": jsonResult.model.attachToBody,
								"value": jsonResult.model.value
							};
							
							if (startDateComponent) {
								startDateComponent.destroy();
							}
							else {
								//sdFieldModel = {"value":"03.02.2018","attachToBody":false,"dateFormat":"DD.MM.YYYY"};
								startDateComponent = uxNg2.createComponent(divStartDate, "UxDateFieldComponent", sdFieldModel);
							}
						}
					}
					else {
						setHtmlToInfoElement("Communication with server failed");
					}
					
				}
			}
		);


		// Draw end date field
		new Ajax.RemoteCallJSON ('/solutions/titalia/sparkle/kpiReports/getparams.jsp',
			{
				method:'getDateFieldModel',
				parameters: {
						DATE: "ED"
				},
				onSuccess: function(json) {
					var jsonResponse = json.response;

					if (jsonResponse) {
						var jsonParse = JSON.parse(jsonResponse);
						var jsonResult = jsonParse.result;
						if (jsonResult.exeption) {
							setHtmlToInfoElement("Communication with server failed");
						}
						else {
							//var edFieldModel = jsonResult.model;
							//console.log("stringify edFieldModel="+JSON.stringify(jsonResult.model));
							
							var edFieldModel = {
								"dateFormat": jsonResult.model.dateFormat,
								"attachToBody": jsonResult.model.attachToBody,
								"value": jsonResult.model.value
							};
							//console.log("stringify edFieldModel="+JSON.stringify(edFieldModel));
							
							if (endDateComponent) {
								endDateComponent.destroy();
							}
							else {
								//edFieldModel = {"value":"03.02.2018","attachToBody":false,"dateFormat":"DD.MM.YYYY"};
								endDateComponent = uxNg2.createComponent(divEndDate, "UxDateFieldComponent", edFieldModel);
							}
						}
					}
					else {
						setHtmlToInfoElement("Communication with server failed");
					}
				}
			}
		);
	}
	
	else {
		drawOneMoreDate();
		drawOneMoreDate();
		drawOneMoreDate();
	}

	initAndDrawCheckboxes();
	initAndDrawDependents();
};

datesParams = [];
function drawOneMoreDate() {
	
	var dateFieldModel = {"dateFormat":"DD.MM.YYYY","value":"03.02.2018","attachToBody":false};
	var dateComponent = uxNg2.createComponent("#DivDate", "UxDateFieldComponent", dateFieldModel);
	
	datesParams.push(
	{	
		obj: dateComponent
	}
	);
	
}

function initAndDrawCheckboxes() {
	/* Start defining components depending on the pageCode */
	chkboxParams = [];
	chkboxesLoaded = 0;
			
	/* ORDERS_BY_STATUS */
	if (pageCode == "ORDERS_BY_STATUS" || pageCode == "ERROR_ORDERS" || pageCode == "ORDER_DURATION") {
	
		chkboxParams.push(
			{	state: "Uncreated",
				div: "#CFSTypesChkBox",
				JSONParams: {
					CODE: "CFS_TYPE"
				},
				obj: {}
			}
		);
		
		chkboxParams.push(
			{	state: "Uncreated",
				div: "#BSChkBox",
				JSONParams: {
					CODE: "BUSINESS_SCENARIO"
				},
				obj: {}
			}
		);
		
		chkboxParams.push(
			{	state: "Uncreated",
				div: "#StatusChkBox",
				JSONParams: {
					CODE: "STATUS"
				},
				obj: {}
			}
		);
		
		chkboxParams.push(
			{	state: "Uncreated",
				div: "#AgeChkBox",
				JSONParams: {
					CODE: "AGE"
				},
				obj: {}
			}
		);

	}
	
	
	/* Start drawing checkboxes */
	var chkboxLength = chkboxParams.length;
	
	if (chkboxLength > 0) {
		var cntLoadedChkboxes = 0;
		var chkboxInterval;

		for (var i = 0; i < chkboxLength; i++) {
			drawCheckbox(i);
		}
		
		/* Waiting for update finish and redraw button */
		chkboxInterval = setInterval(function() {
			cntLoadedChkboxes = 0;
			for (var i = 0; i < chkboxLength; i++) {
				if (chkboxParams[i].state != "InProgress" && chkboxParams[i].state != "Uncreated") {
					cntLoadedChkboxes++;
				}
			}
			if (cntLoadedChkboxes == chkboxLength) {
				chkboxesLoaded = 1;
				clearInterval(chkboxInterval);
			}
		}, 500);
	
	}
	
}

function drawCheckbox(index) {
	if (!chkboxParams[index]) {
		setHtmlToInfoElement("Communication with server failed");
		return;
	}
	chkboxParams[index].state = "InProgress";

	var checkBoxComponent;
	if (chkboxParams[index].obj) {
		checkBoxComponent = chkboxParams[index].obj;
	}

	// Draw CFS Types CheckBox Group
	new Ajax.RemoteCallJSON ('/solutions/titalia/sparkle/kpiReports/getparams.jsp',
		{
			method:'getCheckboxGroupFieldModel',
			parameters: chkboxParams[index].JSONParams,
			onSuccess: function(json) {
				var jsonResponse = json.response;

				if (jsonResponse) {
					var jsonParse = JSON.parse(jsonResponse);
					var jsonResult = jsonParse.result;
					if (jsonResult.exeption) {
						chkboxParams[index].state = "Error";
						setHtmlToInfoElement("Communication with server failed");
					}
					else {
						if (checkBoxComponent.component) {
							checkBoxComponent.destroy();
						}
						else {
							//console.log("stringify checkbox="+JSON.stringify(jsonResult.model));
							checkBoxComponent = uxNg2.createComponent(chkboxParams[index].div, "UxCheckboxGroupFieldComponent", jsonResult.model);
							chkboxParams[index].obj = checkBoxComponent;
						}
					}
				}
				else {
					chkboxParams[index].state = "Error";
					setHtmlToInfoElement("Communication with server failed");
				}
				chkboxParams[index].state = "Created";
			}
		}
	);
	
	
}

/*
	state:
	"Uncreated"
	"Error"
	"InProgress"
	"Created"
*/
function initAndDrawDependents() {
	
	paramsIntervalId = setInterval(function() {
		if (checkHeadElements() == 1) {
			tableParams = [];
			graphParams = [];
			
			/* Defining checkbox variables */
			
			var chkboxLength = chkboxParams.length;
			var cntLoadedChkboxes = 0;
			var currCheckboxComponent;
			var currArray;
			var currLength;
			var currString;
			var currCode;
			
			var cbCFS;
			var cbBS;
			var cbStatus;
			var cbAge;
			
			for (var i = 0; i < chkboxLength; i++) {
				currString = "";
				var j = 1;
				if (chkboxParams[i].state == "Created") {
					currCheckboxComponent = chkboxParams[i].obj.component;
					currCode = chkboxParams[i].JSONParams.CODE;
					
					if (currCheckboxComponent.value) {
						currArray = currCheckboxComponent.value.toArray();
						currLength = currArray.length;
						
						currArray.forEach(function(element) {
						  currString = currString + element.value.code;
						  if (currLength > j) {
							  currString = currString + ",";
						  }
						  j++;
						});
						
						//console.log(currString);

						switch(String(currCode)) {
							case "CFS_TYPE":
								cbCFS = currString;
								break;
							case "BUSINESS_SCENARIO":
								cbBS = currString;
								break;
							case "STATUS":
								cbStatus = currString;
								break;
							case "AGE":
								cbAge = currString;
								break;
						}
					}
					
					
					//console.log("stringify currCheckboxComponent="+JSON.stringify(currCheckboxComponent));
				}
			}
			
			
			/* Start defining components depending on the pageCode */
			
			/* ORDERS_BY_STATUS */
			if (pageCode == "ORDERS_BY_STATUS") {
			
				tableParams.push(
					{
						state: "Uncreated",
						div: "#DivOrdersStatusTable",
						JSONParams: 
							{
								CODE: "ORDERS_BY_STATUS",
								SD: toFormattedDate(startDateComponent.component.value).toJSON(),
								ED: toFormattedDate(endDateComponent.component.value).toJSON(),
								CFS_TYPE: cbCFS,
								BUSINESS_SCENARIO: cbBS,
								STATUS: cbStatus,
								AGE: cbAge
							},
						obj: {}
					}
				);
				
				graphParams.push(
					{
						state: "Uncreated",
						div: "#DivOrdersStatusGraph",
						tittle: glTittle,
						year: startDateComponent.component.value.getFullYear(),
						month: startDateComponent.component.value.getMonth(),
						day: startDateComponent.component.value.getDate(),
						JSONParams: 
							{
								CODE: "ORDERS_BY_STATUS",
								SD: toFormattedDate(startDateComponent.component.value).toJSON(),
								ED: toFormattedDate(endDateComponent.component.value).toJSON(),
								CFS_TYPE: cbCFS,
								BUSINESS_SCENARIO: cbBS,
								STATUS: cbStatus,
								AGE: cbAge
							},
						obj: {}
					}
				);
				
			}
			
			/* ERROR_ORDERS */
			if (pageCode == "ERROR_ORDERS") {
			
				tableParams.push(
					{
						state: "Uncreated",
						div: "#DivErrorOrdersTable",
						JSONParams: 
							{
								CODE: "ERROR_ORDERS",
								SD: toFormattedDate(startDateComponent.component.value).toJSON(),
								ED: toFormattedDate(endDateComponent.component.value).toJSON(),
								CFS_TYPE: cbCFS,
								BUSINESS_SCENARIO: cbBS,
								STATUS: cbStatus,
								AGE: cbAge
							},
						obj: {}
					}
				);
				
				graphParams.push(
					{
						state: "Uncreated",
						div: "#DivErrorOrdersGraph",
						tittle: glTittle,
						year: startDateComponent.component.value.getFullYear(),
						month: startDateComponent.component.value.getMonth(),
						day: startDateComponent.component.value.getDate(),
						JSONParams: 
							{
								CODE: "ERROR_ORDERS",
								SD: toFormattedDate(startDateComponent.component.value).toJSON(),
								ED: toFormattedDate(endDateComponent.component.value).toJSON(),
								CFS_TYPE: cbCFS,
								BUSINESS_SCENARIO: cbBS,
								STATUS: cbStatus,
								AGE: cbAge
							},
						obj: {}
					}
				);
				
			}
			
			
			/* ORDER_DURATION */
			if (pageCode == "ORDER_DURATION") {
			
				tableParams.push(
					{
						state: "Uncreated",
						div: "#DivDurationTable1",
						JSONParams: 
							{
								CODE: "ORDER_DURATION1",
								SD: toFormattedDate(startDateComponent.component.value).toJSON(),
								ED: toFormattedDate(endDateComponent.component.value).toJSON(),
								CFS_TYPE: cbCFS,
								BUSINESS_SCENARIO: cbBS,
								STATUS: cbStatus,
								AGE: cbAge
							},
						obj: {}
					}
				);
				
				tableParams.push(
					{
						state: "Uncreated",
						div: "#DivDurationTable2",
						JSONParams: 
							{
								CODE: "ORDER_DURATION2",
								SD: toFormattedDate(startDateComponent.component.value).toJSON(),
								ED: toFormattedDate(endDateComponent.component.value).toJSON(),
								CFS_TYPE: cbCFS,
								BUSINESS_SCENARIO: cbBS,
								STATUS: cbStatus,
								AGE: cbAge
							},
						obj: {}
					}
				);
				
				graphParams.push(
					{
						state: "Uncreated",
						div: "#DivDurationGraph1",
						tittle: glTittle,
						year: startDateComponent.component.value.getFullYear(),
						month: startDateComponent.component.value.getMonth(),
						day: startDateComponent.component.value.getDate(),
						JSONParams: 
							{
								CODE: "ORDER_DURATION1",
								SD: toFormattedDate(startDateComponent.component.value).toJSON(),
								ED: toFormattedDate(endDateComponent.component.value).toJSON(),
								CFS_TYPE: cbCFS,
								BUSINESS_SCENARIO: cbBS,
								STATUS: cbStatus,
								AGE: cbAge
							},
						obj: {}
					}
				);
				
				graphParams.push(
					{
						state: "Uncreated",
						div: "#DivDurationGraph2",
						tittle: glTittle + " (%)",
						year: startDateComponent.component.value.getFullYear(),
						month: startDateComponent.component.value.getMonth(),
						day: startDateComponent.component.value.getDate(),
						JSONParams: 
							{
								CODE: "ORDER_DURATION2",
								SD: toFormattedDate(startDateComponent.component.value).toJSON(),
								ED: toFormattedDate(endDateComponent.component.value).toJSON(),
								CFS_TYPE: cbCFS,
								BUSINESS_SCENARIO: cbBS,
								STATUS: cbStatus,
								AGE: cbAge
							},
						obj: {}
					}
				);
				
			}

			/* TASK_BY_NAME */
			if (pageCode == "TASK_BY_NAME") {
				
				var currComponent;
				var currString = "";
				
				var currLength = datesParams.length;
				var j = 1;
				
				for (var i = 0; i < currLength; i++) {
					currComponent = datesParams[i].obj.component;
					if (currComponent.value) {
						currString = currString + toFormattedDate(currComponent.value);
						if (currLength > j) {
							currString = currString + ",";
						}
						j++;
					}
				}
				console.log("currString="+currString);
			
				tableParams.push(
					{
						state: "Uncreated",
						div: "#DivTaskByNameTable",
						JSONParams: 
							{
								CODE: "TASK_BY_NAME",
								DATES: currString
							},
						obj: {}
					}
				);
				
			}
			
			/*  */
			
			
			

			clearInterval(paramsIntervalId);
			drawDependentElements();
		}
	}, 500);
	
}

function destroyDependentElements() {
	var tableLength = tableParams.length;
	var graphLength = graphParams.length;
	var cntLoadedTables = 0;
	var cntLoadedGraphs = 0;
	
	for (var i = 0; i < tableLength; i++) {
		if (tableParams[i].obj) {
			if (tableParams[i].obj.component) {
				tableParams[i].obj.destroy();
			}
		}
	}
	for (var i = 0; i < graphLength; i++) {
		if (graphParams[i].obj) {
			if (graphParams[i].obj.component) {
				graphParams[i].obj.destroy();
			}
		}
	}
}

function clickButton () {
	setHtmlToInfoElement("");
	clearInterval(paramsIntervalId);
	setHtmlToAttribute(getLoadingButtonHtml());
	
	destroyDependentElements();
	initAndDrawDependents();
}

// Draw dependent from parameter fields elements
function drawDependentElements() {
	var tableLength = tableParams.length;
	var graphLength = graphParams.length;
	var cntLoadedTables = 0;
	var cntLoadedGraphs = 0;

	/* Draw table(s) */
	for (var i = 0; i < tableLength; i++) {
		drawTable(i);
	}
	
	/* Draw graph(s) */
	for (var i = 0; i < graphLength; i++) {
		drawGraph(i);
	}
	
	/* Waiting for update finish and redraw button */
	drawDependentsIntervalId = setInterval(function() {
		cntLoadedTables = 0;
		cntLoadedGraphs = 0;
		
		for (var i = 0; i < tableLength; i++) {
			if (tableParams[i].state != "InProgress" && tableParams[i].state != "Uncreated") {
				cntLoadedTables++;
			}
		}
		for (var i = 0; i < graphLength; i++) {
			if (graphParams[i].state != "InProgress" && graphParams[i].state != "Uncreated") {
				cntLoadedGraphs++;
			}
		}
		if (cntLoadedTables == tableLength && cntLoadedGraphs == graphLength) {
			buttonRedraw();
			clearInterval(drawDependentsIntervalId);
		}
	}, 500);
	
}

function drawTable(index) {
	if (!tableParams[index]) {
		setHtmlToInfoElement("Communication with server failed");
		return;
	}
	tableParams[index].state = "InProgress";

	var tableComponent;
	if (tableParams[index].obj) {
		tableComponent = tableParams[index].obj;
	}

	new Ajax.RemoteCallJSON ('/solutions/titalia/sparkle/kpiReports/getparams.jsp',
	{
			method:'getTableModel',
			parameters: tableParams[index].JSONParams,
			onSuccess: function(json) {
				var jsonResponse = json.response;
				var jsonParse;
				var jsonResult;
				var tableModel;
				
				var newModel = {
					model: {
						header:{},
						body:{}
					}
				};
				
				if (jsonResponse) {
					jsonParse = JSON.parse(jsonResponse);
					jsonResult = jsonParse.result;
					
					if (jsonResult.exeption) {
						setHtmlToInfoElement("Communication with server failed");
						tableParams[index].state = "Error";
					}
					else {
						tableModel = jsonResult.model;
						//console.log("stringify ModelOrderStatus= " + JSON.stringify(ModelOrderStatus));

						var header = tableModel.model.header;
						var body = tableModel.model.body;

						newModel.model.header = header;
						newModel.model.body = body;
						//console.log("stringify newModel="+JSON.stringify(newModel));
						
						if (tableComponent.component) {
							tableComponent.destroy();
						}
						tableComponent = uxNg2.createComponent(tableParams[index].div, "UxTableComponent", newModel);
						//tableComponent.update();
						
						//console.log("UxSortTypes="+UxSortTypes);
						/*
						tableComponent.component.customSortFunction = function(a,b,columnIndex,sortType)
						{
							console.log("sort111111");
							
							if (columnIndex == 0) {
							
								console.log("a"+a);
								console.log("b="+b);
								console.log("columnIndex="+columnIndex);
								console.log("sortType="+sortType);
								
								//.columns[0].value
								//new Date('2011-04-11T10:20:30Z')
								let result;
								if (a.columns[0].value < b.columns[0].value) {
										result = -1;
								} else if (a.id > b.id) {
										result =  1;
								} else {
										result =  0;
								}
								return result;
							}
						}*/
						
						/*
						this.tableComponent.customSortFunction = (
							a: UxTableRow, //prev value in sort function
							b: UxTableRow, //next value in sort function

							/*Index of clicked column header. Or when table update() method happens table
							starts to check  column.sort for each header column and in case of
							column.sort = "asc" | "desc" triggers sorting for this column;*/
							/*columnIndex: number,
							sortType: UxSortTypes //current column.sort type
						) => {
							let result;
							if (a.id < b.id) {
									result = -1;
							} else if (a.id > b.id) {
									result =  1;
							} else {
									result =  0;
							}
							return result;
						}
						*/
					}
				}
				else {
					setHtmlToInfoElement("Communication with server failed");
					tableParams[index].state = "Error";
				}
				tableParams[index].state = "Created";
				tableParams[index].obj = tableComponent;
			}
	});
}

function drawGraph(index) {
	if (!graphParams[index]) {
		setHtmlToInfoElement("Communication with server failed");
		return;
	}
	
	//console.log("Graph Params ="+JSON.stringify(graphParams[index]));
	graphParams[index].state = "InProgress";

	var graphComponent;
	if (graphParams[index].obj) {
		graphComponent = graphParams[index].obj;
	}

	var graphModel = {
		 model: {
			 "chart": {
						"type": "spline",
						"reflow": true,
						"events": {
							"load": function () {
								this.reflow();
							}
						}
						//top: '80%',
						/*
						"scrollablePlotArea": {
							"minWidth": "800",
							"scrollPositionX": 1
						}*/
						//"width": "900"
						//"zoomType": "XY"
				},
			 "title": {
					 "text": graphParams[index].tittle
			 },
			 "credits": {
					 "enabled": false
			 },
			 "xAxis": {
					"type": "datetime",
					"dateTimeLabelFormats": {
            //"day": "%e of %b %Y"
						"day": "%e of %b"
					},
					"labels": {
							"overflow": "justify"
					}
					//top: '80%'
			 },
			 "yAxis": {
					"title": {
							"text": "Values"
					}
					//top: '80%'
					//"minorGridLineWidth": 0,
					//"gridLineWidth": 0
			},
			 "plotOptions": {
					"spline": {
							"lineWidth": 2,
							"states": {
									"hover": {
											"lineWidth": 3
									}
							},
							"marker": {
									"enabled": false
							},
							"pointInterval": 1,
							"pointIntervalUnit" : "day",
							"pointStart": Date.UTC(graphParams[index].year, graphParams[index].month, graphParams[index].day)
					}
			},
			"series": {}
		 }
  };
				
	new Ajax.RemoteCallJSON ('/solutions/titalia/sparkle/kpiReports/getparams.jsp',
	{
			method:'getGraphModel',
			parameters: graphParams[index].JSONParams,
			onSuccess: function(json) {
				var jsonResponse = json.response;
				var jsonParse;
				var jsonResult;
				var graphSeries;
				
				if (jsonResponse) {
					//console.log("jsonResponse=" + jsonResponse);
					jsonParse = JSON.parse(jsonResponse);
					jsonResult = jsonParse.result;
					
					if (jsonResult.exeption) {
						setHtmlToInfoElement("Communication with server failed");
						graphParams[index].state = "Error";
					}
					else {
						graphSeries = jsonResult.data.series;
						graphModel.model.series = graphSeries;

						if (graphComponent.component) {
							graphComponent.destroy();
						}
						graphComponent = uxNg2.createComponent(graphParams[index].div, "UxGraphComponent", graphModel);
					}
				}
				else {
					setHtmlToInfoElement("Communication with server failed");
					graphParams[index].state = "Error";
				}
				graphParams[index].state = "Created";
				graphParams[index].obj = graphComponent;
			}
	});
	
}

/* *************** Tools *************** */
function toReadable(date) {
	var res = "";
	var day = date.getDate();
	if(day < 10) {
		res += "0";
	}
	res += day+"/";
	var month = date.getMonth();
	month++;
	if(month < 10) {
		res += "0";
	}
	res += month +"/";
	var year = date.getFullYear();
	res += year+" ";
	var hours = date.getHours();
	if(hours < 10) {
		res += "0";
	}
	res +=hours+":";
	var minutes = date.getMinutes();
	if(minutes < 10) {
		res += "0";
	}
	res += minutes+":";
	var seconds = date.getSeconds();
	if(seconds < 10) {
		res += "0";
	}
	res += seconds;
	return res;
}

/* Returns date in format DD.MM.YYYY */
function toFormattedDate(vdate) {
	var resDate = vdate.getDate().toString().replace(/^([0-9])$/, '0$1') + '.' + (vdate.getMonth() + 1).toString().replace(/^([0-9])$/, '0$1') + '.' + vdate.getFullYear();
	return resDate;
}

/* *************** Buttons *************** */
function buttonRedraw() {
	var visual = "";
	visual += getButtonHtml();
	setHtmlToAttribute(visual);
}

function getButtonHtml(){
    var html = "<a href=\"#\" onclick=\"clickButton()\"><img src=\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQC" +
    		"AYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA2RpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2" +
    		"tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8" +
    		"iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYwIDYxLjEzNDc3NywgMjAxMC8wMi8xMi0xNzozMjowMCAgICAgICAgIj4gPHJkZjpS" +
    		"REYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6Y" +
    		"WJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYm" +
    		"UuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOk9" +
    		"yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDo0NjMwNTBBMUE1MDBFMTExOEFGQkExNjA1RkZEMzREMSIgeG1wTU06RG9jdW1lbnRJRD0ieG1w" +
    		"LmRpZDoyNTQ3MEU1MDM3MEExMUUzOTk1NjlCODlFMUU5MjFENiIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDoyNTQ3MEU0RjM3MEExMUUzO" +
    		"Tk1NjlCODlFMUU5MjFENiIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ1M1IFdpbmRvd3MiPiA8eG1wTU06RGVyaXZlZEZyb2" +
    		"0gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDpFMEMzMzI0ODc4MzVFMzExQjFFNjk1MjMwQ0U3QkJFQiIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1" +
    		"wLmRpZDo0NjMwNTBBMUE1MDBFMTExOEFGQkExNjA1RkZEMzREMSIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0" +
    		"YT4gPD94cGFja2V0IGVuZD0iciI/PiUz/GQAAAI3SURBVHjapJLPaxNREMdnf7i7L9382GySbpu2FquQNNSKhxz04EHBgyAexEv1oOhBWyhGC" +
    		"hZiDsWSg1TJyYt4Ef+Igl4FPekhohc9hBpBYppfTbL73lvf22RLq71IBz4wzMz3y2PmCfnSCzhMiHDIOMgAMZY1FHgXMgyXw/L3vDbs8Sj4w7" +
    		"Lr0r3iJEKBTXPUyuihCKhoMN/vdrPt5na2Uf99BzvOpihJuU6rueYZULproOh68M340WMpVdPAcWxo1mte44iiQtgwQQ+GM327l7F7fWg1tgc" +
    		"voJgMhmR5yUxYKVmWgbnD7EQc5o7Peb3P3yvw9WfdMwrIOtjdHvg6kVIMnFjcXFQ0Fbo7HUiPR8mZ+XQ+OIImOJUf1be23QeMnV18nYyHTg6F" +
    		"add1PYMTUyeLufVn6/7CArp+3jDjIEmSV2g3G+DrZELwYEwA0Xf/8Kn82q+XCisHnm957clAtlQoeslsOkWwrImYLa+2VXncaLUe/aWJMiy+k" +
    		"n3/gGAMnJmkVd1pt0AQBFDQyKpLaY7VrSE5dt4tDaEyz30NRySEAOdc9nQJiS7wEwVCYSkxltwIRYwqx0pObiSSk5oRS8DM9NQ1X8MRXUqAo6" +
    		"pK6frli18U14Fepw3s90FsdMyD57yG2A4Xrlz65ms4IiUUOLcf5O1oJHzh3sLV8tn5FChAoF775cFzXltkPSturvgajnDz/sN9m3r5tMj/713" +
    		"GDcapYfkj4xXj+a3canfv/D8G/xt/BBgApFkdf1BlKRMAAAAASUVORK5CYII=\" width=\"16\" height=\"16\"></a>";
    return html;
}

function getLoadingButtonHtml(){
    var html = "<a href=\"#\"><img src=\"data:image/gif;base64,R0lGODlhEAAQAOfgAFlrdl1vemFzfmJ0f2N1gGR2gWV3gmp8h2p9iHGAhm6" +
    		"BjG+CjXCDjnOGkXSHknWIlHmIjnaJlXeKlniLl3yLkXmMmH2MknqNmXuOmn+OlHyPm32QnH6RnX+SnoCTn4STmYGUoIWUmoKVoYOXooSYo3+a" +
    		"pIWZpIaapYuaoYibpoKdp4mcp4OeqIqdqISfqYueqYWgqo6epIyfqoahq4+fpY2gq4eirJCgpo6hrYijrZGhp4+irpKiqImlr5Cjr5OjqYqms" +
    		"JGksJSkqounsZKlsZWlq4yospamrI2ps5Sns5enrZWotI+qtJiorpCrtZmpr5GstpqqsJirt5Ktt5ursZmsuJOuuJysspSvuZquuZWwupuvup" +
    		"axu5+vtpywu5eyvKGwt5qxwp2xvZizvaKxuJ6yvpm0v6OzuZq1wJa2xZ20xqC0wJe3x561x5u3wZi4yJy4wqa2vJm5yZ25w5q6yqG4yp66xKW" +
    		"4xKi4vpu7y5+7xaa5xam5v5y8zKC8xqe6xp69zaG9x6i7x6u7wZ++zqK+yKC/z6O/ya29xKHA0KTAyqbBzKLC0azAzKPD063BzaTE1LHCyLjA" +
    		"yK/Dz6nFz6bG1rDE0LrCyrTEyqfH17vDy7XFy7zEzLbGzMDFyL7Gz8HGybnJ0LrK0cPIy8TJzMHK0sXKzcLL08bMzsTN1b7P1cfNz7/Q1sfP1" +
    		"8rP0cLS2MzR1MrS283S1c7T1s7X39HX2c/Y4NLY2tXa3NPb5Nbb3dfc39Xd5tbe59ne4drf4tfg6Nvg49zi5N3j5d/k5uDl6OHm6eLn6uPo6+" +
    		"Tp7OXq7ebs7uft7+nu8Orv8uvw8+zx9O3y9e7z9u/19/P18vD2+PL3+fT5/Pf59vX6/fj69/n7+P/9+//9//z/+/7//P/////////////////" +
    		"/////////////////////////////////////////////////////////////////////////////////////////////////////////////" +
    		"/yH/C05FVFNDQVBFMi4wAwEAAAAh+QQJCgD/ACwAAAAAEAAQAAAIkwD/CRxIsKDBgwgFnrBh40TCfya0EMqUiZAWFydYFDxBh5EfN278MCIER" +
    		"0tBL4TMtJo2LZZIRlkI+pgzJtVAPmgCBXJCEAccJswGathBhAgJgjbGACH4rWlTgkqgDJnwUOAlF0ZAEHTg4KAOGThASJAAAkcKFAaf0RjxAg" +
    		"eOFyNoKDuYzRONCxdoeMr20Om3qlUDAgAh+QQJCgD/ACwAAAAAEAAQAAAIqQD/CRxIsKDBgwj/eTgxY4cJEgl9eKmTqBAhLDAOwuCC5o6ZRnA" +
    		"yzTlR8AcTM05iITvGy40hLSIIkpnCBJE1gd9yLfKTUcO/a0uArPggkMGgSHkYuZlR4h8zHDlADJS1wYgfRoC0CMSmYwWJAzir4bGqFaesFCkk" +
    		"LBCA89WJGgSR3RghY8OFBwT+fStW8JuzGBdetGjhAEDCb5qi8HhBIyHOZ9mWOZ4sMCAAIfkECQoA/wAsAAAAABAAEAAACKYA/wkcSLCgwYMIB" +
    		"dYgUqOFCIS7wDD5MmeOHi4rLhRM9mTGFCZQ7qRh5MZEQVcvjLSIsmyYqkaGsBD89qTFiQcDr/EaCWMgsiIpMBQgWA1OpRoDq3moIUHgNw94cE" +
    		"0ChNRpjBUaFvz7FurFH0OAZgz8VopDRgP/pNnQwwjQCoLSmozAEeEfNy92GOnJAWJsMSUp6n5jNQOLFicGl5mCILBZwseQEQYEACH5BAkKAP8" +
    		"ALAAAAAAQABAAAAinAP8JHEiwoMF/3Q4aZObqChgiMxR+K3ZkhQ0jWsZIafGgoLQmI3C0eAGECRo1LQh+K8VhBQYGFlzV2kOIC4iB32Ks0LBg" +
    		"YDVVafykFFjNQw0JBYs1KlRjILIiKS4E+OdMwT9rcCrJwBnFhYZ/306JIOYrDSMYBFGl6PjNSxVMkwxhMUhhwL9rPfQAYuTGhERaTBjxhVFB4" +
    		"T8qPdzoAWK4oBYXHRo3DggAIfkECQoA/wAsAAAAABAAEAAACKcA/wkcSLCgwW/PsjmrZpDgN01ReLz4IavhN2cxLrxYYcNGkCcGkd0YIWMDBh" +
    		"A7oEyB4VBWihQSFhj4FwKIGSc7Bk6j0WLEAYKtoMxZMTAYjw4OChLbk8cHwQQ//30jIxCZGUM4DFKDtgSEVFqH8pgo+M0WkCmDhvFyY0iLV4J" +
    		"xXPg5FMgSnExzTjScoogRo0CEsLBs+G+MGyNATIwl/A+KC8YGPTAOCAAh+QQJCgD/ACwAAAAAEAAQAAAIlAD/CRxIsKDBf98Sfjs4MJsnGhcu" +
    		"0PCU7aAyGiNe4MDxYgSNZwZRpMABQoIEEDhk6DjowAFBEEZcXGJIcMIQKEoIKkxIEMgYGwRJECGyQ8NAZkzg4CDoJFAgNHwGphozxwfBLIwY+" +
    		"Yk1bVorM4S8FNQCh5BWN278MKJzoiCLEy60EMqUiZAWEzT/nbBho23ev4AJBgQAIfkECQoA/wAsAAAAABAAEAAACJkA/wkcSLCgQYHGtiX7dp" +
    		"AgjRY/rkhi2PBfBBYrXlyI0cxgMYoPNmyQMUJHMII1TrSiKFBCihWwCGrxYwTPNJYmWuioJnAmIz9DNswaCAIHj2T/TuSAwygPpoI1gBAhCMP" +
    		"Polws1xiZcqbgF0Juehn71cqJGSZCCqaYkwnOIzN63HCpcXAGFkKBEtHx4qMiiRVAdpyoSLhww4AAIfkECQoA/wAsAAAAABAAEAAACJ4A/wkc" +
    		"SLCgwYMIBTYTaAFUMYNLtmCZwerbPwkrlAwjKKKHHUZ2vFh8gGNElGcEVwBi5AdHNIEbUnQgZVHgDECG/qTgVFPDihg1/wEJNEnXPxEDJdQAI" +
    		"W1gjUpwrBXccOLJr4EwGKXxVS3piRZPgv7TYuiRKF8CaxiRsapgCjRa/0BhAmWGkIcFW4SpM8fOFyZgbiWUQYRIjYSIEyMMCAAh+QQJCgD/AC" +
    		"wAAAAAEAAQAAAInAD/CRxIsKBBF1oMKvzHxI6bHlQWCpzRhhEjJrW+LUyBhhEgPT2sCcxgUIshSpuseNH44AQngjAYpQFGTIMpjRteRNEosEY" +
    		"lOCL/PRO44cSTXwOBAHokrKCEGiCkDXzhJ42oghpWxOApMAyhP6oENtiQogMprv9amHHjBEiNFDhGRBlasMaUMVqM4FhxZJjEGUTAHFmFTKLh" +
    		"wwYDAgAh+QQJCgD/ACwAAAAAEAAQAAAImwD/CRw4UATBgwhdQEFIkIQKI0zcjGEoEAYWQn4SMVI0hWEKOZngWAp0yI+LOAi/GHLTixiiKUBsf" +
    		"Ttowo8imf80JHE28+AOQmZ+CTzT88BBInQEBTvogMMNgjXmTOl0kMQLGgRxLDEDhKCEFCtgHYQxBUoPEBw2yBihY+nBJ0Bw4Fjx4kKMZhRH/Z" +
    		"Dx44qknhT/KdOWDHDgwAEBADs=\" width=\"16\" height=\"16\"></a>";
    return html;
}

function setHtmlToAttribute (html){
	document.getElementById('UpdateButton').innerHTML=html;
}
function setHtmlToInfoElement (html){
	document.getElementById('KPIInfoContent').innerHTML=html;
}