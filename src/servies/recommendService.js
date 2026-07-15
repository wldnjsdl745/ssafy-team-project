export async function getRecommendations() {

  const response = await fetch(
    "/data/districtRecommend.json"
  )

  const data = await response.json()

  return data
}


export function findRecommendation(
  recommendations,
  district
) {

  return recommendations.find(
    item => item.district === district
  )

}