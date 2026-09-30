/**
 * Audio Test Screen - Developer Only
 * Minimal TTS test that bypasses all application logic
 * 
 * STEP 8: Test that ANY audio can be produced before testing narration
 */

import { useState } from "react";
import { TextToSpeech } from "@capacitor-community/text-to-speech";
import { Capacitor } from "@capacitor/core";
import { 
  logAudioDiagnostics, 
  testWebSpeechAPI, 
  getWebSpeechVoices,
  captureAudioDiagnostics 
} from "@/lib/audio-diagnostics";

export function AudioTestScreen() {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const log = (message: string) => {
    console.log("[AUDIO TEST]", message);
    setTestResults(prev => [...prev, message]);
  };

  const testNativeTTS = async () => {
    log("🔵 Starting Native TTS test...");
    log(`Platform: ${Capacitor.getPlatform()}`);
    log(`Is Native: ${Capacitor.isNativePlatform()}`);

    if (!Capacitor.isNativePlatform()) {
      log("❌ Not on native platform - skipping native TTS test");
      return;
    }

    try {
      log("📢 Calling TextToSpeech.speak('Hello explorer')...");
      const result = await TextToSpeech.speak({
        text: "Hello explorer",
        lang: "en",
        rate: 1.0,
        pitch: 1.0,
        volume: 1.0,
        category: "ambient",
      });

      log("✅ TextToSpeech.speak() completed");
      log(`Result: ${JSON.stringify(result)}`);
      
      if (result?.success === false) {
        log("⚠️ Plugin reported success=false");
      } else {
        log("✅ Native TTS test passed!");
      }
    } catch (error) {
      log(`❌ Exception: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const testWebSpeech = async () => {
    log("🔵 Starting Web Speech API test...");

    const result = await testWebSpeechAPI("Hello explorer");
    log(result.success ? `✅ ${result.message}` : `❌ ${result.message}`);
  };

  const showDiagnostics = () => {
    log("🔵 Capturing diagnostics...");
    logAudioDiagnostics("MANUAL TRIGGER");
    const diag = captureAudioDiagnostics();
    
    log(`Platform: ${diag.platform}`);
    log(`Is Native: ${diag.isNativePlatform}`);
    log(`Audio Consent: ${diag.audioNarrationConsent}`);
    log(`Sound Toggle: ${diag.soundToggleOn}`);
    log(`Web Speech Available: ${diag.speechSynthesisAvailable}`);
    log(`Voices: ${diag.voicesAvailable}`);
    log(`AudioContext Available: ${diag.audioContextAvailable}`);
  };

  const showVoices = () => {
    log("🔵 Checking Web Speech voices...");
    const { voices, diagnostics } = getWebSpeechVoices();
    log(`Found ${voices.length} voices`);
    log(diagnostics);
    
    if (voices.length === 0) {
      log("⚠️ No voices available - Web Speech API may not work");
    } else {
      log("✅ Voices available:");
      voices.slice(0, 5).forEach((voice, i) => {
        log(`  ${i + 1}. ${voice.name} (${voice.lang})`);
      });
      if (voices.length > 5) {
        log(`  ... and ${voices.length - 5} more`);
      }
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  const runAllTests = async () => {
    setIsRunning(true);
    clearResults();
    
    log("=== RUNNING ALL AUDIO TESTS ===");
    await new Promise(r => setTimeout(r, 500));
    
    showDiagnostics();
    await new Promise(r => setTimeout(r, 1000));
    
    showVoices();
    await new Promise(r => setTimeout(r, 1000));
    
    await testWebSpeech();
    await new Promise(r => setTimeout(r, 2000));
    
    await testNativeTTS();
    
    log("=== TESTS COMPLETE ===");
    setIsRunning(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-blue-100 p-[--padding-md]">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-[--padding-lg] mb-[--space-2]">
          <h1 className="text-3xl font-bold text-purple-600 mb-[--space-0-5]">🔊 Audio Test Screen</h1>
          <p className="text-sm text-gray-600 mb-[--space-2]">Developer-only minimal TTS test</p>

          {/* Buttons */}
          <div className="grid grid-cols-2 gap-[--gap-base] mb-[--space-2]">
            <button
              onClick={runAllTests}
              disabled={isRunning}
              className="bg-gradient-to-r from-green-400 to-green-600 text-white font-bold py-[--padding-base] px-[--padding-md] rounded-lg hover:from-green-500 hover:to-green-700 disabled:opacity-50"
            >
              🚀 Run All Tests
            </button>
            <button
              onClick={testNativeTTS}
              disabled={isRunning}
              className="bg-blue-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-600 disabled:opacity-50"
            >
              📢 Native TTS
            </button>
            <button
              onClick={testWebSpeech}
              disabled={isRunning}
              className="bg-blue-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-600 disabled:opacity-50"
            >
              🗣️ Web Speech
            </button>
            <button
              onClick={showDiagnostics}
              disabled={isRunning}
              className="bg-purple-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-purple-600 disabled:opacity-50"
            >
              📊 Diagnostics
            </button>
            <button
              onClick={showVoices}
              disabled={isRunning}
              className="bg-indigo-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-600 disabled:opacity-50"
            >
              🎤 Show Voices
            </button>
            <button
              onClick={clearResults}
              disabled={isRunning}
              className="bg-red-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-red-600 disabled:opacity-50"
            >
              🗑️ Clear
            </button>
          </div>

          {/* Results */}
          <div className="bg-gray-900 text-green-400 font-mono text-sm p-[--padding-md] rounded-lg overflow-y-auto max-h-96 border border-green-600">
            {testResults.length === 0 ? (
              <div className="text-gray-500">Click a button to start testing...</div>
            ) : (
              testResults.map((result, i) => (
                <div key={i} className="mb-1">
                  {result}
                </div>
              ))
            )}
          </div>

          {/* Instructions */}
          <div className="mt-[--space-2] p-[--padding-md] bg-yellow-50 border-l-4 border-yellow-400">
            <p className="text-sm text-yellow-800 font-semibold mb-[--space-0-25]">📝 Testing Instructions:</p>
            <ol className="text-sm text-yellow-700 list-decimal list-inside space-y-[--space-0-25]">
              <li>Click "Run All Tests" to test everything</li>
              <li>Check console for [AUDIO DEBUG] logs</li>
              <li>If Native TTS test works → audio system is OK</li>
              <li>If Native TTS fails → check AndroidManifest.xml permissions</li>
              <li>If Web Speech test works → browser can speak</li>
              <li>Report all test results to debug the narration issue</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
