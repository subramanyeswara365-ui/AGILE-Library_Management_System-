import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Check, X, AlertCircle, MapPin, Users, Shield, Zap } from 'lucide-react';
import { api } from '../api/client';
import confetti from 'canvas-confetti';

export default function SeatReservationTab({ user }) {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [slot, setSlot] = useState('09:00 - 13:00');
  const [seats, setSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [actionMsg, setActionMsg] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);

  const slots = [
    { id: '09:00 - 13:00', label: 'Morning Slot (09:00 - 13:00)' },
    { id: '13:00 - 17:00', label: 'Afternoon Slot (13:00 - 17:00)' },
    { id: '17:00 - 21:00', label: 'Evening Slot (17:00 - 21:00)' },
  ];

  const fetchSeats = async () => {
    setLoading(true);
    try {
      const data = await api.getSeats(date, slot);
      setSeats(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSeats();
    setSelectedSeat(null);
  }, [date, slot]);

  const handleReserve = async () => {
    if (!selectedSeat) return;
    if (!user) {
      setActionMsg('Please log in with your college account to reserve a reading room seat.');
      return;
    }
    setBookingLoading(true);
    setActionMsg('');
    try {
      await api.reserveSeat(selectedSeat.seatNumber, date, slot);
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.7 } });
      setActionMsg(`Seat ${selectedSeat.seatNumber} successfully reserved for ${date} [${slot}]!`);
      setSelectedSeat(null);
      fetchSeats();
    } catch (err) {
      setActionMsg(err.message || 'Seat reservation failed. Seat might be taken.');
    } finally {
      setBookingLoading(false);
    }
  };

  const handleCancelReservation = async (reservationId, seatNum) => {
    if (!window.confirm(`Are you sure you want to cancel your reservation for ${seatNum}?`)) return;
    setBookingLoading(true);
    try {
      await api.cancelSeat(reservationId);
      setActionMsg(`Reservation for seat ${seatNum} has been cancelled.`);
      setSelectedSeat(null);
      fetchSeats();
    } catch (err) {
      setActionMsg(err.message || 'Failed to cancel reservation');
    } finally {
      setBookingLoading(false);
    }
  };

  // Group seats by Section
  const sections = [
    { title: 'Quiet Study Zone', range: [1, 6], desc: 'Strict silence, individual study desks, soft reading lamps.' },
    { title: 'AC Coding Pod', range: [7, 12], desc: 'Dual power sockets, high-speed campus LAN, ergonomically seated.' },
    { title: 'Discussion Zone', range: [13, 18], desc: 'Group project collaboration pods, whiteboards available.' },
    { title: 'Scenic Window Bay', range: [19, 24], desc: 'Natural daylight, campus lake view, casual reading armchairs.' },
  ];

  const availableCount = seats.filter(s => s.status === 'AVAILABLE').length;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mb-2">
            <Zap className="w-3.5 h-3.5 text-emerald-600" />
            <span>Real-Time Seat Booking (PB-07)</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Central Library Reading Room Floor Map
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            View live desk occupancy and reserve guaranteed seating without double-booking.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="badge badge-green text-xs px-3 py-1">
            🟢 {availableCount} / 24 Desks Free
          </span>
        </div>
      </div>

      {actionMsg && (
        <div className={`p-4 rounded-xl text-xs font-semibold flex items-center justify-between ${
          actionMsg.includes('success') || actionMsg.includes('reserved')
            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          <span>{actionMsg}</span>
          <button onClick={() => setActionMsg('')} className="underline text-[11px] ml-4">Dismiss</button>
        </div>
      )}

      {/* Date & Slot Selector Controls */}
      <div className="lms-card p-4 sm:p-5 flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Date input */}
        <div className="w-full md:w-auto flex items-center gap-2">
          <label className="text-xs font-bold text-slate-700 whitespace-nowrap flex items-center gap-1">
            <Calendar className="w-4 h-4 text-blue-600" />
            <span>Select Date:</span>
          </label>
          <input
            type="date"
            min={new Date().toISOString().split('T')[0]}
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="px-3 py-1.5 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white font-semibold"
          />
        </div>

        {/* Slot selector pills */}
        <div className="w-full md:w-auto flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
            <Clock className="w-4 h-4 text-blue-600" />
            <span>Slot:</span>
          </span>
          {slots.map((s) => (
            <button
              key={s.id}
              onClick={() => setSlot(s.id)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all whitespace-nowrap ${
                slot === s.id
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              {s.id}
            </button>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-600 px-1">
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded bg-emerald-100 border border-emerald-400"></div>
          <span>Available Desk</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded bg-slate-200 border border-slate-300"></div>
          <span>Occupied</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded bg-blue-100 border border-blue-500"></div>
          <span>Your Confirmed Seat</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded bg-yellow-100 border border-yellow-500"></div>
          <span>Selected</span>
        </div>
      </div>

      {/* Interactive Visual Floor Layout Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sections.map((sec, secIdx) => {
          const sectionSeats = seats.filter((s, idx) => {
            const num = idx + 1;
            return num >= sec.range[0] && num <= sec.range[1];
          });

          return (
            <div key={secIdx} className="lms-card p-5 space-y-4">
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-slate-900">{sec.title}</h3>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Desks S-{String(sec.range[0]).padStart(2, '0')} to S-{String(sec.range[1]).padStart(2, '0')}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">{sec.desc}</p>
              </div>

              {/* 6 Desks in 2x3 or 3x2 grid */}
              <div className="grid grid-cols-3 gap-3 p-3 bg-slate-50/80 rounded-2xl border border-slate-100">
                {sectionSeats.map((seat) => {
                  const isSelected = selectedSeat?.seatNumber === seat.seatNumber;
                  const isMine = seat.status === 'MY_BOOKING';
                  const isOccupied = seat.status === 'OCCUPIED';

                  let seatStyle = 'seat-available';
                  if (isMine) seatStyle = 'seat-mine';
                  else if (isOccupied) seatStyle = 'seat-occupied';
                  if (isSelected) seatStyle = 'bg-yellow-100 text-yellow-900 border-yellow-400 shadow-md';

                  return (
                    <button
                      key={seat.seatNumber}
                      type="button"
                      disabled={isOccupied}
                      onClick={() => setSelectedSeat(seat)}
                      className={`seat-item w-full h-16 ${seatStyle}`}
                      title={
                        isMine
                          ? 'Your booking'
                          : isOccupied
                          ? `Booked by ${seat.bookedByName || 'Student'}`
                          : 'Available - Click to Select'
                      }
                    >
                      <span className="font-extrabold text-xs">{seat.seatNumber}</span>
                      <span className="text-[9px] uppercase font-bold tracking-tight opacity-75 mt-0.5">
                        {isMine ? 'Mine' : isOccupied ? 'Taken' : 'Open'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Seat Booking Action Bar */}
      {selectedSeat && (
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base text-yellow-400">Desk {selectedSeat.seatNumber}</span>
              <span className="text-xs text-slate-300">• {selectedSeat.section}</span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Reservation for <span className="text-white font-semibold">{date}</span> during <span className="text-white font-semibold">[{slot}]</span>.
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => setSelectedSeat(null)}
              className="btn btn-secondary text-xs text-slate-800 flex-1 sm:flex-none"
            >
              Cancel
            </button>

            {selectedSeat.status === 'MY_BOOKING' ? (
              <button
                onClick={() => handleCancelReservation(selectedSeat.reservationId, selectedSeat.seatNumber)}
                disabled={bookingLoading}
                className="btn btn-danger text-xs flex-1 sm:flex-none"
              >
                Release My Booking
              </button>
            ) : (
              <button
                onClick={handleReserve}
                disabled={bookingLoading}
                className="btn btn-primary text-xs flex-1 sm:flex-none bg-blue-500 hover:bg-blue-600"
              >
                {bookingLoading ? 'Reserving Desk...' : 'Confirm Reservation'}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
