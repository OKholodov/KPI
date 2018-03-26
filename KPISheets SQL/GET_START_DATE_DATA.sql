select '"attachToBody": false,
"dateFormat": "DD.MM.YYYY",
"value": "' || to_char(sysdate - interval '1' month,'DD.MM.YYYY') || '"
' as data 
from dual
