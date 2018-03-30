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

var datesParams = []; //Array of date fields and their parameters
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
	
	setHtmlToAttribute ("KPIInfoContent","");
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
					console.log(jsonResponse);

					if (jsonResponse) {
						var jsonParse = JSON.parse(jsonResponse);
						var jsonResult = jsonParse.result;
						if (jsonResult.exeption) {
							setHtmlToAttribute ("KPIInfoContent", "Communication with server failed");
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
						setHtmlToAttribute ("KPIInfoContent", "Communication with server failed");
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
							setHtmlToAttribute ("KPIInfoContent", "Communication with server failed");
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
						setHtmlToAttribute ("KPIInfoContent", "Communication with server failed");
					}
				}
			}
		);
	}
	
	else {
		setHtmlToAttribute ("DivAddDateBtn", getAddDateButtonHtml());
		setHtmlToAttribute ("DivDeleteDateBtn", getDeleteDateButtonHtml());
		setHtmlToAttribute ("DivClearDateBtn", getClearDateButtonHtml());
		
		initialDates();
	}

	initAndDrawCheckboxes();
	initAndDrawDependents();
};

function addDate() {
	drawOneMoreDate();
}
function deleteDate() {
  var currDate;
	currDate = datesParams.pop();
	if (currDate) {
		currDate.obj.destroy();
	}
}
function initialDates() {
	var currDate;
	
	datesParams.forEach(function(element) {
		if (element.obj) {
			element.obj.destroy();
		}
	});
	
	datesParams = [];
	
	var mday = new Date();
	mday.setMonth(mday.getMonth() - 1);
	drawOneMoreDate(toFormattedDate(mday));
	
	var fortnight = new Date();
	fortnight.setDate(fortnight.getDate() - 14);
	drawOneMoreDate(toFormattedDate(fortnight));
	
	drawOneMoreDate();
}

function drawOneMoreDate(date) {

	var dateFieldModel;
	
	if (date) {
		dateFieldModel = {"dateFormat":"DD.MM.YYYY","value": date,"attachToBody":false};
	}
	else {
		var ystd = new Date();
		ystd.setDate(ystd.getDate() - 1);
		ystd = toFormattedDate(ystd);
		dateFieldModel = {"dateFormat":"DD.MM.YYYY","value": ystd,"attachToBody":false};
	}

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
		setHtmlToAttribute ("KPIInfoContent", "Communication with server failed");
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
						setHtmlToAttribute ("KPIInfoContent", "Communication with server failed");
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
					setHtmlToAttribute ("KPIInfoContent", "Communication with server failed");
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
				
				if (currString.length > 1) {
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
				else {
					setHtmlToAttribute ("KPIInfoContent", "Please add at least one date");
				}
				
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
	setHtmlToAttribute ("KPIInfoContent", "");
	clearInterval(paramsIntervalId);
	setHtmlToAttribute("UpdateButton", getLoadingButtonHtml());
	
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
		setHtmlToAttribute ("KPIInfoContent", "Communication with server failed");
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
						setHtmlToAttribute ("KPIInfoContent", "Communication with server failed");
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
					setHtmlToAttribute ("KPIInfoContent", "Communication with server failed");
					tableParams[index].state = "Error";
				}
				tableParams[index].state = "Created";
				tableParams[index].obj = tableComponent;
			}
	});
}

function drawGraph(index) {
	if (!graphParams[index]) {
		setHtmlToAttribute ("KPIInfoContent", "Communication with server failed");
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
						setHtmlToAttribute ("KPIInfoContent", "Communication with server failed");
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
					setHtmlToAttribute ("KPIInfoContent", "Communication with server failed");
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
	setHtmlToAttribute("UpdateButton", visual);
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
    		"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" +
    		"Dx44qknhT/KdOWDHDgwAEBADs=\" width=\"16\" height=\"16\"></a>";
    return html;
}

function getAddDateButtonHtml(){
    var html = "<a href=\"#\" onclick=\"addDate()\"><img src=\"data:image/gif;base64," +
		"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\" width=\"32\" height=\"32\"></a>";
		
		return html;
}

function getDeleteDateButtonHtml(){
    var html = "<a href=\"#\" onclick=\"deleteDate()\"><img src=\"data:image/gif;base64," +
		"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" +
		"AVACoC6ivwcA88L0kd9TRb4AAAAASUVORK5CYII=\" width=\"32\" height=\"32\"></a>";
		
		return html;
}

function getClearDateButtonHtml(){
    var html = "<a href=\"#\" onclick=\"initialDates()\"><img src=\"data:image/gif;base64," +
		"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" +
		"Kgf13QBUkPcC5/7pPAAAAABJRU5ErkJggg==\" width=\"32\" height=\"32\"></a>";
		
		return html;
}

function setHtmlToAttribute (id, html){
	document.getElementById(id).innerHTML=html;
}
