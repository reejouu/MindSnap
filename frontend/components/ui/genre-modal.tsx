import { Button } from "@/components/ui/button"
import { Lightbulb, Search, Sparkles, BookOpen } from "lucide-react"

interface Genre {
  id: "factual" | "conceptual" | "genz" | "story"
  title: string
  description: string
  icon: any
  color: string
  bgColor: string
  borderColor: string
}

interface GenreModalProps {
  isOpen: boolean
  onClose: () => void
  onGenreSelect: (genre: "factual" | "conceptual" | "genz" | "story") => void
  selectedGenre?: "factual" | "conceptual" | "genz" |"story" | null
}

const genres: Genre[] = [
  {
    id: "factual",
    title: "Factual",
    description: "Focus on concrete facts, dates, names, and specific information",
    icon: Search,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/20"
  },
  {
    id: "conceptual",
    title: "Conceptual", 
    description: "Emphasize understanding of concepts, theories, and relationships",
    icon: Lightbulb,
    color: "text-yellow-500",
    bgColor: "bg-yellow-500/10",
    borderColor: "border-yellow-500/20"
  },
  {
    id: "genz",
    title: "Gen-Z",
    description: "Learn with memes, slang, emojis, and pop culture. Make it funny, relatable, and TikTok-worthy!",
    icon: Sparkles,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/20"
  },
  {
    id: "story",
    title: "Story",
    description: "Learn through engaging narratives and storytelling for better retention",
    icon: BookOpen,
    color: "text-teal-600",
    bgColor: "bg-teal-100",
    borderColor: "border-teal-300"
  }
]

export function GenreModal({ isOpen, onClose, onGenreSelect, selectedGenre }: GenreModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-gradient-to-br from-background via-background to-primary/5 border border-primary/20 rounded-2xl p-6 max-w-md w-full shadow-2xl animate-in zoom-in duration-300">
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
            Choose Learning Style
          </h3>
          <p className="text-text/70">
            Select how you'd like to learn this content
          </p>
        </div>

        <div className="mb-6 space-y-4 max-h-[288px] overflow-y-auto scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
          {genres.map((genre) => {
            const GenreIcon = genre.icon
            return (
              <button
                key={genre.id}
                onClick={() => onGenreSelect(genre.id)}
                className={`w-full p-4 rounded-xl border-2 transition-all duration-300 hover:scale-[1.02] group ${
                  selectedGenre === genre.id
                    ? `${genre.borderColor} ${genre.bgColor} shadow-lg`
                    : "border-primary/20 hover:border-primary/40 bg-gradient-to-r from-background/80 to-primary/5"
                }`}
              >
                <div className="flex items-start space-x-4">
                  <div className={`p-2 rounded-lg ${genre.bgColor} group-hover:scale-110 transition-transform duration-300`}>
                    <GenreIcon className={`w-5 h-5 ${genre.color}`} />
                  </div>
                  <div className="flex-1 text-left">
                    <h4 className="font-bold text-text mb-1 group-hover:text-primary transition-colors duration-300">
                      {genre.title}
                    </h4>
                    <p className="text-sm text-text/60 leading-relaxed">
                      {genre.description}
                    </p>
                  </div>
                </div>
              </button>
            )
          })}
        </div>

        <div className="flex justify-end space-x-3">
          <Button
            variant="ghost"
            onClick={onClose}
            className="text-text/60 hover:text-text hover:bg-primary/10"
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  )
} 