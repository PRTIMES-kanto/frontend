import { Progress } from "@/components/ui/progress";
import { formSchema, type ArticleData } from "@/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";

// types.ts
export type IssueDetail = {
  improvement: string;
  suggestion: string;
};

export type Issue = {
  body?: IssueDetail;
  lead?: IssueDetail;
  title?: IssueDetail;
};

export default function Editor() {
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "success" | "error"
  >("idle");

  // 進捗バー
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<number | null>(null);
  const startFakeProgress = () => {
    setProgress(10);
    stopFakeProgress(); // 念のため
    timerRef.current = window.setInterval(() => {
      setProgress((p) => {
        const next = p + Math.random() * 10 + 5; // 5〜15%ずつ
        return Math.min(next, 90);
      });
      return 0;
    }, 400);
  };
  const stopFakeProgress = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  // 送信するフォームデータを保存
  const [formData, setFormData] = useState<ArticleData | null>(null);

  const [analysisResult, setAnalysisResult] = useState<Issue[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<ArticleData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      lead_paragraph: "",
      body: "",
    },
  });

  // 文字数カウント用
  const watchedFields = watch(["title", "lead_paragraph"]);

  const onSubmit = async (data: ArticleData) => {
    setSubmitStatus("idle");
    startFakeProgress();

    try {
      setFormData(data); // 送信するデータを保存

      const response = await fetch("http://localhost:8080/review", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      // レスポンスが来たら 95% へ
      setProgress(95);

      const result = await response.json();
      setAnalysisResult(result);

      // 成功で 100% → 少ししてリセット
      setProgress(100);
      setSubmitStatus("success");
    } catch (error) {
      setSubmitStatus("error");
      console.error("送信エラー:", error);
    } finally {
      stopFakeProgress();
      // 演出のため少し見せて０に戻す
      setTimeout(() => setProgress(0), 600);
    }
  };

  useEffect(() => {
    console.log("Analysis Result:", analysisResult);
  }, [analysisResult]);

  const fieldConfigs = [
    {
      id: "title",
      name: "title" as const,
      label: "タイトル",
      placeholder: "記事のタイトルを入力してください",
      rows: 2,
      required: true,
      maxLength: 100,
      showCharCount: true,
    },
    {
      id: "lead_paragraph",
      name: "lead_paragraph" as const,
      label: "リード文",
      placeholder: "リード文を入力してください（任意、200文字以内）",
      rows: 4,
      maxLength: 200,
      showCharCount: true,
    },
    {
      id: "body",
      name: "body" as const,
      label: "本文",
      placeholder: "記事の本文を入力してください（10文字以上）",
      rows: 8,
      required: true,
    },
  ];

  const formStyles = {
    container: {
      maxWidth: "800px",
      margin: "0 auto",
      padding: "20px",
      fontFamily:
        '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    },
    header: {
      marginBottom: "30px",
      textAlign: "center" as const,
      color: "#333",
    },
    form: {
      backgroundColor: "#ffffff",
      padding: "30px",
      borderRadius: "12px",
      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
      border: "1px solid #e1e5e9",
    },
    fieldGroup: {
      marginBottom: "24px",
    },
    label: {
      display: "block",
      marginBottom: "8px",
      fontWeight: "600" as const,
      color: "#374151",
      fontSize: "14px",
    },
    textarea: {
      width: "100%",
      padding: "12px 16px",
      border: "2px solid #e5e7eb",
      borderRadius: "8px",
      fontSize: "14px",
      lineHeight: "1.5",
      resize: "vertical" as const,
      transition: "border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
      fontFamily: "inherit",
      outline: "none",
    },
    textareaError: {
      borderColor: "#ef4444",
    },
    error: {
      color: "#ef4444",
      fontSize: "12px",
      marginTop: "4px",
      display: "block",
    },
    charCount: {
      fontSize: "12px",
      color: "#6b7280",
      textAlign: "right" as const,
      marginTop: "4px",
    },
    submitButton: {
      backgroundColor: isSubmitting ? "#9ca3af" : "#3b82f6",
      color: "white",
      border: "none",
      borderRadius: "8px",
      padding: "12px 32px",
      fontSize: "16px",
      fontWeight: "600" as const,
      cursor: isSubmitting ? "not-allowed" : "pointer",
      transition: "all 0.2s ease-in-out",
      minWidth: "120px",
    },
    statusMessage: {
      padding: "12px 16px",
      borderRadius: "8px",
      marginTop: "16px",
      textAlign: "center" as const,
      fontSize: "14px",
      fontWeight: "500" as const,
    },
    successMessage: {
      backgroundColor: "#dcfce7",
      color: "#166534",
      border: "1px solid #bbf7d0",
    },
    errorMessage: {
      backgroundColor: "#fee2e2",
      color: "#991b1b",
      border: "1px solid #fecaca",
    },
  };

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

  const normalizedIssues = normalizeIssues(analysisResult);
  const flattenedIssues = flattenIssues(normalizedIssues);

  return (
    <div className="w-full">
      <div className="w-full h-screen grid grid-cols-1 md:grid-cols-2">
        <section className="p-6 overflow-auto border-r">
          <h2 className="text-xl font-semibold mb-4">校正対象</h2>
          <div style={formStyles.container}>
            <form
              id="form"
              onSubmit={handleSubmit(onSubmit)}
              style={formStyles.form}
            >
              {fieldConfigs.map((field) => {
                const hasError = errors[field.name];
                const currentValue = field.showCharCount
                  ? watchedFields[field.name === "title" ? 0 : 1] || ""
                  : "";
                return (
                  <div key={field.id} style={formStyles.fieldGroup}>
                    <label htmlFor={field.id} style={formStyles.label}>
                      {field.label}
                      {field.required && (
                        <span style={{ color: "#ef4444", marginLeft: "4px" }}>
                          *
                        </span>
                      )}
                    </label>
                    <textarea
                      id={field.id}
                      {...register(field.name)}
                      rows={field.rows}
                      placeholder={field.placeholder}
                      maxLength={field.maxLength}
                      disabled={isSubmitting}
                      style={{
                        ...formStyles.textarea,
                        ...(hasError ? formStyles.textareaError : {}),
                      }}
                      onFocus={(e) => {
                        if (!hasError) {
                          e.target.style.borderColor = "#3b82f6";
                          e.target.style.boxShadow =
                            "0 0 0 3px rgba(59, 130, 246, 0.1)";
                        }
                      }}
                      onBlur={(e) => {
                        if (!hasError) {
                          e.target.style.borderColor = "#e5e7eb";
                          e.target.style.boxShadow = "none";
                        }
                      }}
                    />
                    {hasError && (
                      <span style={formStyles.error}>{hasError.message}</span>
                    )}
                    {field.showCharCount && field.maxLength && (
                      <div style={formStyles.charCount}>
                        {currentValue.length} / {field.maxLength} 文字
                      </div>
                    )}
                  </div>
                );
              })}

              {submitStatus === "success" && (
                <div
                  style={{
                    ...formStyles.statusMessage,
                    ...formStyles.successMessage,
                  }}
                >
                  ✓ 予稿が正常に送信されました！
                </div>
              )}
              {submitStatus === "error" && (
                <div
                  style={{
                    ...formStyles.statusMessage,
                    ...formStyles.errorMessage,
                  }}
                >
                  ✗ 送信中にエラーが発生しました。もう一度お試しください。
                </div>
              )}
            </form>
          </div>
        </section>
        <aside className="p-6 overflow-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">改善点</h2>
            <button
              form="form"
              type="submit"
              disabled={isSubmitting}
              style={formStyles.submitButton}
              onMouseOver={(e) => {
                if (!isSubmitting) {
                  e.currentTarget.style.backgroundColor = "#2563eb";
                  e.currentTarget.style.transform = "translateY(-1px)";
                }
              }}
              onMouseOut={(e) => {
                if (!isSubmitting) {
                  e.currentTarget.style.backgroundColor = "#3b82f6";
                  e.currentTarget.style.transform = "translateY(0)";
                }
              }}
            >
              {isSubmitting ? "送信中..." : " 校正"}
            </button>
          </div>
          <span className="text-sm opacity-70">
            {flattenedIssues.length} 件
          </span>
          {isSubmitting ? (
            <div className="py-40 px-28">
              <Progress value={progress} />
            </div>
          ) : flattenedIssues.length === 0 ? (
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
    </div>
  );
}
