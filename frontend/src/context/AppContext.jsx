import React, { createContext, useState } from 'react'

export const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [predictions, setPredictions] = useState([])
  const [themeMode, setThemeMode] = useState('light')

  return (
    <AppContext.Provider value={{ predictions, setPredictions, themeMode, setThemeMode }}>
      {children}
    </AppContext.Provider>
  )
}
