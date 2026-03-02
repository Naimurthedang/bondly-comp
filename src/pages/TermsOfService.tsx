import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import ReactMarkdown from "react-markdown";

const TermsOfService = () => {
  const [content, setContent] = useState("");
  const [version, setVersion] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("tos_versions")
      .select("version, content, published_at")
      .eq("is_current", true)
      .single()
      .then(({ data }) => {
        if (data) {
          setContent(data.content);
          setVersion(data.version);
        }
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-24 max-w-3xl">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            <p className="text-xs text-muted-foreground mb-6">Version {version}</p>
            <article className="prose prose-sm max-w-none dark:prose-invert">
              <ReactMarkdown>{content}</ReactMarkdown>
            </article>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default TermsOfService;
