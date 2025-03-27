import  { useState, useEffect } from 'react';
import { 
  Plus, MoreVertical, Shield, Bell, BarChart3, MessageSquare, 
  Paperclip, Clock, CheckCircle, Users, Send, X
} from 'lucide-react';
import { AddTaskModal } from './AddTaskModal';
import { ChatSystem } from './ChatSystem';
import { useStore } from '../lib/store';
import { useAuth } from '../contexts/AuthContext';
import { format, isAfter, parseISO, addDays } from 'date-fns';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

type Task = {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  status: 'todo' | 'in-progress' | 'done';
  assignee: string;
  dueDate: string;
};

const initialTasks: Task[] = [
  {
    id: '1',
    title: 'Design System Implementation',
    description: 'Create a comprehensive design system for the platform',
    priority: 'high',
    status: 'todo',
    assignee: 'Sarah Chen',
    dueDate: '2024-03-25'
  },
  {
    id: '2',
    title: 'User Authentication Flow',
    description: 'Implement secure login and registration system with OAuth integration, two-factor authentication, and password recovery. Features include: social login providers (Google, GitHub), email verification, session management, and role-based access control.',
    priority: 'high',
    status: 'in-progress',
    assignee: 'Mike Johnson',
    dueDate: '2024-03-20'
  },
  {
    id: '3',
    title: 'API Documentation',
    description: 'Create comprehensive API documentation including: endpoint specifications, authentication methods, request/response examples, error handling, rate limiting details, versioning strategy, and integration guides. Include Swagger/OpenAPI specifications and interactive API testing environment.',
    priority: 'medium',
    status: 'done',
    assignee: 'Alex Kumar',
    dueDate: '2024-03-15'
  },
  {
    id: '4',
    title: 'OAuth Provider Integration',
    description: 'Add support for Google, GitHub, and Microsoft OAuth providers. Implement token management, refresh flows, and user profile synchronization.',
    priority: 'high',
    status: 'in-progress',
    assignee: 'Mike Johnson',
    dueDate: '2024-03-22'
  },
  {
    id: '5',
    title: 'API Rate Limiting Implementation',
    description: 'Design and implement rate limiting system with tiered quotas, token bucket algorithm, and usage analytics. Include Redis cache integration and rate limit headers.',
    priority: 'medium',
    status: 'done',
    assignee: 'Alex Kumar',
    dueDate: '2024-03-10'
  },
  {
    id: '6',
    title: 'API Versioning Strategy',
    description: 'Develop API versioning strategy including URL versioning, header-based versioning, and deprecation policies. Create migration guides and backwards compatibility layer.',
    priority: 'medium',
    status: 'done',
    assignee: 'Alex Kumar',
    dueDate: '2024-03-12'
  }
];

const rolePermissions = [
  {
    name: 'Task Management',
    permissions: [
      'Create new tasks',
      'Edit task details',
      'Delete tasks',
      'Assign tasks to team members'
    ]
  },
  {
    name: 'Team Collaboration',
    permissions: [
      'View team dashboard',
      'Participate in discussions',
      'Share files and documents',
      'Mention team members'
    ]
  },
  {
    name: 'Project Administration',
    permissions: [
      'Manage project settings',
      'Create project reports',
      'Set task priorities',
      'Configure notifications'
    ]
  }
];

export default function TaskBoard() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const { userRole, notifications, unreadCount } = useStore();
  const { user } = useAuth();

  const columns = [
    { id: 'todo', title: 'To Do', color: 'bg-gray-100' },
    { id: 'in-progress', title: 'In Progress', color: 'bg-blue-50' },
    { id: 'done', title: 'Done', color: 'bg-green-50' }
  ];

  useEffect(() => {
    if (selectedTask) {
      loadComments(selectedTask.id);
    }
  }, [selectedTask]);

  const loadComments = async (taskId: string) => {
    try {
      const { data, error } = await supabase
        .from('task_comments')
        .select(`
          id,
          content,
          created_at,
          user:users (
            email
          )
        `)
        .eq('task_id', taskId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error loading comments:', error);
        toast.error('Failed to load comments');
        return;
      }

      setComments(data || []);
    } catch (error) {
      console.error('Error in loadComments:', error);
      toast.error('Failed to load comments');
    }
  };

  const addComment = async () => {
    if (!selectedTask || !newComment.trim() || !user) return;

    try {
      const { error } = await supabase
        .from('task_comments')
        .insert({
          task_id: selectedTask.id,
          user_id: user.id,
          content: newComment.trim()
        });

      if (error) throw error;

      setNewComment('');
      await loadComments(selectedTask.id);
      toast.success('Comment added successfully');
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment');
    }
  };

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleAddTask = (newTask: Omit<Task, 'id'>) => {
    const task: Task = {
      ...newTask,
      id: Math.random().toString(36).substr(2, 9)
    };
    setTasks([...tasks, task]);
    toast.success('Task added successfully');
  };

  const getUpcomingDeadlines = () => {
    const today = new Date();
    const nextWeek = addDays(today, 7);
    
    return tasks
      .filter(task => {
        const dueDate = parseISO(task.dueDate);
        return isAfter(dueDate, today) && !isAfter(dueDate, nextWeek);
      })
      .sort((a, b) => parseISO(a.dueDate).getTime() - parseISO(b.dueDate).getTime());
  };

  return (
    <div className="h-full space-y-6 md:space-y-8">
      {/* Role and Permissions Section */}
      <div className="bg-white rounded-lg shadow-sm p-4 md:p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Shield className="h-5 w-5 md:h-6 md:w-6 text-indigo-600" />
            <h2 className="text-base md:text-lg font-semibold">Role & Permissions</h2>
          </div>
          <span className="px-2 py-1 md:px-3 md:py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs md:text-sm font-medium">
            {userRole?.name || 'User'}
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {rolePermissions.map((section) => (
            <div key={section.name} className="space-y-3">
              <h3 className="text-sm font-medium text-gray-900">{section.name}</h3>
              <div className="space-y-2">
                {section.permissions.map((permission) => (
                  <div key={permission} className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-xs text-gray-600">{permission}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Task Button and Notifications/Deadlines Section */}
      <div className="space-y-4">
        {/* Add Task Button */}
        <div className="flex justify-end">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Task
          </button>
        </div>

        {/* Notifications and Deadlines Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <div className="bg-white rounded-lg shadow-sm p-4 md:p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <Bell className="h-5 w-5 md:h-6 md:w-6 text-orange-600" />
                <h2 className="text-base md:text-lg font-semibold">Recent Notifications</h2>
              </div>
              {unreadCount > 0 && (
                <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs md:text-sm">
                  {unreadCount} new
                </span>
              )}
            </div>
            <div className="space-y-3">
              {notifications.length > 0 ? (
                notifications.slice(0, 3).map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-3 rounded-lg ${
                      notification.read ? 'bg-gray-50' : 'bg-blue-50'
                    }`}
                  >
                    <p className="text-sm text-gray-800">{notification.content}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {format(new Date(notification.created_at), 'MMM d, h:mm a')}
                    </p>
                  </div>
                ))
              ) : (
                <div className="text-center py-6">
                  <Bell className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500">No notifications yet</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4 md:p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Clock className="h-5 w-5 md:h-6 md:w-6 text-red-600" />
              <h2 className="text-base md:text-lg font-semibold">Upcoming Deadlines</h2>
            </div>
            <div className="space-y-3">
              {getUpcomingDeadlines().length > 0 ? (
                getUpcomingDeadlines().map((task) => (
                  <div 
                    key={task.id} 
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                    onClick={() => {
                      setSelectedTask(task);
                      setShowComments(true);
                    }}
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-800">{task.title}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <p className="text-xs text-gray-500">
                          Due: {format(parseISO(task.dueDate), 'MMM d')}
                        </p>
                        <span className="text-xs text-gray-400">•</span>
                        <p className="text-xs text-gray-500">
                          Assigned to: {task.assignee}
                        </p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-6">
                  <Clock className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500">No upcoming deadlines this week</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Progress Analytics */}
      <div className="bg-white rounded-lg shadow-sm p-4 md:p-6">
        <div className="flex items-center space-x-3 mb-4 md:mb-6">
          <BarChart3 className="h-5 w-5 md:h-6 md:w-6 text-purple-600" />
          <h2 className="text-base md:text-lg font-semibold">Task Progress</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {columns.map((column) => {
            const count = tasks.filter((task) => task.status === column.id).length;
            const percentage = (count / tasks.length) * 100;
            return (
              <div key={column.id} className="text-center">
                <div className="mb-2">
                  <span className="text-xl md:text-2xl font-bold text-gray-800">{count}</span>
                  <span className="text-sm text-gray-500 ml-1">tasks</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-indigo-600 rounded-full h-2"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600 mt-1">{column.title}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Task Board */}
      <div>
        <div className="mb-4 md:mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-3 sm:space-y-0">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-900">Task Board</h2>
            <p className="mt-1 text-sm text-gray-500">Manage and track your team's tasks</p>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Task
          </button>
        </div>

        <div className="flex flex-col md:flex-row md:space-x-4 space-y-4 md:space-y-0">
          {columns.map((column) => (
            <div key={column.id} className="flex-1 min-w-[280px] md:min-w-0">
              <div className={`rounded-t-lg px-4 py-2 ${column.color}`}>
                <h3 className="font-medium text-gray-900">{column.title}</h3>
              </div>
              <div className="mt-2 space-y-3">
                {tasks
                  .filter((task) => task.status === column.id)
                  .map((task) => (
                    <div
                      key={task.id}
                      className="bg-white rounded-lg shadow p-3 md:p-4 cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => {
                        setSelectedTask(task);
                        setShowComments(true);
                      }}
                    >
                      <div className="flex justify-between items-start">
                        <h4 className="text-sm font-medium text-gray-900">{task.title}</h4>
                        <button className="text-gray-400 hover:text-gray-600">
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      </div>
                      <p className="mt-1 text-sm text-gray-500 line-clamp-2">{task.description}</p>
                      <div className="mt-4 flex items-center justify-between">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(
                            task.priority
                          )}`}
                        >
                          {task.priority}
                        </span>
                        <div className="flex items-center space-x-2">
                          <div className="flex -space-x-2">
                            <img
                              className="h-6 w-6 rounded-full ring-2 ring-white"
                              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                                task.assignee
                              )}&background=random`}
                              alt={task.assignee}
                            />
                          </div>
                          <span className="text-sm text-gray-500">
                            {format(new Date(task.dueDate), 'MMM d')}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Comments Modal */}
      {showComments && selectedTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40">
          <div className="bg-white rounded-lg w-full max-w-2xl h-[600px] flex flex-col">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-semibold">{selectedTask.title}</h3>
              <button
                onClick={() => {
                  setShowComments(false);
                  setSelectedTask(null);
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="flex space-x-3">
                  <img
                    className="h-8 w-8 rounded-full"
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                      comment.user.email
                    )}&background=random`}
                    alt=""
                  />
                  <div className="flex-1">
                    <div className="bg-gray-100 rounded-lg p-3">
                      <p className="text-sm font-medium text-gray-900">
                        {comment.user.email.split('@')[0]}
                      </p>
                      <p className="text-sm text-gray-700">{comment.content}</p>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {format(new Date(comment.created_at), 'MMM d, h:mm a')}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 border-t">
              <div className="flex space-x-3">
                <img
                  className="h-8 w-8 rounded-full"
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                    user?.email || ''
                  )}&background=random`}
                  alt=""
                />
                <div className="flex-1">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
                    rows={3}
                  />
                  <div className="mt-2 flex justify-end">
                    <button
                      onClick={addComment}
                      className="bg-indigo-600 text-white rounded-md px-4 py-2 text-sm font-medium hover:bg-indigo-700 transition-colors"
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="flex gap-4 p-2">
  <MessageSquare className="w-6 h-6 text-gray-500" />
  <Paperclip className="w-6 h-6 text-gray-500" />
  <Users className="w-6 h-6 text-gray-500" />
</div>



      <AddTaskModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddTask}
      />

      <ChatSystem isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </div>
  );
}

export { TaskBoard };