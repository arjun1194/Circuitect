import React from 'react';
import { X, CheckCircle, AlertTriangle } from 'lucide-react';

export default function ValidationModal({ success, message, onNext, onRetry, isLastLevel }) {
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
            <div className="bg-[#24283b] w-96 rounded-xl shadow-2xl border border-[#414868] p-6 transform scale-100 transition-all">
                <div className="flex flex-col items-center text-center">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${success ? 'bg-[#9ece6a]/20 text-[#9ece6a]' : 'bg-[#f7768e]/20 text-[#f7768e]'
                        }`}>
                        {success ? <CheckCircle size={40} /> : <AlertTriangle size={40} />}
                    </div>

                    <h2 className="text-xl font-bold text-white mb-2">
                        {success ? 'Circuit Functional!' : 'Test Failed'}
                    </h2>

                    <p className="text-[#9aa5ce] mb-6 leading-relaxed">
                        {message}
                    </p>

                    <div className="flex gap-3 w-full">
                        {success ? (
                            <button
                                onClick={onNext}
                                className="flex-1 bg-[#9ece6a] text-[#1a1c23] font-bold py-3 rounded-lg hover:opacity-90 transition-transform active:scale-95"
                            >
                                {isLastLevel ? 'Finish Game' : 'Next Level →'}
                            </button>
                        ) : (
                            <button
                                onClick={onRetry}
                                className="flex-1 bg-[#2f3549] text-white font-bold py-3 rounded-lg hover:bg-[#414868] transition-colors"
                            >
                                Try Again
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
