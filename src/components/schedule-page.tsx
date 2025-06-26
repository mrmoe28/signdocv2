'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { FileUpload } from '@/components/ui/file-upload';
import { 
  Calendar,
  Clock,
  MapPin,
  User,
  Plus,
  ChevronLeft,
  ChevronRight,
  Filter,
  Search,
  Edit,
  Trash2,
  ExternalLink
} from 'lucide-react';

interface ScheduleEvent {
  id: string;
  title: string;
  customer: string;
  type: 'Installation' | 'Consultation' | 'Maintenance' | 'Follow-up';
  date: string;
  time: string;
  duration: string;
  location: string;
  status: 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled';
  priority: 'High' | 'Medium' | 'Low';
  notes?: string;
  estimatedValue?: number;
  photoUrl?: string;
}



const statusColors = {
  'Scheduled': 'bg-blue-100 text-blue-800',
  'In Progress': 'bg-yellow-100 text-yellow-800',
  'Completed': 'bg-green-100 text-green-800',
  'Cancelled': 'bg-red-100 text-red-800'
};

const priorityColors = {
  'High': 'bg-red-100 text-red-800',
  'Medium': 'bg-yellow-100 text-yellow-800',
  'Low': 'bg-green-100 text-green-800'
};

const typeColors = {
  'Installation': 'bg-purple-100 text-purple-800',
  'Consultation': 'bg-blue-100 text-blue-800',
  'Maintenance': 'bg-orange-100 text-orange-800',
  'Follow-up': 'bg-gray-100 text-gray-800'
};

export function SchedulePage() {
  const { addToast } = useToast();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [showNewEventForm, setShowNewEventForm] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<ScheduleEvent | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [appointments, setAppointments] = useState<ScheduleEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const [newEvent, setNewEvent] = useState({
    title: '',
    customer: '',
    type: 'Installation' as ScheduleEvent['type'],
    date: '',
    time: '',
    duration: '',
    location: '',
    priority: 'Medium' as ScheduleEvent['priority'],
    notes: '',
    estimatedValue: '',
    photo: null as File | null
  });

  // Load appointments on component mount
  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/appointments');
      if (response.ok) {
        const data = await response.json();
        // Convert database format to component format
        const formattedAppointments = data.appointments.map((apt: {
          id: string;
          title: string;
          customer: string;
          type: string;
          date: string;
          time: string;
          duration?: string;
          location?: string;
          status: string;
          priority: string;
          notes?: string;
          estimatedValue?: number;
          photoUrl?: string;
        }) => ({
          id: apt.id,
          title: apt.title,
          customer: apt.customer,
          type: apt.type,
          date: apt.date.split('T')[0], // Convert DateTime to date string
          time: apt.time,
          duration: apt.duration || '',
          location: apt.location || '',
          status: apt.status,
          priority: apt.priority,
          notes: apt.notes || '',
          estimatedValue: apt.estimatedValue || 0,
          photoUrl: apt.photoUrl
        }));
        setAppointments(formattedAppointments);
      } else {
        console.error('Failed to load appointments');
      }
    } catch (error) {
      console.error('Error loading appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = appointments.filter(event => {
    const matchesType = filterType === 'all' || event.type === filterType;
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.location.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    
    return days;
  };

  const getEventsForDate = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return appointments.filter(event => event.date === dateStr);
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleCreateEvent = async () => {
    // Add validation
    if (!newEvent.title || !newEvent.customer || !newEvent.date || !newEvent.time) {
      addToast({
        type: 'warning',
        title: 'Validation Error',
        description: 'Please fill in all required fields (title, customer, date, and time)'
      });
      return;
    }
    
    setSaving(true);
    try {
      // Handle photo upload by converting to base64 (in production, upload to cloud storage)
      let photoUrl = null;
      if (newEvent.photo) {
        const reader = new FileReader();
        photoUrl = await new Promise<string>((resolve) => {
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.readAsDataURL(newEvent.photo!);
        });
      }

      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: newEvent.title,
          customer: newEvent.customer,
          type: newEvent.type,
          date: newEvent.date,
          time: newEvent.time,
          duration: newEvent.duration,
          location: newEvent.location,
          priority: newEvent.priority,
          notes: newEvent.notes,
          estimatedValue: newEvent.estimatedValue ? parseFloat(newEvent.estimatedValue) : null,
          photoUrl: photoUrl
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          addToast({
            type: 'success',
            title: 'Appointment Created',
            description: 'Your appointment has been scheduled successfully!'
          });
          setShowNewEventForm(false);
          setNewEvent({
            title: '',
            customer: '',
            type: 'Installation',
            date: '',
            time: '',
            duration: '',
            location: '',
            priority: 'Medium',
            notes: '',
            estimatedValue: '',
            photo: null
          });
          // Reload appointments to show the new one
          loadAppointments();
        } else {
          addToast({
            type: 'error',
            title: 'Failed to Create Appointment',
            description: data.error
          });
        }
      } else {
        const error = await response.json();
        addToast({
          type: 'error',
          title: 'Failed to Create Appointment',
          description: error.error
        });
      }
    } catch (error) {
      console.error('Error creating appointment:', error);
      addToast({
        type: 'error',
        title: 'Network Error',
        description: 'Failed to create appointment. Please check your connection and try again.'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this appointment? This action cannot be undone.')) {
      return;
    }

    setDeleting(eventId);
    try {
      const response = await fetch(`/api/appointments/${eventId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          addToast({
            type: 'success',
            title: 'Appointment Deleted',
            description: 'The appointment has been successfully removed from your schedule.'
          });
          setSelectedEvent(null);
          // Reload appointments to reflect the deletion
          loadAppointments();
        } else {
          addToast({
            type: 'error',
            title: 'Failed to Delete Appointment',
            description: data.error
          });
        }
      } else {
        const error = await response.json();
        addToast({
          type: 'error',
          title: 'Failed to Delete Appointment',
          description: error.error
        });
      }
    } catch (error) {
      console.error('Error deleting appointment:', error);
      addToast({
        type: 'error',
        title: 'Network Error',
        description: 'Failed to delete appointment. Please check your connection and try again.'
      });
    } finally {
      setDeleting(null);
    }
  };



  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Schedule</h1>
          <p className="text-gray-600">Manage your work schedule and appointments</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'calendar' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('calendar')}
            >
              <Calendar className="h-4 w-4 mr-2" />
              Calendar
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              List View
            </Button>
          </div>
          <Button onClick={() => setShowNewEventForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Appointment
          </Button>
        </div>
      </div>

      {/* Today's Schedule Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Today&apos;s Schedule
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {loading ? '...' : appointments.filter(e => e.date === new Date().toISOString().split('T')[0]).length}
              </div>
              <div className="text-sm text-blue-600">Appointments Today</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">
                {loading ? '...' : appointments.filter(e => e.status === 'In Progress').length}
              </div>
              <div className="text-sm text-yellow-600">In Progress</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {loading ? '...' : `$${appointments.filter(e => e.status === 'Completed' && e.estimatedValue).reduce((sum, e) => sum + (e.estimatedValue || 0), 0).toLocaleString()}`}
              </div>
              <div className="text-sm text-green-600">Revenue This Week</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters and Search */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search appointments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64"
          />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="Installation">Installation</SelectItem>
            <SelectItem value="Consultation">Consultation</SelectItem>
            <SelectItem value="Maintenance">Maintenance</SelectItem>
            <SelectItem value="Follow-up">Follow-up</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Calendar View */}
      {viewMode === 'calendar' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handlePrevMonth}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={handleNextMonth}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-1">
              {/* Day headers */}
              {dayNames.map(day => (
                <div key={day} className="p-2 text-center font-medium text-gray-500 text-sm">
                  {day}
                </div>
              ))}
              
              {/* Calendar days */}
              {getDaysInMonth(currentDate).map((day, index) => {
                if (!day) {
                  return <div key={index} className="p-2 h-24"></div>;
                }
                
                const dayEvents = getEventsForDate(day);
                const isToday = new Date().getDate() === day && 
                               new Date().getMonth() === currentDate.getMonth() &&
                               new Date().getFullYear() === currentDate.getFullYear();
                
                return (
                  <div
                    key={day}
                    className={`p-2 h-24 border border-gray-200 ${isToday ? 'bg-blue-50 border-blue-300' : 'hover:bg-gray-50'}`}
                  >
                    <div className={`text-sm font-medium ${isToday ? 'text-blue-600' : 'text-gray-900'}`}>
                      {day}
                    </div>
                    <div className="mt-1 space-y-1">
                      {dayEvents.slice(0, 2).map(event => (
                        <div
                          key={event.id}
                          className="text-xs p-1 rounded bg-blue-100 text-blue-800 truncate cursor-pointer hover:bg-blue-200"
                          onClick={() => setSelectedEvent(event)}
                        >
                          {event.time} {event.title}
                        </div>
                      ))}
                      {dayEvents.length > 2 && (
                        <div className="text-xs text-gray-500">
                          +{dayEvents.length - 2} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="space-y-4">
          {filteredEvents.map(event => (
            <Card key={event.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">{event.title}</h3>
                      <Badge className={statusColors[event.status]}>
                        {event.status}
                      </Badge>
                      <Badge className={typeColors[event.type]}>
                        {event.type}
                      </Badge>
                      <Badge className={priorityColors[event.priority]}>
                        {event.priority}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span>{event.customer}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(event.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>{event.time} ({event.duration})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span className="truncate">{event.location}</span>
                      </div>
                    </div>
                    
                    {event.estimatedValue && (
                      <div className="mt-2 text-sm">
                        <span className="text-gray-600">Estimated Value: </span>
                        <span className="font-semibold text-green-600">
                          {formatCurrency(event.estimatedValue)}
                        </span>
                      </div>
                    )}
                    
                    {event.notes && (
                      <div className="mt-2 text-sm text-gray-600">
                        <span className="font-medium">Notes: </span>
                        {event.notes}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* New Event Form Modal */}
      {showNewEventForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Schedule New Appointment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={newEvent.title}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., Solar Panel Installation"
                  />
                </div>
                <div>
                  <Label htmlFor="customer">Customer</Label>
                  <Input
                    id="customer"
                    value={newEvent.customer}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, customer: e.target.value }))}
                    placeholder="Customer name"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="type">Type</Label>
                  <Select value={newEvent.type} onValueChange={(value: ScheduleEvent['type']) => setNewEvent(prev => ({ ...prev, type: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Installation">Installation</SelectItem>
                      <SelectItem value="Consultation">Consultation</SelectItem>
                      <SelectItem value="Maintenance">Maintenance</SelectItem>
                      <SelectItem value="Follow-up">Follow-up</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={newEvent.priority} onValueChange={(value: ScheduleEvent['priority']) => setNewEvent(prev => ({ ...prev, priority: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="High">High</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="Low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={newEvent.date}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, date: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="time">Time</Label>
                  <Input
                    id="time"
                    type="time"
                    value={newEvent.time}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, time: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="duration">Duration</Label>
                  <Input
                    id="duration"
                    value={newEvent.duration}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, duration: e.target.value }))}
                    placeholder="e.g., 2 hours"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={newEvent.location}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="Full address"
                />
              </div>

              <div>
                <Label htmlFor="estimatedValue">Estimated Value ($)</Label>
                <Input
                  id="estimatedValue"
                  type="number"
                  value={newEvent.estimatedValue}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, estimatedValue: e.target.value }))}
                  placeholder="0.00"
                />
              </div>

              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={newEvent.notes}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Additional notes or requirements"
                  rows={3}
                />
              </div>

              <div>
                <Label>Photo Upload</Label>
                <p className="text-sm text-gray-600 mb-2">Upload a reference photo for this appointment (optional)</p>
                <FileUpload
                  onFileSelect={(file) => setNewEvent(prev => ({ ...prev, photo: file }))}
                  accept="image/*"
                  maxSize={5}
                  disabled={saving}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setShowNewEventForm(false)} disabled={saving}>
                  Cancel
                </Button>
                <Button onClick={handleCreateEvent} disabled={saving}>
                  {saving ? 'Scheduling...' : 'Schedule Appointment'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Event Details Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{selectedEvent.title}</CardTitle>
                <Button variant="outline" size="sm" onClick={() => setSelectedEvent(null)}>
                  ×
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Badge className={statusColors[selectedEvent.status]}>
                  {selectedEvent.status}
                </Badge>
                <Badge className={typeColors[selectedEvent.type]}>
                  {selectedEvent.type}
                </Badge>
                <Badge className={priorityColors[selectedEvent.priority]}>
                  {selectedEvent.priority}
                </Badge>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <span>{selectedEvent.customer}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span>{new Date(selectedEvent.date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span>{selectedEvent.time} ({selectedEvent.duration})</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span>{selectedEvent.location}</span>
                </div>
              </div>
              
              {selectedEvent.estimatedValue && (
                <div className="p-3 bg-green-50 rounded">
                  <span className="text-sm text-gray-600">Estimated Value: </span>
                  <span className="font-semibold text-green-600">
                    {formatCurrency(selectedEvent.estimatedValue)}
                  </span>
                </div>
              )}
              
              {selectedEvent.notes && (
                <div>
                  <Label>Notes</Label>
                  <p className="text-sm text-gray-600 mt-1">{selectedEvent.notes}</p>
                </div>
              )}

              {selectedEvent.photoUrl && (
                <div>
                  <Label>Photo</Label>
                  <div className="mt-2">
                    <img
                      src={selectedEvent.photoUrl}
                      alt="Appointment reference"
                      className="max-w-full h-32 object-contain border rounded"
                    />
                  </div>
                </div>
              )}
              
              <div className="flex justify-end gap-3 pt-4">
                <Button 
                  variant="outline" 
                  disabled={deleting === selectedEvent.id}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => handleDeleteEvent(selectedEvent.id)}
                  disabled={deleting === selectedEvent.id}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {deleting === selectedEvent.id ? 'Deleting...' : 'Delete'}
                </Button>
                <Button>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
} 