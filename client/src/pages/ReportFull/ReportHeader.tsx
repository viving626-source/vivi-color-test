interface ReportHeaderProps {
  mainStyle: string;
  keywords: string[];
}

const ReportHeader = ({ mainStyle, keywords }: ReportHeaderProps) => {
  return (
    <header className="text-center py-10 md:py-14 px-6">
      <div className="font-serif text-3xl md:text-4xl font-bold text-burgundy tracking-tight mb-2">
        Vivi Macau
      </div>
      <div className="text-sm text-muted-foreground mb-6">
        2027 最新韓流色彩/妝容風格測試 · 線上版
      </div>
      <div className="inline-block mb-4">
        <span className="bg-burgundy text-white rounded-full px-4 py-1 text-sm uppercase tracking-wider">
          個人專屬完整報告
        </span>
      </div>
      <h1 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-4 leading-tight">
        {mainStyle}
      </h1>
      <div className="flex flex-wrap justify-center gap-2">
        {keywords.map((keyword: string, index: number) => (
          <span
            key={index}
            className="inline-block bg-cream-light border border-border text-foreground rounded-full px-3 py-1 text-sm"
          >
            {keyword}
          </span>
        ))}
      </div>
    </header>
  );
};

interface ReportFooterProps {}

const ReportFooter = (_props: ReportFooterProps) => {
  return (
    <footer className="text-center py-10 px-6 border-t border-border/60 mt-12">
      <div className="font-serif text-xl font-bold text-burgundy mb-2">
        Vivi Macau
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed max-w-xl mx-auto mb-4">
         本報告為輔助分析結果，僅供個人色彩與風格參考，不構成醫療或專業建議。
        <br />
        實際效果可能因個人膚質、髮質、體型等差異而有所不同。
      </p>
      <p className="text-xs text-muted-foreground">
        理論依據：韓國 PCS 16型體系 · 歐美四季色彩理論 · 法式 Colorimétrie
      </p>
      <p className="text-xs text-muted-foreground mt-4">
        © 2027 Vivi Macau. All rights reserved.
      </p>
    </footer>
  );
};

export { ReportHeader, ReportFooter };
export default ReportHeader;
