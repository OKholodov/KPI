CREATE OR REPLACE PACKAGE PKG_TIS_KPI
IS
  PROCEDURE CREATE_SNAPSHOT;

END PKG_TIS_KPI;
/
CREATE OR REPLACE PACKAGE BODY PKG_TIS_KPI
IS

  PROCEDURE CREATE_SNAPSHOT
  is
    l_execution_date date;
  begin

    select sysdate into l_execution_date from dual;
    
    insert into kpi_orders (
    /*
      EXECUTION_DATE,
      ORDER_ID,
      ORDER_NAME,
      CFS_CATEGORY,
      BUSINESS_SCENARIO,
      STATUS,
      START_DATE,
      END_DATE,
      AGE_CLASS,
      DURATION,
      IS_ERROR,
      ORDER_SUM,
      ERROR_SUM,
      ORD_DURATION_LESS_10MIN,
      ORD_DURATION_LESS_1HOUR,
      ORD_DURATION_LESS_1DAY,
      ORD_DURATION_LESS_1WEEK,
      ORD_DURATION_LESS_3WEEK,
      ORD_DURATION_LATER_3WEEK
     */
      EXECUTION_DATE,
      CFS_CATEGORY,
      BUSINESS_SCENARIO,
      STATUS,
      AGE_CLASS,
      ORDER_SUM,
      ERROR_SUM,
      ORD_DURATION_LESS_10MIN,
      ORD_DURATION_LESS_1HOUR,
      ORD_DURATION_LESS_1DAY,
      ORD_DURATION_LESS_1WEEK,
      ORD_DURATION_LESS_3WEEK,
      ORD_DURATION_LATER_3WEEK
    )
    select  /*
            l_execution_date as execution_date,
            order_id,
            order_name,
            CFS_Category,
            business_scenario,
            status,
            to_char(cast(start_date as timestamp),'DD.MM.YY HH24:MI:SS') start_date,
            to_char(cast(end_date as timestamp),'DD.MM.YY HH24:MI:SS') end_date,
            age_class,
            duration,
            is_error,
            count(order_id) over (partition by 1) as order_sum,
            sum(is_error) over (partition by 1) as error_sum,
            case when duration < 10 then 1 end ord_duration_less_10min,
            case when duration < 60 then 1 end ord_duration_less_1hour,
            case when duration < 60 * 24 then 1 end ord_duration_less_1day,
            case when duration < 60 * 24 * 7 then 1 end ord_duration_less_1week,
            case when duration < 60 * 24 * 7 * 3 then 1 end ord_duration_less_3week,
            case when duration >= 60 * 24 * 7 * 3 then 1 end ord_duration_later_3week
            */
            l_execution_date as execution_date,
            CFS_Category,
            business_scenario,
            status,
            age_class,
            count(order_id) as order_sum,
            sum(is_error) as error_sum,
            count(case when duration < 10 then 1 end) ord_duration_less_10min,
            count(case when duration < 60 then 1 end) ord_duration_less_1hour,
            count(case when duration < 60 * 24 then 1 end) ord_duration_less_1day,
            count(case when duration < 60 * 24 * 7 then 1 end) ord_duration_less_1week,
            count(case when duration < 60 * 24 * 7 * 3 then 1 end) ord_duration_less_3week,
            count(case when duration >= 60 * 24 * 7 * 3 then 1 end) ord_duration_later_3week
    from (
      select  ord.object_id as order_id, 
              ord.name order_name,
              ord.object_type_id order_ot,
              (select name from nc_objects o where o.object_id = r_spec.reference) as CFS_Category,
              (select value from nc_list_values lv where lv.list_value_id = bs.list_value_id) business_scenario,
              (select value from nc_list_values lv where lv.list_value_id = pstat.list_value_id) status,
              psd.date_value as start_date,
              ped.date_value as end_date,
              floor((coalesce(ped.date_value, l_execution_date)  - psd.date_value) * 24 * 60) duration,
        
              case 
                when pkgUtils.id_to_date(ord.object_id) > l_execution_date - interval '28' DAY 
                  then 'LESS_4_WEEKS' 
                  else 'MORE_4_WEEKS'
              end as age_class,
                
      --        r_comp.reference as composite_order_id,
      --        flow.reference as flow,
                
              case when exists (
                select  /*+ no_merge */ 
                        1
                from nc_objects oerr,
                  nc_params st
                where oerr.parent_id = flow.reference
                and oerr.object_type_id = 9091139760013455548 /* Task Execution Error Record */
                and st.object_id = oerr.object_id
                and st.attr_id = 9129963118613969303 /* Status */
                and st.list_value_id not in (
                  9130083806013043693, /* Superceded */
                  9129963310513969332, /* Resolved */
                  9138869703913173049  /* Closed */
                )
                and exists (
                  select 1
                  from NC_PO_TASKS task
                  where task.order_id = ord.object_id
                  and task.container_id = flow.reference
                )
              ) then 1
                else 0 
              end as is_error
                  
      --        task.task_id,
      --        task.name as task_name
      from NC_OBJECTS ord
        join nc_params bs
          on ord.object_id = bs.object_id
          and bs.attr_id = 9147540677013385720 /* Business Scenario */
        join nc_references r_spec
          on r_spec.object_id = ord.object_id
          and r_spec.attr_id = 4070569491013010663 /* Specification */ --9110561867013941192 /* Order Specification */
        join nc_params pstat
          on ord.object_id = pstat.object_id
          and pstat.attr_id = 4063055154013004350 /* Status */
        join nc_references flow
          on ord.object_id = flow.object_id
          and flow.attr_id = 8090342058013828310 /* Execution Flow */
        left join nc_params psd
          on ord.object_id = psd.object_id
          and psd.attr_id = 4063077486013004590 /* Start Date */
        left join nc_params ped
          on ord.object_id = ped.object_id
          and ped.attr_id = 4063077487013004591 /* End Date */

      --  left join nc_references r_comp
      --    on ord.object_id = r_comp.object_id
      --    and r_comp.attr_id = 9124623165113888102 /* Composite Order */
             
      --  join NC_PO_TASKS task
      --    on task.container_id = flow.reference
      --    and task.order_id = ord.object_id
            
      where ord.OBJECT_TYPE_ID in (
        select  /*+ no_merge */ 
                object_type_id
        from NC_OBJECT_TYPES
        start with object_type_id in (
          7032838464013880298,  /* CFS Order */
          9122162114013529963,  /* Disconnect CFS Order */
          9122162114013529964,  /* Suspend CFS Order */
          9122165142013530018,  /* Restore CFS Order */
          9147808248913408202   /* Cancel AIDA CFS Order */
        )
        connect by prior object_type_id = parent_id
      )
      and r_spec.reference in (
        9148102152613370134,  /* IP Service CFS */
        9147499776613377322,  /* Data Service CFS */
        9148163188813443299,  /* Colocation Service CFS */
        9149546559813501876,  /* Carrier MPLS CFS */
        9149537436313495176,  /* Ethernet Site CFS */
        9149607815513458131,	/* IPVPN Site CFS */
        9149607223513534436,	/* VAS Service CFS */
        9149667916313487849,	/* Seabone Safe Service CFS */
        9149537436313495188 	/* Full Outsourcing CFS */
      )
    )
    group by  l_execution_date,
              CFS_Category,
              business_scenario,
              status,
              age_class;
    
    insert into kpi_user_tasks (
      EXECUTION_DATE,
      TASK_ID,
      TASK_NAME,
      STATE,
      ASSIGNED_TO,
      INITIAL_ASSIGNED_TO,
      STARTED,
      COMPLETED,
      TOTAL_DURATION_SEC,
      TOTAL_DURATION_BEF_START_SEC,
      IS_ERROR,
      TASK_SUM,
      ERROR_SUM
    )
    select  l_execution_date as execution_date,
            task_id,
            task_name,
            state,
            nvl(assigned_to,'not assigned') as assigned_to,
            nvl(initial_assigned_to,'not assigned') as initial_assigned_to,
            to_char(cast(started as timestamp),'DD.MM.YY HH24:MI:SS') started,
            to_char(cast(completed as timestamp),'DD.MM.YY HH24:MI:SS') completed,
            total_duration_sec,
            total_duration_bef_start_sec,
            is_error,
            count(task_id) over (partition by 1) as task_sum,
            sum(is_error) over (partition by 1) as error_sum
    from (
      select  /*+ leading(task,pstat) use_nl(task,pstat) no_merge */ 
              task.task_id,
              task.task_name,
              (select value from nc_list_values lv where lv.list_value_id = pstat.list_value_id) state,
              (select name from nc_objects o where o.object_id = asgnt_to.reference) assigned_to,
              (select name from nc_objects o where o.object_id = ini_asgnt_to.reference) initial_assigned_to,
              pstart.date_value as started,
              pcomp.date_value as completed,
              
              trunc( (coalesce(pcomp.date_value, l_execution_date) - coalesce(pstart.date_value, pkgUtils.id_to_date(task.task_id)) ) * 24 * 60 * 60) as total_duration_sec,
              
              case when pstart.date_value is not null 
                then (trunc( (coalesce(pstart.date_value, l_execution_date) - pkgUtils.id_to_date(task.task_id)) * 24 * 60 * 60)) 
                else 0
              end as  total_duration_bef_start_sec,
         
              case when exists (
                select  /*+ no_merge ordered */ 
                        1
                from nc_params tid,  /* link from WI id to PO task id */
                  nc_params err_tid, /* link from Task Execution Error Record to PO task id */
                  nc_objects oerr
                where tid.object_id = task.task_id
                    and tid.attr_id = 9137996003413538340 /* Task ID */
                    and nvl(err_tid.attr_id,0) = 9081958832013376023 /* Task ID */
                    and COALESCE(TO_CHAR(err_tid.DATE_VALUE,'YYYYMMDDHH24MISS'),TO_CHAR(err_tid.LIST_VALUE_ID),SUBSTR(err_tid.VALUE,1,700)) = 
                      COALESCE(TO_CHAR(tid.DATE_VALUE,'YYYYMMDDHH24MISS'),TO_CHAR(tid.LIST_VALUE_ID),SUBSTR(tid.VALUE,1,700))
                    and oerr.object_id = err_tid.object_id
                    and oerr.object_type_id = 9091139760013455548 /* Task Execution Error Record */
              ) then 1
                else 0
              end as is_error
      from (
        select /*+ no_merge */
               task.object_id task_id,
               task.name task_name
        from nc_objects task
        where task.object_type_id in (
          select object_type_id
          from nc_object_types ot
          start with object_type_id = 90000330 /* Work Item */
          connect by parent_id = prior object_type_id
        )
      )task
        join nc_params pstat
          on pstat.object_id = task.task_id
          and pstat.attr_id = 90100070 /* State */
        left join nc_references asgnt_to
          on asgnt_to.object_id = task.task_id
          and asgnt_to.attr_id = 90100080 /* Assigned To */
        left join nc_references ini_asgnt_to
          on ini_asgnt_to.object_id = task.task_id
          and ini_asgnt_to.attr_id = 90201040 /* Initially Assigned To */
        left join nc_params pstart
          on pstart.object_id = task.task_id
          and pstart.attr_id = 90100073 /* Started */
        left join nc_params pcomp
          on pcomp.object_id = task.task_id
          and pcomp.attr_id = 90100074 /* Completed */
    );
    
    commit;
    
    insert into kpi_snapshot (
      execution_date,
      duration_sec
    )
    select  l_execution_date execution_date,
            floor((sysdate - l_execution_date) * 24 * 60 * 60) duration_sec
    from dual;
    
    commit;
    
    exception when others then
      declare 
        v_err VARCHAR2(4000);
      begin
        v_err := substr(SQLERRM,1,4000);
      
        insert into kpi_snapshot (
          execution_date,
          duration_sec,
          err
        )
        select  l_execution_date execution_date,
                floor((sysdate - l_execution_date) * 24 * 60 * 60) duration_sec,
                v_err as err
        from dual;
        
        commit;
      end;
      
  END CREATE_SNAPSHOT;

END PKG_TIS_KPI;
/
