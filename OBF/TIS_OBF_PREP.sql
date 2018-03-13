/* ******************** Preparing data ********************** */
declare

  v_test number;

  procedure drop_table(v_table_name varchar2)
  is
  begin
    begin
      execute immediate 'drop table ' || v_table_name;
      exception when others then null;
    end;
  end;
  
  PROCEDURE  CREATE_INDEX (
    table_name      IN      VARCHAR2,
    index_name      IN      VARCHAR2,
    column_list     IN      VARCHAR2,
    gather_stats    IN      BOOLEAN    DEFAULT FALSE,
    uniq            IN      BOOLEAN    DEFAULT FALSE,
    target_schema   IN      VARCHAR2   DEFAULT NULL
  )
  IS
    v_target_schema         VARCHAR2(50)    := CASE WHEN target_schema IS NOT NULL THEN upper(target_schema)||'.' ELSE NULL END;
    v_table_name            VARCHAR2(50)    := v_target_schema||upper(table_name);
    v_index_name            VARCHAR2(50)    := v_target_schema||upper(index_name);
    v_column_list           VARCHAR2(500)   := upper(column_list);
    v_sql                   VARCHAR2(4000)  := NULL;
    v_tablespace            VARCHAR2(50)    := 'NC_INDEXES';
  BEGIN
    TIS_dm_utils.dolog('Start creating index ' || v_index_name || ' on ' || v_table_name || ' ('||v_column_list||').','INDEX ' || TIS_DM_CONSTANTS.c_log_info);

    v_sql   := 'CREATE '
            || CASE WHEN uniq THEN 'UNIQUE ' ELSE NULL END
            || 'INDEX '
            || v_index_name
            || ' ON '
            || v_table_name || '(' || v_column_list || ') NOLOGGING '
            || CASE WHEN v_tablespace IS NOT NULL THEN 'TABLESPACE ' || v_tablespace ELSE NULL END;

    EXECUTE IMMEDIATE v_sql;

    IF  gather_stats
    THEN
      dbms_stats.gather_index_stats(NVL(v_target_schema,user), replace(v_index_name, v_target_schema, NULL));
    END if;

    EXCEPTION
      WHEN OTHERS
      THEN
        IF  SQLCODE = -955
        THEN
          --TIS_dm_utils.dolog('Index '||v_index_name||' already exist on table '||v_table_name||'.','INDEX ' || TIS_DM_CONSTANTS.c_log_warn);
          NULL;
        ELSIF   SQLCODE = -1408
        THEN
          --TIS_dm_utils.dolog('Columns '||v_column_list||' already indexed on table '||v_table_name||'.','INDEX ' || TIS_DM_CONSTANTS.c_log_warn);
          NULL;
        ELSE
          --TIS_dm_utils.dolog('Exception occured when creating index '||v_index_name||' on table '||v_table_name||'. DDL-SQL: '||v_sql||' '||sqlerrm, TIS_DM_CONSTANTS.c_log_except);
          RAISE;
        END IF;
  END create_index;
  
  procedure gather_stat(v_table_name varchar2)
  is
  begin
    dbms_stats.gather_table_stats(ownname => SYS_CONTEXT('USERENV','CURRENT_SCHEMA'),tabname => v_table_name);
  end;
  
begin

  /* Back up tables */
  begin
    begin
      select 1
      into v_test
      from user_tables
      where table_name = 'OBF_BCK_NCO';
      
      exception when NO_DATA_FOUND then
        begin
          execute immediate q'[
            create table OBF_BCK_NCO
            as
            select *
            from nc_objects
            where rownum < 1
          ]';
        end;
    end;
    
    begin
      select 1
      into v_test
      from user_tables
      where table_name = 'OBF_BCK_NCP';
      
      exception when NO_DATA_FOUND then
        begin
          execute immediate q'[
            create table OBF_BCK_NCP
            as
            select *
            from nc_params
            where rownum < 1
          ]';
        end;
    end;
  end;
  
  
  drop_table('OBF_CHAR_CODES');
  
  execute immediate q'[
    create table OBF_CHAR_CODES
    as
    with letters as (
      select chr( ascii('A')+level-1 ) letter
      from dual
      connect by level <= 26
    )
    select  rownum as id,
            l1.letter || l2.letter || l3.letter as code
    from letters l1, letters l2, letters l3
  ]';
  
  CREATE_INDEX(
    table_name    => 'OBF_CHAR_CODES',
    index_name    => 'IND_OBF_CHAR_CODES_PK',
    column_list   => 'ID',
    gather_stats  => true,
    uniq          => true
  );
  
  gather_stat('OBF_CHAR_CODES');
  
  /* Country */
  drop_table('OBF_COUNTRY_MAPPING');
  execute immediate q'[
    create table OBF_COUNTRY_MAPPING
    as
    select  cntr.row_id, 
            cntr.object_id,
            cntr.name,
            codes.code
    from (
      select  o.rowid as row_id,
              o.object_id,
              o.name,
              rownum as rn
      from nc_objects o
      where object_type_id = 1102872989013434274
      and project_id = 9147626421313346494
    ) cntr
      join OBF_CHAR_CODES codes
        on codes.id = cntr.rn
  ]';
  
  gather_stat('OBF_COUNTRY_MAPPING');
  
  /* City/Municipality */
  drop_table('OBF_CITY_MAPPING');
  execute immediate q'[
    create table OBF_CITY_MAPPING
    as
    select  cntr.row_id, 
            cntr.object_id,
            'City ' || codes.code as name,
            cntr.name as name_old,
            codes.code,
            cntr.CODE_OLD
    from (
      select  o.rowid as row_id,
              o.object_id,
              o.name,
              (select value from nc_params p where p.object_id = o.object_id and p.attr_id = 8072445103013867916) as CODE_OLD,
              rownum as rn
      from nc_objects o
      where object_type_id = 2111346142013240436
      and project_id = 9147626421313346494
    ) cntr
      join OBF_CHAR_CODES codes
        on codes.id = cntr.rn
  ]';
  
  gather_stat('OBF_CITY_MAPPING');
  
  /* Provider Location */
  drop_table('OBF_SITE_MAPPING');
  execute immediate q'[
    create table OBF_SITE_MAPPING
    as
    select  o.rowid as row_id,
            o.object_id,
            o.object_type_id,
            replace(o.name, cm.code_old, cm.code) as name,
            o.name as name_old,
            cm.code,
            cm.code_old
    from nc_objects o
      join OBF_CITY_MAPPING cm
        on o.parent_id = cm.object_id
    where o.object_type_id = 7121158695013985788
    and o.project_id = 9147626421313346494
  ]';
  
  gather_stat('OBF_SITE_MAPPING');
  
  /* Table to collect nc_params data for obfuscation */
  drop_table('OBF_NC_PARAMS');
  execute immediate '
    create table OBF_NC_PARAMS (
      row_id rowid,
      object_id NUMBER(20,0),
      value VARCHAR2(4000 BYTE),
      found_value VARCHAR2(200 BYTE),
      replace_value VARCHAR2(200 BYTE)
    )
  ';
  
  
end;