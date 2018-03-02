select '"attachToBody": false,
"dateFormat": "DD.MM.YYYY",
"value": "' || to_char(sysdate,'DD.MM.YYYY') || '"
' as data 
from dual