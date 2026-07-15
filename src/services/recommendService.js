function normalizeDistrict(value = "") {
  return value
    .replace(/\s+/g, "")
    .replace(/서울특별시/g, "")
    .replace(/서울/g, "")
    .trim()
}

function extractDistrictFromAddress(address = "") {
  const match = address.match(/서울(?:특별시)?\s*([^\s,()]+구)/)
  if (match?.[1]) return normalizeDistrict(match[1])

  const tokens = address.split(/\s+/)
  for (const token of tokens) {
    const cleaned = normalizeDistrict(token)
    if (cleaned.endsWith("구")) return cleaned
  }

  return ""
}

export async function getRecommendations() {
  const response = await fetch("/data/서울_레포츠.json")
  const data = await response.json()

  return Array.isArray(data) ? data : data.items || []
}

export function findRecommendations(recommendations, district) {
  const targetDistrict = normalizeDistrict(district)
  if (!targetDistrict) return []

  return recommendations.filter((item) => {
    const itemDistrict = extractDistrictFromAddress(item.addr1)
    return normalizeDistrict(itemDistrict) === targetDistrict
  })
}

export function getRandomRecommendation(recommendations, district) {
  const matched = findRecommendations(recommendations, district)
  if (!matched.length) return null

  const randomIndex = Math.floor(Math.random() * matched.length)
  return matched[randomIndex]
}
