-- Test what the CURRENT normalization functions return for different value formats
-- This will tell us if migration 118 has been applied

-- Test 1: Test normalize_mcq_value with different formats
SELECT 
  'normalize_mcq_value tests' as test_type,
  'plain string "high"' as input_format,
  public.normalize_mcq_value('"high"'::jsonb) as result
UNION ALL
SELECT 
  'normalize_mcq_value tests',
  'object {kind: mcq, value: high}',
  public.normalize_mcq_value('{"kind":"mcq","value":"high"}'::jsonb)
UNION ALL
SELECT 
  'normalize_mcq_value tests',
  'object {value: high}',
  public.normalize_mcq_value('{"value":"high"}'::jsonb)
UNION ALL
SELECT 
  'normalize_likert_value tests',
  'numeric 4',
  public.normalize_likert_value('4'::jsonb)
UNION ALL
SELECT 
  'normalize_likert_value tests',
  'object {kind: likert, value: 4}',
  public.normalize_likert_value('{"kind":"likert","value":4}'::jsonb)
UNION ALL
SELECT 
  'normalize_bipolar_value tests',
  'numeric 3',
  public.normalize_bipolar_value('3'::jsonb)
UNION ALL
SELECT 
  'normalize_bipolar_value tests',
  'object {kind: bipolar, value: 3}',
  public.normalize_bipolar_value('{"kind":"bipolar","value":3}'::jsonb);

