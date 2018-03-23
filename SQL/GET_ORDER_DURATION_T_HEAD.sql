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
                     "value": "<5 Days",
                     "filter": false,
                     "sort": true
                 },
                 {
                     "styleClass": "_header",
                     "value": "<10 Days",
                     "filter": false,
                     "sort": true
                 },
                 {
                     "styleClass": "_header",
                     "value": "<20 Days",
                     "filter": false,
                     "sort": true
                 },
                 {
                     "styleClass": "_header",
                     "value": "<40 Days",
                     "filter": false,
                     "sort": true
                 },
                 {
                     "styleClass": "_header",
                     "value": "<60 Days",
                     "filter": false,
                     "sort": true
                 },
                 {
                     "styleClass": "_header",
                     "value": ">=60 Days",
                     "filter": false,
                     "sort": true
                 },
                 {
                     "styleClass": "_header",
                     "value": "Total",
                     "filter": false,
                     "sort": true
                 }
              ]
         }>' as data
from dual