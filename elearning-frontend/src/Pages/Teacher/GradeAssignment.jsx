import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function GradeAssignment() {
  const { id_submission } = useParams();
  const navigate = useNavigate();

  const [score, setScore] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleGiveScore = async () => {
    if (!id_submission) {
      return setErrorMessage("Error: ID Pengumpulan tidak ditemukan.");
    }

    const numScore = parseInt(score);
    if (isNaN(numScore) || numScore < 0 || numScore > 100) {
      return setErrorMessage("Masukkan nilai antara 0 - 100!");
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const response = await fetch(`/api/assignment/${id_submission}/score`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({ score: numScore }),
        credentials: "include",
      });

      const result = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(result?.message || `Gagal menyimpan (Status: ${response.status})`);
      }

      navigate(-1);
    } catch (error) {
      console.error("DEBUG FETCH:", error);
      setErrorMessage(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const numValue = parseInt(score);
  const isInvalid = score !== "" && (numValue < 0 || numValue > 100 || isNaN(numValue));
  const isValidScore = score !== "" && !isInvalid;

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6">
      <div className="absolute top-0 left-0 w-full h-48 bg-[#0D264F] z-0 shadow-lg"></div>
      <div className="relative z-10 bg-white rounded-[2rem] shadow-xl p-8 md:p-10 w-full max-w-md border border-slate-100">
        <div className="text-center mb-8">
          <div className="bg-blue-50 w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-100">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-slate-800">Input Nilai Siswa</h2>
          <div className="mt-2 inline-flex items-center gap-2 bg-slate-50 px-3 py-1 rounded-md border border-slate-100">
             <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
             <span className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">ID: #{id_submission}</span>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-slate-400 text-[11px] font-black uppercase tracking-widest mb-3 ml-1">
              Skor Akhir (0-100)
            </label>
            
            <div className="relative">
              <input
                type="number"
                value={score}
                onChange={(e) => {
                  setScore(e.target.value);
                  setErrorMessage("");
                }}
                placeholder="0"
                className={`w-full bg-slate-50 border-2 rounded-xl px-6 py-4 text-3xl font-bold transition-all duration-200 text-center outline-none
                  ${isInvalid 
                    ? "border-red-200 text-red-500 bg-red-50 focus:border-red-400" 
                    : "border-slate-100 text-slate-800 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/5"
                  }`}
              />
              <span className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 font-bold">
                / 100
              </span>
            </div>

            {isInvalid && (
              <p className="text-red-500 text-[11px] font-bold text-center mt-2">
                Nilai harus berada di rentang 0 - 100
              </p>
            )}
          </div>

          <div className="flex flex-col gap-3 pt-2">
            <button
              onClick={handleGiveScore}
              disabled={isSubmitting || !isValidScore}
              className={`w-full py-4 rounded-xl font-bold transition-all duration-200 shadow-md active:scale-[0.98]
                ${isValidScore 
                  ? "bg-[#0D264F] text-white hover:bg-blue-900" 
                  : "bg-slate-100 text-slate-300 cursor-not-allowed shadow-none"
                }`}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Menyimpan...
                </span>
              ) : "Simpan Nilai"}
            </button>
          </div>
        </div>

        {errorMessage && !isInvalid && (
          <div className="mt-5 p-3 bg-red-50 border border-red-100 rounded-xl flex items-center gap-2">
            <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <p className="text-red-600 text-[11px] font-bold">{errorMessage}</p>
          </div>
        )}
      </div>
    </div>
  );
}