select it.data || ',' || val.data as data
from (
  select '"items": [' || listagg('{"label": "' || o.name || '", "value": {"code": "' || o.name || '"}}',',') within group (order by o.object_id) || ']' as data
  from nc_objects o
  where object_id in (
    9148102152613370134,  /* IP Service CFS */
    9147499776613377322,  /* Data Service CFS */
    9148163188813443299,  /* Colocation Service CFS */
    9149546559813501876,  /* Carrier MPLS CFS */
    9149537436313495176,  /* Ethernet Site CFS */
    9149607815513458131,  /* IPVPN Site CFS */
    9149607223513534436,  /* VAS Service CFS */
    9149667916313487849,  /* Seabone Safe Service CFS */
    9149537436313495188   /* Full Outsourcing CFS */
  )
)it,
(
  select '"value": [' || listagg('{"label": "' || o1.name || '", "value": {"code": "' || o1.name || '"}}',',') within group (order by o1.object_id) || ']' as data
  from nc_objects o1
  where object_id in (
    9148102152613370134,  /* IP Service CFS */
    9147499776613377322,  /* Data Service CFS */
    9148163188813443299,  /* Colocation Service CFS */
    9149546559813501876,  /* Carrier MPLS CFS */
    9149537436313495176,  /* Ethernet Site CFS */
    9149607815513458131,  /* IPVPN Site CFS */
    9149607223513534436,  /* VAS Service CFS */
    9149667916313487849,  /* Seabone Safe Service CFS */
    9149537436313495188   /* Full Outsourcing CFS */
  )
  and exists (
    select 1
    from kpi_orders kp
    where kp.cfs_category = o1.name
  )
)val