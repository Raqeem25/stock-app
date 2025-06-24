export const login = async (username, password) => {
  const users = [
    { username: 'admin', password: 'admin123', role: 'admin' },
    { username: 'staff', password: 'staff123', role: 'karyawan' },
  ]
  const user = users.find(u => u.username === username && u.password === password)
  if (user) {
    localStorage.setItem('user', JSON.stringify(user))
    return true
  }
  return false
}

export const getCurrentUser = () => {
  if (typeof window !== 'undefined') {
    const user = localStorage.getItem('user')
    return user ? JSON.parse(user) : null
  }
  return null
}

export const logout = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('user')
  }
}