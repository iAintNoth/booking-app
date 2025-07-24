import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, ClockIcon } from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { Navigate } from 'react-router-dom';

const TIME_SLOTS = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00'
];

const SERVICE_TYPES = [
  'Consulenza generale',
  'Controllo di routine',
  'Visita specialistica',
  'Follow-up',
  'Altro'
];

interface UnavailableSlot {
  date: string;
  start_time: string;
  end_time: string;
}

export default function BookAppointment() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState('');
  const [serviceType, setServiceType] = useState('');
  const [notes, setNotes] = useState('');
  const [unavailableSlots, setUnavailableSlots] = useState<UnavailableSlot[]>([]);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  useEffect(() => {
    if (selectedDate) {
      fetchUnavailableSlots();
      fetchBookedSlots();
    }
  }, [selectedDate]);

  const fetchUnavailableSlots = async () => {
    if (!selectedDate) return;

    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    
    const { data, error } = await supabase
      .from('unavailable_slots')
      .select('*')
      .eq('date', dateStr);

    if (error) {
      console.error('Error fetching unavailable slots:', error);
    } else {
      setUnavailableSlots(data || []);
    }
  };

  const fetchBookedSlots = async () => {
    if (!selectedDate) return;

    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    
    const { data, error } = await supabase
      .from('appointments')
      .select('appointment_time')
      .eq('appointment_date', dateStr)
      .in('status', ['pending', 'confirmed']);

    if (error) {
      console.error('Error fetching booked slots:', error);
    } else {
      setBookedSlots(data?.map(slot => slot.appointment_time) || []);
    }
  };

  const isTimeSlotAvailable = (time: string) => {
    if (!selectedDate) return false;

    // Check if time is already booked
    if (bookedSlots.includes(time)) return false;

    // Check if time conflicts with unavailable slots
    return !unavailableSlots.some(slot => {
      return time >= slot.start_time && time < slot.end_time;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedDate || !selectedTime || !serviceType) {
      toast({
        title: "Errore",
        description: "Completa tutti i campi obbligatori",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    const { error } = await supabase
      .from('appointments')
      .insert({
        user_id: user.id,
        appointment_date: format(selectedDate, 'yyyy-MM-dd'),
        appointment_time: selectedTime,
        service_type: serviceType,
        notes: notes || null,
        status: 'pending'
      });

    if (error) {
      toast({
        title: "Errore",
        description: "Impossibile prenotare l'appuntamento. Riprova.",
        variant: "destructive"
      });
      console.error('Error booking appointment:', error);
    } else {
      toast({
        title: "Appuntamento prenotato",
        description: "Il tuo appuntamento è stato prenotato con successo!",
      });
      
      // Reset form
      setSelectedDate(undefined);
      setSelectedTime('');
      setServiceType('');
      setNotes('');
    }

    setLoading(false);
  };

  const isDateDisabled = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Prenota un appuntamento</h1>
        <p className="text-muted-foreground mt-2">
          Seleziona data, ora e tipo di servizio per prenotare il tuo appuntamento
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dettagli appuntamento</CardTitle>
          <CardDescription>
            Compila il modulo per prenotare il tuo appuntamento
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label>Data appuntamento *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? (
                      format(selectedDate, 'dd MMMM yyyy', { locale: it })
                    ) : (
                      <span>Seleziona una data</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    disabled={isDateDisabled}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {selectedDate && (
              <div className="space-y-2">
                <Label>Orario appuntamento *</Label>
                <Select value={selectedTime} onValueChange={setSelectedTime}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona un orario" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIME_SLOTS.map((time) => (
                      <SelectItem
                        key={time}
                        value={time}
                        disabled={!isTimeSlotAvailable(time)}
                      >
                        <div className="flex items-center gap-2">
                          <ClockIcon className="h-4 w-4" />
                          {time}
                          {!isTimeSlotAvailable(time) && (
                            <span className="text-muted-foreground">(Non disponibile)</span>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label>Tipo di servizio *</Label>
              <Select value={serviceType} onValueChange={setServiceType}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona il tipo di servizio" />
                </SelectTrigger>
                <SelectContent>
                  {SERVICE_TYPES.map((service) => (
                    <SelectItem key={service} value={service}>
                      {service}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Note aggiuntive</Label>
              <Textarea
                id="notes"
                placeholder="Inserisci eventuali note o richieste specifiche..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Prenotazione in corso...' : 'Prenota appuntamento'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}