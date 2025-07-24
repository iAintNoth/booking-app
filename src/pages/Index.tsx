import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarIcon, UserIcon, SettingsIcon, ClockIcon } from 'lucide-react';

export default function Index() {
  const { user, isAdmin } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/20 via-background to-secondary/20">
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl mb-6">
            Gestione Appuntamenti
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            La soluzione completa per gestire i tuoi appuntamenti. Prenota, gestisci e tieni traccia di tutti i tuoi appuntamenti in un unico posto.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="text-lg px-8 py-6" asChild>
              <Link to="/auth">Inizia ora</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Benvenuto nella tua dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Gestisci i tuoi appuntamenti in modo semplice e veloce
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Prenota Appuntamento
            </CardTitle>
            <CardDescription>
              Seleziona data e ora per prenotare un nuovo appuntamento
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" asChild>
              <Link to="/book">
                <CalendarIcon className="mr-2 h-4 w-4" />
                Prenota ora
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserIcon className="h-5 w-5" />
              I Miei Appuntamenti
            </CardTitle>
            <CardDescription>
              Visualizza e gestisci i tuoi appuntamenti prenotati
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full" asChild>
              <Link to="/dashboard">
                <UserIcon className="mr-2 h-4 w-4" />
                Visualizza
              </Link>
            </Button>
          </CardContent>
        </Card>

        {isAdmin && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SettingsIcon className="h-5 w-5" />
                Pannello Admin
              </CardTitle>
              <CardDescription>
                Gestisci tutti gli appuntamenti e le disponibilità
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="secondary" className="w-full" asChild>
                <Link to="/admin">
                  <SettingsIcon className="mr-2 h-4 w-4" />
                  Gestisci
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6">Funzionalità principali</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="text-center p-4">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-3">
              <CalendarIcon className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Prenotazione Facile</h3>
            <p className="text-sm text-muted-foreground">
              Prenota appuntamenti in pochi click con il nostro sistema intuitivo
            </p>
          </div>
          
          <div className="text-center p-4">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-3">
              <ClockIcon className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Gestione Orari</h3>
            <p className="text-sm text-muted-foreground">
              Visualizza gli orari disponibili in tempo reale
            </p>
          </div>
          
          <div className="text-center p-4">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-3">
              <UserIcon className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Profilo Personale</h3>
            <p className="text-sm text-muted-foreground">
              Tieni traccia di tutti i tuoi appuntamenti passati e futuri
            </p>
          </div>
          
          <div className="text-center p-4">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-3">
              <SettingsIcon className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Controllo Completo</h3>
            <p className="text-sm text-muted-foreground">
              {isAdmin ? 'Gestisci tutti gli aspetti del sistema' : 'Modifica e annulla i tuoi appuntamenti'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}