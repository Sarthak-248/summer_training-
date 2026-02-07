import { toast } from 'react-hot-toast';

export const showSuccessToast = (title, message) => {
  toast.custom((t) => (
    <div
      className={`${
        t.visible ? 'animate-enter' : 'animate-leave'
      } max-w-md w-full bg-slate-900 border border-white/10 shadow-2xl rounded-2xl pointer-events-auto flex ring-1 ring-black ring-opacity-5 relative overflow-hidden`}
    >
      {/* Status Bar */}
      <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-green-400 to-emerald-600"></div>
      
      <div className="flex-1 w-0 p-4 pl-6">
        <div className="flex items-start">
          <div className="flex-shrink-0 pt-0.5">
            <div className="h-10 w-10 rounded-full bg-green-500/20 flex items-center justify-center">
               <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
               </svg>
            </div>
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm font-bold text-white">
              {title}
            </p>
            <p className="mt-1 text-sm text-slate-300">
              {message}
            </p>
          </div>
        </div>
      </div>
      <div className="flex border-l border-white/10">
        <button
          onClick={() => toast.dismiss(t.id)}
          className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-slate-400 hover:text-white focus:outline-none hover:bg-white/5 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  ), { duration: 5000 });
};

export const showErrorToast = (message) => {
    toast.error(message, {
        style: {
          background: '#1e293b',
          color: '#fff',
          border: '1px solid rgba(255,50,50,0.2)',
        },
    });
}
