declare
  v_with_backups number := 1;
  v_exept_attr_ids varchar2(4000);
  
  v_cnt_ncp_before number;
  v_cnt_ncp_after number;
  
  procedure clear_params(p_table_name varchar2, p_exept_attr_ids varchar2)
  is
  begin
    execute immediate '
      delete from nc_params
      where object_id in (
        select object_id
        from ' || p_table_name || '
      )
      and attr_id not in (
        ' || p_exept_attr_ids || '
      )
    ';
  end;
  
  procedure create_bckps(p_table_name varchar2)
  is
  begin
    if (v_with_backups = 1) then 
      execute immediate '
        insert into OBF_BCK_NCO
        select *
        from nc_objects nco
        where exists (
          select 1
          from ' || p_table_name || ' mp
          where nco.rowid = mp.row_id
        )
      ';
      
      execute immediate '
        insert into OBF_BCK_NCP
        select *
        from nc_params ncp
        where exists (
          select 1
          from ' || p_table_name || ' mp
          where ncp.object_id = mp.object_id
        )
      ';
    end if;
  end;
  
  FUNCTION multiple_replace(
    in_text IN VARCHAR2, 
    in_old IN varchar2, 
    in_new IN varchar2
  )
    RETURN VARCHAR2
  AS
    v_c1 BINARY_INTEGER;
    v_c2 BINARY_INTEGER;
    v_arr1  dbms_utility.lname_array;
    v_arr2  dbms_utility.lname_array;
    v_result VARCHAR2(255);
  BEGIN
    DBMS_UTILITY.COMMA_TO_TABLE (
      in_old,
      v_c1,
      v_arr1
    );
    
    DBMS_UTILITY.COMMA_TO_TABLE (
      in_new,
      v_c2,
      v_arr2
    );
    
    IF( v_c1 <> v_c2 ) THEN
      RETURN in_text;
    END IF;
    v_result := in_text;
    FOR i IN 1 .. v_c1 LOOP
      v_result := REPLACE( v_result, v_arr2(i), v_arr1(i) );
    END LOOP;
    RETURN v_result;
  END;

begin

  /* ******************** Preparing data ********************** */

  /* ******************** Obfuscation data ********************** */
  
  /* Country */
  create_bckps('OBF_COUNTRY_MAPPING');

  merge into nc_objects upd
  using (
    SELECT  nco.rowid as row_id, 
            mp.code
    FROM nc_objects nco
      JOIN OBF_COUNTRY_MAPPING mp
        ON nco.rowid = mp.row_id
  ) t
  on (upd.rowid = t.row_id)
  when matched then update 
  SET upd.name = t.code,
    upd.description = null,
    upd.version = version + 1;
  
  clear_params(
    'OBF_COUNTRY_MAPPING', 
    '
    61,	/*Created By*/
    62,	/*Created When*/
    63,	/*Modified By*/
    64,	/*Modified When*/
    5041554231013920466,	/*Country Code*/
    8081349159013831209	  /*Primary Key ID*/'
  );
  
  merge into nc_params upd
  using (
    SELECT  mp.object_id, 
            5041554231013920466 attr_id,
            mp.code as val
    FROM OBF_COUNTRY_MAPPING mp
    union all
    SELECT  mp.object_id, 
            8081349159013831209 attr_id,
            mp.code as val
    FROM OBF_COUNTRY_MAPPING mp
  ) t
  on (upd.object_id = t.object_id and upd.attr_id = t.attr_id)
  when matched then update 
  SET upd.value = t.val;
  
  /* City/Municipality */
  create_bckps('OBF_CITY_MAPPING');

  merge into nc_objects upd
  using (
    SELECT  nco.rowid as row_id, 
            mp.name
    FROM nc_objects nco
      JOIN OBF_CITY_MAPPING mp
        ON nco.rowid = mp.row_id
  ) t
  on (upd.rowid = t.row_id)
  when matched then update 
  SET upd.name = t.name,
    upd.description = t.name,
    upd.version = version + 1
  ;
  
  clear_params(
    'OBF_CITY_MAPPING', 
    '
    61,	/*Created By*/
      62,	/*Created When*/
      63,	/*Modified By*/
      64,	/*Modified When*/
      8072445103013867916,	/*City/Municipality Code*/
      8081349159013831209	  /*Primary Key ID*/'
  );
  
  merge into nc_params upd
  using (
    SELECT  mp.object_id, 
            8072445103013867916 attr_id, /*City/Municipality Code*/
            mp.code as val
    FROM OBF_CITY_MAPPING mp
    union all
    SELECT  mp.object_id, 
            8081349159013831209 attr_id, /*Primary Key ID*/
            mp.code as val
    FROM OBF_CITY_MAPPING mp
  ) t
  on (upd.object_id = t.object_id and upd.attr_id = t.attr_id)
  when matched then update 
  SET upd.value = t.val
  ;
  
  /* Provider Location */
  create_bckps('OBF_SITE_MAPPING');

  merge into nc_objects upd
  using (
    SELECT  nco.rowid as row_id, 
            mp.name
    FROM nc_objects nco
      JOIN OBF_SITE_MAPPING mp
        ON nco.rowid = mp.row_id
    --where nco.object_type_id + 0 = 7121158695013985788
  ) t
  on (upd.rowid = t.row_id)
  when matched then update 
  SET upd.name = t.name,
    upd.description = null,
    upd.version = version + 1
  ;
  
  clear_params(
    'OBF_SITE_MAPPING', 
    '
    61,	/*Created By*/
    62,	/*Created When*/
    63,	/*Modified By*/
    64,	/*Modified When*/
    9147507644413380498,	/*Site Type*/
    8033139507013843610,	/*Physical Status*/
    8081349159013831209	  /*Primary Key ID*/'
  );
  
  /* Buildings and other rooms */
  create_bckps('
    (select rowid as row_id, object_id
    from nc_objects
    where object_type_id in (
      1777776,	/*Floor*/
      1780440,	/*Building*/
      1783104,	/*Room*/
      8101358699013918801	/*Building Section*/
    )
    and project_id + 0 = 9147626421313346494)
  ');
  
  merge into nc_objects upd
  using (
    SELECT  nco.rowid as row_id
    from nc_objects nco
    where object_type_id in (
      1777776,	/*Floor*/
      1780440,	/*Building*/
      1783104,	/*Room*/
      8101358699013918801	/*Building Section*/
    )
    and project_id + 0 = 9147626421313346494
  ) t
  on (upd.rowid = t.row_id)
  when matched then update 
  SET 
    upd.description = null,
    upd.version = version + 1
  ;
  
  --clear_params
  delete from nc_params
  where object_id in (
    SELECT  nco.object_id
    from nc_objects nco
    where object_type_id in (
      1777776,	/*Floor*/
      1780440,	/*Building*/
      1783104,	/*Room*/
      8101358699013918801	/*Building Section*/
    )
    and project_id + 0 = 9147626421313346494
  )
  and attr_id not in (
    select attr_id
    from nc_attributes
    where ATTR_GROUP_ID in (
      2010443089013468396	/*Modification Info*/
--      ,1090440074013323208,	/*Inventory*/
--      8033139507013843604,	/*Inventory Lifecycle*/
--      2121841283013642340	/*Space Info*/
    )
    or attr_id = 8081349159013831209 /*Primary Key ID*/
  );
  
  /* Replacing all other names */
  
  /*
  select object_id, name, multiple_replace(name, n1, n2) as new_name
  from (
    select  o.name,
            o.object_id,  
            listagg(mp.name,',') within group(order by mp.object_id) n1,
            listagg(mp.name_old,',') within group(order by mp.object_id) n2 
    from nc_objects o
      join OBF_SITE_MAPPING mp
        on o.name like '%' || mp.name_old || '%'
    where o.project_id = 9147626421313346494
    and o.object_type_id not in (
      7121158695013985788
    )
    group by o.name, o.object_id
  )
  */

  /* Replacing all other names */
  for rec in (
    select  /*+ index(o,XIF79NC_OBJECTS) */
            --o.name,
            o.rowid as row_id,
            o.object_id,  
            mp.name as name_new,
            mp.name_old
    from nc_objects o
      join OBF_SITE_MAPPING mp
        on o.name like '%' || mp.name_old || '%'
    where o.project_id = 9147626421313346494
    and o.object_type_id not in (
      7121158695013985788,
      10025 /* Rack */
    )
    --and o.object_id = 9150273076613431377
  )
  
  loop
    update nc_objects
    set name = replace(name, rec.name_old, rec.name_new)
    where rowid = rec.row_id;
  end loop;

  /* Clear descriptions */
  update nc_objects o
  set description = null
  where o.project_id = 9147626421313346494
  and description is not null
  and object_class_id not in (801);
  
  /* Obfuscation nc_params data */
  insert into OBF_NC_PARAMS(row_id, object_id, value, found_value, replace_value)
  select /*+ leading(a,p,mp,o) use_hash(a,p) full(p) */ 
          p.rowid as row_id,
          p.object_id,
          p.value,
          mp.name_old,
          mp.name as name_new
  from nc_params p
    join OBF_SITE_MAPPING mp
     on p.VALUE like '%' || mp.name_old || '%'
  where exists (
    select/*+ index(a XIF36NC_ATTRIBUTES)*/ 1
    from nc_attributes a
    where p.attr_id = a.attr_id 
    and a.ATTR_TYPE_ID = 0
  )
  and exists (
    select /*+ index_ffs(o XIF29NC_OBJECTS) */ 1
    from nc_objects o
    where o.object_id = p.object_id
    and o.project_id = 9147626421313346494
  );
  
  v_cnt_ncp_before := Sql%Rowcount;
  
  if v_cnt_ncp_before > 0 then
  
    --values with only one match for replacing
    merge into nc_params p
    using (
      select  row_id,
              found_value,
              replace_value
      from (
        select  ob.row_id,
                ob.object_id,
                --ob.value,
                ob.found_value,
                ob.replace_value, 
                count(*) over (partition by row_id) cnt
        from OBF_NC_PARAMS ob
      )
      where cnt = 1
    )t
    on (p.rowid = t.row_id)
    when matched then update set p.value = replace(p.value, t.found_value, t.replace_value)
    ;
    
    v_cnt_ncp_after := Sql%Rowcount;
    
    --values with more than one matches for replacing
    if v_cnt_ncp_after != v_cnt_ncp_before then
      for rec in (
        select  row_id,
                found_value,
                replace_value
        from (
          select  ob.row_id,
                  ob.object_id,
                  --ob.value,
                  ob.found_value,
                  ob.replace_value, 
                  count(*) over (partition by row_id) cnt
          from OBF_NC_PARAMS ob
        )
        where cnt > 1
      )
      loop
        update nc_params
        set value = replace(value, rec.found_value, rec.replace_value)
        where rowid = rec.row_id;
      end loop;
    end if;
    
  end if;

end;
