select q'<{ 
id: >' || rownum || q'<,
columns: [
{type: 'datetime', value: '>' || ed || q'<' },
{type: 'number', value: >' || Suspended || q'< },
{type: 'number', value: >' || Cancelled || q'< },
{type: 'number', value: >' || Completed || q'< },
{type: 'number', value: >' || Superseded || q'< },
{type: 'number', value: >' || Processing || q'< },
{type: 'number', value: >' || Archived || q'< },
{type: 'number', value: >' || Entering || q'< },
{type: 'number', value: >' || Suspending || q'< },
{type: 'number', value: >' || Total || q'< }
],
initIndex: >' || (rownum-1) || q'<,
selected: true
}>' as data
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
  group by  to_date(execution_date)
  order by to_date(execution_date)
)
order by ed