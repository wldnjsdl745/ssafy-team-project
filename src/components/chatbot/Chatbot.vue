<script setup>
import { ref, onMounted, nextTick, watch } from 'vue'
import { getRandomRecommendation, getRecommendations } from '@/services/recommendService'
import { extractDistrict } from '@/api/openRouter'

const messages = ref([])
const input = ref('')
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
    text:
`안녕하세요! 운동 장소 추천 챗봇입니다.

원하는 지역을 자연스럽게 입력해주세요.
예)
- 노원구 운동할 곳 알려줘
- 상계동 근처 추천해줘`
  })


  scrollToBottom()
})



watch(
  messages,
  () => {
    scrollToBottom()
  },
  { deep:true }
)



async function sendMessage() {


  const userMessage = input.value.trim()


  if (!userMessage) {
    return
  }



  // 사용자 메시지 표시
  messages.value.push({
    role:"user",
    text:userMessage
  })



  input.value = ""



  // AI 지역 추출
  const aiResult =
    await extractDistrict(userMessage)



  const district =
    aiResult.district



  if (!district) {

    messages.value.push({
      role:"bot",
      text:
`지역을 찾지 못했습니다.

예)
"노원구 운동 장소 추천해줘"
"상계동 근처 알려줘"`
    })

    return
  }

  const result = getRandomRecommendation(recommendations, district)

  if (result) {
    const address = result.addr1 + (result.addr2 ? `\n${result.addr2}` : '')
    messages.value.push({
      role:'bot',
      text:
`${district} 운동 장소를 추천드립니다.

📍 ${result.title}

주소:
${address}`
    })
  } else {


    messages.value.push({
      role:"bot",
      text:
`${district}에 등록된 추천 장소가 없습니다.`
    })

  }



}
</script>


<template>

<div class="chatbot">

  <div
    ref="messagesContainer"
    class="messages"
  >

    <div
      v-for="(message,index) in messages"
      :key="index"
      class="message-row"
      :class="message.role"
    >

      <div class="bubble">

        <div class="sender">

          {{ message.role === 'bot' ? '🤖' : '👤' }}

          <span>
            {{ message.role === 'bot' ? '봇' : '나' }}
          </span>

        </div>


        <p>
          {{ message.text }}
        </p>


      </div>


    </div>


  </div>



  <div class="input-area">

    <input
      v-model="input"
      @keyup.enter.prevent="sendMessage"
      placeholder="예) 상계동 근처 운동 장소 추천해줘"
    />


    <button
      @click="sendMessage"
    >
      전송
    </button>


  </div>


</div>

</template>



<style scoped>

.chatbot {
  display:flex;
  flex-direction:column;
  width:100%;
  max-width:420px;
  height:480px;
  padding:16px;
  border-radius:20px;
  background:#f7f9fc;
  box-shadow:0 10px 30px rgba(0,0,0,.08);
  overflow:hidden;
}



.messages {
  flex:1;
  overflow-y:auto;
  display:flex;
  flex-direction:column;
  gap:10px;
}



.message-row {
  display:flex;
}



.message-row.bot {
  justify-content:flex-start;
}



.message-row.user {
  justify-content:flex-end;
}



.bubble {

  max-width:80%;
  padding:12px 14px;
  border-radius:16px;
  background:white;
  white-space:pre-line;

}



.message-row.bot .bubble {
  background:#eef4ff;
}



.message-row.user .bubble {
  background:#dff7e8;
}



.sender {

  font-size:.85rem;
  font-weight:bold;
  margin-bottom:6px;

}



.bubble p {

  margin:0;
  line-height:1.5;

}



.input-area {

  display:flex;
  gap:10px;
  padding-top:10px;

}



input {

  flex:1;
  padding:10px;
  border-radius:12px;
  border:1px solid #ddd;

}



button {

  padding:10px 14px;
  border:none;
  border-radius:12px;
  background:#2563eb;
  color:white;

}

</style>