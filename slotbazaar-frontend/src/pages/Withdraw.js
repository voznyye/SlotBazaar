import { useState } from 'react';
import API from '../api';

export default function Withdraw() {
  const [amount, setAmount] = useState('');
  const [msg, setMsg] = useState('');

  const submit = e => {
    e.preventDefault();
    API.post('/auth/withdraw', { amount })
      .then(r => setMsg(`New balance: ${r.data.balance}`))
      .catch(() => setMsg('Error'));
  };

  return (
    <form onSubmit={submit}>
      <h2>Withdraw</h2>
      <input type="number" value={amount} onChange={e => setAmount(e.target.value)} />
      <button type="submit">Withdraw</button>
      {msg && <p>{msg}</p>}
    </form>
  );
}
