select '"attachToBody": false,
"dateFormat": "DD.MM.YYYY",
"value": "' || to_char(add_months(sysdate,-1),'DD.MM.YYYY') || '"
' as data 
from dual
