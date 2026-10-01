import React, { useEffect, useState, useRef } from 'react'

export default function App(){
  const [message, setMessage] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [token, setToken] = useState(localStorage.getItem('token')||'')
  const [history, setHistory] = useState([])
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef()

  useEffect(()=>{
    fetch('http://127.0.0.1:8000/')
      .then(r=>r.json())
      .then(j=>setMessage(j.message))
      .catch(()=>setMessage('Backend unreachable'))
  },[])

  function saveToken(t){
    setToken(t)
    localStorage.setItem('token', t)
  }

  async function signup(e){
    e.preventDefault()
    try{
      const res = await fetch('http://127.0.0.1:8000/auth/signup',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({username, password})
      })
      if(!res.ok) throw new Error(await res.text())
      alert('Signup successful — please login')
    }catch(err){
      alert('Signup failed: '+err.message)
    }
  }

  async function login(e){
    e.preventDefault()
    try{
      const form = new URLSearchParams()
      form.append('username', username)
      form.append('password', password)
      const res = await fetch('http://127.0.0.1:8000/auth/login',{
        method:'POST',
        headers:{'Content-Type':'application/x-www-form-urlencoded'},
        body: form.toString()
      })
      if(!res.ok) throw new Error(await res.text())
      const j = await res.json()
      saveToken(j.access_token)
      alert('Login OK')
    }catch(err){
      alert('Login failed: '+err.message)
    }
  }

  async function doUpload(e){
    e.preventDefault()
    const f = fileRef.current.files[0]
    if(!f){ alert('Select a file'); return }
    if(!token){ alert('Login first'); return }
    setUploading(true)
    try{
      const fd = new FormData()
      fd.append('file', f)
      const res = await fetch('http://127.0.0.1:8000/classify/predict',{
        method:'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: fd
      })
      const text = await res.text()
      if(!res.ok) throw new Error(text)
      const j = JSON.parse(text)
      alert(`Prediction: ${j.label} (${(j.confidence*100).toFixed(1)}%)`)
      await loadHistory()
    }catch(err){
      alert('Prediction failed: '+err.message)
    }finally{ setUploading(false) }
  }

  async function loadHistory(){
    if(!token) return setHistory([])
    try{
      const res = await fetch('http://127.0.0.1:8000/classify/history',{ headers: { 'Authorization': `Bearer ${token}` } })
      if(!res.ok) throw new Error(await res.text())
      const j = await res.json()
      setHistory(j)
    }catch(err){
      alert('Could not load history: '+err.message)
    }
  }

  function logout(){
    saveToken('')
    localStorage.removeItem('token')
    setHistory([])
  }

  return (
    <div style={{fontFamily:'sans-serif',padding:20}}>
      <h1>Tomato Disease Classifier</h1>
      <p style={{color:'#444'}}>{message}</p>

      <section style={{marginTop:20}}>
        <h2>Auth</h2>
        <form style={{display:'flex',gap:8,alignItems:'center'}} onSubmit={login}>
          <input placeholder="username" value={username} onChange={e=>setUsername(e.target.value)} />
          <input placeholder="password" value={password} onChange={e=>setPassword(e.target.value)} type="password" />
          <button type="submit">Login</button>
          <button type="button" onClick={signup}>Sign up</button>
          <button type="button" onClick={logout}>Logout</button>
        </form>
      </section>

      <section style={{marginTop:20}}>
        <h2>Upload Image</h2>
        <form onSubmit={doUpload} style={{display:'flex',gap:8,alignItems:'center'}}>
          <input ref={fileRef} type="file" accept="image/*" />
          <button type="submit" disabled={uploading}>{uploading? 'Uploading...' : 'Predict'}</button>
          <button type="button" onClick={loadHistory}>Refresh History</button>
        </form>
      </section>

      <section style={{marginTop:20}}>
        <h2>History</h2>
        {history.length===0 ? <p>No history yet.</p> : (
          <table style={{borderCollapse:'collapse'}}>
            <thead><tr><th>Time</th><th>Label</th><th>Confidence</th></tr></thead>
            <tbody>
              {history.map(item=> (
                <tr key={item.id}>
                  <td>{new Date(item.created_at).toLocaleString()}</td>
                  <td>{item.label}</td>
                  <td>{(item.confidence*100).toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  )
}
