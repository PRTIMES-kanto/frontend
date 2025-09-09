import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Editor from "./Editor";
import type { ImageIssue, Issue } from "./Editor";
import { formSchema, type FormData } from "@/schema";

const Post = () => {
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
  const [formData, setFormData] = useState<FormData | null>(null);

  const [analysisResult, setAnalysisResult] = useState<Issue | null>(null);
  const [imageAnalysisResult, setImageAnalysisResult] = useState<ImageIssue[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      lead_paragraph: "",
      body: "",
      main_image_url: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    setSubmitStatus("idle");
    try {
      setFormData(data);
      const response = await fetch("http://localhost:8080/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Network response was not ok");

      const result = await response.json();
      console.log("result:", result);

      // 文章分析は body, lead, title を配列に変換して Editor に渡す
      const textIssues: Issue = {
        title: {
          good: result.title.good,
          improvement: result.title.improvement,
          suggestion: result.title.suggestion,
        },
        lead: {
          good: result.lead.good,
          improvement: result.lead.improvement,
          suggestion: result.lead.suggestion,
        },
        body: {
          good: result.body.good,
          improvement: result.body.improvement,
          suggestion: result.body.suggestion,
        },
      };

      // 画像分析は image を配列に変換
      const imageIssues: ImageIssue[] = [result.image];

      setAnalysisResult(textIssues);
      setImageAnalysisResult(imageIssues);
      setSubmitStatus("success");
    } catch (error) {
      setSubmitStatus("error");
      console.error("送信エラー:", error);
    }
  };

  useEffect(() => {
    console.log("文章分析結果:", analysisResult);
    console.log("画像分析結果:", imageAnalysisResult);
  }, [analysisResult, imageAnalysisResult]);

  const fieldConfigs = [
    { id: "title", name: "title" as const, label: "タイトル", placeholder: "記事のタイトルを入力してください", rows: 2, required: true, maxLength: 100, showCharCount: true },
    { id: "body", name: "body" as const, label: "本文", placeholder: "記事の本文を入力してください（10文字以上）", rows: 8, required: true },
    { id: "lead_paragraph", name: "lead_paragraph" as const, label: "リード文", placeholder: "リード文を入力してください（任意、200文字以内）", rows: 4, maxLength: 200, showCharCount: true },
    { id: "main_image_url", name: "main_image_url" as const, label: "メイン画像URL", placeholder: "https://example.com/image.jpg", rows: 1, required: true },
  ];

  const formStyles = {
    container: { maxWidth: "800px", margin: "0 auto", padding: "20px", fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' },
    header: { marginBottom: "30px", textAlign: "center" as const, color: "#333" },
    form: { backgroundColor: "#fff", padding: "30px", borderRadius: "12px", boxShadow: "0 4px 6px rgba(0,0,0,0.1)", border: "1px solid #e1e5e9" },
    fieldGroup: { marginBottom: "24px" },
    label: { display: "block", marginBottom: "8px", fontWeight: 600, color: "#374151", fontSize: "14px" },
    textarea: { width: "100%", padding: "12px 16px", border: "2px solid #e5e7eb", borderRadius: "8px", fontSize: "14px", lineHeight: 1.5, resize: "vertical" as const, transition: "border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out", fontFamily: "inherit", outline: "none" },
    textareaError: { borderColor: "#ef4444" },
    error: { color: "#ef4444", fontSize: "12px", marginTop: "4px", display: "block" },
    charCount: { fontSize: "12px", color: "#6b7280", textAlign: "right" as const, marginTop: "4px" },
    submitButton: { backgroundColor: isSubmitting ? "#9ca3af" : "#3b82f6", color: "white", border: "none", borderRadius: "8px", padding: "12px 32px", fontSize: "16px", fontWeight: 600, cursor: isSubmitting ? "not-allowed" : "pointer", transition: "all 0.2s ease-in-out", minWidth: "120px" },
    statusMessage: { padding: "12px 16px", borderRadius: "8px", marginTop: "16px", textAlign: "center" as const, fontSize: "14px", fontWeight: 500 },
    successMessage: { backgroundColor: "#dcfce7", color: "#166534", border: "1px solid #bbf7d0" },
    errorMessage: { backgroundColor: "#fee2e2", color: "#991b1b", border: "1px solid #fecaca" },
  };

  return (
    <div>
      <div style={formStyles.container}>
        <h1 style={formStyles.header}>予稿フォーム</h1>

        <form onSubmit={handleSubmit(onSubmit)} style={formStyles.form}>
          {fieldConfigs.map((field) => {
            const hasError = errors[field.name];
            const currentValue = field.showCharCount ? (watch(field.name) ?? "") : "";
            return (
              <div key={field.id} style={formStyles.fieldGroup}>
                <label htmlFor={field.id} style={formStyles.label}>
                  {field.label}{field.required && <span style={{ color: "#ef4444", marginLeft: "4px" }}>*</span>}
                </label>

                {field.name === "main_image_url" ? (
                  <input type="url" id={field.id} {...register(field.name)} placeholder={field.placeholder} disabled={isSubmitting} style={{ ...formStyles.textarea, ...(hasError ? formStyles.textareaError : {}) }} />
                ) : (
                  <textarea id={field.id} {...register(field.name)} rows={field.rows} placeholder={field.placeholder} maxLength={field.maxLength} disabled={isSubmitting} style={{ ...formStyles.textarea, ...(hasError ? formStyles.textareaError : {}) }} />
                )}

                {hasError && <span style={formStyles.error}>{hasError.message}</span>}
                {field.showCharCount && field.maxLength && <div style={formStyles.charCount}>{currentValue.length} / {field.maxLength} 文字</div>}
              </div>
            );
          })}

          <button type="submit" disabled={isSubmitting} style={formStyles.submitButton}>
            {isSubmitting ? "送信中..." : "投稿する"}
          </button>

          {submitStatus === "success" && <div style={{ ...formStyles.statusMessage, ...formStyles.successMessage }}>✓ 予稿が正常に送信されました！</div>}
          {submitStatus === "error" && <div style={{ ...formStyles.statusMessage, ...formStyles.errorMessage }}>✗ 送信中にエラーが発生しました。もう一度お試しください。</div>}
        </form>
      </div>

      {/* 文章分析結果 */}
      {analysisResult && (
        <div style={{ marginTop: "40px" }}>
          <Editor text="文章分析結果" issues={analysisResult} />
        </div>
      )}

      {/* 画像分析結果 */}
      {imageAnalysisResult.length > 0 && (
        <div style={{ marginTop: "40px" }}>
          <h2 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "12px" }}>画像分析結果</h2>
          {imageAnalysisResult.map((issue, idx) => (
            <div key={idx} style={{ marginBottom: "24px", padding: "16px", border: "1px solid #e5e7eb", borderRadius: "8px", textAlign: "center"}}>
              {issue.url && <img src={issue.url} alt={`分析画像 ${idx + 1}`} style={{ maxWidth: "50%", borderRadius: "8px", marginBottom: "12px", margin: "0 auto",display: "block", }} />}
              {issue.good && <p><strong>Good:</strong> {issue.good}</p>}
              {issue.improvement && <p><strong>改善点:</strong> {issue.improvement}</p>}
              {issue.suggestion && <p><strong>次へのアクション:</strong> {issue.suggestion}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Post;
