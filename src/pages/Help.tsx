import { HelpCircle, Book, MessageCircle, Phone, Mail, ExternalLink } from 'lucide-react';

export function Help() {
  const faqs = [
    {
      question: 'How do I create a new task?',
      answer: 'Click the "Add Task" button on the Task Board page. Fill in the task details including title, description, priority, and assignee.'
    },
    {
      question: 'How do I change my password?',
      answer: 'Go to Settings > Security. Enter your current password and new password, then click "Update Password".'
    },
    {
      question: 'Can I change my notification preferences?',
      answer: 'Yes! Visit Settings > Notifications to customize your email and push notification preferences.'
    },
    {
      question: 'How do I use the team chat?',
      answer: 'Click the "Team Chat" button in the navigation bar. You can send messages, share files, and communicate with your team in real-time.'
    }
  ];

  const resources = [
    {
      title: 'User Guide',
      description: 'Complete documentation of all features and functionalities',
      icon: Book,
      link: '#'
    },
    {
      title: 'Video Tutorials',
      description: 'Step-by-step video guides for common tasks',
      icon: ExternalLink,
      link: '#'
    },
    {
      title: 'Community Forum',
      description: 'Connect with other users and share knowledge',
      icon: MessageCircle,
      link: '#'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <HelpCircle className="h-12 w-12 text-indigo-600 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-gray-900">Help & Support</h1>
        <p className="mt-2 text-lg text-gray-600">How can we help you today?</p>
      </div>

      {/* Search */}
      <div className="max-w-2xl mx-auto mb-12">
        <div className="relative">
          <input
            type="text"
            placeholder="Search for help..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          />
          <button className="absolute right-3 top-3 text-gray-400 hover:text-gray-600">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Resources */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {resources.map((resource, index) => (
          <a
            key={index}
            href={resource.link}
            className="block p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            <resource.icon className="h-8 w-8 text-indigo-600 mb-3" />
            <h3 className="text-lg font-medium text-gray-900">{resource.title}</h3>
            <p className="mt-2 text-sm text-gray-600">{resource.description}</p>
          </a>
        ))}
      </div>

      {/* FAQs */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
        <div className="space-y-6">
          {faqs.map((faq, index) => (
            <div key={index} className="border-b border-gray-200 pb-6 last:border-0">
              <h3 className="text-lg font-medium text-gray-900 mb-2">{faq.question}</h3>
              <p className="text-gray-600">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Contact Support */}
      <div className="bg-indigo-50 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Still Need Help?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <a href="#" className="flex items-center p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <Phone className="h-6 w-6 text-indigo-600 mr-3" />
            <div>
              <h3 className="font-medium text-gray-900">Phone Support</h3>
              <p className="text-sm text-gray-600">+1 (555) 123-4567</p>
            </div>
          </a>
          <a href="#" className="flex items-center p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <Mail className="h-6 w-6 text-indigo-600 mr-3" />
            <div>
              <h3 className="font-medium text-gray-900">Email Support</h3>
              <p className="text-sm text-gray-600">support@zidio.com</p>
            </div>
          </a>
          <a href="#" className="flex items-center p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <MessageCircle className="h-6 w-6 text-indigo-600 mr-3" />
            <div>
              <h3 className="font-medium text-gray-900">Live Chat</h3>
              <p className="text-sm text-gray-600">Available 24/7</p>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}