select q'<{ 
"id": >' || rownum || q'<,
"columns": [
{"value": ">' || to_char(ed,'YYYY-MM-DD') || q'<"},
{"value": ">' || s5d || q'<"},
{"value": ">' || s10d || q'<"},
{"value": ">' || s20d || q'<"},
{"value": ">' || s40d || q'<"},
{"value": ">' || s60d || q'<"},
{"value": ">' || l60d || q'<"}
],
"initIndex": >' || (rownum-1) || q'<
}>' as data
from (

  select  ed,
          Rtrim(To_Char(round(s5d * 100 / Total,2),'fm9999999999999999990d999999'),'.,') as s5d,
          Rtrim(To_Char(round(s10d * 100 / Total,2),'fm9999999999999999990d999999'),'.,') as s10d,
          Rtrim(To_Char(round(s20d * 100 / Total,2),'fm9999999999999999990d999999'),'.,') as s20d,
          Rtrim(To_Char(round(s40d * 100 / Total,2),'fm9999999999999999990d999999'),'.,') as s40d,
          Rtrim(To_Char(round(s60d * 100 / Total,2),'fm9999999999999999990d999999'),'.,') as s60d,
          Rtrim(To_Char(round(l60d * 100 / Total,2),'fm9999999999999999990d999999'),'.,') as l60d
  from (
    select 
        execution_date ed,
        sum(ORD_DURATION_LESS_5DAYS) as s5d,
        sum(ORD_DURATION_LESS_10DAYS) as s10d,
        sum(ORD_DURATION_LESS_20DAYS) as s20d,
        sum(ORD_DURATION_LESS_40DAYS) as s40d,
        sum(ORD_DURATION_LESS_60DAYS) as s60d,
        sum(ORD_DURATION_LATER_60DAYS) as l60d,
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
)