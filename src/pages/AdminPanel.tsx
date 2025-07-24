import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, UserIcon, ClockIcon, PlusIcon, TrashIcon } from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { Navigate } from 'react-router-dom';

interface Appointment {
  id: string;
  appointment_date: string;
  appointment_time: string;
  service_type: string | null;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  profiles: {
    full_name: string | null;
  } | null;
}

interface UnavailableSlot {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
  reason: string | null;
}

export default function AdminPanel() {
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [unavailableSlots, setUnavailableSlots] = useState<UnavailableSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [reason, setReason] = useState('');

  if (!user || !isAdmin) {
    return <Navigate to="/" replace />;
  }

  useEffect(() => {
    fetchAppointments();
    fetchUnavailableSlots();
  }, []);

  const fetchAppointments = async () => {
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        *,
        profiles:user_id (
          full_name
        )
      `)
      .order('appointment_date', { ascending: true });

    if (error) {
      console.error('Error fetching appointments:', error);
    } else {
      setAppointments((data as any) || []);
    }
    setLoading(false);
  };

  const fetchUnavailableSlots = async () => {
    const { data, error } = await supabase
      .from('unavailable_slots')
      .select('*')
      .order('date', { ascending: true });

    if (error) {
      console.error('Error fetching unavailable slots:', error);
    } else {
      setUnavailableSlots(data || []);
    }
  };

  const updateAppointmentStatus = async (appointmentId: string, status: 'pending' | 'confirmed' | 'cancelled' | 'completed') => {
    const { error } = await supabase
      .from('appointments')
      .update({ status })
      .eq('id', appointmentId);

    if (error) {
      toast({
        title: "Errore",
        description: "Impossibile aggiornare lo stato dell'appuntamento",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Successo",
        description: "Stato appuntamento aggiornato",
      });
      fetchAppointments();
    }
  };

  const addUnavailableSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedDate || !startTime || !endTime) {
      toast({
        title: "Errore",
        description: "Completa tutti i campi obbligatori",
        variant: "destructive"
      });
      return;
    }

    const { error } = await supabase
      .from('unavailable_slots')
      .insert({
        date: format(selectedDate, 'yyyy-MM-dd'),
        start_time: startTime,
        end_time: endTime,
        reason: reason || null
      });

    if (error) {
      toast({
        title: "Errore",
        description: "Impossibile aggiungere il blocco orario",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Successo",
        description: "Blocco orario aggiunto",
      });
      setSelectedDate(undefined);
      setStartTime('');
      setEndTime('');
      setReason('');
      fetchUnavailableSlots();
    }
  };

  const deleteUnavailableSlot = async (slotId: string) => {
    const { error } = await supabase
      .from('unavailable_slots')
      .delete()
      .eq('id', slotId);

    if (error) {
      toast({
        title: "Errore",
        description: "Impossibile eliminare il blocco orario",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Successo",
        description: "Blocco orario eliminato",
      });
      fetchUnavailableSlots();
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: 'default',
      confirmed: 'default',
      cancelled: 'destructive',
      completed: 'secondary'
    } as const;

    const labels = {
      pending: 'In attesa',
      confirmed: 'Confermato',
      cancelled: 'Annullato',
      completed: 'Completato'
    };

    return (
      <Badge variant={variants[status as keyof typeof variants]}>
        {labels[status as keyof typeof labels]}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Caricamento...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Pannello Amministratore</h1>
        <p className="text-muted-foreground mt-2">
          Gestisci appuntamenti e disponibilità
        </p>
      </div>

      <Tabs defaultValue="appointments" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="appointments">Appuntamenti</TabsTrigger>
          <TabsTrigger value="availability">Disponibilità</TabsTrigger>
        </TabsList>
        
        <TabsContent value="appointments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Gestione Appuntamenti</CardTitle>
              <CardDescription>
                Visualizza e gestisci tutti gli appuntamenti prenotati
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Ora</TableHead>
                    <TableHead>Servizio</TableHead>
                    <TableHead>Stato</TableHead>
                    <TableHead>Azioni</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {appointments.map((appointment) => (
                    <TableRow key={appointment.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <UserIcon className="h-4 w-4" />
                          {appointment.profiles?.full_name || 'N/A'}
                        </div>
                      </TableCell>
                      <TableCell>
                        {format(new Date(appointment.appointment_date), 'dd/MM/yyyy')}
                      </TableCell>
                      <TableCell>{appointment.appointment_time}</TableCell>
                      <TableCell>{appointment.service_type}</TableCell>
                      <TableCell>{getStatusBadge(appointment.status)}</TableCell>
                      <TableCell>
                        <Select
                          value={appointment.status}
                          onValueChange={(value) => updateAppointmentStatus(appointment.id, value as 'pending' | 'confirmed' | 'cancelled' | 'completed')}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">In attesa</SelectItem>
                            <SelectItem value="confirmed">Confermato</SelectItem>
                            <SelectItem value="cancelled">Annullato</SelectItem>
                            <SelectItem value="completed">Completato</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="availability" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Aggiungi Blocco Orario</CardTitle>
                <CardDescription>
                  Blocca specifici orari per renderli non disponibili per le prenotazioni
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={addUnavailableSlot} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Data</Label>
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
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-2">
                      <Label htmlFor="start-time">Ora inizio</Label>
                      <Input
                        id="start-time"
                        type="time"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="end-time">Ora fine</Label>
                      <Input
                        id="end-time"
                        type="time"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reason">Motivo (opzionale)</Label>
                    <Input
                      id="reason"
                      placeholder="es. Pausa pranzo, Ferie, etc."
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                    />
                  </div>

                  <Button type="submit" className="w-full">
                    <PlusIcon className="mr-2 h-4 w-4" />
                    Aggiungi Blocco
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Blocchi Orari Attivi</CardTitle>
                <CardDescription>
                  Orari attualmente bloccati per le prenotazioni
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {unavailableSlots.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">
                      Nessun blocco orario attivo
                    </p>
                  ) : (
                    unavailableSlots.map((slot) => (
                      <div
                        key={slot.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div>
                          <div className="flex items-center gap-2 font-medium">
                            <CalendarIcon className="h-4 w-4" />
                            {format(new Date(slot.date), 'dd/MM/yyyy')}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <ClockIcon className="h-4 w-4" />
                            {slot.start_time} - {slot.end_time}
                          </div>
                          {slot.reason && (
                            <p className="text-sm text-muted-foreground">{slot.reason}</p>
                          )}
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => deleteUnavailableSlot(slot.id)}
                        >
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}