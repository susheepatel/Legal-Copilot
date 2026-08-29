import React, { useState } from 'react';
import { 
  CheckSquare, 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  User, 
  Briefcase, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Trash2,
  X
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { Priority, Task, TaskStatus } from '../../types';

interface TasksViewProps {
  onSelectCase: (caseId: string) => void;
}

export const TasksView: React.FC<TasksViewProps> = ({ onSelectCase }) => {
  const { tasks, cases, addTask, updateTaskStatus, deleteTask } = useData();
  const { user } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [isAddingTask, setIsAddingTask] = useState(false);

  // New task form fields
  const [taskTitle, setTaskTitle] = useState('');
  const [selectedCaseId, setSelectedCaseId] = useState(cases[0]?.id || '');
  const [assignedLawyerName, setAssignedLawyerName] = useState(user?.full_name || 'Adv. Rajesh Verma');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');

  const filteredTasks = tasks.filter(t => {
    const matchesSearch = 
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.case_title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.assigned_to_name?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || t.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle) return;

    await addTask({
      case_id: selectedCaseId || undefined,
      assigned_to: user?.id,
      assigned_to_name: assignedLawyerName,
      title: taskTitle,
      due_date: dueDate ? new Date(dueDate).toISOString() : undefined,
      status: 'pending',
      priority,
    });

    setIsAddingTask(false);
    setTaskTitle('');
    setDueDate('');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold text-white">Tasks, Deadlines & Action Items</h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 font-semibold">
              {tasks.filter(t => t.status !== 'completed').length} Pending
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Assign legal drafting, court filings, rejoinder deadlines, and briefing notes to chamber advocates
          </p>
        </div>

        <button
          onClick={() => setIsAddingTask(true)}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-4 py-2.5 rounded-xl text-xs sm:text-sm shadow-lg shadow-indigo-500/20 flex items-center justify-center space-x-2 transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add Action Item</span>
        </button>
      </div>

      {/* Toolbar Filters */}
      <div className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-2xl p-4 shadow-xl space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks, dockets, advocates..."
              className="w-full bg-slate-900/60 border border-slate-700/50 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-slate-900/60 border border-slate-700/50 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="all">All Statuses (Pending, In-Progress, Completed)</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In-Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full bg-slate-900/60 border border-slate-700/50 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="all">All Priorities</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Task List */}
      {filteredTasks.length === 0 ? (
        <div className="text-center py-16 bg-slate-800/30 backdrop-blur-md rounded-2xl border border-slate-700/50 p-8">
          <CheckSquare className="w-12 h-12 text-slate-500 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">No Tasks Found</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto mt-1 mb-5">
            Add task assignments for court filings, client notices, or evidence collation.
          </p>
          <button
            onClick={() => setIsAddingTask(true)}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-4 py-2.5 rounded-xl text-xs cursor-pointer inline-flex items-center space-x-2 shadow-lg shadow-indigo-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Create Action Item</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTasks.map((t) => {
            const isCompleted = t.status === 'completed';
            const isUrgent = t.priority === 'urgent';
            const isHigh = t.priority === 'high';

            return (
              <div
                key={t.id}
                className={`p-4 rounded-2xl border backdrop-blur-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  isCompleted
                    ? 'bg-slate-900/30 border-slate-700/30 opacity-70'
                    : 'bg-slate-800/40 border-slate-700/50 hover:bg-slate-800/70 hover:border-indigo-500/40 shadow-sm'
                }`}
              >
                <div className="flex items-start space-x-3.5 min-w-0">
                  <button
                    onClick={() => updateTaskStatus(t.id, isCompleted ? 'pending' : 'completed')}
                    className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-colors cursor-pointer mt-0.5 shrink-0 ${
                      isCompleted
                        ? 'bg-emerald-500 border-emerald-500 text-slate-950'
                        : 'border-slate-600 hover:border-emerald-500 text-transparent'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </button>

                  <div className="min-w-0">
                    <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                      <p className={`text-xs md:text-sm font-semibold ${isCompleted ? 'text-slate-500 line-through' : 'text-white'}`}>
                        {t.title}
                      </p>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase ${
                        isUrgent
                          ? 'bg-rose-500/10 text-rose-300 border border-rose-500/30'
                          : isHigh
                          ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                          : 'bg-slate-800/80 text-slate-400 border border-slate-700/50'
                      }`}>
                        {t.priority}
                      </span>
                    </div>

                    <div className="flex items-center space-x-3 text-xs text-slate-400 mt-1 flex-wrap">
                      {t.case_title && (
                        <span 
                          onClick={() => t.case_id && onSelectCase(t.case_id)}
                          className="text-indigo-300 hover:underline cursor-pointer font-medium truncate max-w-xs"
                        >
                          {t.case_title}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-slate-500" />
                        {t.assigned_to_name || 'Counsel'}
                      </span>
                      {t.due_date && (
                        <span className="flex items-center gap-1 text-slate-400">
                          <Calendar className="w-3.5 h-3.5 text-slate-500" />
                          Due: {new Date(t.due_date).toLocaleDateString('en-IN')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center">
                  <select
                    value={t.status}
                    onChange={(e) => updateTaskStatus(t.id, e.target.value as TaskStatus)}
                    className="bg-slate-900/80 border border-slate-700/50 text-slate-300 rounded-xl px-2.5 py-1 text-xs focus:outline-none cursor-pointer"
                  >
                    <option value="pending">Pending</option>
                    <option value="in_progress">In-Progress</option>
                    <option value="completed">Completed</option>
                  </select>

                  <button
                    onClick={() => deleteTask(t.id)}
                    className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors cursor-pointer"
                    title="Delete Task"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE TASK MODAL */}
      {isAddingTask && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900/90 backdrop-blur-2xl border border-slate-700/50 rounded-2xl max-w-lg w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-700/50">
              <h3 className="text-base font-bold text-white">Create Practice Action Item</h3>
              <button onClick={() => setIsAddingTask(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Task Title / Action Item *</label>
                <input
                  type="text"
                  required
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder="e.g. Draft Written Statement & serve copy on Standing Counsel"
                  className="w-full bg-slate-900/60 border border-slate-700/50 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Link to Case Matter</label>
                <select
                  value={selectedCaseId}
                  onChange={(e) => setSelectedCaseId(e.target.value)}
                  className="w-full bg-slate-900/60 border border-slate-700/50 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option value="">-- Independent Chamber Task --</option>
                  {cases.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.case_title} ({c.case_number})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Assignee Advocate</label>
                  <input
                    type="text"
                    value={assignedLawyerName}
                    onChange={(e) => setAssignedLawyerName(e.target.value)}
                    placeholder="Advocate Name"
                    className="w-full bg-slate-900/60 border border-slate-700/50 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full bg-slate-900/60 border border-slate-700/50 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Priority Level</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as Priority)}
                  className="w-full bg-slate-900/60 border border-slate-700/50 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option value="urgent">Urgent (Court Listing / Limitation imminent)</option>
                  <option value="high">High (Filing deadline this week)</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low (Routine clerical / archive)</option>
                </select>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-700/50">
                <button
                  type="button"
                  onClick={() => setIsAddingTask(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white cursor-pointer font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl text-xs shadow-lg shadow-indigo-500/20 cursor-pointer"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
