import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, ClockIcon, UserIcon } from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

interface Appointment {
  id: string;
  appointment_date: string;
  appointment_time: string;
  service_type: string | null;
  notes: string | null;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  duration_minutes: number;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppointments();
  }, [user]);

  const fetchAppointments = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('user_id', user.id)
      .order('appointment_date', { ascending: true });

    if (error) {
      console.error('Error fetching appointments:', error);
    } else {
      setAppointments(data || []);
    }
    setLoading(false);
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
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">I tuoi appuntamenti</h1>
        <p className="text-muted-foreground mt-2">
          Visualizza e gestisci i tuoi appuntamenti prenotati
        </p>
      </div>

      {appointments.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CalendarIcon className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">Nessun appuntamento</h3>
            <p className="text-muted-foreground text-center mb-6">
              Non hai ancora prenotato nessun appuntamento. Inizia prenotando il tuo primo appuntamento.
            </p>
            <Button asChild>
              <a href="/book">Prenota appuntamento</a>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {appointments.map((appointment) => (
            <Card key={appointment.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    {appointment.service_type || 'Appuntamento'}
                  </CardTitle>
                  {getStatusBadge(appointment.status)}
                </div>
                <CardDescription>
                  <div className="flex items-center gap-2 mt-2">
                    <CalendarIcon className="h-4 w-4" />
                    {format(new Date(appointment.appointment_date), 'dd MMMM yyyy', { locale: it })}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <ClockIcon className="h-4 w-4" />
                    {appointment.appointment_time} ({appointment.duration_minutes} min)
                  </div>
                </CardDescription>
              </CardHeader>
              {appointment.notes && (
                <CardContent>
                  <div className="text-sm">
                    <p className="font-medium mb-1">Note:</p>
                    <p className="text-muted-foreground">{appointment.notes}</p>
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}