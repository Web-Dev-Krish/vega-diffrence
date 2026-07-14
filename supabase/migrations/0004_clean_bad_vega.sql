-- Deletes previously-inserted garbage rows (vega values in the millions/
-- billions range from the corrupt-data bug) so old bad points stop
-- flattening/skewing the chart, and adds a DB-level guard so it can't
-- happen again regardless of which broker/function inserts a row.

delete from option_ticks
where abs(ce_vega) > 1000 or abs(pe_vega) > 1000;

alter table option_ticks drop constraint if exists option_ticks_vega_sane;
alter table option_ticks add constraint option_ticks_vega_sane
  check (abs(ce_vega) <= 1000 and abs(pe_vega) <= 1000);
