select  
'{"name": "Total number with error", "data": [' || listagg(error_sum, ', ') WITHIN GROUP (order by ed) || ']},
{"name": "Total Number", "data": [' || listagg(Total, ', ') WITHIN GROUP (order by ed) || ']}' as data
from (
  select  ed,
          error_sum,
          Rtrim(To_Char(round(error_sum * 100 / Total,2),'fm9999999999999999990d999999'),'.,') as error_percent,
          total
  from (
    select 
        execution_date ed,
        sum(error_sum) error_sum,
        sum(order_sum) Total
    from kpi_orders
    where execution_date between to_date(?, 'DD.MM.YYYY') and to_date(?, 'DD.MM.YYYY')
    group by  execution_date
  )
)