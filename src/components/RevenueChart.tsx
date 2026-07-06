import React, { useState, useMemo } from 'react';
import { ClientPayment } from '../types';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { 
  TrendingUp, 
  Calendar, 
  DollarSign, 
  Activity as ActivityIcon,
  ChevronRight,
  TrendingDown
} from 'lucide-react';

interface RevenueChartProps {
  payments: ClientPayment[];
  formatCurrency: (amount: number) => string;
}

type ChartViewType = 'weekly' | 'daily';

export default function RevenueChart({ payments, formatCurrency }: RevenueChartProps) {
  const [viewType, setViewType] = useState<ChartViewType>('weekly');

  // Sum of payments currently in 'Payé' status in our state
  const totalLivePaidAmount = useMemo(() => {
    return payments
      .filter(p => p.status === 'Payé')
      .reduce((sum, p) => sum + p.amount, 0);
  }, [payments]);

  // Sum of payments matching specific days (for the daily breakdown)
  const dailyPaidAmounts = useMemo(() => {
    const daily = {
      Lundi: 65000,
      Mardi: 82000,
      Mercredi: 45000,
      Jeudi: 0,
      Vendredi: 0,
      Samedi: 0,
      Dimanche: 0
    };

    // Distribute current payments to days of the week based on their 'time' string
    payments.forEach(p => {
      if (p.status !== 'Payé') return;
      const t = p.time.toLowerCase();
      if (t.includes('aujourd\'hui')) {
        // Let's assume today is Wednesday (Mercredi, June 24, 2026)
        daily.Mercredi += p.amount;
      } else if (t.includes('hier')) {
        daily.Mardi += p.amount;
      } else if (t.includes('lundi')) {
        daily.Lundi += p.amount;
      } else if (t.includes('jeudi')) {
        daily.Jeudi += p.amount;
      } else if (t.includes('vendredi')) {
        daily.Vendredi += p.amount;
      } else if (t.includes('samedi')) {
        daily.Samedi += p.amount;
      } else if (t.includes('dimanche')) {
        daily.Dimanche += p.amount;
      } else {
        // Distribute fallback to Mercredi (today)
        daily.Mercredi += Math.floor(p.amount * 0.4);
        daily.Mardi += Math.floor(p.amount * 0.3);
        daily.Lundi += Math.floor(p.amount * 0.3);
      }
    });

    return daily;
  }, [payments]);

  // Data for the weekly chart (last 6 weeks)
  const weeklyData = useMemo(() => {
    // Week 27 is the current week. We add the live paid payments to its baseline.
    const week27Revenue = 350000 + totalLivePaidAmount;

    return [
      { name: 'Semaine 22', revenue: 420000, activeTrips: 45 },
      { name: 'Semaine 23', revenue: 380000, activeTrips: 42 },
      { name: 'Semaine 24', revenue: 510000, activeTrips: 55 },
      { name: 'Semaine 25', revenue: 460000, activeTrips: 48 },
      { name: 'Semaine 26', revenue: 580000, activeTrips: 62 },
      { name: 'Semaine 27 (En cours)', revenue: week27Revenue, activeTrips: 65 + Math.floor(totalLivePaidAmount / 5000) }
    ];
  }, [totalLivePaidAmount]);

  // Data for the daily chart (current week)
  const dailyData = useMemo(() => {
    return [
      { name: 'Lundi', revenue: dailyPaidAmounts.Lundi, activeTrips: 12 },
      { name: 'Mardi', revenue: dailyPaidAmounts.Mardi, activeTrips: 15 },
      { name: 'Mercredi', revenue: dailyPaidAmounts.Mercredi, activeTrips: 10 + Math.floor(totalLivePaidAmount / 10000) },
      { name: 'Jeudi', revenue: dailyPaidAmounts.Jeudi, activeTrips: 0 },
      { name: 'Vendredi', revenue: dailyPaidAmounts.Vendredi, activeTrips: 0 },
      { name: 'Samedi', revenue: dailyPaidAmounts.Samedi, activeTrips: 0 },
      { name: 'Dimanche', revenue: dailyPaidAmounts.Dimanche, activeTrips: 0 }
    ];
  }, [dailyPaidAmounts, totalLivePaidAmount]);

  const activeData = viewType === 'weekly' ? weeklyData : dailyData;

  // Calculate total revenue shown in the current selected view
  const viewTotalRevenue = useMemo(() => {
    return activeData.reduce((sum, d) => sum + d.revenue, 0);
  }, [activeData]);

  // Custom tooltips styling matching our Hanken Grotesk and color theme
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-border-subtle rounded-xl shadow-lg font-sans">
          <p className="font-bold text-xs text-on-surface-variant mb-1">{label}</p>
          <div className="space-y-1">
            <p className="text-sm font-extrabold text-primary flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-primary inline-block"></span>
              {formatCurrency(payload[0].value)}
            </p>
            <p className="text-[10px] text-on-surface-variant font-medium">
              Trips estimés: {payload[0].payload.activeTrips}
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div id="revenue-chart-card" className="bg-white p-5 rounded-2xl border border-border-subtle shadow-sm flex flex-col gap-4">
      {/* Chart Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-bold text-lg text-on-surface tracking-tight">Analyse des Revenus Clients</h2>
            <span className="bg-primary/10 text-primary text-[11px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              +14.2% ce mois
            </span>
          </div>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Suivi en temps réel des encaissements de tickets de transport (Orange Money, Wave, Espèces)
          </p>
        </div>

        {/* Chart Toggle View */}
        <div className="flex items-center bg-surface-container p-1 rounded-xl self-start sm:self-auto">
          <button
            onClick={() => setViewType('weekly')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              viewType === 'weekly' 
                ? 'bg-white text-primary shadow-sm' 
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Vue Hebdomadaire
          </button>
          <button
            onClick={() => setViewType('daily')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              viewType === 'daily' 
                ? 'bg-white text-primary shadow-sm' 
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Semaine en cours (Jour)
          </button>
        </div>
      </div>

      {/* Stats Summary Panel */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 border-y border-border-subtle py-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-primary/10 text-primary rounded-xl shrink-0">
            <DollarSign className="h-4 w-4" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold tracking-wider text-on-surface-variant">Volume de la vue</p>
            <p className="text-base font-extrabold text-on-surface">{formatCurrency(viewTotalRevenue)}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 text-blue-700 rounded-xl shrink-0">
            <ActivityIcon className="h-4 w-4" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold tracking-wider text-on-surface-variant">Panier Moyen</p>
            <p className="text-base font-extrabold text-on-surface">
              {formatCurrency(viewType === 'weekly' ? 9500 : 7500)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-status-success-bg/60 text-status-success-text rounded-xl shrink-0">
            <Calendar className="h-4 w-4" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold tracking-wider text-on-surface-variant">Meilleure période</p>
            <p className="text-base font-extrabold text-on-surface">
              {viewType === 'weekly' ? 'Semaine 26' : 'Mardi'}
            </p>
          </div>
        </div>
      </div>

      {/* Recharts Area Chart */}
      <div className="h-64 sm:h-72 w-full mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={activeData}
            margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#275300" stopOpacity={0.35}/>
                <stop offset="95%" stopColor="#275300" stopOpacity={0.01}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f2f3" />
            <XAxis 
              dataKey="name" 
              stroke="#888c8e" 
              fontSize={11} 
              tickLine={false} 
              axisLine={false}
              dy={8}
            />
            <YAxis 
              stroke="#888c8e" 
              fontSize={10} 
              tickLine={false} 
              axisLine={false}
              tickFormatter={(val) => `${val / 1000}k`}
              dx={-8}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area 
              type="monotone" 
              dataKey="revenue" 
              stroke="#275300" 
              strokeWidth={2.5} 
              fillOpacity={1} 
              fill="url(#colorRevenue)" 
              animationDuration={800}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
