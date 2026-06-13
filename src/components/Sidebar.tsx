
import { useState } from "react";
import { Article } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/sonner";
import { CircleHelp, ExternalLink, Trash2 } from "lucide-react";

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
    <div className="w-full p-4 flex flex-col h-full overflow-hidden bg-white dark:bg-zinc-800">
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight">
            Articles
          </h2>
          <Button size="icon" variant="ghost" asChild title="Data storage information">
            <a href="/data-info">
              <CircleHelp size={18} />
            </a>
          </Button>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Manage your article canvas</p>
      </div>
      
      {/* Add New Article Button */}
      {!isFormVisible ? (
        <Button 
          onClick={() => setIsFormVisible(true)} 
          className="mb-4 w-full bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          <span className="mr-2">+</span> Add Article
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
      <div className="overflow-y-auto overflow-x-hidden flex-1">
        {articles.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400 py-8">
            No articles added yet. Add an article to get started.
          </div>
        ) : (
          <ul className="space-y-2 overflow-x-hidden">
            {articles.map((article) => (
              <li 
                key={article.id}
                className="p-3 border border-gray-200 dark:border-zinc-700 rounded-md hover:bg-gray-50 dark:hover:bg-zinc-700 dark:bg-zinc-900 transition-colors overflow-hidden"
              >
                <div className="flex justify-between items-start gap-2 min-w-0">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium line-clamp-1 dark:text-gray-100" title={article.title}>
                      {article.isLoading ? "Loading..." : article.title}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate" title={article.url}>
                      {article.url}
                    </p>
                  </div>
                  <div className="flex space-x-1 shrink-0">
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className="h-6 w-6 dark:text-gray-400 dark:hover:text-white" 
                      onClick={() => window.open(article.url, "_blank")}
                    >
                      <ExternalLink size={14} />
                    </Button>
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className="h-6 w-6 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300" 
                      onClick={() => onDeleteArticle(article.id)}
                    >
                      <Trash2 size={14} />
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
