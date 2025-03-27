/*
  # Initial Schema Setup for Task Management System

  1. New Tables
    - roles
      - id (uuid, primary key)
      - name (text)
      - permissions (text[])
    - user_roles
      - user_id (uuid, references auth.users)
      - role_id (uuid, references roles)
    - tasks
      - id (uuid, primary key)
      - title (text)
      - description (text)
      - status (text)
      - priority (text)
      - created_by (uuid, references auth.users)
      - assigned_to (uuid, references auth.users)
      - due_date (timestamptz)
      - created_at (timestamptz)
      - updated_at (timestamptz)
    - comments
      - id (uuid, primary key)
      - task_id (uuid, references tasks)
      - user_id (uuid, references auth.users)
      - content (text)
      - created_at (timestamptz)
    - notifications
      - id (uuid, primary key)
      - user_id (uuid, references auth.users)
      - type (text)
      - content (text)
      - read (boolean)
      - created_at (timestamptz)
    - attachments
      - id (uuid, primary key)
      - task_id (uuid, references tasks)
      - user_id (uuid, references auth.users)
      - file_name (text)
      - file_url (text)
      - created_at (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for role-based access
    - Add policies for task visibility
*/

-- Create roles table
CREATE TABLE roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  permissions text[] NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create user_roles table
CREATE TABLE user_roles (
  user_id uuid REFERENCES auth.users NOT NULL,
  role_id uuid REFERENCES roles NOT NULL,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, role_id)
);

-- Create tasks table
CREATE TABLE tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'todo',
  priority text NOT NULL DEFAULT 'medium',
  created_by uuid REFERENCES auth.users NOT NULL,
  assigned_to uuid REFERENCES auth.users,
  due_date timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create comments table
CREATE TABLE comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid REFERENCES tasks ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create notifications table
CREATE TABLE notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  type text NOT NULL,
  content text NOT NULL,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create attachments table
CREATE TABLE attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid REFERENCES tasks ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users NOT NULL,
  file_name text NOT NULL,
  file_url text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Roles are viewable by authenticated users"
  ON roles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "User roles are viewable by authenticated users"
  ON user_roles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Tasks are viewable by team members"
  ON tasks FOR SELECT
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT user_id FROM user_roles
      WHERE role_id IN (
        SELECT id FROM roles
        WHERE 'view_tasks' = ANY(permissions)
      )
    )
  );

CREATE POLICY "Tasks are editable by assigned users or admins"
  ON tasks FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = assigned_to OR
    auth.uid() IN (
      SELECT user_id FROM user_roles
      WHERE role_id IN (
        SELECT id FROM roles
        WHERE 'manage_tasks' = ANY(permissions)
      )
    )
  );

CREATE POLICY "Comments are viewable by task viewers"
  ON comments FOR SELECT
  TO authenticated
  USING (
    task_id IN (
      SELECT id FROM tasks
      WHERE auth.uid() = created_by OR auth.uid() = assigned_to
    )
  );

CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view task attachments"
  ON attachments FOR SELECT
  TO authenticated
  USING (
    task_id IN (
      SELECT id FROM tasks
      WHERE auth.uid() = created_by OR auth.uid() = assigned_to
    )
  );

-- Insert default roles
INSERT INTO roles (name, permissions) VALUES
  ('admin', ARRAY['manage_tasks', 'manage_users', 'view_reports', 'manage_roles']),
  ('manager', ARRAY['manage_tasks', 'view_reports', 'assign_tasks']),
  ('member', ARRAY['view_tasks', 'create_tasks', 'comment_tasks']);

-- Create function to handle task updates
CREATE OR REPLACE FUNCTION handle_task_update()
RETURNS TRIGGER AS $$
BEGIN
  -- Create notification for task assignment
  IF NEW.assigned_to IS DISTINCT FROM OLD.assigned_to THEN
    INSERT INTO notifications (user_id, type, content)
    VALUES (
      NEW.assigned_to,
      'task_assigned',
      format('You have been assigned to task: %s', NEW.title)
    );
  END IF;

  -- Create notification for due date approaching (24 hours)
  IF NEW.due_date IS NOT NULL AND
     NEW.due_date - INTERVAL '24 hours' <= NOW() AND
     NOT EXISTS (
       SELECT 1 FROM notifications
       WHERE user_id = NEW.assigned_to
         AND type = 'due_date_reminder'
         AND task_id = NEW.id
     )
  THEN
    INSERT INTO notifications (user_id, type, content)
    VALUES (
      NEW.assigned_to,
      'due_date_reminder',
      format('Task "%s" is due in 24 hours', NEW.title)
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for task updates
CREATE TRIGGER task_update_trigger
  AFTER UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION handle_task_update();