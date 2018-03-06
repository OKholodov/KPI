select q'<
				 {
             "unclickable": true,
             "styleClass": "_header",
						 "columns": [
								 {
										 "styleClass": "_header",
										 "value": "Execution Date",
										 "filter": false,
                     "sort": "asc"
								 },
								 {
										 "styleClass": "_header",
										 "value": "Total Number with error",
                     "filter": false,
                     "sort": true
								 },
								 {
										 "styleClass": "_header",
										 "value": "Number Of Errors %",
										 "filter": false,
                     "sort": true
								 },
								 {
										 "styleClass": "_header",
										 "value": "Total Number  ",
										 "filter": false,
                     "sort": true
								 }
							]
				 }>' as data
from dual