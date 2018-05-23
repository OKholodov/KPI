
drop table kpi_snapshot;
drop table kpi_orders;
drop table kpi_user_tasks;

create table kpi_snapshot
(
  execution_date date,
  duration_sec number(10),
  err varchar2(4000)
);

/*
create table kpi_orders
(
  execution_date date,
  order_id number(22),
  order_name varchar2(1000),
  CFS_Category varchar2(250),
  business_scenario varchar2(250),
  status varchar2(100),
  start_date varchar2(50),
  end_date varchar2(50),
  age_class varchar2(100),
  duration number(10),
  is_error number(1),
  order_sum number,
  error_sum number,
  ord_duration_less_10min number(10),
  ord_duration_less_1hour number(10),
  ord_duration_less_1day number(10),
  ord_duration_less_1week number(10),
  ord_duration_less_3week number(10),
  ord_duration_later_3week number(10)
);
*/

create table kpi_orders
(
  execution_date date,
  CFS_Category varchar2(250),
  business_scenario varchar2(250),
  status varchar2(100),
  age_class varchar2(100),
  order_sum number,
  error_sum number,
  ORD_DURATION_LESS_5DAYS number(10),
  ORD_DURATION_LESS_10DAYS number(10),
  ORD_DURATION_LESS_20DAYS number(10),
  ORD_DURATION_LESS_40DAYS number(10),
  ORD_DURATION_LESS_60DAYS number(10),
  ORD_DURATION_LATER_60DAYS number(10)
);

create index ind_kpi_ord_ed on kpi_orders (execution_date);

create table kpi_user_tasks
(
  execution_date date,
  task_id number,
  task_name varchar2(250),
  state varchar2(200),
  assigned_to varchar2(500),
  initial_assigned_to varchar2(500),
  started varchar2(50),
  completed varchar2(50),
  total_duration_sec number(10),
  total_duration_bef_start_sec number(10),
  is_error varchar2(1),
  task_sum number,
  error_sum number
);

exec DBMS_SCHEDULER.DROP_JOB('KPI_SNAPSHOT_JOB');

BEGIN
  DBMS_SCHEDULER.CREATE_JOB (
   job_name           =>  'KPI_SNAPSHOT_JOB',
   job_type           =>  'PLSQL_BLOCK',
   job_action         =>  'begin PKG_TIS_KPI.create_snapshot; end;',
   start_date         =>  to_date('20.01.2018 00:03:00', 'dd.mm.yyyy hh24:mi:ss'),
   repeat_interval    =>  'FREQ=DAILY;INTERVAL=1', /* every other day */
   end_date           =>  null,
   enabled            =>  TRUE,
   auto_drop          =>  FALSE,
   comments           =>  'Collects KPI information');
END;

select *
from DBA_SCHEDULER_JOBS
;
select *
from DBA_SCHEDULER_JOB_LOG
where job_name = 'KPI_SNAPSHOT_JOB';

begin PKG_TIS_KPI.create_snapshot; end;

select *
from kpi_snapshot