/*
select  '{"name": "Suspended", "data": [' || listagg(Suspended, ', ') WITHIN GROUP (order by ed) || ']}' as Suspended,
        '{"name": "Cancelled", "data": [' || listagg(Cancelled, ', ') WITHIN GROUP (order by ed) || ']}' as Cancelled,
        '{"name": "Completed", "data": [' || listagg(Completed, ', ') WITHIN GROUP (order by ed) || ']}' as Completed,
        '{"name": "Superseded", "data": [' || listagg(Superseded, ', ') WITHIN GROUP (order by ed) || ']}' as Superseded,
        '{"name": "Processing", "data": [' || listagg(Processing, ', ') WITHIN GROUP (order by ed) || ']}' as Processing,
        '{"name": "Archived", "data": [' || listagg(Archived, ', ') WITHIN GROUP (order by ed) || ']}' as Archived,
        '{"name": "Entering", "data": [' || listagg(Entering, ', ') WITHIN GROUP (order by ed) || ']}' as Entering,
        '{"name": "Suspending", "data": [' || listagg(Suspending, ', ') WITHIN GROUP (order by ed) || ']}' as Suspending,
        '{"name": "Total", "data": [' || listagg(Total, ', ') WITHIN GROUP (order by ed) || ']}' as Total
*/
select  '{"name": "Suspended", "data": [' || listagg(Suspended, ', ') WITHIN GROUP (order by ed) || ']},
{"name": "Cancelled", "data": [' || listagg(Cancelled, ', ') WITHIN GROUP (order by ed) || ']},
{"name": "Completed", "data": [' || listagg(Completed, ', ') WITHIN GROUP (order by ed) || ']},
{"name": "Superseded", "data": [' || listagg(Superseded, ', ') WITHIN GROUP (order by ed) || ']},
{"name": "Processing", "data": [' || listagg(Processing, ', ') WITHIN GROUP (order by ed) || ']},
{"name": "Archived", "data": [' || listagg(Archived, ', ') WITHIN GROUP (order by ed) || ']},
{"name": "Entering", "data": [' || listagg(Entering, ', ') WITHIN GROUP (order by ed) || ']},
{"name": "Suspending", "data": [' || listagg(Suspending, ', ') WITHIN GROUP (order by ed) || ']},
{"name": "Total", "data": [' || listagg(Total, ', ') WITHIN GROUP (order by ed) || ']}' as data
from (
  select 
      to_date(execution_date) ed,
      sum(decode(status, 'Suspended',   order_sum, 0)) Suspended,
      sum(decode(status, 'Cancelled',   order_sum, 0)) Cancelled,
      sum(decode(status, 'Completed',   order_sum, 0)) Completed,
      sum(decode(status, 'Superseded',  order_sum, 0)) Superseded,
      sum(decode(status, 'Processing',  order_sum, 0)) Processing,
      sum(decode(status, 'Archived',    order_sum, 0)) Archived,
      sum(decode(status, 'Entering',    order_sum, 0)) Entering,
      sum(decode(status, 'Suspending',  order_sum, 0)) Suspending,
      sum(order_sum) Total
  from kpi_orders
	where execution_date between to_date(?, 'DD.MM.YYYY') and to_date(?, 'DD.MM.YYYY')
	and cfs_category in (select /*+ cardinality(t,10) */ column_value from table(PKG_TIS_KPI.SPLIT_STR_TO_ARRAYOFSTRINGS(?))t)
	and business_scenario in (select /*+ cardinality(t,10) */ column_value from table(PKG_TIS_KPI.SPLIT_STR_TO_ARRAYOFSTRINGS(?))t)
	and status in (select /*+ cardinality(t,10) */ column_value from table(PKG_TIS_KPI.SPLIT_STR_TO_ARRAYOFSTRINGS(?))t)
	and age_class in (select /*+ cardinality(t,10) */ column_value from table(PKG_TIS_KPI.SPLIT_STR_TO_ARRAYOFSTRINGS(?))t)
  group by to_date(execution_date)
  --order by to_date(execution_date)
)
order by ed