CREATE POLICY "Users can update own songs" 
ON public.songs 
FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM public.babies 
  WHERE babies.id = songs.baby_id 
  AND babies.user_id = auth.uid()
));