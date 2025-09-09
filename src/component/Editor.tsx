// types.ts
export type IssueDetail = {
  good?: string;
  improvement: string;
  suggestion: string;
};

export type Issue = {
  body?: IssueDetail;
  lead?: IssueDetail;
  title?: IssueDetail;
};

export type EditorProps = {
  text: string;
  issues?: Issue[] | Issue; // 配列または単一のオブジェクトを許可
};

export type ImageIssue = {
  url?: string;
  good?: string;
  improvement?: string;
  suggestion?: string;
}

export default function ProofreadingEditor({
  text,
  issues = [], // デフォルト値を設定
}: EditorProps) {
  // issuesを配列に正規化する関数
  const normalizeIssues = (issues: Issue[] | Issue | undefined): Issue[] => {
    if (!issues) return [];
    if (Array.isArray(issues)) return issues;
    return [issues]; // 単一のオブジェクトの場合は配列に変換
  };

  // 全ての改善点を平坦化する関数
  const flattenIssues = (issues: Issue[]) => {
    const flattenedIssues: Array<IssueDetail & { type: string }> = [];

    issues.forEach((issue) => {
      if (issue?.title) {
        flattenedIssues.push({ ...issue.title, type: "タイトル" });
      }
      if (issue?.lead) {
        flattenedIssues.push({ ...issue.lead, type: "リード文" });
      }
      if (issue?.body) {
        flattenedIssues.push({ ...issue.body, type: "本文" });
      }
    });

    return flattenedIssues;
  };

  const normalizedIssues = normalizeIssues(issues);
  const flattenedIssues = flattenIssues(normalizedIssues);

  return (
    <div className="w-full h-screen grid grid-cols-1 md:grid-cols-2">
      {/* 左：本文 */}
      <section className="p-6 overflow-auto border-r">
        <h2 className="text-xl font-semibold mb-4">校正対象</h2>
        <article className="whitespace-pre-wrap leading-7">{text}</article>
      </section>

      {/* 右：改善点リスト */}
      <aside className="p-6 overflow-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">改善点</h2>
          <span className="text-sm opacity-70">
            {flattenedIssues.length} 件
          </span>
        </div>

        {flattenedIssues.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            改善点はありません
          </div>
        ) : (
          <ul className="space-y-3">
            {flattenedIssues.map((issue, i) => (
              <li key={i} className="rounded-2xl border p-4 shadow-sm">
                <div className="text-xs font-medium mb-2 px-2 py-1 bg-blue-100 text-blue-800 rounded-md inline-block">
                  {issue.type}
                </div>
                <div className="text-sm font-medium mb-1">検出内容</div>
                <p className="mb-2">{issue.improvement || "—"}</p>
                <div className="text-sm font-medium mb-1">提案</div>
                <p className="text-slate-700">{issue.suggestion || "—"}</p>
              </li>
            ))}
          </ul>
        )}
      </aside>
    </div>
  );
}
