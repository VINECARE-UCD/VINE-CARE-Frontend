import { useEffect } from 'react';

export default function Toast({ msg, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3000);
    return () => clearTimeout(t);
  }, [msg, onDone]);

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-forest text-white text-sm px-5 py-3 rounded-xl shadow-lg z-50">
      {msg}
    </div>
  );
}
