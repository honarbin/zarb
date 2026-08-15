import React, { useState, useEffect } from 'react';
import { Volume2, Play, Pause, AlertTriangle, CheckCircle, RefreshCw, Smartphone, Monitor } from 'lucide-react';
import { sounds, useAudioState } from '../utils/persian';

export const AudioDiagnosticPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  // Diagnostic state fields
  const [selectedF1, setSelectedF1] = useState<number>(3);
  const [selectedF2, setSelectedF2] = useState<number>(3);
  const [audioFileStatus, setAudioFileStatus] = useState<string>('در حال بررسی...');
  const [audioUrl, setAudioUrl] = useState<string>('/audio/multiplication/3-3.mp3');
  const [audioLoaded, setAudioLoaded] = useState<string>('هنوز تست نشده');
  const [audioCanPlay, setAudioCanPlay] = useState<string>('هنوز تست نشده');
  const [audioPlayResult, setAudioPlayResult] = useState<string>('برای تست روی دکمه TEST AUDIO کلیک کنید');
  const [speechSynthAvailable, setSpeechSynthAvailable] = useState<string>('در حال بررسی...');
  const [persianVoiceAvailable, setPersianVoiceAvailable] = useState<string>('در حال بررسی...');
  const [browserInfo, setBrowserInfo] = useState<string>('');
  const [deviceInfo, setDeviceInfo] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const { isPlaying, stopSpeech } = useAudioState();
  const isCurrentlyTesting = isPlaying('test-audio-sample');

  const checkFileStatus = (f1: number, f2: number) => {
    const url = `/audio/multiplication/${f1}-${f2}.mp3`;
    setAudioUrl(url);
    fetch(url, { method: 'HEAD' })
      .then((r) => {
        if (r.ok) {
          setAudioFileStatus(`بله - موجود است در /public/audio/multiplication/${f1}-${f2}.mp3 (Status: ${r.status})`);
        } else {
          setAudioFileStatus(`خیر - فایل صوتی هنوز اضافه نشده است (${r.status} ${r.statusText})`);
        }
      })
      .catch(() => {
        setAudioFileStatus('خطا در دریافت وضعیت فایل local MP3');
      });
  };

  useEffect(() => {
    // 1. Browser & Device detection
    const ua = navigator.userAgent;
    setBrowserInfo(ua);

    const isAndroid = /Android/i.test(ua);
    const isIOS = /iPhone|iPad|iPod/i.test(ua);
    const isMobile = isAndroid || isIOS || /Mobile/i.test(ua);
    setDeviceInfo(
      isAndroid
        ? 'اندروید (Android Mobile/Tablet)'
        : isIOS
        ? 'آیفون/آیپد (iOS)'
        : isMobile
        ? 'دستگاه موبایل'
        : 'رایانه / دسکتاپ (Desktop Web)'
    );

    checkFileStatus(selectedF1, selectedF2);

    // 2. SpeechSynthesis dependency status
    setSpeechSynthAvailable('حذف گردید (معماری ۱۰۰٪ MP3 محلی بدون وابستگی به مرورگر)');
    setPersianVoiceAvailable('عدم نیاز (پخش مستقیم فایل MP3 محلی)');
  }, []);

  const handlePairChange = (f1: number, f2: number) => {
    setSelectedF1(f1);
    setSelectedF2(f2);
    checkFileStatus(f1, f2);
  };

  const handleTestAudio = async () => {
    const testUrl = `/audio/multiplication/${selectedF1}-${selectedF2}.mp3`;
    setAudioUrl(testUrl);
    setAudioLoaded('در حال بارگیری (audio.load())...');
    setAudioCanPlay('در حال بررسی (canplay)...');
    setAudioPlayResult('در حال اجرای audio.play()...');
    setIsLoading(true);

    // Stop any previously playing audio immediately
    sounds.stopSpeech();

    // Create fresh HTML5 Audio instance
    const testAudio = new Audio(testUrl);

    testAudio.onloadeddata = () => {
      setAudioLoaded('بله (audio.load() و event: loadeddata موفقیت‌آمیز بود)');
    };

    testAudio.oncanplay = () => {
      setAudioCanPlay('بله (event: canplay/canplaythrough موفقیت‌آمیز بود)');
    };

    testAudio.onerror = (e) => {
      setIsLoading(false);
      const mediaErr = testAudio.error;
      let errMsg = `فایل صوتی هنوز اضافه نشده است (مسیر: ${testUrl})`;
      if (mediaErr) {
        if (mediaErr.code === 1) errMsg = 'MEDIA_ERR_ABORTED: پخش توسط کاربر متوقف شد';
        if (mediaErr.code === 2) errMsg = 'MEDIA_ERR_NETWORK: خطای شبکه در دریافت فایل صوتی';
        if (mediaErr.code === 3) errMsg = 'MEDIA_ERR_DECODE: خطای رمزگشایی فرمت صوتی MP3';
        if (mediaErr.code === 4) errMsg = `فایل صوتی هنوز اضافه نشده است (مسیر: ${testUrl})`;
      }
      setAudioPlayResult(`❌ خطای HTML5 Audio: ${errMsg}`);
      console.warn(`فایل صوتی هنوز اضافه نشده است (مسیر: ${testUrl})`, e);
    };

    // Execute play() within click handler
    try {
      const playPromise = testAudio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsLoading(false);
            setAudioPlayResult(`✅ موفقیت‌آمیز! audio.play() برای ${selectedF1}×${selectedF2} با موفقیت اجرا شد.`);
            sounds.speakTraditionalMultiplication(selectedF1, selectedF2, 'test-audio-sample');
          })
          .catch((err: Error) => {
            setIsLoading(false);
            setAudioPlayResult(`❌ خطای اجرای audio.play(): [${err.name}] ${err.message}`);
            console.error('Audio playPromise rejected error:', err);
          });
      } else {
        setIsLoading(false);
        setAudioPlayResult('✅ audio.play() آغاز شد.');
      }
    } catch (err: unknown) {
      setIsLoading(false);
      const errorObj = err as Error;
      setAudioPlayResult(`❌ خطای همزمان در فراخوانی audio.play(): ${errorObj?.message || String(err)}`);
      console.error('Synchronous audio play error:', err);
    }
  };

  return (
    <div className={`transition-all duration-300 rounded-3xl p-5 my-4 ${
      isOpen 
        ? 'bg-slate-900 text-slate-100 border-4 border-amber-400 shadow-2xl space-y-4' 
        : 'bg-amber-100/30 border border-amber-200/80 text-slate-700 shadow-xs'
    } text-right dir-rtl max-w-xl mx-auto`}>
      {/* Header Banner */}
      <div className={`flex items-center justify-between ${isOpen ? 'border-b border-slate-700 pb-3' : ''}`}>
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-xl border ${
            isOpen 
              ? 'bg-amber-500/20 text-amber-400 border-amber-500/40' 
              : 'bg-amber-100 text-amber-800 border-amber-200'
          }`}>
            <Volume2 className="w-4 h-4" />
          </div>
          <div>
            <h2 className={`text-xs font-black ${isOpen ? 'text-lg text-amber-400' : 'text-slate-800'}`}>
              عیب‌یاب و تست پخش صدا
            </h2>
            {!isOpen && (
              <p className="text-[10px] text-slate-500 font-semibold">
                اگر صدای برنامه را نمی‌شنوید، اینجا کلیک کنید
              </p>
            )}
            {isOpen && (
              <p className="text-[11px] text-slate-300 font-bold">
                تست قطعی پخش صدای فارسی «سه سه تا، نه تا» و بررسی مشخصات سیستم
              </p>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`px-2.5 py-1 text-[11px] font-black rounded-lg transition-colors cursor-pointer border ${
            isOpen 
              ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-600' 
              : 'bg-amber-100 hover:bg-amber-200 text-amber-900 border-amber-300/60'
          }`}
        >
          {isOpen ? 'بستن عیب‌یاب ▲' : 'شروع عیب‌یابی ▼'}
        </button>
      </div>

      {isOpen && (
        <div className="space-y-4">
          {/* Diagnostic Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs font-mono">
            <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700 space-y-1">
              <span className="text-amber-400 font-bold block">Audio file:</span>
              <span className="text-slate-200 font-bold break-all">{audioFileStatus}</span>
            </div>

            <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700 space-y-1">
              <span className="text-amber-400 font-bold block">Audio URL:</span>
              <span className="text-slate-200 font-bold break-all dir-ltr text-right">{audioUrl}</span>
            </div>

            <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700 space-y-1">
              <span className="text-amber-400 font-bold block">Audio loaded:</span>
              <span className="text-slate-200 font-bold">{audioLoaded}</span>
            </div>

            <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700 space-y-1">
              <span className="text-amber-400 font-bold block">Audio canPlay:</span>
              <span className="text-slate-200 font-bold">{audioCanPlay}</span>
            </div>

            <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700 space-y-1 md:col-span-2">
              <span className="text-amber-400 font-bold block">Audio play result:</span>
              <span
                className={`font-black break-words ${
                  audioPlayResult.startsWith('✅')
                    ? 'text-emerald-400'
                    : audioPlayResult.startsWith('❌')
                    ? 'text-rose-400'
                    : 'text-amber-200'
                }`}
              >
                {audioPlayResult}
              </span>
            </div>

            <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700 space-y-1">
              <span className="text-sky-400 font-bold block">SpeechSynthesis available:</span>
              <span className="text-slate-200 font-bold">{speechSynthAvailable}</span>
            </div>

            <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700 space-y-1">
              <span className="text-sky-400 font-bold block">Persian voice available:</span>
              <span className="text-slate-200 font-bold">{persianVoiceAvailable}</span>
            </div>

            <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700 space-y-1 md:col-span-2">
              <span className="text-purple-400 font-bold block">Browser:</span>
              <span className="text-slate-300 text-[11px] break-all dir-ltr text-right block">{browserInfo}</span>
            </div>

            <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700 space-y-1 md:col-span-2">
              <span className="text-purple-400 font-bold block">Device:</span>
              <span className="text-slate-200 font-bold">{deviceInfo}</span>
            </div>
          </div>

          {/* TEST AUDIO BUTTON & FACTOR SELECTOR */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-950 p-4 rounded-2xl border border-slate-800">
            <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-slate-300">
              <span>انتخاب ضرب:</span>
              <select
                value={selectedF1}
                onChange={(e) => handlePairChange(Number(e.target.value), selectedF2)}
                className="bg-slate-800 text-amber-300 px-2 py-1 rounded-lg border border-slate-700 font-bold focus:outline-none"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
              <span>×</span>
              <select
                value={selectedF2}
                onChange={(e) => handlePairChange(selectedF1, Number(e.target.value))}
                className="bg-slate-800 text-amber-300 px-2 py-1 rounded-lg border border-slate-700 font-bold focus:outline-none"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
              <span className="text-slate-400 mr-1">(/audio/multiplication/{selectedF1}-{selectedF2}.mp3)</span>
            </div>

            <button
              id="test-audio-btn"
              type="button"
              onClick={handleTestAudio}
              disabled={isLoading}
              className="w-full sm:w-auto px-6 py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 active:scale-98 text-slate-950 font-black rounded-2xl shadow-lg border-b-4 border-amber-700 flex items-center justify-center gap-2 cursor-pointer transition-all text-sm"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin text-slate-950" />
                  <span>در حال انجام تست...</span>
                </>
              ) : isCurrentlyTesting ? (
                <>
                  <Pause className="w-5 h-5 fill-slate-950" />
                  <span>توقف پخش</span>
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 fill-slate-950" />
                  <span>دکمه TEST AUDIO ({selectedF1}×{selectedF2})</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
