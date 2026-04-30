export async function validateUKPostcode(postcode: string): Promise<boolean> {
  if (!postcode) return false
  try {
    const res = await fetch(
      `https://api.postcodes.io/postcodes/${postcode.replace(/\s/g, '')}/validate`,
    )
    const data = await res.json()
    return !!data.result
  } catch (error) {
    console.error('Postcode validation error:', error)
    // Fallback to basic regex if API is down
    const ukPostcodeRegex = /^[A-Z]{1,2}[0-9][A-Z0-9]? ?[0-9][A-Z]{2}$/i
    return ukPostcodeRegex.test(postcode)
  }
}
