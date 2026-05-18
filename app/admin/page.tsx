'use client';

export default function AdminDashboardPage() {
  return (
    <div className="page active" id="page-dashboard">
      <div className="sr">
        <div className="sc t">
          <div className="sh">
            <div className="si si-t">👥</div>
            <span className="tr up">↑12.5%</span>
          </div>
          <div className="sv">12,847</div>
          <div className="sl">Ҳамаи корбарон</div>
        </div>
        <div className="sc g">
          <div className="sh">
            <div className="si si-g">👑</div>
            <span className="tr up">↑8.3%</span>
          </div>
          <div className="sv">2,431</div>
          <div className="sl">Premium</div>
        </div>
        <div className="sc b">
          <div className="sh">
            <div className="si si-b">📚</div>
            <span className="tr up">↑24%</span>
          </div>
          <div className="sv">47,329</div>
          <div className="sl">Дарсҳо имрӯз</div>
        </div>
        <div className="sc r">
          <div className="sh">
            <div className="si si-r">💰</div>
            <span className="tr up">↑15.2%</span>
          </div>
          <div className="sv">$12,134</div>
          <div className="sl">Даромади моҳ</div>
        </div>
      </div>

      <div className="two">
        <div className="sec">
          <div className="shd"><div className="st">📈 Корбарони нав (7 рӯз)</div></div>
          <div className="sb2">
            <div className="cbars">
              <div className="cb t" style={{ height: '60%' }} data-v="421"></div>
              <div className="cb t" style={{ height: '75%' }} data-v="528"></div>
              <div className="cb t" style={{ height: '52%' }} data-v="367"></div>
              <div className="cb t" style={{ height: '90%' }} data-v="634"></div>
              <div className="cb t" style={{ height: '68%' }} data-v="478"></div>
              <div className="cb t" style={{ height: '82%' }} data-v="578"></div>
              <div className="cb g" style={{ height: '100%' }} data-v="703"></div>
            </div>
            <div className="clbls">
              <div className="cl2">Дш</div><div className="cl2">Сш</div><div className="cl2">Чш</div>
              <div className="cl2">Пш</div><div className="cl2">Ҷм</div><div className="cl2">Шб</div><div className="cl2">Яш</div>
            </div>
            <div style={{ display: 'flex', gap: '14px', marginTop: '10px', paddingTop: '9px', borderTop: '1px solid var(--border)' }}>
              <span style={{ fontSize: '11px', color: 'var(--text3)' }}>Ҳафта: <b style={{ color: 'var(--teal)' }}>3,709</b></span>
              <span style={{ fontSize: '11px', color: 'var(--text3)' }}>Имрӯз: <b style={{ color: 'var(--gold)' }}>703</b></span>
            </div>
          </div>
        </div>
        <div className="sec">
          <div className="shd"><div className="st">💰 Даромад (7 рӯз)</div></div>
          <div className="sb2">
            <div className="cbars">
              <div className="cb g" style={{ height: '55%' }} data-v="$1.2K"></div>
              <div className="cb g" style={{ height: '72%' }} data-v="$1.6K"></div>
              <div className="cb g" style={{ height: '48%' }} data-v="$1.1K"></div>
              <div className="cb g" style={{ height: '88%' }} data-v="$2.0K"></div>
              <div className="cb g" style={{ height: '63%' }} data-v="$1.4K"></div>
              <div className="cb g" style={{ height: '79%' }} data-v="$1.8K"></div>
              <div className="cb t" style={{ height: '100%' }} data-v="$2.2K"></div>
            </div>
            <div className="clbls">
              <div className="cl2">Дш</div><div className="cl2">Сш</div><div className="cl2">Чш</div>
              <div className="cl2">Пш</div><div className="cl2">Ҷм</div><div className="cl2">Шб</div><div className="cl2">Яш</div>
            </div>
            <div style={{ display: 'flex', gap: '14px', marginTop: '10px', paddingTop: '9px', borderTop: '1px solid var(--border)' }}>
              <span style={{ fontSize: '11px', color: 'var(--text3)' }}>Ҳафта: <b style={{ color: 'var(--gold)' }}>$11.3K</b></span>
              <span style={{ fontSize: '11px', color: 'var(--text3)' }}>Имрӯз: <b style={{ color: 'var(--teal)' }}>$2.2K</b></span>
            </div>
          </div>
        </div>
      </div>

      <div className="two">
        <div className="sec">
          <div className="shd">
            <div className="st">🏆 Top корбарон</div>
            <button className="btn bg2b">Ҳама →</button>
          </div>
          <div className="sb2">
            <div className="mli">
              <div className="avatar" style={{ background: 'var(--teal)' }}>A</div>
              <div style={{ flex: 1 }}>
                <div className="mln">Amira Rahimova</div>
                <div className="mls">🔥 45 рӯз • 14,500 XP</div>
              </div>
              <span className="pill pp">Premium</span>
            </div>
            <div className="mli">
              <div className="avatar" style={{ background: '#6366F1' }}>J</div>
              <div style={{ flex: 1 }}>
                <div className="mln">John Smith</div>
                <div className="mls">🔥 30 рӯз • 13,200 XP</div>
              </div>
              <span className="pill pp">Premium</span>
            </div>
            <div className="mli">
              <div className="avatar" style={{ background: '#EC4899' }}>S</div>
              <div style={{ flex: 1 }}>
                <div className="mln">Sara Nazarova</div>
                <div className="mls">🔥 22 рӯз • 12,800 XP</div>
              </div>
              <span className="pill pa">Free</span>
            </div>
            <div className="mli">
              <div className="avatar" style={{ background: '#F97316' }}>T</div>
              <div style={{ flex: 1 }}>
                <div className="mln">Timur Karimov</div>
                <div className="mls">🔥 18 рӯз • 11,000 XP</div>
              </div>
              <span className="pill pp">Premium</span>
            </div>
            <div className="mli">
              <div className="avatar" style={{ background: '#8B5CF6' }}>M</div>
              <div style={{ flex: 1 }}>
                <div className="mln">Muhammadyoqub</div>
                <div className="mls">🔥 14 рӯз • 9,800 XP</div>
              </div>
              <span className="pill pa">Free</span>
            </div>
          </div>
        </div>
        <div className="sec">
          <div className="shd"><div className="st">🌍 Забон тақсим</div></div>
          <div className="sb2">
            <div className="ub">
              <span className="ul">🇬🇧 English</span>
              <div className="ut"><div className="uf" style={{ width: '78%', background: 'var(--teal)' }}></div></div>
              <span className="uv" style={{ color: 'var(--teal)' }}>78%</span>
            </div>
            <div className="ub">
              <span className="ul">🇷🇺 Русский</span>
              <div className="ut"><div className="uf" style={{ width: '62%', background: 'var(--blue)' }}></div></div>
              <span className="uv" style={{ color: 'var(--blue)' }}>62%</span>
            </div>
            <div className="ub">
              <span className="ul">🇩🇪 Deutsch</span>
              <div className="ut"><div className="uf" style={{ width: '31%', background: 'var(--purple)' }}></div></div>
              <span className="uv" style={{ color: 'var(--purple)' }}>31%</span>
            </div>
            <div className="ub">
              <span className="ul">🇸🇦 العربية</span>
              <div className="ut"><div className="uf" style={{ width: '24%', background: 'var(--gold)' }}></div></div>
              <span className="uv" style={{ color: 'var(--gold)' }}>24%</span>
            </div>
            <div className="ub">
              <span className="ul">🇫🇷 Français</span>
              <div className="ut"><div className="uf" style={{ width: '18%', background: 'var(--orange)' }}></div></div>
              <span className="uv" style={{ color: 'var(--orange)' }}>18%</span>
            </div>
            <div className="ub">
              <span className="ul">🇨🇳 中文</span>
              <div className="ut"><div className="uf" style={{ width: '11%', background: 'var(--red)' }}></div></div>
              <span className="uv" style={{ color: 'var(--red)' }}>11%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="sec">
        <div className="shd">
          <div className="st">⚡ Охирин фаъолиятҳо</div>
          <span style={{ fontSize: '10px', color: 'var(--green)', fontWeight: 700 }}>● Live</span>
        </div>
        <div className="sb2">
          <div className="noti">
            <div className="ndot" style={{ background: 'var(--teal)' }}></div>
            <div>
              <div style={{ fontSize: '12px', fontWeight: 600 }}>Корбари нав: <b>Layla Mahmudova</b> ба қайд гирифт</div>
              <div style={{ fontSize: '10px', color: 'var(--text3)', marginTop: '2px' }}>2 дақиқа пеш</div>
            </div>
          </div>
          <div className="noti">
            <div className="ndot" style={{ background: 'var(--gold)' }}></div>
            <div>
              <div style={{ fontSize: '12px', fontWeight: 600 }}><b>Ahmed Hassan</b> Premium обуна шуд — $4.99</div>
              <div style={{ fontSize: '10px', color: 'var(--text3)', marginTop: '2px' }}>8 дақиқа пеш</div>
            </div>
          </div>
          <div className="noti">
            <div className="ndot" style={{ background: 'var(--blue)' }}></div>
            <div>
              <div style={{ fontSize: '12px', fontWeight: 600 }}><b>Sara Nazarova</b> сатҳи 5 ба даст овард</div>
              <div style={{ fontSize: '10px', color: 'var(--text3)', marginTop: '2px' }}>15 дақиқа пеш</div>
            </div>
          </div>
          <div className="noti">
            <div className="ndot" style={{ background: 'var(--purple)' }}></div>
            <div>
              <div style={{ fontSize: '12px', fontWeight: 600 }}>Дарси нав илова шуд: <b>"Present Perfect"</b></div>
              <div style={{ fontSize: '10px', color: 'var(--text3)', marginTop: '2px' }}>1 соат пеш</div>
            </div>
          </div>
          <div className="noti">
            <div className="ndot" style={{ background: 'var(--green)' }}></div>
            <div>
              <div style={{ fontSize: '12px', fontWeight: 600 }}><b>Timur Karimov</b> 7-рӯза силсиласи тамом кард</div>
              <div style={{ fontSize: '10px', color: 'var(--text3)', marginTop: '2px' }}>2 соат пеш</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
