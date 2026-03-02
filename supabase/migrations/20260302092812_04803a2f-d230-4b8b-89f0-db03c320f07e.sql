
-- Create verification-documents storage bucket (private)
INSERT INTO storage.buckets (id, name, public)
VALUES ('verification-documents', 'verification-documents', false)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for baby-content bucket
CREATE POLICY "Owners can upload baby content"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'baby-content'
  AND auth.uid() IS NOT NULL
);

CREATE POLICY "Owners can view own baby content"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'baby-content'
  AND auth.uid() IS NOT NULL
);

CREATE POLICY "Owners can delete own baby content"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'baby-content'
  AND auth.uid() IS NOT NULL
);

-- RLS policies for verification-documents bucket
CREATE POLICY "Caregivers upload own verification docs"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'verification-documents'
  AND auth.uid() IS NOT NULL
);

CREATE POLICY "Caregivers view own verification docs"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'verification-documents'
  AND (
    auth.uid() IS NOT NULL
    AND (
      (storage.foldername(name))[1] = auth.uid()::text
      OR public.has_role('admin'::public.app_role)
    )
  )
);

CREATE POLICY "Admins view all verification docs"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'verification-documents'
  AND public.has_role('admin'::public.app_role)
);
