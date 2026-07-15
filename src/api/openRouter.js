const API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY

const DISTRICT_ALIASES = {
  강남: '강남구',
  강동: '강동구',
  강북: '강북구',
  강서: '강서구',
  관악: '관악구',
  광진: '광진구',
  구로: '구로구',
  금천: '금천구',
  노원: '노원구',
  도봉: '도봉구',
  동대문: '동대문구',
  동작: '동작구',
  마포: '마포구',
  서대문: '서대문구',
  서초: '서초구',
  성동: '성동구',
  성북: '성북구',
  송파: '송파구',
  양천: '양천구',
  영등포: '영등포구',
  용산: '용산구',
  은평: '은평구',
  종로: '종로구',
  중구: '중구',
  중랑: '중랑구'
}

function normalizeDistrict(value = '') {
  const cleaned = value
    .replace(/\s+/g, '')
    .replace(/[.,!?]/g, '')
    .replace(/서울특별시/g, '')
    .replace(/서울/g, '')
    .trim()

  if (!cleaned) return ''
  if (DISTRICT_ALIASES[cleaned]) return DISTRICT_ALIASES[cleaned]
  if (DISTRICT_ALIASES[cleaned.replace(/구$/, '')]) return DISTRICT_ALIASES[cleaned.replace(/구$/, '')]
  return cleaned
}

function extractDistrictFromText(text = '') {
  const districtMatch = text.match(/([가-힣]+구)/)
  if (districtMatch) return normalizeDistrict(districtMatch[1])

  const tokens = text.split(/\s+/)
  for (const token of tokens) {
    const cleaned = normalizeDistrict(token)
    if (cleaned.endsWith('구')) return cleaned
    if (DISTRICT_ALIASES[cleaned]) return DISTRICT_ALIASES[cleaned]
    for (const alias of Object.keys(DISTRICT_ALIASES)) {
      if (cleaned.includes(alias)) return DISTRICT_ALIASES[alias]
    }
  }

  return ''
}

function parseDistrictResponse(content = '') {
  try {
    const parsed = JSON.parse(content)
    return parsed
  } catch {
    const fallback = extractDistrictFromText(content)
    return { district: fallback || null }
  }
}

export async function extractDistrict(message) {
  const fallbackDistrict = extractDistrictFromText(message)

  if (!API_KEY) {
    return { district: fallbackDistrict || null }
  }

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: 'openai/gpt-5-mini',
        messages: [
          {
            role: 'system',
            content: `사용자의 입력에서 서울의 행정구역 구 단위를 추출하세요. 단어가 '강남', '노원', '상계동' 같이 구 이름 또는 동 이름 형태여도, 서울의 구 단위로 변환해서 반환하세요. 결과는 반드시 JSON만 반환합니다. 예: {"district":"노원구"}. 지역을 찾지 못하면 {"district":null} 을 반환하세요.`,
          },
          {
            role: 'user',
            content: message,
          },
        ],
      }),
    })

    if (!response.ok) {
      console.error('OpenRouter API 오류:', response.status, response.statusText)
      return { district: fallbackDistrict || null }
    }

    const data = await response.json()
    const content = data?.choices?.[0]?.message?.content ?? ''
    const parsed = parseDistrictResponse(content)
    return { district: parsed?.district ? normalizeDistrict(parsed.district) : fallbackDistrict || null }
  } catch (error) {
    console.error('OpenRouter 요청 실패:', error)
    return { district: fallbackDistrict || null }
  }
}
