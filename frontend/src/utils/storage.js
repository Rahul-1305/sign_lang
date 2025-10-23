export function getTokenFromStorage() {
  try {
    return localStorage.getItem('auth_token')
  } catch (e) {
    return null
  }
}

export function setTokenToStorage(token) {
  try {
    localStorage.setItem('auth_token', token)
  } catch (e) {}
}
