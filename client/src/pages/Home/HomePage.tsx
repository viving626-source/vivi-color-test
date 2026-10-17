import { Link } from 'react-router-dom';
import { Button } from '@client/src/components/ui/button';
import { Image } from '@client/src/components/ui/image';

import { REPORT_IMAGES } from '@client/src/data/quizImages';

const HomePage = () => {
  const steps = [
    {
      num: '01',
      title: '上傳照片',
      desc: '上傳面部素顏照 1-3 張 + 全身照 1-3 張，進行專業圖像分析，多角度判斷更精準',
      img: REPORT_IMAGES.styleKorean,
    },
    {
      num: '02',
      title: '完成問卷',
      desc: '12 個維度、48 道專業題目，深度剖析你的膚色、五官、氣質與風格偏好，約 15 分鐘完成',
      img: REPORT_IMAGES.eyeFeatures,
    },
    {
      num: '03',
      title: '獲取報告',
      desc: '結合照片與問卷數據，生成個人化色彩與風格報告，找到最適合你的形象定位',
      img: REPORT_IMAGES.styleFrench,
    },
  ];

  const theories = [
    {
      title: '韓國 PCS 16 型體系',
      desc: '퍼스널컬러 四軸分析：冷煖 → 明度 → 彩度清濁 → 對比度，精準定位 16 型個人色彩',
    },
    {
      title: '歐美四季色彩理論',
      desc: 'Seasonal Color Analysis 春夏秋冬四季型人格，結合東方人特點進行在地化調適',
    },
    {
      title: '法式 Colorimétrie',
      desc: '法國色彩體系，融合時尚品味與整體造型，打造屬於你的高級感與個人風格',
    },
  ];

  const parts = [
    {
      label: 'PART 1',
      title: '春夏秋冬四季型人格分析',
      desc: '確定你的季節屬性：春 / 夏 / 秋 / 冬，以及 16 型精準定位，掌握適合你的色彩範圍',
    },
    {
      label: 'PART 2',
      title: '五官分析 & 妝容分析 & 珠寶搭配',
      desc: '深度解析五官量感與骨相特點，推薦最適合的妝容風格、口紅色號與珠寶款式',
    },
    {
      label: 'PART 3',
      title: '髮型 & 髮色分析',
      desc: '根據臉型、氣質與季節型，推薦適合的髮型輪廓與髮色選擇',
    },
    {
      label: 'PART 4',
      title: '風格定位 & 整體建議',
      desc: '綜合所有分析結果，給出整體風格定位、穿搭建議與形象提升方向',
    },
  ];

  return (
    <div className="min-h-screen bg-cream">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-6 py-16 md:py-24 grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <span className="text-sm uppercase tracking-widest text-burgundy/70 font-medium">
              Vivi Macau
            </span>
            <h1 className="font-serif text-4xl md:text-6xl text-burgundy-deep leading-tight tracking-tight">
              2027 最新韓流色彩
              <br />
              妝容風格測試
            </h1>
             <p className="font-serif text-2xl text-burgundy-deep/80 leading-relaxed tracking-wide">
               找出你潛在的命定風格
             </p>
             <p className="text-muted-foreground leading-relaxed mt-2">
                用 48 道專業問題，結合影像分析，找到專屬於你的季節色彩與風格定位
              </p>
            <p className="text-muted-foreground leading-relaxed">
              結合韓國 PCS 16 型個人色彩體系、歐美四季色彩理論與法式 Colorimétrie，
              透過影像分析與專業問卷，為你量身打造個人化色彩與妝容報告。
            </p>
            <div className="pt-4">
              <Link to="/upload">
                <Button
                  size="lg"
                  className="bg-burgundy text-white hover:bg-burgundy-deep px-10 py-6 text-base rounded-full shadow-lg"
                >
                  開始測試
                </Button>
              </Link>
              <p className="text-xs text-muted-foreground mt-3">
                約 15 分鐘完成 · 免費獲取基礎報告
              </p>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -top-8 -left-8 w-48 h-48 bg-rose-dust/20 rounded-full blur-3xl" />
            <div className="absolute -bottom-10 -right-6 w-40 h-40 bg-gold-brown/15 rounded-full blur-3xl" />
            <div className="relative rounded-2xl overflow-hidden shadow-xl border border-border/40">
             <Image
                 src="/static/aadkzzfuuwcds_ve_miaoda.png"
                 alt="高級亞洲女性形象，韓系清透妝容，呈現專業色彩測試氛圍"
                 sizes="(max-width: 768px) 100vw, 420px"
                 className="w-full h-auto object-cover"
               />
            </div>
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="py-20 bg-cream-light/50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <span className="text-sm uppercase tracking-widest text-burgundy/70 font-medium">
              How it works
            </span>
            <h2 className="font-serif text-3xl md:text-4xl text-burgundy-deep mt-3">
              三步驟，找到你的專屬色彩
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step) => (
              <div
                key={step.num}
                className="bg-cream-light rounded-2xl border border-border/60 shadow-sm p-6 hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 rounded-full bg-burgundy text-white flex items-center justify-center font-serif text-lg mb-5">
                  {step.num}
                </div>
                <div className="rounded-xl overflow-hidden mb-5 border border-border/40">
                  <Image
                    src={step.img}
                    alt={`步驟${step.num} ${step.title}示意圖`}
                    sizes="(max-width: 768px) 100vw, 280px"
                    className="w-full h-40 object-cover"
                  />
                </div>
                <h3 className="font-serif text-xl text-foreground mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Theory / Authority */}
      <section id="theory" className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <span className="text-sm uppercase tracking-widest text-burgundy/70 font-medium">
              Theory Base
            </span>
            <h2 className="font-serif text-3xl md:text-4xl text-burgundy-deep mt-3">
              權威理論依據
            </h2>
            <p className="text-muted-foreground mt-4 max-w-2xl mx-auto leading-relaxed">
              融合三大國際色彩體系，並綜合五官量感、骨相與風格形象診斷，
              打造最適合東方女性的個人色彩分析
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {theories.map((t) => (
              <div
                key={t.title}
                className="bg-cream-light rounded-2xl border border-border/60 shadow-sm p-7 hover:shadow-md transition-shadow"
              >
                <span className="text-gold-brown text-2xl">♡</span>
                <h3 className="font-serif text-xl text-foreground mt-4 mb-3">{t.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{t.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 bg-burgundy/5 rounded-2xl p-6 md:p-8 border border-burgundy/10">
            <div className="flex items-start gap-4">
              <span className="text-gold-brown text-xl shrink-0 mt-0.5">☑</span>
              <div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  我們專注於澳門及港澳地區女性的色彩與形象研究，累積超過 1000+ 位客戶的面對面診斷經驗。
                  結合韓國最新 16 型體系與歐美經典理論，並根據東方人特有的膚色、髮色與五官特點進行在地化調適，
                  讓測試結果更貼近你的真實樣貌。
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Report Preview */}
      <section className="py-20 bg-cream-light/50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <span className="text-sm uppercase tracking-widest text-burgundy/70 font-medium">
              Report Preview
            </span>
            <h2 className="font-serif text-3xl md:text-4xl text-burgundy-deep mt-3">
              你的報告包含什麼？
            </h2>
            <p className="text-muted-foreground mt-4">
              四大 PART 完整解析，從色彩到風格全方位定位
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div className="space-y-5">
              {parts.map((part) => (
                <div
                  key={part.label}
                  className="bg-cream-light rounded-2xl border border-border/60 shadow-sm p-6 hover:shadow-md transition-shadow"
                >
                  <span className="inline-block bg-burgundy text-white text-xs font-medium px-4 py-1.5 rounded-full uppercase tracking-wider mb-3">
                    {part.label}
                  </span>
                  <h3 className="font-serif text-lg text-foreground mb-2">{part.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{part.desc}</p>
                </div>
              ))}
            </div>
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute -top-6 -left-6 w-32 h-32 bg-rose-dust/20 rounded-full blur-3xl" />
                <div className="absolute -bottom-8 -right-8 w-40 h-40 bg-gold-brown/15 rounded-full blur-3xl" />
                <div className="relative rounded-2xl overflow-hidden shadow-xl border border-border/40">
                   <Image
                     src={REPORT_IMAGES.styleFrench}
                     alt="個人化色彩與風格報告示意圖"
                     sizes="(max-width: 768px) 100vw, 360px"
                     className="w-72 md:w-80 h-auto object-cover"
                   />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-6">
          <div className="bg-cream-light rounded-2xl border border-border/60 shadow-sm p-8 md:p-10">
            <div className="flex items-start gap-4">
              <span className="text-gold-brown text-xl shrink-0 mt-1">☑</span>
              <div>
                <h3 className="font-serif text-xl text-burgundy-deep mb-3">免責聲明</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  線上測試與照片分析為自我參考，無法 100% 取代線下專業色布比對與儀器測色，
                  最終診斷以專業色彩顧問面對面為準。本網站提供的建議僅供參考，
                  不構成任何專業形象設計或醫療美容建議。如有疑問，歡迎聯繫我們預約線下一對一諮詢。
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="font-serif text-3xl md:text-5xl text-burgundy-deep tracking-tight mb-5">
            找到屬於你的色彩
          </h2>
          <p className="text-muted-foreground mb-10 max-w-xl mx-auto leading-relaxed">
              現在就開始你的個人色彩之旅，15 分鐘獲得專屬於你的季節色彩與風格定位
          </p>
          <Link to="/upload">
            <Button
              size="lg"
              className="bg-burgundy text-white hover:bg-burgundy-deep px-12 py-6 text-base rounded-full shadow-lg"
            >
              開始測試
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
