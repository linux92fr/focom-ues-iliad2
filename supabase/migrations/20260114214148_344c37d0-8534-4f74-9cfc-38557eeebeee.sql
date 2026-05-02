-- Create events table for syndical agenda
CREATE TABLE public.events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  location TEXT,
  event_date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  event_type TEXT DEFAULT 'reunion',
  author_id UUID NOT NULL,
  published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT events_title_length CHECK (char_length(title) <= 200),
  CONSTRAINT events_description_length CHECK (description IS NULL OR char_length(description) <= 2000),
  CONSTRAINT events_location_length CHECK (location IS NULL OR char_length(location) <= 200)
);

-- Enable RLS
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Published events are publicly readable
CREATE POLICY "Published events are publicly readable"
ON public.events FOR SELECT
USING (published = true);

-- Authors can view their own drafts
CREATE POLICY "Authors can view their own event drafts"
ON public.events FOR SELECT
TO authenticated
USING (author_id = auth.uid());

-- Content editors can create events
CREATE POLICY "Content editors can create events"
ON public.events FOR INSERT
TO authenticated
WITH CHECK (is_content_editor(auth.uid()) AND author_id = auth.uid());

-- Content editors can update their events
CREATE POLICY "Content editors can update their events"
ON public.events FOR UPDATE
TO authenticated
USING (is_content_editor(auth.uid()) AND author_id = auth.uid());

-- Admins can manage all events
CREATE POLICY "Admins can manage all events"
ON public.events FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'));

-- Add trigger for updated_at
CREATE TRIGGER update_events_updated_at
BEFORE UPDATE ON public.events
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();