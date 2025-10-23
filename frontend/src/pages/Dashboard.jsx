import React, { useEffect, useState } from 'react'
import { Box, Typography, List, ListItem, IconButton } from '@mui/material'
import { historyApi } from '../api/api'
import DeleteIcon from '@mui/icons-material/Delete'

export default function Dashboard() {
  const [items, setItems] = useState([])

  useEffect(() => {
    async function fetch() {
      const { data } = await historyApi.list()
      setItems(data)
    }
    fetch()
  }, [])

  const handleDelete = async (id) => {
    await historyApi.delete(id)
    setItems(prev => prev.filter(i => i.id !== id))
  }

  return (
    <Box p={3}>
      <Typography variant="h4">History</Typography>
      <List>
        {items.map(it => (
          <ListItem key={it.id} secondaryAction={<IconButton onClick={() => handleDelete(it.id)}><DeleteIcon /></IconButton>}>
            {it.text} - {it.created_at}
          </ListItem>
        ))}
      </List>
    </Box>
  )
}
