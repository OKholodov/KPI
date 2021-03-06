select  
'{"name": "<5 Days%", "data": [' || listagg(s5d, ', ') WITHIN GROUP (order by ed) || ']},
{"name": "<10 Days%", "data": [' || listagg(s10d, ', ') WITHIN GROUP (order by ed) || ']},
{"name": "<20 Days%", "data": [' || listagg(s20d, ', ') WITHIN GROUP (order by ed) || ']},
{"name": "<40 Days%", "data": [' || listagg(s40d, ', ') WITHIN GROUP (order by ed) || ']},
{"name": "<60 Days%", "data": [' || listagg(s60d, ', ') WITHIN GROUP (order by ed) || ']},
{"name": ">=60 Days%", "data": [' || listagg(l60d, ', ') WITHIN GROUP (order by ed) || ']}' as data
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
    group by  execution_date
  )
)
;

  

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
    where execution_date between to_date('01.01.2018', 'DD.MM.YYYY') and to_date('01.04.2018', 'DD.MM.YYYY')
    and cfs_category in ('sda','dsad')
    and business_scenario in ('qwe','we')
    and status in ('f')
    and age_class in ('f')
    group by  execution_date
    order by execution_date
  )
  ;
  
  select it.data || ',' || val.data as data
from (
  select '"items": [' || listagg('{"label": "' || o.value || '", "value": {"code": "' || o.value || '"}}',',') within group (order by o.show_order, o.list_value_id) || ']' as data
  from nc_list_values o
  where attr_type_def_id = 9147540677013385788
)it,
(
  select '"value": [' || listagg('{"label": "' || o1.value || '", "value": {"code": "' || o1.value || '"}}',',') within group (order by o1.show_order, o1.list_value_id) || ']' as data
  from nc_list_values o1
  where attr_type_def_id = 9147540677013385788
  and exists (
    select 1
    from kpi_orders kp
    where kp.business_scenario = o1.value
  )
)val
;

create index ind1 on kpi_orders(execution_date)
;
where execution_date between to_date(?, 'DD.MM.YYYY') and to_date(?, 'DD.MM.YYYY')
  and cfs_category in (select /*+ cardinality(t,10) */ column_value from table(PKG_TIS_KPI.SPLIT_STR_TO_ARRAYOFSTRINGS(?))t)
  and business_scenario in (select /*+ cardinality(t,10) */ column_value from table(PKG_TIS_KPI.SPLIT_STR_TO_ARRAYOFSTRINGS(?))t)
  and status in (select /*+ cardinality(t,10) */ column_value from table(PKG_TIS_KPI.SPLIT_STR_TO_ARRAYOFSTRINGS(?))t)
  and age_class in (select /*+ cardinality(t,10) */ column_value from table(PKG_TIS_KPI.SPLIT_STR_TO_ARRAYOFSTRINGS(?))t)
  
  ;
  
  select * from (
select times_purchased as �Puchase Frequency�, state_code
from customers t
)pivot(
count(state_code)
for state_code in ('NY' as "New York",'CT' �Connecticut�,'NJ' "New Jersey",'FL' �Florida�,'MO' as �Missouri�)
)
order by 1
;
select 1 as "03.03.2018"
from dual
;
select *
from kpi_user_tasks
 ;
 select '
{"id": ' || rownum || ', 
"columns": [ 
{"value": "' || "03.03.2018" || '" },
{"value": "' || "delta1" || '" },
{"value": "' || "08.03.2018" || '" },
{"value": "' || "delta2" || '" },
{"value": "' || "12.03.2018" || '" },
{"value": "' || "delta3" || '" } 
], "initIndex": ' || (rownum-1) || ' } ' 
 ;
 
-- Head
select   q'< {"id": ' || rownum || ', "columns": [ >' ||
            listagg(
            q'[{"value": "']' || ' || "' || column_value || '" || ' || q'['" },]' ||
            q'[{"value": "']' || ' || "delta' || rownum || '" || ' || q'['" }]'
           ,',') within group (order by null) ||
         q'< ], "initIndex": ' || (rownum-1) || '} ' >' as p1
from table(PKG_TIS_KPI.SPLIT_STR_TO_ARRAYOFSTRINGS('03.03.2018,08.03.2018,12.03.2018'))t;  
;

select   q'<
         {
             "unclickable": true,
             "styleClass": "_header",
             "columns": [>' ||
                listagg(
                q'[{"value": "']' || ' || "' || column_value || '" || ' || q'['" },]' ||
                q'[{"value": "']' || ' || "Delta" || ' || q'['" }]'
               ,',') within group (order by null) ||
             q'< ], "initIndex": ' || (rownum-1) || '} ' >' as p1

    from table(PKG_TIS_KPI.SPLIT_STR_TO_ARRAYOFSTRINGS('03.03.2018,08.03.2018,12.03.2018,01.01.2013',1))t; 
;
substr (v_dates_str, 1, length(v_dates_str)-1);
;

select substr (str, 1, length(str) - length(',{"styleClass": "_header","value": "Delta","filter": false,"sort": "asc"}') ) || ']}' as str
from (
  select q'<{"unclickable": true,"styleClass": "_header","columns": [>' ||
  listagg(q'<{"styleClass": "_header","value": ">' || column_value || q'<","filter": false,"sort": "asc"},{"styleClass": "_header","value": "Delta","filter": false,"sort": "asc"}>'
  ,',') within group (order by to_date(column_value, 'DD.MM.YYYY') desc)  as str
  from table(PKG_TIS_KPI.SPLIT_STR_TO_ARRAYOFSTRINGS('03.03.2018,08.03.2018,12.03.2018,01.01.2013',1))t
)
;
select column_value
from table(PKG_TIS_KPI.SPLIT_STR_TO_ARRAYOFSTRINGS('03.03.2018,08.03.2018,12.03.2018,01.01.2013',1))t; 
;
{
  "unclickable": true,
  "styleClass": "_header",
  "columns": [
    {"styleClass": "_header","value": "03.03.2018","filter": false,"sort": "asc"},
    {"styleClass": "_header","value": "Delta","filter": false,"sort": "asc"},
    {"styleClass": "_header","value": "08.03.2018","filter": false,"sort": "asc"},
    {"styleClass": "_header","value": "Delta","filter": false,"sort": "asc"},
    {"styleClass": "_header","value": "12.03.2018","filter": false,"sort": "asc"},
    {"styleClass": "_header","value": "Delta","filter": false,"sort": "asc"}
  ]
}
;

{
  "unclickable": true,
  "styleClass": "_header",
  "columns": [
    {"styleClass": "_header","value": "12.03.2018","filter": false,"sort": "asc"},
    {"styleClass": "_header","value": "Delta","filter": false,"sort": "asc"},
    {"styleClass": "_header","value": "08.03.2018","filter": false,"sort": "asc"},
    {"styleClass": "_header","value": "Delta","filter": false,"sort": "asc"},
    {"styleClass": "_header","value": "03.03.2018","filter": false,"sort": "asc"}
  ]
}
;
select q'<
         {
             "unclickable": true,
             "styleClass": "_header",
             "columns": [
                 {
                     "styleClass": "_header",
                     "value": "Execution Date",
                     "filter": false,
                     "sort": "asc"
                 },
                 {
                     "styleClass": "_header",
                     "value": "Total Number with error",
                     "filter": false,
                     "sort": true
                 },
                 {
                     "styleClass": "_header",
                     "value": "Number Of Errors %",
                     "filter": false,
                     "sort": true
                 },
                 {
                     "styleClass": "_header",
                     "value": "Total Number  ",
                     "filter": false,
                     "sort": true
                 }
              ]
         }>' as data
from dual
;
select column_value as data
from table ( PKG_TIS_KPI.get_ut_by_name('03.03.2018,08.08.2018,12.08.2018,01.08.2013') );

select *
from nc_attr_types
where object_type_id = 	


select *
from nc_objects
where object_id = 9150315974413327911
;
select ' {"id": ' || rownum || ', "columns": [ {"value": "' || d1 || '" },{"value": "' || delta1 || '" },{"value": "' || d2 || '" },{"value": "' || delta2 || '" },{"value": "' || d3 || '" } ], "initIndex": ' || (rownum-1) || '} '  from (  select d1,
    d1 - d2 as delta1,
    d2,
    d2 - d3 as delta2, d3 from (
        select *
        from (
          select to_char(execution_date,'DD.MM.YYYY') ed,
                order_sum,
                status
          from kpi_orders
          where execution_date in (to_date('12.03.2018', 'DD.MM.YYYY'),to_date('08.03.2018', 'DD.MM.YYYY'),to_date('03.03.2018', 'DD.MM.YYYY'))
        ) pivot (
          sum(order_sum)
          for ed in ('12.03.2018'as d1,'08.03.2018'as d2,'03.03.2018'as d3)
        )
      )
    )

;

select ' {"id": ' || rownum || ', "columns": [ {"value": "' || d1 || '" },{"value": "' || "delta3" || '" },{"value": "' || d2 || '" },{"value": "' || "delta2" || '" },{"value": "' || d3 || '" },{"value": "' || "delta1" || '" } ], "initIndex": ' || (rownum-1) || '} '  from (  select d1,
    d1 - d2 as delta1,
    d2,
    d2 - d3 as delta2, d3 from (
        select *
        from (
          select to_char(execution_date,'DD.MM.YYYY') ed,
                order_sum,
                status
          from kpi_orders
          where execution_date in (to_date('12.03.2018', 'DD.MM.YYYY'),to_date('08.03.2018', 'DD.MM.YYYY'),to_date('03.03.2018', 'DD.MM.YYYY'))
        ) pivot (
          sum(order_sum)
          for ed in ('12.03.2018'as d1,'08.03.2018'as d2,'03.03.2018'as d3)
        )
      )
    )
;

select  '{"id": ' || rownum || ', "columns": [ {"value": "' || "03.03.2018" || '" },{"value": "' || "delta1" || '" },{"value": "' || "08.03.2018" || '" },{"value": "' || "delta2" || '" },{"value": "' || "12.03.2018" || '" },{"value": "' || "delta3" || '" } ], "initIndex": ' || (rownum-1) || '} '  from ( 
      select *
      from (
        select to_char(execution_date,'DD.MM.YYYY') ed,
              order_sum,
              status
        from kpi_orders
        where execution_date in (select /*+ cardinality(t,10) */ to_date(column_value, 'DD.MM.YYYY') from table(v_dates)t)
      ) pivot (
        sum(order_sum)
        for ed in ('03.03.2018','08.03.2018','12.03.2018')
      )
    )
;
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
 
select *
from (
  select to_char(execution_date,'DD.MM.YYYY') ed,
        order_sum,
        status
  from kpi_orders
  where execution_date in (select /*+ cardinality(t,10) */ to_date(column_value, 'DD.MM.YYYY') from table(PKG_TIS_KPI.SPLIT_STR_TO_ARRAYOFSTRINGS('03.03.2018,08.03.2018,12.03.2018'))t)

) pivot (
  sum(order_sum)
  for ed in ('03.03.2018')
)
;

select listagg( ('d' || level || ',
d' || level || ' - d' || (level + 1) || ' as delta' || level), ',
') within group (order by null) as str
from dual
connect by level < 5

;
select d1,
       d1 - d2 as dl1,
       d2,
       d2 - d3 as dl2
from (
select *
      from (
        select to_char(execution_date,'DD.MM.YYYY') ed,
              order_sum,
              status
        from kpi_orders
        where execution_date in (to_date('12.03.2018', 'DD.MM.YYYY'),to_date('08.03.2018', 'DD.MM.YYYY'),to_date('03.03.2018', 'DD.MM.YYYY'))
        /*
        union all
        select 'dl1' as ed, 0 as order_sum, 'del' as status from dual
        union all
        select 'dl2' as ed, 0 as order_sum, 'del' as status from dual
        union all
        select 'dl3' as ed, 0 as order_sum, 'del' as status from dual*/
      ) pivot (
        sum(order_sum)
        for ed in ('12.03.2018'as d1, '08.03.2018'as d2, '03.03.2018'as d3)
      )
)

;

SELECT trim(COLUMN_VALUE) str
    --bulk collect into ret
    FROM xmltable(('"' || REPLACE('03.03.2018,08.03.2018,12.03.2018', ',', '","') || '"'))
    order by to_date(trim(COLUMN_VALUE),'DD.MM.YYYY') desc;
;
select *
from (
  select to_char(execution_date,'DD.MM.YYYY') ed,
        order_sum,
        status
  from kpi_orders
  where execution_date in (select /*+ cardinality(t,10) */ to_date(column_value, 'DD.MM.YYYY') from table(PKG_TIS_KPI.SPLIT_STR_TO_ARRAYOFSTRINGS('03.03.2018,08.03.2018,12.03.2018'))t)

) pivot xml (
  sum(order_sum) order_sum
  for ed in (select /*+ cardinality(t,10) */ to_date(column_value, 'DD.MM.YYYY') from table(PKG_TIS_KPI.SPLIT_STR_TO_ARRAYOFSTRINGS('03.03.2018,08.03.2018,12.03.2018'))t)
)
 ;
 
select *
from table(
 pivot(q'[
   select status,
          execution_date,
          sum(order_sum) order_sum
   from kpi_orders
   where execution_date in (]' || ( select /*+ cardinality(t,10) */ to_date(column_value, 'DD.MM.YYYY') from table(PKG_TIS_KPI.SPLIT_STR_TO_ARRAYOFSTRINGS( ))t) || q'[
   group by execution_date,status
 ]') 
)
;
select 
q'[
   select status,
          execution_date,
          sum(order_sum) order_sum
   from kpi_orders
   where execution_date in (]' || ( select /*+ cardinality(t,10) */ to_date(column_value, 'DD.MM.YYYY') from table(PKG_TIS_KPI.SPLIT_STR_TO_ARRAYOFSTRINGS('03.03.2018,08.03.2018,12.03.2018'))t) || q'[
   group by execution_date,status
 ]' as q
from dual
;
������� 180;

select  q'[to_date(']' || column_value || q'[','DD.MM.YYYY')]' as p1
from table(PKG_TIS_KPI.SPLIT_STR_TO_ARRAYOFSTRINGS('03.03.2018,08.03.2018,12.03.2018'))t;     
;
to_date('03.03.2018','DD.MM.YYYY')
 select /*+ cardinality(t,10) */ '''' || column_value || '''' from table(PKG_TIS_KPI.SPLIT_STR_TO_ARRAYOFSTRINGS('03.03.2018,08.03.2018,12.03.2018'))t
