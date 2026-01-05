import { useState, useEffect } from 'react';
import { Calendar, Clock, CheckCircle, User, ArrowLeft, Loader2 } from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { encodePatientData } from '../lib/security';

interface Service {
  id: string;
  name: string;
  price: number;
  description: string;
  duration: number; // in minutes
}

interface AvailableTimeSlot {
  date: string;
  time: string;
  available: boolean;
}

interface BookingFormData {
  serviceId: string;
  date: string;
  time: string;
  patientName: string;
  patientPhone: string;
  patientEmail: string;
  notes: string;
}

export default function BookingSystem() {
  const [step, setStep] = useState<number>(1); // 1: service, 2: date/time, 3: confirm
  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [availableSlots, setAvailableSlots] = useState<AvailableTimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<{ date: string; time: string } | null>(null);
  const [bookingData, setBookingData] = useState<BookingFormData>({
    serviceId: '',
    date: '',
    time: '',
    patientName: '',
    patientPhone: '',
    patientEmail: '',
    notes: ''
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [bookingConfirmed, setBookingConfirmed] = useState<boolean>(false);
  const [bookingId, setBookingId] = useState<string>('');

  // Load services from Firebase
  useEffect(() => {
    const loadServices = async () => {
      try {
        // In a real implementation, this would come from the user's services
        // For now, we'll create some sample services
        const sampleServices: Service[] = [
          {
            id: '1',
            name: 'Pemeriksaan Umum',
            price: 150000,
            description: 'Pemeriksaan kesehatan umum oleh dokter',
            duration: 30
          },
          {
            id: '2',
            name: 'Konsultasi Spesialis',
            price: 250000,
            description: 'Konsultasi dengan dokter spesialis',
            duration: 45
          },
          {
            id: '3',
            name: 'Vaksinasi',
            price: 100000,
            description: 'Pelayanan vaksinasi lengkap',
            duration: 20
          },
          {
            id: '4',
            name: 'Cek Laboratorium',
            price: 300000,
            description: 'Pemeriksaan laboratorium lengkap',
            duration: 60
          }
        ];
        setServices(sampleServices);
      } catch (error) {
        console.error('Error loading services:', error);
      } finally {
        setLoading(false);
      }
    };

    loadServices();
  }, []);

  // Handle service selection
  const handleSelectService = (service: Service) => {
    setSelectedService(service);
    setBookingData(prev => ({
      ...prev,
      serviceId: service.id
    }));
    setStep(2);
  };

  // Generate available time slots
  const generateTimeSlots = (date: string) => {
    const slots: AvailableTimeSlot[] = [];
    const startHour = 8; // 8 AM
    const endHour = 17; // 5 PM
    const interval = 30; // 30 minute intervals

    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += interval) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push({
          date,
          time,
          available: Math.random() > 0.3 // Random availability for demo
        });
      }
    }

    setAvailableSlots(slots);
  };

  // Handle date selection
  const handleSelectDate = (date: string) => {
    generateTimeSlots(date);
    setBookingData(prev => ({
      ...prev,
      date
    }));
  };

  // Handle time selection
  const handleSelectTime = (time: string) => {
    if (availableSlots.find(slot => slot.time === time && slot.date === bookingData.date)?.available) {
      setSelectedSlot({ date: bookingData.date, time });
      setBookingData(prev => ({
        ...prev,
        time
      }));
      setStep(3);
    }
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setBookingData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Submit booking
  const handleSubmitBooking = async () => {
    setLoading(true);
    try {
      // In a real implementation, this would save to Firestore
      // For now, we'll simulate the booking process
      const bookingRef = await addDoc(collection(db, 'bookings'), {
        serviceId: bookingData.serviceId,
        serviceName: selectedService?.name,
        date: bookingData.date,
        time: bookingData.time,
        patientName: encodePatientData(bookingData.patientName),
        patientPhone: encodePatientData(bookingData.patientPhone),
        patientEmail: encodePatientData(bookingData.patientEmail),
        notes: bookingData.notes,
        status: 'confirmed',
        createdAt: new Date(),
        confirmedAt: new Date()
      });

      setBookingId(bookingRef.id);
      setBookingConfirmed(true);
      
      // In a real implementation, you would send a confirmation notification here
      console.log('Booking confirmed:', { ...bookingData, id: bookingRef.id });
    } catch (error) {
      console.error('Error creating booking:', error);
      alert('Gagal membuat janji. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  // Reset booking process
  const resetBooking = () => {
    setStep(1);
    setSelectedService(null);
    setSelectedSlot(null);
    setBookingData({
      serviceId: '',
      date: '',
      time: '',
      patientName: '',
      patientPhone: '',
      patientEmail: '',
      notes: ''
    });
    setBookingConfirmed(false);
  };

  if (loading && services.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#061E29]" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-2xl shadow-lg">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-[#061E29] mb-2">Booking Janji Temu</h2>
        <p className="text-neutral-600">Pilih layanan, tanggal, dan waktu yang tersedia</p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-8 relative">
        <div className="absolute top-4 left-0 right-0 h-0.5 bg-neutral-200 -z-10"></div>
        {[1, 2, 3].map((num) => (
          <div key={num} className="flex flex-col items-center relative z-10">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              step >= num ? 'bg-[#061E29] text-white' : 'bg-neutral-200 text-neutral-500'
            }`}>
              {step > num ? <CheckCircle size={20} /> : num}
            </div>
            <span className={`mt-2 text-xs font-medium ${
              step >= num ? 'text-[#061E29]' : 'text-neutral-400'
            }`}>
              {num === 1 ? 'Layanan' : num === 2 ? 'Tanggal & Waktu' : 'Konfirmasi'}
            </span>
          </div>
        ))}
      </div>

      {/* Step 1: Service Selection */}
      {step === 1 && (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-[#061E29]">Pilih Layanan</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {services.map((service) => (
              <div
                key={service.id}
                onClick={() => handleSelectService(service)}
                className="border border-neutral-200 rounded-xl p-5 cursor-pointer hover:border-[#061E29] hover:bg-neutral-50 transition-all"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-[#061E29]">{service.name}</h4>
                    <p className="text-sm text-neutral-600 mt-1">{service.description}</p>
                    <p className="text-sm font-semibold text-[#061E29] mt-2">
                      Rp {service.price.toLocaleString('id-ID')}
                    </p>
                  </div>
                  <div className="text-sm text-neutral-500 bg-neutral-100 px-2 py-1 rounded">
                    ~{service.duration} menit
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Date & Time Selection */}
      {step === 2 && selectedService && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-[#061E29]">Pilih Tanggal & Waktu</h3>
            <button
              onClick={() => setStep(1)}
              className="flex items-center gap-2 text-sm text-[#061E29] hover:underline"
            >
              <ArrowLeft size={16} /> Kembali
            </button>
          </div>

          <div className="bg-neutral-50 p-4 rounded-xl">
            <h4 className="font-semibold text-[#061E29] mb-2">Layanan Terpilih</h4>
            <p className="text-[#061E29]">{selectedService.name}</p>
            <p className="text-sm text-neutral-600">Rp {selectedService.price.toLocaleString('id-ID')}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#061E29] mb-2">Pilih Tanggal</label>
            <input
              type="date"
              value={bookingData.date}
              onChange={(e) => handleSelectDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full p-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-[#061E29] focus:border-transparent"
            />
          </div>

          {availableSlots.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-[#061E29] mb-2">Pilih Waktu</label>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                {availableSlots
                  .filter(slot => slot.date === bookingData.date)
                  .map((slot, index) => (
                    <button
                      key={index}
                      onClick={() => handleSelectTime(slot.time)}
                      disabled={!slot.available}
                      className={`p-3 rounded-xl text-center text-sm font-medium ${
                        slot.available
                          ? 'bg-white border border-neutral-200 hover:border-[#061E29] hover:bg-neutral-50 cursor-pointer'
                          : 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
                      } ${
                        selectedSlot?.time === slot.time && selectedSlot.date === slot.date
                          ? 'border-2 border-[#061E29] bg-[#061E29]/5'
                          : ''
                      }`}
                    >
                      {slot.time}
                    </button>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Step 3: Confirmation */}
      {step === 3 && selectedService && selectedSlot && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-[#061E29]">Konfirmasi Janji</h3>
            <button
              onClick={() => setStep(2)}
              className="flex items-center gap-2 text-sm text-[#061E29] hover:underline"
            >
              <ArrowLeft size={16} /> Kembali
            </button>
          </div>

          {/* Booking Summary */}
          <div className="bg-neutral-50 p-5 rounded-xl space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-[#061E29] text-white rounded-lg">
                <User size={20} />
              </div>
              <div>
                <h4 className="font-semibold text-[#061E29]">Layanan</h4>
                <p className="text-[#061E29]">{selectedService.name}</p>
                <p className="text-sm text-neutral-600">Rp {selectedService.price.toLocaleString('id-ID')}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 bg-[#061E29] text-white rounded-lg">
                <Calendar size={20} />
              </div>
              <div>
                <h4 className="font-semibold text-[#061E29]">Tanggal & Waktu</h4>
                <p className="text-[#061E29]">
                  {new Date(selectedSlot.date).toLocaleDateString('id-ID', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })} • {selectedSlot.time}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 bg-[#061E29] text-white rounded-lg">
                <Clock size={20} />
              </div>
              <div>
                <h4 className="font-semibold text-[#061E29]">Perkiraan Durasi</h4>
                <p className="text-[#061E29]">~{selectedService.duration} menit</p>
              </div>
            </div>
          </div>

          {/* Patient Information Form */}
          <div className="space-y-4">
            <h4 className="font-semibold text-[#061E29]">Informasi Pasien</h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#061E29] mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  name="patientName"
                  value={bookingData.patientName}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-[#061E29] focus:border-transparent"
                  placeholder="Nama lengkap Anda"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#061E29] mb-1">Nomor WhatsApp</label>
                <input
                  type="tel"
                  name="patientPhone"
                  value={bookingData.patientPhone}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-[#061E29] focus:border-transparent"
                  placeholder="Contoh: 081234567890"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#061E29] mb-1">Email</label>
                <input
                  type="email"
                  name="patientEmail"
                  value={bookingData.patientEmail}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-[#061E29] focus:border-transparent"
                  placeholder="email@contoh.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#061E29] mb-1">Catatan Tambahan (Opsional)</label>
              <textarea
                name="notes"
                value={bookingData.notes}
                onChange={handleInputChange}
                rows={3}
                className="w-full p-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-[#061E29] focus:border-transparent"
                placeholder="Gejala, keluhan, atau informasi tambahan lainnya"
              />
            </div>
          </div>

          <button
            onClick={handleSubmitBooking}
            disabled={loading || !bookingData.patientName || !bookingData.patientPhone || !bookingData.patientEmail}
            className="w-full bg-[#061E29] text-white py-4 rounded-xl font-bold hover:bg-[#0a2d3d] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Memproses...
              </>
            ) : (
              'Konfirmasi Janji Temu'
            )}
          </button>
        </div>
      )}

      {/* Booking Confirmation */}
      {bookingConfirmed && (
        <div className="text-center py-10">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} />
          </div>
          <h3 className="text-2xl font-bold text-[#061E29] mb-2">Janji Temu Dikonfirmasi!</h3>
          <p className="text-neutral-600 mb-6">
            Terima kasih {bookingData.patientName}. Janji temu Anda telah berhasil dibuat.
          </p>
          
          <div className="bg-neutral-50 p-5 rounded-xl text-left max-w-md mx-auto mb-6">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-neutral-600">Layanan:</span>
                <span className="font-medium">{selectedService?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600">Tanggal:</span>
                <span className="font-medium">
                  {new Date(selectedSlot?.date || '').toLocaleDateString('id-ID', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600">Waktu:</span>
                <span className="font-medium">{selectedSlot?.time}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600">ID Booking:</span>
                <span className="font-medium font-mono">{bookingId}</span>
              </div>
            </div>
          </div>
          
          <button
            onClick={resetBooking}
            className="bg-[#061E29] text-white py-3 px-8 rounded-xl font-bold hover:bg-[#0a2d3d] transition-colors"
          >
            Buat Janji Baru
          </button>
        </div>
      )}
    </div>
  );
}