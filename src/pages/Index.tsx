
import { useState, useRef, useEffect } from "react";
import CanvasWorkspace from "@/components/CanvasWorkspace";
import Sidebar from "@/components/Sidebar";
import Toolbar from "@/components/Toolbar";
import { Article } from "@/types";
import { toast } from "@/components/ui/sonner";

const Index = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [activeTool, setActiveTool] = useState<"move" | "pan" | "highlight" | "note" | "select">("move");
  
  const addArticle = async (url: string) => {
    const newArticle: Article = {
      id: `article_${Date.now()}`,
      url,
      title: "Loading...",
      content: "",
      position: {
        x: 100 + (articles.length * 40),
        y: 100 + (articles.length * 40)
      },
      size: { width: 400, height: 600 },
      minimized: false,
      isLoading: true
    };
    
    setArticles(prev => [...prev, newArticle]);
    
    try {
      // Use a more reliable CORS proxy with better error handling
      const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(url)}`;
      const response = await fetch(proxyUrl);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch article: ${response.status} ${response.statusText}`);
      }
      
      const html = await response.text();
      
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      
      const title = doc.querySelector('title')?.textContent || url;
      
      // Try multiple selectors for content to improve success rate
      const contentSelectors = [
        'article', 'main', '.article', '.content', '#content', '.post-content',
        '[role="main"]', '.entry-content', '.post-body', '.story'
      ];
      
      let content = '';
      for (const selector of contentSelectors) {
        const element = doc.querySelector(selector);
        if (element && element.innerHTML.trim()) {
          content = element.innerHTML;
          break;
        }
      }
      
      // If no content was found with selectors, use the body
      if (!content.trim()) {
        content = doc.body.innerHTML;
      }
      
      setArticles(prev => prev.map(article => 
        article.id === newArticle.id 
          ? { ...article, title, content, isLoading: false }
          : article
      ));
    } catch (error) {
      console.error('Error fetching article:', error);
      toast.error(`Failed to load article: ${error instanceof Error ? error.message : 'Unknown error'}`);
      
      setArticles(prev => prev.map(article => 
        article.id === newArticle.id 
          ? { ...article, title: "Error loading article", isLoading: false, error: "Failed to load content" }
          : article
      ));
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
  };
  
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
