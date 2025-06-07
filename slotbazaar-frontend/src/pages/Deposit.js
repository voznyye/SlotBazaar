import { useState } from 'react';
import API from '../api';

export default function Deposit() {
  const [amount, setAmount] = useState('');
  const [msg, setMsg] = useState('');

  const submit = e => {
    e.preventDefault();
    API.post('/auth/deposit', { amount })
      .then(r => setMsg(`New balance: ${r.data.balance}`))
      .catch(e => setMsg('Error'));
  };

  return (
    <form onSubmit={submit}>
      <h2>Deposit</h2>
      <input type="number" value={amount} onChange={e => setAmount(e.target.value)} />
      <button type="submit">Deposit</button>
      {msg && <p>{msg}</p>}
    </form>
  );
}
