var KPIScriptId; 
var attachIntervalId;

var startDateComponent;
var endDateComponent;
var orderStatusTableComponent;

function pageInit() {
	console.log("pageInit start");
	
	//var valuesJson = document.getElementById('KPIButtonContent').innerText;
	var visual = "";

	checkScriptId();
	buttonRedraw();
	
	drawElements();
	
	/*
	attachIntervalId = setInterval(function() {
		checkScriptId();
		buttonRedraw();		
	}, 5000);
	*/
	
	//checkRefreshObjects();
	console.log("pageInit end");
}



function checkScriptId() {
	var uid = getCookie('KPIScriptId');
	if(uid) {
		if(KPIScriptId) {
			if(KPIScriptId != uid) {
				KPIScriptId = uid;
			}
		} else {
			KPIScriptId = uid;
		}
	} else {
		KPIScriptId = guid();
		document.cookie = "KPIScriptId="+KPIScriptId+"; path=/";
	}
}

function buttonRedraw() {
	var visual = "";
	visual += getButtonHtml();
	setHtmlToAttribute(visual);
}

function parseLink(value) {
	var link = value.link;
	var name = value.name;
	var description = value.description;
	var expiredDate = value.expiredDate;
	var createdDate = value.createdDate;
	
	var res = "<a href=\"" + link + "\" target=\"_blank\"><div class=\"tooltip\">"+name+"<span class=\"tooltiptext\"><table>";
	res += "<tr><td>Description:&nbsp;</td><td>" + (description ? description : "") + "</td></tr>";
	res += "<tr><td>Created on:&nbsp;</td><td>" + (createdDate ? toReadable(new Date(createdDate)) : "") + "</td></tr>";
	res += "<tr><td>Expiration:&nbsp;</td><td>" + (expiredDate ? toReadable(new Date(expiredDate)) : "") + "</td></tr>";
	res += "</table></span></div></a>";
	return res;
}

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

function checkRefreshObjects()
{
console.log("checkRefreshObjects start");

var startDateComponent = DivStartDate.component.value;
var endDateComponent = DivEndDate.component.value;

//var startDate = startDateComponent.getDate().toString().replace(/^([0-9])$/, '0$1') + '.' + (startDateComponent.getMonth() + 1).toString().replace(/^([0-9])$/, '0$1') + '.' + startDateComponent.getFullYear();
//var endDate = endDateComponent.getDate().toString().replace(/^([0-9])$/, '0$1') + '.' + (endDateComponent.getMonth() + 1).toString().replace(/^([0-9])$/, '0$1') + '.' + endDateComponent.getFullYear();

var startDate = toFormattedDate(startDateComponent);
var endDate = toFormattedDate(endDateComponent);

console.log("Start date = " + startDate);
console.log("End date = " + endDate);

var check_refresh_object_ids = new Array();
var check_refresh_attr_ids = new Array();
var check_refresh_children_type_ids = new Array();

	check_refresh_object_ids[check_refresh_object_ids.length] = "9148769416513465926";
	check_refresh_attr_ids[check_refresh_attr_ids.length] = "61";
	check_refresh_children_type_ids[check_refresh_children_type_ids.length] = "7121158695013985788";

/*
var check_refresh_object_ids;
var check_refresh_attr_ids;
var check_refresh_children_type_ids;

	check_refresh_object_ids = '9148769416513465926';
	check_refresh_attr_ids = '61';
	check_refresh_children_type_ids = '7121158695013985788';
*/
	console.log("check_refresh_object_ids.toJSON()="+check_refresh_object_ids.toJSON());
	console.log("check_refresh_attr_ids.toJSON()="+check_refresh_attr_ids.toJSON());
	console.log("check_refresh_children_type_ids.toJSON()="+check_refresh_children_type_ids.toJSON());
	
    //if (!isRefreshStoped) {
        //new Ajax.RemoteCallJSON('/solutions/titalia/sparkle/kpi/getparams.jsp?requesttype=polling',
				new /*window.*/Ajax.RemoteCallJSON /*simpleAjaxCallJSON*/('/solutions/titalia/sparkle/kpi/getparams.jsp',
        {
            method:'getTableModel',
            parameters: {
                objects: check_refresh_object_ids.toJSON(),
                attrs: check_refresh_attr_ids.toJSON(),
                childrenTypes: check_refresh_children_type_ids.toJSON(),
								SD: startDate.toJSON(),
								ED: endDate.toJSON()
            },
						/*onError: callbackError,
						onFailure: callbackFailure,*/
						onResult: customFunc,
						onSuccess: callbackSuccess
        });
    //}
		console.log("checkRefreshObjects end");
}

function callbackError(json) {
	console.log("callbackError!");
}
function callbackFailure(json) {
	console.log("callbackFailure!");
	console.log(json);
	console.log("callbackFailure after");
}

function customFunc(json) {
	console.log("customFunc!");
	console.log(json);
}
function callbackSuccess(json) {
	console.log("callbackSuccess!");
	
	var result = json.response;
	var jsonVal;
	var jsonResult;
	var tableModel;
	var newTableModel;
	
	var ModelOrderStatus1;
	
	var model = {
		model: {
			header:{},
			body:{}
		}
	};
	
	if (result) {
		jsonVal = JSON.parse(result);
		jsonResult = jsonVal.result;
		//console.log("jsonVal = " + jsonVal);
		//console.log("stringify = " + JSON.stringify(jsonVal));
		//console.log("jsonResult = " + jsonResult);
		
		tableModel = jsonResult.model;
		console.log("jsonResult = " + tableModel);
		//console.log("tableModel.keys = " + Object.keys(tableModel));
		//console.log("ModelOrderStatus.keys = " + Object.keys(ModelOrderStatus));
		
		//console.log("tableModel.model.keys = " + Object.keys(tableModel.model));
		//console.log("ModelOrderStatus.model.keys = " + Object.keys(ModelOrderStatus.model));
		
		//console.log("stringify tableModel= " + JSON.stringify(tableModel));
		console.log("stringify ModelOrderStatus= " + JSON.stringify(ModelOrderStatus));
		
		//console.log("isArray tableModel" + Array.isArray(tableModel));
		//console.log("isArray ModelOrderStatus" + Array.isArray(ModelOrderStatus));
		

		var header = tableModel.model.header;
		//console.log("stringify header="+JSON.stringify(header));
		var body = tableModel.model.body;
		//console.log("stringify body="+JSON.stringify(body));
		
		model.model.header = header;
		model.model.body = body;
		
		console.log("stringify model="+JSON.stringify(model));
		//newTableModel = header.concat(body);
		
		//newTableModel = $.extend( true, header, body );
		//var NewObject = $.extend({},body , header);
		/*
		$.extend(body,header);
		console.log("333");
		
		console.log("stringify body= " + JSON.stringify(body));
		console.log("stringify header= " + JSON.stringify(header));
		*/
		//console.log("new model=" + NewObject);
		//console.log("stringify new tableModel= " + JSON.stringify(NewObject));
		/*
		console.log("typeof = " + typeof tableModel);
		
		console.log("typeof = " + typeof ModelOrderStatus);
		*/
/*
		console.log("instanceof = " + tableModel instanceof JSON); 
		console.log("constructor.name = " + tableModel.constructor.name);   
		console.log("name = " + tableModel.name);               

		*/
		/*
		ModelOrderStatus1 = tableModel;
		
		console.log("1");
		
		//var tmp = JSON.parse(tableModel);
		
		console.log("2");
		
		//console.log("tmp = " + tmp);
		*/
		
		//component.component.model = model;
		//component.update();
		//var component1 = uxNg2.createComponent("#DivTestTable", "UxTableComponent", model);
		
		component.destroy();
		component = uxNg2.createComponent("#OrderStatus", "UxTableComponent", model);
		
		/*
		var keys = Object.keys(component1);
		var keysComp = Object.keys(component1.component.getCurrentTableData());
		
		//component1.component.model = ModelOrderStatus1;
		
		console.log("component1 = " + keys);
		console.log("component2 = " + keysComp);
		
		//component1.destroy();
		
		component1.update();
*/
		
		
		
		//component.component.model = tableModel;
		//component.component.update();
		
	}
	console.log("callbackSuccess after");
}

function drawElements() {

	console.log("drawElements start");

	// Draw start date field
	new Ajax.RemoteCallJSON ('/solutions/titalia/sparkle/kpi/getparams.jsp',
	{
			method:'getDateFieldModel',
			parameters: {
					DATE: "SD"
			},
			onSuccess: function(json) {
				console.log("drawElements StartDate onSuccess!");
				var jsonResponse = json.response;

				if (jsonResponse) {
					var jsonParse = JSON.parse(jsonResponse);
					var jsonResult = jsonParse.result;
					if (jsonResult.exeption) {
						setHtmlToAttribute(getButtonHtml()+" Communication with server failed");
						console.log("jsonResult.exeption="+jsonResult.exeption);
					}
					else {
						var sdFieldModel = jsonResult.model;
						
						console.log("stringify sdFieldModel="+JSON.stringify(sdFieldModel));
						
						if (startDateComponent) {
							startDateComponent.destroy();
						}
						else {
							startDateComponent = uxNg2.createComponent("#DivStartDate", "UxDateFieldComponent", sdFieldModel);
							console.log("startDateComponent= " + startDateComponent);
						}
						
					}
				}
				else {
					setHtmlToAttribute(getButtonHtml()+" Communication with server failed.");
				}
				
			}
	}
	);
	
	// Draw end date field
	new Ajax.RemoteCallJSON ('/solutions/titalia/sparkle/kpi/getparams.jsp',
	{
			method:'getDateFieldModel',
			parameters: {
					DATE: "ED"
			},
			onSuccess: function(json) {
				console.log("drawElements EndDate onSuccess!");
				var jsonResponse = json.response;

				if (jsonResponse) {
					var jsonParse = JSON.parse(jsonResponse);
					var jsonResult = jsonParse.result;
					if (jsonResult.exeption) {
						setHtmlToAttribute(getButtonHtml()+" Communication with server failed");
						console.log("jsonResult.exeption="+jsonResult.exeption);
					}
					else {
						var edFieldModel = jsonResult.model;
						
						console.log("stringify edFieldModel="+JSON.stringify(edFieldModel));
						
						if (endDateComponent) {
							endDateComponent.destroy();
						}
						else {
							endDateComponent = uxNg2.createComponent("#DivEndDate", "UxDateFieldComponent", edFieldModel);
						}
						
					}
				}
				else {
					setHtmlToAttribute(getButtonHtml()+" Communication with server failed.");
				}
				
			}
	}
	);
	
	//Draw table
	drawTable();


};

function drawTable() {
	//var startDateComponent = DivStartDate.component.value;
	//var endDateComponent = DivEndDate.component.value;
	console.log("startDateComponent= " + window.startDateComponent);
	
	var startDate = toFormattedDate(startDateComponent.component.value);
	var endDate = toFormattedDate(endDateComponent.component.value);
	console.log("Start date = " + startDate);
	console.log("End date = " + endDate);

	new Ajax.RemoteCallJSON ('/solutions/titalia/sparkle/kpi/getparams.jsp',
	{
			method:'getTableModel',
			parameters: {
					SD: startDate.toJSON(),
					ED: endDate.toJSON()
			},
			onSuccess: function(json) {
				console.log("Callback drawTable start!");
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
					console.log("jsonResponse=" + jsonResponse);
					jsonParse = JSON.parse(jsonResponse);
					jsonResult = jsonParse.result;
					
					if (jsonResult.exeption) {
						setHtmlToAttribute(getButtonHtml()+" Communication with server failed");
					}
					else {
						tableModel = jsonResult.model;
						
						//console.log("stringify ModelOrderStatus= " + JSON.stringify(ModelOrderStatus));

						var header = tableModel.model.header;
						var body = tableModel.model.body;

						newModel.model.header = header;
						newModel.model.body = body;
						
						//console.log("stringify newModel="+JSON.stringify(newModel));
						
						if (orderStatusTableComponent) {
							orderStatusTableComponent.destroy();
						}
						else {
							orderStatusTableComponent = uxNg2.createComponent("#OrderStatus", "UxTableComponent", newModel);
						}
					}
				}
				else {
					setHtmlToAttribute(getButtonHtml()+" Communication with server failed");
				}
				console.log("callback end");
			}
	});
}

function clickButton (){
	console.log("clickButton start");
	//clearInterval(attachIntervalId);
	
	setHtmlToAttribute(getLoadingButtonHtml());
	drawTable();
	
	/*

	var startDateComponent = DivStartDate.component.value;
	var endDateComponent = DivEndDate.component.value;

	var startDate = toFormattedDate(startDateComponent);
	var endDate = toFormattedDate(endDateComponent);

	console.log("Start date = " + startDate);
	console.log("End date = " + endDate);

	new Ajax.RemoteCallJSON ('/solutions/titalia/sparkle/kpi/getparams.jsp',
	{
			method:'getTableModel',
			parameters: {
					SD: startDate.toJSON(),
					ED: endDate.toJSON()
			},
			onSuccess: callbackReload
	});
	*/

	buttonRedraw();
	console.log("clickButton end");
}

function callbackReload(json) {
	console.log("callbackReload!");
	KPIScriptId = guid();
	document.cookie = "KPIScriptId="+KPIScriptId+"; path=/";
	callback(json);
}

function callback(json) {
	console.log("Callback start!");

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
		console.log("jsonResponse=" + jsonResponse);
		jsonParse = JSON.parse(jsonResponse);
		jsonResult = jsonParse.result;
		
		if (jsonResult.exeption) {
			setHtmlToAttribute(getButtonHtml()+" Communication with server failed");
		}
		else {
			tableModel = jsonResult.model;
			
			//console.log("stringify ModelOrderStatus= " + JSON.stringify(ModelOrderStatus));

			var header = tableModel.model.header;
			var body = tableModel.model.body;

			newModel.model.header = header;
			newModel.model.body = body;
			
			//console.log("stringify newModel="+JSON.stringify(newModel));
			
			component.destroy();
			component = uxNg2.createComponent("#OrderStatus", "UxTableComponent", newModel);
			
			buttonRedraw();
			/*
			attachIntervalId = setInterval(function() {
				checkScriptId();
				buttonRedraw();		
			}, 5000);
			*/
		}
		
	}
	else {
		setHtmlToAttribute(getButtonHtml()+" Communication with server failed");
	}
	console.log("callback end");
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

function setHtmlToAttribute (html){
	document.getElementById('attachTest').innerHTML=html;
}

function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

function guid() {
	  function s4() {
	    return Math.floor((1 + Math.random()) * 0x10000)
	      .toString(16)
	      .substring(1);
	  }
	  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
	    s4() + '-' + s4() + s4() + s4();
	}