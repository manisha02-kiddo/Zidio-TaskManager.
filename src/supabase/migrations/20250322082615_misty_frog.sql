/*
  # Add chat attachments support

  1. New Tables
    - `chat_attachments`
      - `id` (uuid, primary key)
      - `message_id` (uuid, references messages)
      - `url` (text)
      - `type` (text)
      - `name` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `chat_attachments` table
    - Add policies for authenticated users
*/

-- Create chat attachments table
CREATE TABLE IF NOT EXISTS chat_attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id uuid REFERENCES messages(id) ON DELETE CASCADE,
  url text NOT NULL,
  type text NOT NULL,
  name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE chat_attachments ENABLE ROW LEVEL SECURITY;

-- Create storage bucket for chat attachments
INSERT INTO storage.buckets (id, name)
VALUES ('chat-attachments', 'chat-attachments')
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies
CREATE POLICY "Chat attachments are viewable by authenticated users"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'chat-attachments');

CREATE POLICY "Users can upload chat attachments"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'chat-attachments' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Set up table policies
CREATE POLICY "Chat attachments are viewable by authenticated users"
ON chat_attachments FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can insert chat attachments"
ON chat_attachments FOR INSERT
TO authenticated
WITH CHECK (true);