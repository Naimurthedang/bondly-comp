
CREATE POLICY "Users can update own sessions" 
ON public.learning_sessions 
FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM public.babies 
  WHERE babies.id = learning_sessions.baby_id 
  AND babies.user_id = auth.uid()
));

CREATE POLICY "Users can delete own sessions" 
ON public.learning_sessions 
FOR DELETE
USING (EXISTS (
  SELECT 1 FROM public.babies 
  WHERE babies.id = learning_sessions.baby_id 
  AND babies.user_id = auth.uid()
));
