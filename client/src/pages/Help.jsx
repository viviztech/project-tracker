import { useState } from 'react';
import { toast } from 'react-toastify';
import { FaQuestionCircle, FaEnvelope, FaPhone } from 'react-icons/fa';
import axios from 'axios';

const Help = () => {
    const [feedback, setFeedback] = useState({
        name: '',
        email: '',
        subject: '',
        message: '',
        type: 'General'
    });
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await axios.post('/api/feedback', feedback, { withCredentials: true });
            toast.success('Feedback submitted successfully! We will get back to you soon.');
            setFeedback({ name: '', email: '', subject: '', message: '', type: 'General' });
        } catch (error) {
            toast.error('Failed to submit feedback. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const faqs = [
        {
            question: 'How do I create a new project?',
            answer: 'Navigate to the Projects page and click the "New Project" button. Fill in the required details including project name, description, dates, and assign team members.'
        },
        {
            question: 'How can I add tasks to а project?',
            answer: 'Go to the Project Details page and click the "Add Task" button. You can assign tasks to team members, set priorities, and due dates.'
        },
        {
            question: 'What do the different project statuses mean?',
            answer: 'Planning: Project is being planned. In Progress: Active work is happening. On Hold: Temporarily paused. Completed: Project has finished.'
        },
        {
            question: 'How do I assign team members?',
            answer: 'When creating or editing a project, you can select team members from the available users. Only admins and project managers can modify team assignments.'
        },
        {
            question: 'Can I export project data?',
            answer: 'Yes! Go to the Dashboard and click "Export Projects (CSV)" to download all project data in CSV format.'
        },
        {
            question: 'How do I track milestones?',
            answer: 'In the Project Details page, navigate to the "Milestones" tab where you can create, edit, and track milestone completion.'
        }
    ];

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-6">Help & Support</h1>

            {/* FAQ Section */}
            <div className="bg-white p-6 rounded shadow mb-6">
                <div className="flex items-center mb-4">
                    <FaQuestionCircle className="text-blue-500 text-2xl mr-3" />
                    <h2 className="text-2xl font-bold">Frequently Asked Questions</h2>
                </div>
                <div className="space-y-4">
                    {faqs.map((faq, index) => (
                        <div key={index} className="border-b pb-4 last:border-0">
                            <h3 className="font-bold text-lg text-gray-800 mb-2">{faq.question}</h3>
                            <p className="text-gray-600">{faq.answer}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-blue-50 p-6 rounded shadow">
                    <div className="flex items-center mb-4">
                        <FaEnvelope className="text-blue-500 text-xl mr-3" />
                        <h3 className="text-xl font-bold">Email Support</h3>
                    </div>
                    <p className="text-gray-700 mb-2">For technical issues or general inquiries:</p>
                    <a href="mailto:support@projecttracker.com" className="text-blue-600 hover:underline font-medium">
                        support@projecttracker.com
                    </a>
                </div>

                <div className="bg-green-50 p-6 rounded shadow">
                    <div className="flex items-center mb-4">
                        <FaPhone className="text-green-500 text-xl mr-3" />
                        <h3 className="text-xl font-bold">Phone Support</h3>
                    </div>
                    <p className="text-gray-700 mb-2">Available Monday-Friday, 9 AM - 5 PM:</p>
                    <a href="tel:+11234567890" className="text-green-600 hover:underline font-medium">
                        +1 (123) 456-7890
                    </a>
                </div>
            </div>

            {/* Feedback Form */}
            <div className="bg-white p-6 rounded shadow">
                <h2 className="text-2xl font-bold mb-4">Submit Feedback</h2>
                <p className="text-gray-600 mb-6">
                    Have a suggestion or found an issue? We'd love to hear from you!
                </p>

                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Your Name *</label>
                            <input
                                type="text"
                                value={feedback.name}
                                onChange={(e) => setFeedback({ ...feedback, name: e.target.value })}
                                className="w-full border rounded px-3 py-2"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Email *</label>
                            <input
                                type="email"
                                value={feedback.email}
                                onChange={(e) => setFeedback({ ...feedback, email: e.target.value })}
                                className="w-full border rounded px-3 py-2"
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Type *</label>
                            <select
                                value={feedback.type}
                                onChange={(e) => setFeedback({ ...feedback, type: e.target.value })}
                                className="w-full border rounded px-3 py-2"
                            >
                                <option>General</option>
                                <option>Bug Report</option>
                                <option>Feature Request</option>
                                <option>Technical Issue</option>
                                <option>Complaint</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Subject *</label>
                            <input
                                type="text"
                                value={feedback.subject}
                                onChange={(e) => setFeedback({ ...feedback, subject: e.target.value })}
                                className="w-full border rounded px-3 py-2"
                                required
                            />
                        </div>
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-2">Message *</label>
                        <textarea
                            value={feedback.message}
                            onChange={(e) => setFeedback({ ...feedback, message: e.target.value })}
                            className="w-full border rounded px-3 py-2"
                            rows="6"
                            required
                            placeholder="Please provide as much detail as possible..."
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={submitting}
                        className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        {submitting ? 'Submitting...' : 'Submit Feedback'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Help;
