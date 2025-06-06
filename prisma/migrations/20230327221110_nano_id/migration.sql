-- Create nanoid function
CREATE OR REPLACE FUNCTION nanoid(size integer DEFAULT 21)
RETURNS text AS $$
DECLARE
    id text := '';
    i integer := 0;
    alphabet text := '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    alphabet_length integer := length(alphabet);
BEGIN
    WHILE i < size LOOP
        id := id || substr(alphabet, floor(random() * alphabet_length + 1)::integer, 1);
        i := i + 1;
    END LOOP;
    RETURN id;
END;
$$ LANGUAGE plpgsql; 