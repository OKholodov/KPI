select substr (str, 1, length(str) - length(',{"styleClass": "_header","value": "Delta","filter": false,"sort": "asc"}') ) || ']}' as data
from (
  select q'<{"unclickable": true,"styleClass": "_header","columns": [>' ||
  listagg(q'<{"styleClass": "_header","value": ">' || column_value || q'<","filter": false,"sort": true },{"styleClass": "_header","value": "Delta","filter": false,"sort": true }>'
  ,',') within group (order by to_date(column_value, 'DD.MM.YYYY') desc)  as str
  from table(PKG_TIS_KPI.SPLIT_STR_TO_ARRAYOFSTRINGS(?,1))t
)