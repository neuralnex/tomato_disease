import React, { useEffect, useMemo, useRef, useState } from 'react'

const API_BASE = 'http://127.0.0.1:8000'

export default function App() {
  const [message, setMessage] = useState('Loading model status...')
  const [selectedFile, setSelectedFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [prediction, setPrediction] = useState(null)
  const [history, setHistory] = useState([])
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef(null)

  useEffect(() => {
    fetch(`${API_BASE}/`)
      .then((r) => r.json())
      .then((j) => setMessage(j.message))
      .catch(() => setMessage('Backend unavailable. Start the API server to run predictions.'))

    loadHistory()
  }, [])

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  async function loadHistory() {
    try {
      const res = await fetch(`${API_BASE}/classify/history`)
      if (!res.ok) throw new Error(await res.text())
      const data = await res.json()
      setHistory(data)
    } catch (err) {
      console.error('History load failed:', err)
    }
  }

  function handleFileChange(event) {
    const file = event.target.files?.[0]
    if (!file) return

    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setSelectedFile(file)
    setPreviewUrl(URL.createObjectURL(file))
  }

  async function handlePredict(event) {
    event.preventDefault()

    if (!selectedFile) {
      alert('Choose a tomato leaf image first.')
      return
    }

    setUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', selectedFile)

      const res = await fetch(`${API_BASE}/classify/predict`, {
        method: 'POST',
        body: formData,
      })

      const text = await res.text()
      if (!res.ok) throw new Error(text)

      const result = JSON.parse(text)
      setPrediction(result)
      await loadHistory()
    } catch (err) {
      alert(`Prediction failed: ${err.message}`)
    } finally {
      setUploading(false)
    }
  }

  const stats = useMemo(() => {
    const labels = history.map((item) => item.label)
    const counts = labels.reduce((acc, label) => {
      acc[label] = (acc[label] || 0) + 1
      return acc
    }, {})

    return Object.entries(counts).map(([label, count]) => ({ label, count }))
  }, [history])

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Smart agriculture</p>
          <h1>Tomato Disease Classifier</h1>
        </div>
        <div className="status-pill">{message}</div>
      </header>

      <main className="dashboard">
        <section className="panel upload-panel">
          <div className="panel-header">
            <span className="badge success">Live</span>
            <h2>Upload leaf image</h2>
          </div>

          <form onSubmit={handlePredict} className="upload-form">
            <label className="dropzone" htmlFor="image-upload">
              <input
                id="image-upload"
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
              />
              {previewUrl ? (
                <img src={previewUrl} alt="Selected tomato leaf" className="preview-image" />
              ) : (
                <>
                  <span className="upload-icon">⇪</span>
                  <strong>Choose an image</strong>
                  <small>PNG, JPG, WEBP up to your browser limit</small>
                </>
              )}
            </label>

            <button type="submit" className="primary-button" disabled={uploading}>
              {uploading ? 'Analyzing...' : 'Predict disease'}
            </button>
          </form>
        </section>

        <aside className="panel result-panel">
          <div className="panel-header">
            <span className="badge neutral">Result</span>
            <h2>Latest scan</h2>
          </div>

          {prediction ? (
            <div className="result-card">
              <div className="result-header">
                <span className="result-tag">{prediction.label}</span>
                <span className="confidence">{(prediction.confidence * 100).toFixed(1)}%</span>
              </div>
              <p className="result-summary">
                Confidence score for the detected tomato condition.
              </p>
            </div>
          ) : (
            <div className="empty-state">
              <p>No prediction yet.</p>
              <small>Upload a leaf photo to start detecting disease.</small>
            </div>
          )}

          <div className="mini-stats">
            <div>
              <strong>{history.length}</strong>
              <span>Scans</span>
            </div>
            <div>
              <strong>{stats.length}</strong>
              <span>Labels</span>
            </div>
          </div>
        </aside>
      </main>

      <section className="panel history-panel">
        <div className="panel-header">
          <span className="badge neutral">History</span>
          <h2>Recent results</h2>
        </div>

        {history.length === 0 ? (
          <div className="empty-state compact">
            <p>No saved history yet.</p>
          </div>
        ) : (
          <div className="history-list">
            {history.slice(0, 6).map((item) => (
              <div key={item.id} className="history-item">
                <div>
                  <strong>{item.label}</strong>
                  <small>{new Date(item.created_at).toLocaleString()}</small>
                </div>
                <span>{(item.confidence * 100).toFixed(1)}%</span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
