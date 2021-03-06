select q'<{ 
"id": >' || rownum || q'<,
"columns": [
{"value": ">' || to_char(ed,'YYYY-MM-DD') || q'<" },
{"value": ">' || Suspended || q'<" },
{"value": ">' || Cancelled || q'<" },
{"value": ">' || Completed || q'<" },
{"value": ">' || Superseded || q'<" },
{"value": ">' || Processing || q'<" },
{"value": ">' || Archived || q'<" },
{"value": ">' || Entering || q'<" },
{"value": ">' || Suspending || q'<" },
{"value": ">' || Total || q'<" }
],
"initIndex": >' || (rownum-1) || q'<
}>' as data
from (
  select 
      execution_date ed,
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
  group by  execution_date
  order by execution_date
)
--order by ed