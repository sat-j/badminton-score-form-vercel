import React, { useEffect, useMemo, useState } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string;

type SubmitState = 'idle' | 'submitting' | 'success' | 'error';

interface PlayerPickerProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  allPlayers: string[];
}

const PlayerPicker: React.FC<PlayerPickerProps> = ({
  label,
  value,
  onChange,
  allPlayers,
}) => {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allPlayers.slice(0, 20);
    return allPlayers.filter((p) => p.toLowerCase().includes(q)).slice(0, 20);
  }, [query, allPlayers]);

  const display = value || query;

  return (
    <div className="form-row">
      <div className="label">{label}</div>
      <div className="search-dropdown">
        <div className="input-shell">
          <input
            className="input-base"
            type="text"
            inputMode="search"
            autoComplete="off"
            placeholder="Search player"
            value={display}
            onFocus={() => setOpen(true)}
            onChange={(e) => {
              setQuery(e.target.value);
              onChange(''); // clear selected if you start typing
              setOpen(true);
            }}
          />
          <span className="input-tag">P</span>
        </div>
        {open && filtered.length > 0 && (
          <div className="search-list">
            {filtered.map((name) => {
              const selected = name === value;
              return (
                <div
                  key={name}
                  className={
                    'list-item' + (selected ? ' list-item--selected' : '')
                  }
                  onMouseDown={(e) => {
                    e.preventDefault();
                    onChange(name);
                    setQuery('');
                    setOpen(false);
                  }}
                >
                  {name}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [players, setPlayers] = useState<string[]>([]);
  const [loadingPlayers, setLoadingPlayers] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [p1, setP1] = useState('');
  const [p2, setP2] = useState('');
  const [p3, setP3] = useState('');
  const [p4, setP4] = useState('');
  const [s1, setS1] = useState('');
  const [s2, setS2] = useState('');

  const [submitState, setSubmitState] = useState<SubmitState>('idle');
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API_BASE_URL}?action=players`, {
      headers: {
        'Content-Type': 'text/plain;charset=utf-8'
      }
    })
    .then(res => res.text())  // text/plain response
    .then(text => {
      const data = JSON.parse(text);
      setPlayers(Array.isArray(data) ? data.map(row => row[0]).filter(Boolean) : []);
    })
    .catch(err => {
      console.log('Players fallback:', err);
      setPlayers(['Demo Player 1', 'Demo Player 2']); // fallback
    });
  }, []);

  const canSubmit =
    p1 && p2 && p3 && p4 &&
    s1 !== '' && s2 !== '' &&
    Number(s1) >= 0 &&
    Number(s2) >= 0 &&
    Number(s1) <= 30 &&
    Number(s2) <= 30;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setSubmitState('submitting');
    setSubmitError(null);

    try {
      const body = new URLSearchParams();
      body.set('action', 'submitScore');
      body.set('player1', p1);
      body.set('player2', p2);
      body.set('player3', p3);
      body.set('player4', p4);
      body.set('score1', s1);
      body.set('score2', s2);

      const res = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
        },
        body: body.toString(),
      });

      const data = await res.json();
      if (!data.ok) {
        throw new Error(data.error || 'Submit failed');
      }

      setSubmitState('success');
      setP1('');
      setP2('');
      setP3('');
      setP4('');
      setS1('');
      setS2('');

      setTimeout(() => setSubmitState('idle'), 1200);
    } catch (err: any) {
      setSubmitState('error');
      setSubmitError(err.message || 'Error submitting score');
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <div>
          <div className="card-title">Court score entry</div>
          <div className="card-subtitle">
            Tap players, enter scores, submit.
          </div>
        </div>
        <span className="pill">LIVE</span>
      </div>

      {loadingPlayers && (
        <div className="status">Loading players…</div>
      )}
      {loadError && (
        <div className="status status--error">
          {loadError}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="label">Team</div>
          <div className="chips-row">
            <span className="chip chip--active">Team 1</span>
            <span className="chip">Team 2</span>
          </div>
        </div>

        <div className="field-group">
          <PlayerPicker
            label="Player 1"
            value={p1}
            onChange={setP1}
            allPlayers={players}
          />
          <PlayerPicker
            label="Player 2"
            value={p2}
            onChange={setP2}
            allPlayers={players}
          />
        </div>

        <div className="field-group">
          <PlayerPicker
            label="Player 3"
            value={p3}
            onChange={setP3}
            allPlayers={players}
          />
          <PlayerPicker
            label="Player 4"
            value={p4}
            onChange={setP4}
            allPlayers={players}
          />
        </div>

        <div className="row-inline">
          <div className="score-input">
            <div className="label">Score 1</div>
            <div className="input-shell">
              <input
                className="input-base"
                type="number"
                min={0}
                max={30}
                inputMode="numeric"
                value={s1}
                onChange={(e) => setS1(e.target.value)}
              />
              <span className="input-tag">T1</span>
            </div>
          </div>
          <div className="score-input">
            <div className="label">Score 2</div>
            <div className="input-shell">
              <input
                className="input-base"
                type="number"
                min={0}
                max={30}
                inputMode="numeric"
                value={s2}
                onChange={(e) => setS2(e.target.value)}
              />
              <span className="input-tag">T2</span>
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="btn-primary"
          disabled={!canSubmit || submitState === 'submitting'}
        >
          {submitState === 'submitting' ? 'Submitting…' : 'Submit score'}
        </button>

        <div className="status">
          {submitState === 'success' && (
            <span className="status--success">
              Saved to sheet.
            </span>
          )}
          {submitState === 'error' && submitError && (
            <span className="status--error">
              {submitError}
            </span>
          )}
        </div>
      </form>
    </div>
  );
};

export default App;
