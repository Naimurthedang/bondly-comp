
-- Add unique constraint for typing upsert
ALTER TABLE public.typing_status ADD CONSTRAINT typing_status_booking_user_unique UNIQUE (booking_id, user_id);
