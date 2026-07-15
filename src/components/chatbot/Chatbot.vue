<script setup>
import { ref, onMounted, nextTick, watch } from "vue"
import { getRecommendations, findRecommendation } from "@/servies/recommendService"

const messages = ref([])
const input = ref("")
const messagesContainer = ref(null)

let recommendations = []

function scrollToBottom() {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

onMounted(async () => {
  recommendations = await getRecommendations()

  messages.value.push({
    role: "bot",
    text: "안녕하세요! 운동하고 싶은 지역을 입력해주세요.\n예) 강남구"
  })

  scrollToBottom()
})

watch(messages, () => {
  scrollToBottom()
}, { deep: true })

function sendMessage() {
  const district = input.value.trim()

  if (!district) {
    return
  }

  messages.value.push({
    role: "user",
    text: district
  })

  const result = findRecommendation(recommendations, district)

  if (result) {
    messages.value.push({
      role: "bot",
      text: `${result.district} 운동 장소를 추천드립니다.\n\n📍 ${result.title}\n\n운동 종류:\n${result.category}\n\n주소:\n${result.address}\n\n${result.description}`
    })
  } else {
    messages.value.push({
      role: "bot",
      text: "해당 지역의 추천 장소를 찾지 못했습니다.\n다른 구 이름을 입력해주세요."
    })
  }

  input.value = ""
  scrollToBottom()
}
</script>

<template>
  <div class="chatbot">
    <div ref="messagesContainer" class="messages">
      <div
        v-for="(message, index) in messages"
        :key="index"
        class="message-row"
        :class="message.role"
      >
        <div class="bubble">
          <div class="sender">
            {{ message.role === 'bot' ? '🤖' : '👤' }}
            <span>{{ message.role === 'bot' ? '봇' : '나' }}</span>
          </div>
          <p>{{ message.text }}</p>
        </div>
      </div>
    </div>

    <div class="input-area">
      <input
        v-model="input"
        @keyup.enter.prevent="sendMessage"
        placeholder="예) 강남구"
      />
      <button @click="sendMessage">전송</button>
    </div>
  </div>
</template>

<style scoped>
.chatbot {
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 420px;
  height: 480px;
  padding: 16px;
  border-radius: 20px;
  background: #f7f9fc;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.messages {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-right: 4px;
  margin-bottom: 12px;
}

.message-row {
  display: flex;
}

.message-row.bot {
  justify-content: flex-start;
}

.message-row.user {
  justify-content: flex-end;
}

.bubble {
  max-width: 80%;
  padding: 12px 14px;
  border-radius: 16px;
  background: #ffffff;
  color: #1f2937;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  white-space: pre-line;
}

.message-row.bot .bubble {
  border-top-left-radius: 4px;
  background: #eef4ff;
}

.message-row.user .bubble {
  border-top-right-radius: 4px;
  background: #dff7e8;
}

.sender {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.85rem;
  font-weight: 700;
  margin-bottom: 6px;
}

.bubble p {
  margin: 0;
  line-height: 1.5;
}

.input-area {
  display: flex;
  gap: 10px;
  padding-top: 8px;
  border-top: 1px solid #e5e7eb;
}

input {
  flex: 1;
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 12px;
  outline: none;
}

button {
  padding: 10px 14px;
  border: none;
  border-radius: 12px;
  background: #2563eb;
  color: white;
  cursor: pointer;
}

button:hover {
  background: #1d4ed8;
}
</style>