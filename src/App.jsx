import { useState, useMemo, useEffect, useCallback } from 'react';
import './App.css';

const MOCK_USERS = [
  { id:"u1",  last_name:"Иванов",    first_name:"Алексей",  roles:["admin"],    permissions:["auth:users:create","auth:users:read","auth:users:update","auth:users:delete","auth:keys:revoke","auth:master_permissions:write"], gender:"male",   class_name:"11А", graduation_year:2025, login:"ivanov",    created_at:"2024-01-15T10:00:00Z", updated_at:"2025-03-20T15:30:00Z" },
  { id:"u2",  last_name:"Петрова",   first_name:"Мария",    roles:["teacher"],  permissions:["auth:users:read","technical_support:orders:get","technical_support:orders:create"], gender:"female", class_name:null, graduation_year:null, login:"petrova",   created_at:"2024-02-20T09:00:00Z", updated_at:"2025-04-10T12:00:00Z" },
  { id:"u3",  last_name:"Сидоров",   first_name:"Дмитрий",  roles:["student"],  permissions:["technical_support:orders:create"], gender:"male",   class_name:"10Б", graduation_year:2026, login:"sidorov",   created_at:"2024-03-01T08:00:00Z", updated_at:"2025-05-01T10:00:00Z" },
  { id:"u4",  last_name:"Козлова",   first_name:"Анна",     roles:["parent"],   permissions:["auth:users:read"], gender:"female", class_name:null, graduation_year:null, login:"kozlova",   created_at:"2024-03-15T11:00:00Z", updated_at:"2025-02-15T14:00:00Z" },
  { id:"u5",  last_name:"Новиков",   first_name:"Сергей",   roles:["staff"],    permissions:["auth:users:read","auth:users:update","technical_support:orders:get","technical_support:orders:set_status","technical_support:orders:set_worker"], gender:"male", class_name:null, graduation_year:null, login:"novikov", created_at:"2024-04-05T07:00:00Z", updated_at:"2025-01-30T09:00:00Z" },
  { id:"u6",  last_name:"Морозова",  first_name:"Елена",    roles:["graduate"], permissions:["auth:users:read"], gender:"female", class_name:"11А", graduation_year:2023, login:"morozova",  created_at:"2023-09-01T08:00:00Z", updated_at:"2024-06-30T17:00:00Z" },
  { id:"u7",  last_name:"Волков",    first_name:"Павел",    roles:["guest"],    permissions:[], gender:"male",   class_name:null, graduation_year:null, login:"volkov",    created_at:"2025-01-10T15:00:00Z", updated_at:"2025-01-10T15:00:00Z" },
  { id:"u8",  last_name:"Лебедева",  first_name:"Ольга",    roles:["teacher"],  permissions:["auth:users:read","auth:users:create","technical_support:orders:get","technical_support:orders:create","technical_support:orders:set_department"], gender:"female", class_name:null, graduation_year:null, login:"lebedeva", created_at:"2024-05-20T10:00:00Z", updated_at:"2025-03-15T11:00:00Z" },
  { id:"u9",  last_name:"Кузнецов", first_name:"Никита",   roles:["student"],  permissions:["technical_support:orders:create","technical_support:orders:get"], gender:"male", class_name:"9В", graduation_year:2027, login:"kuznetsov", created_at:"2024-09-01T08:00:00Z", updated_at:"2025-04-25T09:00:00Z" },
  { id:"u10", last_name:"Попова",    first_name:"Виктория", roles:["staff"],    permissions:["auth:users:read","auth:users:update","auth:basic_permissions:write","technical_support:orders:get","technical_support:orders:set_status"], gender:"female", class_name:null, graduation_year:null, login:"popova", created_at:"2024-06-12T10:00:00Z", updated_at:"2025-05-02T13:00:00Z" },
];

const ROLE_META = {
  admin:    { label:"Администратор", bg:"hsl(16,65%,92%)",  fg:"hsl(16,65%,30%)",  dot:"hsl(16,65%,55%)",  badge:"primary" },
  teacher:  { label:"Учитель",       bg:"hsl(88,50%,88%)",  fg:"hsl(88,63%,25%)",  dot:"hsl(88,63%,43%)",  badge:"secondary" },
  student:  { label:"Ученик",        bg:"hsl(197,57%,88%)", fg:"hsl(197,57%,28%)", dot:"hsl(197,57%,45%)", badge:"accent" },
  parent:   { label:"Родитель",      bg:"hsl(277,40%,90%)", fg:"hsl(277,50%,30%)", dot:"hsl(277,58%,58%)", badge:"info" },
  staff:    { label:"Персонал",      bg:"hsl(26,99%,90%)",  fg:"hsl(26,99%,25%)",  dot:"hsl(26,99%,57%)",  badge:"success" },
  guest:    { label:"Гость",         bg:"hsl(30,5%,88%)",   fg:"hsl(30,5%,30%)",   dot:"hsl(30,5%,55%)",   badge:"warning" },
  graduate: { label:"Выпускник",     bg:"hsl(48,100%,88%)", fg:"hsl(48,80%,22%)",  dot:"hsl(48,100%,50%)", badge:"error" },
};

const fmtDate = s => new Date(s).toLocaleDateString('ru-RU',{day:'2-digit',month:'2-digit',year:'numeric'});
const fmtDT = s => new Date(s).toLocaleString('ru-RU',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'});
const fullName = u => `${u.last_name} ${u.first_name}`;

function RoleBadge({ role }) {
  const m = ROLE_META[role];
  return (
    <>
    <span style={{
      background:m.bg, color:m.fg,
      padding: '3px 8px',
      borderRadius:999, fontSize: '.68rem', fontWeight:600,
      display:'inline-flex', alignItems:'center', gap:5, whiteSpace:'nowrap',
    }}>
      <span style={{width:6,height:6,borderRadius:'50%',background:m.dot,flexShrink:0}}/>
      {m.label}
    </span>
    {/*<div className={`badge badge-soft badge-${m.badge}`}>{m.label}</div>*/}
    </>
  );
}

function PermChip({ perm, delay }) {
  const isAuth = perm.startsWith('auth:');
  const short = perm.split(':').slice(1).join(':');
  return (
    <span className={`perm-chip ${isAuth ? 'perm-auth' : 'perm-support'} badge-pop`}
      style={{animationDelay:`${delay}ms`, position:'relative'}}>
      <span style={{opacity:.6,fontSize:'.6rem'}}>{isAuth ? '🔑' : '🛠'}</span>
      {short}
    </span>
  );
}

function PasswordModal({ user, onClose }) {
  const [pw, setPw] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show] = useState(false);
  const [saved, setSaved] = useState(false);
  const match = pw && pw === confirm;

  const handleSave = () => {
    if (!match) return;
    setSaved(true);
  };

  return (
    <div className="pw-modal-backdrop anim-fadein" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="pw-modal anim-scalein">
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
          <div>
            <h3 style={{fontWeight:700,fontSize:'1.1rem',margin:0}}>Смена пароля</h3>
            <p style={{margin:'2px 0 0',fontSize:'.82rem',color:'#888'}}>{fullName(user)} · {user.login}</p>
          </div>
          <button onClick={onClose} style={{background:'none',border:'none',cursor:'pointer',fontSize:'1.4rem',color:'#bbb',lineHeight:1}}>✕</button>
        </div>

        {saved ? (
          <div style={{textAlign:'center',padding:'24px 0'}}>
            <div style={{fontSize:'2.5rem',marginBottom:8}}>✅</div>
            <p style={{fontWeight:600,color:'hsl(88,63%,38%)'}}>Пароль успешно изменён</p>
          </div>
        ) : (
          <>
            <div style={{marginBottom:14}}>
              <label style={{fontSize:'.8rem',fontWeight:600,color:'#666',display:'block',marginBottom:6}}>Новый пароль</label>
              <div style={{position:'relative'}}>
                <input type={show?'text':'password'} className="input input-bordered w-full search-wrap"
                  placeholder="Пароль" value={pw} onChange={e => setPw(e.target.value)}
                  style={{borderRadius:'2rem',fontSize:'.875rem',width:'100%'}}/>
              </div>
            </div>
            <div style={{marginBottom:20}}>
              <label style={{fontSize:'.8rem',fontWeight:600,color:'#666',display:'block',marginBottom:6}}>Подтверждение</label>
              <input type={show?'text':'password'} className="input input-bordered w-full search-wrap"
                placeholder="Повторите пароль" value={confirm} onChange={e => setConfirm(e.target.value)}
                style={{borderRadius:'2rem',fontSize:'.875rem',width:'100%'}}/>
              {confirm && !match && <p style={{color:'hsl(16,65%,50%)',fontSize:'.76rem',marginTop:4}}>✗ Пароли не совпадают</p>}
              {match && <p style={{color:'hsl(88,63%,38%)',fontSize:'.76rem',marginTop:4}}>✓ Пароли совпадают</p>}
            </div>
            <button className="btn-pw" style={{opacity:match?1:.5,width:'100%',justifyContent:'center'}} onClick={handleSave} disabled={!match}>
              Сохранить пароль
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function UserDrawer({ user, onClose }) {
  const [closing, setClosing] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const close = useCallback(() => {
    setClosing(true);
    setTimeout(onClose, 260);
  }, [onClose]);

  useEffect(() => {
    const esc = e => { if (e.key === 'Escape') close(); };
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, [close]);

  const authPerms = user.permissions.filter(p => p.startsWith('auth:'));
  const suppPerms = user.permissions.filter(p => p.startsWith('technical_support:'));

  const rows = [
    { label:'Пол',         value: user.gender === 'male' ? '♂ Мужской' : '♀ Женский' },
    { label:'Класс',       value: user.class_name || '—' },
    { label:'Год выпуска', value: user.graduation_year ?? '—' },
    { label:'Создан',      value: fmtDate(user.created_at) },
    { label:'Обновлён',    value: fmtDT(user.updated_at) },
    { label:'ID',          value: <span style={{fontFamily:'JetBrains Mono',fontSize:'.7rem',color:'#aaa'}}>{user.id}</span> },
  ];

  return (
    <>
      <div className={`drawer-overlay ${closing?'':'anim-fadein'}`} style={{animationDirection:closing?'reverse':'normal'}} onClick={close}/>
      <div className={`drawer-panel ${closing ? 'drawer-exit' : 'drawer-enter'}`}>

        <div style={{background:ROLE_META[user.roles[0]]?.dot, padding:'28px 24px 20px', flexShrink:0}}>
          <div style={{display:'flex',justifyContent:'flex-end',marginBottom:12}}>
            <button onClick={close} style={{background:'rgba(255,255,255,.2)',border:'none',borderRadius:999,width:32,height:32,cursor:'pointer',color:'white',fontSize:'1rem',display:'flex',alignItems:'center',justifyContent:'center'}}>✕</button>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:16}}>
            <div>
              <h2 style={{color:'white',fontWeight:700,fontSize:'1.2rem',margin:0,textShadow:'0 1px 4px rgba(0,0,0,.2)'}}>
                {user.last_name} {user.first_name}
              </h2>
              <p style={{color:'rgba(255,255,255,.75)',margin:'3px 0 6px',fontSize:'.85rem',fontFamily:'JetBrains Mono'}}>
                {user.login}
              </p>
              <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                {user.roles.map(r => <RoleBadge key={r} role={r}/>)}
              </div>
            </div>
          </div>
        </div>

        <div style={{flex:1,overflowY:'auto',padding:'20px 24px'}}>
          <div style={{marginBottom:24}}>
            <div className="section-label">Основная информация</div>
            <div style={{background:'white',borderRadius:12,border:'1px solid hsl(103,40%,90%)',overflow:'hidden'}}>
              {rows.map(({label,value},i) => (
                <div key={i} className="detail-row" style={{borderBottom: i < rows.length-1 ? '1px solid hsl(103,40%,90%)' : 'none'}}>
                  <span style={{color:'#888',fontSize:'.82rem'}}>{label}</span>
                  <span style={{fontWeight:500,color:'#1a1a1a',fontSize:'.875rem'}}>{value}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{marginBottom:24}}>
            <div className="section-label">
              <span>Разрешения</span>
              <span style={{background:'hsl(120,50%,40%)',color:'white',borderRadius:999,padding:'1px 8px',fontSize:'.65rem',fontWeight:700}}>
                {user.permissions.length}
              </span>
            </div>
            {user.permissions.length === 0 ? (
              <div style={{textAlign:'center',padding:'20px',color:'#ccc',fontSize:'.85rem',background:'white',borderRadius:12,border:'1px dashed hsl(103,40%,85%)'}}>
                Нет разрешений
              </div>
            ) : (
              <div style={{display:'flex',flexDirection:'column',gap:14}}>
                {authPerms.length > 0 && (
                  <div>
                    <div style={{fontSize:'.7rem',color:'hsl(197,50%,40%)',fontWeight:700,marginBottom:8,display:'flex',alignItems:'center',gap:5}}>🔑 Авторизация</div>
                    <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
                      {authPerms.map((p,i) => <PermChip key={p} perm={p} delay={i*50}/>)}
                    </div>
                  </div>
                )}
                {suppPerms.length > 0 && (
                  <div>
                    <div style={{fontSize:'.7rem',color:'hsl(26,80%,40%)',fontWeight:700,marginBottom:8,display:'flex',alignItems:'center',gap:5}}>🛠 Техподдержка</div>
                    <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
                      {suppPerms.map((p,i) => <PermChip key={p} perm={p} delay={(authPerms.length+i)*50}/>)}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="section-label">Действия</div>
          <button className="btn-pw" style={{width:'100%',justifyContent:'center'}} onClick={() => setShowPw(true)}>
            Сменить пароль
          </button>
        </div>
      </div>
      {showPw && <PasswordModal user={user} onClose={() => setShowPw(false)}/>}
    </>
  );
}

export default function App() {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(null);
  const [roleFilter, setRoleFilter] = useState('all');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return MOCK_USERS.filter(u => {
      const mQ = !q || u.login.toLowerCase().includes(q) || `${u.last_name} ${u.first_name}`.toLowerCase().includes(q) || u.first_name.toLowerCase().includes(q) || u.last_name.toLowerCase().includes(q);
      const mR = roleFilter === 'all' || u.roles.includes(roleFilter);
      return mQ && mR;
    });
  }, [query, roleFilter]);

  {/*const stats = {
    total:    MOCK_USERS.length,
    admins:   MOCK_USERS.filter(u => u.roles.includes('admin')).length,
    teachers: MOCK_USERS.filter(u => u.roles.includes('teacher')).length,
    students: MOCK_USERS.filter(u => u.roles.includes('student')).length,
  };*/}

  return (
    <div style={{minHeight:'100vh', background:'hsl(103,72%,87%)'}}>

      <div className="page-header anim-header" style={{padding:'28px 32px 0px'}}>
        <div style={{position:'relative',zIndex:1}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20}}>
            <div>
              <h1 style={{color:'white',fontWeight:700,fontSize:'1.6rem',margin:0,letterSpacing:'-0.02em'}}>
                Админка авторизации
              </h1>
              <p style={{color:'rgba(255,255,255,.65)',margin:'4px 0 0',fontSize:'.85rem'}}>
                Просмотр и управление учётными записями
              </p>
            </div>
            {/* <div style={{background:'rgba(255,255,255,.15)',borderRadius:999,padding:'8px 18px',border:'1px solid rgba(255,255,255,.25)',color:'white',fontSize:'.85rem',fontWeight:500}}>
              {MOCK_USERS.length} пользователей
            </div> */}
          </div>

          {/*<div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12}}>
            {[
              {label:'Всего',           value:stats.total},
              {label:'Администраторы',  value:stats.admins},
              {label:'Учителей',        value:stats.teachers},
              {label:'Учеников',        value:stats.students},
            ].map((s,i) => (
              <div key={i} className="stat-card" style={{padding:'14px 16px',animationDelay:`${i*80}ms`}}>
                <div style={{color:'rgba(255,255,255,.7)',fontSize:'.72rem',fontWeight:600,letterSpacing:'.05em',textTransform:'uppercase',marginBottom:4}}>
                  {s.label}
                </div>
                <div style={{color:'white',fontSize:'1.8rem',fontWeight:700,lineHeight:1}}>{s.value}</div>
              </div>
            ))}
          </div>*/}
        </div>
      </div>

      <div style={{padding:'28px 32px'}}>

        <div className="anim-fadeup" style={{animationDelay:'150ms',display:'flex',gap:12,marginBottom:16,alignItems:'flex-start',flexWrap:'wrap'}}>
          <div className="search-wrap" style={{flex:'1 1 280px',position:'relative',bottom:5}}>
            <input type="text" placeholder="Поиск по имени или логину" value={query} onChange={e => setQuery(e.target.value)}
              style={{width:'100%',padding:'11px 16px 11px',border:'1.5px solid hsl(103,40%,75%)',borderRadius:999,fontSize:'.875rem',background:'white',outline:'none',transition:'all .2s ease',boxSizing:'border-box'}}/>
            {query && (
              <>
                <button onClick={() => setQuery('')} style={{position:'absolute',right:14,top:'50%',transform:'translateY(-50%)',background:'none',border:'none',cursor:'pointer',fontSize:'1rem',color:'#aaa'}}>✕</button>
              </>
            )}
          </div>
          <div style={{display:'flex',gap:6,flexWrap:'wrap',alignItems:'center'}}>
            {['all', ...Object.keys(ROLE_META)].map(r => {
              const m = ROLE_META[r];
              const active = roleFilter === r;
              return (
                <button key={r} onClick={() => setRoleFilter(r)} style={{
                  padding:'8px 14px', borderRadius:999, fontSize:'.75rem', fontWeight:600, cursor:'pointer',
                  transition:'all .18s ease',
                  border: active ? 'none' : '1.5px solid hsl(103,40%,75%)',
                  background: active ? (m ? m.bg : 'hsl(120,50%,40%)') : 'white',
                  color: active ? (m ? m.fg : 'white') : '#666',
                  transform: active ? 'translateY(-1px)' : 'none',
                  boxShadow: active ? '0 3px 10px rgba(0,0,0,.12)' : 'none',
                }}>
                  {r === 'all' ? 'Все' : m.label}
                </button>
              );
            })}
          </div>
        </div>

        {(query || roleFilter !== 'all') && (
          <div style={{marginBottom:10,fontSize:'.82rem',color:'hsl(120,40%,35%)',fontWeight:500}}>
            Найдено: {filtered.length} из {MOCK_USERS.length}
          </div>
        )}

        <div className="table-wrap anim-fadeup" style={{animationDelay:'250ms'}}>
          <table className="user-table" style={{width:'100%',borderCollapse:'collapse',background:'white'}}>
            <thead>
              <tr>
                {['ФИО','Логин','Роль','Пол','Класс','Год выпуска','Создан','Разрешений'].map((h,i) => (
                  <th key={i} style={{textAlign: i===0 ? 'center' : 'left'}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9}>
                    <div style={{textAlign:'center',padding:'60px 20px',color:'#bbb'}}>
                      <div style={{fontSize:'3rem',marginBottom:12}}>🔍</div>
                      <p style={{fontWeight:600,fontSize:'1rem',color:'#ccc',margin:'0 0 4px'}}>Пользователи не найдены</p>
                      <p style={{fontSize:'.85rem',color:'#ddd',margin:0}}>Попробуйте изменить запрос</p>
                    </div>
                  </td>
                </tr>
              ) : filtered.map((user, idx) => (
                <tr key={user.id}
                  className={`user-row row-animate ${selected?.id === user.id ? 'selected' : ''}`}
                  style={{animationDelay:`${idx*40}ms`}}
                  onClick={() => setSelected(user)}>
                  <td><div style={{fontWeight:600,fontSize:'.88rem',textAlign:'center'}}>{user.last_name} {user.first_name}</div></td>
                  <td>
                    <span style={{fontFamily:'JetBrains Mono',fontSize:'.78rem',color:'#888',background:'hsl(103,30%,95%)',padding:'3px 8px',borderRadius:6}}>
                      {user.login}
                    </span>
                  </td>
                  <td>
                    <div style={{display:'flex',flexWrap:'wrap',gap:4}}>
                      {user.roles.map(r => <RoleBadge key={r} role={r}/>)}
                    </div>
                  </td>
                  <td style={{fontSize:'1.1rem'}} title={user.gender === 'male' ? 'Мужской' : 'Женский'}>
                    {user.gender === 'male' ? '♂' : '♀'}
                  </td>
                  <td style={{color: user.class_name ? '#1a1a1a' : '#ccc', fontWeight: user.class_name ? 600 : 400}}>
                    {user.class_name || '—'}
                  </td>
                  <td style={{color: user.graduation_year ? '#1a1a1a' : '#ccc', fontWeight: user.graduation_year ? 500 : 400}}>
                    {user.graduation_year || '—'}
                  </td>
                  <td style={{color:'#888',fontSize:'.8rem'}}>{fmtDate(user.created_at)}</td>
                  <td>
                    <span style={{
                      background: user.permissions.length > 0 ? 'hsl(120,50%,92%)' : 'hsl(103,20%,93%)',
                      color: user.permissions.length > 0 ? 'hsl(120,50%,30%)' : '#bbb',
                      padding:'3px 10px',borderRadius:999,fontSize:'.75rem',fontWeight:600,
                    }}>
                      {user.permissions.length}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selected && <UserDrawer user={selected} onClose={() => setSelected(null)}/>}
    </div>
  );
}