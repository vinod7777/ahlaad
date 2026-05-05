import { useState, useEffect } from 'react';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export default function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    // Ahlaad 2026 — June 26, 2026 at 09:00 AM IST
    const eventDate = new Date('2026-06-26T09:00:00+05:30');

    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const distance = eventDate.getTime() - now;

      if (distance > 0) {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000),
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, []);

  const timeBoxes = [
    { value: timeLeft.days, label: 'Days' },
    { value: timeLeft.hours, label: 'Hours' },
    { value: timeLeft.minutes, label: 'Minutes' },
    { value: timeLeft.seconds, label: 'Seconds' },
  ];

  return (
    <div className="flex gap-3 sm:gap-4">
      {timeBoxes.map((box, index) => (
        <div key={index} className="countdown-box group">
          <span 
            key={`${index}-${box.value}`} 
            className="countdown-number animate-in fade-in zoom-in duration-300"
          >
            {String(box.value).padStart(2, '0')}
          </span>
          <span className="countdown-label">{box.label}</span>
          
          {/* Decorative glow line */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#C9A84C]/40 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
        </div>
      ))}
    </div>
  );
}
