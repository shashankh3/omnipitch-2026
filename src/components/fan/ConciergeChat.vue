<template>
  <div class="flex flex-col h-full">
    <div class="flex-1 overflow-y-auto flex flex-col gap-4 pr-1 custom-scrollbar" aria-live="polite" aria-atomic="false">
      <div
        v-for="(msg, index) in messages"
        :key="index"
        class="max-w-[88%] p-3.5 text-sm shadow-sm transform transition-all duration-300"
        :class="getChatClass(msg.role)"
      >
        <span class="sr-only">{{ msg.role === 'user' ? 'You said:' : 'AI Assistant said:' }}</span>
        <p class="m-0 leading-relaxed whitespace-pre-wrap">{{ msg.text }}</p>
      </div>

      <!-- Typing Indicator -->
      <div v-if="isLoading" class="self-start max-w-[88%] p-4 bg-white/5 border border-white/5 text-white/40 rounded-2xl rounded-bl-sm flex items-center gap-2">
        <div class="flex space-x-1">
          <div class="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce"></div>
          <div class="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
          <div class="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
        </div>
      </div>
    </div>

    <form @submit.prevent="sendMessage" class="mt-4 pt-4 border-t border-white/5 flex gap-2">
      <div class="relative flex-1">
        <label for="chat-input" class="sr-only">Type your question</label>
        <input
          id="chat-input"
          type="text"
          v-model="query"
          placeholder="Ask about navigation, crowd, weather..."
          class="w-full pl-4 pr-10 py-3 border border-white/10 rounded-xl bg-white/5 text-white shadow-sm focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400/40 focus:outline-none transition-all placeholder-white/20 text-sm"
          :disabled="isLoading"
        />
      </div>
      <button
        type="submit"
        class="bg-gradient-to-br from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 disabled:opacity-30 text-white rounded-xl px-4 flex items-center justify-center shadow-md transition-all focus:ring-2 focus:ring-amber-400/40 focus:outline-none"
        :disabled="isLoading || !query.trim()"
        aria-label="Send Message"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" x2="11" y1="2" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useStadiumStore } from '../../store/useStadiumStore';
import { getFanAssistance } from '../../services/gemini';

const store = useStadiumStore();
const query = ref('');
const isLoading = ref(false);
const messages = ref<{role: 'user'|'ai'|'system', text: string}[]>([
  { role: 'ai', text: 'Welcome to OmniPitch! 🏟️\n\nI\'m your AI Stadium Copilot powered by Gemini. I can help with:\n\n• Finding your seat & navigation\n• Crowd density & best routes\n• Food, restrooms & facilities\n• Weather alerts & safety info\n\nHow can I help you today?' }
]);

const getChatClass = (role: string) => {
  if (role === 'user') return 'self-end bg-gradient-to-br from-amber-500/90 to-orange-600/90 text-white rounded-2xl rounded-br-sm';
  if (role === 'system') return 'self-start bg-red-500/10 text-red-300 border border-red-500/20 rounded-2xl rounded-bl-sm';
  return 'self-start bg-white/5 text-white/80 rounded-2xl rounded-bl-sm border border-white/5';
};

const sendMessage = async () => {
  if (!query.value.trim() || isLoading.value) return;

  const userText = query.value;
  messages.value.push({ role: 'user', text: userText });
  query.value = '';
  isLoading.value = true;

  try {
    const response = await getFanAssistance(
      userText,
      store.currentSession?.language || 'en',
      store.telemetry,
      store.currentSession?.accessibilityProfile.requiresStepFree || false
    );

    if (response === "API_KEY_MISSING") {
      messages.value.push({
        role: 'system',
        text: '⚠️ Gemini API Key Missing\n\nCreate a .env file in the project root:\n\nVITE_GEMINI_API_KEY="your_key"'
      });
    } else {
      messages.value.push({ role: 'ai', text: response });
    }
  } catch (error) {
    messages.value.push({ role: 'system', text: 'Network error. Please try again.' });
  } finally {
    isLoading.value = false;
  }
};
</script>
