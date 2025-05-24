import express from 'express';
const app = express();

app.delete('/api/photos/:id', (req, res) => {
  res.json({ message: 'Matched DELETE', id: req.params.id });
});

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.listen(5000, () => console.log('Server started on port 5000')); 