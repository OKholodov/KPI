select it.data || ',' || val.data as data
from (
  select '"items": [' || listagg('{"label": "' || o.value || '", "value": {"code": "' || o.value || '"}}',',') within group (order by o.show_order, o.list_value_id) || ']' as data
  from nc_list_values o
  where attr_type_def_id = 4063055154013004345
)it,
(
  select '"value": [' || listagg('{"label": "' || o1.value || '", "value": {"code": "' || o1.value || '"}}',',') within group (order by o1.show_order, o1.list_value_id) || ']' as data
  from nc_list_values o1
  where attr_type_def_id = 4063055154013004345
  and exists (
    select 1
    from kpi_orders kp
    where kp.status = o1.value
  )
)val