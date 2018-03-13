

select attr_id
from nc_attributes
where ATTR_GROUP_ID in (
  1090440074013323208,	/*Inventory*/
  8033139507013843604,	/*Inventory Lifecycle*/
  2010443089013468396,	/*Modification Info*/
  2121841283013642340	/*Space Info*/
)
or attr_id = 8081349159013831209 /*Primary Key ID*/
;
select *
from NC_ATTR_GROUPS
where attr_group_id = 1
;

select *
  from nc_objects o
  where o.project_id = 9147626421313346494
  and description is not null
  and object_class_id not in (801)
  ;

select *
from obf_test1
;

select *
from nc_objects
where object_id = 9150273076713432188
;

select *
from nc_objects
where object_type_id=10025 /* Rack */
;
create table obf_test1 --223sec
;
create table obf_test2 --223sec
as
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
  --and o.object_id = 9150273076613431377
  group by o.name, o.object_id
)
;
COALESCE(TO_CHAR("DATE_VALUE",'YYYYMMDDHH24MISS'),TO_CHAR("LIST_VALUE_ID"),SUBSTR("VALUE",1,700))
;

select *
from V$SQLTEXT
where sql_text like '%create table test1%'
;
select * from table(dbms_xplan.display_cursor(format => 'ALLSTATS LAST'/*, sql_id => 'f5gw7rf0zufr1'*/)) 
;



alter session set statistics_level = all; 
;
drop table test1
;
create table test1
as
select /*+ gather_plan_statistic myqq */ o.object_id,
      o.name,
      o.object_type_id,
      t.attr_id,
      a.name as attr_name,
      t.value,
      t.name_old
from obf_test2 t,
nc_objects o,
nc_attributes a
where t.object_id = o.object_id
and a.attr_id = t.attr_id
and o.object_type_id not in (7121158695013985788/*,116328*/)
and o.project_id = 9147626421313346494
;
select *
from nc_object_types
where object_type_id=2111346142013240436
;


OT 116328 (Card)
јттрибут 112345679 (Catalog No) емеет подобные значени€ "B02016-10P18", часть строки соответствует коду локации "B0201". только вот не пойму, это совпадение или там правда код локации


;
select *
from nc_attributes
where attr_id=8081349159013831212
;
------------------------------------------------------------------------------------------------------------------------------
create table obf_test3 --444sec
as
select /*+ gather_plan_statistic leading(a,p,mp,o) index(p,XIF26NC_PARAMS) obf_test3 */ 
        p.rowid as row_id,
        p.object_id,
        p.value,
        mp.name_old
from nc_params p
  join OBF_SITE_MAPPING mp
   on p.VALUE like '%' || mp.name_old || '%'
where exists (
  select 1
  from nc_attributes a
  where p.attr_id = a.attr_id 
  and a.ATTR_TYPE_ID = 0
)
and exists (
  select /*+ index_ffs(o XIF29NC_OBJECTS) */ 1
  from nc_objects o
  where o.object_id = p.object_id
  and o.project_id = 9147626421313346494
)
;

ѕосле оптимизации необходимо убрать хинт с запроса!
a.	Starts Ц на входе строк
b.	E-Rows Ц на выходе строк (ожидалось). Ќе важно
c.	A-Rows Ц на выходе строк (реально)
d.	A-Time (!) Ц реальное врем€ выполнени€ запроса. —уммируетс€ по дереву.
e.	Buffers (!) Ц сколько чтений блоков (consistent gets). ѕодсуммируетс€ по дереву.
f.	Reads Ц физическое чтение блоков (physical reads)
g.	0Mem Ц сколько пам€ти Oracle ожидает потратить (при хеш джойне Ц на хеш таблицу)
h.	1Mem 
i.	Used mem Ц сколько реально пам€ти потрачено

/*
SQL_ID  759v64p1t9n8y, child number 0
-------------------------------------
create table obf_tes
 
Plan hash value: 781578489
 
-------------------------------------------------------------------------------------------------------------------------------------------------------------------------
| Id  | Operation                       | Name                           | Starts | E-Rows | A-Rows |   A-Time   | Buffers | Reads  | Writes |  OMem |  1Mem | Used-Mem |
-------------------------------------------------------------------------------------------------------------------------------------------------------------------------
|   0 | CREATE TABLE STATEMENT          |                                |      1 |        |      0 |00:07:24.18 |      20M|    111K|      1 |       |       |          |
|   1 |  LOAD AS SELECT                 |                                |      1 |        |      0 |00:07:24.18 |      20M|    111K|      1 |   270K|   270K|  270K (0)|
|*  2 |   HASH JOIN RIGHT SEMI          |                                |      1 |   7292M|     67 |00:07:24.18 |      20M|    111K|      0 |  3683K|  1474K|   81M (0)|
|*  3 |    INDEX FAST FULL SCAN         | XIF29NC_OBJECTS                |      1 |     99M|  37357 |00:00:00.95 |   19500 |  19477 |      0 |       |       |          |
|   4 |    NESTED LOOPS                 |                                |      1 |     32G|    110 |00:07:23.11 |      20M|  92137 |      0 |       |       |          |
|   5 |     NESTED LOOPS                |                                |      1 |   1629M|   3925K|00:01:08.63 |    1051K|  92137 |      0 |       |       |          |
|   6 |      SORT UNIQUE                |                                |      1 |   1086 |   7736 |00:00:00.10 |     101 |     94 |      0 |   478K|   448K|  424K (0)|!1
|*  7 |       VIEW                      | index$_join$_004               |      1 |   1086 |   7736 |00:00:00.09 |     101 |     94 |      0 |       |       |          |!1
|*  8 |        HASH JOIN                |                                |      1 |        |   7736 |00:00:00.08 |     101 |     94 |      0 |  1557K|  1557K| 1804K (0)|!1
|*  9 |         INDEX RANGE SCAN        | XIF36NC_ATTRIBUTES             |      1 |   1086 |   7736 |00:00:00.01 |      15 |     13 |      0 |       |       |          |!1
|  10 |         INDEX FAST FULL SCAN    | UNIQUE_LEVEL_ATTR_ID_NCB90F46F |      1 |   1086 |  21055 |00:00:00.02 |      86 |     81 |      0 |       |       |          |!1
|  11 |      TABLE ACCESS BY INDEX ROWID| NC_PARAMS                      |   7736 |   1500K|   3925K|00:01:05.09 |    1051K|  92043 |      0 |       |       |          |!2
|* 12 |       INDEX RANGE SCAN          | XIF26NC_PARAMS                 |   7736 |   1500K|   3925K|00:00:16.42 |   36111 |  21556 |      0 |       |       |          |
|* 13 |     TABLE ACCESS FULL           | OBF_SITE_MAPPING               |   3925K|     20 |    110 |00:06:08.82 |      19M|      0 |      0 |       |       |          |
-------------------------------------------------------------------------------------------------------------------------------------------------------------------------
 
Predicate Information (identified by operation id):
---------------------------------------------------
 
   2 - access("O"."OBJECT_ID"="P"."OBJECT_ID")
   3 - filter("O"."PROJECT_ID"=9147626421313346494)
   7 - filter("A"."ATTR_TYPE_ID"=0)
   8 - access(ROWID=ROWID)
   9 - access("A"."ATTR_TYPE_ID"=0)
  12 - access("P"."ATTR_ID"="A"."ATTR_ID")
  13 - filter("P"."VALUE" LIKE '%'||"MP"."NAME_OLD"||'%')

*/

------------------------------------------------------------------------------------------------------------------------------
;

create table /*+gather_plan_statistic */ obf_test3 --416
as
select /*+ leading(a,p,mp,o) use_hash(a,p) */ 
        p.rowid as row_id,
        p.object_id,
        p.value,
        mp.name_old
from nc_params p
  join OBF_SITE_MAPPING mp
   on p.VALUE like '%' || mp.name_old || '%'
where exists (
  select/*+index(a XIF36NC_ATTRIBUTES)*/ 1
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
/*
-------------------------------------
create table /*+gath
 
Plan hash value: 1155799230
 
--------------------------------------------------------------------------------------------------------------------------------------------------------------
| Id  | Operation                        | Name               | Starts | E-Rows | A-Rows |   A-Time   | Buffers | Reads  | Writes |  OMem |  1Mem | Used-Mem |
--------------------------------------------------------------------------------------------------------------------------------------------------------------
|   0 | CREATE TABLE STATEMENT           |                    |      1 |        |      0 |00:06:56.82 |      19M|  98936 |      1 |       |       |          |
|   1 |  LOAD AS SELECT                  |                    |      1 |        |      0 |00:06:56.82 |      19M|  98936 |      1 |   270K|   270K|  270K (0)|
|*  2 |   HASH JOIN RIGHT SEMI           |                    |      1 |   7292M|     67 |00:06:56.82 |      19M|  98936 |      0 |  3683K|  1474K|   81M (0)|
|*  3 |    INDEX FAST FULL SCAN          | XIF29NC_OBJECTS    |      1 |     99M|  37357 |00:00:00.95 |   19500 |  19477 |      0 |       |       |          |
|   4 |    NESTED LOOPS                  |                    |      1 |     32G|    110 |00:06:55.74 |      19M|  79459 |      0 |       |       |          |
|*  5 |     HASH JOIN                    |                    |      1 |   1629M|   3926K|00:00:27.00 |   80068 |  79459 |      0 |  1645K|  1645K| 1790K (0)|
|   6 |      SORT UNIQUE                 |                    |      1 |   1086 |   7736 |00:00:00.03 |     606 |      2 |      0 |   478K|   448K|  424K (0)|
|   7 |       TABLE ACCESS BY INDEX ROWID| NC_ATTRIBUTES      |      1 |   1086 |   7736 |00:00:00.02 |     606 |      2 |      0 |       |       |          |
|*  8 |        INDEX RANGE SCAN          | XIF36NC_ATTRIBUTES |      1 |   1086 |   7736 |00:00:00.01 |      15 |      0 |      0 |       |       |          |
|   9 |      TABLE ACCESS FULL           | NC_PARAMS          |      1 |   6000M|     12M|00:00:06.88 |   79462 |  79457 |      0 |       |       |          |
|* 10 |     TABLE ACCESS FULL            | OBF_SITE_MAPPING   |   3926K|     20 |    110 |00:06:22.99 |      19M|      0 |      0 |       |       |          |
--------------------------------------------------------------------------------------------------------------------------------------------------------------
 
Predicate Information (identified by operation id):
---------------------------------------------------
 
   2 - access("O"."OBJECT_ID"="P"."OBJECT_ID")
   3 - filter("O"."PROJECT_ID"=9147626421313346494)
   5 - access("P"."ATTR_ID"="A"."ATTR_ID")
   8 - access("A"."ATTR_TYPE_ID"=0)
  10 - filter("P"."VALUE" LIKE '%'||"MP"."NAME_OLD"||'%')
 
*/


------------------------------------------------------------------------------------------------------------------------------
create table /*+ gather_plan_statistic*/ obf_test5 -->20min
as
select /*+ no_merge(t) leading(mp,t) use_nl(mp,t) use_hash(t,o)  */ 
        t.*,mp.name_old
from (
select /*+ no_merge leading(a,p) use_hash(p,a) index(a XIF36NC_ATTRIBUTES)*/  
        p.rowid as row_id,
        p.object_id,
        p.value
       -- mp.name_old
from nc_params p
  join nc_attributes a
    on p.attr_id +0 = a.attr_id 
    and a.ATTR_TYPE_ID = 0
)t
 join OBF_SITE_MAPPING mp
   on t.VALUE like '%' || mp.name_old || '%'
where exists (
  select /*+ index_ffs(o XIF29NC_OBJECTS) */ 1
  from nc_objects o
  where o.object_id = t.object_id
  and o.project_id = 9147626421313346494
  --and rownum = 1
)
;
------------------------------------------------------------------------------------------------------------------------------
create table /*+ gather_plan_statistic*/ obf_test5 -->54min
as
select /*+ NO_USE_MERGE(t,o) no_merge(t) leading(mp,t) use_nl(mp,t) use_hash(t,o)  */ 
        t.*,mp.name_old
from (
select /*+ no_merge leading(a,p) use_hash(p,a) index(a XIF36NC_ATTRIBUTES)*/  
        p.rowid as row_id,
        p.object_id,
        p.value
       -- mp.name_old
from nc_params p
  join nc_attributes a
    on p.attr_id +0 = a.attr_id 
    and a.ATTR_TYPE_ID = 0
)t
 join OBF_SITE_MAPPING mp
   on t.VALUE like '%' || mp.name_old || '%'
where exists (
  select /*+ index_ffs(o XIF29NC_OBJECTS) cardinality(o,1000) */ 1
  from nc_objects o
  where o.object_id = t.object_id
  and o.project_id = 9147626421313346494
  --and rownum = 1
)
;
/*


*/

------------------------------------------------------------------------------------------------------------------------------
;


select *
from NC_ATTRIBUTES
where ATTR_TYPE_ID = 0
;

select *
from nc_params
;
--222sec
begin

for rec in (
  select  --o.name,
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
end;

;
select *
from OBF_SITE_MAPPING
;
Modify names by substituting  Location names accordingly to the site_mapping table (EC101/002/CTA03-EC101/017/M0401-64S/MS/834 	-> EC101/002/ACA03-EC101/017/AZB01-64S/MS/834) 