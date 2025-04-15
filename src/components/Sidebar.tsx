
import { useState } from "react";
import { Article } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/sonner";

interface SidebarProps {
  articles: Article[];
  onAddArticle: (url: string) => void;
  onDeleteArticle: (id: string) => void;
}

const Sidebar = ({ articles, onAddArticle, onDeleteArticle }: SidebarProps) => {
  const [newArticleUrl, setNewArticleUrl] = useState("");
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isValidUrl, setIsValidUrl] = useState(true);

  const validateUrl = (url: string): boolean => {
    try {
      // Check if URL is valid
      const parsedUrl = new URL(url);
      return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:';
    } catch (e) {
      return false;
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setNewArticleUrl(url);
    
    // Only validate if there's a value
    if (url.trim()) {
      setIsValidUrl(validateUrl(url));
    } else {
      setIsValidUrl(true); // Reset validation state when empty
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newArticleUrl.trim()) {
      toast.error("Please enter a URL");
      return;
    }
    
    if (!validateUrl(newArticleUrl)) {
      toast.error("Please enter a valid URL (e.g., https://example.com)");
      return;
    }
    
    onAddArticle(newArticleUrl);
    setNewArticleUrl("");
    setIsFormVisible(false);
    setIsValidUrl(true);
  };

  return (
    <div className="w-80 border-r border-gray-200 p-4 flex flex-col h-full bg-white">
      <h2 className="text-xl font-bold mb-4">Articles</h2>
      
      {/* Add New Article Button */}
      {!isFormVisible ? (
        <Button 
          onClick={() => setIsFormVisible(true)} 
          className="mb-4 w-full"
        >
          <span className="mr-2 text-sm">+</span> Add Article
        </Button>
      ) : (
        <form onSubmit={handleSubmit} className="mb-4">
          <div className="flex flex-col gap-2">
            <div>
              <Input
                type="url"
                placeholder="Enter article URL"
                value={newArticleUrl}
                onChange={handleUrlChange}
                required
                className={`flex-1 ${!isValidUrl ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
              />
              {!isValidUrl && (
                <p className="text-red-500 text-xs mt-1">
                  Please enter a valid URL (e.g., https://example.com)
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <Button 
                type="submit" 
                className="flex-1"
                disabled={!isValidUrl}
              >
                Add
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setIsFormVisible(false);
                  setNewArticleUrl("");
                  setIsValidUrl(true);
                }}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </form>
      )}
      
      {/* Article List */}
      <div className="overflow-y-auto flex-1">
        {articles.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            No articles added yet. Add an article to get started.
          </div>
        ) : (
          <ul className="space-y-2">
            {articles.map((article) => (
              <li 
                key={article.id}
                className="p-3 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1 mr-2">
                    <h3 className="font-medium line-clamp-1" title={article.title}>
                      {article.isLoading ? "Loading..." : article.title}
                    </h3>
                    <p className="text-xs text-gray-500 truncate" title={article.url}>
                      {article.url}
                    </p>
                  </div>
                  <div className="flex space-x-1">
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className="h-6 w-6" 
                      onClick={() => window.open(article.url, "_blank")}
                    >
                      <span className="text-sm">↗</span>
                    </Button>
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className="h-6 w-6 text-red-500 hover:text-red-700" 
                      onClick={() => onDeleteArticle(article.id)}
                    >
                      <span className="text-sm">🗑</span>
                    </Button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
