
-- Function to check if a column exists in a table
CREATE OR REPLACE FUNCTION public.column_exists(t_name TEXT, c_name TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public'
      AND table_name = t_name
      AND column_name = c_name
  ) INTO result;
  
  RETURN result;
END;
$$;

-- Function to execute SQL statements from edge functions
CREATE OR REPLACE FUNCTION public.execute_sql(sql_query TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE sql_query;
END;
$$;
