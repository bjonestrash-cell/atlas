import { useEffect, useState } from 'react';
import { useTripStore } from '../store/tripStore';
import Modal from '../components/Modal';
import { formatDate, formatCurrency, STATUS_COLORS, STATUS_BG } from '../utils/format';

const EMPTY_FORM = {
  destination: '', origin: '', start_date: '', end_date: '',
  status: 'planned', purpose: 'leisure', airline: '', notes: '',
  travel_class: '', ticket_cost: '', trip_type: 'round-trip', alliance: '',
};

const TRAVEL_CLASSES = ['Basic Economy', 'Economy', 'Premium Economy', 'Business', 'First'];
const ALLIANCES = ['Oneworld', 'Star Alliance', 'SkyTeam'];

export default function Destinations() {
  const { trips, fetchTrips, createTrip, updateTrip, deleteTrip } = useTripStore();
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [filterStatus, setFilterStatus] = useState('');
  const [sortBy, setSortBy] = useState('date');

  useEffect(() => { fetchTrips(); }, []);

  const openNew = () => { setEditing(null); setForm(EMPTY_FORM); setShowModal(true); };
  const openEdit = (trip) => {
    setEditing(trip.id);
    setForm({ ...EMPTY_FORM, ...trip, ticket_cost: trip.ticket_cost ? String(trip.ticket_cost) : '' });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.destination || !form.start_date || !form.end_date) return;
    const data = { ...form, ticket_cost: parseFloat(form.ticket_cost) || 0 };
    if (editing) {
      await updateTrip(editing, data);
    } else {
      await createTrip(data);
    }
    setShowModal(false);
  };

  const filtered = trips
    .filter((t) => !filterStatus || t.status === filterStatus)
    .sort((a, b) => {
      if (sortBy === 'date') return a.start_date.localeCompare(b.start_date);
      if (sortBy === 'destination') return a.destination.localeCompare(b.destination);
      return 0;
    });

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(36px, 5vw, 64px)', fontWeight: 300, color: 'var(--ink)' }}>Trips</h1>
        <button onClick={openNew} className="btn-primary">+ Add Trip</button>
      </div>

      <div className="flex gap-3 items-center">
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="text-sm">
          <option value="">All Status</option>
          <option value="planned">Planned</option>
          <option value="booked">Booked</option>
          <option value="completed">Completed</option>
        </select>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="text-sm">
          <option value="date">Sort by Date</option>
          <option value="destination">Sort by Destination</option>
        </select>
        <span className="text-xs text-atlas-muted ml-auto">{filtered.length} trips</span>
      </div>

      <div className="space-y-3">
        {filtered.map((trip) => (
          <div key={trip.id} className="card flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 400, color: 'var(--ink)' }} className="truncate">{trip.destination}</h3>
                <span style={{ fontFamily: 'var(--font-ui)', fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--slate)', border: '1px solid var(--stone)', padding: '2px 8px' }}>{trip.status}</span>
              </div>
              <div className="text-sm text-atlas-sub space-y-0.5">
                <div>{formatDate(trip.start_date)} – {formatDate(trip.end_date)}</div>
                <div className="flex flex-wrap gap-3">
                  {trip.origin && <span>From: {trip.origin}</span>}
                  {trip.airline && <span>Airline: {trip.airline}</span>}
                  {trip.travel_class && <span className="text-atlas-muted">{trip.travel_class}</span>}
                  {trip.trip_type && <span className="text-atlas-muted capitalize">{trip.trip_type}</span>}
                  {trip.alliance && <span className="text-xs bg-atlas-bg px-2 py-0.5 rounded-pill text-atlas-sub">{trip.alliance}</span>}
                  {trip.ticket_cost > 0 && <span className="font-semibold">{formatCurrency(trip.ticket_cost)}</span>}
                  <span className="capitalize text-atlas-muted">{trip.purpose}</span>
                </div>
                {trip.notes && <div className="text-atlas-muted text-xs mt-1">{trip.notes}</div>}
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              <button onClick={() => openEdit(trip)} className="btn-secondary text-xs !py-1.5 !px-3">Edit</button>
              <button onClick={() => deleteTrip(trip.id)} className="btn-danger text-xs !py-1.5 !px-3">Delete</button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-12 text-atlas-muted">
            No trips found. <button onClick={openNew} className="text-atlas-accent hover:underline">Add one</button>
          </div>
        )}
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit Trip' : 'New Trip'}>
        <div className="space-y-4">
          <div>
            <label className="stat-label block mb-1">Destination *</label>
            <input value={form.destination} onChange={set('destination')} placeholder="Tokyo, Japan" className="w-full" />
          </div>
          <div>
            <label className="stat-label block mb-1">Origin Airport</label>
            <input value={form.origin} onChange={set('origin')} placeholder="LAX" className="w-full" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="stat-label block mb-1">Start Date *</label>
              <input type="date" value={form.start_date} onChange={set('start_date')} className="w-full" />
            </div>
            <div>
              <label className="stat-label block mb-1">End Date *</label>
              <input type="date" value={form.end_date} onChange={set('end_date')} className="w-full" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="stat-label block mb-1">Trip Type</label>
              <select value={form.trip_type} onChange={set('trip_type')} className="w-full">
                <option value="round-trip">Round-trip</option>
                <option value="one-way">One-way</option>
              </select>
            </div>
            <div>
              <label className="stat-label block mb-1">Class of Travel</label>
              <select value={form.travel_class} onChange={set('travel_class')} className="w-full">
                <option value="">Select class...</option>
                {TRAVEL_CLASSES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="stat-label block mb-1">Ticket Cost</label>
              <input type="number" step="0.01" value={form.ticket_cost} onChange={set('ticket_cost')} placeholder="0.00" className="w-full" />
            </div>
            <div>
              <label className="stat-label block mb-1">Airline Alliance</label>
              <select value={form.alliance} onChange={set('alliance')} className="w-full">
                <option value="">None</option>
                {ALLIANCES.map((a) => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="stat-label block mb-1">Status</label>
              <select value={form.status} onChange={set('status')} className="w-full">
                <option value="planned">Planned</option>
                <option value="booked">Booked</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div>
              <label className="stat-label block mb-1">Purpose</label>
              <select value={form.purpose} onChange={set('purpose')} className="w-full">
                <option value="leisure">Leisure</option>
                <option value="business">Business</option>
                <option value="family">Family</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
          <div>
            <label className="stat-label block mb-1">Airline</label>
            <input value={form.airline} onChange={set('airline')} placeholder="Delta" className="w-full" />
          </div>
          <div>
            <label className="stat-label block mb-1">Notes</label>
            <textarea value={form.notes} onChange={set('notes')} rows={2} placeholder="Trip notes..." className="w-full" />
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={handleSave} className="btn-primary flex-1">{editing ? 'Save Changes' : 'Add Trip'}</button>
            <button onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
