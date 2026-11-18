import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform, useInView, animate } from 'framer-motion';
import { ArrowRight, Check, Search } from 'lucide-react';
import '../showcase.css';

const ease = [0.16, 1, 0.3, 1];
const rise = (d = 0) => ({
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '0px 0px -8% 0px' },
  transition: { duration: 0.7, delay: d, ease },
});

/* ───────── small pieces ───────── */
const Words = ({ text, className }) => (
  <span className={className} aria-label={text}>
    {text.split(' ').map((w, i) => (
      <span key={i} className="w-mask" aria-hidden="true">
        <motion.span className="w-in" initial={{ y: '110%', rotate: 5 }} animate={{ y: 0, rotate: 0 }} transition={{ duration: 0.85, delay: 0.1 + i * 0.07, ease }}>{w}&nbsp;</motion.span>
      </span>
    ))}
  </span>
);

const CountUp = ({ to, prefix = '', suffix = '' }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-10%' });
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!inView) return undefined;
    const a = animate(0, to, { duration: 1.6, ease, onUpdate: (x) => setV(Math.round(x)) });
    return () => a.stop();
  }, [inView, to]);
  return <span ref={ref}>{prefix}{v}{suffix}</span>;
};

/* A medicine capsule: two solid halves, nothing fancy */
const Capsule = ({ a, b, w, h, r, x, y, d = 0 }) => (
  <motion.div
    className="cap"
    style={{ width: w, height: h, left: x, top: y, '--a': a, '--b': b }}
    initial={{ opacity: 0, scale: 0.6, rotate: r - 40 }}
    animate={{ opacity: 1, scale: 1, rotate: r, y: [0, -14, 0] }}
    transition={{ opacity: { duration: 0.5, delay: 0.2 + d }, scale: { duration: 0.8, delay: 0.2 + d, ease }, rotate: { duration: 0.9, delay: 0.2 + d, ease }, y: { duration: 6 + d * 3, repeat: Infinity, ease: 'easeInOut', delay: d } }}
    whileHover={{ scale: 1.08, rotate: r + 8 }}
  >
    <i /><i />
  </motion.div>
);

/* ───────── data ───────── */
const TICKER = [
  ['0x3f9a…c21e', 'Batch minted', 'Pfizer Global Supply'],
  ['0x81bd…07af', 'Custody accepted', 'FedEx ColdChain Hub 14'],
  ['0xc402…98d3', 'Received', 'McKesson Memphis'],
  ['0x5be1…4a60', 'Dispensed', 'CVS Specialty, Boston'],
  ['0x77de…1b09', 'Temperature logged', '3.4°C in range'],
  ['0xa190…e5c2', 'Transfer rejected', 'Signature mismatch'],
];

const STACK = [
  { tag: 'Minted', t: 'Born on the ledger.', d: 'The moment a batch leaves the line it gets a serialized identity on Ethereum, bound to its lot, expiry and certificate. The printed label carries the same code.', doc: 'label', tone: 'blue' },
  { tag: 'Shipped', t: 'Every mile signed for.', d: 'Custody moves only when sender and carrier both sign. Temperature readings are attached to the handoff, so the manifest cannot hide a bad leg.', doc: 'manifest', tone: 'mint' },
  { tag: 'Stocked', t: 'Checked at the dock.', d: 'The distributor confirms the receipt against the ledger. Anything that does not match is rejected on the spot, and the attempt is recorded.', doc: 'receipt', tone: 'sun' },
  { tag: 'Dispensed', t: 'Locked at the counter.', d: 'The pharmacist verifies origin before stocking, then locks the unit at dispensing so the same pack can never be sold twice.', doc: 'slip', tone: 'coral' },
];

const BATCHES = {
  'PFZ-2026-9812': { id: 1, name: 'Paxlovid, 30 tablets', maker: 'Pfizer Global Supply', now: 'McKesson Memphis', temp: '3.4°C', sigs: 3 },
  'GLD-2026-4401': { id: 2, name: 'Veklury 100 mg vial', maker: 'Gilead Sciences', now: 'FedEx ColdChain Hub 14', temp: '4.1°C', sigs: 2 },
  'NVO-2026-7732': { id: 3, name: 'Ozempic 2 mg pen', maker: 'Novo Nordisk', now: 'CVS Specialty, Boston', temp: '2.8°C', sigs: 4 },
};

const ROLES = [
  ['Manufacturers', 'Serialize batches at the line and publish certificates once, for everyone.', 'blue'],
  ['Distributors', 'Sign custody in under three seconds and keep temperature proof with every handoff.', 'mint'],
  ['Pharmacies', 'Scan, confirm origin and reject clones before a single unit reaches the shelf.', 'sun'],
  ['Regulators', 'Audit any batch end to end from one source of truth, without asking anyone.', 'coral'],
];

const FAQ = [
  ['Do patients need a wallet to verify a medicine?', 'No. Anyone can open the verify page and enter the product ID printed on the pack. Only organizations that write to the ledger need a wallet.'],
  ['What is actually stored on the blockchain?', 'The batch identity, each custody transfer with its signatures, and the readings attached to it. Patient data is never stored.'],
  ['Which network does it run on?', 'Ethereum Sepolia, the public test network, while the platform is in testing.'],
  ['Who is allowed to register batches?', 'Only organizations that an administrator has approved. Registration is open; approval is not automatic.'],
];

/* ───────── printed artefacts ───────── */
const QRMAP = [0, 1, 2, 4, 6, 7, 8, 10, 12, 13, 14, 16, 18, 20, 21, 24, 26, 27, 28, 30, 32, 34, 35, 36, 38, 40, 41, 42, 44, 46, 47, 48];
const Matrix = () => (<div className="dm">{Array.from({ length: 49 }).map((_, i) => <i key={i} className={QRMAP.includes(i) ? 'on' : ''} />)}</div>);

const Doc = ({ kind }) => {
  if (kind === 'label') return (
    <div className="paper label">
      <div className="p-row"><b className="p-big">PAXLOVID</b><span>Rx only</span></div>
      <div className="p-sub">nirmatrelvir 150 mg · ritonavir 100 mg</div>
      <div className="p-grid"><span>LOT</span><b>PFZ-2026-9812</b><span>EXP</span><b>2028-03</b><span>NDC</span><b>0069-1085-30</b><span>SN</span><b>00 0069 1085 30 9812</b></div>
      <div className="p-row end"><Matrix /><span className="p-hash">0x3f9a…c21e<br />anchored · block 4180</span></div>
    </div>
  );
  if (kind === 'manifest') return (
    <div className="paper manifest">
      <div className="p-row"><b>COLD-CHAIN MANIFEST</b><span>2 – 8 °C</span></div>
      <svg viewBox="0 0 320 120" className="p-trace" role="img" aria-label="Temperature trace staying inside the 2 to 8 degree band">
        <rect x="0" y="22" width="320" height="64" className="p-band" />
        <path d="M0 60 C30 54 44 70 76 60 S130 44 162 56 224 72 252 58 296 50 320 58" className="p-line" />
        <text x="4" y="16">8°</text><text x="4" y="104">2°</text>
      </svg>
      <div className="p-table">
        <div><span>Leg 1</span><b>Kalamazoo → Memphis</b><em>3.4°C</em></div>
        <div><span>Leg 2</span><b>Memphis → Boston</b><em>3.1°C</em></div>
        <div><span>Carrier</span><b>FedEx ColdChain 14</b><em className="ok">signed</em></div>
      </div>
    </div>
  );
  if (kind === 'receipt') return (
    <div className="paper receipt">
      <div className="p-row"><b>GOODS RECEIPT</b><span>McKesson Memphis</span></div>
      <ul className="p-check">
        <li><Check size={14} strokeWidth={3} /> Seal intact</li>
        <li><Check size={14} strokeWidth={3} /> Serial found on ledger</li>
        <li><Check size={14} strokeWidth={3} /> Temperature inside 2 – 8 °C</li>
        <li><Check size={14} strokeWidth={3} /> Sender signature valid</li>
      </ul>
      <div className="p-sign"><span>Receiver signature</span><i /></div>
    </div>
  );
  return (
    <div className="paper slip">
      <div className="p-row"><b>DISPENSE RECORD</b><span>CVS Specialty</span></div>
      <div className="stamp">AUTHENTIC</div>
      <div className="p-grid"><span>BATCH</span><b>PFZ-2026-9812</b><span>SIGNATURES</span><b>4 of 4</b><span>STATUS</span><b>Unit locked</b></div>
    </div>
  );
};

/* ───────── stacking card ───────── */
const StackCard = ({ s, i, n }) => {
  const ref = useRef(null);
  const { scrollYProgress: into } = useScroll({ target: ref, offset: ['start end', 'start start'] });
  const { scrollYProgress: out } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const scale = useTransform(out, [0, 1], [1, 1 - (n - i) * 0.035]);
  const docY = useTransform(into, [0, 1], ['10%', '-2%']);
  return (
    <div ref={ref} className="stack-slot" style={{ top: `calc(12vh + ${i * 22}px)` }}>
      <motion.article className={`stack-card tone-${s.tone}`} style={{ scale }}>
        <div className="stack-text">
          <span className="chip">{s.tag}</span>
          <h3>{s.t}</h3>
          <p>{s.d}</p>
        </div>
        <div className="stack-doc"><motion.div style={{ y: docY }} className="doc-wrap"><Doc kind={s.doc} /></motion.div></div>
      </motion.article>
    </div>
  );
};

/* ───────── page ───────── */
const Showcase = ({ account, onConnect }) => {
  const navigate = useNavigate();
  const [q, setQ] = useState('PFZ-2026-9812');
  const [open, setOpen] = useState(0);
  const hit = BATCHES[q.trim().toUpperCase()];

  useEffect(() => {
    document.body.classList.add('is-landing');
    return () => document.body.classList.remove('is-landing');
  }, []);

  return (
    <div className="sc">
      <header className="sc-nav">
        <Link to="/" className="sc-logo"><span className="logo-cap"><i /><i /></span> PharmaTrace</Link>
        <nav aria-label="Main">
          <a href="#how">How it works</a>
          <a href="#platform">Platform</a>
          <a href="#verify">Verify</a>
          <a href="#faq">FAQ</a>
        </nav>
        {account
          ? <Link to="/dashboard" className="sc-btn sc-btn-ink">Dashboard</Link>
          : <button type="button" onClick={onConnect} className="sc-btn sc-btn-ink">Connect wallet</button>}
      </header>

      {/* HERO */}
      <section className="sc-hero">
        <div className="sc-hero-text">
          <motion.span {...rise(0)} className="sc-pill"><i className="dot" /> Live on Ethereum Sepolia</motion.span>
          <h1 className="sc-h1"><Words text="Know every dose" /><br /><Words text="is the real thing." className="hl" /></h1>
          <motion.p {...rise(0.45)} className="sc-sub">PharmaTrace records each batch and every handoff on a ledger nobody can edit, so counterfeits are caught before they reach a patient.</motion.p>
          <motion.div {...rise(0.6)} className="sc-cta">
            <Link to="/verify" className="sc-btn sc-btn-blue">Verify a batch <ArrowRight size={17} /></Link>
            <Link to="/register" className="sc-btn sc-btn-line">Register your organization</Link>
          </motion.div>
        </div>

        <div className="sc-hero-art" aria-hidden="true">
          <Capsule a="#2b44ff" b="#ffffff" w={300} h={120} r={-24} x="4%" y="8%" d={0} />
          <Capsule a="#ff6a4d" b="#ffcf3f" w={250} h={100} r={18} x="40%" y="2%" d={0.25} />
          <Capsule a="#58e0a4" b="#ffffff" w={270} h={108} r={-8} x="30%" y="40%" d={0.5} />
          <Capsule a="#ffcf3f" b="#2b44ff" w={220} h={90} r={32} x="-2%" y="56%" d={0.75} />
          <Capsule a="#c9b6ff" b="#15131a" w={200} h={82} r={-34} x="58%" y="68%" d={1} />
          <motion.div className="hero-label paper" initial={{ opacity: 0, y: 30, rotate: 6 }} animate={{ opacity: 1, y: 0, rotate: 3 }} transition={{ delay: 1, duration: 0.8, ease }}>
            <div className="p-row"><b>PFZ-2026-9812</b><span className="ok-tag"><Check size={12} strokeWidth={3} /> Authentic</span></div>
            <div className="p-sub">3 of 4 signatures · 3.4°C</div>
          </motion.div>
        </div>
      </section>

      {/* TICKER */}
      <div className="sc-ticker" aria-hidden="true">
        <div className="track">
          {[...TICKER, ...TICKER, ...TICKER].map(([h, a, b], i) => (<span key={i}><b className="mono">{h}</b>{a}<em>{b}</em></span>))}
        </div>
      </div>

      {/* STACKING CARDS */}
      <section className="sc-sec" id="how">
        <div className="sc-wrap">
          <motion.div {...rise()} className="sc-head"><h2>One batch. Four signatures. <span className="hl">Zero gaps.</span></h2></motion.div>
        </div>
        <div className="stack">{STACK.map((s, i) => <StackCard key={s.t} s={s} i={i} n={STACK.length} />)}</div>
      </section>

      {/* PLATFORM */}
      <section className="sc-sec tone-paper2" id="platform">
        <div className="sc-wrap">
          <motion.div {...rise()} className="sc-head"><h2>Everything you need to <span className="hl">prove</span> a medicine is real.</h2></motion.div>
          <div className="tiles">
            <motion.div {...rise()} className="tile tone-blue t-stat"><b><CountUp to={3} prefix="< " suffix="s" /></b><span>to sign a custody handoff</span></motion.div>
            <motion.div {...rise(0.06)} className="tile tone-mint t-stat"><b><CountUp to={100} suffix="%" /></b><span>of events on the audit trail</span></motion.div>
            <motion.div {...rise(0.12)} className="tile tone-coral t-stat"><b><CountUp to={0} /></b><span>records anyone can edit</span></motion.div>

            <motion.div {...rise()} className="tile tone-white t-wide">
              <h3>A record nobody can edit</h3>
              <p>Every batch and handoff is written to Ethereum. Nothing can be changed, back-dated or quietly removed.</p>
              <div className="viz-chain">
                {['#4180', '#4181', '#4182', '#4183'].map((b, i) => (
                  <React.Fragment key={b}>
                    <div className="blk" style={{ animationDelay: `${i * 0.5}s` }}><small>{b}</small><b className="mono">0x{['3f9a', '81bd', 'c402', '5be1'][i]}</b></div>
                    {i < 3 && <span className="lnk" />}
                  </React.Fragment>
                ))}
              </div>
            </motion.div>

            <motion.div {...rise(0.06)} className="tile tone-sun t-wide">
              <h3>Anyone can check a pack</h3>
              <p>Scan the code and see the whole history. No wallet and no account.</p>
              <div className="viz-qr">
                <div className="qr">{Array.from({ length: 49 }).map((_, i) => (<i key={i} className={QRMAP.includes(i) ? 'on' : ''} />))}<span className="beam" /></div>
                <span className="verdict"><Check size={14} strokeWidth={3} /> Authentic</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* VERIFY */}
      <section className="sc-sec tone-sun" id="verify">
        <div className="sc-wrap verify">
          <motion.div {...rise()}>
            <h2>Look up any batch.</h2>
            <label className="vbar">
              <Search size={20} aria-hidden="true" />
              <input value={q} onChange={(e) => setQ(e.target.value)} aria-label="Batch number" spellCheck="false" autoComplete="off" placeholder="Enter a batch number" />
            </label>
            <div className="ex">
              {Object.keys(BATCHES).map((k) => (<button type="button" key={k} onClick={() => setQ(k)}>{k}</button>))}
              <button type="button" onClick={() => setQ('XYZ-0000-0000')}>XYZ-0000-0000</button>
            </div>
          </motion.div>
          <motion.div {...rise(0.1)} className="ans" aria-live="polite">
            {hit ? (
              <motion.div key={q} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease }}>
                <div className="ans-top"><b>{hit.name}</b><span className="verdict"><Check size={14} strokeWidth={3} /> Authentic</span></div>
                <dl>
                  <div><dt>Made by</dt><dd>{hit.maker}</dd></div>
                  <div><dt>Now with</dt><dd>{hit.now}</dd></div>
                  <div><dt>Cold chain</dt><dd>{hit.temp}, inside the band</dd></div>
                  <div><dt>Signatures</dt><dd>{hit.sigs} of 4</dd></div>
                </dl>
                <button type="button" className="sc-btn sc-btn-ink" onClick={() => navigate(`/verify?id=${hit.id}`)}>Open the full record <ArrowRight size={17} /></button>
              </motion.div>
            ) : (<p className="none">No batch with that number is on the ledger. Check the number printed on the pack.</p>)}
          </motion.div>
        </div>
      </section>

      {/* ROLES */}
      <section className="sc-sec">
        <div className="sc-wrap">
          <motion.div {...rise()} className="sc-head"><h2>One ledger. <span className="hl">Every link</span> in the chain.</h2></motion.div>
          <div className="roles">
            {ROLES.map(([t, d, tone], i) => (
              <motion.div key={t} {...rise(i * 0.05)} className={`role tone-hover-${tone}`}><h3>{t}</h3><p>{d}</p><span className={`role-cap tone-${tone}`} /></motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="sc-sec tone-paper2" id="faq">
        <div className="sc-wrap narrow">
          <motion.div {...rise()} className="sc-head"><h2>Questions, answered.</h2></motion.div>
          {FAQ.map(([qq, a], i) => (
            <motion.div key={qq} {...rise(i * 0.05)} className={`faq ${open === i ? 'open' : ''}`}>
              <button type="button" aria-expanded={open === i} onClick={() => setOpen(open === i ? -1 : i)}><span>{qq}</span><i aria-hidden="true" /></button>
              <motion.div initial={false} animate={{ height: open === i ? 'auto' : 0, opacity: open === i ? 1 : 0 }} transition={{ duration: 0.35, ease }} style={{ overflow: 'hidden' }}><p>{a}</p></motion.div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="sc-cta-sec">
        <motion.div {...rise()} className="cta-in">
          <h2>Start tracing in minutes.</h2>
          <p>Connect a wallet, register your organization and record your first batch.</p>
          <div className="sc-cta">
            <Link to="/register" className="sc-btn sc-btn-sun">Register your organization <ArrowRight size={17} /></Link>
            <Link to="/verify" className="sc-btn sc-btn-white">Verify a batch</Link>
          </div>
        </motion.div>
      </section>

      <footer className="sc-foot">
        <div className="sc-wrap foot-row"><span className="sc-logo"><span className="logo-cap"><i /><i /></span> PharmaTrace</span><span>Pharmaceutical provenance on Ethereum · Sepolia testnet</span></div>
        <div className="bigname" aria-hidden="true">PharmaTrace</div>
      </footer>
    </div>
  );
};

export default Showcase;
