<template>
  <div class="w-full">
    <div class="flex items-center gap-2 mb-6">
      <div class="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30 shadow-sm">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>
      </div>
      <h2 class="text-xl font-extrabold tracking-tight text-white">Log Incident</h2>
    </div>
    
    <form @submit.prevent="submitIncident" class="flex flex-col gap-6">
      
      <div>
        <label for="location-context" class="block text-sm font-semibold text-white/80 mb-1.5">Location Context</label>
        <input 
          id="location-context" 
          type="text" 
          v-model="locationContext" 
          required 
          placeholder="e.g., Section 112, Gate B" 
          class="w-full px-4 py-3 border border-white/10 rounded-xl bg-white/5 text-white placeholder-zinc-500 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 focus:outline-none transition-all"
        />
      </div>

      <div>
        <label class="block text-sm font-semibold text-white/80 mb-1.5">Upload Photo Evidence</label>
        
        <div class="relative group mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-white/20 border-dashed rounded-xl hover:border-indigo-500/50 hover:bg-indigo-500/10 transition-all duration-300 bg-white/5 overflow-hidden min-h-[180px]">
          <div class="space-y-2 text-center flex flex-col items-center justify-center z-10" :class="{'opacity-0': previewImage}">
            <div class="w-12 h-12 rounded-full bg-white/5 border border-white/10 shadow-sm flex items-center justify-center mb-2">
              <svg class="h-6 w-6 text-white/40 group-hover:text-indigo-400 transition-colors" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </div>
            <div class="flex text-sm text-white/60">
              <label for="incident-image" class="relative cursor-pointer bg-transparent rounded-md font-bold text-indigo-400 hover:text-indigo-300 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-[#0a0a1a] focus-within:ring-indigo-500">
                <span>Upload a file</span>
                <input id="incident-image" type="file" accept="image/*" @change="handleFileUpload" aria-label="Upload photo of the incident" class="sr-only" />
              </label>
              <p class="pl-1">or drag and drop</p>
            </div>
            <p class="text-xs text-white/40">PNG, JPG up to 10MB</p>
          </div>
          
          <!-- Modern Image Preview Overlay -->
          <div v-if="previewImage" class="absolute inset-0 z-0">
            <img :src="previewImage" alt="Incident preview thumbnail" class="w-full h-full object-cover" />
            <div class="absolute inset-0 bg-gradient-to-t from-zinc-900/80 via-zinc-900/20 to-transparent flex flex-col justify-end p-4">
               <div class="flex items-center gap-2 text-white">
                 <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-emerald-400"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                 <span class="font-semibold text-sm drop-shadow-md">Image attached</span>
               </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="isProcessing" class="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-center gap-3 animate-pulse">
        <svg class="animate-spin h-5 w-5 text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
        <p class="font-semibold text-indigo-300 text-sm m-0">Gemini Vision Processing...</p>
      </div>

      <div v-if="aiAnalysisResult" class="p-4 bg-white/5 border border-white/10 rounded-xl relative overflow-hidden">
        <div class="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-500 to-violet-500"></div>
        <div class="flex flex-col gap-2.5 text-sm pl-2">
          <p class="flex justify-between border-b border-white/10 pb-2"><strong class="text-white/40 uppercase tracking-wider text-xs">Type</strong> <span class="font-semibold text-white/90">{{ aiAnalysisResult.type }}</span></p>
          <p class="flex justify-between border-b border-white/10 pb-2"><strong class="text-white/40 uppercase tracking-wider text-xs">Severity</strong> <span class="font-semibold text-white/90">{{ aiAnalysisResult.severity }}</span></p>
          <div>
            <strong class="text-white/40 uppercase tracking-wider text-xs block mb-1">AI Recommendation</strong>
            <span class="text-white/70 italic block">{{ aiAnalysisResult.dispatchOrder }}</span>
          </div>
        </div>
      </div>

      <BaseButton type="submit" variant="primary" :disabled="!locationContext || isProcessing" block aria-label="Confirm and Dispatch Incident" class="mt-2">
        Dispatch Team
      </BaseButton>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useStadiumStore } from '../../store/useStadiumStore';
import { processVisionIncident } from '../../services/gemini';
import BaseButton from '../common/BaseButton.vue';
import type { Incident } from '../../types';

const store = useStadiumStore();

const locationContext = ref('');
const isProcessing = ref(false);
const fileData = ref<{ base64: string; mimeType: string } | null>(null);
const previewImage = ref<string | null>(null);

const aiAnalysisResult = ref<{ type: string; severity: string; dispatchOrder: string } | null>(null);

const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (!target.files || target.files.length === 0) return;
  
  const file = target.files[0];
  const reader = new FileReader();
  
  reader.onload = async (e) => {
    const result = e.target?.result as string;
    previewImage.value = result;
    
    const splitIndex = result.indexOf('base64,');
    if (splitIndex !== -1) {
      const mimeType = result.substring(5, splitIndex - 1);
      const base64 = result.substring(splitIndex + 7);
      fileData.value = { base64, mimeType };
      
      // Auto-analyze
      await analyzeImage();
    }
  };
  
  reader.readAsDataURL(file);
};

const analyzeImage = async () => {
  if (!fileData.value || !locationContext.value) return;
  
  isProcessing.value = true;
  aiAnalysisResult.value = null;
  
  try {
    aiAnalysisResult.value = await processVisionIncident(
      fileData.value.base64, 
      fileData.value.mimeType, 
      locationContext.value
    );
  } catch (error) {
    console.error(error);
  } finally {
    isProcessing.value = false;
  }
};

const submitIncident = async () => {
  if (!locationContext.value) return;
  
  const type = aiAnalysisResult.value?.type || 'FACILITY_DAMAGE';
  const severity = aiAnalysisResult.value?.severity || 'LOW';
  const description = aiAnalysisResult.value?.dispatchOrder || `Manual triage required at ${locationContext.value}.`;
  
  await store.addIncident({
    reportedBy: store.currentSession?.id || 'unknown',
    location: {
      section: locationContext.value,
      gate: 'Unknown',
      coordinates: [43.6821, -79.6122]
    },
    type: type as Incident['type'],
    severity: severity as Incident['severity'],
    description: description,
    status: 'OPEN'
  });
  
  // Reset
  locationContext.value = '';
  fileData.value = null;
  previewImage.value = null;
  aiAnalysisResult.value = null;
};
</script>
