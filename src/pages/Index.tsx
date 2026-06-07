import { useState, useEffect } from "react";
import CanvasWorkspace from "@/components/CanvasWorkspace";
import Sidebar from "@/components/Sidebar";
import Toolbar from "@/components/Toolbar";
import { Article } from "@/types";
import { toast } from "@/components/ui/sonner";
import { StorageManager } from "@/lib/storage";
import { fetchArticleContent } from "@/lib/content-fetcher";

const Index = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [activeTool, setActiveTool] = useState<"move" | "pan" | "highlight" | "note" | "select">("move");
  const [isLoading, setIsLoading] = useState(true);

  // Load articles from localStorage on mount
  useEffect(() => {
    const loadArticles = () => {
      try {
        const saved = StorageManager.load();
        setArticles(saved);
      } catch (error) {
        console.error("Failed to load articles:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadArticles();
  }, []);

  // Save articles to localStorage whenever they change
  useEffect(() => {
    if (!isLoading) {
      StorageManager.save(articles);
    }
  }, [articles, isLoading]);

  const addArticle = async (url: string) => {
    const newArticle: Article = {
      id: `article_${Date.now()}`,
      url,
      title: "Loading...",
      content: "",
      position: {
        x: 100 + Math.random() * 40,
        y: 100 + Math.random() * 40
      },
      size: { width: 500, height: 600 },
      minimized: false,
      isLoading: true,
      highlights: [],
      notes: []
    };

    setArticles(prev => [...prev, newArticle]);

    try {
      const result = await fetchArticleContent(url);

      if (result.error) {
        toast.error(`Failed to load article: ${result.error}`);
      } else {
        toast.success(`Loaded: ${result.title}`);
      }

      setArticles(prev =>
        prev.map(article =>
          article.id === newArticle.id
            ? { 
                ...article, 
                title: result.title, 
                content: result.content, 
                isLoading: false,
                error: result.error
              }
            : article
        )
      );
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Unknown error";
      toast.error(`Error: ${errorMsg}`);

      setArticles(prev =>
        prev.map(article =>
          article.id === newArticle.id
            ? { ...article, title: "Error", isLoading: false, error: errorMsg }
            : article
        )
      );
    }
  };

  const updateArticle = (updatedArticle: Article) => {
    setArticles(prevArticles =>
      prevArticles.map(article =>
        article.id === updatedArticle.id ? updatedArticle : article
      )
    );
  };

  const deleteArticle = (id: string) => {
    setArticles(prevArticles => prevArticles.filter(article => article.id !== id));
    toast.success("Article removed");
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4" />
          <p className="text-gray-700 font-medium">Loading your workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar
        articles={articles}
        onAddArticle={addArticle}
        onDeleteArticle={deleteArticle}
      />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Toolbar activeTool={activeTool} onChangeTool={setActiveTool} />
        <CanvasWorkspace
          articles={articles}
          onUpdateArticle={updateArticle}
          onDeleteArticle={deleteArticle}
          activeTool={activeTool}
        />
      </div>
    </div>
  );
};

export default Index;
