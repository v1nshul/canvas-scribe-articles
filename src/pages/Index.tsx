
import { useState, useRef, useEffect } from "react";
import CanvasWorkspace from "@/components/CanvasWorkspace";
import Sidebar from "@/components/Sidebar";
import Toolbar from "@/components/Toolbar";
import { Article } from "@/types";
import { sampleArticles } from "@/components/SampleData";

const Index = () => {
  // Initialize with sample articles
  const [articles, setArticles] = useState<Article[]>(() => 
    sampleArticles.map((sampleArticle, index) => ({
      id: `sample_${index}`,
      url: sampleArticle.url,
      title: sampleArticle.title,
      content: sampleArticle.content,
      position: {
        x: 100 + (index * 60),
        y: 100 + (index * 60)
      },
      size: { width: 400, height: 600 },
      minimized: false,
      isLoading: false,
    }))
  );
  
  const [activeTool, setActiveTool] = useState<"move" | "pan" | "highlight" | "note">("move");
  
  const addArticle = async (url: string) => {
    // Create a sample article with demo content for now
    // In a real-world app, we would fetch content from the URL
    const newArticle: Article = {
      id: `article_${Date.now()}`,
      url,
      title: url.includes("wikipedia") ? "Wikipedia Article" : 
             url.includes("medium") ? "Medium Blog Post" : 
             url.includes("news") ? "News Article" : 
             "Web Article",
      content: generateDemoContent(url),
      position: {
        x: 100 + (articles.length * 40), 
        y: 100 + (articles.length * 40)
      },
      size: { width: 400, height: 600 },
      minimized: false,
      isLoading: false,
    };
    
    setArticles([...articles, newArticle]);
  };
  
  // Helper function to generate sample content based on URL patterns
  const generateDemoContent = (url: string): string => {
    if (url.includes("wikipedia")) {
      return `
        <h1>Wikipedia Article</h1>
        <p>This is a sample Wikipedia article content. In a real implementation, we would fetch the actual content from the URL.</p>
        <h2>Introduction</h2>
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, nisl nec ultricies lacinia, nisl nisl aliquet nisl, nec ultricies nisl nisl nec nisl.</p>
        <p>Vivamus euismod, nisl nec ultricies lacinia, nisl nisl aliquet nisl, nec ultricies nisl nisl nec nisl.</p>
        <h2>History</h2>
        <p>Nullam auctor, nisl nec ultricies lacinia, nisl nisl aliquet nisl, nec ultricies nisl nisl nec nisl.</p>
        <p>Vivamus euismod, nisl nec ultricies lacinia, nisl nisl aliquet nisl, nec ultricies nisl nisl nec nisl.</p>
        <h3>Early developments</h3>
        <p>Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.</p>
        <p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.</p>
      `;
    } else if (url.includes("medium")) {
      return `
        <h1>Medium Blog Post</h1>
        <p>This is a sample Medium blog post. In a real implementation, we would fetch the actual content from the URL.</p>
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, nisl nec ultricies lacinia.</p>
        <blockquote>
          <p>This is a highlighted quote from the article that stands out to emphasize an important point that the author is making.</p>
        </blockquote>
        <p>Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.</p>
        <h2>Main Point</h2>
        <p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.</p>
        <h3>Supporting Evidence</h3>
        <p>Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
      `;
    } else if (url.includes("news")) {
      return `
        <h1>News Article</h1>
        <p><strong>BREAKING NEWS</strong> - This is a sample news article. In a real implementation, we would fetch the actual content from the URL.</p>
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, nisl nec ultricies lacinia.</p>
        <h2>The Event</h2>
        <p>Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.</p>
        <h2>Reactions</h2>
        <p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.</p>
        <h3>Public Response</h3>
        <p>Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
      `;
    } else {
      return `
        <h1>Web Article</h1>
        <p>This is a sample web article. In a real implementation, we would fetch the actual content from the URL.</p>
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, nisl nec ultricies lacinia.</p>
        <p>Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.</p>
        <h2>Section 1</h2>
        <p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.</p>
        <h2>Section 2</h2>
        <p>Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
      `;
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
