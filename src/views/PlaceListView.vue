<template>
  <section>
    <h1>서울 레포츠 장소 목록</h1>

    <div class="controls">
      <label for="district">구 선택:</label>
      <select id="district" v-model="selectedDistrict">
        <option value="">전체</option>

        <option
          v-for="d in districts"
          :key="d"
          :value="d"
        >
          {{ d }}
        </option>
      </select>
    </div>


    <div class="list">

      <div v-if="filteredPlaces.length === 0">
        검색 결과가 없습니다.
      </div>


      <ul>
        <li
          v-for="place in filteredPlaces"
          :key="place.contentid"
          class="place-item"
        >

          <img
            v-if="place.firstimage"
            :src="place.firstimage"
            alt="이미지"
            class="thumb"
          />


          <div class="info">

            <h3>
              {{ place.title }}
            </h3>

            <p class="addr">
              {{ place.addr1 }}
            </p>

          </div>

        </li>
      </ul>

    </div>


    <!-- 챗봇 -->
    <Chatbot />

  </section>
</template>


<script setup>

import {
  ref,
  computed,
  onMounted
} from 'vue'


import Chatbot from '../components/chatbot/Chatbot.vue'



// 장소 데이터
const places = ref([])


// 선택한 구
const selectedDistrict = ref('')



// JSON 데이터 가져오기
onMounted(async () => {

  try {

    const response =
      await fetch('/data/서울_레포츠.json')


    const data =
      await response.json()


    /*
      JSON 구조에 따라 처리
      배열이면 그대로 사용
      items 안에 있으면 items 사용
    */
    places.value =
      Array.isArray(data)
        ? data
        : data.items || []


  } catch(error) {

    console.error(
      '장소 데이터 로딩 실패:',
      error
    )

  }

})



// 주소에서 구 추출
function extractDistrict(addr = '') {


  const m =
    addr.match(
      /서울(?:특별시)?\s*([^\s,()]+구)/
    )


  if (m && m[1]) {

    return m[1]

  }



  const tokens =
    addr.split(/\s+/)



  for (const token of tokens) {

    if (token.endsWith('구')) {

      return token

    }

  }


  return ''

}




// 구 목록 생성
const districts = computed(() => {


  const set = new Set()



  for (const place of places.value) {


    const district =
      extractDistrict(place.addr1)



    if (district) {

      set.add(district)

    }

  }



  return Array.from(set).sort()


})




// 선택한 구 필터링
const filteredPlaces = computed(() => {


  if (!selectedDistrict.value) {

    return places.value

  }



  return places.value.filter(

    place =>
      extractDistrict(place.addr1)
      === selectedDistrict.value

  )

})

</script>


<style scoped>


.controls {

  margin: 12px 0;

}



.list ul {

  list-style: none;

  padding: 0;

}



.place-item {

  display: flex;

  gap: 12px;

  padding: 8px 0;

  border-bottom:
    1px solid #eee;

}



.thumb {

  width: 120px;

  height: 80px;

  object-fit: cover;

  border-radius: 6px;

}



.info h3 {

  margin:
    0 0 6px 0;

}



.addr {

  margin: 0;

  color: #666;

  font-size: 0.9rem;

}



/* 챗봇 영역 */
:deep(.chatbot) {

  margin-top: 40px;

}


</style>