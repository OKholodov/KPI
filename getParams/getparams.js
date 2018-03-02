var KPIScriptId; 
var attachIntervalId;

var startDateComponent;
var endDateComponent;
var orderStatusTableComponent;
var orderStatusGraphComponent;

function pageInit() {
	console.log("pageInit start");
	
	//var valuesJson = document.getElementById('KPIButtonContent').innerText;
	var visual = "";

	//checkScriptId();
	setHtmlToInfoElement("");
	buttonRedraw();
	drawElements();
	
	
	/*
	attachIntervalId = setInterval(function() {
		checkScriptId();
		buttonRedraw();		
	}, 5000);
	*/

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
						//setHtmlToAttribute(getButtonHtml()+" Communication with server failed");
						//console.log("jsonResult.exeption="+jsonResult.exeption);
						setHtmlToInfoElement("Communication with server failed");
					}
					else {
						var sdFieldModel = jsonResult.model;
						
						console.log("stringify sdFieldModel="+JSON.stringify(sdFieldModel));
						
						if (startDateComponent) {
							startDateComponent.destroy();
						}
						else {
							startDateComponent = uxNg2.createComponent("#DivStartDate", "UxDateFieldComponent", sdFieldModel);
							//console.log("startDateComponent= " + startDateComponent);
						}
						
					}
				}
				else {
					//setHtmlToAttribute(getButtonHtml()+" Communication with server failed.");
					setHtmlToInfoElement("Communication with server failed");
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
						//setHtmlToAttribute(getButtonHtml()+" Communication with server failed");
						//console.log("jsonResult.exeption="+jsonResult.exeption);
						setHtmlToInfoElement("Communication with server failed");
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
					//setHtmlToAttribute(getButtonHtml()+" Communication with server failed.");
					setHtmlToInfoElement("Communication with server failed");
				}
				
			}
	}
	);
	
	//Draw table
	//drawTable();
	
	attachIntervalId = setInterval(function() {
		//checkScriptId();
		drawDependentElements();
	}, 1000);


};

function drawDependentElements() {
	if(startDateComponent && endDateComponent) {
		drawTable();
		drawGraph();
		clearInterval(attachIntervalId);
	}
}

function drawTable() {
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
						//console.log("exeption=" + jsonResult.exeption);
						//setHtmlToInfoElement("Communication with server failed");
						setHtmlToInfoElement("Communication with server failed");
					}
					else {
						tableModel = jsonResult.model;
						
						//console.log("stringify ModelOrderStatus= " + JSON.stringify(ModelOrderStatus));

						var header = tableModel.model.header;
						var body = tableModel.model.body;

						newModel.model.header = header;
						newModel.model.body = body;
						
						console.log("stringify newModel="+JSON.stringify(newModel));
						
						
						if (orderStatusTableComponent) {
							orderStatusTableComponent.destroy();
						}
						orderStatusTableComponent = uxNg2.createComponent("#DivOrdersStatusTable", "UxTableComponent", newModel);
						//orderStatusTableComponent.update();
					}
				}
				else {
					//setHtmlToAttribute(getButtonHtml()+" Communication with server failed");
					setHtmlToInfoElement("Communication with server failed");
				}
				console.log("callback drawTable end");
				buttonRedraw();
			}
	});
}

function drawGraph() {
	var startDate = toFormattedDate(startDateComponent.component.value);
	var endDate = toFormattedDate(endDateComponent.component.value);
	console.log("Start date = " + startDate);
	console.log("End date = " + endDate);
	
	var graphModel = {
           model: {
               "chart": {
										"type": "spline",
										"reflow": true,
										"className": "ux-graph",
										"events": {
											"load": function () {
												
												console.log("Graf loaded 1!");
												console.log("test = " + Object.keys(this.series));
												this.model = this.series.slice();
												console.log("Graf loaded 2!");
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
                   "text": "Orders by statuses"
               },
               "credits": {
                   "enabled": false
               },
							 "xAxis": {
									"type": "datetime",
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
															"lineWidth": 4
													}
											},
											"marker": {
													"enabled": false
											},
											"pointInterval": 1,
											"pointIntervalUnit" : "day",
											"pointStart": Date.UTC(2018, 1, 1)
									}
							},
               "series": [
									{
										"name": "Suspended",
										"data": [0.2, 0.8, 0.8, 0.8, 1, 1.3, 1.5, 2.9, 1.9, 2.6, 1.6, 3, 4, 3.6, 4.5, 4.2, 4.5, 4.5, 4, 3.1, 2.7, 4, 2.7, 2.3, 2.3, 4.1, 7.7, 7.1, 5.6, 6.1, 5.8, 8.6, 7.2, 9, 10.9, 11.5, 11.6, 11.1, 12, 12.3, 10.7, 9.4, 9.8, 9.6, 9.8, 9.5, 8.5, 7.4, 7.6]
									}, {
										"name": "Cancelled",
										"data": [0, 0, 0.6, 0.9, 2.8, 0.2, 0, 0, 0, 0.1, 0.6, 0.7, 0.8, 0.6, 5.2, 0, 1.1, 0.3, 0.3, 0, 4.1, 0, 0, 0, 0.2, 2.1, 0, 0.3, 0, 0.1, 0.2, 0.1, 0.3, 0.3, 0, 3.1, 3.1, 2.5, 1.5, 1.9, 2.1, 1, 2.3, 1.9, 1.2, 0.7, 1.3, 0.4, 0.3]
									},
									{
										"name": "Completed",
										"data": [0, 0, 0.6, 1.9, 0.8, 0.2, 5, 0, 0, 6.1, 0.6, 0.7, 0.8, 0.6, 0.2, 0, 2.1, 0.3, 0.3, 3, 0.1, 0, 0, 0, 0.2, 3.1, 0, 0.3, 0, 0.1, 0.2, 0.1, 0.3, 0.3, 0, 3.1, 3.1, 2.5, 1.5, 1.9, 2.1, 1, 2.3, 1.9, 1.2, 0.7, 1.3, 0.4, 0.3]
									},
									{
										"name": "Superseded",
										"data": [0, 0, 1.6, 0.9, 0.8, 1.2, 0, 0, 0, 0.1, 3.6, 0.7, 0.8, 0.6, 0.2, 0, 0.1, 0.3, 0.3, 4, 0.1, 0, 0, 0, 0.2, 0.1, 0, 5.3, 0, 0.1, 6.2, 0.1, 5.3, 5.3, 0, 3.1, 3.1, 2.5, 1.5, 1.9, 2.1, 1, 2.3, 1.9, 1.2, 1.7, 1.3, 0.4, 0.3]
									}
							 ]/*
							 ,
               "navigation": {
									"menuItemStyle": {
											"fontSize": "10px"
									}
							}*/
           }
        };
				
				console.log("draw graph = " + graphModel);

 orderStatusGraphComponent = uxNg2.createComponent("#DivOrdersStatusGraph", "UxGraphComponent", graphModel);

console.log("elRef = " + Object.keys(orderStatusGraphComponent.component.elRef));
console.log("zone = " + Object.keys(orderStatusGraphComponent.component.zone));
console.log("viewInited = " + Object.keys(orderStatusGraphComponent.component.viewInited));
console.log("_model = " + Object.keys(orderStatusGraphComponent.component._model));
console.log("el = " + Object.keys(orderStatusGraphComponent.component.el));
console.log("model = " + Object.keys(orderStatusGraphComponent.component.model));
console.log("ngAfterViewInit = " + Object.keys(orderStatusGraphComponent.component.ngAfterViewInit));
console.log("updateGraph = " + Object.keys(orderStatusGraphComponent.component.updateGraph));


/* <![CDATA[ */
var chart_9150029797813261081; 
jQuery(function () { jQuery(document).ready(function() {		try {
			//dashboardTiming.noteWidgetParam('9150029797813261081','startJsRender');
			//dashboardTiming.noteWidgetParam('9150029797813261081','status','success');
			window['chart_9150029797813261081'] = new Highcharts.Chart({credits: {
	enabled: false
},
"yAxis":{"min":"0","title":{"text":"","style":{"backgroundColor":"#FFFFFF"}}},"xAxis":{"title":{"text":""},"nonLocalizedCategories":["01.02.2018","01.02.2018","02.02.2018","02.02.2018","03.02.2018","03.02.2018","04.02.2018","04.02.2018","05.02.2018","05.02.2018","06.02.2018","06.02.2018","07.02.2018","07.02.2018","08.02.2018","08.02.2018","09.02.2018","09.02.2018","10.02.2018","10.02.2018"],"labels":{"tick":{"culling":{"max":null}}},"categories":["01.02.2018","01.02.2018","02.02.2018","02.02.2018","03.02.2018","03.02.2018","04.02.2018","04.02.2018","05.02.2018","05.02.2018","06.02.2018","06.02.2018","07.02.2018","07.02.2018","08.02.2018","08.02.2018","09.02.2018","09.02.2018","10.02.2018","10.02.2018"],"categoriesExtended":[[[{"localizedName":"01.02.2018","localizedLevelName":"","name":"01.02.2018","levelName":"[Measures]"}]],[[{"localizedName":"01.02.2018","localizedLevelName":"","name":"01.02.2018","levelName":"[Measures]"}]],[[{"localizedName":"02.02.2018","localizedLevelName":"","name":"02.02.2018","levelName":"[Measures]"}]],[[{"localizedName":"02.02.2018","localizedLevelName":"","name":"02.02.2018","levelName":"[Measures]"}]],[[{"localizedName":"03.02.2018","localizedLevelName":"","name":"03.02.2018","levelName":"[Measures]"}]],[[{"localizedName":"03.02.2018","localizedLevelName":"","name":"03.02.2018","levelName":"[Measures]"}]],[[{"localizedName":"04.02.2018","localizedLevelName":"","name":"04.02.2018","levelName":"[Measures]"}]],[[{"localizedName":"04.02.2018","localizedLevelName":"","name":"04.02.2018","levelName":"[Measures]"}]],[[{"localizedName":"05.02.2018","localizedLevelName":"","name":"05.02.2018","levelName":"[Measures]"}]],[[{"localizedName":"05.02.2018","localizedLevelName":"","name":"05.02.2018","levelName":"[Measures]"}]],[[{"localizedName":"06.02.2018","localizedLevelName":"","name":"06.02.2018","levelName":"[Measures]"}]],[[{"localizedName":"06.02.2018","localizedLevelName":"","name":"06.02.2018","levelName":"[Measures]"}]],[[{"localizedName":"07.02.2018","localizedLevelName":"","name":"07.02.2018","levelName":"[Measures]"}]],[[{"localizedName":"07.02.2018","localizedLevelName":"","name":"07.02.2018","levelName":"[Measures]"}]],[[{"localizedName":"08.02.2018","localizedLevelName":"","name":"08.02.2018","levelName":"[Measures]"}]],[[{"localizedName":"08.02.2018","localizedLevelName":"","name":"08.02.2018","levelName":"[Measures]"}]],[[{"localizedName":"09.02.2018","localizedLevelName":"","name":"09.02.2018","levelName":"[Measures]"}]],[[{"localizedName":"09.02.2018","localizedLevelName":"","name":"09.02.2018","levelName":"[Measures]"}]],[[{"localizedName":"10.02.2018","localizedLevelName":"","name":"10.02.2018","levelName":"[Measures]"}]],[[{"localizedName":"10.02.2018","localizedLevelName":"","name":"10.02.2018","levelName":"[Measures]"}]]]},"chart":{"renderTo":"9150029797813261081","events":{"afterPrint":function () {jQuery(this.container).removeClass('CommonWidget-print-chart');this.setSize(this._oldWidth, this.chartHeight, false);},"beforePrint":function () {this._oldWidth = this.chartWidth;jQuery(this.container).addClass('CommonWidget-print-chart');this.setSize(jQuery(this.container).width(), this.chartHeight, false);},"load":function(event) {dashboardTiming.noteWidgetParam('9150029797813261081','endJsRender');if(LoadingHook){LoadingHook.suspend()};}},"type":"line"},"legend":{"enabled":true,"layout":"horizontal","align":"center","verticalAlign":"bottom"},"LevelVisualization":null,"title":{"text":""},"plotOptions":{"series":{"dataLabels":{"enabled":true},"showInLegend":true}},"dimensions":[{"localizedName":"","name":""}],"series":[{"dataName":[[{"localizedName":"Suspended","localizedLevelName":"[Measures]","name":"Suspended","levelName":"[Measures]"}]],"data":[{"y":1},{"y":102},{"y":1},{"y":102},{"y":1},{"y":102},{"y":1},{"y":102},{"y":102},{"y":1},{"y":102},{"y":1},{"y":102},{"y":1},{"y":102},{"y":1},{"y":1},{"y":102},{"y":1},{"y":102}],"name":"Suspended","color":"yellow","nonLocalizedName":"Suspended"},{"dataName":[[{"localizedName":"Cancelled","localizedLevelName":"[Measures]","name":"Cancelled","levelName":"[Measures]"}]],"data":[{"y":6},{"y":29},{"y":6},{"y":29},{"y":6},{"y":29},{"y":6},{"y":29},{"y":29},{"y":6},{"y":29},{"y":6},{"y":29},{"y":6},{"y":29},{"y":6},{"y":6},{"y":29},{"y":6},{"y":29}],"name":"Cancelled","color":"dodgerblue","nonLocalizedName":"Cancelled"},{"dataName":[[{"localizedName":"Completed","localizedLevelName":"[Measures]","name":"Completed","levelName":"[Measures]"}]],"data":[{"y":33},{"y":47},{"y":33},{"y":47},{"y":33},{"y":47},{"y":33},{"y":47},{"y":47},{"y":33},{"y":47},{"y":33},{"y":47},{"y":33},{"y":47},{"y":33},{"y":33},{"y":47},{"y":33},{"y":47}],"name":"Completed","color":"salmon","nonLocalizedName":"Completed"},{"dataName":[[{"localizedName":"Superseded","localizedLevelName":"[Measures]","name":"Superseded","levelName":"[Measures]"}]],"data":[{"y":9},{"y":41},{"y":9},{"y":41},{"y":9},{"y":41},{"y":9},{"y":41},{"y":41},{"y":9},{"y":41},{"y":9},{"y":41},{"y":9},{"y":41},{"y":9},{"y":9},{"y":41},{"y":9},{"y":41}],"name":"Superseded","color":"violet","nonLocalizedName":"Superseded"},{"dataName":[[{"localizedName":"Processing","localizedLevelName":"[Measures]","name":"Processing","levelName":"[Measures]"}]],"data":[{"y":57},{"y":90},{"y":57},{"y":90},{"y":57},{"y":90},{"y":57},{"y":90},{"y":90},{"y":57},{"y":90},{"y":57},{"y":90},{"y":57},{"y":90},{"y":57},{"y":57},{"y":90},{"y":57},{"y":90}],"name":"Processing","color":"chocolate","nonLocalizedName":"Processing"}]			});
		} catch(e) {
			//dashboardTiming.noteWidgetParam('9150029797813261081','status','js error');
			if(window.console && window.console.log) console.log('Error due HighCharts rendering of widgetID=9150029797813261081 : '+e.message, e);
		}
})});/* ]]> */

//console.log("getWidth = " + orderStatusGraphComponent.component.el.getWidth());

/*

elRef = nativeElement

zone = hasPendingMicrotasks,hasPendingMacrotasks,isStable,onUnstable,onMicrotaskEmpty,onStable,onError,_nesting,_inner,_outer,run,runGuarded,runOutsideAngular

viewInited = 

_model = chart,title,credits,xAxis,yAxis,plotOptions,series,navigation

el = title,lang,translate,dir,dataset,hidden,tabIndex,accessKey,draggable,spellcheck,contentEditable,isContentEditable,offsetParent,offsetTop,offsetLeft,offsetWidth,offsetHeight,style,innerText,outerText,onabort,onblur,oncancel,oncanplay,oncanplaythrough,onchange,onclick,onclose,oncontextmenu,oncuechange,ondblclick,ondrag,ondragend,ondragenter,ondragleave,ondragover,ondragstart,ondrop,ondurationchange,onemptied,onended,onerror,onfocus,oninput,oninvalid,onkeydown,onkeypress,onkeyup,onload,onloadeddata,onloadedmetadata,onloadstart,onmousedown,onmouseenter,onmouseleave,onmousemove,onmouseout,onmouseover,onmouseup,onmousewheel,onpause,onplay,onplaying,onprogress,onratechange,onreset,onresize,onscroll,onseeked,onseeking,onselect,onstalled,onsubmit,onsuspend,ontimeupdate,ontoggle,onvolumechange,onwaiting,onwheel,onauxclick,ongotpointercapture,onlostpointercapture,onpointerdown,onpointermove,onpointerup,onpointercancel,onpointerover,onpointerout,onpointerenter,onpointerleave,nonce,click,focus,blur,visible,toggle,hide,show,remove,update,replace,inspect,recursivelyCollect,ancestors,descendants,firstDescendant,immediateDescendants,previousSiblings,nextSiblings,siblings,match,up,down,previous,next,getElementsBySelector,getElementsByClassName,readAttribute,getHeight,getWidth,classNames,hasClassName,addClassName,removeClassName,toggleClassName,observe,stopObserving,cleanWhitespace,empty,descendantOf,scrollTo,getStyle,getOpacity,setStyle,setOpacity,getDimensions,makePositioned,undoPositioned,makeClipping,undoClipping,childOf,childElements,Simulated,ByTag,namespaceURI,prefix,localName,tagName,id,className,classList,slot,attributes,shadowRoot,assignedSlot,innerHTML,outerHTML,scrollTop,scrollLeft,scrollWidth,scrollHeight,clientTop,clientLeft,clientWidth,clientHeight,onbeforecopy,onbeforecut,onbeforepaste,oncopy,oncut,onpaste,onsearch,onselectstart,previousElementSibling,nextElementSibling,children,firstElementChild,lastElementChild,childElementCount,onwebkitfullscreenchange,onwebkitfullscreenerror,setPointerCapture,releasePointerCapture,hasPointerCapture,hasAttributes,getAttributeNames,getAttribute,getAttributeNS,setAttribute,setAttributeNS,removeAttribute,removeAttributeNS,hasAttribute,hasAttributeNS,getAttributeNode,getAttributeNodeNS,setAttributeNode,setAttributeNodeNS,removeAttributeNode,closest,matches,webkitMatchesSelector,attachShadow,getElementsByTagName,getElementsByTagNameNS,insertAdjacentElement,insertAdjacentText,insertAdjacentHTML,requestPointerLock,getClientRects,getBoundingClientRect,scrollIntoView,scrollIntoViewIfNeeded,animate,before,after,replaceWith,prepend,append,querySelector,querySelectorAll,webkitRequestFullScreen,webkitRequestFullscreen,scroll,scrollBy,createShadowRoot,getDestinationInsertionPoints,ELEMENT_NODE,ATTRIBUTE_NODE,TEXT_NODE,CDATA_SECTION_NODE,ENTITY_REFERENCE_NODE,ENTITY_NODE,PROCESSING_INSTRUCTION_NODE,COMMENT_NODE,DOCUMENT_NODE,DOCUMENT_TYPE_NODE,DOCUMENT_FRAGMENT_NODE,NOTATION_NODE,DOCUMENT_POSITION_DISCONNECTED,DOCUMENT_POSITION_PRECEDING,DOCUMENT_POSITION_FOLLOWING,DOCUMENT_POSITION_CONTAINS,DOCUMENT_POSITION_CONTAINED_BY,DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC,nodeType,nodeName,baseURI,isConnected,ownerDocument,parentNode,parentElement,childNodes,firstChild,lastChild,previousSibling,nextSibling,nodeValue,textContent,hasChildNodes,getRootNode,normalize,cloneNode,isEqualNode,isSameNode,compareDocumentPosition,contains,lookupPrefix,lookupNamespaceURI,isDefaultNamespace,insertBefore,appendChild,replaceChild,removeChild,addEventListener,removeEventListener,dispatchEvent,__zone_symbol__addEventListener,__zone_symbol__removeEventListener,__zone_symbol__eventListeners,__zone_symbol__removeAllListeners,eventListeners,removeAllListeners

offsetWidth
scrollWidth
clientWidth
getWidth

model = chart,title,credits,xAxis,yAxis,plotOptions,series,navigation

ngAfterViewInit = bindAsEventListener

updateGraph = bindAsEventListener

*/

//elRef,zone,viewInited,_model,el,model,ngAfterViewInit,updateGraph

//orderStatusGraphComponent.setSize(1000, 1000, doAnimation = true);

	/*
	new Ajax.RemoteCallJSON ('/solutions/titalia/sparkle/kpi/getparams.jsp',
	{
			method:'getGraphModel',
			parameters: {
					SD: startDate.toJSON(),
					ED: endDate.toJSON()
			},
			onSuccess: function(json) {
				console.log("Callback drawGraph start!");
				
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
						//console.log("exeption=" + jsonResult.exeption);
						//setHtmlToInfoElement("Communication with server failed");
						setHtmlToInfoElement("Communication with server failed");
					}
					else {
						tableModel = jsonResult.model;
						
						//console.log("stringify ModelOrderStatus= " + JSON.stringify(ModelOrderStatus));

						var header = tableModel.model.header;
						var body = tableModel.model.body;

						newModel.model.header = header;
						newModel.model.body = body;
						
						console.log("stringify newModel="+JSON.stringify(newModel));
						
						
						if (orderStatusTableComponent) {
							orderStatusTableComponent.destroy();
						}
						orderStatusTableComponent = uxNg2.createComponent("#DivOrdersStatusGraph", "UxGraphComponent", newModel);
						//orderStatusTableComponent.update();
					}
				}
				else {
					//setHtmlToAttribute(getButtonHtml()+" Communication with server failed");
					setHtmlToInfoElement("Communication with server failed");
				}
				console.log("callback drawGraph end");
				buttonRedraw();
			}
	});
	
	*/
}

function clickButton (){
	console.log("clickButton start");
	setHtmlToInfoElement("");
	clearInterval(attachIntervalId);
	
	setHtmlToAttribute(getLoadingButtonHtml());
	drawTable();
	
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
			//setHtmlToAttribute(getButtonHtml()+" Communication with server failed");
			setHtmlToInfoElement("Communication with server failed");
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
		//setHtmlToAttribute(getButtonHtml()+" Communication with server failed");
		setHtmlToInfoElement("Communication with server failed");
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
	document.getElementById('UpdateButton').innerHTML=html;
}
function setHtmlToInfoElement (html){
	document.getElementById('KPIInfoContent').innerHTML=html;
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