select '
"value": "' || to_char(sysdate,'DD.MM.YYYY') || '",
"attachToBody": false,
"dateFormat": "DD.MM.YYYY"
' as data 
from dual